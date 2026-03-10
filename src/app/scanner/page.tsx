'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Loader2, Leaf, Info, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function PlantScanner() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [flash, setFlash] = useState(false);
    const [hasCameraError, setHasCameraError] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [result, setResult] = useState<{
        name: string;
        scientificName: string;
        confidence: number;
        description: string;
        care: string[];
        pests: string;
        tips: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const initializeCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setHasCameraError(true);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (!image) {
            initializeCamera();
        }
        return () => stopCamera();
    }, [image]);

    const handleCaptureFromCamera = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
                setImage(imageDataUrl);
                stopCamera();
                startScan();
            }
        }
    };

    const handleCaptureFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                stopCamera();
                startScan();
            };
            reader.readAsDataURL(file);
        }
    };

    const startScan = () => {
        setScanning(true);
        // Simulate AI Processing Network Request
        setTimeout(() => {
            setScanning(false);
            setResult({
                name: "Lavanda (Alfazeima)",
                scientificName: "Lavandula angustifolia",
                confidence: 0.95,
                description: "Planta perene aromática nativa do Mediterrâneo. Excelente para bordaduras e atrai polinizadores.",
                care: [
                    "Sol pleno (mínimo 6h diárias)",
                    "Solo arenoso e muito bem drenado",
                    "Rega escassa (deixe a terra secar completamente)"
                ],
                pests: "Pulgões nos brotos novos durante a primavera. Evite excesso de umidade para prevenir apodrecimento das raízes e fungos de folhagem.",
                tips: "Pode drasticamente no final do inverno (antes da brotação) para manter um formato compacto e evitar que a base fique lenhosa e sem folhas."
            });
        }, 3000);
    };

    const handleRetakeOptions = () => {
        setImage(null);
        setResult(null);
        initializeCamera();
    };

    return (
        <div className="relative flex h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-black font-display">
            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera View Background */}
            <div className="absolute inset-0 z-0 bg-black">
                {image ? (
                    <img src={image} alt="Captured plant" className="w-full h-full object-cover" />
                ) : (
                    hasCameraError ? (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 p-8 text-center bg-slate-900 border-2 border-dashed border-slate-700 m-auto">
                            <AlertTriangle className="w-12 h-12 mb-4 text-slate-500" />
                            <p>Não foi possível acessar a câmera.</p>
                            <p className="text-sm mt-2">Permita o acesso no navegador ou faça upload da galeria.</p>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={cn("w-full h-full object-cover", flash && "brightness-125")}
                        />
                    )
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
            <div className="relative z-10 flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => { handleRetakeOptions(); router.back(); }}
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
                <div className="relative z-10 pb-8 pt-4 px-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-8">
                        <button onClick={() => fileInputRef.current?.click()} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/10 text-white backdrop-blur-md border border-white/30 overflow-hidden hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-[26px]">photo_library</span>
                        </button>

                        {scanning ? (
                            <div className="flex shrink-0 items-center justify-center rounded-full size-20 border-4 border-primary text-primary shadow-[0_0_15px_rgba(19,236,19,0.5)]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <button
                                onClick={handleCaptureFromCamera}
                                disabled={hasCameraError}
                                className="flex shrink-0 items-center justify-center rounded-full size-20 border-4 border-white text-white shadow-lg relative active:scale-95 transition-transform disabled:opacity-50"
                            >
                                <div className="absolute inset-1 rounded-full bg-white opacity-80 backdrop-blur-sm"></div>
                            </button>
                        )}
                        <button onClick={() => setFlash(!flash)} className={cn("flex shrink-0 items-center justify-center rounded-full size-12 backdrop-blur-md border transition-colors", flash ? "bg-white text-black border-white" : "bg-white/10 text-white border-white/30")}>
                            <span className="material-symbols-outlined text-2xl">flash_on</span>
                        </button>
                    </div>
                    {scanning && <p className="text-white font-medium text-sm animate-pulse">Analisando imagem via Inteligência Artificial...</p>}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleCaptureFromFile}
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
                                <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
                                <div className="pt-2 text-sm text-slate-700 dark:text-slate-300 border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-bold flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100">
                                        <Leaf className="w-4 h-4 text-primary" />
                                        Cuidados Recomendados
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {result.care.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                                <div className="pt-2 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
                                    <Bug className="w-5 h-5 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">Pragas & Doenças</p>
                                        <p>{result.pests}</p>
                                    </div>
                                </div>
                                <div className="pt-2 text-sm text-primary p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <p className="font-bold shrink-0 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">tips_and_updates</span>
                                        Dica de Especialista
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300">{result.tips}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button onClick={() => handleRetakeOptions()} className="w-14 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold py-3.5 rounded-xl text-center flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-300 dark:hover:bg-slate-700">
                                    <span className="material-symbols-outlined">replay</span>
                                </button>
                                <button onClick={() => { alert('Diagnóstico salvo no perfil do cliente/jardim.'); router.push('/clients'); }} className="flex-1 bg-primary text-slate-900 font-bold py-3.5 rounded-xl text-center shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                                    Salvar Diagnóstico
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
