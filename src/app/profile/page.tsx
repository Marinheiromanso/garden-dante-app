'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn, PROFILE_KEY } from '@/lib/utils';
import { saveProfilePhoto, getProfilePhoto } from '@/lib/photo-storage';

function AlertBanner({ message, type, className }: { message: string; type: 'success' | 'error'; className?: string }) {
    const isSuccess = type === 'success';
    return (
        <div className={cn(
            "p-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in duration-300 border",
            isSuccess ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-400",
            className
        )}>
            <span className="material-symbols-outlined text-lg">{isSuccess ? 'check_circle' : 'error'}</span>
            {message}
        </div>
    );
}

type ProfileData = {
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    bio: string;
    specialties: string;
    photoURL: string;
};

const defaultProfile: ProfileData = {
    name: '',
    email: '',
    whatsapp: '',
    city: '',
    bio: '',
    specialties: '',
    photoURL: '',
};

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<ProfileData>(defaultProfile);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    // Logout confirm
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Theme
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Clear corrupted photoURL from Firebase Auth (was truncated base64)
                if (firebaseUser.photoURL && firebaseUser.photoURL.startsWith('data:') && firebaseUser.photoURL.length < 5000) {
                    try { await updateProfile(firebaseUser, { photoURL: '' }); } catch { /* ignore */ }
                }

                // Try loading from Firestore first, fallback to localStorage
                try {
                    const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const loaded: ProfileData = {
                            name: data.name || firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            whatsapp: data.whatsapp || '',
                            city: data.city || '',
                            bio: data.bio || '',
                            specialties: data.specialties || '',
                            photoURL: data.photoURL || '',
                        };
                        setProfile(loaded);
                        setEditForm(loaded);
                        // Sync to localStorage so home page can read it
                        localStorage.setItem(PROFILE_KEY, JSON.stringify(loaded));
                        if (loaded.photoURL) {
                            saveProfilePhoto(loaded.photoURL).catch(() => {});
                            try { localStorage.setItem('magicGardenPhoto', loaded.photoURL); } catch { /* ignore */ }
                        }
                        return;
                    }
                } catch { /* Firestore offline, use localStorage */ }

                // Fallback to localStorage
                try {
                    const stored = localStorage.getItem(PROFILE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const loaded: ProfileData = {
                            ...defaultProfile,
                            ...parsed,
                            name: parsed.name || firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            photoURL: parsed.photoURL || '',
                        };
                        setProfile(loaded);
                        setEditForm(loaded);
                        return;
                    }
                } catch { /* ignore */ }

                // Defaults from auth
                const loaded: ProfileData = {
                    ...defaultProfile,
                    name: firebaseUser.displayName || '',
                    email: firebaseUser.email || '',
                    photoURL: '',
                };
                setProfile(loaded);
                setEditForm(loaded);
            } else {
                // Not logged in, use localStorage only
                try {
                    const stored = localStorage.getItem(PROFILE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        setProfile({ ...defaultProfile, ...parsed });
                        setEditForm({ ...defaultProfile, ...parsed });
                    }
                } catch { /* ignore */ }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
    }, []);

    const saveProfile = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            // Update Firebase Auth profile
            if (user) {
                await updateProfile(user, {
                    displayName: editForm.name,
                });
                // Save to Firestore
                try {
                    await setDoc(doc(db, 'users', user.uid), {
                        name: editForm.name,
                        whatsapp: editForm.whatsapp,
                        city: editForm.city,
                        bio: editForm.bio,
                        specialties: editForm.specialties,
                        photoURL: editForm.photoURL,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                } catch { /* Firestore offline */ }
            }
            // Always save to localStorage as backup
            localStorage.setItem(PROFILE_KEY, JSON.stringify(editForm));
            if (editForm.photoURL) localStorage.setItem('magicGardenPhoto', editForm.photoURL);
            setProfile(editForm);
            setEditMode(false);
            setSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Erro ao salvar perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem deve ter no máximo 5MB.');
            return;
        }

        setUploading(true);
        setError('');
        try {
            // Compress and convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const maxSize = 400;
                        let w = img.width, h = img.height;
                        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
                        else { w = (w / h) * maxSize; h = maxSize; }
                        canvas.width = w;
                        canvas.height = h;
                        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.onerror = reject;
                    img.src = reader.result as string;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            setEditForm(f => ({ ...f, photoURL: base64 }));
            setProfile(p => ({ ...p, photoURL: base64 }));

            // Save photo to IndexedDB (reliable for large data)
            await saveProfilePhoto(base64);

            // Save photo to dedicated localStorage key
            try { localStorage.setItem('magicGardenPhoto', base64); } catch { /* quota exceeded */ }

            // Save to Firestore + localStorage profile
            if (user) {
                try {
                    await setDoc(doc(db, 'users', user.uid), { photoURL: base64, updatedAt: new Date().toISOString() }, { merge: true });
                } catch { /* Firestore offline */ }
            }
            localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, photoURL: base64 }));

            setSuccess('Foto atualizada!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Erro ao processar foto. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (newPassword.length < 6) {
            setPwError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('As senhas não coincidem.');
            return;
        }
        if (!user || !user.email) {
            setPwError('Usuário não autenticado.');
            return;
        }

        setPwLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setPwSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPwSuccess('');
            }, 2000);
        } catch {
            setPwError('Senha atual incorreta ou erro de autenticação.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch {
            router.push('/login');
        }
    };

    const toggleDarkMode = () => {
        const html = document.documentElement;
        if (darkMode) {
            html.classList.remove('dark');
        } else {
            html.classList.add('dark');
        }
        setDarkMode(!darkMode);
    };

    const photoSrc = editMode ? editForm.photoURL : profile.photoURL;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <div className="flex items-center p-4 justify-between">
                        <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-lg font-bold flex-1 text-center">Meu Perfil</h2>
                        {!editMode ? (
                            <button onClick={() => { setEditForm(profile); setEditMode(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        ) : (
                            <button onClick={() => setEditMode(false)} className="p-2 text-slate-500 hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Success / Error Banners */}
                {success && <AlertBanner message={success} type="success" className="mx-4 mt-3" />}
                {error && <AlertBanner message={error} type="error" className="mx-4 mt-3" />}

                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mt-6 mb-2 px-4">
                    <div className="relative group">
                        <div className="size-28 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg shadow-primary/10">
                            {photoSrc ? (
                                <img src={photoSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-primary/40">person</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPhotoMenu(true)}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 size-10 rounded-full bg-primary text-slate-900 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all active:scale-90"
                        >
                            {uploading ? (
                                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                            )}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                    </div>

                    {/* Photo Source Menu */}
                    {showPhotoMenu && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowPhotoMenu(false)}>
                            <div className="bg-white dark:bg-[#152e15] rounded-t-2xl w-full max-w-lg p-4 pb-8 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
                                <h3 className="text-base font-bold text-center mb-4">Alterar Foto de Perfil</h3>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => { setShowPhotoMenu(false); cameraInputRef.current?.click(); }}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors active:scale-[0.98]"
                                    >
                                        <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">photo_camera</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Tirar Foto</p>
                                            <p className="text-xs opacity-50">Usar a câmera do dispositivo</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setShowPhotoMenu(false); fileInputRef.current?.click(); }}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors active:scale-[0.98]"
                                    >
                                        <div className="size-11 rounded-full bg-violet-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-violet-500">photo_library</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Escolher da Galeria</p>
                                            <p className="text-xs opacity-50">Selecionar uma foto existente</p>
                                        </div>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowPhotoMenu(false)}
                                    className="w-full mt-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    <h3 className="text-xl font-bold mt-4">{profile.name || 'Seu Nome'}</h3>
                    <p className="text-sm opacity-50">{profile.email || 'seu@email.com'}</p>
                    {profile.city && (
                        <p className="text-xs opacity-40 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {profile.city}
                        </p>
                    )}
                </div>

                {/* Edit Mode */}
                {editMode ? (
                    <div className="px-4 mt-4">
                        <div className="bg-white dark:bg-[#152e15] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">edit_note</span>
                                Editar Informações
                            </h4>

                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nome Completo</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Seu nome" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">WhatsApp</label>
                                <input type="tel" value={editForm.whatsapp} onChange={e => setEditForm({ ...editForm, whatsapp: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="(00) 00000-0000" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Cidade</label>
                                <input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: São Paulo, SP" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Especialidades</label>
                                <input type="text" value={editForm.specialties} onChange={e => setEditForm({ ...editForm, specialties: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Paisagismo, podas, jardins verticais" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Bio / Sobre</label>
                                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none" placeholder="Conte um pouco sobre você e seu trabalho..." />
                            </div>

                            <button onClick={saveProfile} disabled={saving} className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? (
                                    <><span className="material-symbols-outlined text-lg animate-spin">sync</span> Salvando...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-lg">save</span> Salvar Alterações</>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Info Cards (View Mode) */}
                        {(profile.bio || profile.specialties) && (
                            <div className="px-4 mt-4">
                                <div className="bg-white dark:bg-[#152e15] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
                                    {profile.bio && (
                                        <div>
                                            <p className="text-xs font-medium opacity-50 uppercase mb-1">Sobre</p>
                                            <p className="text-sm leading-relaxed">{profile.bio}</p>
                                        </div>
                                    )}
                                    {profile.specialties && (
                                        <div>
                                            <p className="text-xs font-medium opacity-50 uppercase mb-1">Especialidades</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {profile.specialties.split(',').map((s, i) => (
                                                    <span key={i} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{s.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="px-4 mt-4">
                            <div className="bg-white dark:bg-[#152e15] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Informações de Contato</p>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sky-500">email</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs opacity-50">E-mail</p>
                                            <p className="text-sm font-medium truncate">{profile.email || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-emerald-500">phone</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs opacity-50">WhatsApp</p>
                                            <p className="text-sm font-medium">{profile.whatsapp || '—'}</p>
                                        </div>
                                    </div>
                                    {profile.city && (
                                        <div className="flex items-center gap-4 px-5 py-3.5">
                                            <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-amber-500">location_on</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs opacity-50">Cidade</p>
                                                <p className="text-sm font-medium">{profile.city}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="px-4 mt-4">
                            <div className="bg-white dark:bg-[#152e15] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Configurações</p>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {/* Dark Mode Toggle */}
                                    <button onClick={toggleDarkMode} className="flex items-center gap-4 px-5 py-3.5 w-full text-left hover:bg-primary/5 transition-colors">
                                        <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-violet-500">{darkMode ? 'dark_mode' : 'light_mode'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Modo Escuro</p>
                                            <p className="text-xs opacity-50">{darkMode ? 'Ativado' : 'Desativado'}</p>
                                        </div>
                                        <div className={cn("w-12 h-7 rounded-full p-1 transition-colors", darkMode ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}>
                                            <div className={cn("size-5 rounded-full bg-white shadow-sm transition-transform", darkMode && "translate-x-5")} />
                                        </div>
                                    </button>

                                    {/* Notifications Toggle */}
                                    <button onClick={() => setNotifications(!notifications)} className="flex items-center gap-4 px-5 py-3.5 w-full text-left hover:bg-primary/5 transition-colors">
                                        <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-amber-500">{notifications ? 'notifications_active' : 'notifications_off'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Notificações</p>
                                            <p className="text-xs opacity-50">{notifications ? 'Ativadas' : 'Desativadas'}</p>
                                        </div>
                                        <div className={cn("w-12 h-7 rounded-full p-1 transition-colors", notifications ? "bg-primary" : "bg-slate-300 dark:bg-slate-700")}>
                                            <div className={cn("size-5 rounded-full bg-white shadow-sm transition-transform", notifications && "translate-x-5")} />
                                        </div>
                                    </button>

                                    {/* Change Password */}
                                    <button onClick={() => { setPwError(''); setPwSuccess(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordModal(true); }} className="flex items-center gap-4 px-5 py-3.5 w-full text-left hover:bg-primary/5 transition-colors">
                                        <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sky-500">lock</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Alterar Senha</p>
                                            <p className="text-xs opacity-50">Atualizar senha de login</p>
                                        </div>
                                        <span className="material-symbols-outlined text-lg opacity-30">chevron_right</span>
                                    </button>

                                    {/* Terms */}
                                    <button onClick={() => router.push('/terms')} className="flex items-center gap-4 px-5 py-3.5 w-full text-left hover:bg-primary/5 transition-colors">
                                        <div className="size-10 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-500">description</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Termos de Uso</p>
                                            <p className="text-xs opacity-50">Política e condições</p>
                                        </div>
                                        <span className="material-symbols-outlined text-lg opacity-30">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="px-4 mt-4 mb-6">
                            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-400/20 text-red-400 rounded-2xl font-bold text-sm hover:bg-red-500/10 transition-colors active:scale-[0.98]">
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Sair da Conta
                            </button>
                            <p className="text-center text-[10px] opacity-30 mt-4">Magic Garden v1.0</p>
                        </div>
                    </>
                )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Alterar Senha</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {pwSuccess && <AlertBanner message={pwSuccess} type="success" className="mb-4" />}
                        {pwError && <AlertBanner message={pwError} type="error" className="mb-4" />}

                        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Senha Atual</label>
                                <div className="relative">
                                    <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Sua senha atual" required />
                                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                        <span className="material-symbols-outlined text-xl">{showCurrentPw ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nova Senha</label>
                                <div className="relative">
                                    <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Mínimo 6 caracteres" required />
                                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                                        <span className="material-symbols-outlined text-xl">{showNewPw ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Confirmar Nova Senha</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" placeholder="Repita a nova senha" required />
                            </div>
                            <button type="submit" disabled={pwLoading} className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                {pwLoading ? (
                                    <><span className="material-symbols-outlined text-lg animate-spin">sync</span> Alterando...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-lg">lock_reset</span> Alterar Senha</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Logout Confirm Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                        <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-400">logout</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Sair da Conta?</h3>
                        <p className="text-sm opacity-50 mb-6">Você precisará fazer login novamente para acessar o aplicativo.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors active:scale-[0.98]">
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
