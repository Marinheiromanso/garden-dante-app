'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type ShapeType = 'retangular' | 'circular' | 'triangular';
type CalcType = 'terra' | 'adubo';

const shapeConfig: Record<ShapeType, { label: string; icon: string }> = {
    retangular: { label: 'Retangular', icon: 'crop_square' },
    circular: { label: 'Circular', icon: 'circle' },
    triangular: { label: 'Triangular', icon: 'change_history' },
};

const aduboDosagem: Record<string, { nome: string; icon: string; gPorM2: number; desc: string }> = {
    npk: { nome: 'NPK 10-10-10', icon: 'spa', gPorM2: 100, desc: '100g por m² — uso geral' },
    organico: { nome: 'Adubo Orgânico', icon: 'compost', gPorM2: 300, desc: '300g por m² — húmus/esterco' },
    fosfato: { nome: 'Superfosfato', icon: 'science', gPorM2: 150, desc: '150g por m² — floração' },
    calcario: { nome: 'Calcário', icon: 'grain', gPorM2: 200, desc: '200g por m² — correção de pH' },
};

type HistoryEntry = {
    id: string;
    date: string;
    shape: ShapeType;
    calcType: CalcType;
    area: number;
    volume?: number;
    result: string;
};

const STORAGE_KEY = 'magicGardenCalcHistory';

export default function CalculatorPage() {
    const router = useRouter();
    const [shape, setShape] = useState<ShapeType>('retangular');
    const [calcType, setCalcType] = useState<CalcType>('terra');
    const [aduboType, setAduboType] = useState('npk');

    // Dimensions
    const [comprimento, setComprimento] = useState('');
    const [largura, setLargura] = useState('');
    const [diametro, setDiametro] = useState('');
    const [base, setBase] = useState('');
    const [altura, setAltura] = useState('');
    const [profundidade, setProfundidade] = useState('');

    // Results
    const [result, setResult] = useState<{ area: number; volume: number; terra: number; sacos20L: number; sacos50L: number; aduboKg?: number; aduboSacos?: number; aduboNome?: string } | null>(null);

    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const [showHistory, setShowHistory] = useState(false);

    const calcArea = (): number => {
        switch (shape) {
            case 'retangular': {
                const c = parseFloat(comprimento.replace(',', '.')) || 0;
                const l = parseFloat(largura.replace(',', '.')) || 0;
                return c * l;
            }
            case 'circular': {
                const r = (parseFloat(diametro.replace(',', '.')) || 0) / 2;
                return Math.PI * r * r;
            }
            case 'triangular': {
                const b = parseFloat(base.replace(',', '.')) || 0;
                const h = parseFloat(altura.replace(',', '.')) || 0;
                return (b * h) / 2;
            }
        }
    };

    const handleCalculate = () => {
        const area = calcArea();
        if (area <= 0) return;

        const prof = parseFloat(profundidade.replace(',', '.')) || 0;

        if (calcType === 'terra') {
            if (prof <= 0) return;
            const volumeM3 = area * (prof / 100); // profundidade em cm → m
            const volumeL = volumeM3 * 1000;
            const terra = volumeL; // litros
            const sacos20L = Math.ceil(volumeL / 20);
            const sacos50L = Math.ceil(volumeL / 50);
            setResult({ area: Math.round(area * 100) / 100, volume: Math.round(volumeL * 10) / 10, terra: Math.round(terra * 10) / 10, sacos20L, sacos50L });

            saveHistory({ area, volume: volumeM3, result: `${Math.round(volumeL)}L de terra (${sacos20L} sacos de 20L)` });
        } else {
            const adubo = aduboDosagem[aduboType];
            const totalG = area * adubo.gPorM2;
            const totalKg = totalG / 1000;
            const sacos1kg = Math.ceil(totalKg);
            setResult({ area: Math.round(area * 100) / 100, volume: 0, terra: 0, sacos20L: 0, sacos50L: 0, aduboKg: Math.round(totalKg * 100) / 100, aduboSacos: sacos1kg, aduboNome: adubo.nome });

            saveHistory({ area, result: `${(Math.round(totalKg * 100) / 100)}kg de ${adubo.nome}` });
        }
    };

    const saveHistory = (entry: { area: number; volume?: number; result: string }) => {
        const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().slice(0, 10),
            shape,
            calcType,
            area: entry.area,
            volume: entry.volume,
            result: entry.result,
        };
        const updated = [newEntry, ...history].slice(0, 20);
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const clearForm = () => {
        setComprimento(''); setLargura(''); setDiametro(''); setBase(''); setAltura(''); setProfundidade('');
        setResult(null);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center">Calculadora de Insumos</h2>
                    <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">{showHistory ? 'calculate' : 'history'}</span>
                    </button>
                </header>

                {!showHistory ? (
                    <>
                        {/* Hero */}
                        <div className="relative h-32 mx-4 mt-4 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80")' }} />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                            <div className="relative z-10 h-full flex flex-col justify-end p-4">
                                <p className="text-white/70 text-xs uppercase tracking-wider">Ferramenta</p>
                                <h3 className="text-white text-xl font-bold">Calcule Terra & Adubo</h3>
                            </div>
                        </div>

                        {/* Calc Type Toggle */}
                        <div className="flex mx-4 mt-4 gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
                            <button onClick={() => { setCalcType('terra'); setResult(null); }} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5", calcType === 'terra' ? "bg-primary text-slate-900 shadow" : "text-slate-500")}>
                                <span className="material-symbols-outlined text-base">landscape</span>
                                Terra / Substrato
                            </button>
                            <button onClick={() => { setCalcType('adubo'); setResult(null); }} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5", calcType === 'adubo' ? "bg-primary text-slate-900 shadow" : "text-slate-500")}>
                                <span className="material-symbols-outlined text-base">compost</span>
                                Adubo
                            </button>
                        </div>

                        {/* Shape Selection */}
                        <div className="px-4 mt-4">
                            <label className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2 block">Formato do Canteiro</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(shapeConfig) as ShapeType[]).map(s => (
                                    <button key={s} onClick={() => { setShape(s); setResult(null); }} className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                                        shape === s ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-700"
                                    )}>
                                        <span className={cn("material-symbols-outlined text-2xl", shape === s ? "text-primary" : "opacity-50")}>{shapeConfig[s].icon}</span>
                                        <span className="text-xs font-bold">{shapeConfig[s].label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="px-4 mt-4 space-y-3">
                            <label className="text-xs font-medium opacity-60 uppercase tracking-wider block">Dimensões (metros)</label>

                            {shape === 'retangular' && (
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs opacity-50 mb-1 block">Comprimento</label>
                                        <input type="text" inputMode="decimal" value={comprimento} onChange={e => setComprimento(e.target.value)} placeholder="0,00 m" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs opacity-50 mb-1 block">Largura</label>
                                        <input type="text" inputMode="decimal" value={largura} onChange={e => setLargura(e.target.value)} placeholder="0,00 m" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>
                            )}
                            {shape === 'circular' && (
                                <div>
                                    <label className="text-xs opacity-50 mb-1 block">Diâmetro</label>
                                    <input type="text" inputMode="decimal" value={diametro} onChange={e => setDiametro(e.target.value)} placeholder="0,00 m" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                </div>
                            )}
                            {shape === 'triangular' && (
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs opacity-50 mb-1 block">Base</label>
                                        <input type="text" inputMode="decimal" value={base} onChange={e => setBase(e.target.value)} placeholder="0,00 m" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs opacity-50 mb-1 block">Altura</label>
                                        <input type="text" inputMode="decimal" value={altura} onChange={e => setAltura(e.target.value)} placeholder="0,00 m" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>
                            )}

                            {calcType === 'terra' && (
                                <div>
                                    <label className="text-xs opacity-50 mb-1 block">Profundidade (cm)</label>
                                    <input type="text" inputMode="decimal" value={profundidade} onChange={e => setProfundidade(e.target.value)} placeholder="Ex: 30 cm" className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                                </div>
                            )}
                        </div>

                        {/* Adubo Type Selection */}
                        {calcType === 'adubo' && (
                            <div className="px-4 mt-4">
                                <label className="text-xs font-medium opacity-60 uppercase tracking-wider mb-2 block">Tipo de Adubo</label>
                                <div className="flex flex-col gap-2">
                                    {Object.entries(aduboDosagem).map(([key, adubo]) => (
                                        <button key={key} onClick={() => { setAduboType(key); setResult(null); }} className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                            aduboType === key ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-700"
                                        )}>
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center", aduboType === key ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-slate-800 opacity-60")}>
                                                <span className="material-symbols-outlined">{adubo.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{adubo.nome}</p>
                                                <p className="text-[10px] opacity-50">{adubo.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calculate Button */}
                        <div className="px-4 mt-6 flex gap-3">
                            <button onClick={clearForm} className="size-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors active:scale-95">
                                <span className="material-symbols-outlined opacity-60">refresh</span>
                            </button>
                            <button onClick={handleCalculate} className="flex-1 bg-primary text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">calculate</span>
                                Calcular
                            </button>
                        </div>

                        {/* Results */}
                        {result && (
                            <div className="mx-4 mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 overflow-hidden">
                                <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <h3 className="font-bold text-primary">Resultado</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                        <span className="text-sm opacity-60">Área</span>
                                        <span className="text-sm font-bold">{result.area} m²</span>
                                    </div>

                                    {calcType === 'terra' ? (
                                        <>
                                            <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                                <span className="text-sm opacity-60">Volume necessário</span>
                                                <span className="text-sm font-bold">{result.volume} litros</span>
                                            </div>
                                            <div className="bg-white dark:bg-background-dark rounded-xl p-4 mt-2">
                                                <p className="text-xs opacity-50 uppercase tracking-wider mb-3">Quantidade de Sacos</p>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 text-center">
                                                        <p className="text-3xl font-black text-primary">{result.sacos20L}</p>
                                                        <p className="text-xs opacity-50 mt-1">Sacos de 20L</p>
                                                    </div>
                                                    <div className="w-px bg-slate-200 dark:bg-slate-700" />
                                                    <div className="flex-1 text-center">
                                                        <p className="text-3xl font-black text-primary">{result.sacos50L}</p>
                                                        <p className="text-xs opacity-50 mt-1">Sacos de 50L</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center py-2 border-b border-primary/10">
                                                <span className="text-sm opacity-60">Adubo</span>
                                                <span className="text-sm font-bold">{result.aduboNome}</span>
                                            </div>
                                            <div className="bg-white dark:bg-background-dark rounded-xl p-4 mt-2">
                                                <p className="text-xs opacity-50 uppercase tracking-wider mb-3">Quantidade Necessária</p>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 text-center">
                                                        <p className="text-3xl font-black text-primary">{result.aduboKg}</p>
                                                        <p className="text-xs opacity-50 mt-1">kg total</p>
                                                    </div>
                                                    <div className="w-px bg-slate-200 dark:bg-slate-700" />
                                                    <div className="flex-1 text-center">
                                                        <p className="text-3xl font-black text-primary">{result.aduboSacos}</p>
                                                        <p className="text-xs opacity-50 mt-1">Sacos de 1kg</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* History View */
                    <div className="px-4 mt-4">
                        <h3 className="font-bold text-lg mb-3">Histórico de Cálculos</h3>
                        {history.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                                <p className="text-sm">Nenhum cálculo realizado ainda.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {history.map(entry => (
                                    <div key={entry.id} className="bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                        <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", entry.calcType === 'terra' ? "bg-amber-500/10 text-amber-500" : "bg-lime-500/10 text-lime-500")}>
                                            <span className="material-symbols-outlined">{entry.calcType === 'terra' ? 'landscape' : 'compost'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{entry.result}</p>
                                            <p className="text-[10px] opacity-50">{new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')} · {shapeConfig[entry.shape].label} · {entry.area.toFixed(2)} m²</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
