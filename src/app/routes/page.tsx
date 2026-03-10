'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shuffle, Navigation, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RouteStep = {
    id: number;
    client: string;
    address: string;
    time: string;
    duration: string;
    distance?: string;
    transition?: string;
    type: 'stop';
};

const initialRouteSteps: RouteStep[] = [
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
        client: 'Parque das Flores - Paisagismo',
        address: 'Praça da Liberdade, S/N',
        time: '13:30',
        duration: '1h 00m serviço',
        transition: '5.1 km • 18 min de deslocamento',
        type: 'stop'
    },
    {
        id: 3,
        client: 'Condomínio Solar - Adubação',
        address: 'Av. Central, 900',
        time: '10:45',
        duration: '2h 00m serviço',
        transition: '2.4 km • 12 min de deslocamento',
        type: 'stop'
    }
];

const RouteOptimizerContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [routeSteps, setRouteSteps] = useState<RouteStep[]>(initialRouteSteps);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isOptimized, setIsOptimized] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<string | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation(`${position.coords.latitude},${position.coords.longitude}`);
                },
                (error) => {
                    console.warn('Geolocation blocked or failed. Using first client as origin.', error);
                },
                { timeout: 10000 }
            );
        }
    }, []);

    // Load tasks from URL if present
    useEffect(() => {
        const tasksQuery = searchParams.get('tasks');
        if (tasksQuery) {
            try {
                const parsedTasks = JSON.parse(decodeURIComponent(tasksQuery));
                if (parsedTasks && parsedTasks.length > 0) {
                    setRouteSteps(parsedTasks.map((t: any, idx: number) => ({
                        id: t.id,
                        client: t.client,
                        address: t.address,
                        time: `Agendado`,
                        duration: 'Serviço previsto',
                        transition: idx === 0 ? 'Ponto de Partida' : 'Próxima Parada',
                        type: 'stop'
                    })));
                } else {
                    // URL has tasks param but it's empty — no tasks for this day
                    setRouteSteps([]);
                }
            } catch (e) {
                console.error("Failed to parse tasks from URL", e);
                setRouteSteps(initialRouteSteps);
            }
        }
        // If no ?tasks param at all, keep initialRouteSteps as demo data
    }, [searchParams]);

    const handleOptimizeRoute = () => {
        setIsOptimizing(true);
        // Simulate API call for route optimization
        setTimeout(() => {
            const optimizedSteps: RouteStep[] = [
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
                    address: 'Av. Central, 900',
                    time: '09:45',
                    duration: '2h 00m serviço',
                    transition: '1.2 km • 5 min de deslocamento',
                    type: 'stop'
                },
                {
                    id: 3,
                    client: 'Parque das Flores - Paisagismo',
                    address: 'Praça da Liberdade, S/N',
                    time: '12:00',
                    duration: '1h 00m serviço',
                    transition: '3.0 km • 10 min de deslocamento',
                    type: 'stop'
                }
            ];
            setRouteSteps(optimizedSteps);
            setIsOptimizing(false);
            setIsOptimized(true);
        }, 2000);
    };

    const handleStartNavigation = () => {
        const origin = currentLocation ? currentLocation : encodeURIComponent(routeSteps[0].address);
        const destination = encodeURIComponent(routeSteps[routeSteps.length - 1].address);
        let waypoints = '';

        if (currentLocation) {
            // If we have current location, all steps except the last are waypoints
            waypoints = routeSteps.slice(0, -1).map(step => encodeURIComponent(step.address)).join('|');
        } else {
            // If no location, first step is origin, last is dest, middle are waypoints
            waypoints = routeSteps.slice(1, -1).map(step => encodeURIComponent(step.address)).join('|');
        }

        let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        if (waypoints) {
            mapsUrl += `&waypoints=${waypoints}`;
        }

        window.open(mapsUrl, '_blank');
    };

    const handleNavigateToClient = (destinationAddress: string) => {
        const destParam = encodeURIComponent(destinationAddress);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destParam}`, '_blank');
                },
                (error) => {
                    console.warn('Geolocation failed or blocked, falling back to destination only', error);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destParam}`, '_blank');
                },
                { timeout: 5000 }
            );
        } else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${destParam}`, '_blank');
        }
    };

    // Create Embedded Maps URL for full route
    const getEmbedMapUrl = () => {
        if (routeSteps.length === 0) return '';

        const originStr = currentLocation ? currentLocation : encodeURIComponent(routeSteps[0].address);

        let daddrStr = '';
        const destinationSteps = currentLocation ? routeSteps : routeSteps.slice(1);

        destinationSteps.forEach((step, index) => {
            if (index === 0) {
                daddrStr += encodeURIComponent(step.address);
            } else {
                daddrStr += `+to:${encodeURIComponent(step.address)}`;
            }
        });

        return `https://maps.google.com/maps?saddr=${originStr}&daddr=${daddrStr}&ie=UTF8&output=embed`;
    };

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
                            <span className="text-xl font-bold">{isOptimized ? '4.2 km • 4h 30m' : '7.5 km • 4h 30m'}</span>
                        </div>
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold transition-colors", isOptimized ? "bg-primary text-background-dark" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                            {isOptimized ? 'OTIMIZADA' : 'PADRÃO'}
                        </div>
                    </div>
                </div>

                {routeSteps.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
                        <div className="bg-primary/10 rounded-full p-6 mb-6">
                            <MapPin className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nenhum serviço agendado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            Não há serviços agendados para este dia. Volte à Agenda e cadastre novos serviços para ver a rota aqui.
                        </p>
                        <button onClick={() => router.back()} className="mt-6 bg-primary/20 text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/30 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Voltar à Agenda
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex px-4 py-3">
                            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/5 bg-slate-200 dark:bg-slate-800 pointer-events-auto flex items-center justify-center">
                                {!currentLocation && !isOptimized ? (
                                    <div className="flex flex-col items-center gap-2 text-primary animate-pulse z-10 absolute bg-background-light/80 dark:bg-background-dark/80 p-4 rounded-xl backdrop-blur-sm">
                                        <MapPin className="w-8 h-8" />
                                        <span className="text-sm font-bold w-48 text-center leading-tight">Buscando sua localização...</span>
                                    </div>
                                ) : null}
                                <iframe
                                    src={getEmbedMapUrl()}
                                    className={cn("absolute inset-0 w-full h-full border-0 transition-opacity duration-500", !currentLocation && !isOptimized ? 'opacity-50' : 'opacity-100')}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Interactive Route Map"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 pb-2 pt-4">
                            <h3 className="text-lg font-bold">Cronograma Sugerido</h3>
                            {isOptimizing ? (
                                <div className="text-primary text-sm font-semibold flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Calculando...
                                </div>
                            ) : (
                                <button onClick={handleOptimizeRoute} disabled={isOptimized} className={cn("text-sm font-semibold flex items-center gap-1 transition-all", isOptimized ? "text-slate-400 cursor-not-allowed" : "text-primary active:scale-95")}>
                                    {isOptimized ? <CheckCircle2 className="w-4 h-4" /> : <Shuffle className="w-4 h-4" />}
                                    {isOptimized ? 'Melhor Rota' : 'Simplificar Rota'}
                                </button>
                            )}
                        </div>

                        <div className="px-4 pb-4">
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
                                    <div className="grid grid-cols-[48px_1fr] gap-x-0 relative">
                                        <div className="flex flex-col items-center">
                                            <div className="z-10 flex size-8 items-center justify-center rounded-full bg-primary text-background-dark font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            {idx !== routeSteps.length - 1 && <div className="w-0.5 bg-primary/30 h-full min-h-[4rem]"></div>}
                                        </div>
                                        <div
                                            onClick={() => handleNavigateToClient(step.address)}
                                            className="flex flex-1 flex-col pb-6 pl-2 cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start bg-transparent group-hover:bg-primary/5 rounded-xl transition-colors p-2 -ml-2">
                                                <div>
                                                    <p className="text-base font-bold text-primary flex items-center gap-1">
                                                        {step.client}
                                                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{step.address}</p>
                                                </div>
                                                <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-lg">{step.time}</span>
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
                            <button onClick={handleStartNavigation} disabled={routeSteps.length === 0} className={cn("w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all", routeSteps.length === 0 ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none" : "bg-primary text-background-dark shadow-primary/20 active:scale-[0.98]")}>
                                <Navigation className="w-6 h-6" />
                                Iniciar Navegação
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default function RoutesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <RouteOptimizerContent />
        </Suspense>
    );
}
