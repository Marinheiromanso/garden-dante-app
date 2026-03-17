'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar, ArrowUpRight, ArrowDownRight, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const monthlyStats = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Fev', revenue: 3800 },
    { month: 'Mar', revenue: 5100 },
    { month: 'Abr', revenue: 4700 },
    { month: 'Mai', revenue: 6200 },
    { month: 'Jun', revenue: 2800 }, // Current month partial
];

const recentInvoices = [
    { id: 1, client: 'Alice Johnson', service: 'Poda & Adubação', amount: 350, date: '12 Jun', status: 'paid' },
    { id: 2, client: 'Smith Estate', service: 'Manutenção Mensal', amount: 1200, date: '10 Jun', status: 'pending' },
    { id: 3, client: 'Roberto Silva', service: 'Revitalização', amount: 850, date: '05 Jun', status: 'paid' },
];

export default function BillingReports() {
    const router = useRouter();
    const [selectedMonth, setSelectedMonth] = useState('out2023');

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden w-full h-auto">
            {/* Header */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10">
                <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight">Relatório Mensal</h1>
                <button onClick={() => alert('Compartilhar relatório')} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">share</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-32">
                {/* Hero Banner */}
                <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative h-36">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80")' }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 to-background-dark/50" />
                    <div className="relative h-full flex items-center p-5">
                        <div>
                            <p className="text-xs opacity-60 uppercase tracking-wider font-medium text-slate-100">Resumo Financeiro</p>
                            <p className="text-3xl font-black mt-1 text-slate-100">R$ 4.850</p>
                            <p className="text-xs text-primary font-medium mt-1">+12% em relação ao mês anterior</p>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="px-4 py-6">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Mês de Referência</label>
                    <div className="relative">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none w-full bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                            <option value="out2023">Outubro 2023</option>
                            <option value="set2023">Setembro 2023</option>
                            <option value="ago2023">Agosto 2023</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 px-4 mb-8">
                    <div className="bg-slate-100 dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/10">
                        <span className="material-symbols-outlined text-primary mb-2">potted_plant</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total de Serviços</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">42</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/10">
                        <span className="material-symbols-outlined text-primary mb-2">group</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Clientes Atendidos</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">28</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/10">
                        <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Horas de Trabalho</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">156h</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/10">
                        <span className="material-symbols-outlined text-primary mb-2">payments</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Faturamento Total</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">R$ 4.850</p>
                    </div>
                </div>

                {/* Service List Breakdown */}
                <div className="px-4 mb-8">
                    <h2 className="text-lg font-bold mb-4">Faturamento por Tipo</h2>
                    <div className="space-y-4 bg-slate-100 dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/10">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-600 dark:text-slate-400">Podas</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold">R$ 2.500</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '52%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-600 dark:text-slate-400">Adubação</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold">R$ 1.200</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Services */}
                <div className="px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Serviços Concluídos</h2>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Outubro</span>
                    </div>
                    <div className="space-y-3">
                        {[
                            { title: 'Poda de Roseiras', client: 'Alice Johnson', date: '12 Out', icon: 'content_cut' },
                            { title: 'Adubação e Irrigação', client: 'Marina Silva', date: '10 Out', icon: 'water_drop' },
                            { title: 'Manutenção de Gramado', client: 'Condomínio Solar', date: '08 Out', icon: 'grass' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-primary/5 p-4 rounded-xl border border-slate-100 dark:border-primary/5 shadow-sm">
                                <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm truncate">{item.title}</h3>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary px-2 py-0.5 bg-primary/10 rounded shrink-0 ml-2">Pago</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.client} • {item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* PDF Export FAB */}
            <div className="fixed bottom-24 left-0 right-0 px-4 pointer-events-none z-30">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <button onClick={() => alert('Gerando PDF do Relatório...')} className="w-full bg-primary text-background-dark font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform pointer-events-auto">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                        Gerar Relatório PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
