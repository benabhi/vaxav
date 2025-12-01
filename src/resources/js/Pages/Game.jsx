import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GoldenLayoutWrapper from '../Components/GoldenLayoutWrapper';

// Componentes de ejemplo para los paneles
const InventoryPanel = () => {
    return (
        <div className="p-4 h-full bg-gray-900 text-white">
            <h2 className="text-xl font-bold mb-4">Inventario</h2>
            <ul className="space-y-2">
                <li className="p-2 bg-gray-800 rounded">🔫 Arma Láser - Nivel 3</li>
                <li className="p-2 bg-gray-800 rounded">🛡️ Escudo Energético - 80%</li>
                <li className="p-2 bg-gray-800 rounded">💊 Pack Médico x5</li>
            </ul>
        </div>
    );
};

const MapPanel = () => {
    return (
        <div className="p-4 h-full bg-gray-800 text-white flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">🗺️ Mapa</h2>
                <p className="text-gray-400">Sistema de navegación estelar</p>
                <div className="mt-4 w-64 h-64 bg-gray-700 rounded mx-auto flex items-center justify-center">
                    <span className="text-4xl">⭐</span>
                </div>
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
        <div className="p-4 h-full bg-gray-900 text-white">
            <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between mb-1">
                        <span>Salud</span>
                        <span>{stats.health}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${stats.health}%` }}
                        ></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <span>Energía</span>
                        <span>{stats.energy}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${stats.energy}%` }}
                        ></div>
                    </div>
                </div>
                <div className="pt-3">
                    <p>💰 Créditos: {stats.credits.toLocaleString()}</p>
                    <p>⭐ Nivel: {stats.level}</p>
                </div>
            </div>
        </div>
    );
};

const ChatPanel = () => {
    const [messages] = useState([
        { user: 'Player1', text: 'Alguien para una misión?' },
        { user: 'Commander', text: 'Necesito apoyo en Sector 7' },
        { user: 'Trader', text: 'Vendiendo munición barata!' },
    ]);

    return (
        <div className="p-4 h-full bg-gray-900 text-white flex flex-col">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="p-2 bg-gray-800 rounded">
                        <span className="font-bold text-blue-400">{msg.user}: </span>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
            />
        </div>
    );
};

export default function Game() {
    // Configuración del layout de Golden Layout
    const layoutConfig = {
        root: {
            type: 'row',
            content: [
                {
                    type: 'column',
                    width: 20,
                    content: [
                        {
                            type: 'component',
                            componentType: 'inventory',
                            title: 'Inventario',
                        },
                        {
                            type: 'component',
                            componentType: 'stats',
                            title: 'Stats',
                        }
                    ]
                },
                {
                    type: 'column',
                    width: 60,
                    content: [
                        {
                            type: 'component',
                            componentType: 'map',
                            title: 'Mapa',
                        }
                    ]
                },
                {
                    type: 'column',
                    width: 20,
                    content: [
                        {
                            type: 'component',
                            componentType: 'chat',
                            title: 'Chat',
                        }
                    ]
                }
            ]
        }
    };

    // Componentes disponibles para el layout
    const components = {
        inventory: InventoryPanel,
        map: MapPanel,
        stats: StatsPanel,
        chat: ChatPanel,
    };

    return (
        <>
            <Head title="Juego" />
            <div className="bg-black min-h-screen">
                <GoldenLayoutWrapper
                    config={layoutConfig}
                    components={components}
                />
            </div>
        </>
    );
}
