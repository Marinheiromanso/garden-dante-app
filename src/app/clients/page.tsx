'use client';

import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, MoreVertical, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialClients = [
    { id: 1, name: 'Alice Johnson', phone: '+55 11 99999-9999', email: 'alice@example.com', address: 'Rua das Flores, 123', lastVisit: '2 dias atrás' },
    { id: 2, name: 'Smith Estate', phone: '+55 11 88888-8888', email: 'contact@smithestate.com', address: 'Av. Paulista, 1000', lastVisit: '1 semana atrás' },
    { id: 3, name: 'Roberto Silva', phone: '+55 11 77777-7777', email: 'roberto@gmail.com', address: 'Rua Augusta, 500', lastVisit: 'Ontem' },
];

export default function ClientContacts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients] = useState(initialClients);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden font-display">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 border-b border-primary/20">
                <h2 className="text-xl font-bold leading-tight tracking-tight flex-1">Meus Clientes</h2>
                <button onClick={() => alert('Abrir modal de Novo Cliente')} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4 sticky top-[53px] bg-background-light dark:bg-background-dark z-10">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-primary/20 bg-primary/5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4 rounded-l-xl">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none pl-2 text-base font-normal leading-normal"
                            placeholder="Pesquisar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            {/* Client List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
                {filteredClients.map((client) => (
                    <div key={client.id} onClick={() => alert(`Visualizando detalhes de ${client.name}`)} className="flex gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors justify-between items-center group relative cursor-pointer active:scale-[0.99] shadow-sm">
                        <div className="flex items-start gap-4 w-full">
                            <div className="rounded-full h-16 w-16 bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary/20 shrink-0 shadow-sm">
                                <img
                                    className="h-full w-full object-cover"
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=13ec13&color=102210`}
                                    alt={client.name}
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-center min-w-0 pr-2">
                                <div className="flex items-center justify-between mb-0.5 w-full">
                                    <p className="text-base font-semibold leading-normal truncate">{client.name}</p>
                                    <a
                                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm transition-transform hover:scale-110 active:scale-95 shrink-0"
                                    >
                                        <svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                                        </svg>
                                    </a>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 mb-0.5 truncate">
                                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">local_florist</span>
                                    <span className="truncate">Manutenção de Jardim</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                                    <span className="material-symbols-outlined text-[14px] shrink-0">location_on</span>
                                    <span className="truncate">{client.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            <button onClick={() => alert('Adicionar novo cliente')} className="fixed bottom-24 right-4 z-30 flex items-center justify-center w-14 h-14 bg-primary text-background-dark rounded-full shadow-lg hover:bg-opacity-90 transition-transform active:scale-95 group">
                <span className="material-symbols-outlined text-[28px]">person_add</span>
            </button>
        </div>
    );
}
