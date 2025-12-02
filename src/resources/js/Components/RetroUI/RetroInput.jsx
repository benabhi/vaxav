import React from 'react';

/**
 * RetroInput Component
 * 
 * A terminal-style input field with optional prefix and focus effects.
 * 
 * @param {string} label - Optional label
 * @param {string} prefix - Terminal prefix (e.g. ">", "$")
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} type - Input type (text, password, etc.)
 */
const RetroInput = ({
    label,
    prefix = '>',
    placeholder = '',
    value,
    onChange,
    type = 'text',
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-xs text-[#00ffaa] opacity-70 font-mono uppercase tracking-wider mb-1">
                    {label}
                </label>
            )}

            <div className={`flex items-center border bg-[#000a05]/50 transition-all duration-200 group ${error
                    ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    : 'border-[#005533] focus-within:border-[#00ffaa] focus-within:shadow-[0_0_10px_rgba(0,255,170,0.2)]'
                }`}>
                {/* Prefix */}
                {prefix && (
                    <span className={`pl-3 pr-1 font-bold select-none ${error ? 'text-red-500' : 'text-[#00ffaa]'}`}>
                        {prefix}
                    </span>
                )}

                {/* Input */}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none text-[#00ffaa] font-mono p-2 focus:ring-0 focus:outline-none placeholder-[#005533]"
                    {...props}
                />

                {/* Blinking Cursor Block (Visual flair) */}
                <div className={`w-2 h-4 opacity-0 group-focus-within:opacity-100 animate-pulse mr-2 pointer-events-none ${error ? 'bg-red-500' : 'bg-[#00ffaa]'}`}></div>
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1 font-mono flex items-center">
                    <span className="mr-1">!</span> {error}
                </p>
            )}
        </div>
    );
};

export default RetroInput;
