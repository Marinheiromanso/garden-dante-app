'use client';

import { useRouter } from 'next/navigation';

const reminders = [
    {
        id: 1,
        plant: 'Rosa do Deserto',
        client: 'Sr. Carlos',
        task: 'Poda recomendada em 5 dias',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE419raRP6JohkW7hn5gAwfehuBmEzM1vH-Wc3lBHlUlC_P0YHozLrGxZu3TK2ezRrQi0DZ_k5GHKl9mjBB6nQvSvTlQzyTK5EDDSuFEciffgEH5UNoQZ-0cpZ5tS_glIYK4w6A1wUqrm-dqhT1yDt2kHxLQfByhMdoZWo1Ojc6lkr1-SoDmqcty5Rh47Cg0sMbrDNZZSNdKwsa-Vn--vJifrJtnsnpvuqHV1ZaLuRNdn0MILLBt3HCeqABHjsU7EoLsfedUcqQLNu'
    },
    {
        id: 2,
        plant: 'Samambaia Americana',
        client: 'Dona Maria',
        task: 'Adubação necessária em 2 dias',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2JhzlyA-dfZgogqKtXJz4XV9BfVzxeJY6D--EhPMu-5MppjMn7EhssediA_Yxh9alS1xQEcMxm82cOHXx3UDeTVJVjt7r_mh5ObwrJkUVJvECDpLdJAlHQDpxl19NZNaTl_TDuI-hEoSLZs6RCwcYDP_85JDMH93-aFBnwDAiZobn1HULLcbySGjorGo7OBACFT-gGg_zcOQtogapEMcJZ7DO3UBYRhub56bzz-TVYVqbd4tX7O-QZkfo6YYjs1ydMCyuKT8Zm9MG'
    },
    {
        id: 3,
        plant: 'Coleção de Suculentas',
        client: 'Ana Júlia',
        task: 'Troca de vaso sugerida (Ciclo 1 ano)',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxBUAySVLnkyLauCAAZAzEEnznUAkr0FfbDO1AF9E5R6lPCjWFDph76dF1IT84QpI7Iuddj0fk2Mm2SK8Kfn_EfwlQ20EQnLzRvdmUepE1HMdEuDLVU-3kDBUqCocSLu9H9lWER6R1jqp52b1jh_3Ki79uQH-5NtNstW1gV2GCXIFOJt4p7c6CPEFb76Y5EwnMllDChsV9RfBKMHRRsph0MyiiqqdjcNCxbwkxtTWLUtNlhbjlLTZiqadwCcAbTH9xEaDf1CsK7vMX'
    },
    {
        id: 4,
        plant: 'Lírio da Paz',
        client: 'Roberto Lima',
        task: 'Limpeza de folhas hoje',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1SJO3lyCJhK7dALQkTC82OsPJybisf7tI3HcJNhm6HTvRdWaS5ZcJ0yrtmvHq4I_IBPpseox7ausJHaYWLzXJt6O1kGLyS9lMVu15U2bbcBMrVkyCFpajpuHbph4nIvOxs7NvYsI-tmTU21qEmzLw7QmzKccEDBG2UlAyiHH4tdRIIJLkeRVYgLBMw38Nxe5Nw-oXQCMxrhFZQQEtkqZQ_bkB0fWUIBqNrzrFbzT8760kkSXteSUP8x47myfrTcF8OiWNtWEQqtxl'
    }
];

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
                <button onClick={() => alert('Pesquisar lembretes')} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">search</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24">
                <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-primary mb-1">Status da Semana</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">8 manutenções sugeridas para os próximos 7 dias.</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Sugestões de Manutenção</h2>
                    <div className="space-y-3">
                        {reminders.map((reminder) => (
                            <div key={reminder.id} className="bg-white dark:bg-slate-900/40 border border-primary/5 rounded-xl p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="size-14 rounded-lg bg-cover bg-center shrink-0 border border-primary/10"
                                        style={{ backgroundImage: `url('${reminder.image}')` }}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-base truncate">{reminder.plant}</p>
                                        <p className="text-xs text-primary font-medium">Cliente: {reminder.client}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{reminder.task}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const text = `Olá ${reminder.client}! O Garden Dante identificou uma sugestão de manutenção para sua planta (${reminder.plant}):\n\n- *${reminder.task}*\n\nGostaria de agendar este serviço?`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="flex-1 bg-primary text-background-dark font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                        Enviar WhatsApp
                                    </button>
                                    <button onClick={() => alert('Opções do lembrete')} className="size-10 flex items-center justify-center border border-primary/20 rounded-lg text-primary hover:bg-primary/5">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
