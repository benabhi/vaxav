import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Model } from 'flexlayout-react';
import FlexLayoutWrapper from '../Components/FlexLayoutWrapper';
import * as FlexLayout from 'flexlayout-react';

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

import Taskbar from '../Components/RetroUI/Taskbar';
import { InventoryIcon, MapIcon, StatsIcon, ChatIcon } from '../Components/RetroUI/RetroIcons';

// --- Available Panels Definition ---
const AVAILABLE_PANELS = [
    { id: 'inventory', name: 'INVENTORY', icon: <InventoryIcon />, component: 'inventory', description: 'Manage equipment and items' },
    { id: 'map', name: 'NAV_SYSTEM', icon: <MapIcon />, component: 'map', description: 'Galaxy map and navigation' },
    { id: 'stats', name: 'PILOT_STATUS', icon: <StatsIcon />, component: 'stats', description: 'Health, energy, and credits' },
    { id: 'chat', name: 'COMMS_LINK', icon: <ChatIcon />, component: 'chat', description: 'Interstellar communication' },
];

export default function Game() {
    // Layout Configuration
    const layoutModel = Model.fromJson({
        global: {
            tabEnableClose: true, // Enable closing tabs
            tabEnableRename: false, // Disable renaming
            tabSetEnableTabStrip: true,
            tabSetEnableDrop: true,
            tabSetEnableDrag: true,
            tabSetEnableDivide: true,
            tabSetEnableMaximize: true,
            splitterSize: 2,
        },
        borders: [],
        layout: {
            type: "row",
            weight: 100,
            children: [
                {
                    type: "tabset",
                    weight: 50,
                    children: [
                        {
                            type: "tab",
                            name: "INVENTORY",
                            component: "inventory",
                            config: { icon: <InventoryIcon /> }
                        }
                    ]
                },
                {
                    type: "tabset",
                    weight: 50,
                    children: [
                        {
                            type: "tab",
                            name: "NAV_SYSTEM",
                            component: "map",
                            config: { icon: <MapIcon /> }
                        }
                    ]
                }
            ]
        }
    });

    // Force update state to re-render when layout changes (for empty state check)
    const [model, setModel] = useState(layoutModel);
    const [isEmpty, setIsEmpty] = useState(false);
    const [layoutUpdateTick, setLayoutUpdateTick] = useState(0);

    // Check for empty state on every render/action
    useEffect(() => {
        const checkEmpty = () => {
            // Count visible tabs
            let count = 0;
            model.visitNodes((node) => {
                if (node.getType() === 'tab') count++;
            });
            setIsEmpty(count === 0);
        };
        checkEmpty();
    }, [layoutUpdateTick, model]);

    const onModelChange = (model) => {
        // Trigger re-render
        setLayoutUpdateTick(t => t + 1);
    };


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

    const handleAddPanel = (panelDef) => {
        let parentId = '#0';
        let location = FlexLayout.DockLocation.CENTER;

        // Logic to determine unique name
        let count = 0;
        model.visitNodes((node) => {
            if (node.getType() === 'tab' && node.getComponent() === panelDef.component) {
                count++;
            }
        });

        const newName = count > 0 ? `${panelDef.name} ${count + 1}` : panelDef.name;

        // Logic to force split
        // We want to split the currently active tabset, or the root if none.
        const activeTabset = model.getActiveTabset();
        if (activeTabset) {
            parentId = activeTabset.getId();
            location = FlexLayout.DockLocation.RIGHT; // Split to the right
        } else {
            // If no active tabset, find the first one or root
            let firstTabset = null;
            model.visitNodes((node) => {
                if (node.getType() === 'tabset' && !firstTabset) {
                    firstTabset = node;
                }
            });
            if (firstTabset) {
                parentId = firstTabset.getId();
                location = FlexLayout.DockLocation.RIGHT;
            }
        }

        model.doAction(FlexLayout.Actions.addNode(
            {
                type: 'tab',
                component: panelDef.component,
                name: newName,
                config: { icon: panelDef.icon },
                id: `${panelDef.id}_${Date.now()}` // Ensure unique ID for cloning
            },
            parentId,
            location,
            -1
        ));
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

                {/* Main Layout Area */}
                <div className="flex-1 relative w-full overflow-hidden z-0 bg-[#000a05]">
                    {isEmpty && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none select-none opacity-50">
                            <div className="text-6xl mb-4 text-[#005533]">VAXAV_OS</div>
                            <div className="text-xl text-[#00ffaa] animate-pulse">SYSTEM_IDLE</div>
                            <div className="mt-8 text-sm text-[#005533] border border-[#005533] p-2">
                                {">"} ACCESS_SYSTEM_MENU_TO_INITIATE_MODULES
                            </div>
                        </div>
                    )}
                    <div className={`h-full w-full ${isEmpty ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <FlexLayoutWrapper model={model} factory={factory} onModelChange={onModelChange} />
                    </div>
                </div>

                {/* Taskbar */}
                <Taskbar
                    model={model}
                    factory={factory}
                    availablePanels={AVAILABLE_PANELS}
                    onAddPanel={handleAddPanel}
                />
            </div>
        </>
    );
}
