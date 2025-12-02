import React, { useState } from 'react';

/**
 * RetroTooltip Component
 * 
 * A high-tech data block tooltip style.
 * 
 * @param {string} content - Tooltip text
 * @param {ReactNode} children - Trigger element
 * @param {string} position - 'top', 'bottom', 'left', 'right'
 */
const RetroTooltip = ({
    content,
    children,
    position = 'top',
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3'
    };

    return (
        <div
            className="relative inline-block group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div className={`
                    absolute z-50 whitespace-nowrap px-3 py-2
                    bg-[#000a05]/95 border border-[#00ffaa] text-[#00ffaa]
                    text-xs font-mono shadow-[0_0_15px_rgba(0,255,170,0.3)]
                    pointer-events-none
                    backdrop-blur-sm
                    animate-in fade-in zoom-in-95 duration-200
                    ${positionClasses[position] || positionClasses.top}
                    ${className}
                `}>


                    {/* Content with scanline overlay effect */}
                    <div className="relative z-10 flex items-center gap-2">
                        <span className="text-[10px] opacity-70 animate-pulse">{">>"}</span>
                        <span className="tracking-wide">{content}</span>
                    </div>

                    {/* Decorative background grid */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,255,170,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,170,0.1)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                </div>
            )}
        </div>
    );
};

export default RetroTooltip;
