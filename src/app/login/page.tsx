'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch {
            setError('E-mail ou senha incorretos. Verifique e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch {
            setError('Não foi possível entrar com Google. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark font-display flex flex-col relative overflow-hidden">
            {/* Background - Full screen garden image */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-background-dark/60 to-background-dark" />
            </div>

            {/* Top section - Logo & Branding */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 min-h-[280px]">
                {/* Animated leaf decorations */}
                <div className="absolute top-8 left-6 opacity-20 text-primary">
                    <span className="material-symbols-outlined text-5xl rotate-[-30deg]">eco</span>
                </div>
                <div className="absolute top-16 right-8 opacity-15 text-primary">
                    <span className="material-symbols-outlined text-3xl rotate-[20deg]">grass</span>
                </div>

                {/* Logo */}
                <div className="relative mb-6">
                    <div className="size-24 bg-primary rounded-[28px] flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
                        <span className="material-symbols-outlined text-5xl text-slate-900 font-bold -rotate-3">
                            potted_plant
                        </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg border-2 border-background-dark">
                        <span className="material-symbols-outlined text-sm text-slate-900">check</span>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-white tracking-tight">Magic Garden</h1>
                <p className="text-primary/70 text-sm font-medium mt-2 tracking-wide">Gestão profissional de jardins</p>
            </div>

            {/* Bottom Card - Login Form */}
            <div className="relative z-10 bg-background-light dark:bg-[#0d1f0d] rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.3)] px-6 pt-8 pb-8">
                {/* Drag indicator */}
                <div className="flex justify-center mb-6">
                    <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Entrar na conta</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Acesse sua conta para continuar</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    {/* Email field */}
                    <div className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200",
                        focusedField === 'email'
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5"
                    )}>
                        <span className={cn(
                            "material-symbols-outlined text-xl transition-colors",
                            focusedField === 'email' ? "text-primary" : "text-slate-400"
                        )}>mail</span>
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            required
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                        />
                        {email && (
                            <button type="button" onClick={() => setEmail('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>

                    {/* Password field */}
                    <div className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200",
                        focusedField === 'password'
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5"
                    )}>
                        <span className={cn(
                            "material-symbols-outlined text-xl transition-colors",
                            focusedField === 'password' ? "text-primary" : "text-slate-400"
                        )}>lock</span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Sua senha"
                            required
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-500 text-sm font-medium py-3 px-4 rounded-xl border border-red-500/20">
                            <span className="material-symbols-outlined text-lg shrink-0">error</span>
                            {error}
                        </div>
                    )}

                    {/* Forgot password */}
                    <div className="flex justify-end -mt-1">
                        <Link href="/register" className="text-xs font-bold text-primary hover:underline">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none mt-1"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                Entrar
                                <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ou continue com</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-800 py-3.5 rounded-2xl font-bold text-sm hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.97] dark:text-slate-100 disabled:opacity-60"
                    >
                        <svg viewBox="0 0 24 24" className="size-5">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        disabled={loading}
                        className="flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-800 py-3.5 rounded-2xl font-bold text-sm hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.97] dark:text-slate-100 disabled:opacity-60"
                    >
                        <svg viewBox="0 0 24 24" className="size-5 fill-current">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                    </button>
                </div>

                {/* Register link */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        Criar conta grátis
                    </Link>
                </p>

                {/* Terms */}
                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
                    Ao continuar, você concorda com os{' '}
                    <Link href="/terms" className="underline">Termos de Uso</Link>
                    {' '}e{' '}
                    <Link href="/terms" className="underline">Política de Privacidade</Link>
                </p>
            </div>
        </div>
    );
}
