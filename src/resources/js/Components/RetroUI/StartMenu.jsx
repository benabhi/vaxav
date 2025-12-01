import React, { useState } from 'react';
import RetroInput from './RetroInput';
import RetroButton from './RetroButton';

export default function StartMenu({ isOpen, onClose, availablePanels, onAddPanel }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredPanels = availablePanels.filter(panel =>
        panel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="absolute bottom-10 left-0 w-64 bg-[#000500] border border-[#00ffaa] shadow-[0_0_20px_rgba(0,255,170,0.2)] z-50 flex flex-col">
            {/* Header */}
            <div className="bg-[#00ffaa] text-black px-2 py-1 font-bold text-sm tracking-widest flex justify-between items-center">
                <span>SYSTEM_MENU</span>
                <span className="text-[10px]">v3.0</span>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-[#005533]">
                <RetroInput
                    placeholder="SEARCH_MODULE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-xs"
                />
            </div>

            {/* List */}
            <div className="flex-1 max-h-64 overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-[#005533] scrollbar-track-transparent">
                {filteredPanels.map((panel) => (
                    <button
                        key={panel.id}
                        onClick={() => {
                            onAddPanel(panel);
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-[#00ffaa] hover:text-black text-[#00ffaa] transition-colors group text-left"
                    >
                        <span className="text-[#00ffaa] group-hover:text-black transition-colors">
                            {panel.icon}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider">{panel.name}</span>
                            <span className="text-[10px] opacity-60 group-hover:opacity-80">{panel.description}</span>
                        </div>
                    </button>
                ))}

                {filteredPanels.length === 0 && (
                    <div className="p-4 text-center text-[#005533] text-xs italic">
                        NO_MODULES_FOUND
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-2 border-t border-[#005533] bg-[#000a05] flex justify-end">
                <RetroButton size="sm" variant="danger" onClick={onClose}>SHUTDOWN_MENU</RetroButton>
            </div>
        </div>
    );
}
