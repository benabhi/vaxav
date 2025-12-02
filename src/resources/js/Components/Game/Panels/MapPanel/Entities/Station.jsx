import React from 'react';

const Station = ({ x, y, radius, color, name }) => {
    const size = radius * 2;
    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Station Body (Square) */}
            <rect
                x={-radius}
                y={-radius}
                width={size}
                height={size}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
            />
            {/* Inner Detail (Cross) */}
            <line x1={-radius / 2} y1={0} x2={radius / 2} y2={0} stroke={color} strokeWidth="1" />
            <line x1={0} y1={-radius / 2} x2={0} y2={radius / 2} stroke={color} strokeWidth="1" />

            {/* Label */}
            <text
                y={radius + 10}
                textAnchor="middle"
                fill={color}
                fontSize="7"
                fontFamily="monospace"
                className="select-none"
            >
                {name}
            </text>
        </g>
    );
};

export default Station;
