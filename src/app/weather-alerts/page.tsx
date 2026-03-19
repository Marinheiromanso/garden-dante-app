'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type AlertLevel = 'verde' | 'amarelo' | 'laranja' | 'vermelho';
type AlertType = 'geada' | 'chuva_forte' | 'calor_extremo' | 'vento_forte' | 'tempestade' | 'seca';

type WeatherAlert = {
    id: string;
    type: AlertType;
    level: AlertLevel;
    title: string;
    description: string;
    tip: string;
    active: boolean;
};

type DayForecast = {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    precip: number;
    weatherCode: number;
    windMax: number;
    icon: string;
    desc: string;
};

const alertTypeConfig: Record<AlertType, { icon: string; color: string; label: string }> = {
    geada: { icon: 'ac_unit', color: 'text-blue-400 bg-blue-500/10', label: 'Geada' },
    chuva_forte: { icon: 'thunderstorm', color: 'text-sky-400 bg-sky-500/10', label: 'Chuva Forte' },
    calor_extremo: { icon: 'local_fire_department', color: 'text-orange-400 bg-orange-500/10', label: 'Calor Extremo' },
    vento_forte: { icon: 'air', color: 'text-teal-400 bg-teal-500/10', label: 'Vento Forte' },
    tempestade: { icon: 'flash_on', color: 'text-purple-400 bg-purple-500/10', label: 'Tempestade' },
    seca: { icon: 'wb_sunny', color: 'text-amber-400 bg-amber-500/10', label: 'Seca Prolongada' },
};

const levelConfig: Record<AlertLevel, { label: string; color: string; bg: string }> = {
    verde: { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    amarelo: { label: 'Atenção', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    laranja: { label: 'Alerta', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    vermelho: { label: 'Perigo', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeatherIcon(code: number): string {
    if (code === 0) return 'light_mode';
    if (code <= 3) return code === 3 ? 'cloud' : 'partly_cloudy_day';
    if (code === 45 || code === 48) return 'foggy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'ac_unit';
    if (code >= 80 && code <= 82) return 'rainy';
    if (code >= 95) return 'thunderstorm';
    return 'cloud';
}

function getWeatherDesc(code: number): string {
    if (code === 0) return 'Limpo';
    if (code <= 2) return 'Parc. Nublado';
    if (code === 3) return 'Nublado';
    if (code === 45 || code === 48) return 'Nevoeiro';
    if (code >= 51 && code <= 55) return 'Garoa';
    if (code >= 56 && code <= 67) return 'Chuva';
    if (code >= 71 && code <= 77) return 'Neve';
    if (code >= 80 && code <= 82) return 'Pancadas';
    if (code >= 95) return 'Tempestade';
    return 'Nublado';
}

function generateAlerts(forecast: DayForecast[]): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const next3Days = forecast.slice(0, 3);

    // Check frost
    const minTemp = Math.min(...next3Days.map(d => d.tempMin));
    if (minTemp <= 3) {
        alerts.push({
            id: 'frost', type: 'geada', level: minTemp <= 0 ? 'vermelho' : 'laranja', active: true,
            title: `Geada prevista (${minTemp}°C)`,
            description: `Temperatura mínima de ${minTemp}°C nos próximos dias. Risco de dano às plantas sensíveis ao frio.`,
            tip: 'Cubra plantas sensíveis com TNT ou plástico bolha. Regue ao entardecer para a água proteger as raízes. Traga vasos para local protegido.',
        });
    }

    // Check heavy rain
    const maxPrecip = Math.max(...next3Days.map(d => d.precip));
    if (maxPrecip > 30) {
        alerts.push({
            id: 'rain', type: 'chuva_forte', level: maxPrecip > 80 ? 'vermelho' : maxPrecip > 50 ? 'laranja' : 'amarelo', active: true,
            title: `Chuva forte prevista (${Math.round(maxPrecip)}mm)`,
            description: `Precipitação de até ${Math.round(maxPrecip)}mm esperada. Possível encharcamento do solo e erosão.`,
            tip: 'Verifique a drenagem dos canteiros. Eleve vasos do chão. Proteja mudas recém-plantadas com cobertura. Suspenda adubação foliar.',
        });
    }

    // Check extreme heat
    const maxTemp = Math.max(...next3Days.map(d => d.tempMax));
    if (maxTemp >= 35) {
        alerts.push({
            id: 'heat', type: 'calor_extremo', level: maxTemp >= 40 ? 'vermelho' : maxTemp >= 38 ? 'laranja' : 'amarelo', active: true,
            title: `Calor extremo (${maxTemp}°C)`,
            description: `Temperatura máxima de ${maxTemp}°C prevista. Estresse térmico em plantas sensíveis.`,
            tip: 'Regue pela manhã cedo ou ao entardecer. Use sombrite 50% em plantas de meia-sombra. Aplique cobertura morta (mulch) para reter umidade no solo.',
        });
    }

    // Check strong wind
    const maxWind = Math.max(...next3Days.map(d => d.windMax));
    if (maxWind > 50) {
        alerts.push({
            id: 'wind', type: 'vento_forte', level: maxWind > 80 ? 'vermelho' : 'laranja', active: true,
            title: `Vento forte (${Math.round(maxWind)} km/h)`,
            description: `Rajadas de vento de até ${Math.round(maxWind)} km/h. Risco de queda de galhos e dano a estufas.`,
            tip: 'Amarre plantas altas a tutores. Reforce estufas e sombrites. Pode preventivamente galhos secos. Proteja vasos altos contra tombamento.',
        });
    }

    // Check storms
    const hasStorm = next3Days.some(d => d.weatherCode >= 95);
    if (hasStorm) {
        alerts.push({
            id: 'storm', type: 'tempestade', level: 'laranja', active: true,
            title: 'Tempestade prevista',
            description: 'Possibilidade de tempestade com raios e vendaval nos próximos dias.',
            tip: 'Não trabalhe ao ar livre durante tempestades. Desconecte sistemas de irrigação elétricos. Recolha ferramentas e equipamentos do jardim.',
        });
    }

    // Check drought (no rain in 7 days)
    const totalPrecip7d = forecast.reduce((sum, d) => sum + d.precip, 0);
    if (totalPrecip7d < 5) {
        alerts.push({
            id: 'drought', type: 'seca', level: totalPrecip7d < 1 ? 'laranja' : 'amarelo', active: true,
            title: 'Período seco prolongado',
            description: `Apenas ${Math.round(totalPrecip7d)}mm de chuva previstos para os próximos 7 dias.`,
            tip: 'Aumente a frequência de irrigação. Priorize plantas recém-transplantadas. Aplique cobertura morta para conservar umidade. Evite podar neste período.',
        });
    }

    return alerts;
}

export default function WeatherAlertsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [city, setCity] = useState('Localizando...');
    const [currentTemp, setCurrentTemp] = useState(0);
    const [currentIcon, setCurrentIcon] = useState('sync');
    const [currentDesc, setCurrentDesc] = useState('');
    const [forecast, setForecast] = useState<DayForecast[]>([]);
    const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

    const fetchWeather = useCallback(async (lat: number, lon: number) => {
        try {
            const [weatherRes, geoRes] = await Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&timezone=auto`),
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`)
            ]);
            const weatherJson = await weatherRes.json();
            const geoJson = await geoRes.json();

            const cityName = `${geoJson.city || geoJson.locality || 'Desconhecido'}, ${geoJson.principalSubdivisionCode?.split('-').pop() || ''}`.replace(/, $/, '');
            setCity(cityName);

            const current = weatherJson.current_weather;
            setCurrentTemp(Math.round(current.temperature));
            setCurrentIcon(getWeatherIcon(current.weathercode));
            setCurrentDesc(getWeatherDesc(current.weathercode));

            const daily = weatherJson.daily;
            const days: DayForecast[] = daily.time.map((date: string, i: number) => {
                const d = new Date(date + 'T12:00:00');
                return {
                    date,
                    dayName: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dayNames[d.getDay()],
                    tempMax: Math.round(daily.temperature_2m_max[i]),
                    tempMin: Math.round(daily.temperature_2m_min[i]),
                    precip: daily.precipitation_sum[i],
                    weatherCode: daily.weathercode[i],
                    windMax: daily.windspeed_10m_max[i],
                    icon: getWeatherIcon(daily.weathercode[i]),
                    desc: getWeatherDesc(daily.weathercode[i]),
                };
            });

            setForecast(days);
            setAlerts(generateAlerts(days));
            setLoading(false);
        } catch {
            setError(true);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async (lat: number, lon: number) => {
            if (cancelled) return;
            await fetchWeather(lat, lon);
        };
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => { load(pos.coords.latitude, pos.coords.longitude); },
                () => { load(-23.55, -46.63); },
                { timeout: 10000 }
            );
        } else {
            load(-23.55, -46.63);
        }
        return () => { cancelled = true; };
    }, [fetchWeather]);

    const activeAlerts = alerts.filter(a => a.active);
    const overallLevel: AlertLevel = activeAlerts.some(a => a.level === 'vermelho') ? 'vermelho'
        : activeAlerts.some(a => a.level === 'laranja') ? 'laranja'
        : activeAlerts.some(a => a.level === 'amarelo') ? 'amarelo'
        : 'verde';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center">Clima & Alertas</h2>
                    <div className="size-12" />
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                        <p className="text-sm opacity-50">Carregando previsão...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-400">cloud_off</span>
                        <p className="text-sm opacity-50">Erro ao carregar dados climáticos.</p>
                        <button onClick={() => window.location.reload()} className="text-primary text-sm font-bold">Tentar novamente</button>
                    </div>
                ) : (
                    <>
                        {/* Current Weather Hero */}
                        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80")' }} />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80" />
                            <div className="relative z-10 p-5">
                                <div className="flex items-center gap-1 text-white/60 text-xs mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {city}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-6xl font-black text-white">{currentTemp}°</p>
                                        <p className="text-white/70 text-sm mt-1">{currentDesc}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-6xl text-white/80">{currentIcon}</span>
                                </div>
                                {/* Overall status */}
                                <div className={cn("mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border", levelConfig[overallLevel].bg)}>
                                    <span className={cn("material-symbols-outlined text-lg", levelConfig[overallLevel].color)}>
                                        {overallLevel === 'verde' ? 'check_circle' : overallLevel === 'amarelo' ? 'info' : 'warning'}
                                    </span>
                                    <span className={cn("text-sm font-bold", levelConfig[overallLevel].color)}>
                                        {activeAlerts.length === 0 ? 'Sem alertas — clima favorável para o jardim' : `${activeAlerts.length} alerta${activeAlerts.length > 1 ? 's' : ''} ativo${activeAlerts.length > 1 ? 's' : ''}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div className="mt-6 px-4">
                            <h3 className="font-bold text-lg mb-3">Previsão 7 Dias</h3>
                            <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                                {forecast.map((day, i) => (
                                    <div key={day.date} className={cn(
                                        "flex-none w-20 flex flex-col items-center gap-1.5 p-3 rounded-xl border",
                                        i === 0 ? "border-primary bg-primary/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#152e15]"
                                    )}>
                                        <p className={cn("text-xs font-bold", i === 0 && "text-primary")}>{day.dayName}</p>
                                        <span className="material-symbols-outlined text-2xl">{day.icon}</span>
                                        <div className="flex gap-1 text-xs">
                                            <span className="font-bold">{day.tempMax}°</span>
                                            <span className="opacity-40">{day.tempMin}°</span>
                                        </div>
                                        {day.precip > 0 && (
                                            <div className="flex items-center gap-0.5 text-sky-400">
                                                <span className="material-symbols-outlined text-xs">water_drop</span>
                                                <span className="text-[10px] font-bold">{Math.round(day.precip)}mm</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="mt-6 px-4">
                            <h3 className="font-bold text-lg mb-3">
                                {activeAlerts.length > 0 ? 'Alertas Ativos' : 'Status do Jardim'}
                            </h3>

                            {activeAlerts.length === 0 ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
                                    <span className="material-symbols-outlined text-4xl text-emerald-400 mb-2">psychiatry</span>
                                    <p className="font-bold text-emerald-400">Tudo Tranquilo!</p>
                                    <p className="text-sm opacity-50 mt-1">Nenhum alerta climático para os próximos dias. Clima ideal para trabalhar no jardim.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeAlerts.map(alert => {
                                        const typeConf = alertTypeConfig[alert.type];
                                        const lvlConf = levelConfig[alert.level];
                                        const isExpanded = expandedAlert === alert.id;
                                        return (
                                            <button key={alert.id} onClick={() => setExpandedAlert(isExpanded ? null : alert.id)} className={cn("w-full text-left rounded-xl border p-4 transition-all", lvlConf.bg)}>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", typeConf.color)}>
                                                        <span className="material-symbols-outlined">{typeConf.icon}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", lvlConf.color, lvlConf.bg)}>{lvlConf.label}</span>
                                                            <span className="text-[10px] opacity-40">{typeConf.label}</span>
                                                        </div>
                                                        <p className="text-sm font-bold mt-1">{alert.title}</p>
                                                    </div>
                                                    <span className={cn("material-symbols-outlined text-lg opacity-40 transition-transform", isExpanded && "rotate-180")}>expand_more</span>
                                                </div>
                                                {isExpanded && (
                                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                                                        <p className="text-sm opacity-70">{alert.description}</p>
                                                        <div className="bg-primary/10 rounded-lg p-3 flex items-start gap-2">
                                                            <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">tips_and_updates</span>
                                                            <div>
                                                                <p className="text-xs font-bold text-primary mb-1">Dica de Proteção</p>
                                                                <p className="text-sm opacity-80">{alert.tip}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Protection Tips */}
                        <div className="mt-6 px-4 mb-4">
                            <h3 className="font-bold text-lg mb-3">Dicas Preventivas</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: 'water_drop', title: 'Irrigação', desc: 'Regue de manhã cedo para reduzir evaporação' },
                                    { icon: 'grass', title: 'Cobertura', desc: 'Mulch protege raízes de frio e calor' },
                                    { icon: 'shield', title: 'Proteção', desc: 'TNT ou sombrite conforme condição' },
                                    { icon: 'compost', title: 'Nutrição', desc: 'Adubo potássico fortalece contra estresse' },
                                ].map(tip => (
                                    <div key={tip.title} className="bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-primary text-xl mb-1">{tip.icon}</span>
                                        <p className="text-xs font-bold">{tip.title}</p>
                                        <p className="text-[10px] opacity-50 mt-0.5">{tip.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
