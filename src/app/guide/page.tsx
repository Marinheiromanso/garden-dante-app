'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const seasons = ['Primavera', 'Verão', 'Outono', 'Inverno'];

const seasonalData: Record<string, { highlights: { id: number, title: string, desc: string, icon: string }[], guides: { id: number, title: string, sub: string, img: string }[] }> = {
    'Primavera': {
        highlights: [
            { id: 1, title: 'Adubação para Floração', desc: 'Use fertilizantes ricos em fósforo para estimular novas flores.', icon: 'eco' },
            { id: 2, title: 'Aumento de Regas', desc: 'Com as temperaturas subindo, as plantas precisam de hidratação mais frequente.', icon: 'water_drop' },
            { id: 3, title: 'Cuidado com Pragas', desc: 'O clima quente e úmido atrai pulgões. Inspecione brotos novos regularmente.', icon: 'pest_control' }
        ],
        guides: [
            { id: 1, title: 'Orquídeas', sub: 'Cuidados na floração', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXsw9bLxpOkuB-6M_3KWJWKgavyspi-6XaaX2W7FqvlGLF0ixr_kIYXpPtur9CB3wNQU6Uyh4au4lfoN3HuAhJM5Qf0eaxRQq0KvscnQg1cdGCflsGsSIwiCXALwnPXMcssIiC8ZudPbhOEcnegPFiP5KBSMdWt5lnymwvk12_njoUYt8oK2sNLRtzHfqaSvs-twL9GVXPRrIfXfEqRin-XK3Rveu2wbUoPBgoFKiUJ3RclPDz2KmDoeCl8Fc9asaUDNPuRHxrN_Ic' },
            { id: 2, title: 'Mudas', sub: 'Época ideal para plantio', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY6Gs4VgkwAf4FOQjrosY9dcihQtAxNGdGlwN_V_IAS79Qt2oonHpmd9zKCQX7cx9dvcaDVMTJmM7pslNzg_NMcJyHISDN7AoP5xxaIrVcz29ZzHfSbLCxLr99Xgmy-_t7MVwi_T_QgQiWfU8PJHqlskt3XG9o9JMs5AaWi7n7eEppo58yPGD616vfHxoi48eh-90xyPjwItybOcqpwCZSSKx1gmtlh909vLQ5anTtsSFOkAGEqQa3TjvPhtoKw-YNCiOzRnrL6TgJ' }
        ]
    },
    'Verão': {
        highlights: [
            { id: 1, title: 'Rega Abundante', desc: 'Regue cedo ou no fim da tarde para evitar evaporação e queima das folhas.', icon: 'water_drop' },
            { id: 2, title: 'Proteção Solar', desc: 'Plantas jovens e de meia-sombra precisam de sombrite ou mudanças de local.', icon: 'wb_sunny' },
            { id: 3, title: 'Poda de Limpeza', desc: 'Remova flores murchas para poupar a energia da planta no calor.', icon: 'content_cut' }
        ],
        guides: [
            { id: 1, title: 'Gramados', sub: 'Manutenção de Verão', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrNTx1iqJ-Wjclv0FaFm8WZJK-jaOEwUcPYeVXT9wjrLo5L8z-qmw9LLBoKsI4DHZOSPi1VY8rzjRlULH_8SoU_EPh52f1r5EJtEWQCFAmTP2I6CKwkK-12j-0bnAQ0Mpf8K4KLY1bXaUEt99RWEKqcAGRRjUfZT8tpY9Su4xJk316o1VX8bNpPTo8tQxS0mj4x-ZNIcpQ9qmoUDXBW6ufGtozgoFqs_l5KwrSznWEAr7vV7OoWhKT4kVXhKsFfmg-zmZM16w5sE-5' },
            { id: 2, title: 'Tropicais', sub: 'Lidando com calor', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXsw9bLxpOkuB-6M_3KWJWKgavyspi-6XaaX2W7FqvlGLF0ixr_kIYXpPtur9CB3wNQU6Uyh4au4lfoN3HuAhJM5Qf0eaxRQq0KvscnQg1cdGCflsGsSIwiCXALwnPXMcssIiC8ZudPbhOEcnegPFiP5KBSMdWt5lnymwvk12_njoUYt8oK2sNLRtzHfqaSvs-twL9GVXPRrIfXfEqRin-XK3Rveu2wbUoPBgoFKiUJ3RclPDz2KmDoeCl8Fc9asaUDNPuRHxrN_Ic' }
        ]
    },
    'Outono': {
        highlights: [
            { id: 1, title: 'Folhas Secas', desc: 'Mantenha a base limpa para não acumular fungos devido à umidade das folhas mortas.', icon: 'eco' },
            { id: 2, title: 'Redução na Rega', desc: 'A evaporação diminui. Não encharque o solo e espace as regas gradativamente.', icon: 'opacity' },
            { id: 3, title: 'Adubo de Resistência', desc: 'Use potássio e cálcio nas plantas para fortalecer as raízes antes do frio.', icon: 'vaccines' }
        ],
        guides: [
            { id: 1, title: 'Preparo Solo', sub: 'Adubação de Outono', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY6Gs4VgkwAf4FOQjrosY9dcihQtAxNGdGlwN_V_IAS79Qt2oonHpmd9zKCQX7cx9dvcaDVMTJmM7pslNzg_NMcJyHISDN7AoP5xxaIrVcz29ZzHfSbLCxLr99Xgmy-_t7MVwi_T_QgQiWfU8PJHqlskt3XG9o9JMs5AaWi7n7eEppo58yPGD616vfHxoi48eh-90xyPjwItybOcqpwCZSSKx1gmtlh909vLQ5anTtsSFOkAGEqQa3TjvPhtoKw-YNCiOzRnrL6TgJ' },
            { id: 2, title: 'Bulbos', sub: 'Plantio das espécies', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrNTx1iqJ-Wjclv0FaFm8WZJK-jaOEwUcPYeVXT9wjrLo5L8z-qmw9LLBoKsI4DHZOSPi1VY8rzjRlULH_8SoU_EPh52f1r5EJtEWQCFAmTP2I6CKwkK-12j-0bnAQ0Mpf8K4KLY1bXaUEt99RWEKqcAGRRjUfZT8tpY9Su4xJk316o1VX8bNpPTo8tQxS0mj4x-ZNIcpQ9qmoUDXBW6ufGtozgoFqs_l5KwrSznWEAr7vV7OoWhKT4kVXhKsFfmg-zmZM16w5sE-5' }
        ]
    },
    'Inverno': {
        highlights: [
            { id: 1, title: 'Poda Drástica', desc: 'Melhor época para podar árvores decíduas que perdem folhas e entram em dormência.', icon: 'account_tree' },
            { id: 2, title: 'Proteção Térmica', desc: 'Use coberturas (mulch/cascas) no solo para manter raízes seguras de geadas.', icon: 'ac_unit' },
            { id: 3, title: 'Menos Água', desc: 'As plantas quase não consomem água; as regas caem mais que pela metade.', icon: 'water_drop' }
        ],
        guides: [
            { id: 1, title: 'Frutíferas', sub: 'Poda de Formação', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXsw9bLxpOkuB-6M_3KWJWKgavyspi-6XaaX2W7FqvlGLF0ixr_kIYXpPtur9CB3wNQU6Uyh4au4lfoN3HuAhJM5Qf0eaxRQq0KvscnQg1cdGCflsGsSIwiCXALwnPXMcssIiC8ZudPbhOEcnegPFiP5KBSMdWt5lnymwvk12_njoUYt8oK2sNLRtzHfqaSvs-twL9GVXPRrIfXfEqRin-XK3Rveu2wbUoPBgoFKiUJ3RclPDz2KmDoeCl8Fc9asaUDNPuRHxrN_Ic' },
            { id: 2, title: 'Hortênsias', sub: 'Poda Inverno', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY6Gs4VgkwAf4FOQjrosY9dcihQtAxNGdGlwN_V_IAS79Qt2oonHpmd9zKCQX7cx9dvcaDVMTJmM7pslNzg_NMcJyHISDN7AoP5xxaIrVcz29ZzHfSbLCxLr99Xgmy-_t7MVwi_T_QgQiWfU8PJHqlskt3XG9o9JMs5AaWi7n7eEppo58yPGD616vfHxoi48eh-90xyPjwItybOcqpwCZSSKx1gmtlh909vLQ5anTtsSFOkAGEqQa3TjvPhtoKw-YNCiOzRnrL6TgJ' }
        ]
    }
};

export default function SeasonalCareGuide() {
    const router = useRouter();
    const [activeSeason, setActiveSeason] = useState('Outono');

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto pb-24">
                <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 backdrop-blur-md">
                    <button onClick={() => router.back()} className="flex size-12 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full text-slate-900 dark:text-slate-100 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold flex-1 text-center pr-12">Cuidados Sazonais</h2>
                </header>

                <div className="pb-3 sticky top-14 bg-background-light dark:bg-background-dark z-10">
                    <div className="flex border-b border-primary/20 px-4 justify-between">
                        {seasons.map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveSeason(s)}
                                className={`flex flex-col items-center justify-center border-b-[3px] transition-colors text-sm font-bold pb-[13px] pt-4 flex-1 ${activeSeason === s ? 'border-primary text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-3">
                    <div className="flex w-full items-stretch rounded-xl h-12 bg-primary/10">
                        <div className="text-primary flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="flex w-full bg-transparent border-none focus:ring-0 px-4 text-base placeholder:text-slate-500"
                            placeholder="Pesquisar plantas, guias..."
                        />
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <h3 className="text-lg font-bold pb-3 pt-2">Destaques do {activeSeason}</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {seasonalData[activeSeason]?.highlights.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base mb-1">{item.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-4 pb-6">
                    <h3 className="text-lg font-bold pb-3 pt-2">Guias Populares</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                        {seasonalData[activeSeason]?.guides.map((guide) => (
                            <div key={guide.id} className="min-w-[160px] flex flex-col gap-2 snap-start">
                                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl mb-2 overflow-hidden relative">
                                    <img src={guide.img} alt={guide.title} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-base font-medium leading-normal">{guide.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{guide.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
