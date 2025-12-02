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
        <div className="crt-container min-h-screen bg-[#000500] text-[#00ffaa] font-mono overflow-hidden relative">
            <Head title="Retro UI Components" />

            {/* Visual Effects Overlays */}
            <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
            <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

            <div className="h-full overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-[#005533] scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    <header className="mb-8 border-b border-[#00ffaa] pb-4">
                        <h1 className="text-3xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(0,255,170,0.5)]">
                            LIBRERIA_UI_RETRO v1.0
                        </h1>
                        <p className="text-[#00ffaa] opacity-80 mt-2">DISEÑO DE COMPONENTES DE SISTEMA // VAXAV_OS</p>
                    </header>

                    {/* Buttons Section */}
                    <RetroPanel title="BOTONES">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-[#00ffaa] opacity-80 border-b border-[#005533] pb-1 mb-2">VARIANTES</h3>
                                <div className="flex flex-wrap gap-4">
                                    <RetroButton variant="primary">PRIMARIO</RetroButton>
                                    <RetroButton variant="ghost">FANTASMA</RetroButton>
                                    <RetroButton variant="danger">PELIGRO</RetroButton>
                                    <RetroButton variant="warning">ADVERTENCIA</RetroButton>
                                    <RetroButton variant="retro">RETRO</RetroButton>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[#00ffaa] opacity-80 border-b border-[#005533] pb-1 mb-2">TAMAÑOS</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <RetroButton size="sm">PEQUEÑO</RetroButton>
                                    <RetroButton size="md">MEDIANO</RetroButton>
                                    <RetroButton size="lg">GRANDE</RetroButton>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[#00ffaa] opacity-80 border-b border-[#005533] pb-1 mb-2">ESTADOS</h3>
                                <div className="flex flex-wrap gap-4">
                                    <RetroButton disabled>DESHABILITADO</RetroButton>
                                    <RetroTooltip content="Click para activar hipermotor">
                                        <RetroButton icon={<span>🚀</span>}>CON ICONO</RetroButton>
                                    </RetroTooltip>
                                </div>
                            </div>
                        </div>
                    </RetroPanel>

                    {/* Inputs Section */}
                    <RetroPanel title="ENTRADAS">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <RetroInput
                                label="LINEA DE COMANDO"
                                placeholder="Ingresar comando..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <RetroInput
                                label="CONTRASEÑA"
                                type="password"
                                prefix="🔒"
                                placeholder="Ingresar código de acceso..."
                            />
                        </div>
                    </RetroPanel>

                    {/* Progress Bars Section */}
                    <RetroPanel title="BARRAS DE ESTADO">
                        <div className="space-y-6">
                            <RetroProgressBar label="INTEGRIDAD CASCO" value={85} />
                            <RetroProgressBar label="ESCUDO ENERGIA" value={45} color="bg-blue-500" />
                            <RetroProgressBar label="CAPACIDAD MUNICION" value={92} segmented color="bg-yellow-500" />
                            <RetroProgressBar label="SISTEMAS CRITICOS" value={20} segmented color="bg-red-500" />
                        </div>
                    </RetroPanel>

                    {/* Icons Section */}
                    <RetroPanel title="ICONOS DE SISTEMA">
                        <div className="flex flex-wrap justify-around items-center gap-4 p-4">
                            <div className="flex flex-col items-center gap-2">
                                <InventoryIcon size={32} className="text-[#00ffaa]" />
                                <span className="text-xs text-[#00ffaa] opacity-80">INVENTARIO</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <MapIcon size={32} className="text-[#00ffaa]" />
                                <span className="text-xs text-[#00ffaa] opacity-80">MAPA</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <StatsIcon size={32} className="text-[#00ffaa]" />
                                <span className="text-xs text-[#00ffaa] opacity-80">ESTADISTICAS</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ChatIcon size={32} className="text-[#00ffaa]" />
                                <span className="text-xs text-[#00ffaa] opacity-80">COMMS</span>
                            </div>
                        </div>
                    </RetroPanel>

                    {/* Lists & Modals Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <RetroPanel title="LISTA INTERACTIVA (BLOQUE)">
                            <RetroList
                                items={listItems}
                                selectedItem={selectedItem}
                                onSelect={setSelectedItem}
                                variant="block"
                            />
                            <div className="mt-4 text-xs text-[#00ffaa] opacity-80">
                                SELECCIONADO: {selectedItem ? selectedItem.label : 'NINGUNO'}
                            </div>
                        </RetroPanel>

                        <RetroPanel title="MODALES Y OVERLAYS">
                            <div className="flex flex-col gap-4">
                                <RetroButton onClick={() => openModal('default')}>ABRIR MODAL DEFAULT</RetroButton>
                                <RetroButton variant="warning" onClick={() => openModal('warning')}>ABRIR MODAL ADVERTENCIA</RetroButton>
                                <RetroButton variant="danger" onClick={() => openModal('danger')}>ABRIR MODAL PELIGRO</RetroButton>
                            </div>
                        </RetroPanel>
                    </div>
                </div>

                {/* Modal Instance */}
                <RetroModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={modalVariant === 'danger' ? 'ALERTA DE SISTEMA' : 'CONFIRMACION'}
                    variant={modalVariant}
                >
                    <p className="mb-4">
                        {modalVariant === 'danger'
                            ? 'ADVERTENCIA: Secuencia de autodestrucción solicitada. Esta acción no se puede deshacer.'
                            : '¿Está seguro que desea proceder con esta operación? Se asignarán recursos del sistema.'}
                    </p>
                    <div className="p-2 bg-black/30 border border-[#00ffaa] opacity-80 font-mono text-xs">
                        CODIGO: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                </RetroModal>
            </div>
        </div>
    );
}
