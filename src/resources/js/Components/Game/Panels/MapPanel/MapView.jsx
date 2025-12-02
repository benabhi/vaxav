import React, { useRef, useState } from 'react';
import Star from './Entities/Star';
import Planet from './Entities/Planet';
import Moon from './Entities/Moon';
import Station from './Entities/Station';
import Orbit from './Entities/Orbit';

const MapView = ({ data }) => {
    const svgRef = useRef(null);
    const [viewBox, setViewBox] = useState({ x: -500, y: -500, w: 1000, h: 1000 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    // Zoom handling
    const handleWheel = (e) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 1.1 : 0.9;
        setViewBox(prev => ({
            x: prev.x + (prev.w - prev.w * scale) / 2,
            y: prev.y + (prev.h - prev.h * scale) / 2,
            w: prev.w * scale,
            h: prev.h * scale
        }));
    };

    // Pan handling
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPan({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - startPan.x) * (viewBox.w / svgRef.current.clientWidth);
        const dy = (e.clientY - startPan.y) * (viewBox.h / svgRef.current.clientHeight);

        setViewBox(prev => ({
            ...prev,
            x: prev.x - dx,
            y: prev.y - dy
        }));
        setStartPan({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Recursive render function
    const renderEntity = (entity, parentX = 0, parentY = 0) => {
        // Calculate position based on orbit (simplified for static view, usually would involve angle)
        // For this mockup, we'll place them at a fixed angle for visualization or random
        // To make it look like a system, we can use a simple angle offset based on ID hash or index

        // NOTE: In a real game loop, this would be dynamic. 
        // Here we assume 'orbit' has radius. We need an angle. 
        // Let's generate a pseudo-random angle based on name length to keep it deterministic but varied.
        const angle = (entity.name.length * 37) % 360;
        const rad = (angle * Math.PI) / 180;

        const x = parentX + (entity.orbit.radius * Math.cos(rad));
        const y = parentY + (entity.orbit.radius * Math.sin(rad));

        let Component;
        switch (entity.type) {
            case 'STAR': Component = Star; break;
            case 'PLANET': Component = Planet; break;
            case 'MOON': Component = Moon; break;
            case 'STATION': Component = Station; break;
            default: Component = () => null;
        }

        return (
            <g key={entity.id}>
                {/* Draw Orbit if it has a radius > 0 */}
                {entity.orbit.radius > 0 && (
                    <g transform={`translate(${parentX}, ${parentY})`}>
                        <Orbit radius={entity.orbit.radius} color={entity.color} />
                    </g>
                )}

                {/* Draw Entity */}
                <Component
                    x={entity.orbit.radius > 0 ? x : parentX}
                    y={entity.orbit.radius > 0 ? y : parentY}
                    radius={entity.radius}
                    color={entity.color}
                    name={entity.name}
                />

                {/* Recursively draw children */}
                {entity.children && entity.children.map(child =>
                    renderEntity(child, entity.orbit.radius > 0 ? x : parentX, entity.orbit.radius > 0 ? y : parentY)
                )}
            </g>
        );
    };

    return (
        <div className="w-full h-full bg-[#000500] overflow-hidden relative cursor-move">
            <svg
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                className="w-full h-full"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 L 0 50" fill="none" stroke="#00ffaa" strokeWidth="0.2" opacity="0.2" />
                    </pattern>
                </defs>

                {/* Background Grid */}
                <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.w + 2000} height={viewBox.h + 2000} fill="url(#grid)" />

                {/* Solar System Root */}
                <g transform="translate(0,0)">
                    {data.entities.map(entity => renderEntity(entity))}
                </g>
            </svg>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="bg-[#001100] border border-[#005533] px-2 py-1 text-[#00ffaa] text-xs opacity-80">
                    ZOOM: RUEDA | PAN: ARRASTRAR
                </div>
            </div>
        </div>
    );
};

export default MapView;
