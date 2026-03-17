'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Review = {
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    date: string;
    avatar?: string;
};

type ProfileData = {
    name: string;
    title: string;
    bio: string;
    phone: string;
    email: string;
    city: string;
    experience: string;
    specialties: string[];
    certifications: string[];
    avatar: string;
};

const STORAGE_KEY = 'gardenDanteProfile';
const REVIEWS_KEY = 'gardenDanteReviews';

const defaultProfile: ProfileData = {
    name: 'Dante Oliveira',
    title: 'Jardineiro Paisagista',
    bio: 'Profissional apaixonado por jardins com mais de 8 anos transformando espaços verdes. Especialista em paisagismo sustentável, poda artística e cuidados com espécies tropicais.',
    phone: '11999887766',
    email: 'dante@gardendante.com',
    city: 'São Paulo, SP',
    experience: '8 anos',
    specialties: ['Paisagismo Residencial', 'Poda Artística', 'Jardinagem Sustentável', 'Plantas Tropicais', 'Hortas Urbanas', 'Irrigação Inteligente'],
    certifications: ['Técnico em Paisagismo - SENAI', 'Manejo de Pragas Orgânico', 'Arboricultura Urbana'],
    avatar: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=300&h=300',
};

const initialReviews: Review[] = [
    { id: '1', clientName: 'Alice Johnson', rating: 5, comment: 'Trabalho impecável! Meu jardim nunca esteve tão bonito. Muito profissional e pontual.', date: '2026-03-10', avatar: 'https://ui-avatars.com/api/?name=Alice+J&background=13ec13&color=fff' },
    { id: '2', clientName: 'Roberto Silva', rating: 5, comment: 'Excelente conhecimento sobre plantas. Salvou minha orquídea que estava quase morrendo!', date: '2026-03-05', avatar: 'https://ui-avatars.com/api/?name=Roberto+S&background=13ec13&color=fff' },
    { id: '3', clientName: 'Maria Fernandes', rating: 4, comment: 'Ótima poda nas frutíferas. Recomendo para quem precisa de um jardineiro de confiança.', date: '2026-02-28', avatar: 'https://ui-avatars.com/api/?name=Maria+F&background=13ec13&color=fff' },
    { id: '4', clientName: 'Smith Estate', rating: 5, comment: 'Transformou nosso quintal em um verdadeiro paraíso. Paisagismo de altíssimo nível.', date: '2026-02-20', avatar: 'https://ui-avatars.com/api/?name=Smith+E&background=13ec13&color=fff' },
    { id: '5', clientName: 'João Pedro Lima', rating: 5, comment: 'Montou minha horta urbana do zero. Agora tenho temperos frescos toda semana!', date: '2026-02-15', avatar: 'https://ui-avatars.com/api/?name=João+P&background=13ec13&color=fff' },
    { id: '6', clientName: 'Carla Mendes', rating: 4, comment: 'Muito atencioso e cuidadoso com cada detalhe. Gostei do resultado final.', date: '2026-02-10', avatar: 'https://ui-avatars.com/api/?name=Carla+M&background=13ec13&color=fff' },
];

export default function ProfessionalProfile() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData>(() => {
        if (typeof window === 'undefined') return defaultProfile;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return defaultProfile;
    });
    const [reviews] = useState<Review[]>(() => {
        if (typeof window === 'undefined') return initialReviews;
        try {
            const stored = localStorage.getItem(REVIEWS_KEY);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialReviews));
        } catch { /* ignore */ }
        return initialReviews;
    });
    const [activeTab, setActiveTab] = useState<'sobre' | 'avaliacoes'>('sobre');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState<ProfileData>(defaultProfile);
    const [newSpecialty, setNewSpecialty] = useState('');

    const saveProfile = (updated: ProfileData) => {
        setProfile(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleEditOpen = () => {
        setEditForm({ ...profile });
        setEditing(true);
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveProfile(editForm);
        setEditing(false);
    };

    const handleAddSpecialty = () => {
        if (newSpecialty.trim() && !editForm.specialties.includes(newSpecialty.trim())) {
            setEditForm({ ...editForm, specialties: [...editForm.specialties, newSpecialty.trim()] });
            setNewSpecialty('');
        }
    };

    const handleRemoveSpecialty = (s: string) => {
        setEditForm({ ...editForm, specialties: editForm.specialties.filter(sp => sp !== s) });
    };

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

    const shareProfile = () => {
        const text = `🌿 *${profile.name}* - ${profile.title}\n\n${profile.bio}\n\n📍 ${profile.city}\n📞 ${formatPhone(profile.phone)}\n⭐ ${avgRating.toFixed(1)} (${reviews.length} avaliações)\n\nEspecialidades: ${profile.specialties.join(', ')}`;
        const encoded = encodeURIComponent(text);

        if (navigator.share) {
            navigator.share({ title: profile.name, text }).catch(() => { });
        } else {
            window.open(`https://wa.me/?text=${encoded}`, '_blank');
        }
    };

    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={cn("material-symbols-outlined text-[18px]", i < rating ? "text-amber-400 !fill-[1]" : "text-slate-300 dark:text-slate-600")}>star</span>
        ));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center">Perfil Profissional</h2>
                    <button onClick={shareProfile} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </header>

                {/* Profile Card */}
                <div className="px-4 pt-6 pb-4">
                    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl p-6 border border-primary/20 shadow-sm text-center relative">
                        <button onClick={handleEditOpen} className="absolute top-3 right-3 p-2 hover:bg-primary/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-lg opacity-50">edit</span>
                        </button>

                        <div
                            className="size-24 rounded-full mx-auto bg-cover bg-center border-4 border-primary/30 shadow-lg"
                            style={{ backgroundImage: `url("${profile.avatar}")` }}
                        />
                        <h2 className="text-xl font-black mt-4">{profile.name}</h2>
                        <p className="text-sm text-primary font-medium">{profile.title}</p>

                        <div className="flex items-center justify-center gap-1 mt-3">
                            {renderStars(Math.round(avgRating))}
                            <span className="text-sm font-bold ml-1">{avgRating.toFixed(1)}</span>
                            <span className="text-xs opacity-50">({reviews.length})</span>
                        </div>

                        <div className="flex justify-center gap-6 mt-5">
                            <div className="text-center">
                                <p className="text-xl font-black text-primary">{profile.experience}</p>
                                <p className="text-[10px] opacity-50 uppercase">Experiência</p>
                            </div>
                            <div className="w-px bg-primary/20" />
                            <div className="text-center">
                                <p className="text-xl font-black text-primary">{reviews.length}</p>
                                <p className="text-[10px] opacity-50 uppercase">Avaliações</p>
                            </div>
                            <div className="w-px bg-primary/20" />
                            <div className="text-center">
                                <p className="text-xl font-black text-primary">{profile.specialties.length}</p>
                                <p className="text-[10px] opacity-50 uppercase">Serviços</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Quick Actions */}
                <div className="px-4 mb-4 flex gap-3">
                    <a
                        href={`https://wa.me/55${profile.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 rounded-xl py-3 font-bold text-sm border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        WhatsApp
                    </a>
                    <a
                        href={`tel:+55${profile.phone.replace(/\D/g, '')}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-sky-500/10 text-sky-400 rounded-xl py-3 font-bold text-sm border border-sky-500/20 hover:bg-sky-500/20 transition-colors active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-lg">call</span>
                        Ligar
                    </a>
                    <a
                        href={`mailto:${profile.email}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl py-3 font-bold text-sm border border-primary/20 hover:bg-primary/20 transition-colors active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-lg">mail</span>
                        E-mail
                    </a>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-primary/20 px-4">
                    <button
                        onClick={() => setActiveTab('sobre')}
                        className={cn("flex-1 pb-3 pt-4 text-sm font-bold border-b-[3px] transition-colors", activeTab === 'sobre' ? "border-primary" : "border-transparent text-slate-400")}
                    >
                        Sobre
                    </button>
                    <button
                        onClick={() => setActiveTab('avaliacoes')}
                        className={cn("flex-1 pb-3 pt-4 text-sm font-bold border-b-[3px] transition-colors", activeTab === 'avaliacoes' ? "border-primary" : "border-transparent text-slate-400")}
                    >
                        Avaliações ({reviews.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'sobre' ? (
                    <div className="px-4 py-5 space-y-6">
                        {/* Bio */}
                        <div>
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">person</span>
                                Sobre Mim
                            </h3>
                            <p className="text-sm opacity-80 leading-relaxed">{profile.bio}</p>
                        </div>

                        {/* Location & Contact Info */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">info</span>
                                Informações
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    <p className="text-sm">{profile.city}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-primary">call</span>
                                    <p className="text-sm">{formatPhone(profile.phone)}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white dark:bg-[#152e15] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-primary">mail</span>
                                    <p className="text-sm">{profile.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Specialties */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">eco</span>
                                Especialidades
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.specialties.map((s, i) => (
                                    <span key={i} className="text-xs font-medium bg-primary/10 text-primary px-3 py-2 rounded-full">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
                                Certificações
                            </h3>
                            <div className="space-y-2">
                                {profile.certifications.map((cert, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                                        <span className="material-symbols-outlined text-amber-400 text-lg">verified</span>
                                        <p className="text-sm font-medium">{cert}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-5 space-y-3">
                        {/* Rating Summary */}
                        <div className="bg-white dark:bg-[#152e15] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 mb-4">
                            <div className="text-center">
                                <p className="text-4xl font-black text-primary">{avgRating.toFixed(1)}</p>
                                <div className="flex mt-1">{renderStars(Math.round(avgRating))}</div>
                                <p className="text-xs opacity-50 mt-1">{reviews.length} avaliações</p>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = reviews.filter(r => r.rating === star).length;
                                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-xs w-3 text-right opacity-50">{star}</span>
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[10px] w-5 opacity-40">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews */}
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white dark:bg-[#152e15] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="size-10 rounded-full bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url("${review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.clientName)}&background=13ec13&color=fff`}")` }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{review.clientName}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex">{renderStars(review.rating)}</div>
                                            <span className="text-xs opacity-40">{new Date(review.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm opacity-80 leading-relaxed">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setEditing(false)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Editar Perfil</h3>
                            <button onClick={() => setEditing(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Nome</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Título Profissional</label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Sobre</label>
                                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none" required />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Telefone</label>
                                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium opacity-60 mb-1 block">Experiência</label>
                                    <input type="text" value={editForm.experience} onChange={e => setEditForm({ ...editForm, experience: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">E-mail</label>
                                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-1 block">Cidade</label>
                                <input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div>
                                <label className="text-xs font-medium opacity-60 mb-2 block">Especialidades</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editForm.specialties.map((s, i) => (
                                        <span key={i} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                                            {s}
                                            <button type="button" onClick={() => handleRemoveSpecialty(s)} className="ml-1 hover:text-red-400 transition-colors">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSpecialty}
                                        onChange={e => setNewSpecialty(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpecialty(); } }}
                                        className="flex-1 bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Nova especialidade..."
                                    />
                                    <button type="button" onClick={handleAddSpecialty} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                                        +
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-slate-900 font-bold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
                                Salvar Perfil
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
