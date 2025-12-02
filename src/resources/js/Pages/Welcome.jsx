import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import RetroCard from '@/Components/RetroUI/RetroCard';
import RetroButton from '@/Components/RetroUI/RetroButton';
import RetroHero from '@/Components/RetroUI/RetroHero';
import { StatsIcon, MapIcon, InventoryIcon, ChatIcon, CombatIcon, BuildIcon } from '@/Components/RetroUI/RetroIcons';

export default function Welcome() {
    const user = usePage().props.auth.user;

    const features = [
        {
            title: "EXPLORA",
            icon: <MapIcon size={24} />,
            desc: "Descubre nuevos sistemas estelares, recursos ocultos y anomalías espaciales en un universo en constante expansión."
        },
        {
            title: "CONSTRUYE",
            icon: <BuildIcon size={24} />,
            desc: "Diseña y fabrica desde módulos básicos hasta estaciones espaciales completas. Tu creatividad define la infraestructura."
        },
        {
            title: "COMBATE",
            icon: <CombatIcon size={24} />,
            desc: "Defiende tus rutas comerciales o conquista territorios. El combate táctico asíncrono premia la estrategia sobre los reflejos."
        },
        {
            title: "COMERCIA",
            icon: <StatsIcon size={24} />,
            desc: "Domina el mercado galáctico. Una economía real impulsada por la oferta y demanda de los jugadores."
        }
    ];

    const news = [
        {
            date: "2025-12-01",
            title: "DESCUBRIMIENTO EN SECTOR 7",
            content: "Exploradores reportan nuevas anomalías ricas en minerales. La corporación minera ha despachado flotas de extracción."
        },
        {
            date: "2025-11-28",
            title: "ACTUALIZACION SISTEMA V3.0",
            content: "Mejoras en la interfaz neural. Nuevos módulos de navegación y optimización de renderizado de mapas estelares."
        },
        {
            date: "2025-11-25",
            title: "FLUCTUACIONES DE MERCADO",
            content: "El precio del Tritanio ha subido un 15% debido a la escasez en las rutas comerciales del borde exterior."
        }
    ];

    return (
        <>
            <Head title="VAXAV_OS | HOME" />

            <div className="min-h-screen bg-[#000500] font-mono text-[#00ffaa] selection:bg-[#00ffaa] selection:text-black flex flex-col overflow-x-hidden">

                {/* Visual Effects */}
                <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
                <div className="crt-vignette pointer-events-none fixed inset-0 z-50"></div>

                {/* Navbar */}
                <nav className="h-14 border-b border-[#005533] bg-[#000a05]/90 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <span className="font-bold tracking-widest text-xl font-['VT323']">VAXAV_OS</span>
                        <span className="text-[#005533]">|</span>
                        <span className="text-xs animate-pulse">ONLINE</span>
                    </div>
                    <div className="flex gap-4">
                        {user ? (
                            <Link href="/game">
                                <RetroButton size="sm" variant="glow">IR_AL_JUEGO</RetroButton>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <RetroButton size="sm" variant="ghost">LOGIN</RetroButton>
                                </Link>
                                <Link href="/register">
                                    <RetroButton size="sm" variant="primary">REGISTRO</RetroButton>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <RetroHero
                    title="VAXAV"
                    subtitle="TU UNIVERSO. TU LEGADO."
                >
                    {user ? (
                        <Link href="/game">
                            <RetroButton variant="glow" className="px-8 py-4 text-lg">
                                CONECTAR_NEURAL
                            </RetroButton>
                        </Link>
                    ) : (
                        <Link href="/register">
                            <RetroButton variant="glow" className="px-8 py-4 text-lg">
                                INICIAR_CARRERA
                            </RetroButton>
                        </Link>
                    )}
                    <a href="#features">
                        <RetroButton variant="ghost" className="px-8 py-4 text-lg border-[#005533]">
                            LEER_MANUAL
                        </RetroButton>
                    </a>
                </RetroHero>

                {/* Features Grid */}
                <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px bg-[#005533] flex-1"></div>
                        <h2 className="text-2xl font-bold tracking-widest text-[#00ffaa]">MODULOS_PRINCIPALES</h2>
                        <div className="h-px bg-[#005533] flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feat, idx) => (
                            <RetroCard key={idx} className="hover:bg-[#001100] transition-colors group h-full">
                                <div className="mb-4 text-[#00ffaa] group-hover:drop-shadow-[0_0_5px_#00ffaa] transition-all">
                                    {feat.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2 border-b border-[#005533] pb-2 inline-block">
                                    {feat.title}
                                </h3>
                                <p className="text-sm text-[#00ffaa]/80 leading-relaxed">
                                    {feat.desc}
                                </p>
                            </RetroCard>
                        ))}
                    </div>
                </section>

                {/* News Feed */}
                <section className="py-20 px-6 bg-[#000a05] border-t border-[#005533]">
                    <div className="max-w-4xl mx-auto w-full">
                        <h2 className="text-2xl font-bold tracking-widest mb-8 flex items-center gap-2">
                            <span className="animate-pulse">●</span> TRANSMISIONES_RECIENTES
                        </h2>

                        <div className="space-y-4">
                            {news.map((item, idx) => (
                                <div key={idx} className="border border-[#005533] p-4 hover:border-[#00ffaa] transition-colors bg-[#000500] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 text-xs text-[#005533] font-mono">
                                        {item.date}
                                    </div>
                                    <h3 className="text-lg font-bold text-[#00ffaa] mb-2 group-hover:text-white transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-[#00ffaa]/70">
                                        {item.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-6 border-t border-[#005533] bg-[#000500] text-center text-xs text-[#005533]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="font-bold text-[#00ffaa]">VAXAV_CORP</span> © 2025
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-[#00ffaa] transition-colors">WIKI</a>
                            <a href="#" className="hover:text-[#00ffaa] transition-colors">DISCORD</a>
                            <a href="#" className="hover:text-[#00ffaa] transition-colors">GITHUB</a>
                            <a href="#" className="hover:text-[#00ffaa] transition-colors">STATUS</a>
                        </div>
                        <div>
                            VER: 3.0.1-ALPHA
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
