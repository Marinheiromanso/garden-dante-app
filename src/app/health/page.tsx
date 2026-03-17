'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    images?: string[];
};

const statusConfig: Record<HealthStatus, { label: string; icon: string; color: string; bg: string }> = {
    'saudável': { label: 'Saudável', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'atenção': { label: 'Atenção', icon: 'warning', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'crítico': { label: 'Crítico', icon: 'error', color: 'text-red-400', bg: 'bg-red-500/10' },
    'tratamento': { label: 'Em Tratamento', icon: 'medical_services', color: 'text-sky-400', bg: 'bg-sky-500/10' },
};

const STORAGE_KEY = 'gardenDanteHealthHistory';

const initialRecords: HealthRecord[] = [
    { id: '1', plantName: 'Orquídea Phalaenopsis', clientName: 'Alice Johnson', date: '2026-03-17', status: 'saudável', notes: 'Floração excelente, 12 flores abertas. Raízes verdes e saudáveis.', treatment: undefined },
    { id: '2', plantName: 'Roseira Trepadeira', clientName: 'Smith Estate', date: '2026-03-15', status: 'tratamento', notes: 'Infestação de pulgões detectada nas folhas novas. Aplicado óleo de neem.', treatment: 'Óleo de neem 1% - aplicação semanal por 3 semanas' },
    { id: '3', plantName: 'Samambaia', clientName: 'Roberto Silva', date: '2026-03-14', status: 'atenção', notes: 'Pontas das folhas secando. Possível falta de umidade no ambiente.', treatment: 'Aumentar borrifação para 2x/dia' },
    { id: '4', plantName: 'Limoeiro', clientName: 'Alice Johnson', date: '2026-03-12', status: 'saudável', notes: 'Novos frutos se formando. Adubação com NPK aplicada com sucesso.', treatment: undefined },
    { id: '5', plantName: 'Costela-de-adão', clientName: 'Smith Estate', date: '2026-03-10', status: 'crítico', notes: 'Folhas amarelando rapidamente, raízes encharcadas. Possível apodrecimento radicular.', treatment: 'Trocar substrato, raízes podres removidas, suspender rega por 5 dias' },
    { id: '6', plantName: 'Roseira Trepadeira', clientName: 'Smith Estate', date: '2026-03-08', status: 'atenção', notes: 'Primeiros sinais de pulgões observados. Planejado tratamento preventivo.', treatment: undefined },
    { id: '7', plantName: 'Costela-de-adão', clientName: 'Smith Estate', date: '2026-03-01', status: 'saudável', notes: 'Nova folha surgindo. Planta bem adaptada ao ambiente. Sem problemas visíveis.', treatment: undefined },
    { id: '8', plantName: 'Ipê-amarelo', clientName: 'Roberto Silva', date: '2026-02-28', status: 'saudável', notes: 'Árvore em dormência de inverno. Poda de formação realizada com sucesso.', treatment: undefined },
];

export default function HealthHistory() {
    const router = useRouter();
    const [records, setRecords] = useState<HealthRecord[]>(() => {
        if (typeof window === 'undefined') return initialRecords;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecords));
        } catch { /* ignore */ }
        return initialRecords;
    });
    const [filterStatus, setFilterStatus] = useState<HealthStatus | 'todos'>('todos');
    const [filterClient, setFilterClient] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        plantName: '', clientName: '', status: 'saudável' as HealthStatus, notes: '', treatment: '', date: ''
    });

    const saveRecords = (updated: HealthRecord[]) => {
        setRecords(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const filtered = records.filter(r => {
        const matchesStatus = filterStatus === 'todos' || r.status === filterStatus;
        const matchesClient = !filterClient || r.clientName.toLowerCase().includes(filterClient.toLowerCase()) || r.plantName.toLowerCase().includes(filterClient.toLowerCase());
        return matchesStatus && matchesClient;
    });

    // Group records by plant+client for timeline view
    const groupedByPlant = filtered.reduce((acc, record) => {
        const key = `${record.plantName}|${record.clientName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record);
        return acc;
    }, {} as Record<string, HealthRecord[]>);

    // Sort each group by date descending
    Object.values(groupedByPlant).forEach(group => group.sort((a, b) => b.date.localeCompare(a.date)));

    const uniqueClients = [...new Set(records.map(r => r.clientName))];

    // Stats
    const stats = {
        total: records.length,
        healthy: records.filter(r => r.status === 'saudável').length,
        attention: records.filter(r => r.status === 'atenção').length,
        critical: records.filter(r => r.status === 'crítico').length,
        treating: records.filter(r => r.status === 'tratamento').length,
    };

    const handleOpenAdd = () => {
        const today = new Date().toISOString().slice(0, 10);
        setFormData({ plantName: '', clientName: '', status: 'saudável', notes: '', treatment: '', date: today });
        setShowAddModal(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.plantName.trim() || !formData.clientName.trim() || !formData.notes.trim()) return;
        const newRecord: HealthRecord = {
            id: Date.now().toString(),
            plantName: formData.plantName,
            clientName: formData.clientName,
            date: formData.date,
            status: formData.status,
            notes: formData.notes,
            treatment: formData.treatment || undefined,
        };
        saveRecords([newRecord, ...records]);
        setShowAddModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Excluir este registro?')) {
            saveRecords(records.filter(r => r.id !== id));
            setSelectedRecord(null);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center pr-1">Histórico de Saúde</h2>
                    <button onClick={handleOpenAdd} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                </header>

                {/* Hero Banner */}
                <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative h-32">
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

                {/* Stats Bar */}
                <div className="flex overflow-x-auto gap-3 px-4 py-4 hide-scrollbar">
                    {(Object.entries(statusConfig) as [HealthStatus, typeof statusConfig[HealthStatus]][]).map(([key, cfg]) => {
                        const count = key === 'saudável' ? stats.healthy : key === 'atenção' ? stats.attention : key === 'crítico' ? stats.critical : stats.treating;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(filterStatus === key ? 'todos' : key)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border shrink-0 transition-all active:scale-[0.97]",
                                    filterStatus === key
                                        ? "border-primary bg-primary/10"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#152e15]"
                                )}
                            >
                                <span className={cn("material-symbols-outlined text-lg", cfg.color)}>{cfg.icon}</span>
                                <div className="text-left">
                                    <p className="text-xs opacity-50">{cfg.label}</p>
                                    <p className="text-sm font-bold">{count}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Search/Filter */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl opacity-40">search</span>
                        <input
                            type="text"
                            placeholder="Buscar planta ou cliente..."
                            value={filterClient}
                            onChange={e => setFilterClient(e.target.value)}
                            className="w-full bg-white dark:bg-[#152e15] rounded-xl pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        />
                    </div>
                </div>

                {/* Timeline View - Grouped by Plant */}
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
                            const cfg = statusConfig[latestStatus];
                            return (
                                <div key={key} className="mb-6">
                                    {/* Plant Header */}
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
                                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", cfg.bg, cfg.color)}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Timeline */}
                                    <div className="ml-5 border-l-2 border-primary/20 pl-5 flex flex-col gap-2">
                                        {groupRecords.map((record) => {
                                            const rcfg = statusConfig[record.status];
                                            return (
                                                <button
                                                    key={record.id}
                                                    onClick={() => setSelectedRecord(record)}
                                                    className="relative bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm text-left transition-all active:scale-[0.98] hover:border-primary/30"
                                                >
                                                    {/* Timeline dot */}
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
                            <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-5 p-3 bg-primary/5 rounded-xl">
                            <div className={cn("size-12 rounded-xl flex items-center justify-center", statusConfig[selectedRecord.status].bg)}>
                                <span className={cn("material-symbols-outlined text-2xl", statusConfig[selectedRecord.status].color)}>{statusConfig[selectedRecord.status].icon}</span>
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
                                <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full", statusConfig[selectedRecord.status].bg, statusConfig[selectedRecord.status].color)}>
                                    <span className="material-symbols-outlined text-[16px]">{statusConfig[selectedRecord.status].icon}</span>
                                    {statusConfig[selectedRecord.status].label}
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

                        <button
                            onClick={() => handleDelete(selectedRecord.id)}
                            className="w-full mt-6 py-3 text-red-400 text-sm font-medium border border-red-400/20 rounded-xl hover:bg-red-500/10 transition-colors"
                        >
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
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nome da Planta</label>
                                <input
                                    type="text"
                                    value={formData.plantName}
                                    onChange={e => setFormData({ ...formData, plantName: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ex: Orquídea Phalaenopsis"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Cliente</label>
                                <input
                                    type="text"
                                    list="client-list"
                                    value={formData.clientName}
                                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Nome do cliente"
                                    required
                                />
                                <datalist id="client-list">
                                    {uniqueClients.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Data</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-2 block">Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(statusConfig) as [HealthStatus, typeof statusConfig[HealthStatus]][]).map(([key, cfg]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            onClick={() => setFormData({ ...formData, status: key })}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl p-3 border text-sm font-medium transition-all",
                                                formData.status === key
                                                    ? "border-primary bg-primary/10"
                                                    : "border-slate-200 dark:border-slate-700 opacity-60"
                                            )}
                                        >
                                            <span className={cn("material-symbols-outlined text-lg", cfg.color)}>{cfg.icon}</span>
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Observações</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                                    placeholder="Descreva o estado da planta..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Tratamento (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.treatment}
                                    onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ex: Óleo de neem 1% - aplicação semanal"
                                />
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
