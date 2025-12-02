import React, { useState } from 'react';
import { MapIcon } from '../../../RetroUI/RetroIcons';
import MapView from './MapView';
import TreeView from './TreeView';
import { solarSystemData } from './mockData';

// Export Icon for Game.jsx
export const PanelIcon = <MapIcon />;

const MapPanel = () => {
    const [viewMode, setViewMode] = useState('MAP'); // 'MAP' or 'TREE'

    return (
        <div className="h-full flex flex-col bg-[#000a05] text-[#00ffaa] font-mono relative overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-[#005533] bg-[#000500] z-20">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-widest drop-shadow-[0_0_5px_rgba(0,255,170,0.8)]">
                        SISTEMA_NAV
                    </span>
                    <span className="text-xs text-[#005533] px-2 border-l border-[#005533]">
                        SECTOR: {solarSystemData.name}
                    </span>
                </div>

                {/* View Switcher */}
                <div className="flex border border-[#005533] rounded overflow-hidden">
                    <button
                        onClick={() => setViewMode('MAP')}
                        className={`px-3 py-1 text-xs transition-colors ${viewMode === 'MAP' ? 'bg-[#00ffaa] text-black font-bold' : 'hover:bg-[#001100] text-[#005533]'}`}
                    >
                        MAPA
                    </button>
                    <button
                        onClick={() => setViewMode('TREE')}
                        className={`px-3 py-1 text-xs transition-colors ${viewMode === 'TREE' ? 'bg-[#00ffaa] text-black font-bold' : 'hover:bg-[#001100] text-[#005533]'}`}
                    >
                        ARBOL
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {viewMode === 'MAP' ? (
                    <MapView data={solarSystemData} />
                ) : (
                    <TreeView data={solarSystemData} />
                )}
            </div>
        </div>
    );
};

export default MapPanel;
