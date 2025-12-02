import React from 'react';

/**
 * RetroCheckbox Component
 * 
 * A retro-styled checkbox with custom visual indicators.
 * 
 * @param {boolean} checked - Checked state
 * @param {function} onChange - Change handler
 * @param {string} label - Label text
 * @param {string} className - Additional classes
 */
const RetroCheckbox = ({ checked, onChange, label, className = '' }) => {
    return (
        <label className={`flex items-center cursor-pointer group ${className}`}>
            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${checked ? 'border-[#00ffaa] bg-[#00ffaa]/20' : 'border-[#005533] bg-transparent'}`}>
                {checked && <div className="w-2 h-2 bg-[#00ffaa]"></div>}
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={onChange}
            />
            {label && (
                <span className="ml-2 text-xs text-[#00ffaa] font-mono group-hover:text-white transition-colors">
                    {label}
                </span>
            )}
        </label>
    );
};

export default RetroCheckbox;
