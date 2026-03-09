'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Loader2, Leaf, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function PlantScanner() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [flash, setFlash] = useState(false);
    const [result, setResult] = useState<{
        name: string;
        scientificName: string;
        confidence: number;
        description: string;
        care: string[];
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                startScan();
            };
            reader.readAsDataURL(file);
        }
    };

    const startScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setResult({
                name: "Lavanda",
                scientificName: "Lavandula angustifolia",
                confidence: 0.95,
                description: "Planta perene aromática, muito utilizada em jardins e para extração de óleos essenciais.",
                care: [
                    "Sol pleno (mínimo 6h diárias)",
                    "Solo bem drenado",
                    "Rega moderada (evitar encharcamento)"
                ]
            });
        }, 2000);
    };

    return (
        <div className="relative flex h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-black font-display">
            {/* Camera View Background */}
            <div className="absolute inset-0 z-0">
                {image ? (
                    <img src={image} alt="Captured plant" className="w-full h-full object-cover" />
                ) : (
                    <img
                        alt="Camera view of a plant"
                        className="w-full h-full object-cover opacity-60"
                        src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=800"
                    />
                )}

                {/* Scanning Overlay Grid */}
                {!result && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full flex items-center justify-center p-8">
                            <div className="w-full aspect-square border-2 border-primary/50 rounded-xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>

                                {scanning && (
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(19,236,19,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Top App Bar */}
            <div className="relative z-10 flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={() => { setImage(null); setResult(null); router.back(); }}
                    className="flex size-12 shrink-0 items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight flex-1 text-center drop-shadow-md tracking-tight">Scanner de Plantas AI</h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => alert('Dica: Fotografe folhas, flores ou frutos da planta de perto, em ambiente bem iluminado.')} className="flex h-12 w-12 items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">help</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 relative z-10"></div>

            {/* Bottom Controls */}
            {!result && (
                <div className="relative z-10 pb-8 pt-4 px-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-8">
                        <button onClick={() => router.push('/gallery')} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-black/40 text-white backdrop-blur-sm border border-white/20 overflow-hidden hover:bg-white/20 transition-colors">
                            <img
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                                src="https://images.unsplash.com/photo-1501004318641-729e4b2a46e7?auto=format&fit=crop&q=80&w=150"
                            />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex shrink-0 items-center justify-center rounded-full size-20 border-4 border-white text-white shadow-lg relative active:scale-95 transition-transform"
                        >
                            <div className="absolute inset-1 rounded-full bg-white opacity-80"></div>
                        </button>
                        <button onClick={() => setFlash(!flash)} className={cn("flex shrink-0 items-center justify-center rounded-full size-12 backdrop-blur-sm border transition-colors", flash ? "bg-white text-black border-white" : "bg-black/40 text-white border-white/20")}>
                            <span className="material-symbols-outlined text-2xl">flash_on</span>
                        </button>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleCapture}
                    />
                </div>
            )}

            {/* Identification Bottom Sheet */}
            {result && (
                <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col justify-end items-stretch animate-in slide-in-from-bottom duration-300">
                    <div className="flex flex-col items-stretch bg-background-light dark:bg-background-dark rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                        <button
                            onClick={() => setResult(null)}
                            className="flex h-6 w-full items-center justify-center pt-2"
                        >
                            <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        </button>
                        <div className="flex-1 px-4 pb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <span className="material-symbols-outlined text-2xl">psychiatry</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">Planta Identificada</h3>
                            </div>

                            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nome</p>
                                    <p className="text-slate-900 dark:text-slate-100 text-base font-semibold text-right">{result.name}</p>
                                </div>
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Época de Poda</p>
                                    <p className="text-slate-900 dark:text-slate-100 text-base font-semibold text-right">Primavera/Verão</p>
                                </div>
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center gap-x-6 py-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Status</p>
                                    <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-bold text-right flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Saudável
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button onClick={() => { alert('Planta adicionada com sucesso aos registros.'); router.push('/clients'); }} className="flex-1 bg-primary text-slate-900 font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                                    Adicionar ao CRM
                                </button>
                                <button onClick={() => alert('Opções de compartilhamento')} className="w-14 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold py-3.5 rounded-xl text-center flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-300 dark:hover:bg-slate-700">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
