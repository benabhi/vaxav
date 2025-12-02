import React from 'react';

/**
 * RetroProgressBar Component
 * 
 * A progress bar that can be solid or segmented, suitable for health/energy bars.
 * 
 * @param {string} label - Optional label (e.g. "HEALTH")
 * @param {number} value - Percentage (0-100)
 * @param {string} color - Tailwind color class (default: 'bg-crt-phosphor')
 * @param {boolean} showValue - Show percentage text
 * @param {boolean} segmented - Use segmented blocks style
 * @param {string} size - 'sm', 'md'
 */
const RetroProgressBar = ({
    label,
    value = 0,
    color = 'bg-[#00ffaa]',
    showValue = true,
    segmented = false,
    size = 'md',
    className = ''
}) => {
    // Clamp value between 0 and 100
    const percentage = Math.min(100, Math.max(0, value));

    const heightClass = size === 'sm' ? 'h-2' : 'h-4';

    // For segmented view, we create an array of blocks
    const segments = 20; // 20 blocks = 5% each
    const activeSegments = Math.floor((percentage / 100) * segments);

    return (
        <div className={`w-full font-mono ${className}`}>
            {/* Header */}
            {(label || showValue) && (
                <div className="flex justify-between items-end mb-1 text-xs tracking-wider">
                    {label && <span className="text-crt-phosphor uppercase">{label}</span>}
                    {showValue && <span className="text-crt-phosphor">{Math.round(percentage)}%</span>}
                </div>
            )}

            {/* Bar Container */}
            <div className={`w-full border border-crt-phosphor-dim bg-crt-panel p-[2px] ${heightClass} relative overflow-hidden`}>

                {segmented ? (
                    // Segmented Style
                    <div className="flex h-full gap-[2px]">
                        {[...Array(segments)].map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-full transition-all duration-300 ${i < activeSegments
                                    ? `${color} shadow-[0_0_5px_currentColor] opacity-100`
                                    : 'bg-crt-phosphor-dim/20 opacity-20'
                                    }`}
                            />
                        ))}
                    </div>
                ) : (
                    // Solid Style
                    <div className="w-full h-full bg-crt-phosphor-dim/10 relative">
                        <div
                            className={`h-full ${color} transition-all duration-500 ease-out shadow-[0_0_8px_currentColor]`}
                            style={{ width: `${percentage}%` }}
                        ></div>

                        {/* Scanline overlay for the bar */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:4px_100%] opacity-20 pointer-events-none"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RetroProgressBar;
