import React from 'react';

export default function TaskbarItem({ label, icon, isActive, onClick, onClose }) {
    return (
        <div
            className={`
                flex items-center gap-2 px-3 py-1 h-full min-w-[120px] max-w-[200px]
                border-r border-[#005533] transition-all duration-100 cursor-pointer group relative
                ${isActive
                    ? 'bg-[#00ffaa] text-black shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'
                    : 'bg-[#000500] text-[#00ffaa] hover:bg-[#001100] hover:shadow-[inset_0_0_5px_#00ffaa]'
                }
            `}
            onClick={onClick}
            onMouseDown={(e) => {
                // Middle click (button 1)
                if (e.button === 1) {
                    e.preventDefault();
                    onClose();
                }
            }}
        >
            <span className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#00ffaa]'}`}>
                {icon}
            </span>
            <span className="truncate text-xs font-bold tracking-wider flex-1">
                {label}
            </span>

            {/* Close Button - Visible on hover or if active */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={`
                    ml-1 w-4 h-4 flex items-center justify-center rounded-sm
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${isActive
                        ? 'hover:bg-black/20 text-black'
                        : 'hover:bg-[#00ffaa]/20 text-[#00ffaa]'
                    }
                `}
            >
                ×
            </button>
        </div>
    );
}
