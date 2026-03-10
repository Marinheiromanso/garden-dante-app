'use client';

import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, MoreVertical, MessageSquare, Users, Edit2, Trash2, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Client = {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    lastVisit: string;
    notes?: string;
};

const initialClients: Client[] = [
    { id: 1, name: 'Alice Johnson', phone: '11999999999', email: 'alice@example.com', address: 'Rua das Flores, 123', lastVisit: '2 dias atrás', notes: 'Gosta de flores amarelas.' },
    { id: 2, name: 'Smith Estate', phone: '11888888888', email: 'contact@smithestate.com', address: 'Av. Paulista, 1000', lastVisit: '1 semana atrás', notes: 'Contato apenas comercial.' },
    { id: 3, name: 'Roberto Silva', phone: '11777777777', email: 'roberto@gmail.com', address: 'Rua Augusta, 500', lastVisit: 'Ontem', notes: 'Cão bravo no quintal.' },
];

export default function ClientContacts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add' | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({});

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAddModal = () => {
        setFormData({});
        setModalMode('add');
    };

    const handleOpenEditModal = (client: Client) => {
        setFormData(client);
        setModalMode('edit');
    };

    const handleOpenViewModal = (client: Client) => {
        setSelectedClient(client);
        setModalMode('view');
    };

    const handleCloseModal = () => {
        setModalMode(null);
        setSelectedClient(null);
        setFormData({});
    };

    const handleSaveClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'add') {
            const newClient = {
                ...formData,
                id: Date.now(),
                lastVisit: 'Novo Cliente',
            } as Client;
            setClients([...clients, newClient]);
        } else if (modalMode === 'edit') {
            setClients(clients.map(c => c.id === formData.id ? formData as Client : c));
        }
        handleCloseModal();
    };

    const handleDeleteClient = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            setClients(clients.filter(c => c.id !== id));
            handleCloseModal();
        }
    };

    const formatPhoneForDisplay = (phone: string) => {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden font-display">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 border-b border-primary/20">
                <h2 className="text-xl font-bold leading-tight tracking-tight flex-1">Meus Clientes</h2>
                <button onClick={handleOpenAddModal} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors active:scale-95">
                    <span className="material-symbols-outlined">person_add</span>
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
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-24">
                {filteredClients.map((client) => (
                    <div key={client.id} onClick={() => handleOpenViewModal(client)} className="flex gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors justify-between items-center group relative cursor-pointer active:scale-[0.99] shadow-sm">
                        <div className="flex items-start gap-4 w-full">
                            <div className="rounded-full h-16 w-16 bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary/20 shrink-0 shadow-sm relative">
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
            <button onClick={handleOpenAddModal} className="fixed bottom-24 right-4 z-30 flex items-center justify-center w-14 h-14 bg-primary text-background-dark rounded-full shadow-lg hover:bg-opacity-90 transition-transform active:scale-95 group">
                <span className="material-symbols-outlined text-[28px]">person_add</span>
            </button>

            {/* View Details Modal */}
            {modalMode === 'view' && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-background-light dark:bg-[#152e15] border border-primary/20 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Detalhes do Cliente</h2>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEditModal(selectedClient)} className="rounded-full p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button onClick={handleCloseModal} className="rounded-full p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col items-center">
                            <img
                                className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-md mb-4"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedClient.name)}&background=13ec13&color=102210&size=128`}
                                alt={selectedClient.name}
                            />
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{selectedClient.name}</h3>
                            <p className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-6">Última Visita: {selectedClient.lastVisit}</p>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#193319] rounded-xl border border-slate-200 dark:border-primary/10">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Telefone</p>
                                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{formatPhoneForDisplay(selectedClient.phone)}</p>
                                    </div>
                                    <a
                                        href={`https://wa.me/55${selectedClient.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(selectedClient.name)},%20aqui%20é%20da%20Garden%20Dante!`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 w-10 flex items-center justify-center bg-[#25D366] text-white rounded-full hover:scale-105 transition-transform"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </a>
                                </div>

                                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#193319] rounded-xl border border-slate-200 dark:border-primary/10">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Endereço</p>
                                        <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{selectedClient.address}</p>
                                    </div>
                                </div>

                                {selectedClient.email && (
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#193319] rounded-xl border border-slate-200 dark:border-primary/10">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                            <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{selectedClient.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4 p-3 bg-primary/5 rounded-xl border border-primary/20 pb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-[20px]">notes</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Anotações do Cliente</p>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                                            {selectedClient.notes || "Nenhuma anotação..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(modalMode === 'add' || modalMode === 'edit') && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-background-light dark:bg-[#152e15] border border-primary/20 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {modalMode === 'add' ? <><Plus className="w-6 h-6 text-primary" /> Novo Cliente</> : <><Edit2 className="w-6 h-6 text-primary" /> Editar Cliente</>}
                            </h2>
                            <button onClick={handleCloseModal} className="rounded-full p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveClient} className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                                <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100" placeholder="Ex: Roberto Carlos" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Telefone (WhatsApp)</label>
                                <input required type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100" placeholder="Ex: 11999999999" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">E-mail <span className="text-slate-400 font-normal">(Opcional)</span></label>
                                <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100" placeholder="Ex: email@dominio.com" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Endereço do Local</label>
                                <input required value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100" placeholder="Ex: Rua das Flores, 123" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Anotações / Preferências</label>
                                <textarea rows={3} value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-slate-100 dark:bg-[#193319] border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100 resize-none" placeholder="Ex: Gosta de rosas brancas, tem um cachorro..." />
                            </div>

                            <div className="flex gap-3 mt-4">
                                {modalMode === 'edit' && formData.id && (
                                    <button type="button" onClick={() => handleDeleteClient(formData.id!)} className="w-14 shrink-0 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors active:scale-95">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button type="submit" className="flex-1 bg-primary text-background-dark font-bold text-lg rounded-xl py-3.5 hover:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
                                    {modalMode === 'add' ? 'Adicionar Cliente' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
