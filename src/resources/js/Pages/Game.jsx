import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import RetroModal from '@/Components/RetroUI/RetroModal';
import { Model } from 'flexlayout-react';
import FlexLayoutWrapper from '../Components/FlexLayoutWrapper';
import * as FlexLayout from 'flexlayout-react';
import Taskbar from '../Components/Game/Taskbar';

// Import Panels and Icons
import InventoryPanel, { PanelIcon as InventoryPanelIcon } from '../Components/Game/Panels/InventoryPanel';
import MapPanel, { PanelIcon as MapPanelIcon } from '../Components/Game/Panels/MapPanel';
import StatsPanel, { PanelIcon as StatsPanelIcon } from '../Components/Game/Panels/StatsPanel';
import ChatPanel, { PanelIcon as ChatPanelIcon } from '../Components/Game/Panels/ChatPanel';

// --- Available Panels Definition ---
const AVAILABLE_PANELS = [
    { id: 'inventory', name: 'INVENTARIO', icon: InventoryPanelIcon, component: 'inventory', description: 'Gestionar equipo e items' },
    { id: 'map', name: 'SISTEMA_NAV', icon: MapPanelIcon, component: 'map', description: 'Mapa galáctico y navegación' },
    { id: 'stats', name: 'ESTADO_PILOTO', icon: StatsPanelIcon, component: 'stats', description: 'Salud, energía y créditos' },
    { id: 'chat', name: 'ENLACE_COMMS', icon: ChatPanelIcon, component: 'chat', description: 'Comunicación interestelar' },
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
                            name: "INVENTARIO",
                            component: "inventory",
                            config: { icon: InventoryPanelIcon }
                        }
                    ]
                },
                {
                    type: "tabset",
                    weight: 50,
                    children: [
                        {
                            type: "tab",
                            name: "SISTEMA_NAV",
                            component: "map",
                            config: { icon: MapPanelIcon }
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

    // Logout Modal State
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { post } = useForm();

    const handleLogout = () => {
        post(route('logout'));
    };

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

        // Use the base name without auto-numbering
        const newName = panelDef.name;

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
                        <span>HORA_SIST: {new Date().toLocaleTimeString()}</span>
                        <span className="text-[#005533]">|</span>
                        <span>MEM: 64TB</span>

                    </div>
                </div>

                {/* Main Layout Area */}
                <div className="flex-1 relative w-full overflow-hidden z-0 bg-[#000a05]">
                    {isEmpty && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none select-none opacity-50">
                            <div className="text-6xl mb-4 text-[#005533]">VAXAV_OS</div>
                            <div className="text-xl text-[#00ffaa] animate-pulse">SISTEMA_INACTIVO</div>
                            <div className="mt-8 text-sm text-[#005533] border border-[#005533] p-2">
                                {">"} ACCEDER_MENU_SISTEMA_PARA_INICIAR_MODULOS
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
                    onLogout={() => setShowLogoutModal(true)}
                />
            </div>

            {/* Logout Confirmation Modal */}
            <RetroModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="CONFIRMAR APAGADO"
            >
                <div className="space-y-4">
                    <p className="text-[#00ffaa] text-sm">
                        ¿ESTÁ SEGURO QUE DESEA DESCONECTARSE DEL SISTEMA VAXAV?
                    </p>
                    <p className="text-[#005533] text-xs">
                        ADVERTENCIA: LA CONEXIÓN NEURAL SE INTERRUMPIRÁ.
                    </p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="px-4 py-2 border border-[#005533] text-[#005533] hover:text-[#00ffaa] hover:border-[#00ffaa] text-xs transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-900/40 text-xs font-bold transition-colors"
                        >
                            CONFIRMAR_APAGADO
                        </button>
                    </div>
                </div>
            </RetroModal>
        </>
    );
}
