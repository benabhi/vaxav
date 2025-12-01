import React from 'react';

/**
 * RetroPanel Component
 * 
 * A standard container with a retro border and optional header.
 * 
 * @param {string} title - Panel title
 * @param {ReactNode} children - Content
 * @param {string} variant - 'default', 'bordered'
 */
const RetroPanel = ({
    title,
    children,
    variant = 'default',
    className = '',
    padding = true
}) => {
    return (
        <div className={`
            bg-crt-panel border border-crt-phosphor-dim relative overflow-hidden flex flex-col
            ${className}
        `}>
            {/* Header */}
            {title && (
                <div className="bg-crt-bg border-b border-crt-phosphor-dim p-2 flex items-center justify-between shrink-0">
                    <h2 className="text-crt-phosphor font-bold font-mono text-sm tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,255,170,0.5)]">
                        {title}
                    </h2>
                    {/* Decorative lines */}
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-crt-phosphor-dim/50"></div>
                        <div className="w-2 h-2 bg-crt-phosphor-dim/30"></div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`flex-1 relative ${padding ? 'p-4' : ''} overflow-auto scrollbar-thin scrollbar-thumb-crt-phosphor-dim scrollbar-track-transparent`}>
                {children}
            </div>

            {/* Corner Accents (Visual flair) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-crt-phosphor opacity-50 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-crt-phosphor opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-crt-phosphor opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-crt-phosphor opacity-50 pointer-events-none"></div>
        </div>
    );
};

export default RetroPanel;
