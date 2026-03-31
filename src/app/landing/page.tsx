'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── SVG Icons (inline to avoid extra deps) ─── */
const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 1" }}>{name}</span>
);

/* ─── Animated counter ─── */
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{val.toLocaleString('pt-BR')}{suffix}</span>;
}

/* ─── Section wrapper with fade-in ─── */
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon name={icon} className="text-primary text-3xl" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ name, role, text, avatar }: { name: string; role: string; text: string; avatar: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => <Icon key={i} name="star" className="text-yellow-400 text-lg" />)}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed italic">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-slate-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({ name, price, period, features, highlight = false, cta }: { name: string; price: string; period: string; features: string[]; highlight?: boolean; cta: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl p-[1px] ${highlight ? 'bg-gradient-to-b from-primary to-primary/40' : 'bg-white/10'}`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/30">
          MAIS POPULAR
        </div>
      )}
      <div className={`rounded-2xl p-6 h-full flex flex-col ${highlight ? 'bg-[#0a1a0a]' : 'bg-white/5 backdrop-blur-sm'}`}>
        <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-4xl font-extrabold text-white">{price}</span>
          <span className="text-slate-400 text-sm">/{period}</span>
        </div>
        <div className="h-px bg-white/10 my-4" />
        <ul className="flex flex-col gap-3 mb-6 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <Icon name="check_circle" className="text-primary text-lg shrink-0 mt-px" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/register"
          className={`w-full py-3 rounded-xl font-bold text-center transition-all duration-300 ${
            highlight
              ? 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/30'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          }`}
        >
          {cta}
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
        <span className="text-white font-semibold text-sm pr-4">{question}</span>
        <Icon name={open ? 'remove' : 'add'} className="text-primary text-xl shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#060e06] text-white overflow-x-hidden">
      {/* ─── Floating Nav ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#060e06]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Icon name="eco" className="text-white text-xl" />
            </div>
            <span className="text-xl font-extrabold">Magic<span className="text-primary">Garden</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#how" className="hover:text-primary transition-colors">Como funciona</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Planos</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-white hover:text-primary transition-colors">Entrar</Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-primary text-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20">Começar Grátis</Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
            <Icon name={mobileMenu ? 'close' : 'menu'} className="text-2xl" />
          </button>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#060e06]/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-3">
                <a href="#features" onClick={() => setMobileMenu(false)} className="py-2 px-4 text-sm font-medium text-slate-300 hover:text-primary">Funcionalidades</a>
                <a href="#how" onClick={() => setMobileMenu(false)} className="py-2 px-4 text-sm font-medium text-slate-300 hover:text-primary">Como funciona</a>
                <a href="#pricing" onClick={() => setMobileMenu(false)} className="py-2 px-4 text-sm font-medium text-slate-300 hover:text-primary">Planos</a>
                <a href="#faq" onClick={() => setMobileMenu(false)} className="py-2 px-4 text-sm font-medium text-slate-300 hover:text-primary">FAQ</a>
                <div className="flex gap-2 mt-2">
                  <Link href="/login" className="flex-1 py-3 text-center text-sm font-semibold border border-white/10 rounded-xl hover:bg-white/5">Entrar</Link>
                  <Link href="/register" className="flex-1 py-3 text-center text-sm font-bold bg-primary text-black rounded-xl">Começar Grátis</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background image + effects */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#060e06]/85" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#060e06_70%)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left – Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-primary text-xs font-semibold">+2.500 jardineiros já usam</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
                Seu serviço de jardinagem no{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-emerald-300">
                  próximo nível
                </span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-md">
                Gerencie clientes, agende podas, gere orçamentos, escaneie plantas com IA e muito mais — tudo em um só app.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/register" className="group flex items-center justify-center gap-2 bg-primary text-black font-bold px-8 py-4 rounded-2xl text-base hover:brightness-110 transition-all shadow-xl shadow-primary/25">
                  Começar Grátis
                  <Icon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/10 transition-all">
                  <Icon name="play_circle" className="text-xl text-primary" />
                  Ver funcionalidades
                </a>
              </div>

              {/* Social proof mini */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['JM','AS','CF','RL','MP'].map((initials, i) => (
                    <div key={i} className="size-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border-2 border-[#060e06] flex items-center justify-center text-[10px] font-bold text-primary">
                      {initials}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="star" className="text-yellow-400 text-sm" />)}
                  </div>
                  <span className="text-slate-500 text-xs">4.9/5 de +350 avaliações</span>
                </div>
              </div>
            </motion.div>

            {/* Right – Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[60px] scale-90" />
                {/* Phone frame */}
                <div className="relative w-72 sm:w-80 bg-gradient-to-b from-white/10 to-white/5 rounded-[2.5rem] p-2 border border-white/10 shadow-2xl">
                  <div className="rounded-[2rem] overflow-hidden bg-[#102210]">
                    {/* Status bar */}
                    <div className="h-11 bg-[#152e15] flex items-center justify-center">
                      <div className="w-20 h-5 bg-black rounded-full" />
                    </div>
                    {/* Screen content preview */}
                    <div className="p-4 space-y-3">
                      {/* Header mock */}
                      <div className="flex items-center justify-between">
                        <div className="size-8 rounded-full bg-primary/20" />
                        <span className="text-sm font-bold text-white">Magic Garden</span>
                        <div className="size-8 rounded-full bg-primary/20" />
                      </div>
                      {/* Banner mock */}
                      <div className="h-28 rounded-xl bg-gradient-to-r from-primary/30 to-emerald-800/40 flex items-end p-3">
                        <div className="space-y-1">
                          <div className="h-2 w-16 bg-white/40 rounded" />
                          <div className="h-3 w-28 bg-white/70 rounded" />
                          <div className="h-2 w-32 bg-white/30 rounded" />
                        </div>
                      </div>
                      {/* Weather mock */}
                      <div className="flex items-center gap-3 bg-primary/10 rounded-xl p-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="light_mode" className="text-primary text-xl" />
                        </div>
                        <div>
                          <span className="text-white text-lg font-bold">28°C</span>
                          <p className="text-slate-400 text-xs">Ensolarado • São Paulo</p>
                        </div>
                      </div>
                      {/* Quick actions mock */}
                      <div className="grid grid-cols-4 gap-2">
                        {['calendar_month','photo_camera','psychiatry','person'].map((ic, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5">
                            <Icon name={ic} className="text-primary text-lg" />
                            <div className="h-1.5 w-8 bg-white/20 rounded" />
                          </div>
                        ))}
                      </div>
                      {/* Tasks mock */}
                      <div className="space-y-2">
                        {['Poda - Res. Silva','Manutenção - Jardim P.','Orçamento - Condomínio'].map((t, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Icon name="task_alt" className="text-primary text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-xs font-medium">{t}</div>
                              <div className="h-1.5 w-16 bg-white/10 rounded mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Bottom nav mock */}
                    <div className="h-16 bg-[#152e15]/80 flex items-center justify-around px-4 border-t border-white/5">
                      {['home','calendar_month','add_circle','photo_camera','person'].map((ic, i) => (
                        <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'text-primary' : 'text-slate-500'}`}>
                          <Icon name={ic} className="text-xl" />
                          <div className="h-1 w-4 bg-current rounded opacity-40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <Icon name="keyboard_arrow_down" className="text-slate-600 text-3xl" />
        </motion.div>
      </section>

      {/* ══════════ BRANDS / TRUST IMAGE BAR ══════════ */}
      <Section className="py-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80', label: 'Jardins Residenciais' },
              { src: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=400&q=80', label: 'Paisagismo Comercial' },
              { src: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&q=80', label: 'Manutenção de Áreas Verdes' },
              { src: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80', label: 'Poda & Plantio' },
            ].map((item, i) => (
              <div key={i} className="relative h-32 rounded-xl overflow-hidden group">
                <img src={item.src} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ SOCIAL PROOF BAR ══════════ */}
      <Section className="py-16 border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 2500, suffix: '+', label: 'Jardineiros ativos', icon: 'person' },
              { val: 45000, suffix: '+', label: 'Serviços gerenciados', icon: 'task_alt' },
              { val: 15000, suffix: '+', label: 'Plantas escaneadas', icon: 'psychiatry' },
              { val: 98, suffix: '%', label: 'Satisfação dos clientes', icon: 'sentiment_satisfied' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Icon name={item.icon} className="text-primary text-3xl mb-1" />
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  <Counter end={item.val} suffix={item.suffix} />
                </div>
                <span className="text-slate-500 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ FEATURES ══════════ */}
      <Section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Funcionalidades</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Tudo que você precisa,<br />em um só lugar</h2>
            <p className="text-slate-400 text-base">Ferramentas poderosas criadas especificamente para profissionais de jardinagem e paisagismo.</p>
          </div>

          {/* Feature hero image */}
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-12">
            <img src="/images/landing/features-banner.jpg" alt="Jardineiro profissional trabalhando" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060e06]/80 via-[#060e06]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 max-w-md">
              <h3 className="text-white text-xl sm:text-2xl font-extrabold">12 ferramentas profissionais</h3>
              <p className="text-white/60 text-sm mt-1">Tudo integrado para você focar no que importa: seus jardins.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard delay={0} icon="calendar_month" title="Agenda de Podas" desc="Calendário inteligente com lembretes automáticos. Nunca mais perca um serviço agendado." />
            <FeatureCard delay={0.1} icon="people" title="Gestão de Clientes" desc="CRM completo com histórico de visitas, contatos, endereços e notas de cada cliente." />
            <FeatureCard delay={0.2} icon="request_quote" title="Orçamentos Instantâneos" desc="Gere orçamentos profissionais em segundos com cálculo automático por área e tipo de serviço." />
            <FeatureCard delay={0.3} icon="psychiatry" title="Scanner de Plantas com IA" desc="Aponte a câmera, identifique a planta e receba diagnóstico de saúde com recomendações de tratamento." />
            <FeatureCard delay={0.4} icon="photo_library" title="Galeria Antes & Depois" desc="Documente seus projetos com fotos antes e depois. Perfeito para portfólio e mostrar aos clientes." />
            <FeatureCard delay={0.5} icon="route" title="Otimização de Rotas" desc="Planeje rotas otimizadas entre múltiplos clientes. Economize tempo e combustível." />
            <FeatureCard delay={0.6} icon="cloud" title="Alertas Climáticos" desc="Previsão do tempo em tempo real com alertas de geada, chuva forte, calor extremo e mais." />
            <FeatureCard delay={0.7} icon="calculate" title="Calculadora de Solo" desc="Calcule adubação e fertilização por m² com diferentes formatos de terreno e tipos de adubo." />
            <FeatureCard delay={0.8} icon="school" title="Vídeos de Treinamento" desc="Biblioteca de vídeos organizados por tema: poda, irrigação, paisagismo, controle de pragas." />
            <FeatureCard delay={0.9} icon="bar_chart" title="Relatórios Financeiros" desc="Acompanhe faturamento, despesas, lucro mensal e gere relatórios detalhados do seu negócio." />
            <FeatureCard delay={1.0} icon="inventory_2" title="Controle de Estoque" desc="Gerencie insumos como adubos, ferramentas e combustível com alertas de estoque baixo." />
            <FeatureCard delay={1.1} icon="berkshire" title="Guia Sazonal" desc="Dicas de cuidados específicos para cada estação do ano, com orientações para diferentes plantas." />
          </div>
        </div>
      </Section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <Section id="how" className="py-20 lg:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Como funciona</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Comece em 3 passos simples</h2>
            <p className="text-slate-400 text-base">Sem complicação, sem contratos. Comece a usar agora mesmo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

            {[
              { step: '01', icon: 'person_add', title: 'Crie sua conta', desc: 'Cadastro rápido e gratuito. Em menos de 1 minuto você já está dentro.' },
              { step: '02', icon: 'tune', title: 'Configure seu perfil', desc: 'Adicione seus clientes, serviços e preferências. O app se adapta ao seu estilo de trabalho.' },
              { step: '03', icon: 'rocket_launch', title: 'Comece a gerenciar', desc: 'Agende podas, gere orçamentos, escaneie plantas e tenha tudo sob controle.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="size-32 rounded-full bg-gradient-to-b from-primary/15 to-transparent flex items-center justify-center">
                    <div className="size-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon name={item.icon} className="text-primary text-4xl" />
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-black rounded-full size-8 flex items-center justify-center shadow-lg">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ APP SHOWCASE (Before/After + Scanner) ══════════ */}
      <Section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Scanner Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 lg:mb-32">
            <div className="order-2 lg:order-1">
              <span className="text-primary font-bold text-sm uppercase tracking-wider">Inteligência Artificial</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-5">Escaneie qualquer planta<br />com IA avançada</h2>
              <p className="text-slate-400 leading-relaxed mb-6">Basta apontar a câmera do celular para uma planta. Nossa IA identifica a espécie, analisa a saúde e sugere tratamentos personalizados.</p>
              <div className="space-y-4">
                {[
                  { icon: 'search', text: 'Identificação de espécie em segundos' },
                  { icon: 'health_and_safety', text: 'Diagnóstico de saúde: saudável, atenção ou crítico' },
                  { icon: 'medication', text: 'Recomendações de tratamento personalizadas' },
                  { icon: 'history', text: 'Histórico de diagnósticos de cada planta' },
                ].map((item,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon name={item.icon} className="text-primary text-xl" />
                    </div>
                    <span className="text-slate-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-[40px]" />
                <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl p-5 border border-white/10">
                  <div className="w-64 sm:w-72 bg-[#102210] rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center gap-2 border-b border-white/5">
                      <Icon name="psychiatry" className="text-primary" />
                      <span className="text-white font-bold text-sm">Scanner de Plantas</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-40 rounded-xl overflow-hidden relative border border-white/5">
                        <img src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80" alt="Planta sendo analisada" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="relative">
                            <div className="size-16 rounded-full border-2 border-primary/60 flex items-center justify-center animate-pulse bg-black/20 backdrop-blur-sm">
                              <Icon name="center_focus_strong" className="text-primary text-3xl" />
                            </div>
                            <div className="absolute -top-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center">
                              <Icon name="auto_awesome" className="text-black text-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="check_circle" className="text-primary text-lg" />
                          <span className="text-primary text-xs font-bold">Planta Identificada</span>
                        </div>
                        <p className="text-white text-sm font-semibold">Rosa (Rosa spp.)</p>
                        <p className="text-slate-400 text-xs mt-1">Saúde: Boa • Rega: 2x/semana</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quotes Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-[40px]" />
                <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl p-5 border border-white/10">
                  <div className="w-64 sm:w-72 bg-[#102210] rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center gap-2 border-b border-white/5">
                      <Icon name="request_quote" className="text-primary" />
                      <span className="text-white font-bold text-sm">Orçamento</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        {[
                          { service: 'Poda de árvores', qty: '5 un', price: 'R$ 225,00' },
                          { service: 'Adubação', qty: '120 m²', price: 'R$ 1.800,00' },
                          { service: 'Limpeza de resíduos', qty: '2 cargas', price: 'R$ 160,00' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div>
                              <p className="text-white text-xs font-medium">{item.service}</p>
                              <p className="text-slate-500 text-[10px]">{item.qty}</p>
                            </div>
                            <span className="text-primary text-xs font-bold">{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between">
                        <span className="text-slate-400 text-sm">Total</span>
                        <span className="text-white text-lg font-extrabold">R$ 2.185,00</span>
                      </div>
                      <button className="w-full py-2.5 bg-primary text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                        <Icon name="share" className="text-sm" />
                        Enviar via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-primary font-bold text-sm uppercase tracking-wider">Orçamentos Profissionais</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-5">Gere orçamentos em<br />segundos</h2>
              <p className="text-slate-400 leading-relaxed mb-6">Selecione os serviços, ajuste quantidades e envie o orçamento direto pelo WhatsApp. Profissionalismo que impressiona e fecha contratos.</p>
              <div className="space-y-4">
                {[
                  { icon: 'bolt', text: 'Cálculo automático por área e quantidade' },
                  { icon: 'palette', text: 'Design profissional e limpo' },
                  { icon: 'share', text: 'Envio direto via WhatsApp ou e-mail' },
                  { icon: 'edit_note', text: 'Personalize preços e serviços' },
                ].map((item,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon name={item.icon} className="text-primary text-xl" />
                    </div>
                    <span className="text-slate-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <Section className="py-20 lg:py-28 bg-white/[0.02] relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#060e06]/93" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Por que Magic Garden?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">O app que entende<br />o jardineiro</h2>
            <p className="text-slate-400 text-base">Criado por quem entende a rotina do profissional de jardinagem.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'smartphone', title: 'Feito para Mobile', desc: 'Interface otimizada para usar no campo. Funciona offline e carrega rápido mesmo com internet fraca.' },
              { icon: 'lock', title: 'Dados Seguros', desc: 'Seus dados ficam protegidos com criptografia e backup automático. Nunca perca informações.' },
              { icon: 'update', title: 'Atualizações Constantes', desc: 'Novas funcionalidades todo mês baseadas no feedback da comunidade de jardineiros.' },
              { icon: 'support_agent', title: 'Suporte Humanizado', desc: 'Time de suporte que entende de jardinagem. Atendimento via WhatsApp em menos de 2h.' },
              { icon: 'language', title: '100% em Português', desc: 'Totalmente em português brasileiro. Sem termos técnicos confusos, interface clara e direta.' },
              { icon: 'payments', title: 'Investimento que Retorna', desc: 'Jardineiros que usam o app reportam aumento médio de 40% na produtividade mensal.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      {/* ══════════ GALLERY SHOWCASE ══════════ */}
      <Section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Galeria</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Antes & Depois que impressionam</h2>
            <p className="text-slate-400 text-base">Documente seus projetos e mostre a transformação para seus clientes.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { before: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&q=80', after: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&q=80', label: 'Jardim Residencial' },
              { before: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=500&q=80', after: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=500&q=80', label: 'Área de Lazer' },
              { before: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500&q=80', after: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&q=80', label: 'Condomínio' },
            ].map((item, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-white/10">
                <div className="relative h-48 sm:h-56">
                  <img src={item.after} alt={`${item.label} - depois`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  <img src={item.before} alt={`${item.label} - antes`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">ANTES</div>
                  <div className="absolute top-3 right-3 bg-white/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full group-hover:opacity-0 transition-opacity">DEPOIS</div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-sm font-bold">{item.label}</p>
                    <p className="text-white/50 text-xs">Passe o mouse para ver o antes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      {/* ══════════ TESTIMONIALS ══════════ */}
      <Section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&q=60" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#060e06]/92" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Depoimentos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Quem usa, recomenda</h2>
            <p className="text-slate-400 text-base">Veja o que profissionais como você dizem sobre o Magic Garden.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="João Marcos Silva"
              role="Jardineiro Autônomo • São Paulo, SP"
              text="Antes eu perdia horas organizando a agenda no papel. Agora com o Magic Garden, tenho tudo no celular. Meus clientes ficam impressionados quando mostro o orçamento profissional."
              avatar="JM"
            />
            <TestimonialCard
              name="Ana Clara Ferreira"
              role="Paisagista • Curitiba, PR"
              text="O scanner de plantas é incrível! Meus clientes adoram quando eu identifico a planta na hora e já dou o diagnóstico. Parece mágica. Recomendo para todo profissional da área."
              avatar="AC"
            />
            <TestimonialCard
              name="Roberto Lima Santos"
              role="Empresa de Jardinagem • Rio de Janeiro, RJ"
              text="Gerencio uma equipe de 8 jardineiros. O controle de rotas e agenda salvou nosso operacional. Reduzimos custos com combustível em 30% no primeiro mês."
              avatar="RL"
            />
          </div>
        </div>
      </Section>

      {/* ══════════ SEASONS VISUAL ══════════ */}
      <Section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Guia Sazonal</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-4">Cuidados certos para cada estação</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { season: 'Primavera', icon: 'local_florist', img: '/images/landing/primavera.jpg', tip: 'Adubação e plantio' },
              { season: 'Verão', icon: 'light_mode', img: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&q=80', tip: 'Rega e proteção solar' },
              { season: 'Outono', icon: 'eco', img: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=400&q=80', tip: 'Poda e limpeza' },
              { season: 'Inverno', icon: 'ac_unit', img: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=400&q=80', tip: 'Proteção contra geada' },
            ].map((item, i) => (
              <div key={i} className="relative h-52 rounded-2xl overflow-hidden group border border-white/10">
                <img src={item.img} alt={item.season} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon name={item.icon} className="text-primary text-lg" />
                    <span className="text-white font-bold text-sm">{item.season}</span>
                  </div>
                  <p className="text-white/50 text-xs">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ PRICING ══════════ */}
      <Section id="pricing" className="py-20 lg:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Planos & Preços</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Escolha o plano ideal<br />para você</h2>
            <p className="text-slate-400 text-base">Comece grátis e faça upgrade quando quiser. Sem surpresas, sem contratos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <PricingCard
              name="Grátis"
              price="R$ 0"
              period="mês"
              cta="Criar conta grátis"
              features={[
                'Até 10 clientes',
                'Agenda de podas básica',
                '5 scans de plantas/mês',
                'Orçamentos ilimitados',
                'Guia sazonal completo',
              ]}
            />
            <PricingCard
              name="Profissional"
              price="R$ 29"
              period="mês"
              highlight
              cta="Começar teste grátis"
              features={[
                'Clientes ilimitados',
                'Agenda com lembretes automáticos',
                'Scans ilimitados com IA',
                'Otimização de rotas',
                'Relatórios financeiros',
                'Galeria antes & depois',
                'Suporte prioritário via WhatsApp',
              ]}
            />
            <PricingCard
              name="Empresarial"
              price="R$ 79"
              period="mês"
              cta="Falar com vendas"
              features={[
                'Tudo do Profissional',
                'Múltiplos operadores',
                'Controle de estoque e ferramentas',
                'Relatórios avançados em PDF',
                'Alertas climáticos em tempo real',
                'API para integração',
                'Suporte dedicado 24/7',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Dúvidas Frequentes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">Perguntas & Respostas</h2>
          </div>

          <div className="space-y-3">
            <FAQItem
              question="O Magic Garden funciona offline?"
              answer="Sim! As funcionalidades principais como agenda, clientes e orçamentos funcionam offline. Os dados sincronizam automaticamente quando você voltar a ter internet."
            />
            <FAQItem
              question="Preciso de algum conhecimento técnico?"
              answer="Não! O app foi feito para ser simples e intuitivo. Se você sabe usar WhatsApp, sabe usar o Magic Garden. Além disso, temos vídeos tutoriais dentro do próprio app."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim, sem multas e sem burocracia. Você pode fazer downgrade para o plano grátis ou cancelar quando quiser. Seus dados ficam guardados por 90 dias."
            />
            <FAQItem
              question="Como funciona o scanner de plantas com IA?"
              answer="Basta abrir o scanner no app e apontar a câmera para a planta. Nossa inteligência artificial identifica a espécie, analisa sinais visuais de saúde e gera recomendações de cuidados. Tudo em poucos segundos."
            />
            <FAQItem
              question="Funciona para empresas com vários funcionários?"
              answer="Sim! O plano Empresarial permite múltiplos operadores com gestão centralizada e controle de equipe, rotas e relatórios unificados."
            />
            <FAQItem
              question="Meus dados estão seguros?"
              answer="Seus dados são protegidos com criptografia de ponta a ponta e armazenados em servidores seguros do Google Firebase. Fazemos backup automático diariamente."
            />
            <FAQItem
              question="Tem algum contrato ou período mínimo?"
              answer="Não. Todos os planos são mensais sem fidelidade. Você paga mês a mês e pode mudar ou cancelar o plano quando precisar."
            />
          </div>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#060e06]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-emerald-600/20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(19,236,19,0.15),transparent_60%)]" />
            <div className="absolute inset-0 border border-primary/10 rounded-3xl" />

            <div className="relative z-10 text-center py-16 lg:py-24 px-6">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="size-20 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30"
              >
                <Icon name="eco" className="text-white text-4xl" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Pronto para transformar<br />seu negócio?
              </h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
                Junte-se a milhares de jardineiros que já estão faturando mais com o Magic Garden.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="group inline-flex items-center justify-center gap-2 bg-primary text-black font-bold px-8 py-4 rounded-2xl text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/25">
                  Criar conta grátis agora
                  <Icon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <p className="text-slate-600 text-sm mt-5">Sem cartão de crédito • Cancele quando quiser</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/landing" className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                  <Icon name="eco" className="text-white text-lg" />
                </div>
                <span className="text-lg font-extrabold">Magic<span className="text-primary">Garden</span></span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">O app completo para jardineiros profissionais gerenciarem clientes, serviços e crescerem seus negócios.</p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Produto</h4>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-slate-500 text-sm hover:text-primary transition-colors">Funcionalidades</a>
                <a href="#pricing" className="text-slate-500 text-sm hover:text-primary transition-colors">Preços</a>
                <a href="#faq" className="text-slate-500 text-sm hover:text-primary transition-colors">FAQ</a>
                <Link href="/register" className="text-slate-500 text-sm hover:text-primary transition-colors">Criar Conta</Link>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Recursos</h4>
              <div className="flex flex-col gap-2">
                <Link href="/guide" className="text-slate-500 text-sm hover:text-primary transition-colors">Guia Sazonal</Link>
                <Link href="/training" className="text-slate-500 text-sm hover:text-primary transition-colors">Treinamentos</Link>
                <Link href="/scanner" className="text-slate-500 text-sm hover:text-primary transition-colors">Scanner IA</Link>
                <Link href="/calculator" className="text-slate-500 text-sm hover:text-primary transition-colors">Calculadora</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link href="/terms" className="text-slate-500 text-sm hover:text-primary transition-colors">Termos de Uso</Link>
                <a href="mailto:contato@magicgarden.app" className="text-slate-500 text-sm hover:text-primary transition-colors">Contato</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">&copy; {new Date().getFullYear()} Magic Garden. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="size-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
