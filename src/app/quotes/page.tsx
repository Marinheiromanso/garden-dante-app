'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuoteGenerator() {
    const [selectedServices, setSelectedServices] = useState<string[]>(['poda', 'limpeza']);
    const [area, setArea] = useState(50);
    const [trees, setTrees] = useState(3);

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const services = [
        { id: 'poda', name: 'Poda de Árvores', price: 'R$ 45,00 / un', icon: 'content_cut', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop' },
        { id: 'adubacao', name: 'Adubação e Nutrição', price: 'R$ 15,00 / m²', icon: 'compost', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=200&h=200&fit=crop' },
        { id: 'limpeza', name: 'Limpeza de Resíduos', price: 'R$ 80,00 / carga', icon: 'cleaning_services', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop' },
    ];

    return (
        <div className="max-w-md mx-auto bg-background-light dark:bg-background-dark min-h-screen flex flex-col pb-24 font-display">
            <header className="flex items-center p-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
                <Link href="/" className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined align-middle">arrow_back</span>
                </Link>
                <h1 className="text-lg font-bold ml-2">Gerador de Orçamento</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                {/* Hero Banner */}
                <div className="rounded-2xl overflow-hidden relative h-32">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80")' }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 to-background-dark/40" />
                    <div className="relative h-full flex items-center p-5">
                        <div>
                            <p className="text-xs opacity-60 uppercase tracking-wider font-medium text-slate-100">Estimativa rápida</p>
                            <h3 className="text-lg font-black mt-1 text-slate-100">Monte seu Orçamento</h3>
                            <p className="text-xs opacity-60 mt-1 text-slate-300">Selecione os serviços e envie por WhatsApp</p>
                        </div>
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">potted_plant</span>
                        Selecione os Serviços
                    </h2>
                    <div className="space-y-3">
                        {services.map((service) => (
                            <label
                                key={service.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer overflow-hidden relative ${selectedServices.includes(service.id)
                                    ? 'border-primary/50 bg-primary/10'
                                    : 'border-primary/10 bg-primary/5 hover:bg-primary/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-lg bg-cover bg-center shrink-0 border border-primary/20" style={{ backgroundImage: `url("${service.image}")` }} />
                                    <div>
                                        <p className="font-medium">{service.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{service.price}</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => toggleService(service.id)}
                                    className="h-6 w-6 rounded border-primary/50 bg-transparent text-primary focus:ring-primary focus:ring-offset-background-dark"
                                />
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">straighten</span>
                        Detalhes da Área
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Área Estimada (m²)</label>
                            <input
                                type="number"
                                value={area}
                                onChange={(e) => setArea(Number(e.target.value))}
                                className="w-full bg-primary/5 border border-primary/20 rounded-lg p-3 focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Qtd de Árvores</label>
                            <input
                                type="number"
                                value={trees}
                                onChange={(e) => setTrees(Number(e.target.value))}
                                className="w-full bg-primary/5 border border-primary/20 rounded-lg p-3 focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-primary/10 p-6 rounded-2xl border border-primary/30">
                    <h3 className="text-sm uppercase tracking-wider font-bold text-primary mb-4 text-center">Resumo do Orçamento</h3>
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 italic">Poda ({trees}un)</span>
                            <span>R$ {(trees * 45).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 italic">Limpeza (1 carga)</span>
                            <span>R$ 80,00</span>
                        </div>
                        <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                            <span className="text-lg font-bold">Total Estimado</span>
                            <span className="text-2xl font-bold text-primary">R$ {(trees * 45 + 80).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const total = (trees * 45 + 80).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                            const text = `Olá! Segue a estimativa de orçamento do Garden Dante:\n\n` +
                                `- Poda (${trees}un): R$ ${(trees * 45).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                                `- Limpeza (1 carga): R$ 80,00\n\n` +
                                `*Total Estimado: R$ ${total}*\n\n` +
                                `Como podemos prosseguir?`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined">send</span>
                        Enviar Orçamento via WhatsApp
                    </button>
                </section>
            </main>
        </div>
    );
}
