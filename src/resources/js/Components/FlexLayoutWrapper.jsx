import React from 'react';
import { Layout, Model, TabNode, Actions } from 'flexlayout-react';

/**
 * Componente wrapper para FlexLayout
 * Proporciona un sistema de paneles dinámicos que pueden ser arrastrados y reorganizados
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.model - Modelo de configuración de FlexLayout
 * @param {Function} props.factory - Función factory para crear componentes
 */
const FlexLayoutWrapper = (props) => {
    const { model, factory } = props;
    const onRenderTab = (node, renderValues) => {
        // Renderizar icono si existe en la configuración del nodo
        const config = node.getConfig();
        const icon = config ? config.icon : null;
        const handleMiddleClick = (e) => {
            if (e.button === 1) {
                e.preventDefault();
                model.doAction(Actions.deleteTab(node.getId()));
            }
        };

        if (icon) {
            renderValues.content = (
                <div className="flex items-center gap-2 group" onMouseDown={handleMiddleClick}>
                    <span className="w-4 h-4 text-[#00ffaa] group-hover:text-[#00ffaa] transition-colors duration-300 drop-shadow-[0_0_2px_rgba(0,255,170,0.5)]">
                        {icon}
                    </span>
                    <span className="font-mono tracking-wider text-sm">
                        {node.getName()}
                    </span>
                </div>
            );
        } else {
            renderValues.content = (
                <div className="flex items-center gap-2 group" onMouseDown={handleMiddleClick}>
                    <span className="font-mono tracking-wider text-sm">
                        {node.getName()}
                    </span>
                </div>
            );
        }
    };

    return (
        <div className="w-full h-screen">
            <Layout
                model={model}
                factory={factory}
                onRenderTab={onRenderTab}
                onAction={props.onAction}
                onModelChange={props.onModelChange}
            />
        </div>
    );
};

export default FlexLayoutWrapper;
