'use client';

import { useRouter } from 'next/navigation';

const routeSteps = [
    {
        id: 1,
        client: 'Residência Silva - Poda',
        address: 'Rua das Azaleias, 123',
        time: '08:00',
        duration: '1h 30m serviço',
        distance: '0 km',
        type: 'stop'
    },
    {
        id: 2,
        client: 'Condomínio Solar - Adubação',
        address: 'Av. Central, 900 - Bloco B',
        time: '10:45',
        duration: '2h 00m serviço',
        transition: '2.4 km • 12 min de deslocamento',
        type: 'stop'
    },
    {
        id: 3,
        client: 'Parque das Flores - Paisagismo',
        address: 'Praça da Liberdade, S/N',
        time: '13:30',
        duration: '1h 00m serviço',
        transition: '5.1 km • 18 min de deslocamento',
        type: 'stop'
    }
];

export default function RouteOptimization() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display pb-24">
            <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-md">
                <button onClick={() => router.back()} className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center">Otimização de Rota</h2>
                <div className="flex size-10 items-center justify-end">
                    <button onClick={() => alert('Opções de Rota')} className="flex items-center justify-center rounded-full size-10 hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="px-4 py-2">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-primary font-bold">Total do Dia</span>
                            <span className="text-xl font-bold">12.4 km • 4h 30m</span>
                        </div>
                        <div className="bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-bold">
                            EFICIENTE
                        </div>
                    </div>
                </div>

                <div className="flex px-4 py-3">
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/5">
                        <div
                            className="w-full h-full bg-slate-200 dark:bg-slate-800 bg-center bg-no-repeat bg-cover flex items-center justify-center relative"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0YWNeLx25Wkcqv3V4sDNodW-aRgompfixhZpbhA_XxY_EXe3J_0aGXunnPXK_M-Fxr2hgm1bYb-X78JAuj7Sx2dWMtXNhxSpIPw3MzPPltfYpEWdYMkSfK3Tw1J_oPPpgKq4B1SMFKsxshvFSuFUu9UJOgXHzAU7_oAJmbAP_ZB3DYeuZqVH3o0jSst_E3aI3Uv96pnIlA_ifKlNFjjd1X0UuoBIQOX5D3rJjq8T31uTGLPfwiQjPfnT3KXPYYdHwdwPzhE1dzz0j')" }}
                        >
                            <div className="absolute top-1/4 left-1/4 size-6 bg-primary rounded-full border-2 border-background-dark flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-background-dark">1</span>
                            </div>
                            <div className="absolute top-1/2 left-2/3 size-6 bg-primary rounded-full border-2 border-background-dark flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-background-dark">2</span>
                            </div>
                            <div className="absolute bottom-1/4 left-1/2 size-6 bg-primary rounded-full border-2 border-background-dark flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-background-dark">3</span>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-background-dark/80 backdrop-blur-sm p-2 rounded-lg border border-primary/30">
                            <span className="material-symbols-outlined text-primary text-sm">my_location</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                    <h3 className="text-lg font-bold">Cronograma Sugerido</h3>
                    <button onClick={() => alert('Calculando rota otimizada...')} className="text-primary text-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-sm">auto_fix</span>
                        Recalcular
                    </button>
                </div>

                <div className="px-4 pb-10">
                    {routeSteps.map((step, idx) => (
                        <div key={idx}>
                            {step.transition && (
                                <div className="grid grid-cols-[48px_1fr] gap-x-0">
                                    <div className="flex flex-col items-center">
                                        <div className="w-0.5 border-l-2 border-dashed border-primary/40 h-12"></div>
                                    </div>
                                    <div className="flex items-center pl-2 h-12">
                                        <div className="flex items-center gap-2 text-primary/70 text-xs font-medium">
                                            <span className="material-symbols-outlined text-sm">directions_car</span>
                                            <span>{step.transition}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-[48px_1fr] gap-x-0">
                                <div className="flex flex-col items-center">
                                    <div className="z-10 flex size-8 items-center justify-center rounded-full bg-primary text-background-dark font-bold text-sm">
                                        {step.id}
                                    </div>
                                    {idx !== routeSteps.length - 1 && <div className="w-0.5 bg-primary/30 h-full min-h-[4rem]"></div>}
                                </div>
                                <div className="flex flex-1 flex-col pb-6 pl-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-base font-bold">{step.client}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{step.address}</p>
                                        </div>
                                        <span className="text-primary font-bold text-sm">{step.time}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-primary/5 px-2 py-1 rounded">
                                            <span className="material-symbols-outlined text-xs">timer</span> {step.duration}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-4 pb-10">
                    <button onClick={() => window.open('https://maps.google.com', '_blank')} className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                        <span className="material-symbols-outlined">navigation</span>
                        Iniciar Navegação Assistida
                    </button>
                </div>
            </main>
        </div>
    );
}
