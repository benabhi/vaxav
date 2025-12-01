import React from 'react';

/**
 * RetroButton Component
 * 
 * A retro-styled button with CRT effects, hover glows, and multiple variants.
 * 
 * @param {string} variant - 'primary', 'ghost', 'danger', 'warning', 'retro'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {ReactNode} icon - Optional icon component
 * @param {boolean} disabled - Disabled state
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 */
const RetroButton = ({
    variant = 'primary',
    size = 'md',
    icon,
    disabled = false,
    className = '',
    children,
    onClick,
    ...props
}) => {

    // Base styles
    const baseStyles = "font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    // Size variants
    const sizeStyles = {
        sm: "text-xs px-3 py-1",
        md: "text-sm px-4 py-2",
        lg: "text-base px-6 py-3"
    };

    // Color/Style variants
    const variantStyles = {
        primary: "bg-crt-phosphor/10 text-crt-phosphor border border-crt-phosphor hover:bg-crt-phosphor hover:text-crt-bg hover:shadow-crt-glow",
        ghost: "bg-transparent text-crt-phosphor/70 border border-transparent hover:text-crt-phosphor hover:bg-crt-phosphor/5 hover:border-crt-phosphor/30",
        danger: "bg-red-900/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-black hover:shadow-[0_0_10px_rgba(239,68,68,0.6)]",
        warning: "bg-orange-900/20 text-orange-500 border border-orange-500/50 hover:bg-orange-500 hover:text-black hover:shadow-[0_0_10px_rgba(249,115,22,0.6)]",
        retro: "bg-yellow-900/20 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_10px_rgba(234,179,8,0.6)]"
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {/* Scanline effect overlay on hover */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-0 group-hover:opacity-30 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {icon && <span className="w-4 h-4">{icon}</span>}
                {children}
            </span>
        </button>
    );
};

export default RetroButton;
