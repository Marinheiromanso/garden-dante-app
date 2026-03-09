'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Image as ImageIcon, Camera } from 'lucide-react';

const initialProjects = [
    {
        id: 1,
        client: 'Alice Johnson',
        service: 'Poda de Roseiras',
        date: '12 Out 2023',
        before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCry125WLrOSvGJ2rbrsucL-cDa-tngC30sKoTaAQvrXrN_nK1jXCSkxUNuAsFPYJb49xH1PN2sv8isDGl6Qk4jD_oqLHWIjhpSNG6zgeS0bvKYXbFH1B3DYSVXYsaxyJmHXjCamDYzEEji8XFBCKNqoS9oqdfRQfs1y0dWgauTH9NoE4_jfZbzarv2-1JM2XnL1QZzupH-6AmqF7wVab7hwn9NapJsr9j3o-Wm1x6Sr0_IEHLp5bqYbtNsGSUKOz1BAYreveXYihTX',
        after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn2WbZ6yuZq2JInZ-ioQn2I6XDafaSSxyQ3Z2cDLZmErQ6_h29FyKCgsvCCJGDCX7PBbOBHJBHyfGSGbs9KvAy20Gct8-hlTeAQ2lNPnCGNSTQH3qJ8xZoWURymwZ0LJg8GzoXhrtiAGhLeSwkO_SIQbH11hswq8k3S6svDtlB6ZVwdV8kzZPWYD8diEQXQVbERkPaIMm3yX0tyPtUd57U65KfUxfMgJ3MakneKqhBXPfHK0mRwGG0T_n4osvJxdZVwodE_lwB3hcx'
    },
    {
        id: 2,
        client: 'Carlos Silva',
        service: 'Revitalização de Gramado',
        date: '05 Out 2023',
        before: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR7Fry_mNoDs6vgYQ0AUKxkHyuuuvavbOFsdJaY-NcszSLCn8UNM3lUJgNT_lncMV2qxrjwngH8GCfZA836BtyXJUx6wvKG-Ik5_-LdtFPW8lONG-4URaqcGzkE94sy1W2fLrYNTs7UaZVXVOZLi6o7IgHoRL7laIbUtlX38dWwjO8rro9sSpCLnG1gIftgrRzLHkZeUlGjSHSq5xp18-jG_bGaNW2hKpRs_dVnGJI5aiA2Ax1rS66wXk6D6YGtLG2JnY5JfWFB8Ap',
        after: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXvMyFDs4UgDv1SR_UikLiJbMxotV23YIj-AZWgi6mEqpRCxxjBSt0CrgcWo6FK_GlWet5ITRcIZ50H_lCWn16Y6ADk1ARVOtnjiyoB6dWrTtasmiWgGYDX8NBZ30rPCkY25pv3r8Spv0BYcSEZC7F0du3BFFLGkbuBupAp5sSdM_aT4i3u2xBgw8xxzRhbnHl0zIdQiCT_KDHztRPTLmbpIc8E6XYf4V0nZQBeDcXVH2AGaVWK32nemM5y8hx4f0vnFC4H2U5svlp'
    }
];

export default function GalleryPage() {
    const router = useRouter();
    const [projects, setProjects] = useState(initialProjects);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [clientName, setClientName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);

    const beforeInputRef = useRef<HTMLInputElement>(null);
    const afterInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'before') setBeforeImage(url);
            else setAfterImage(url);
        }
    };

    const handleShare = (project: any) => {
        const shareText = `Confira esse Antes e Depois incrível!\nCliente: ${project.client}\nServiço: ${project.service}\nData: ${project.date}`;

        if (navigator.share) {
            navigator.share({
                title: 'Garden Dante - Antes e Depois',
                text: shareText,
            }).catch(console.error);
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleSaveProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName || !serviceName || !beforeImage || !afterImage) {
            alert("Por favor, preencha todos os campos e adicione as duas fotos.");
            return;
        }

        const newProject = {
            id: Date.now(),
            client: clientName,
            service: serviceName,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' ').replace('.', ''),
            before: beforeImage,
            after: afterImage
        };

        setProjects([newProject, ...projects]);
        setIsUploadModalOpen(false);
        setClientName('');
        setServiceName('');
        setBeforeImage(null);
        setAfterImage(null);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col pb-24">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
                    <button onClick={() => router.back()} className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Galeria Antes & Depois</h1>
                </div>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto">
                <div className="px-4 py-4">
                    <div className="flex w-full items-center rounded-xl bg-slate-200/50 dark:bg-primary/10 border border-transparent focus-within:border-primary/50 transition-all">
                        <div className="text-primary flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="w-full border-none bg-transparent focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-primary/50 py-3 px-3 text-base font-normal"
                            placeholder="Filtrar por nome do cliente"
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6 px-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-primary/5 rounded-xl overflow-hidden border border-slate-200 dark:border-primary/10 shadow-sm">
                            <div className="p-4 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{project.client}</h3>
                                    <p className="text-sm text-slate-500 dark:text-primary/70">{project.service}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleShare(project)} className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">share</span>
                                    </button>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary flex-shrink-0">{project.date}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 px-4 pb-4">
                                <div className="relative aspect-square rounded-lg overflow-hidden group">
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Antes</div>
                                    <div
                                        className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${project.before}')` }}
                                    ></div>
                                </div>
                                <div className="relative aspect-square rounded-lg overflow-hidden group">
                                    <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">Depois</div>
                                    <div
                                        className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${project.after}')` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <button onClick={() => setIsUploadModalOpen(true)} className="fixed bottom-24 right-6 size-14 bg-primary text-slate-900 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-20">
                <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
            </button>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-background-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background-light dark:bg-[#152e15] border border-primary/20 w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-primary/10">
                            <h2 className="text-lg font-bold">Adicionar Projeto</h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="rounded-full p-2 hover:bg-primary/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProject} className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliente</label>
                                <input required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nome do cliente" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Serviço Realizado</label>
                                <input required value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full bg-slate-100 dark:bg-[#193319] border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Poda drástica..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {/* Before Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Antes</label>
                                    <div
                                        onClick={() => beforeInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors overflow-hidden relative"
                                    >
                                        {beforeImage ? (
                                            <img src={beforeImage} alt="Antes" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Camera className="w-8 h-8 text-primary/60 mb-2" />
                                                <span className="text-xs text-primary/80 font-medium">Adicionar</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={beforeInputRef}
                                            onChange={(e) => handleImageUpload(e, 'before')}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* After Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Depois</label>
                                    <div
                                        onClick={() => afterInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors overflow-hidden relative"
                                    >
                                        {afterImage ? (
                                            <img src={afterImage} alt="Depois" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 text-primary/60 mb-2" />
                                                <span className="text-xs text-primary/80 font-medium">Adicionar</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={afterInputRef}
                                            onChange={(e) => handleImageUpload(e, 'after')}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-background-dark font-bold text-lg rounded-xl mt-4 py-3.5 hover:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
                                Salvar Projeto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
