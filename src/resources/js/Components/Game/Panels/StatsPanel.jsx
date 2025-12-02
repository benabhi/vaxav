import React, { useState } from 'react';
import { StatsIcon } from '../../RetroUI/RetroIcons';

export const PanelIcon = <StatsIcon />;

const StatsPanel = () => {
    const [stats] = useState({
        health: 85,
        energy: 62,
        credits: 1250,
        level: 12
    });

    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">ESTADO_PILOTO</h2>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between mb-1">
                        <span>SALUD</span>
                        <span>{stats.health}%</span>
                    </div>
                    <div className="w-full bg-[#001100] h-2 border border-[#005533]">
                        <div
                            className="bg-[#00ffaa] h-full shadow-[0_0_8px_#00ffaa]"
                            style={{ width: `${stats.health}%` }}
                        ></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <span>ENERGIA</span>
                        <span>{stats.energy}%</span>
                    </div>
                    <div className="w-full bg-[#001100] h-2 border border-[#005533]">
                        <div
                            className="bg-[#00ffaa] h-full shadow-[0_0_8px_#00ffaa] opacity-80"
                            style={{ width: `${stats.energy}%` }}
                        ></div>
                    </div>
                </div>
                <div className="pt-2 border-t border-[#005533] mt-2">
                    <div className="flex justify-between">
                        <span className="text-[#005533]">CREDITOS</span>
                        <span>{stats.credits} CR</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#005533]">NIVEL</span>
                        <span>{stats.level}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
