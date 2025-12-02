import React from 'react';

const Moon = ({ x, y, radius, color, name }) => {
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Moon Body */}
            <circle r={radius} fill="none" stroke={color} strokeWidth="1" />

            {/* Label (smaller) */}
            <text
                y={radius + 8}
                textAnchor="middle"
                fill={color}
                fontSize="6"
                fontFamily="monospace"
                opacity="0.8"
                className="select-none"
            >
                {name}
            </text>
        </g>
    );
};

export default Moon;
