'use client';

import { useRouter } from 'next/navigation';

export default function BillingReports() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden w-full h-auto">
            {/* Header */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10">
                <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight">Relatório Mensal</h1>
                <div className="size-10" />
            </header>

            <main className="flex-1 overflow-y-auto pb-32 flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-primary text-4xl">bar_chart</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Nenhum relatório disponível</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Os relatórios financeiros aparecerão aqui conforme você registrar serviços e despesas na seção de Gestão.
                    </p>
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
