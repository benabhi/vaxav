import React from 'react';
import { Link } from '@inertiajs/react';
import RetroCard from '@/Components/RetroUI/RetroCard';

export default function GuestLayout({ children }) {
    return (
        <div className="crt-container font-mono text-sm text-[#00ffaa] selection:bg-[#00ffaa] selection:text-black h-screen w-screen flex flex-col overflow-hidden bg-[#000500]">

            {/* Visual Effects Overlays */}
            <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
            <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

            {/* System Header */}
            <div className="h-8 border-b border-[#005533] bg-[#000500] flex items-center justify-between px-4 z-40 relative shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold tracking-widest text-[#00ffaa] drop-shadow-[0_0_5px_rgba(0,255,170,0.5)] hover:text-white transition-colors">
                        VAXAV_OS v3.0
                    </Link>
                    <span className="text-[#005533]">|</span>
                    <span className="animate-pulse text-[#00ffaa]">SECURE_LOGIN</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#00ffaa] opacity-80">
                    <span>ENCRYPTION: AES-256</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative w-full overflow-hidden z-0 flex flex-col items-center justify-center">

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-5 pointer-events-none">
                    {Array.from({ length: 1600 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-[#00ffaa]"></div>
                    ))}
                </div>

                {/* Content Card */}
                <RetroCard className="max-w-md">
                    {children}
                </RetroCard>
            </div>

            {/* System Footer */}
            <div className="h-8 border-t border-[#005533] bg-[#000500] flex items-center px-4 z-40 relative shrink-0">
                <span className="text-[#005533] mr-2">{">"}</span>
                <span className="animate-pulse text-[#00ffaa]">WAITING_FOR_CREDENTIALS...</span>
            </div>
        </div>
    );
}
