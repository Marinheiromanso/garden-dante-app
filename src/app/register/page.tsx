'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            // Update Auth Profile
            await updateProfile(user, { displayName: name });

            // Save additional info in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                whatsapp,
                role: 'admin',
                createdAt: new Date().toISOString()
            }, { merge: true });

            router.push('/');
        } catch (err: any) {
            setError('Erro ao criar conta. Verifique os dados e tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col items-center justify-center p-6 bg-gradient-to-t from-primary/5 to-transparent overflow-y-auto pt-12 pb-12">
            <div className="w-full max-w-sm flex flex-col items-center gap-6">
                {/* Icon */}
                <div className="size-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-3xl text-slate-900 font-bold">person_add</span>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Criar Conta</h1>
                    <p className="text-slate-500 dark:text-primary/60 font-medium text-sm px-4">Junte-se ao Garden Dante e transforme sua gestão de jardins</p>
                </div>

                <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            required
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <input
                            type="email"
                            placeholder="E-mail profissional"
                            required
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">phone</span>
                        </div>
                        <input
                            type="tel"
                            placeholder="WhatsApp"
                            required
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <input
                            type="password"
                            placeholder="Senha (mín. 6 caracteres)"
                            required
                            minLength={6}
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-3.5 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
                    )}

                    <div className="flex items-center gap-2 px-2">
                        <input type="checkbox" required className="rounded border-slate-300 text-primary focus:ring-primary size-4" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Concordo com os <Link href="/terms" className="text-primary font-bold">Termos e Condições</Link>
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                    >
                        {loading ? (
                            <span className="animate-spin material-symbols-outlined">progress_activity</span>
                        ) : (
                            <>
                                Criar Minha Conta
                                <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">how_to_reg</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Já possui conta?{' '}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Entrar agora
                    </Link>
                </p>
            </div>
        </div>
    );
}
