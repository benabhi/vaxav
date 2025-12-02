import React from 'react';

const Star = ({ x, y, radius, color, name }) => {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Glow Effect */}
            <circle r={radius * 1.5} fill={color} opacity="0.2" />
            {/* Core */}
            <circle r={radius} fill="none" stroke={color} strokeWidth="2" />
            {/* Rays */}
            <line x1={-radius * 1.2} y1={0} x2={radius * 1.2} y2={0} stroke={color} strokeWidth="1" />
            <line x1={0} y1={-radius * 1.2} x2={0} y2={radius * 1.2} stroke={color} strokeWidth="1" />

            {/* Label */}
            <text
                y={radius + 15}
                textAnchor="middle"
                fill={color}
                fontSize="10"
                fontFamily="monospace"
                className="select-none"
            >
                {name}
            </text>
        </g>
    );
};

export default Star;
