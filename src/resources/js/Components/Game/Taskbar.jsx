import React, { useState, useEffect, useRef } from 'react';
import TaskbarItem from './TaskbarItem';
import StartMenu from './StartMenu';
import * as FlexLayout from 'flexlayout-react';

export default function Taskbar({ model, factory, availablePanels, onAddPanel, onLogout }) {
    const [startOpen, setStartOpen] = useState(false);
    const [activeTabId, setActiveTabId] = useState(null);
    const [openTabs, setOpenTabs] = useState([]);
    const menuRef = useRef(null);

    // Sync with FlexLayout model
    useEffect(() => {
        const updateState = () => {
            const activeTab = model.getActiveTabset()?.getSelectedNode();
            setActiveTabId(activeTab?.getId());

            // Collect all tabs from the model
            const tabs = [];
            model.visitNodes((node) => {
                if (node.getType() === 'tab') {
                    tabs.push({
                        id: node.getId(),
                        name: node.getName(),
                        component: node.getComponent(),
                        config: node.getConfig()
                    });
                }
            });
            setOpenTabs(tabs);
        };

        // Initial update
        updateState();

        // We rely on parent re-rendering to trigger this effect when model changes
    });

    const handleTabClick = (tabId) => {
        model.doAction(FlexLayout.Actions.selectTab(tabId));
    };

    // Close start menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setStartOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="h-8 bg-[#000500] border-t border-[#005533] flex items-center relative select-none z-50 shrink-0">
            {/* Start Button & Menu */}
            <div className="relative h-full" ref={menuRef}>
                <StartMenu
                    isOpen={startOpen}
                    onClose={() => setStartOpen(false)}
                    availablePanels={availablePanels}
                    onAddPanel={onAddPanel}
                    onLogout={onLogout}
                />
                <button
                    onClick={() => setStartOpen(!startOpen)}
                    className={`
                        h-full px-3 flex items-center gap-2 font-bold tracking-widest transition-colors border-r border-[#005533]
                        ${startOpen
                            ? 'bg-[#00ffaa] text-black shadow-[0_0_15px_#00ffaa]'
                            : 'bg-[#000500] text-[#00ffaa] hover:bg-[#001100] hover:text-[#00ffaa]'
                        }
                    `}
                >
                    <span className="text-base">❖</span>
                    <span className="text-xs">SISTEMA</span>
                </button>
            </div>

            {/* Taskbar Items */}
            <div className="flex-1 flex overflow-x-auto overflow-y-hidden scrollbar-hide h-full">
                {openTabs.map(tab => (
                    <TaskbarItem
                        key={tab.id}
                        label={tab.name}
                        icon={tab.config?.icon}
                        isActive={tab.id === activeTabId}
                        onClick={() => {
                            const node = model.getNodeById(tab.id);
                            if (node) {
                                model.doAction(FlexLayout.Actions.selectTab(tab.id));
                            }
                        }}
                        onClose={() => {
                            model.doAction(FlexLayout.Actions.deleteTab(tab.id));
                        }}
                    />
                ))}
            </div>

            {/* System Tray / Clock */}
            <div className="px-3 border-l border-[#005533] h-full flex items-center gap-3 text-xs text-[#00ffaa] bg-[#000500]">
                <div className="flex flex-col items-end leading-none">
                    <span className="text-[10px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[8px] text-[#005533]">ONLINE</span>
                </div>
            </div>
        </div>
    );
}
