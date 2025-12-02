import React from 'react';
import { InventoryIcon } from '../../RetroUI/RetroIcons';

export const PanelIcon = <InventoryIcon />;

const InventoryPanel = () => {
    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">SISTEMA_INVENTARIO</h2>
            <ul className="space-y-1">
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> RIFLE_LASER [NIV.3]
                </li>
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> ESCUDO_ENERGIA [80%]
                </li>
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> PACK_MEDICO [x5]
                </li>
            </ul>
        </div>
    );
};

export default InventoryPanel;
