export const solarSystemData = {
    id: 'system-alpha',
    name: 'SISTEMA ALPHA-7',
    type: 'SYSTEM',
    coords: { x: 0, y: 0 },
    entities: [
        {
            id: 'star-1',
            name: 'ALPHA CENTAURI',
            type: 'STAR',
            radius: 40, // Radio visual
            color: '#ffcc00',
            orbit: { radius: 0, speed: 0 },
            children: []
        },
        {
            id: 'planet-1',
            name: 'PRIME',
            type: 'PLANET',
            radius: 15,
            color: '#00ffaa',
            orbit: { radius: 150, speed: 0.5 },
            children: [
                {
                    id: 'moon-1',
                    name: 'LUNA-P1',
                    type: 'MOON',
                    radius: 5,
                    color: '#aaaaaa',
                    orbit: { radius: 30, speed: 2 },
                    children: [
                        {
                            id: 'station-1',
                            name: 'OUTPOST-7',
                            type: 'STATION',
                            radius: 6,
                            color: '#00ffff',
                            orbit: { radius: 12, speed: 1 },
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'planet-2',
            name: 'SECUNDUS',
            type: 'PLANET',
            radius: 20,
            color: '#ff5555',
            orbit: { radius: 280, speed: 0.3 },
            children: [
                {
                    id: 'moon-2',
                    name: 'PHOBOS-X',
                    type: 'MOON',
                    radius: 4,
                    color: '#cc4444',
                    orbit: { radius: 35, speed: 1.5 },
                    children: []
                },
                {
                    id: 'moon-3',
                    name: 'DEIMOS-X',
                    type: 'MOON',
                    radius: 3,
                    color: '#aa3333',
                    orbit: { radius: 50, speed: 1.2 },
                    children: []
                }
            ]
        },
        {
            id: 'planet-3',
            name: 'TERTIUS (GAS)',
            type: 'PLANET',
            radius: 35,
            color: '#aa00ff',
            orbit: { radius: 450, speed: 0.1 },
            children: []
        }
    ]
};
