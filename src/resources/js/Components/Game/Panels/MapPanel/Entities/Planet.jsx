import React from 'react';

const Planet = ({ x, y, radius, color, name }) => {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Planet Body */}
            <circle r={radius} fill="none" stroke={color} strokeWidth="1.5" />
            {/* Inner Detail */}
            <circle r={radius * 0.4} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" />

            {/* Label */}
            <text
                y={radius + 12}
                textAnchor="middle"
                fill={color}
                fontSize="8"
                fontFamily="monospace"
                className="select-none"
            >
                {name}
            </text>
        </g>
    );
};

export default Planet;
