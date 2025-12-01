import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Bienvenido" />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">
                        🚀 Vaxav Game
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Juego Web con Paneles Dinámicos
                    </p>

                    <div className="space-x-4">
                        <Link
                            href="/game"
                            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Iniciar Juego
                        </Link>

                        <a
                            href="https://github.com/golden-layout/golden-layout"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Documentación Golden Layout
                        </a>
                    </div>

                    <div className="mt-12 text-gray-400">
                        <p className="mb-2">Tecnologías:</p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <span className="px-3 py-1 bg-gray-800 rounded">Laravel 12</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">React</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">Inertia.js</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">Tailwind CSS 4</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">Golden Layout</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">PostgreSQL</span>
                            <span className="px-3 py-1 bg-gray-800 rounded">Redis</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
