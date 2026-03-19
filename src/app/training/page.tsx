'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type VideoCategory = 'poda' | 'produtos' | 'paisagismo' | 'pragas' | 'irrigacao' | 'todos';

type Video = {
    id: string;
    title: string;
    description: string;
    category: Exclude<VideoCategory, 'todos'>;
    duration: string;
    thumbnail: string;
    youtubeId: string;
    author: string;
    tags: string[];
    featured?: boolean;
};

const categoryConfig: Record<Exclude<VideoCategory, 'todos'>, { label: string; icon: string; color: string }> = {
    poda: { label: 'Poda', icon: 'content_cut', color: 'text-red-400 bg-red-500/10' },
    produtos: { label: 'Produtos', icon: 'inventory_2', color: 'text-amber-400 bg-amber-500/10' },
    paisagismo: { label: 'Paisagismo', icon: 'park', color: 'text-emerald-400 bg-emerald-500/10' },
    pragas: { label: 'Pragas', icon: 'pest_control', color: 'text-purple-400 bg-purple-500/10' },
    irrigacao: { label: 'Irrigação', icon: 'water_drop', color: 'text-sky-400 bg-sky-500/10' },
};

const videos: Video[] = [
    {
        id: 'v1', title: 'Poda de Formação em Frutíferas', description: 'Técnica profissional de poda para frutíferas jovens. Aprenda o corte correto para direcionamento de crescimento e máxima produtividade.',
        category: 'poda', duration: '8:42', thumbnail: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Prof. Ricardo Silva', tags: ['frutíferas', 'formação', 'técnica'], featured: true,
    },
    {
        id: 'v2', title: 'Como Afiar Tesoura de Poda', description: 'Tutorial completo de afiação de tesouras de poda com pedra e lima. Manter as ferramentas afiadas é essencial para cortes limpos.',
        category: 'poda', duration: '5:15', thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Canal Jardim Pro', tags: ['ferramentas', 'afiação', 'manutenção'],
    },
    {
        id: 'v3', title: 'Novos Adubos Orgânicos 2026', description: 'Análise dos melhores adubos orgânicos lançados este ano. Comparativo de eficiência, custo-benefício e facilidade de aplicação.',
        category: 'produtos', duration: '12:30', thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Agro Tech BR', tags: ['adubo', 'orgânico', 'lançamento'], featured: true,
    },
    {
        id: 'v4', title: 'Roçadeira: Troca de Óleo Passo a Passo', description: 'Manutenção preventiva da roçadeira. Aprenda quando e como trocar o óleo para prolongar a vida útil do motor.',
        category: 'produtos', duration: '6:48', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Mecânica Jardim', tags: ['roçadeira', 'manutenção', 'motor'],
    },
    {
        id: 'v5', title: 'Jardim Vertical: Tendência 2026', description: 'As últimas tendências em jardins verticais para áreas comerciais e residenciais. Materiais, plantas ideais e sistemas de irrigação.',
        category: 'paisagismo', duration: '15:20', thumbnail: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Paisagismo Moderno', tags: ['vertical', 'tendência', 'comercial'], featured: true,
    },
    {
        id: 'v6', title: 'Pergolado com Trepadeiras', description: 'Como projetar e executar pergolados com trepadeiras floríferas. Espécies indicadas e estrutura necessária.',
        category: 'paisagismo', duration: '10:05', thumbnail: 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Arq. Marina Costa', tags: ['pergolado', 'trepadeiras', 'projeto'],
    },
    {
        id: 'v7', title: 'Controle Biológico de Pulgões', description: 'Métodos naturais e eficientes para controlar pulgões sem agrotóxicos. Receitas caseiras e insetos aliados do jardineiro.',
        category: 'pragas', duration: '7:33', thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Bio Jardim', tags: ['pulgão', 'biológico', 'orgânico'],
    },
    {
        id: 'v8', title: 'Cochonilha: Identificação e Tratamento', description: 'Guia completo para identificar tipos de cochonilha e os tratamentos mais eficazes para cada espécie.',
        category: 'pragas', duration: '9:12', thumbnail: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Dr. Planta', tags: ['cochonilha', 'tratamento', 'identificação'],
    },
    {
        id: 'v9', title: 'Irrigação por Gotejamento DIY', description: 'Monte um sistema de irrigação por gotejamento caseiro e economize água. Materiais acessíveis e instalação simples.',
        category: 'irrigacao', duration: '11:45', thumbnail: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Irriga Fácil', tags: ['gotejamento', 'DIY', 'economia'], featured: true,
    },
    {
        id: 'v10', title: 'Automatização de Irrigação com Timer', description: 'Como instalar e programar timers de irrigação para automatizar a rega dos jardins dos seus clientes.',
        category: 'irrigacao', duration: '8:20', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Smart Garden', tags: ['automação', 'timer', 'programação'],
    },
    {
        id: 'v11', title: 'Poda Topiária para Iniciantes', description: 'Aprenda as formas básicas de topiária: esfera, cone e espiral. Ferramentas necessárias e passo a passo.',
        category: 'poda', duration: '13:55', thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Arte Verde', tags: ['topiária', 'iniciante', 'técnica'],
    },
    {
        id: 'v12', title: 'Gramado Perfeito: Passo a Passo', description: 'Do preparo do solo à manutenção mensal. Tutorial completo para entregar gramados impecáveis aos clientes.',
        category: 'paisagismo', duration: '18:30', thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80',
        youtubeId: 'dQw4w9WgXcQ', author: 'Gramados BR', tags: ['gramado', 'tutorial', 'manutenção'],
    },
];

export default function TrainingPage() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<VideoCategory>('todos');
    const [search, setSearch] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [savedVideos, setSavedVideos] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem('magicGardenSavedVideos');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const toggleSave = (videoId: string) => {
        const updated = savedVideos.includes(videoId) ? savedVideos.filter(id => id !== videoId) : [...savedVideos, videoId];
        setSavedVideos(updated);
        localStorage.setItem('magicGardenSavedVideos', JSON.stringify(updated));
    };

    const filteredVideos = videos.filter(v => {
        const matchesCategory = activeCategory === 'todos' || v.category === activeCategory;
        const matchesSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const featuredVideos = videos.filter(v => v.featured);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center">Treinamento</h2>
                    <div className="size-12" />
                </header>

                {/* Search */}
                <div className="mx-4 mt-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                        <span className="material-symbols-outlined text-lg opacity-40">search</span>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vídeos, técnicas..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
                        {search && (
                            <button onClick={() => setSearch('')} className="opacity-40 hover:opacity-80">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex overflow-x-auto gap-2 px-4 mt-3 pb-1 hide-scrollbar">
                    <button onClick={() => setActiveCategory('todos')} className={cn("flex-none px-4 py-2 rounded-full text-xs font-bold transition-all", activeCategory === 'todos' ? "bg-primary text-slate-900" : "bg-slate-100 dark:bg-slate-800 opacity-60")}>
                        Todos
                    </button>
                    {(Object.keys(categoryConfig) as Exclude<VideoCategory, 'todos'>[]).map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("flex-none px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1", activeCategory === cat ? "bg-primary text-slate-900" : "bg-slate-100 dark:bg-slate-800 opacity-60")}>
                            <span className="material-symbols-outlined text-sm">{categoryConfig[cat].icon}</span>
                            {categoryConfig[cat].label}
                        </button>
                    ))}
                </div>

                {/* Featured Section */}
                {activeCategory === 'todos' && !search && (
                    <div className="mt-6">
                        <h3 className="font-bold text-lg px-4 mb-3">Destaques</h3>
                        <div className="flex overflow-x-auto gap-4 px-4 pb-2 snap-x hide-scrollbar">
                            {featuredVideos.map(video => (
                                <button key={video.id} onClick={() => setSelectedVideo(video)} className="flex-none w-72 rounded-xl overflow-hidden bg-white dark:bg-[#152e15] border border-slate-200 dark:border-slate-800 shadow-sm snap-start text-left active:scale-[0.98] transition-transform">
                                    <div className="relative h-40">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${video.thumbnail}")` }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-primary text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                DESTAQUE
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="material-symbols-outlined text-slate-900 text-2xl ml-0.5">play_arrow</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-bold line-clamp-1">{video.title}</p>
                                        <p className="text-[10px] opacity-50 mt-0.5">{video.author}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                <div className="mt-6 px-4">
                    <h3 className="font-bold text-lg mb-3">
                        {activeCategory === 'todos' ? 'Todos os Vídeos' : categoryConfig[activeCategory as Exclude<VideoCategory, 'todos'>].label}
                        <span className="text-sm font-normal opacity-40 ml-2">({filteredVideos.length})</span>
                    </h3>

                    {filteredVideos.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                            <p className="text-sm">Nenhum vídeo encontrado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredVideos.map(video => {
                                const cat = categoryConfig[video.category];
                                const isSaved = savedVideos.includes(video.id);
                                return (
                                    <div key={video.id} className="bg-white dark:bg-[#152e15] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex">
                                        {/* Thumbnail */}
                                        <button onClick={() => setSelectedVideo(video)} className="relative w-32 shrink-0">
                                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${video.thumbnail}")` }} />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="size-8 bg-white/90 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-900 text-lg ml-0.5">play_arrow</span>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                {video.duration}
                                            </div>
                                        </button>
                                        {/* Info */}
                                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", cat.color)}>{cat.label}</span>
                                                </div>
                                                <button onClick={() => setSelectedVideo(video)} className="text-left">
                                                    <p className="text-sm font-bold line-clamp-2 leading-tight">{video.title}</p>
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[10px] opacity-40 truncate">{video.author}</p>
                                                <button onClick={() => toggleSave(video.id)} className="p-1 -mr-1">
                                                    <span className={cn("material-symbols-outlined text-lg", isSaved ? "text-primary" : "opacity-30")}>
                                                        {isSaved ? 'bookmark' : 'bookmark_border'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Detail Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedVideo(null)}>
                    <div className="bg-white dark:bg-[#152e15] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        {/* Video Thumbnail as Hero */}
                        <div className="relative h-52">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${selectedVideo.thumbnail}")` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <button onClick={() => setSelectedVideo(null)} className="absolute top-3 right-3 size-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedVideo.title)}`, '_blank')}
                                    className="size-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-red-600 text-4xl ml-1">play_arrow</span>
                                </button>
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">{selectedVideo.duration}</span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded", categoryConfig[selectedVideo.category].color)}>
                                        {categoryConfig[selectedVideo.category].label}
                                    </span>
                                    <span className="text-xs opacity-40">{selectedVideo.author}</span>
                                </div>
                                <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
                                <p className="text-sm opacity-60 mt-2 leading-relaxed">{selectedVideo.description}</p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {selectedVideo.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedVideo.title)}`, '_blank')}
                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Assistir no YouTube
                                </button>
                                <button onClick={() => toggleSave(selectedVideo.id)} className={cn("size-12 rounded-xl border-2 flex items-center justify-center transition-all", savedVideos.includes(selectedVideo.id) ? "border-primary bg-primary/10 text-primary" : "border-slate-200 dark:border-slate-700 opacity-60")}>
                                    <span className="material-symbols-outlined">{savedVideos.includes(selectedVideo.id) ? 'bookmark' : 'bookmark_border'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
