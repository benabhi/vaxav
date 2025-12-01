import React from 'react';

/**
 * RetroList Component
 * 
 * A vertical list of items with hover effects and selection support.
 * 
 * @param {Array} items - Array of items to display
 * @param {any} selectedItem - Currently selected item (or ID)
 * @param {function} onSelect - Selection handler
 * @param {function} renderItem - Optional custom renderer for items
 * @param {string} keyProp - Property to use as key (default: 'id')
 */
const RetroList = ({
    items = [],
    selectedItem,
    onSelect,
    renderItem,
    keyProp = 'id',
    variant = 'default', // 'default' | 'block'
    className = ''
}) => {
    return (
        <ul className={`space-y-1 font-mono text-sm ${className}`}>
            {items.map((item, index) => {
                const isSelected = selectedItem === item || (item[keyProp] && selectedItem === item[keyProp]);
                const key = item[keyProp] || index;

                // Variant Styles
                const defaultStyle = isSelected
                    ? 'bg-crt-phosphor text-crt-bg font-bold shadow-crt-glow-sm'
                    : 'hover:bg-crt-phosphor/10 hover:border-crt-phosphor/30 hover:text-crt-phosphor';

                const blockStyle = isSelected
                    ? 'bg-crt-phosphor text-crt-bg font-bold shadow-crt-glow-sm'
                    : 'hover:bg-crt-phosphor hover:text-crt-bg hover:font-bold transition-colors';

                return (
                    <li
                        key={key}
                        onClick={() => onSelect && onSelect(item)}
                        className={`
                            group flex items-center p-2 cursor-pointer transition-all duration-200 border border-transparent
                            ${variant === 'block' ? blockStyle : defaultStyle}
                        `}
                    >
                        {/* Selection Indicator */}
                        <span className={`mr-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                            ►
                        </span>

                        {/* Content */}
                        <div className="flex-1">
                            {renderItem ? renderItem(item, isSelected) : (
                                <span>{item.label || item.name || JSON.stringify(item)}</span>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default RetroList;
