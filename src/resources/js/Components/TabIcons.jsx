import React from 'react';

// Icono de Inventario - Grid tecnológico
export const InventoryIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" />
        <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        <circle cx="6.5" cy="17.5" r="1" fill="currentColor" />
        <circle cx="17.5" cy="17.5" r="1" fill="currentColor" />
    </svg>
);

// Icono de Mapa - Radar/Navegación
export const MapIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
        <line x1="3" y1="12" x2="7" y2="12" stroke="currentColor" strokeWidth="2" />
        <line x1="17" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <path d="M12 12 L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Icono de Estadísticas - Gráfico de barras
export const StatsIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="4" y="14" width="4" height="7" fill="currentColor" opacity="0.8" />
        <rect x="10" y="10" width="4" height="11" fill="currentColor" opacity="0.8" />
        <rect x="16" y="6" width="4" height="15" fill="currentColor" opacity="0.8" />
        <path d="M3 3 L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="18" cy="4" r="1.5" fill="currentColor" />
        <path d="M6 12 L12 8 L18 4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
);

// Icono de Chat - Ondas de comunicación
export const ChatIcon = ({ size = 16, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2C16.75 2 21 6.25 21 11.5Z"
            stroke="currentColor"
            strokeWidth="2"
        />
        <path d="M7 10 L10 13 L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11.5" cy="11.5" r="2" fill="currentColor" />
        <path d="M4 11.5 C4 11.5 6 9 8 9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
        <path d="M19 11.5 C19 11.5 17 14 15 14" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    </svg>
);

export default {
    InventoryIcon,
    MapIcon,
    StatsIcon,
    ChatIcon,
};
