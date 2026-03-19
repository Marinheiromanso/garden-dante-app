'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Leaf, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

type HealthStatus = 'saudável' | 'atenção' | 'crítico' | 'tratamento';

type HealthRecord = {
    id: string;
    plantName: string;
    clientName: string;
    date: string;
    status: HealthStatus;
    notes: string;
    treatment?: string;
};

const healthStatusConfig: Record<HealthStatus, { label: string; icon: string; color: string; bg: string }> = {
    'saudável': { label: 'Saudável', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'atenção': { label: 'Atenção', icon: 'warning', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'crítico': { label: 'Crítico', icon: 'error', color: 'text-red-400', bg: 'bg-red-500/10' },
    'tratamento': { label: 'Em Tratamento', icon: 'medical_services', color: 'text-sky-400', bg: 'bg-sky-500/10' },
};

const HEALTH_KEY = 'magicGardenHealthHistory';

const initialRecords: HealthRecord[] = [];

type ScannerMode = 'escanear' | 'historico';

export default function PlantScanner() {
    const router = useRouter();
    const [mode, setMode] = useState<ScannerMode>('escanear');
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [flash, setFlash] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [result, setResult] = useState<{
        name: string;
        scientificName: string;
        confidence: number;
        description: string;
        care: string[];
        pests: string;
        tips: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Health history state
    const [records, setRecords] = useState<HealthRecord[]>(() => {
        if (typeof window === 'undefined') return initialRecords;
        try {
            const stored = localStorage.getItem(HEALTH_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return initialRecords;
    });
    const [filterStatus, setFilterStatus] = useState<HealthStatus | 'todos'>('todos');
    const [filterClient, setFilterClient] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [healthForm, setHealthForm] = useState({
        plantName: '', clientName: '', status: 'saudável' as HealthStatus, notes: '', treatment: '', date: ''
    });

    const saveRecords = (updated: HealthRecord[]) => {
        setRecords(updated);
        localStorage.setItem(HEALTH_KEY, JSON.stringify(updated));
    };

    const filteredRecords = records.filter(r => {
        const matchesStatus = filterStatus === 'todos' || r.status === filterStatus;
        const matchesClient = !filterClient || r.clientName.toLowerCase().includes(filterClient.toLowerCase()) || r.plantName.toLowerCase().includes(filterClient.toLowerCase());
        return matchesStatus && matchesClient;
    });

    const groupedByPlant = filteredRecords.reduce((acc, record) => {
        const key = `${record.plantName}|${record.clientName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
    }, {} as Record<string, HealthRecord[]>);
    Object.values(groupedByPlant).forEach(group => group.sort((a, b) => b.date.localeCompare(a.date)));

    const uniqueClients = [...new Set(records.map(r => r.clientName))];

    const stats = {
        total: records.length,
        healthy: records.filter(r => r.status === 'saudável').length,
        attention: records.filter(r => r.status === 'atenção').length,
        critical: records.filter(r => r.status === 'crítico').length,
        treating: records.filter(r => r.status === 'tratamento').length,
    };

    const handleOpenAddHealth = () => {
        const today = new Date().toISOString().slice(0, 10);
        setHealthForm({ plantName: '', clientName: '', status: 'saudável', notes: '', treatment: '', date: today });
        setShowAddModal(true);
    };

    const handleSaveHealth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!healthForm.plantName.trim() || !healthForm.clientName.trim() || !healthForm.notes.trim()) return;
        const newRecord: HealthRecord = {
            id: Date.now().toString(),
            plantName: healthForm.plantName,
            clientName: healthForm.clientName,
            date: healthForm.date,
            status: healthForm.status,
            notes: healthForm.notes,
            treatment: healthForm.treatment || undefined,
        };
        saveRecords([newRecord, ...records]);
        setShowAddModal(false);
    };

    const handleDeleteRecord = (id: string) => {
        if (confirm('Excluir este registro?')) {
            saveRecords(records.filter(r => r.id !== id));
            setSelectedRecord(null);
        }
    };

    // Camera functions
    const initializeCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setHasCameraError(true);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (mode === 'escanear' && !image) {
            initializeCamera();
        }
        return () => stopCamera();
    }, [image, mode]);

    const handleCaptureFromCamera = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
                setImage(imageDataUrl);
                stopCamera();
                startScan();
            }
        }
    };

    const handleCaptureFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                stopCamera();
                startScan();
            };
            reader.readAsDataURL(file);
        }
    };

    const startScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setResult({
                name: "Lavanda (Alfazeima)",
                scientificName: "Lavandula angustifolia",
                confidence: 0.95,
                description: "Planta perene aromática nativa do Mediterrâneo. Excelente para bordaduras e atrai polinizadores.",
                care: [
                    "Sol pleno (mínimo 6h diárias)",
                    "Solo arenoso e muito bem drenado",
                    "Rega escassa (deixe a terra secar completamente)"
                ],
                pests: "Pulgões nos brotos novos durante a primavera. Evite excesso de umidade para prevenir apodrecimento das raízes e fungos de folhagem.",
                tips: "Pode drasticamente no final do inverno (antes da brotação) para manter um formato compacto e evitar que a base fique lenhosa e sem folhas."
            });
        }, 3000);
    };

    const handleRetakeOptions = () => {
        setImage(null);
        setResult(null);
        initializeCamera();
    };

    const handleSaveDiagnosis = () => {
        if (!result) return;
        const today = new Date().toISOString().slice(0, 10);
        const newRecord: HealthRecord = {
            id: Date.now().toString(),
            plantName: result.name,
            clientName: 'Scanner AI',
            date: today,
            status: 'saudável',
            notes: `Identificação AI (${Math.round(result.confidence * 100)}%): ${result.description}. Cuidados: ${result.care.join('; ')}`,
            treatment: undefined,
        };
        saveRecords([newRecord, ...records]);
        handleRetakeOptions();
        setMode('historico');
    };

    // ===== Histórico Mode =====
    if (mode === 'historico') {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Header with mode toggle */}
                    <header className="sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                        <div className="flex items-center p-4 pb-2 justify-between">
                            <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h2 className="text-lg font-bold flex-1 text-center pr-1">Diagnóstico</h2>
                            <button onClick={handleOpenAddHealth} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                        </div>
                        <div className="flex px-4 gap-1 pb-2">
                            <button onClick={() => setMode('escanear')} className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1", "text-slate-500 hover:bg-primary/10")}>
                                <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                                Escanear
                            </button>
                            <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-primary text-slate-900 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">history</span>
                                Histórico
                            </button>
                        </div>
                    </header>

                    {/* Hero Banner */}
                    <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative h-28">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80")' }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 to-background-dark/40" />
                        <div className="relative h-full flex items-center p-5">
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider font-medium">Monitoramento</p>
                                <h3 className="text-lg font-black mt-1">Saúde das Plantas</h3>
                                <p className="text-xs opacity-60 mt-1">{stats.total} registros • {stats.treating} em tratamento</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex overflow-x-auto gap-3 px-4 py-4 hide-scrollbar">
                        {(Object.entries(healthStatusConfig) as [HealthStatus, typeof healthStatusConfig[HealthStatus]][]).map(([key, cfg]) => {
                            const count = key === 'saudável' ? stats.healthy : key === 'atenção' ? stats.attention : key === 'crítico' ? stats.critical : stats.treating;
                            return (
                                <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'todos' : key)} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border shrink-0 transition-all active:scale-[0.97]", filterStatus === key ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#152e15]")}>
                                    <span className={cn("material-symbols-outlined text-lg", cfg.color)}>{cfg.icon}</span>
                                    <div className="text-left">
                                        <p className="text-xs opacity-50">{cfg.label}</p>
                                        <p className="text-sm font-bold">{count}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="px-4 mb-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl opacity-40">search</span>
                            <input type="text" placeholder="Buscar planta ou cliente..." value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-full bg-white dark:bg-[#152e15] rounded-xl pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
                        </div>
                    </div>

                    {/* Timeline View */}
                    <div className="px-4">
                        {Object.keys(groupedByPlant).length === 0 ? (
                            <div className="text-center py-16 opacity-50">
                                <span className="material-symbols-outlined text-5xl mb-3">history</span>
                                <p className="text-sm">Nenhum registro encontrado.</p>
                            </div>
                        ) : (
                            Object.entries(groupedByPlant).map(([key, groupRecords]) => {
                                const [plantName, clientName] = key.split('|');
                                const latestStatus = groupRecords[0].status;
                                const cfg = healthStatusConfig[latestStatus];
                                return (
                                    <div key={key} className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                                                <span className={cn("material-symbols-outlined", cfg.color)}>{cfg.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{plantName}</p>
                                                <p className="text-xs opacity-50 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">person</span>
                                                    {clientName}
                                                </p>
                                            </div>
                                            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", cfg.bg, cfg.color)}>{cfg.label}</span>
                                        </div>
                                        <div className="ml-5 border-l-2 border-primary/20 pl-5 flex flex-col gap-2">
                                            {groupRecords.map((record) => {
                                                const rcfg = healthStatusConfig[record.status];
                                                return (
                                                    <button key={record.id} onClick={() => setSelectedRecord(record)} className="relative bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm text-left transition-all active:scale-[0.98] hover:border-primary/30">
                                                        <div className={cn("absolute -left-[29px] top-4 size-3 rounded-full border-2 border-background-light dark:border-background-dark", rcfg.color.replace('text-', 'bg-'))} />
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs opacity-50">{new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                                    <span className={cn("material-symbols-outlined text-[14px]", rcfg.color)}>{rcfg.icon}</span>
                                                                </div>
                                                                <p className="text-sm line-clamp-2">{record.notes}</p>
                                                                {record.treatment && (
                                                                    <p className="text-xs text-sky-400 mt-1 flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[12px]">vaccines</span>
                                                                        {record.treatment}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="material-symbols-outlined text-[16px] opacity-30 shrink-0 mt-1">chevron_right</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Record Detail Modal */}
                {selectedRecord && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedRecord(null)}>
                        <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Detalhes do Registro</h3>
                                <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-primary/10 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <div className="flex items-center gap-3 mb-5 p-3 bg-primary/5 rounded-xl">
                                <div className={cn("size-12 rounded-xl flex items-center justify-center", healthStatusConfig[selectedRecord.status].bg)}>
                                    <span className={cn("material-symbols-outlined text-2xl", healthStatusConfig[selectedRecord.status].color)}>{healthStatusConfig[selectedRecord.status].icon}</span>
                                </div>
                                <div>
                                    <p className="font-bold">{selectedRecord.plantName}</p>
                                    <p className="text-sm opacity-50">{selectedRecord.clientName}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium opacity-50 uppercase mb-1">Data</p>
                                    <p className="text-sm">{new Date(selectedRecord.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium opacity-50 uppercase mb-1">Status</p>
                                    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full", healthStatusConfig[selectedRecord.status].bg, healthStatusConfig[selectedRecord.status].color)}>
                                        <span className="material-symbols-outlined text-[16px]">{healthStatusConfig[selectedRecord.status].icon}</span>
                                        {healthStatusConfig[selectedRecord.status].label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium opacity-50 uppercase mb-1">Observações</p>
                                    <p className="text-sm leading-relaxed">{selectedRecord.notes}</p>
                                </div>
                                {selectedRecord.treatment && (
                                    <div className="bg-sky-500/10 rounded-xl p-4">
                                        <p className="text-xs font-medium text-sky-400 uppercase mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">medical_services</span>
                                            Tratamento Aplicado
                                        </p>
                                        <p className="text-sm">{selectedRecord.treatment}</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleDeleteRecord(selectedRecord.id)} className="w-full mt-6 py-3 text-red-400 text-sm font-medium border border-red-400/20 rounded-xl hover:bg-red-500/10 transition-colors">
                                Excluir Registro
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Record Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Novo Registro</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <form onSubmit={handleSaveHealth} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Nome da Planta</label>
                                    <input type="text" value={healthForm.plantName} onChange={e => setHealthForm({ ...healthForm, plantName: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Orquídea Phalaenopsis" required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Cliente</label>
                                    <input type="text" list="client-list" value={healthForm.clientName} onChange={e => setHealthForm({ ...healthForm, clientName: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nome do cliente" required />
                                    <datalist id="client-list">
                                        {uniqueClients.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Data</label>
                                    <input type="date" value={healthForm.date} onChange={e => setHealthForm({ ...healthForm, date: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-2 block">Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(Object.entries(healthStatusConfig) as [HealthStatus, typeof healthStatusConfig[HealthStatus]][]).map(([key, cfg]) => (
                                            <button type="button" key={key} onClick={() => setHealthForm({ ...healthForm, status: key })} className={cn("flex items-center gap-2 rounded-xl p-3 border text-sm font-medium transition-all", healthForm.status === key ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-700 opacity-60")}>
                                                <span className={cn("material-symbols-outlined text-lg", cfg.color)}>{cfg.icon}</span>
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Observações</label>
                                    <textarea value={healthForm.notes} onChange={e => setHealthForm({ ...healthForm, notes: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none" placeholder="Descreva o estado da planta..." required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Tratamento (opcional)</label>
                                    <input type="text" value={healthForm.treatment} onChange={e => setHealthForm({ ...healthForm, treatment: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Óleo de neem 1% - aplicação semanal" />
                                </div>
                                <button type="submit" className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
                                    Adicionar Registro
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ===== Escanear Mode =====
    return (
        <div className="relative flex h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-black font-display">
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 z-0 bg-black">
                {image ? (
                    <img src={image} alt="Captured plant" className="w-full h-full object-cover" />
                ) : (
                    hasCameraError ? (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 p-8 text-center relative">
                            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=600&q=80")' }} />
                            <div className="absolute inset-0 bg-black/60" />
                            <div className="relative z-10 flex flex-col items-center">
                                <AlertTriangle className="w-12 h-12 mb-4 text-amber-400" />
                                <p className="text-white font-bold text-lg">Câmera Indisponível</p>
                                <p className="text-sm mt-2 text-slate-300">Permita o acesso no navegador ou faça upload da galeria.</p>
                            </div>
                        </div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", flash && "brightness-125")} />
                    )
                )}

                {!result && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full flex items-center justify-center p-8">
                            <div className="w-full aspect-square border-2 border-primary/50 rounded-xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                                {scanning && (
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(19,236,19,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Bar */}
            <div className="relative z-10 flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => { handleRetakeOptions(); router.back(); }} className="flex size-12 shrink-0 items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight flex-1 text-center drop-shadow-md tracking-tight">Scanner de Plantas AI</h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => { stopCamera(); setMode('historico'); }} className="flex h-12 w-12 items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">history</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 relative z-10"></div>

            {/* Bottom Controls */}
            {!result && (
                <div className="relative z-10 pb-8 pt-4 px-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-8">
                        <button onClick={() => fileInputRef.current?.click()} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/10 text-white backdrop-blur-md border border-white/30 overflow-hidden hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-[26px]">photo_library</span>
                        </button>
                        {scanning ? (
                            <div className="flex shrink-0 items-center justify-center rounded-full size-20 border-4 border-primary text-primary shadow-[0_0_15px_rgba(19,236,19,0.5)]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <button onClick={handleCaptureFromCamera} disabled={hasCameraError} className="flex shrink-0 items-center justify-center rounded-full size-20 border-4 border-white text-white shadow-lg relative active:scale-95 transition-transform disabled:opacity-50">
                                <div className="absolute inset-1 rounded-full bg-white opacity-80 backdrop-blur-sm"></div>
                            </button>
                        )}
                        <button onClick={() => setFlash(!flash)} className={cn("flex shrink-0 items-center justify-center rounded-full size-12 backdrop-blur-md border transition-colors", flash ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/30")}>
                            <span className="material-symbols-outlined text-2xl">flash_on</span>
                        </button>
                    </div>
                    {scanning && <p className="text-white font-medium text-sm animate-pulse">Analisando imagem via Inteligência Artificial...</p>}
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCaptureFromFile} />
                </div>
            )}

            {/* Identification Bottom Sheet */}
            {result && (
                <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col justify-end items-stretch animate-in slide-in-from-bottom duration-300">
                    <div className="flex flex-col items-stretch bg-background-light dark:bg-background-dark rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                        <button onClick={() => setResult(null)} className="flex h-6 w-full items-center justify-center pt-2">
                            <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        </button>

                        <div className="relative h-40 mx-4 mt-2 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80")` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                                <div>
                                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Identificação Concluída</p>
                                    <h3 className="text-white text-xl font-bold leading-tight">{result.name}</h3>
                                </div>
                                <div className="bg-primary/90 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    {Math.round(result.confidence * 100)}%
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 px-4 pb-6 pt-4">
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nome</p>
                                    <p className="text-slate-900 dark:text-slate-100 text-base font-semibold text-right">{result.name}</p>
                                </div>
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Época de Poda</p>
                                    <p className="text-slate-900 dark:text-slate-100 text-base font-semibold text-right">Primavera/Verão</p>
                                </div>
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Status</p>
                                    <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-bold text-right flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Saudável
                                    </div>
                                </div>
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="pt-2 text-sm text-slate-700 dark:text-slate-300 border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-bold flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100">
                                        <Leaf className="w-4 h-4 text-primary" />
                                        Cuidados Recomendados
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {result.care.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                                <div className="pt-2 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
                                    <Bug className="w-5 h-5 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">Pragas & Doenças</p>
                                        <p>{result.pests}</p>
                                    </div>
                                </div>
                                <div className="pt-2 text-sm text-primary p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <p className="font-bold shrink-0 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">tips_and_updates</span>
                                        Dica de Especialista
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300">{result.tips}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button onClick={() => handleRetakeOptions()} className="w-14 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold py-3.5 rounded-xl text-center flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-300 dark:hover:bg-slate-700">
                                    <span className="material-symbols-outlined">replay</span>
                                </button>
                                <button onClick={handleSaveDiagnosis} className="flex-1 bg-primary text-slate-900 font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                                    Salvar Diagnóstico
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
