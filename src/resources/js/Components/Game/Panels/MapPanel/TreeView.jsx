import React from 'react';

const TreeItem = ({ item, level = 0, isLast = true, parentPrefix = '' }) => {
    const hasChildren = item.children && item.children.length > 0;

    // Tree connector logic
    const connector = isLast ? '└─' : '├─';
    const childPrefix = parentPrefix + (isLast ? '  ' : '│ ');

    // Icon based on type
    const getIcon = (type) => {
        switch (type) {
            case 'STAR': return '★';
            case 'PLANET': return '●';
            case 'MOON': return '○';
            case 'STATION': return '■';
            default: return '•';
        }
    };

    return (
        <div className="font-mono text-xs text-[#00ffaa]">
            <div className="flex items-center hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors p-0.5">
                <span className="text-[#005533] mr-1 whitespace-pre">
                    {parentPrefix}{connector}
                </span>
                <span className="mr-2 text-[#00ffaa]">{getIcon(item.type)}</span>
                <span className={item.type === 'STAR' ? 'font-bold text-yellow-400' : ''}>
                    {item.name}
                </span>
                <span className="ml-auto text-[#005533] text-[10px]">
                    [{item.type}]
                </span>
            </div>

            {hasChildren && (
                <div>
                    {item.children.map((child, index) => (
                        <TreeItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            isLast={index === item.children.length - 1}
                            parentPrefix={childPrefix}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const TreeView = ({ data }) => {
    return (
        <div className="h-full overflow-y-auto p-4 bg-[#000500] font-mono">
            <div className="mb-4 border-b border-[#005533] pb-2">
                <h3 className="text-[#00ffaa] font-bold text-sm">JERARQUIA_SISTEMA: {data.name}</h3>
                <p className="text-[#005533] text-xs">COORDS: {data.coords.x} / {data.coords.y}</p>
            </div>
            <div className="pl-2">
                {data.entities.map((entity, index) => (
                    <TreeItem
                        key={entity.id}
                        item={entity}
                        isLast={index === data.entities.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default TreeView;
