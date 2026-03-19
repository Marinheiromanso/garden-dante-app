'use client';

import { useRouter } from 'next/navigation';

export default function MaintenanceReminders() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">Lembretes</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <span className="material-symbols-outlined text-6xl text-primary/30">notifications_none</span>
                    <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">Nenhum lembrete</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">Os lembretes de manutenção aparecerão aqui conforme você agendar serviços.</p>
                </div>
            </main>
        </div>
    );
}
