import React from 'react';

/**
 * RetroCard Component
 * 
 * A container with retro styling, borders, and corner accents.
 * 
 * @param {ReactNode} children - Content
 * @param {string} className - Additional classes
 */
const RetroCard = ({ children, className = '' }) => {
    return (
        <div className={`z-10 w-full p-8 border border-[#005533] bg-[#000a05] shadow-[0_0_20px_rgba(0,255,170,0.1)] relative ${className}`}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ffaa]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ffaa]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ffaa]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ffaa]"></div>

            {children}
        </div>
    );
};

export default RetroCard;
