import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import RetroButton from './RetroButton';

/**
 * RetroModal Component
 * 
 * A modal dialog with a CRT overlay effect and retro styling.
 * 
 * @param {boolean} isOpen - Visibility state
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} variant - 'default', 'danger', 'warning'
 */
const RetroModal = ({
    isOpen,
    onClose,
    title,
    children,
    variant = 'default',
    className = ''
}) => {
    const [visible, setVisible] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            // Small delay to trigger animation
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            // Wait for animation to finish before hiding
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    // Variant colors for border/header
    const colors = {
        default: 'border-[#00ffaa] text-[#00ffaa]',
        danger: 'border-red-500 text-red-500',
        warning: 'border-orange-500 text-orange-500'
    };

    const colorClass = colors[variant] || colors.default;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur and scanlines */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
            </div>

            {/* Modal Panel */}
            <div
                className={`
                    relative bg-[#000a05] border ${colorClass} shadow-[0_0_20px_rgba(0,0,0,0.5)] 
                    w-full max-w-lg transform transition-all duration-300 ease-out
                    ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
                    ${className}
                `}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-3 border-b ${colorClass} bg-black/20`}>
                    <h3 className="font-mono font-bold uppercase tracking-widest drop-shadow-[0_0_5px_currentColor]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`hover:bg-white/10 p-1 rounded transition-colors ${colorClass}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto font-mono text-sm">
                    {children}
                </div>

                {/* Footer (Optional actions) */}

            </div>
        </div>,
        document.body
    );
};

export default RetroModal;
