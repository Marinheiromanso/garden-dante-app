'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Scissors, ChevronLeft, ChevronRight, Plus, Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for 'YYYY-MM-DD'
const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const currentMonth = 'Junho 2024';

export default function PruningSchedule() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Default demo tasks
    const defaultTasks = [
        { id: '1', dateString: formatDateString(new Date()), client: 'João Silva', address: 'Rua das Flores, 123', service: 'Poda de Roseiras', time: '09:00', status: 'Pendente', icon: 'local_florist' },
        { id: '2', dateString: formatDateString(new Date()), client: 'Maria Oliveira', address: 'Av. Brasil, 456', service: 'Corte de Grama', time: '11:00', status: 'Pendente', icon: 'grass' },
    ];

    // Task State — load from localStorage
    const [tasks, setTasks] = useState(defaultTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDayOptionsOpen, setIsDayOptionsOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ client: '', address: '', service: '', time: '' });

    useEffect(() => {
        setIsMounted(true);
        setCurrentDate(new Date());
        setSelectedDate(new Date());
        // Load tasks from localStorage
        try {
            const stored = localStorage.getItem('gardenDanteTasks');
            if (stored) {
                setTasks(JSON.parse(stored));
            } else {
                // First time: save defaults
                localStorage.setItem('gardenDanteTasks', JSON.stringify(defaultTasks));
            }
        } catch (e) {
            console.warn('Failed to load tasks from localStorage', e);
        }
    }, []);

    // Persist tasks to localStorage whenever they change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('gardenDanteTasks', JSON.stringify(tasks));
        }
    }, [tasks, isMounted]);

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const monthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const isCurrentMonthView = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
    const today = new Date().getDate();

    const handleOpenModal = (task?: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (task) {
            setEditingTaskId(task.id);
            setFormData({ client: task.client, address: task.address, service: task.service, time: task.time });
        } else {
            setEditingTaskId(null);
            setFormData({ client: '', address: '', service: '', time: '08:00' });
        }
        setIsDayOptionsOpen(false); // Close day options if open
        setIsModalOpen(true);
    };

    const handleSaveTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTaskId) {
            setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, ...formData } : t));
        } else {
            setTasks([...tasks, { id: Date.now().toString(), dateString: formatDateString(selectedDate), ...formData, status: 'Pendente', icon: 'park' }]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteTask = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            setTasks(tasks.filter(t => t.id !== id));
            setIsModalOpen(false);
        }
    };

    const toggleTaskStatus = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Pendente' ? 'Concluído' : 'Pendente' } : t));
    };

    const currentTasks = tasks.filter(t => t.dateString === formatDateString(selectedDate));

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden w-full h-auto">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-[#152e15] z-10">
                <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center mt-2 ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center">Agenda de Podas</h2>
                <button onClick={() => {
                    const tasksData = currentTasks.map(t => ({ id: t.id, client: t.client, address: t.address }));
                    router.push(`/routes?tasks=${encodeURIComponent(JSON.stringify(tasksData))}`);
                }} className="flex size-12 shrink-0 items-center justify-center mt-2 mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-primary">
                    <span className="material-symbols-outlined text-2xl">route</span>
                </button>
            </div>

            <div className="flex flex-col flex-1 pb-20">
                {/* Season Banner */}
                <div className="mx-4 mt-2 rounded-2xl overflow-hidden relative h-28">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1598902108854-d1446c06ca89?w=600&q=80")' }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark/85 to-transparent" />
                    <div className="relative h-full flex items-center p-5">
                        <div>
                            <p className="text-xs opacity-60 uppercase tracking-wider font-medium text-slate-100">
                                {isMounted ? monthName : 'Carregando...'}
                            </p>
                            <h3 className="text-base font-black mt-1 text-slate-100">Organize seus serviços</h3>
                        </div>
                    </div>
                </div>

                {/* Calendar Mini */}
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center p-1 justify-between">
                        <button onClick={handlePrevMonth} className="flex size-10 items-center justify-center text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <p className="text-base font-bold leading-tight flex-1 text-center capitalize">
                            {isMounted ? monthName : ''}
                        </p>
                        <button onClick={handleNextMonth} className="flex size-10 items-center justify-center text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>
                    {isMounted && (
                        <div className="grid grid-cols-7 gap-1">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <p key={`weekday-${d}-${i}`} className="text-[13px] font-bold leading-normal text-center pb-2 text-slate-500 dark:text-slate-400">{d}</p>
                            ))}
                            {/* Empty slots for correct starting day */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateOfCell = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isSelected = formatDateString(dateOfCell) === formatDateString(selectedDate);
                                const isActualToday = formatDateString(dateOfCell) === formatDateString(new Date());
                                return (
                                    <button
                                        key={`day-${day}`}
                                        onClick={() => {
                                            setSelectedDate(dateOfCell);
                                            setIsDayOptionsOpen(true);
                                        }}
                                        className={cn(
                                            "h-10 w-full text-sm flex items-center justify-center rounded-full transition-all relative",
                                            isSelected
                                                ? "text-slate-900 font-bold bg-primary shadow-sm shadow-primary/30 scale-110"
                                                : "font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {day}
                                        {isActualToday && !isSelected && (
                                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                    <h3 className="text-lg font-bold leading-tight">Tarefas do dia {selectedDate.getDate()}</h3>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-bold hover:bg-primary/30 transition-colors">
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>

                <div className="flex flex-col gap-3 px-4">
                    {currentTasks.length === 0 ? (
                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">event_available</span>
                            <p className="font-bold text-slate-700 dark:text-slate-300">Dia livre</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum serviço agendado para hoje.</p>
                        </div>
                    ) : (
                        currentTasks.map((task) => (
                            <details key={task.id} className={cn("group bg-white dark:bg-[#193319] rounded-xl shadow-sm border border-slate-100 dark:border-[#234823] transition-all duration-200", task.status === 'Concluído' && "opacity-60")}>
                                <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center gap-4 p-4 justify-between cursor-pointer outline-none">
                                    <div className="flex items-center gap-4 flex-1" onClick={(e) => handleOpenModal(task, e)}>
                                        <div className="flex items-center justify-center rounded-lg bg-primary/20 dark:bg-[#234823] shrink-0 size-12 text-primary dark:text-slate-100">
                                            <span className="material-symbols-outlined text-2xl">{task.icon}</span>
                                        </div>
                                        <div className="flex flex-col justify-center flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className={cn("text-base font-medium leading-normal line-clamp-1", task.status === 'Concluído' && "line-through text-slate-500 dark:text-slate-400")}>{task.client}</p>
                                            </div>
                                            <p className="text-slate-500 dark:text-[#92c992] text-sm font-normal leading-normal line-clamp-1">{task.time} • {task.service}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        <button onClick={(e) => toggleTaskStatus(task.id, e)} className="flex items-center gap-1 z-10">
                                            {task.status === 'Concluído' ? (
                                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-2xl">check_circle</span>
                                            ) : (
                                                <div className="size-6 rounded-full border-2 border-primary mr-1"></div>
                                            )}
                                        </button>
                                    </div>
                                </summary>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="bg-slate-50 dark:bg-[#2a381c] border border-slate-100 dark:border-[#3d5427] text-slate-700 dark:text-[#d3e5cd] p-3 rounded-lg text-sm flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                            <p>{task.address}</p>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button onClick={(e) => handleOpenModal(task, e)} className="text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20">
                                                Editar Serviço
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))
                    )}
                </div>
            </div>

            {/* Day Options Bottom Sheet */}
            {isDayOptionsOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 pb-8">
                    <div className="bg-background-light dark:bg-[#152e15] border border-primary/20 w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
                            <h2 className="text-xl font-bold">Agenda • {selectedDate.getDate()} de {monthName.split(' ')[0]}</h2>
                            <button onClick={() => setIsDayOptionsOpen(false)} className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <button
                                onClick={(e) => handleOpenModal(undefined, e)}
                                className="w-full bg-primary text-background-dark font-bold text-lg rounded-xl py-4 flex items-center justify-center gap-2 hover:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-6 h-6" />
                                Adicionar Novo Serviço
                            </button>
                            <button
                                onClick={() => setIsDayOptionsOpen(false)}
                                className="w-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-lg rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                <CalendarIcon className="w-6 h-6" />
                                Ver Serviços Agendados ({currentTasks.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editing/Adding Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background-light dark:bg-[#152e15] border border-primary/20 w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-primary/10">
                            <h2 className="text-lg font-bold">{editingTaskId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTask} className="p-4 flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliente</label>
                                <input required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nome do cliente" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Endereço</label>
                                <input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Localização do serviço" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Serviço Prestado</label>
                                <input required value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Poda, Corte de Grama..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Horário</label>
                                <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex flex-col gap-2 mt-4">
                                <button type="submit" className="w-full bg-primary text-background-dark font-bold text-lg rounded-xl py-3.5 hover:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
                                    Salvar Serviço
                                </button>
                                {editingTaskId && (
                                    <button type="button" onClick={(e) => handleDeleteTask(editingTaskId, e)} className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-base rounded-xl py-3 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                        Excluir Serviço
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
