import React from 'react';

export default function RetroHero({ title, subtitle, children, className = "" }) {
    return (
        <div className={`relative w-full py-20 px-4 overflow-hidden flex flex-col items-center justify-center text-center border-b border-[#005533] bg-[#000a05] ${className}`}>

            {/* Background Grid Effect */}
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)] opacity-10 pointer-events-none">
                <div className="scan-sweep"></div>
                {Array.from({ length: 200 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-[#00ffaa]"></div>
                ))}
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">

                {/* Glitchy Title */}
                <h1
                    className="glitch text-6xl md:text-9xl font-bold text-[#00ffaa] font-['VT323'] tracking-widest drop-shadow-[0_0_10px_rgba(0,255,170,0.8)] mb-4"
                    data-text={title}
                >
                    {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xl md:text-2xl text-[#00ffaa] opacity-80 font-mono tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                )}

                {/* Decorative Line */}
                <div className="w-24 h-1 bg-[#00ffaa] mx-auto shadow-[0_0_10px_#00ffaa]"></div>

                {/* Actions / Children */}
                <div className="pt-8 flex flex-wrap justify-center gap-6">
                    {children}
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#00ffaa]"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#00ffaa]"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#00ffaa]"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#00ffaa]"></div>
        </div>
    );
}
