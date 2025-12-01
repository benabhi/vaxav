import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
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
                        <span className="animate-pulse text-[#00ffaa]">BOOT_SEQUENCE</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#00ffaa] opacity-80">
                        <span>SYS_CHECK: OK</span>
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

                    <div className="z-10 text-center space-y-8 max-w-2xl w-full p-8 border border-[#005533] bg-[#000a05] shadow-[0_0_20px_rgba(0,255,170,0.1)] relative">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ffaa]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ffaa]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ffaa]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ffaa]"></div>

                        <div>
                            <h1 className="text-6xl font-bold text-[#00ffaa] mb-2 font-['VT323'] tracking-widest drop-shadow-[0_0_10px_rgba(0,255,170,0.8)]">
                                VAXAV_OS
                            </h1>
                            <p className="text-xl text-[#005533] tracking-[0.5em] animate-pulse">
                                SYSTEM_READY
                            </p>
                        </div>

                        <div className="flex justify-center gap-6">
                            <Link
                                href="/game"
                                className="group relative px-8 py-3 bg-[#001100] border border-[#00ffaa] text-[#00ffaa] font-bold hover:bg-[#00ffaa] hover:text-black transition-all duration-200 overflow-hidden"
                            >
                                <span className="relative z-10">INITIALIZE_SYSTEM</span>
                                <div className="absolute inset-0 bg-[#00ffaa] opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-md"></div>
                            </Link>

                            <a
                                href="https://github.com/caplin/FlexLayout"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-[#000500] border border-[#005533] text-[#005533] hover:text-[#00ffaa] hover:border-[#00ffaa] transition-all duration-200"
                            >
                                DOCS_LINK
                            </a>
                        </div>

                        <div className="mt-12 text-left border-t border-[#005533] pt-4">
                            <p className="mb-2 text-[#005533] text-xs">MODULES_LOADED:</p>
                            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                                <span className="text-[#00ffaa] opacity-80">[OK] LARAVEL_12</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] REACT_18</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] INERTIA</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] TAILWIND</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] FLEXLAYOUT</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] POSTGRES</span>
                                <span className="text-[#00ffaa] opacity-80">[OK] REDIS</span>
                                <span className="text-[#00ffaa] opacity-80 animate-pulse">[..] USER_SESSION</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Footer */}
                <div className="h-8 border-t border-[#005533] bg-[#000500] flex items-center px-4 z-40 relative shrink-0">
                    <span className="text-[#005533] mr-2">{">"}</span>
                    <span className="animate-pulse text-[#00ffaa]">WAITING_FOR_INPUT...</span>
                </div>
            </div>
        </>
    );
}
