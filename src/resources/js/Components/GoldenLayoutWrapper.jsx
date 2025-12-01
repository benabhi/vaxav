import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoldenLayout, LayoutConfig, ComponentContainer } from 'golden-layout';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-dark-theme.css';

/**
 * Componente wrapper para Golden Layout
 * Proporciona un sistema de paneles dinámicos que pueden ser arrastrados y reorganizados
 * 
 * @param {Object} props - Propiedades del componente
 * @param {LayoutConfig} props.config - Configuración inicial del layout
 * @param {Object} props.components - Objetos de componentes React para registrar
 */
const GoldenLayoutWrapper = ({ config, components }) => {
    const layoutRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Crear instancia de Golden Layout
        const layout = new GoldenLayout(containerRef.current);

        // Registrar componentes
        Object.entries(components).forEach(([name, Component]) => {
            layout.registerComponentFactoryFunction(name, (container) => {
                const root = document.createElement('div');
                root.style.width = '100%';
                root.style.height = '100%';
                container.element.appendChild(root);

                // Renderizar el componente React
                const reactRoot = createRoot(root);
                reactRoot.render(<Component container={container} />);

                return {
                    destroy: () => {
                        reactRoot.unmount();
                    }
                };
            });
        });

        // Cargar configuración
        layout.loadLayout(config);

        layoutRef.current = layout;

        // Cleanup al desmontar
        return () => {
            layout.destroy();
        };
    }, [config, components]);

    return (
        <div
            ref={containerRef}
            className="w-full h-screen"
            style={{ position: 'relative' }}
        />
    );
};

export default GoldenLayoutWrapper;
