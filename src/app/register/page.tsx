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
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    const strengthScore = [hasUppercase, hasNumber, hasSpecial, hasMinLength].filter(Boolean).length;
    const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][strengthScore];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#13ec13'][strengthScore];
    const isPasswordValid = strengthScore === 4;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!isPasswordValid) {
            setError('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.');
            setLoading(false);
            return;
        }
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
            const code = err?.code || '';
            if (code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
            } else if (code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else if (code === 'auth/invalid-email') {
                setError('E-mail inválido. Verifique e tente novamente.');
            } else {
                setError('Erro ao criar conta. Verifique os dados e tente novamente.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col items-center justify-center p-6 overflow-y-auto pt-12 pb-12 relative">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/90 to-background-dark/80" />
            </div>

            <div className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10">
                {/* Icon */}
                <div className="size-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-3xl text-slate-900 font-bold">person_add</span>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Criar Conta</h1>
                    <p className="text-slate-500 dark:text-primary/60 font-medium text-sm px-4">Junte-se ao Magic Garden e transforme sua gestão de jardins</p>
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha forte"
                            required
                            minLength={8}
                            className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-2xl py-3.5 pl-12 pr-12 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                            tabIndex={-1}
                        >
                            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>

                    {/* Password Strength Bar */}
                    {password.length > 0 && (
                        <div className="px-1 -mt-2">
                            <div className="flex gap-1.5 mb-2">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                        style={{ backgroundColor: strengthScore >= level ? strengthColor : 'rgba(148,163,184,0.3)' }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-bold" style={{ color: strengthColor }}>Senha: {strengthLabel}</p>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1">
                                <span className={`text-[11px] ${hasMinLength ? 'text-primary' : 'text-slate-400'}`}>{hasMinLength ? '✓' : '○'} Mínimo 8 caracteres</span>
                                <span className={`text-[11px] ${hasUppercase ? 'text-primary' : 'text-slate-400'}`}>{hasUppercase ? '✓' : '○'} Letra maiúscula</span>
                                <span className={`text-[11px] ${hasNumber ? 'text-primary' : 'text-slate-400'}`}>{hasNumber ? '✓' : '○'} Número</span>
                                <span className={`text-[11px] ${hasSpecial ? 'text-primary' : 'text-slate-400'}`}>{hasSpecial ? '✓' : '○'} Caractere especial (!@#$...)</span>
                            </div>
                        </div>
                    )}

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
