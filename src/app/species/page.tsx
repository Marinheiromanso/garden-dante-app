'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type PlantCategory = 'ornamental' | 'frutífera' | 'suculenta' | 'tropical' | 'hortaliça' | 'árvore';

type Plant = {
    id: number;
    name: string;
    scientificName: string;
    category: PlantCategory;
    image: string;
    light: string;
    water: string;
    soil: string;
    temperature: string;
    description: string;
    care: string[];
    commonPests: string[];
};

const categoryIcons: Record<PlantCategory, { icon: string; label: string }> = {
    ornamental: { icon: 'local_florist', label: 'Ornamental' },
    'frutífera': { icon: 'nutrition', label: 'Frutífera' },
    suculenta: { icon: 'grass', label: 'Suculenta' },
    tropical: { icon: 'forest', label: 'Tropical' },
    'hortaliça': { icon: 'spa', label: 'Hortaliça' },
    'árvore': { icon: 'park', label: 'Árvore' },
};

const plantsDatabase: Plant[] = [
    {
        id: 1, name: 'Rosa', scientificName: 'Rosa spp.', category: 'ornamental',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=400&fit=crop',
        light: 'Sol pleno (6h+)', water: '3x por semana', soil: 'Rico em matéria orgânica, bem drenado', temperature: '15-30°C',
        description: 'Rainha das flores, cultivada há milênios. Existem milhares de variedades com diferentes cores e fragrâncias.',
        care: ['Podar galhos secos após floração', 'Adubar a cada 30 dias com NPK', 'Manter solo úmido, nunca encharcado', 'Retirar folhas amareladas regularmente'],
        commonPests: ['Pulgões', 'Oídio', 'Ferrugem', 'Cochonilha'],
    },
    {
        id: 2, name: 'Samambaia', scientificName: 'Nephrolepis exaltata', category: 'ornamental',
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
        light: 'Sombra parcial', water: 'Diária (manter úmida)', soil: 'Rico em húmus, leve', temperature: '18-25°C',
        description: 'Uma das plantas mais populares do Brasil. Ideal para varandas e áreas sombreadas. Purifica o ar naturalmente.',
        care: ['Borrifar água nas folhas diariamente', 'Nunca deixar o solo secar completamente', 'Adubar com húmus de minhoca mensal', 'Remover frondes secas com tesoura limpa'],
        commonPests: ['Cochonilha', 'Lesmas', 'Ácaros'],
    },
    {
        id: 3, name: 'Limoeiro', scientificName: 'Citrus limon', category: 'frutífera',
        image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop',
        light: 'Sol pleno (8h+)', water: '2-3x por semana', soil: 'Arenoso com boa drenagem', temperature: '20-35°C',
        description: 'Frutífera cítrica versátil, produz frutos o ano todo. Pode ser cultivada em vasos grandes ou no solo.',
        care: ['Podar ramos improdutivos no inverno', 'Adubar com NPK rico em nitrogênio', 'Irrigar profundamente mas sem encharcar', 'Proteger de ventos fortes'],
        commonPests: ['Mosca-branca', 'Cochonilha', 'Ácaro-da-leprose', 'Pulgão-preto'],
    },
    {
        id: 4, name: 'Suculenta Echeveria', scientificName: 'Echeveria elegans', category: 'suculenta',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
        light: 'Sol pleno a meia-sombra', water: '1x por semana (verão)', soil: 'Arenoso com excelente drenagem', temperature: '10-35°C',
        description: 'Suculenta em formato de roseta com folhas carnudas verde-azuladas. Fácil cultivo e manutenção mínima.',
        care: ['Regar somente quando o solo estiver seco', 'Usar vaso com furo de drenagem obrigatório', 'Não molhar as folhas diretamente', 'Propagar por folhas destacadas'],
        commonPests: ['Cochonilha-algodão', 'Pulgões', 'Fungos por excesso de água'],
    },
    {
        id: 5, name: 'Palmeira-ráfis', scientificName: 'Rhapis excelsa', category: 'tropical',
        image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=400&fit=crop',
        light: 'Meia-sombra', water: '2-3x por semana', soil: 'Fértil, com boa drenagem', temperature: '15-30°C',
        description: 'Palmeira elegante de interior. Cresce lentamente e é perfeita para decoração de ambientes internos e varandas.',
        care: ['Limpar folhas com pano úmido mensalmente', 'Evitar sol direto intenso', 'Adubar na primavera e verão', 'Transplantar a cada 2 anos'],
        commonPests: ['Ácaros', 'Cochonilha', 'Tripes'],
    },
    {
        id: 6, name: 'Manjericão', scientificName: 'Ocimum basilicum', category: 'hortaliça',
        image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=400&fit=crop',
        light: 'Sol pleno (4-6h)', water: 'Diária (manhã)', soil: 'Fértil, leve e bem drenado', temperature: '20-30°C',
        description: 'Erva aromática essencial na culinária. Fácil de cultivar em vasos e hortas. Atrai polinizadores benéficos.',
        care: ['Colher folhas de cima para baixo', 'Retirar flores para prolongar produção', 'Regar pela manhã, evitar molhar folhas', 'Renovar a planta a cada 6 meses'],
        commonPests: ['Lesmas', 'Pulgões', 'Mosca-branca'],
    },
    {
        id: 7, name: 'Ipê-amarelo', scientificName: 'Handroanthus albus', category: 'árvore',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop',
        light: 'Sol pleno', water: '1-2x por semana (jovem)', soil: 'Tolerante, preferência por argiloso', temperature: '15-35°C',
        description: 'Árvore símbolo do Brasil. Floração espetacular no inverno/primavera com flores amarelo-douradas. Porte médio a grande.',
        care: ['Poda de formação nos primeiros anos', 'Irrigar regularmente quando jovem', 'Adubar anualmente com composto orgânico', 'Espaço mínimo de 5m do muro/calçada'],
        commonPests: ['Broca-do-ipê', 'Formigas cortadeiras', 'Serradores'],
    },
    {
        id: 8, name: 'Orquídea Phalaenopsis', scientificName: 'Phalaenopsis spp.', category: 'ornamental',
        image: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400&h=400&fit=crop',
        light: 'Luz indireta brilhante', water: '1-2x por semana', soil: 'Casca de pinus + esfagno', temperature: '18-28°C',
        description: 'A orquídea mais popular do mundo. Flores duradouras que podem permanecer por meses. Ideal para ambientes internos.',
        care: ['Regar por imersão 15min semanal', 'Nunca deixar água acumulada na base', 'Fertilizar quinzenalmente na primavera', 'Replantar a cada 2 anos em substrato novo'],
        commonPests: ['Cochonilha', 'Lesmas', 'Podridão negra', 'Fungos'],
    },
    {
        id: 9, name: 'Costela-de-adão', scientificName: 'Monstera deliciosa', category: 'tropical',
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
        light: 'Luz indireta', water: '1-2x por semana', soil: 'Rico em matéria orgânica, drenado', temperature: '18-30°C',
        description: 'Planta tropical com folhas fenestradas icônicas. Tendência em decoração de interiores. Pode atingir grande porte.',
        care: ['Fornecer suporte (tutor de musgo)', 'Limpar folhas com pano úmido', 'Evitar sol direto nas folhas', 'Podar raízes aéreas se necessário'],
        commonPests: ['Tripes', 'Ácaros', 'Cochonilha', 'Podridão radicular'],
    },
    {
        id: 10, name: 'Tomate Cereja', scientificName: 'Solanum lycopersicum var. cerasiforme', category: 'hortaliça',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=400&fit=crop',
        light: 'Sol pleno (6-8h)', water: 'Diária', soil: 'Fértil, rico em composto orgânico', temperature: '20-30°C',
        description: 'Variedade compacta e produtiva. Ideal para vasos e hortas urbanas. Frutos doces e abundantes durante o verão.',
        care: ['Tutorar com estacas desde cedo', 'Remover brotos laterais (desbrota)', 'Adubar a cada 15 dias com NPK', 'Colher frutos maduros regularmente'],
        commonPests: ['Tuta absoluta', 'Mosca-branca', 'Pulgões', 'Requeima'],
    },
];

export default function SpeciesLibrary() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'todas'>('todas');
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

    const filteredPlants = plantsDatabase.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'todas' || plant.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Object.entries(categoryIcons);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Header */}
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md border-b border-primary/20">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center pr-12">Biblioteca de Espécies</h2>
                </header>

                {/* Search */}
                <div className="px-4 pt-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl opacity-40">search</span>
                        <input
                            type="text"
                            placeholder="Buscar planta pelo nome..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-[#152e15] rounded-xl pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex overflow-x-auto gap-2 px-4 py-4 hide-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('todas')}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0",
                            selectedCategory === 'todas'
                                ? "bg-primary text-slate-900 border-primary"
                                : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                        )}
                    >
                        <span className="material-symbols-outlined text-[16px]">apps</span>
                        Todas
                    </button>
                    {categories.map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key as PlantCategory)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0",
                                selectedCategory === key
                                    ? "bg-primary text-slate-900 border-primary"
                                    : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                            )}
                        >
                            <span className="material-symbols-outlined text-[16px]">{val.icon}</span>
                            {val.label}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <div className="px-4 mb-3">
                    <p className="text-xs opacity-50">{filteredPlants.length} espécie{filteredPlants.length !== 1 ? 's' : ''} encontrada{filteredPlants.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Plants Grid */}
                <div className="px-4 grid grid-cols-2 gap-3">
                    {filteredPlants.map(plant => (
                        <button
                            key={plant.id}
                            onClick={() => setSelectedPlant(plant)}
                            className="bg-white dark:bg-[#152e15] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left transition-all active:scale-[0.97] hover:border-primary/40"
                        >
                            <div
                                className="w-full aspect-square bg-cover bg-center"
                                style={{ backgroundImage: `url("${plant.image}")` }}
                            />
                            <div className="p-3">
                                <p className="text-sm font-bold truncate">{plant.name}</p>
                                <p className="text-[11px] italic opacity-50 truncate">{plant.scientificName}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="material-symbols-outlined text-[14px] text-primary">{categoryIcons[plant.category].icon}</span>
                                    <span className="text-[10px] text-primary font-medium">{categoryIcons[plant.category].label}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {filteredPlants.length === 0 && (
                    <div className="text-center py-16 opacity-50">
                        <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
                        <p className="text-sm">Nenhuma espécie encontrada.</p>
                    </div>
                )}
            </div>

            {/* Plant Detail Modal */}
            {selectedPlant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col" onClick={() => setSelectedPlant(null)}>
                    <div className="flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="min-h-full flex flex-col">
                            {/* Plant Image Hero */}
                            <div className="relative h-72 bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${selectedPlant.image}")` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                                <button onClick={() => setSelectedPlant(null)} className="absolute top-4 left-4 size-10 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                                            {categoryIcons[selectedPlant.category].label}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black">{selectedPlant.name}</h2>
                                    <p className="text-sm italic opacity-70">{selectedPlant.scientificName}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white dark:bg-background-dark rounded-t-2xl -mt-4 relative z-10 flex-1 p-5 pb-10">
                                {/* Quick Info Cards */}
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    <div className="bg-amber-500/10 rounded-xl p-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500">light_mode</span>
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">Luz</p>
                                            <p className="text-xs font-bold">{selectedPlant.light}</p>
                                        </div>
                                    </div>
                                    <div className="bg-sky-500/10 rounded-xl p-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sky-500">water_drop</span>
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">Rega</p>
                                            <p className="text-xs font-bold">{selectedPlant.water}</p>
                                        </div>
                                    </div>
                                    <div className="bg-lime-500/10 rounded-xl p-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lime-500">landscape</span>
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">Solo</p>
                                            <p className="text-xs font-bold leading-tight">{selectedPlant.soil}</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 rounded-xl p-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400">thermostat</span>
                                        <div>
                                            <p className="text-[10px] opacity-50 uppercase">Temperatura</p>
                                            <p className="text-xs font-bold">{selectedPlant.temperature}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">info</span>
                                        Sobre
                                    </h3>
                                    <p className="text-sm opacity-80 leading-relaxed">{selectedPlant.description}</p>
                                </div>

                                {/* Care Tips */}
                                <div className="mb-6">
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">eco</span>
                                        Cuidados Essenciais
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {selectedPlant.care.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-primary/5 rounded-xl p-3">
                                                <span className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0">check_circle</span>
                                                <p className="text-sm">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Common Pests */}
                                <div>
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-lg">pest_control</span>
                                        Pragas Comuns
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlant.commonPests.map((pest, i) => (
                                            <span key={i} className="text-xs font-medium bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full">
                                                {pest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
