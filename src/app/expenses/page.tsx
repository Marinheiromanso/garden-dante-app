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

type StockUnit = 'kg' | 'L' | 'un' | 'ml' | 'g' | 'pacote' | 'rolo' | 'par';

type StockItem = {
    id: string;
    name: string;
    category: ExpenseCategory;
    quantity: number;
    unit: StockUnit;
    minQuantity: number;
    lastUpdated: string;
};

type ToolCategory = 'corte' | 'motor' | 'irrigacao' | 'manual' | 'outro';
type MaintenanceStatus = 'ok' | 'proximo' | 'atrasado';

type Tool = {
    id: string;
    name: string;
    category: ToolCategory;
    brand: string;
    purchaseDate: string;
    maintenanceIntervalDays: number;
    lastMaintenance: string;
    notes: string;
};

type MaintenanceLog = {
    id: string;
    toolId: string;
    date: string;
    description: string;
};

type ActiveTab = 'despesas' | 'estoque' | 'ferramentas';

const categoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
    combustivel: { label: 'Combustível', icon: 'local_gas_station', color: 'text-amber-500 bg-amber-500/10' },
    adubos: { label: 'Adubos', icon: 'compost', color: 'text-lime-500 bg-lime-500/10' },
    ferramentas: { label: 'Ferramentas', icon: 'construction', color: 'text-sky-500 bg-sky-500/10' },
    outros: { label: 'Outros', icon: 'more_horiz', color: 'text-slate-400 bg-slate-400/10' },
};

const toolCategoryConfig: Record<ToolCategory, { label: string; icon: string; color: string }> = {
    corte: { label: 'Corte & Poda', icon: 'content_cut', color: 'text-red-400 bg-red-500/10' },
    motor: { label: 'Motorizadas', icon: 'electric_moped', color: 'text-orange-400 bg-orange-500/10' },
    irrigacao: { label: 'Irrigação', icon: 'water_drop', color: 'text-sky-400 bg-sky-500/10' },
    manual: { label: 'Manuais', icon: 'front_hand', color: 'text-lime-400 bg-lime-500/10' },
    outro: { label: 'Outros', icon: 'handyman', color: 'text-slate-400 bg-slate-400/10' },
};

const toolStatusConfig: Record<MaintenanceStatus, { label: string; color: string; icon: string }> = {
    ok: { label: 'Em dia', color: 'text-emerald-400', icon: 'check_circle' },
    proximo: { label: 'Manutenção próxima', color: 'text-yellow-400', icon: 'schedule' },
    atrasado: { label: 'Atrasado!', color: 'text-red-400', icon: 'warning' },
};

function getMaintenanceStatus(tool: Tool): { status: MaintenanceStatus; daysLeft: number; nextDate: string } {
    const last = new Date(tool.lastMaintenance + 'T12:00:00');
    const next = new Date(last.getTime() + tool.maintenanceIntervalDays * 86400000);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffMs = next.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / 86400000);
    const status: MaintenanceStatus = daysLeft < 0 ? 'atrasado' : daysLeft <= 7 ? 'proximo' : 'ok';
    return { status, daysLeft, nextDate: next.toISOString().slice(0, 10) };
}

const STORAGE_KEY = 'magicGardenExpenses';
const STOCK_STORAGE_KEY = 'magicGardenStock';
const TOOLS_KEY = 'magicGardenTools';
const LOGS_KEY = 'magicGardenToolLogs';

const unitLabels: Record<StockUnit, string> = {
    kg: 'kg', L: 'L', un: 'un', ml: 'ml', g: 'g', pacote: 'pct', rolo: 'rolo', par: 'par',
};

const initialStock: StockItem[] = [];

const initialExpenses: Expense[] = [];

const initialTools: Tool[] = [];

const initialLogs: MaintenanceLog[] = [];

function getStoredState<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return fallback;
}

export default function ExpenseManagement() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>(() => getStoredState(STORAGE_KEY, initialExpenses));
    const [activeTab, setActiveTab] = useState<ActiveTab>('despesas');
    const [filter, setFilter] = useState<ExpenseCategory | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState({ description: '', amount: '', category: 'combustivel' as ExpenseCategory, date: '' });

    // Stock state
    const [stock, setStock] = useState<StockItem[]>(() => getStoredState(STOCK_STORAGE_KEY, initialStock));
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingStock, setEditingStock] = useState<StockItem | null>(null);
    const [stockForm, setStockForm] = useState({ name: '', category: 'adubos' as ExpenseCategory, quantity: '', unit: 'un' as StockUnit, minQuantity: '' });
    const [stockFilter, setStockFilter] = useState<'todos' | 'baixo'>('todos');

    const [monthlyRevenue, setMonthlyRevenue] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('magicGardenMonthlyRevenue') || '';
    });

    // Tools state
    const [tools, setTools] = useState<Tool[]>(() => getStoredState(TOOLS_KEY, initialTools));
    const [toolLogs, setToolLogs] = useState<MaintenanceLog[]>(() => getStoredState(LOGS_KEY, initialLogs));
    const [toolFilter, setToolFilter] = useState<'todos' | 'atencao'>('todos');
    const [showToolModal, setShowToolModal] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [toolForm, setToolForm] = useState({ name: '', category: 'corte' as ToolCategory, brand: '', purchaseDate: '', maintenanceIntervalDays: '30', lastMaintenance: '', notes: '' });
    const [showLogModal, setShowLogModal] = useState(false);
    const [logToolId, setLogToolId] = useState('');
    const [logDesc, setLogDesc] = useState('');
    const [expandedTool, setExpandedTool] = useState<string | null>(null);

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
        localStorage.setItem('magicGardenMonthlyRevenue', val);
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Stock handlers
    const saveStock = (updated: StockItem[]) => {
        setStock(updated);
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updated));
    };

    const lowStockItems = stock.filter(s => s.quantity <= s.minQuantity);

    const handleOpenAddStock = () => {
        setEditingStock(null);
        setStockForm({ name: '', category: 'adubos', quantity: '', unit: 'un', minQuantity: '' });
        setShowStockModal(true);
    };

    const handleOpenEditStock = (item: StockItem) => {
        setEditingStock(item);
        setStockForm({ name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, minQuantity: String(item.minQuantity) });
        setShowStockModal(true);
    };

    const handleSaveStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockForm.name.trim() || !stockForm.quantity || !stockForm.minQuantity) return;
        const quantity = parseFloat(stockForm.quantity.replace(',', '.'));
        const minQuantity = parseFloat(stockForm.minQuantity.replace(',', '.'));
        if (isNaN(quantity) || quantity < 0 || isNaN(minQuantity) || minQuantity < 0) return;
        const today = new Date().toISOString().slice(0, 10);

        if (editingStock) {
            const updated = stock.map(s => s.id === editingStock.id ? { ...s, name: stockForm.name, category: stockForm.category, quantity, unit: stockForm.unit, minQuantity, lastUpdated: today } : s);
            saveStock(updated);
        } else {
            const newItem: StockItem = { id: Date.now().toString(), name: stockForm.name, category: stockForm.category, quantity, unit: stockForm.unit, minQuantity, lastUpdated: today };
            saveStock([newItem, ...stock]);
        }
        setShowStockModal(false);
    };

    const handleDeleteStock = (id: string) => {
        if (confirm('Excluir este item do estoque?')) {
            saveStock(stock.filter(s => s.id !== id));
        }
    };

    const handleAdjustQuantity = (id: string, delta: number) => {
        const updated = stock.map(s => {
            if (s.id !== id) return s;
            const newQty = Math.max(0, s.quantity + delta);
            return { ...s, quantity: newQty, lastUpdated: new Date().toISOString().slice(0, 10) };
        });
        saveStock(updated);
    };

    const filteredStock = stockFilter === 'baixo' ? lowStockItems : stock;

    // Tool handlers
    const saveTools = (updated: Tool[]) => {
        setTools(updated);
        localStorage.setItem(TOOLS_KEY, JSON.stringify(updated));
    };
    const saveToolLogs = (updated: MaintenanceLog[]) => {
        setToolLogs(updated);
        localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    };

    const handleOpenAddTool = () => {
        setEditingTool(null);
        const today = new Date().toISOString().slice(0, 10);
        setToolForm({ name: '', category: 'corte', brand: '', purchaseDate: today, maintenanceIntervalDays: '30', lastMaintenance: today, notes: '' });
        setShowToolModal(true);
    };

    const handleOpenEditTool = (tool: Tool) => {
        setEditingTool(tool);
        setToolForm({ name: tool.name, category: tool.category, brand: tool.brand, purchaseDate: tool.purchaseDate, maintenanceIntervalDays: String(tool.maintenanceIntervalDays), lastMaintenance: tool.lastMaintenance, notes: tool.notes });
        setShowToolModal(true);
    };

    const handleSaveTool = (e: React.FormEvent) => {
        e.preventDefault();
        if (!toolForm.name.trim()) return;
        const intervalDays = parseInt(toolForm.maintenanceIntervalDays) || 30;
        if (editingTool) {
            saveTools(tools.map(t => t.id === editingTool.id ? { ...t, ...toolForm, maintenanceIntervalDays: intervalDays } : t));
        } else {
            const newTool: Tool = { id: Date.now().toString(), ...toolForm, maintenanceIntervalDays: intervalDays };
            saveTools([newTool, ...tools]);
        }
        setShowToolModal(false);
    };

    const handleDeleteTool = (id: string) => {
        if (confirm('Excluir esta ferramenta?')) {
            saveTools(tools.filter(t => t.id !== id));
            saveToolLogs(toolLogs.filter(l => l.toolId !== id));
        }
    };

    const handleMarkMaintenance = (toolId: string) => {
        setLogToolId(toolId);
        setLogDesc('');
        setShowLogModal(true);
    };

    const handleSaveLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!logDesc.trim()) return;
        const today = new Date().toISOString().slice(0, 10);
        saveTools(tools.map(t => t.id === logToolId ? { ...t, lastMaintenance: today } : t));
        const newLog: MaintenanceLog = { id: Date.now().toString(), toolId: logToolId, date: today, description: logDesc };
        saveToolLogs([newLog, ...toolLogs]);
        setShowLogModal(false);
    };

    const toolsWithStatus = tools.map(t => ({ ...t, ...getMaintenanceStatus(t) }));
    const attentionTools = toolsWithStatus.filter(t => t.status !== 'ok');
    const filteredTools = toolFilter === 'atencao' ? attentionTools : toolsWithStatus;

    const handleAddByTab = () => {
        if (activeTab === 'despesas') handleOpenAdd();
        else if (activeTab === 'estoque') handleOpenAddStock();
        else handleOpenAddTool();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <div className="flex items-center p-4 pb-2 justify-between">
                        <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold flex-1 text-center pr-1">Gestão</h2>
                        <button onClick={handleAddByTab} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                    </div>
                    {/* Tabs */}
                    <div className="flex px-4 gap-1 pb-2">
                        <button
                            onClick={() => setActiveTab('despesas')}
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
                                activeTab === 'despesas' ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-primary/10"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                            Despesas
                        </button>
                        <button
                            onClick={() => setActiveTab('estoque')}
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 relative",
                                activeTab === 'estoque' ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-primary/10"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Estoque
                            {lowStockItems.length > 0 && activeTab !== 'estoque' && (
                                <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {lowStockItems.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('ferramentas')}
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 relative",
                                activeTab === 'ferramentas' ? "bg-primary text-slate-900" : "text-slate-500 hover:bg-primary/10"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">construction</span>
                            Ferramentas
                            {attentionTools.length > 0 && activeTab !== 'ferramentas' && (
                                <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {attentionTools.length}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {activeTab === 'despesas' && (<>
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
                </>)}

                {/* ===== STOCK TAB ===== */}
                {activeTab === 'estoque' && (<>
                    {/* Low Stock Alert */}
                    {lowStockItems.length > 0 && (
                        <div className="mx-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-red-400 text-xl">warning</span>
                                <p className="text-sm font-bold text-red-400">Estoque Baixo ({lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'itens'})</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {lowStockItems.map(item => (
                                    <span key={item.id} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-lg">
                                        {item.name}: {item.quantity} {unitLabels[item.unit]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Summary */}
                    <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-primary/20 shadow-sm relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80")' }} />
                        <div className="absolute inset-0 bg-gradient-to-br from-background-dark/90 via-background-dark/85 to-background-dark/70" />
                        <div className="relative p-5">
                            <p className="text-xs font-medium opacity-60 uppercase tracking-wider">Resumo do Estoque</p>
                            <div className="flex gap-4 mt-3">
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black text-primary">{stock.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">Itens</p>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                                    <p className={cn("text-2xl font-black", lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400')}>{lowStockItems.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">Baixo Estoque</p>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black text-sky-400">{stock.length - lowStockItems.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">OK</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex px-4 mt-4 gap-2">
                        <button
                            onClick={() => setStockFilter('todos')}
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                stockFilter === 'todos' ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-slate-700 opacity-60"
                            )}
                        >
                            Todos ({stock.length})
                        </button>
                        <button
                            onClick={() => setStockFilter('baixo')}
                            className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1",
                                stockFilter === 'baixo' ? "border-red-400 bg-red-500/10 text-red-400" : "border-slate-200 dark:border-slate-700 opacity-60"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Baixo Estoque ({lowStockItems.length})
                        </button>
                    </div>

                    {/* Stock List */}
                    <div className="px-4 mt-4 flex flex-col gap-2">
                        {filteredStock.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                <p className="text-sm">{stockFilter === 'baixo' ? 'Todos os itens estão com estoque ok!' : 'Nenhum item no estoque.'}</p>
                            </div>
                        ) : (
                            filteredStock.map(item => {
                                const cat = categoryConfig[item.category];
                                const isLow = item.quantity <= item.minQuantity;
                                return (
                                    <div key={item.id} className={cn(
                                        "bg-white dark:bg-[#152e15] rounded-xl p-3 border shadow-sm",
                                        isLow ? "border-red-500/30" : "border-slate-200 dark:border-slate-800"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", cat.color)}>
                                                <span className="material-symbols-outlined">{cat.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold truncate">{item.name}</p>
                                                    {isLow && <span className="material-symbols-outlined text-red-400 text-sm">warning</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] opacity-40">{cat.label}</span>
                                                    <span className="text-[10px] opacity-30">·</span>
                                                    <span className="text-[10px] opacity-40">Min: {item.minQuantity} {unitLabels[item.unit]}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5 shrink-0">
                                                <button onClick={() => handleOpenEditStock(item)} className="p-1 hover:bg-primary/10 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[16px] opacity-50">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteStock(item.id)} className="p-1 hover:bg-red-500/10 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[16px] text-red-400/50">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Quantity Control */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAdjustQuantity(item.id, -1)}
                                                    className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors active:scale-90"
                                                >
                                                    <span className="material-symbols-outlined text-red-400 text-lg">remove</span>
                                                </button>
                                                <div className={cn(
                                                    "min-w-[80px] text-center px-3 py-1.5 rounded-lg font-bold text-lg",
                                                    isLow ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                                                )}>
                                                    {item.quantity} <span className="text-xs font-medium opacity-60">{unitLabels[item.unit]}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAdjustQuantity(item.id, 1)}
                                                    className="size-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-90"
                                                >
                                                    <span className="material-symbols-outlined text-primary text-lg">add</span>
                                                </button>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="flex-1 ml-4">
                                                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-300",
                                                            isLow ? "bg-red-400" : "bg-primary"
                                                        )}
                                                        style={{ width: `${Math.min(100, (item.quantity / Math.max(item.minQuantity * 2, 1)) * 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] opacity-40 mt-0.5 text-right">
                                                    Atualizado: {new Date(item.lastUpdated + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>)}

                {/* ===== FERRAMENTAS TAB ===== */}
                {activeTab === 'ferramentas' && (<>
                    {/* Attention Banner */}
                    {attentionTools.length > 0 && (
                        <div className="mx-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-red-400">notifications_active</span>
                                <p className="text-sm font-bold text-red-400">Manutenção Pendente</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {attentionTools.map(t => (
                                    <span key={t.id} className={cn("text-xs px-2 py-1 rounded-lg", t.status === 'atrasado' ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300")}>
                                        {t.name.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hero Summary */}
                    <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-primary/20 shadow-sm relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80")' }} />
                        <div className="absolute inset-0 bg-gradient-to-br from-background-dark/90 via-background-dark/85 to-background-dark/70" />
                        <div className="relative p-5">
                            <p className="text-xs font-medium opacity-60 uppercase tracking-wider">Ferramentas</p>
                            <div className="flex gap-4 mt-3">
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black text-primary">{tools.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">Cadastradas</p>
                                </div>
                                <div className={cn("flex-1 bg-white/5 rounded-xl p-3 text-center")}>
                                    <p className={cn("text-2xl font-black", attentionTools.length > 0 ? "text-red-400" : "text-emerald-400")}>{attentionTools.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">Atenção</p>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black text-emerald-400">{tools.length - attentionTools.length}</p>
                                    <p className="text-[10px] opacity-50 uppercase mt-0.5">Em dia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex px-4 mt-4 gap-2">
                        <button onClick={() => setToolFilter('todos')} className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all", toolFilter === 'todos' ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-slate-700 opacity-60")}>
                            Todas ({tools.length})
                        </button>
                        <button onClick={() => setToolFilter('atencao')} className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1", toolFilter === 'atencao' ? "border-red-400 bg-red-500/10 text-red-400" : "border-slate-200 dark:border-slate-700 opacity-60")}>
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Atenção ({attentionTools.length})
                        </button>
                    </div>

                    {/* Tools List */}
                    <div className="px-4 mt-4 space-y-2">
                        {filteredTools.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">build</span>
                                <p className="text-sm">Nenhuma ferramenta encontrada.</p>
                            </div>
                        ) : (
                            filteredTools.map(tool => {
                                const tCat = toolCategoryConfig[tool.category];
                                const stConf = toolStatusConfig[tool.status];
                                const isExpanded = expandedTool === tool.id;
                                const tLogs = toolLogs.filter(l => l.toolId === tool.id).sort((a, b) => b.date.localeCompare(a.date));

                                return (
                                    <div key={tool.id} className={cn("bg-white dark:bg-[#152e15] rounded-xl border shadow-sm overflow-hidden", tool.status === 'atrasado' ? "border-red-500/30" : tool.status === 'proximo' ? "border-yellow-500/30" : "border-slate-200 dark:border-slate-800")}>
                                        <button onClick={() => setExpandedTool(isExpanded ? null : tool.id)} className="w-full text-left p-3 flex items-center gap-3">
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", tCat.color)}>
                                                <span className="material-symbols-outlined">{tCat.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{tool.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={cn("material-symbols-outlined text-xs", stConf.color)}>{stConf.icon}</span>
                                                    <span className={cn("text-[10px] font-bold", stConf.color)}>
                                                        {tool.status === 'atrasado' ? `Atrasado ${Math.abs(tool.daysLeft)}d` : tool.status === 'proximo' ? `Em ${tool.daysLeft}d` : `OK (${tool.daysLeft}d)`}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={cn("material-symbols-outlined text-lg opacity-40 transition-transform shrink-0", isExpanded && "rotate-180")}>expand_more</span>
                                        </button>

                                        {isExpanded && (
                                            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div><span className="opacity-40">Marca:</span> <span className="font-bold">{tool.brand || '—'}</span></div>
                                                    <div><span className="opacity-40">Categoria:</span> <span className="font-bold">{tCat.label}</span></div>
                                                    <div><span className="opacity-40">Compra:</span> <span className="font-bold">{new Date(tool.purchaseDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div>
                                                    <div><span className="opacity-40">Intervalo:</span> <span className="font-bold">{tool.maintenanceIntervalDays} dias</span></div>
                                                    <div className="col-span-2"><span className="opacity-40">Próx. manutenção:</span> <span className={cn("font-bold", stConf.color)}>{new Date(tool.nextDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div>
                                                </div>

                                                {tool.notes && (
                                                    <p className="text-xs bg-primary/5 p-2 rounded-lg opacity-70">
                                                        <span className="material-symbols-outlined text-xs text-primary align-middle mr-1">note</span>
                                                        {tool.notes}
                                                    </p>
                                                )}

                                                {tLogs.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold opacity-40 uppercase mb-1">Histórico</p>
                                                        {tLogs.slice(0, 3).map(log => (
                                                            <div key={log.id} className="flex items-center gap-2 text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                                <span className="material-symbols-outlined text-xs text-primary">build</span>
                                                                <span className="opacity-50">{new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                                <span className="truncate">{log.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={() => handleMarkMaintenance(tool.id)} className="flex-1 bg-primary text-slate-900 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform">
                                                        <span className="material-symbols-outlined text-sm">build</span>
                                                        Registrar Manutenção
                                                    </button>
                                                    <button onClick={() => handleOpenEditTool(tool)} className="size-10 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center hover:bg-primary/5">
                                                        <span className="material-symbols-outlined text-sm opacity-50">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteTool(tool.id)} className="size-10 border border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/5">
                                                        <span className="material-symbols-outlined text-sm text-red-400/50">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>)}
            </div>

            {/* Add/Edit Expense Modal */}
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

            {/* Stock Add/Edit Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowStockModal(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">{editingStock ? 'Editar Item' : 'Novo Item de Estoque'}</h3>
                            <button onClick={() => setShowStockModal(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveStock} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nome do Item</label>
                                <input
                                    type="text"
                                    value={stockForm.name}
                                    onChange={e => setStockForm({ ...stockForm, name: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ex: Adubo NPK 10-10-10"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Quantidade</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={stockForm.quantity}
                                        onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })}
                                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="w-28">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Unidade</label>
                                    <select
                                        value={stockForm.unit}
                                        onChange={e => setStockForm({ ...stockForm, unit: e.target.value as StockUnit })}
                                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="un">Unidade</option>
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="L">Litro</option>
                                        <option value="ml">ml</option>
                                        <option value="pacote">Pacote</option>
                                        <option value="rolo">Rolo</option>
                                        <option value="par">Par</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Quantidade Mínima (alerta)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={stockForm.minQuantity}
                                    onChange={e => setStockForm({ ...stockForm, minQuantity: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Quantidade para alerta de estoque baixo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-2 block">Categoria</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(categoryConfig) as ExpenseCategory[]).map(cat => (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setStockForm({ ...stockForm, category: cat })}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl p-3 border text-sm font-medium transition-all",
                                                stockForm.category === cat
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
                                {editingStock ? 'Salvar Alterações' : 'Adicionar ao Estoque'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Tool Modal */}
            {showToolModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowToolModal(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">{editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h3>
                            <button onClick={() => setShowToolModal(false)} className="p-1 hover:bg-primary/10 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSaveTool} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nome da Ferramenta</label>
                                <input type="text" value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Roçadeira Stihl FS 220" required />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Marca</label>
                                    <input type="text" value={toolForm.brand} onChange={e => setToolForm({ ...toolForm, brand: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Stihl" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Intervalo (dias)</label>
                                    <input type="number" value={toolForm.maintenanceIntervalDays} onChange={e => setToolForm({ ...toolForm, maintenanceIntervalDays: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="30" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Data Compra</label>
                                    <input type="date" value={toolForm.purchaseDate} onChange={e => setToolForm({ ...toolForm, purchaseDate: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Últ. Manutenção</label>
                                    <input type="date" value={toolForm.lastMaintenance} onChange={e => setToolForm({ ...toolForm, lastMaintenance: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-2 block">Categoria</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.keys(toolCategoryConfig) as ToolCategory[]).map(cat => (
                                        <button type="button" key={cat} onClick={() => setToolForm({ ...toolForm, category: cat })} className={cn("flex flex-col items-center gap-1 rounded-xl p-2.5 border text-xs font-bold transition-all", toolForm.category === cat ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-slate-700 opacity-60")}>
                                            <span className="material-symbols-outlined text-lg">{toolCategoryConfig[cat].icon}</span>
                                            {toolCategoryConfig[cat].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Observações</label>
                                <textarea value={toolForm.notes} onChange={e => setToolForm({ ...toolForm, notes: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20" placeholder="Ex: Trocar óleo a cada 30h de uso" />
                            </div>
                            <button type="submit" className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
                                {editingTool ? 'Salvar Alterações' : 'Cadastrar Ferramenta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Maintenance Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowLogModal(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Registrar Manutenção</h3>
                            <button onClick={() => setShowLogModal(false)} className="p-1 hover:bg-primary/10 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <p className="text-sm opacity-60 mb-4">
                            {tools.find(t => t.id === logToolId)?.name}
                        </p>
                        <form onSubmit={handleSaveLog} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">O que foi feito?</label>
                                <textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24" placeholder="Ex: Afiação das lâminas e lubrificação" required />
                            </div>
                            <button type="submit" className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors active:scale-[0.98]">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">check</span>
                                Salvar e Atualizar Data
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
