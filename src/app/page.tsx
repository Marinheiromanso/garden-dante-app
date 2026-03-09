'use client';

import { useState, useEffect } from 'react';
import { Bell, Sun, Scissors, Trees, QrCode, MapPin, ChevronRight, Cloud, CloudRain, Snowflake, CloudFog, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [weatherData, setWeatherData] = useState<{ temp: number; desc: string; city: string; icon: string; loading: boolean; error: boolean }>({
    temp: 25,
    desc: 'Buscando clima...',
    city: 'Localizando...',
    icon: 'light_mode',
    loading: true,
    error: false
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // 1. Fetch weather from Open-Meteo
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherJson = await weatherRes.json();
            const temp = Math.round(weatherJson.current_weather.temperature);
            const code = weatherJson.current_weather.weathercode;

            // WMO Weather interpretation codes
            let desc = 'Ensolarado';
            let icon = 'light_mode';
            if (code === 1 || code === 2 || code === 3) {
              desc = 'P. Nublado';
              icon = 'partly_cloudy_day';
              if (code === 3) { desc = 'Nublado'; icon = 'cloud'; }
            } else if (code === 45 || code === 48) {
              desc = 'Nevoeiro';
              icon = 'foggy';
            } else if (code >= 51 && code <= 67) {
              desc = 'Chuva';
              icon = 'rainy';
            } else if (code >= 71 && code <= 77) {
              desc = 'Neve';
              icon = 'ac_unit';
            } else if (code >= 95) {
              desc = 'Tempestade';
              icon = 'thunderstorm';
            }

            // 2. Fetch City using bigdatacloud free API
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
            const geoJson = await geoRes.json();
            const city = `${geoJson.city || geoJson.locality || 'Desconhecido'}, ${geoJson.principalSubdivisionCode?.split('-').pop() || geoJson.principalSubdivision || ''}`;

            setWeatherData({ temp, desc, city: city.replace(/, $/, ''), icon, loading: false, error: false });
          } catch (err) {
            console.error(err);
            setWeatherData({ temp: 25, desc: 'Erro na previsão', city: 'São Paulo, SP', icon: 'error_outline', loading: false, error: true });
          }
        },
        (error) => {
          console.warn('Geolocation blocked. Falling back to default.');
          setWeatherData({ temp: 25, desc: 'Ensolarado (Padrão)', city: 'São Paulo, SP', icon: 'light_mode', loading: false, error: true });
        },
        { timeout: 10000 }
      );
    } else {
      setWeatherData({ temp: 25, desc: 'Não suportado', city: 'São Paulo, SP', icon: 'location_off', loading: false, error: true });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 justify-between bg-white dark:bg-[#152e15] shadow-sm z-10 sticky top-0">
        <div className="flex size-10 shrink-0 items-center">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=150&h=150")' }}
          ></div>
        </div>
        <h2 className="text-xl font-bold leading-tight flex-1 text-center">Dashboard</h2>
        <Link href="/reminders" className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Weather Widget */}
        <div className="m-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-4 flex items-center justify-between shadow-sm border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full bg-primary/20 text-primary size-12 shadow-inner">
              {weatherData.loading ? (
                <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-3xl">{weatherData.icon}</span>
              )}
            </div>
            <div>
              <p className="text-lg font-bold">
                {weatherData.desc}{!weatherData.loading && !weatherData.error ? `, ${weatherData.temp}°C` : ''}
              </p>
              <p className="text-sm opacity-80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {weatherData.city}
              </p>
            </div>
          </div>
          <Link href="/guide" className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
            Detalhes
          </Link>
        </div>

        {/* Next Pruning Services */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-lg font-bold">Próximos Serviços</h3>
            <Link href="/pruning" className="text-primary text-sm font-medium hover:underline">Ver Tudo</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x hide-scrollbar">
            {/* Card 1 */}
            <div className="flex-none w-72 rounded-xl bg-white dark:bg-[#152e15] p-4 shadow-sm border border-slate-200 dark:border-slate-800 snap-start flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mb-1">Hoje, 10:00 AM</p>
                  <p className="text-base font-bold">Alice Johnson</p>
                </div>
                <div className="size-8 rounded-full bg-slate-100 dark:bg-[#102210] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-slate-500">content_cut</span>
                </div>
              </div>
              <p className="text-sm opacity-80 line-clamp-1">Roseiras, Hortênsias</p>
              <div
                className="h-24 w-full bg-center bg-no-repeat bg-cover rounded-lg"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&q=80&w=300&h=150")' }}
              ></div>
            </div>

            {/* Card 2 */}
            <div className="flex-none w-72 rounded-xl bg-white dark:bg-[#152e15] p-4 shadow-sm border border-slate-200 dark:border-slate-800 snap-start flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded inline-block mb-1">Hoje, 14:30 PM</p>
                  <p className="text-base font-bold">Smith Estate</p>
                </div>
                <div className="size-8 rounded-full bg-slate-100 dark:bg-[#102210] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-slate-500">park</span>
                </div>
              </div>
              <p className="text-sm opacity-80 line-clamp-1">Modelagem de Macieiras</p>
              <div
                className="h-24 w-full bg-center bg-no-repeat bg-cover rounded-lg"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1444858291040-58f756a3bea6?auto=format&fit=crop&q=80&w=300&h=150")' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Plant Scanner CTA */}
        <div className="px-4 mt-2">
          <Link href="/scanner" className="w-full flex items-center justify-center gap-3 bg-primary text-slate-900 rounded-xl p-4 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            <span className="text-lg font-bold">Scanner de Plantas</span>
          </Link>
        </div>

        {/* Today's Schedule Summary */}
        <div className="mt-8 px-4 mb-4">
          <h3 className="text-lg font-bold mb-4">Agenda de Hoje</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 bg-white dark:bg-[#152e15] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <div className="flex flex-col items-center justify-center min-w-[50px]">
                <span className="text-sm font-bold">10:00</span>
                <span className="text-xs opacity-60">AM</span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Serviço de Poda</p>
                <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Alice Johnson
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-[#152e15] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              <div className="flex flex-col items-center justify-center min-w-[50px]">
                <span className="text-sm font-bold">14:30</span>
                <span className="text-xs opacity-60">PM</span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Modelagem de Árvores</p>
                <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Smith Estate
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
