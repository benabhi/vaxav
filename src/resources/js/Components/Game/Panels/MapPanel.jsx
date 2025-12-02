import React from 'react';
import { MapIcon } from '../../RetroUI/RetroIcons';

export const PanelIcon = <MapIcon />;

const MapPanel = () => {
    return (
        <div className="h-full bg-[#000a05] text-[#00ffaa] font-mono relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-10 pointer-events-none">
                {Array.from({ length: 400 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-[#00ffaa]"></div>
                ))}
            </div>

            <div className="z-10 text-center mb-4">
                <h2 className="text-lg font-bold tracking-widest text-[#00ffaa] drop-shadow-[0_0_5px_rgba(0,255,170,0.8)]">
                    SISTEMA_NAV
                </h2>
                <p className="text-xs text-[#005533]">SECTOR: ALFA-7 | COORDS: 42.8 / -17.3</p>
            </div>

            <div className="relative w-48 h-48 border border-[#00ffaa] rounded-full flex items-center justify-center bg-[#001100] shadow-[0_0_15px_rgba(0,255,170,0.2)]">
                <div className="absolute inset-0 rounded-full border border-[#005533] animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border border-[#005533] animate-[spin_8s_linear_infinite_reverse]"></div>
                <div className="w-2 h-2 bg-[#00ffaa] rounded-full shadow-[0_0_10px_#00ffaa] animate-pulse"></div>
            </div>
        </div>
    );
};

export default MapPanel;
