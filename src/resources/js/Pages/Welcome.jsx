import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import RetroCard from '@/Components/RetroUI/RetroCard';
import RetroButton from '@/Components/RetroUI/RetroButton';

export default function Welcome() {
    const user = usePage().props.auth.user;
    return (
        <>
            <Head title="VAXAV_OS | BOOT" />

            {/* CRT Monitor Container */}
            <div className="crt-container font-mono text-sm text-[#00ffaa] selection:bg-[#00ffaa] selection:text-black h-screen w-screen flex flex-col overflow-hidden">

                {/* Visual Effects Overlays */}
                <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
                <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

                {/* System Header */}
                <div className="h-8 border-b border-[#005533] bg-[#000500] flex items-center justify-between px-4 z-40 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="font-bold tracking-widest text-[#00ffaa] drop-shadow-[0_0_5px_rgba(0,255,170,0.5)]">VAXAV_OS v3.0</span>
                        <span className="text-[#005533]">|</span>
                        <span className="animate-pulse text-[#00ffaa]">SECUENCIA_INICIO</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#00ffaa] opacity-80">
                        <span>VERIF_SIST: OK</span>
                    </div>
                </div>

                {/* Main Content - Boot Screen */}
                <div className="flex-1 relative w-full overflow-hidden z-0 flex flex-col items-center justify-center bg-[#000500]">

                    {/* Decorative Grid Background */}
                    <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-5 pointer-events-none">
                        {Array.from({ length: 1600 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-[#00ffaa]"></div>
                        ))}
                    </div>

                    <RetroCard className="text-center space-y-8 max-w-2xl">

                        <div>
                            <h1 className="text-6xl font-bold text-[#00ffaa] mb-2 font-['VT323'] tracking-widest drop-shadow-[0_0_10px_rgba(0,255,170,0.8)]">
                                VAXAV_OS
                            </h1>
                            <p className="text-xl text-[#005533] tracking-[0.5em] animate-pulse">
                                SISTEMA_LISTO
                            </p>
                        </div>

                        <div className="flex justify-center gap-6">
                            {user ? (
                                <Link href="/game">
                                    <RetroButton variant="glow" className="px-8 py-3">
                                        ENTRAR_SISTEMA
                                    </RetroButton>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <RetroButton variant="glow" className="px-8 py-3">
                                            TERMINAL_ACCESO
                                        </RetroButton>
                                    </Link>

                                    <Link href="/register">
                                        <RetroButton variant="ghost" className="px-8 py-3 border border-[#005533] text-[#005533] hover:text-[#00ffaa] hover:border-[#00ffaa]">
                                            NUEVO_PILOTO
                                        </RetroButton>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="mt-12 text-left border-t border-[#005533] pt-4">
                            <p className="mb-2 text-[#005533] text-xs">MODULOS_CARGADOS:</p>
                            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                                <span className="text-[#00ffaa] opacity-80">[OK] LARAVEL_12</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] REACT_18</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] INERTIA</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] TAILWIND</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] FLEXLAYOUT</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] POSTGRES</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] REDIS</span>
                                <span className="text-[#00ffaa] opacity-80 animate-pulse">[..] SESION_USUARIO</span>
                            </div>
                        </div>
                    </RetroCard>
                </div>

                {/* System Footer */}
                <div className="h-8 border-t border-[#005533] bg-[#000500] flex items-center px-4 z-40 relative shrink-0">
                    <span className="text-[#005533] mr-2">{">"}</span>
                    <span className="animate-pulse text-[#00ffaa]">ESPERANDO_COMANDO...</span>
                </div>
            </div>
        </>
    );
}
