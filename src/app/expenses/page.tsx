'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type ExpenseCategory = 'combustivel' | 'adubos' | 'ferramentas' | 'outros';

type Expense = {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
};

const categoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
    combustivel: { label: 'Combustível', icon: 'local_gas_station', color: 'text-amber-500 bg-amber-500/10' },
    adubos: { label: 'Adubos', icon: 'compost', color: 'text-lime-500 bg-lime-500/10' },
    ferramentas: { label: 'Ferramentas', icon: 'construction', color: 'text-sky-500 bg-sky-500/10' },
    outros: { label: 'Outros', icon: 'more_horiz', color: 'text-slate-400 bg-slate-400/10' },
};

const STORAGE_KEY = 'gardenDanteExpenses';

const initialExpenses: Expense[] = [
    { id: '1', description: 'Gasolina - visitas da semana', amount: 180.00, category: 'combustivel', date: '2026-03-15' },
    { id: '2', description: 'Adubo NPK 10-10-10 (5kg)', amount: 45.90, category: 'adubos', date: '2026-03-14' },
    { id: '3', description: 'Tesoura de poda profissional', amount: 129.90, category: 'ferramentas', date: '2026-03-12' },
    { id: '4', description: 'Substrato para vasos', amount: 32.50, category: 'adubos', date: '2026-03-10' },
    { id: '5', description: 'Gasolina - segunda feira', amount: 95.00, category: 'combustivel', date: '2026-03-08' },
    { id: '6', description: 'Luvas de proteção (3 pares)', amount: 59.70, category: 'ferramentas', date: '2026-03-05' },
    { id: '7', description: 'Fertilizante foliar', amount: 28.00, category: 'adubos', date: '2026-03-03' },
];

export default function ExpenseManagement() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        if (typeof window === 'undefined') return initialExpenses;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialExpenses));
        } catch { /* ignore */ }
        return initialExpenses;
    });
    const [filter, setFilter] = useState<ExpenseCategory | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState({ description: '', amount: '', category: 'combustivel' as ExpenseCategory, date: '' });
    const [monthlyRevenue, setMonthlyRevenue] = useState(() => {
        if (typeof window === 'undefined') return '5000';
        return localStorage.getItem('gardenDanteMonthlyRevenue') || '5000';
    });

    const saveExpenses = (updated: Expense[]) => {
        setExpenses(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const filtered = filter === 'todos' ? expenses : expenses.filter(e => e.category === filter);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const totalMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = (Object.keys(categoryConfig) as ExpenseCategory[]).map(cat => ({
        ...categoryConfig[cat],
        category: cat,
        total: monthlyExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    }));

    const revenue = parseFloat(monthlyRevenue) || 0;
    const profit = revenue - totalMonth;

    const handleOpenAdd = () => {
        setEditingExpense(null);
        const today = new Date().toISOString().slice(0, 10);
        setFormData({ description: '', amount: '', category: 'combustivel', date: today });
        setShowModal(true);
    };

    const handleOpenEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setFormData({ description: expense.description, amount: String(expense.amount), category: expense.category, date: expense.date });
        setShowModal(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim() || !formData.amount || !formData.date) return;
        const amount = parseFloat(formData.amount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) return;

        if (editingExpense) {
            const updated = expenses.map(ex => ex.id === editingExpense.id ? { ...ex, description: formData.description, amount, category: formData.category, date: formData.date } : ex);
            saveExpenses(updated);
        } else {
            const newExpense: Expense = { id: Date.now().toString(), description: formData.description, amount, category: formData.category, date: formData.date };
            saveExpenses([newExpense, ...expenses]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Excluir esta despesa?')) {
            saveExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handleRevenueChange = (val: string) => {
        setMonthlyRevenue(val);
        localStorage.setItem('gardenDanteMonthlyRevenue', val);
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center pr-1">Gestão de Despesas</h2>
                    <button onClick={handleOpenAdd} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                </header>

                {/* Profit Summary Card */}
                <div className="m-4 rounded-2xl overflow-hidden border border-primary/20 shadow-sm relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80")' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-background-dark/90 via-background-dark/85 to-background-dark/70" />
                    <div className="relative p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-medium opacity-60 uppercase tracking-wider">Lucro Estimado do Mês</p>
                            <p className={cn("text-3xl font-black mt-1", profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {formatCurrency(profit)}
                            </p>
                        </div>
                        <div className={cn("size-14 rounded-full flex items-center justify-center", profit >= 0 ? "bg-emerald-500/20" : "bg-red-500/20")}>
                            <span className={cn("material-symbols-outlined text-3xl", profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {profit >= 0 ? 'trending_up' : 'trending_down'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 rounded-xl p-3">
                            <p className="text-[10px] opacity-50 uppercase">Faturamento</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs opacity-50">R$</span>
                                <input
                                    type="number"
                                    value={monthlyRevenue}
                                    onChange={(e) => handleRevenueChange(e.target.value)}
                                    className="bg-transparent font-bold text-sm w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3">
                            <p className="text-[10px] opacity-50 uppercase">Despesas</p>
                            <p className="font-bold text-sm mt-1 text-red-400">{formatCurrency(totalMonth)}</p>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="px-4 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        {categoryTotals.map(cat => (
                            <button
                                key={cat.category}
                                onClick={() => setFilter(filter === cat.category ? 'todos' : cat.category)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl p-3 border transition-all active:scale-[0.97]",
                                    filter === cat.category
                                        ? "border-primary bg-primary/10"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#152e15]"
                                )}
                            >
                                <div className={cn("size-10 rounded-lg flex items-center justify-center", cat.color)}>
                                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs opacity-60">{cat.label}</p>
                                    <p className="text-sm font-bold">{formatCurrency(cat.total)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Percentage Bar */}
                {revenue > 0 && (
                    <div className="px-4 mb-6">
                        <div className="flex justify-between text-xs opacity-60 mb-1.5">
                            <span>Despesas / Faturamento</span>
                            <span>{Math.min(100, Math.round((totalMonth / revenue) * 100))}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500", totalMonth / revenue > 0.7 ? "bg-red-400" : "bg-primary")}
                                style={{ width: `${Math.min(100, (totalMonth / revenue) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Expense List */}
                <div className="px-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">
                            {filter === 'todos' ? 'Todas as Despesas' : categoryConfig[filter].label}
                        </h3>
                        {filter !== 'todos' && (
                            <button onClick={() => setFilter('todos')} className="text-xs text-primary font-medium">Limpar Filtro</button>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {filtered.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                                <p className="text-sm">Nenhuma despesa encontrada.</p>
                            </div>
                        ) : (
                            filtered.sort((a, b) => b.date.localeCompare(a.date)).map(expense => {
                                const cat = categoryConfig[expense.category];
                                return (
                                    <div key={expense.id} className="flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", cat.color)}>
                                            <span className="material-symbols-outlined">{cat.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{expense.description}</p>
                                            <p className="text-xs opacity-50">{new Date(expense.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <p className="text-sm font-bold text-red-400 shrink-0">-{formatCurrency(expense.amount)}</p>
                                        <div className="flex flex-col gap-0.5 shrink-0">
                                            <button onClick={() => handleOpenEdit(expense)} className="p-1 hover:bg-primary/10 rounded transition-colors">
                                                <span className="material-symbols-outlined text-[16px] opacity-50">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(expense.id)} className="p-1 hover:bg-red-500/10 rounded transition-colors">
                                                <span className="material-symbols-outlined text-[16px] text-red-400/50">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Descrição</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ex: Gasolina para visitas"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Valor (R$)</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
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
                                <label className="text-xs font-medium opacity-60 mb-2 block">Categoria</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(categoryConfig) as ExpenseCategory[]).map(cat => (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl p-3 border text-sm font-medium transition-all",
                                                formData.category === cat
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-slate-200 dark:border-slate-700 opacity-60"
                                            )}
                                        >
                                            <span className="material-symbols-outlined text-lg">{categoryConfig[cat].icon}</span>
                                            {categoryConfig[cat].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
                                {editingExpense ? 'Salvar Alterações' : 'Adicionar Despesa'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
