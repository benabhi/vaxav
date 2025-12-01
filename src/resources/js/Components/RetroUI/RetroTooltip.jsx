import React, { useState } from 'react';

/**
 * RetroTooltip Component
 * 
 * A simple tooltip that appears on hover.
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
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div className={`
                    absolute z-50 whitespace-nowrap px-2 py-1 
                    bg-crt-bg border border-crt-phosphor text-crt-phosphor 
                    text-xs font-mono shadow-[0_0_10px_rgba(0,0,0,0.5)]
                    pointer-events-none
                    ${positionClasses[position] || positionClasses.top}
                    ${className}
                `}>
                    {content}
                    {/* Arrow (Optional, simplified as a border block for retro look) */}
                </div>
            )}
        </div>
    );
};

export default RetroTooltip;
