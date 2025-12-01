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
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-xs text-crt-phosphor-dim font-mono uppercase tracking-wider mb-1">
                    {label}
                </label>
            )}

            <div className="flex items-center border border-crt-phosphor-dim bg-crt-panel/50 focus-within:border-crt-phosphor focus-within:shadow-crt-glow-sm transition-all duration-200 group">
                {/* Prefix */}
                {prefix && (
                    <span className="pl-3 pr-1 text-crt-phosphor font-bold select-none animate-pulse">
                        {prefix}
                    </span>
                )}

                {/* Input */}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none text-crt-phosphor font-mono p-2 focus:ring-0 focus:outline-none placeholder-crt-phosphor-dim/50"
                    {...props}
                />

                {/* Blinking Cursor Block (Visual flair) */}
                <div className="w-2 h-4 bg-crt-phosphor opacity-0 group-focus-within:opacity-100 animate-pulse mr-2 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default RetroInput;
