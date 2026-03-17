'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            setError('Credenciais inválidas. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80")' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/90 to-background-dark" />
            </div>

            <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
                {/* Logo/Icon */}
                <div className="size-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
                    <span className="material-symbols-outlined text-4xl text-slate-900 font-bold -rotate-3">potted_plant</span>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Bem-vindo</h1>
                    <p className="text-slate-500 dark:text-primary/60 font-medium">Gerencie seu jardim com excelência</p>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <input
                            type="email"
                            placeholder="E-mail"
                            required
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <input
                            type="password"
                            placeholder="Senha"
                            required
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
                    )}

                    <div className="flex justify-end">
                        <Link href="/forgot-password" size="sm" className="text-sm font-bold text-primary hover:underline">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? (
                            <span className="animate-spin material-symbols-outlined">progress_activity</span>
                        ) : (
                            <>
                                Entrar
                                <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="w-full flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-200 dark:bg-primary/10 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ou entrar com</span>
                    <div className="h-px bg-slate-200 dark:bg-primary/10 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <button className="flex items-center justify-center gap-2 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors dark:text-slate-100">
                        <img src="https://www.google.com/favicon.ico" className="size-4" alt="Google" />
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors dark:text-slate-100">
                        <span className="material-symbols-outlined text-lg">apple</span>
                        Apple
                    </button>
                </div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
