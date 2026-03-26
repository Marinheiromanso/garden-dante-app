'use client';

import { useState, useEffect } from 'react';
import { Bell, Sun, Scissors, Trees, QrCode, MapPin, ChevronRight, Cloud, CloudRain, Snowflake, CloudFog, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getProfilePhoto } from '@/lib/photo-storage';

const PROFILE_KEY = 'magicGardenProfile';

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');

  // Load profile photo on mount
  useEffect(() => {
    getProfilePhoto()
      .then(photo => { if (photo) setProfilePhoto(photo); })
      .catch(() => {
        // Fallback to localStorage
        try {
          const photo = localStorage.getItem('magicGardenPhoto');
          if (photo) { setProfilePhoto(photo); return; }
        } catch { /* ignore */ }
        try {
          const stored = localStorage.getItem(PROFILE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.photoURL) setProfilePhoto(parsed.photoURL);
          }
        } catch { /* ignore */ }
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const [weatherData, setWeatherData] = useState<{ temp: number; desc: string; city: string; icon: string; loading: boolean; error: boolean }>({
    temp: 25,
    desc: 'Buscando clima...',
    city: 'Localizando...',
    icon: 'light_mode',
    loading: true,
    error: false
  });

  // Task state from localStorage
  const [tasks, setTasks] = useState<any[]>([]);

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayString = formatDateString(new Date());
  const todayTasks = tasks.filter(t => t.dateString === todayString);
  const todayPendingTasks = todayTasks.filter(t => t.status !== 'Concluído');

  // Load tasks from localStorage on mount (clean old demo data once)
  useEffect(() => {
    try {
      if (!localStorage.getItem('magicGarden_cleaned_v2')) {
        localStorage.removeItem('magicGardenTasks');
        localStorage.removeItem('magicGardenHealthHistory');
        localStorage.removeItem('magicGardenExpenses');
        localStorage.removeItem('magicGardenStock');
        localStorage.removeItem('magicGardenTools');
        localStorage.removeItem('magicGardenToolLogs');
        localStorage.removeItem('magicGardenMonthlyRevenue');
        localStorage.setItem('magicGarden_cleaned_v2', '1');
        return;
      }
      const stored = localStorage.getItem('magicGardenTasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
  }, []);

  const handleMarkDone = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: 'Concluído' } : t);
    setTasks(updated);
    localStorage.setItem('magicGardenTasks', JSON.stringify(updated));
  };

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

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 justify-between bg-white dark:bg-[#152e15] shadow-sm z-10 sticky top-0">
        <Link href="/profile" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-colors overflow-hidden">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Perfil" className="size-full object-cover rounded-full" />
          ) : (
            <span className="material-symbols-outlined text-primary text-xl">person</span>
          )}
        </Link>
        <h2 className="text-xl font-bold leading-tight flex-1 text-center">Magic Garden</h2>
        <Link href="/reminders" className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <div className="relative h-44 mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80")' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-end p-5">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Bem-vindo de volta</p>
            <h2 className="text-white text-2xl font-bold mt-1">Magic Garden</h2>
            <p className="text-white/60 text-sm mt-1">Gerencie serviços, clientes e plantas em um só lugar.</p>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="m-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 p-4 flex items-center justify-between shadow-sm border border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80")' }} />
          <div className="relative z-10 flex items-center gap-4">
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
          <Link href="/guide" className="relative z-10 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
            Detalhes
          </Link>
        </div>

        {/* Next Pruning Services - Dynamic */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-lg font-bold">Próximos Serviços</h3>
            <Link href="/pruning" className="text-primary text-sm font-medium hover:underline">Ver Tudo</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x hide-scrollbar">
            {todayPendingTasks.length === 0 ? (
              <div className="relative flex-none w-full rounded-xl bg-white dark:bg-[#152e15] p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-center overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-[0.07]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80")' }} />
                <span className="material-symbols-outlined text-4xl text-primary/30 mb-2 relative z-10">event_available</span>
                <p className="text-sm opacity-70 mt-2 relative z-10">Nenhum serviço pendente para hoje.</p>
                <Link href="/pruning" className="text-primary text-sm font-bold mt-2 inline-block hover:underline relative z-10">Agendar Serviço →</Link>
              </div>
            ) : (
              todayPendingTasks.map((task) => (
                <div key={task.id} className="flex-none w-72 rounded-xl bg-white dark:bg-[#152e15] p-4 shadow-sm border border-slate-200 dark:border-slate-800 snap-start flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mb-1">Hoje, {task.time}</p>
                      <p className="text-base font-bold">{task.client}</p>
                    </div>
                    <button
                      onClick={() => handleMarkDone(task.id)}
                      className="size-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-90 cursor-pointer"
                      title="Marcar como concluído"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    </button>
                  </div>
                  <p className="text-sm opacity-80 line-clamp-1">{task.service}</p>
                  <div className="flex items-center gap-1 text-xs opacity-60">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {task.address}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plant Scanner CTA */}
        <div className="px-4 mt-2">
          <Link href="/scanner" className="relative w-full flex items-center justify-center gap-3 bg-primary text-slate-900 rounded-xl p-4 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=600&q=80")' }} />
            <span className="material-symbols-outlined text-2xl relative z-10">qr_code_scanner</span>
            <span className="text-lg font-bold relative z-10">Scanner de Plantas</span>
          </Link>
        </div>

        {/* Quick Access Grid */}
        <div className="mt-6 px-4">
          <h3 className="text-lg font-bold mb-3">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/expenses" className="relative flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&q=80")' }} />
              <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 relative z-10">
                <span className="material-symbols-outlined text-amber-500">account_balance_wallet</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold">Gestão</p>
                <p className="text-[10px] opacity-50">Despesas e ferramentas</p>
              </div>
            </Link>
            <Link href="/calculator" className="relative flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80")' }} />
              <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 relative z-10">
                <span className="material-symbols-outlined text-cyan-500">calculate</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold">Calculadora</p>
                <p className="text-[10px] opacity-50">Insumos e substratos</p>
              </div>
            </Link>
            <Link href="/weather-alerts" className="relative flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=300&q=80")' }} />
              <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 relative z-10">
                <span className="material-symbols-outlined text-sky-500">thunderstorm</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold">Clima</p>
                <p className="text-[10px] opacity-50">Alertas severos</p>
              </div>
            </Link>
            <Link href="/training" className="relative flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-all active:scale-[0.97] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&q=80")' }} />
              <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 relative z-10">
                <span className="material-symbols-outlined text-purple-500">play_circle</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold">Treinamento</p>
                <p className="text-[10px] opacity-50">Vídeos e tutoriais</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Schedule Summary - Dynamic */}
        <div className="mt-8 px-4 mb-4">
          <h3 className="text-lg font-bold mb-4">Agenda de Hoje</h3>
          <div className="flex flex-col gap-3">
            {todayTasks.length === 0 ? (
              <div className="flex items-center gap-4 bg-white dark:bg-[#152e15] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary/30">calendar_today</span>
                <p className="text-sm opacity-70">Agenda vazia para hoje.</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 bg-white dark:bg-[#152e15] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'Concluído' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
                  <div className="flex flex-col items-center justify-center min-w-[50px]">
                    <span className="text-sm font-bold">{task.time}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${task.status === 'Concluído' ? 'line-through opacity-50' : ''}`}>{task.service}</p>
                    <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {task.client}
                    </p>
                  </div>
                  {task.status === 'Concluído' ? (
                    <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                  ) : (
                    <button
                      onClick={() => handleMarkDone(task.id)}
                      className="size-8 rounded-full bg-primary/10 flex items-center shrink-0 justify-center hover:bg-primary/20 transition-colors active:scale-90 cursor-pointer"
                      title="Marcar como concluído"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
