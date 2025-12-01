import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Model } from 'flexlayout-react';
import FlexLayoutWrapper from '../Components/FlexLayoutWrapper';
import { InventoryIcon, MapIcon, StatsIcon, ChatIcon } from '../Components/TabIcons';

// --- CRT Styled Panels ---

const InventoryPanel = () => {
    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">INVENTORY_SYSTEM</h2>
            <ul className="space-y-1">
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> LASER_RIFLE [LVL.3]
                </li>
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> ENERGY_SHIELD [80%]
                </li>
                <li className="flex items-center p-1 hover:bg-[#00ffaa] hover:text-black cursor-pointer transition-colors">
                    <span className="mr-2">►</span> MED_PACK [x5]
                </li>
            </ul>
        </div>
    );
};

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
                    NAV_SYSTEM
                </h2>
                <p className="text-xs text-[#005533]">SECTOR: ALPHA-7 | COORDS: 42.8 / -17.3</p>
            </div>

            <div className="relative w-48 h-48 border border-[#00ffaa] rounded-full flex items-center justify-center bg-[#001100] shadow-[0_0_15px_rgba(0,255,170,0.2)]">
                <div className="absolute inset-0 rounded-full border border-[#005533] animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border border-[#005533] animate-[spin_8s_linear_infinite_reverse]"></div>
                <div className="w-2 h-2 bg-[#00ffaa] rounded-full shadow-[0_0_10px_#00ffaa] animate-pulse"></div>
            </div>
        </div>
    );
};

const StatsPanel = () => {
    const [stats] = useState({
        health: 85,
        energy: 62,
        credits: 1250,
        level: 12
    });

    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">PILOT_STATUS</h2>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between mb-1">
                        <span>HEALTH</span>
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
                        <span>ENERGY</span>
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
                        <span className="text-[#005533]">CREDITS</span>
                        <span>{stats.credits} CR</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#005533]">LEVEL</span>
                        <span>{stats.level}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatPanel = () => {
    const [messages] = useState([
        { user: 'PLAYER1', text: 'Anyone for a mission?' },
        { user: 'CMD_AI', text: 'Support required in Sector 7.' },
        { user: 'TRADER', text: 'Selling ammo, cheap.' },
    ]);

    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs flex flex-col">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">COMMS_LINK</h2>
            <div className="flex-1 overflow-y-auto space-y-1 mb-2 pr-1">
                {messages.map((msg, idx) => (
                    <div key={idx} className="p-1 hover:bg-[#001100]">
                        <span className="font-bold text-[#00ffaa] opacity-80">[{msg.user}]: </span>
                        <span className="text-[#00ffaa] opacity-60">{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center border border-[#005533] bg-[#000500]">
                <span className="pl-2 text-[#00ffaa]">{">"}</span>
                <input
                    type="text"
                    placeholder="TRANSMIT..."
                    className="w-full p-2 bg-transparent text-[#00ffaa] focus:outline-none placeholder-[#005533]"
                />
            </div>
        </div>
    );
};

export default function Game() {
    // Layout Configuration
    const layoutModel = Model.fromJson({
        global: {
            tabEnableClose: false,
            tabSetEnableTabStrip: true,
            tabSetEnableDrop: true,
            tabSetEnableDrag: true,
            tabSetEnableDivide: true,
            tabSetEnableMaximize: true,
            splitterSize: 2, // Explicitly set splitter size
        },
        borders: [],
        layout: {
            type: "row",
            weight: 100,
            children: [
                {
                    type: "tabset",
                    weight: 20,
                    children: [
                        {
                            type: "tab",
                            name: "INVENTORY",
                            component: "inventory",
                            config: { icon: <InventoryIcon /> }
                        },
                        {
                            type: "tab",
                            name: "STATS",
                            component: "stats",
                            config: { icon: <StatsIcon /> }
                        }
                    ]
                },
                {
                    type: "tabset",
                    weight: 60,
                    children: [
                        {
                            type: "tab",
                            name: "MAP",
                            component: "map",
                            config: { icon: <MapIcon /> }
                        }
                    ]
                },
                {
                    type: "tabset",
                    weight: 20,
                    children: [
                        {
                            type: "tab",
                            name: "COMMS",
                            component: "chat",
                            config: { icon: <ChatIcon /> }
                        }
                    ]
                }
            ]
        }
    });

    const factory = (node) => {
        const component = node.getComponent();
        switch (component) {
            case "inventory": return <InventoryPanel />;
            case "map": return <MapPanel />;
            case "stats": return <StatsPanel />;
            case "chat": return <ChatPanel />;
            default: return <div>UNKNOWN_COMPONENT</div>;
        }
    };

    return (
        <>
            <Head title="VAXAV_OS" />

            {/* CRT Monitor Container */}
            <div className="crt-container font-mono text-sm text-[#00ffaa] selection:bg-[#00ffaa] selection:text-black h-screen w-screen flex flex-col overflow-hidden">

                {/* Visual Effects Overlays */}
                <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
                <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

                {/* System Header */}
                <div className="h-8 border-b border-[#005533] bg-[#000500] flex items-center justify-between px-4 z-40 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="font-bold tracking-widest text-[#00ffaa] drop-shadow-[0_0_5px_rgba(0,255,170,0.5)]">VAXAV_OS v3.0</span>
                        <span className="text-[#005533]">|</span>
                        <span className="animate-pulse text-[#00ffaa]">ONLINE</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#00ffaa] opacity-80">
                        <span>SYS_TIME: {new Date().toLocaleTimeString()}</span>
                        <span className="text-[#005533]">|</span>
                        <span>MEM: 64TB</span>
                    </div>
                </div>

                {/* Main Layout Area - FlexGrow to fill space */}
                <div className="flex-1 relative w-full overflow-hidden z-0">
                    <FlexLayoutWrapper model={layoutModel} factory={factory} />
                </div>

                {/* System Footer */}
                <div className="h-8 border-t border-[#005533] bg-[#000500] flex items-center px-4 z-40 relative shrink-0">
                    <span className="text-[#005533] mr-2">{">"}</span>
                    <span className="animate-pulse text-[#00ffaa]">_</span>
                </div>
            </div>
        </>
    );
}
