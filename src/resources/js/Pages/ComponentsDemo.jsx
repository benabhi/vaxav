import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import RetroButton from '../Components/RetroUI/RetroButton';
import RetroInput from '../Components/RetroUI/RetroInput';
import RetroProgressBar from '../Components/RetroUI/RetroProgressBar';
import RetroList from '../Components/RetroUI/RetroList';
import RetroPanel from '../Components/RetroUI/RetroPanel';
import RetroModal from '../Components/RetroUI/RetroModal';
import RetroTooltip from '../Components/RetroUI/RetroTooltip';
import { InventoryIcon, MapIcon, StatsIcon, ChatIcon } from '../Components/RetroUI/RetroIcons';

export default function ComponentsDemo() {
    const [inputValue, setInputValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalVariant, setModalVariant] = useState('default');

    const listItems = [
        { id: 1, label: 'LASER_RIFLE [LVL.3]' },
        { id: 2, label: 'ENERGY_SHIELD [80%]' },
        { id: 3, label: 'MED_PACK [x5]' },
        { id: 4, label: 'DATA_CHIP_V2' },
    ];

    const openModal = (variant) => {
        setModalVariant(variant);
        setModalOpen(true);
    };

    return (
        <div className="crt-container min-h-screen bg-crt-bg text-crt-phosphor font-mono overflow-hidden relative">
            <Head title="Retro UI Components" />

            {/* Visual Effects Overlays */}
            <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
            <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

            <div className="h-full overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-crt-phosphor-dim scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    <header className="mb-8 border-b border-crt-phosphor pb-4">
                        <h1 className="text-3xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(0,255,170,0.5)]">
                            RETRO_UI_LIBRARY v1.0
                        </h1>
                        <p className="text-crt-phosphor-dim mt-2">SYSTEM DESIGN COMPONENTS // VAXAV_OS</p>
                    </header>

                    {/* Buttons Section */}
                    <RetroPanel title="BUTTONS">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-crt-phosphor-dim border-b border-crt-phosphor-dim/30 pb-1 mb-2">VARIANTS</h3>
                                <div className="flex flex-wrap gap-4">
                                    <RetroButton variant="primary">PRIMARY</RetroButton>
                                    <RetroButton variant="ghost">GHOST</RetroButton>
                                    <RetroButton variant="danger">DANGER</RetroButton>
                                    <RetroButton variant="warning">WARNING</RetroButton>
                                    <RetroButton variant="retro">RETRO</RetroButton>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-crt-phosphor-dim border-b border-crt-phosphor-dim/30 pb-1 mb-2">SIZES</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <RetroButton size="sm">SMALL</RetroButton>
                                    <RetroButton size="md">MEDIUM</RetroButton>
                                    <RetroButton size="lg">LARGE</RetroButton>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-crt-phosphor-dim border-b border-crt-phosphor-dim/30 pb-1 mb-2">STATES</h3>
                                <div className="flex flex-wrap gap-4">
                                    <RetroButton disabled>DISABLED</RetroButton>
                                    <RetroTooltip content="Click to engage hyperdrive">
                                        <RetroButton icon={<span>🚀</span>}>WITH ICON</RetroButton>
                                    </RetroTooltip>
                                </div>
                            </div>
                        </div>
                    </RetroPanel>

                    {/* Inputs Section */}
                    <RetroPanel title="INPUTS">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <RetroInput
                                label="COMMAND LINE"
                                placeholder="Enter command..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <RetroInput
                                label="PASSWORD"
                                type="password"
                                prefix="🔒"
                                placeholder="Enter access code..."
                            />
                        </div>
                    </RetroPanel>

                    {/* Progress Bars Section */}
                    <RetroPanel title="STATUS BARS">
                        <div className="space-y-6">
                            <RetroProgressBar label="HULL INTEGRITY" value={85} />
                            <RetroProgressBar label="ENERGY SHIELD" value={45} color="bg-blue-500" />
                            <RetroProgressBar label="AMMO CAPACITY" value={92} segmented color="bg-yellow-500" />
                            <RetroProgressBar label="CRITICAL SYSTEMS" value={20} segmented color="bg-red-500" />
                        </div>
                    </RetroPanel>

                    {/* Icons Section */}
                    <RetroPanel title="SYSTEM ICONS">
                        <div className="flex flex-wrap justify-around items-center gap-4 p-4">
                            <div className="flex flex-col items-center gap-2">
                                <InventoryIcon size={32} className="text-crt-phosphor" />
                                <span className="text-xs text-crt-phosphor-dim">INVENTORY</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <MapIcon size={32} className="text-crt-phosphor" />
                                <span className="text-xs text-crt-phosphor-dim">MAP</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <StatsIcon size={32} className="text-crt-phosphor" />
                                <span className="text-xs text-crt-phosphor-dim">STATS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ChatIcon size={32} className="text-crt-phosphor" />
                                <span className="text-xs text-crt-phosphor-dim">COMMS</span>
                            </div>
                        </div>
                    </RetroPanel>

                    {/* Lists & Modals Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <RetroPanel title="INTERACTIVE LIST (BLOCK STYLE)">
                            <RetroList
                                items={listItems}
                                selectedItem={selectedItem}
                                onSelect={setSelectedItem}
                                variant="block"
                            />
                            <div className="mt-4 text-xs text-crt-phosphor-dim">
                                SELECTED: {selectedItem ? selectedItem.label : 'NONE'}
                            </div>
                        </RetroPanel>

                        <RetroPanel title="MODALS & OVERLAYS">
                            <div className="flex flex-col gap-4">
                                <RetroButton onClick={() => openModal('default')}>OPEN DEFAULT MODAL</RetroButton>
                                <RetroButton variant="warning" onClick={() => openModal('warning')}>OPEN WARNING MODAL</RetroButton>
                                <RetroButton variant="danger" onClick={() => openModal('danger')}>OPEN DANGER MODAL</RetroButton>
                            </div>
                        </RetroPanel>
                    </div>
                </div>

                {/* Modal Instance */}
                <RetroModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={modalVariant === 'danger' ? 'SYSTEM ALERT' : 'CONFIRMATION'}
                    variant={modalVariant}
                >
                    <p className="mb-4">
                        {modalVariant === 'danger'
                            ? 'WARNING: Self-destruct sequence initiation requested. This action cannot be undone.'
                            : 'Are you sure you want to proceed with this operation? System resources may be allocated.'}
                    </p>
                    <div className="p-2 bg-black/30 border border-crt-phosphor-dim/30 font-mono text-xs">
                        CODE: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                </RetroModal>
            </div>
        </div>
    );
}
