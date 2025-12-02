import React from 'react';

const Orbit = ({ radius, color }) => {
    return (
        <circle
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="4 4"
            opacity="0.3"
            className="pointer-events-none"
        />
    );
};

export default Orbit;
