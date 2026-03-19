'use client';

import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col pb-12">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
                    <Link href="/register" className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold flex-1 text-center pr-10">Termos e Condições</h1>
                </div>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col gap-8">
                {/* Header Banner */}
                <div className="rounded-2xl overflow-hidden relative h-36">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1450778869180-e77b1b79ede5?w=600&q=80")' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/60 to-background-dark/30" />
                    <div className="relative h-full flex items-end p-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-primary text-lg">description</span>
                                <p className="text-xs text-primary font-bold uppercase tracking-wider">Magic Garden</p>
                            </div>
                            <h3 className="text-lg font-black text-slate-100">Termos e Condições de Uso</h3>
                        </div>
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">gavel</span>
                        1. Aceitação dos Termos
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Ao acessar e usar o Magic Garden, você concorda em cumprir e ser regido por estes Termos e Condições. Se você não concordar com qualquer parte destes termos, não deverá usar o aplicativo.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">shield_person</span>
                        2. Privacidade e Dados
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Sua privacidade é importante para nós. Coletamos apenas os dados necessários para o fornecimento de nossos serviços de gestão de jardinagem:
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 flex flex-col gap-2">
                        <li>Informações de contato (Nome, E-mail, WhatsApp).</li>
                        <li>Dados de clientes e propriedades para agendamentos e orçamentos.</li>
                        <li>Imagens enviadas para a galeria e scanner de IA.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">verified_user</span>
                        3. Uso do Serviço
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        O Magic Garden é uma ferramenta de auxílio à gestão. O usuário é responsável pela precisão das informações inseridas e pelo uso ético das funcionalidades, incluindo o respeito à privacidade de seus próprios clientes.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">update</span>
                        4. Alterações nos Termos
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas através do próprio aplicativo ou por e-mail.
                    </p>
                </section>

                <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10 text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-primary/60">
                        Última atualização: 09 de Março de 2026
                    </p>
                    <Link href="/register" className="inline-block mt-4 bg-primary text-slate-900 font-bold px-8 py-3 rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                        Entendido
                    </Link>
                </div>
            </main>
        </div>
    );
}
