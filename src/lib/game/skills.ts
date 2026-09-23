/**
 * Catálogo de habilidades: el árbol que define lo que un piloto sabe hacer.
 *
 * Es un catálogo estático, sin estado: qué habilidades existen, a qué familia
 * pertenecen, cuánto cuestan y qué exigen antes. El progreso de un piloto
 * concreto no vive acá, sino en su experiencia acumulada (ver `progression`).
 *
 * Corresponde a docs/systems/SKILLS.md.
 */

import { indexByCode, lookup } from './catalog';

export const MIN_DIFFICULTY = 1;

/**
 * El rango más caro que puede tener una habilidad.
 *
 * **Dieciséis y no cinco**, como en EVE y por el mismo motivo: con un techo de
 * cinco, la habilidad más cara del juego cuesta lo mismo que cinco baratas y no
 * hay forma de declarar que algo es el trabajo de una carrera. Con dieciséis, el
 * tope son más de tres mil horas de acción y queda lugar para todo lo que hay en
 * el medio.
 *
 * La escalera con la que se elige el rango de una habilidad nueva está en
 * docs/systems/SKILLS.md, «El rango de cada habilidad»: no se inventa caso
 * por caso.
 */
export const MAX_DIFFICULTY = 16;

/**
 * Las ocho ramas en que se agrupa el catálogo.
 *
 * **La familia es la moneda de la progresión**, no una etiqueta: el pozo de
 * experiencia se llena por rama y se gasta adentro de ella. Por eso una familia de
 * más es un pozo más que llenar, y una de menos es una actividad que termina
 * financiando a otra que no le corresponde.
 *
 * Eran seis y son ocho. Las dos que se separaron:
 *
 * - **Industria** estaba repartida entre Extracción e Ingeniería, y eso hacía que
 *   el que fabrica pagara su oficio minando — justo lo que el pozo por familia
 *   viene a evitar.
 * - **Mando** es la gente: flota, diplomacia, lo que se consigue con otros y no
 *   con la nave. Nace chica a propósito; lo que la va a llenar todavía no existe.
 *
 * El orden es el que dibuja la figura del piloto, así que mover una entrada mueve
 * un vértice. El código va en inglés y el nombre que ve el jugador vive en
 * `format`, junto al del resto de las enumeraciones del juego.
 */
export const SKILL_FAMILIES = [
	'piloting',
	'engineering',
	'extraction',
	'industry',
	'trade',
	'combat',
	'science',
	'command'
] as const;

export type SkillFamily = (typeof SKILL_FAMILIES)[number];

/** Nivel mínimo de otra habilidad para poder entrenar ésta. */
export interface Requirement {
	readonly skill: string;
	readonly level: number;
}

/**
 * Una habilidad del catálogo.
 *
 * `difficulty` es el **rango**, de x1 a x16: cuántas veces la curva base de
 * experiencia cuesta esta habilidad. Sale de la escalera de docs/systems/SKILLS.md
 * y no del gusto; si una parece merecer un rango que la escalera no le da, lo que
 * está mal es dónde se la puso en el árbol.
 */
export interface Skill {
	readonly code: string;
	readonly name: string;
	readonly family: SkillFamily;
	readonly difficulty: number;
	readonly governs: string;
	readonly requirements: readonly Requirement[];
}

/**
 * El orden dentro de cada familia va de la habilidad de entrada a la más
 * profunda, que es como se lee en la interfaz.
 */
/**
 * El catálogo.
 *
 * Ciento once habilidades. Parece mucho y es el punto: **un catálogo que se
 * termina es un catálogo chico**, y este juego se piensa en años. Lo que hace que
 * no sea inabarcable no es el tamaño sino la forma — cada familia tiene una
 * habilidad de entrada que cualquiera puede empezar, y de ahí sale una rama por
 * oficio.
 *
 * **No todas mueven un número todavía.** Las de Combate, Industria y buena parte
 * de Ciencias son llaves de verbos que no existen, y entran igual porque el árbol
 * es lo que le dice al jugador en qué se puede convertir. Lo que las mantiene
 * honestas es otra cosa: una familia que ninguna acción paga **no tiene pozo**, y
 * sin pozo no se puede invertir en ella. Ver `TRAINABLE_FAMILIES` en `actions.ts`.
 *
 * El orden dentro de cada familia va de la habilidad de entrada a la más
 * profunda, que es como se lee en la interfaz.
 *
 * El plano completo, con el porqué de cada rango, está en «El catálogo» de
 * docs/systems/SKILLS.md.
 */
const CATALOG = [
	// --- Pilotaje: dónde y cómo se mueve la nave ---
	{
		code: 'shuttle_handling',
		name: 'Manejo de lanzaderas',
		family: 'piloting',
		difficulty: 1,
		governs: 'Requisito de la clase lanzadera',
		requirements: []
	},
	// **Navegación cambió de qué gobierna, y no por gusto.** Movía el reloj de los
	// viajes dentro del sistema hasta que ese reloj pasó a ser alineación más warp:
	// la alineación es de Maniobra y la velocidad de warp es del casco, como en EVE,
	// donde ninguna habilidad la sube. Lo que le queda es la velocidad sub-warp
	// —dormida hasta el combate— y **el acceso al equipo de warp**, que es lo que
	// sigue haciendo que entrenarla valga hoy.
	{
		code: 'navigation',
		name: 'Navegación',
		family: 'piloting',
		difficulty: 1,
		governs: 'Velocidad sub-warp y acceso al equipo de warp',
		requirements: []
	},
	// Maniobra **estrena verbo**: prometía esto desde que existe el catálogo y no
	// movía nada, porque no había alineación que acortar. Ahora divide la agilidad
	// —masa por inercia— desde la tabla de bonos de `fitting`, y es lo único del
	// reloj de un viaje que el piloto puede mejorar entrenando.
	{
		code: 'maneuvering',
		name: 'Maniobra',
		family: 'piloting',
		difficulty: 2,
		governs: 'Tiempo de alineación antes de salir',
		requirements: [{ skill: 'navigation', level: 2 }]
	},
	{
		code: 'fuel_efficiency',
		name: 'Eficiencia de combustible',
		family: 'piloting',
		difficulty: 2,
		governs: 'Consumo por salto y por maniobra',
		requirements: [{ skill: 'navigation', level: 2 }]
	},
	{
		code: 'light_ships',
		name: 'Naves ligeras',
		family: 'piloting',
		difficulty: 2,
		governs: 'Requisito de la clase corbeta',
		requirements: [{ skill: 'shuttle_handling', level: 3 }]
	},
	{
		code: 'astrogation',
		name: 'Astrogación',
		family: 'piloting',
		difficulty: 3,
		governs: 'Saltos entre sistemas: tiempo y precisión',
		requirements: [{ skill: 'navigation', level: 3 }]
	},
	{
		code: 'industrial_ships',
		name: 'Naves industriales',
		family: 'piloting',
		difficulty: 3,
		governs: 'Requisito de la clase industrial',
		requirements: [{ skill: 'light_ships', level: 3 }]
	},
	{
		code: 'destroyers',
		name: 'Destructores',
		family: 'piloting',
		difficulty: 3,
		governs: 'Requisito de la clase destructor',
		requirements: [{ skill: 'light_ships', level: 3 }]
	},
	{
		code: 'jump_calculus',
		name: 'Cálculo de saltos',
		family: 'piloting',
		difficulty: 4,
		governs: 'Alcance de salto',
		requirements: [{ skill: 'astrogation', level: 3 }]
	},
	{
		code: 'mining_barges',
		name: 'Barcazas mineras',
		family: 'piloting',
		difficulty: 4,
		governs: 'Requisito de la clase barcaza',
		requirements: [
			{ skill: 'industrial_ships', level: 3 },
			{ skill: 'mining', level: 4 }
		]
	},
	{
		code: 'evasive_flying',
		name: 'Pilotaje evasivo',
		family: 'piloting',
		difficulty: 4,
		governs: 'Firma mientras se está en movimiento',
		requirements: [{ skill: 'maneuvering', level: 3 }]
	},
	{
		code: 'cruisers',
		name: 'Cruceros',
		family: 'piloting',
		difficulty: 5,
		governs: 'Requisito de la clase crucero',
		requirements: [{ skill: 'destroyers', level: 3 }]
	},
	{
		code: 'fast_transports',
		name: 'Transportes rápidos',
		family: 'piloting',
		difficulty: 6,
		governs: 'Requisito de la clase transporte',
		requirements: [
			{ skill: 'industrial_ships', level: 4 },
			{ skill: 'maneuvering', level: 4 }
		]
	},
	{
		code: 'freighters',
		name: 'Cargueros',
		family: 'piloting',
		difficulty: 6,
		governs: 'Requisito de la clase carguero',
		requirements: [{ skill: 'industrial_ships', level: 5 }]
	},
	{
		code: 'recon_ships',
		name: 'Naves de reconocimiento',
		family: 'piloting',
		difficulty: 6,
		governs: 'Requisito de la clase explorador pesado',
		requirements: [
			{ skill: 'light_ships', level: 5 },
			{ skill: 'scanning', level: 4 }
		]
	},
	{
		code: 'exhumers',
		name: 'Exhumadoras',
		family: 'piloting',
		difficulty: 6,
		governs: 'Requisito de la clase exhumadora',
		requirements: [{ skill: 'mining_barges', level: 5 }]
	},
	{
		code: 'battleships',
		name: 'Acorazados',
		family: 'piloting',
		difficulty: 8,
		governs: 'Requisito de la clase acorazado',
		requirements: [{ skill: 'cruisers', level: 5 }]
	},
	{
		code: 'capital_ships',
		name: 'Naves capitales',
		family: 'piloting',
		difficulty: 12,
		governs: 'Requisito de la clase capital',
		requirements: [
			{ skill: 'battleships', level: 5 },
			{ skill: 'fleet_formation', level: 4 }
		]
	},

	// --- Ingeniería: los sistemas de la nave ---
	{
		code: 'mechanics',
		name: 'Mecánica',
		family: 'engineering',
		difficulty: 1,
		governs: 'Estructura del casco y tiempo de reparación',
		requirements: []
	},
	{
		code: 'power_management',
		name: 'Gestión de energía',
		family: 'engineering',
		difficulty: 2,
		governs: 'Grilla de poder disponible',
		requirements: [{ skill: 'mechanics', level: 2 }]
	},
	{
		code: 'cargo_engineering',
		name: 'Ingeniería de bodega',
		family: 'engineering',
		difficulty: 2,
		governs: 'Capacidad efectiva de carga',
		requirements: [{ skill: 'mechanics', level: 2 }]
	},
	{
		code: 'armor',
		name: 'Blindaje',
		family: 'engineering',
		difficulty: 2,
		governs: 'Puntos de blindaje',
		requirements: [{ skill: 'mechanics', level: 2 }]
	},
	{
		code: 'shields',
		name: 'Escudos',
		family: 'engineering',
		difficulty: 2,
		governs: 'Capacidad de escudo',
		requirements: [{ skill: 'power_management', level: 2 }]
	},
	{
		code: 'module_fitting',
		name: 'Ajuste de módulos',
		family: 'engineering',
		difficulty: 3,
		governs: 'Cómputo disponible; requisito de módulos avanzados',
		requirements: [
			{ skill: 'mechanics', level: 3 },
			{ skill: 'power_management', level: 2 }
		]
	},
	{
		code: 'capacitor',
		name: 'Capacitor',
		family: 'engineering',
		difficulty: 3,
		governs: 'Capacidad del acumulador',
		requirements: [{ skill: 'power_management', level: 3 }]
	},
	{
		code: 'shield_recharge',
		name: 'Recarga de escudos',
		family: 'engineering',
		difficulty: 3,
		governs: 'Velocidad de recarga del escudo',
		requirements: [{ skill: 'shields', level: 3 }]
	},
	{
		code: 'hull_repair',
		name: 'Reparación de casco',
		family: 'engineering',
		difficulty: 3,
		governs: 'Rendimiento de los módulos de reparación',
		requirements: [{ skill: 'mechanics', level: 3 }]
	},
	// **Dormida, y de las más dormidas que hay**: no tiene fila en la tabla de bonos
	// y hasta hoy aparecía una sola vez en todo el proyecto, que es esta definición.
	// Lo que gobierna es el empuje, que es velocidad sub-warp, así que **la despierta
	// el combate** junto con los propulsores auxiliares. Se queda en el árbol porque
	// es lo que le dice al jugador en qué se puede convertir, que es media función
	// del catálogo.
	{
		code: 'propulsion_engineering',
		name: 'Ingeniería de propulsión',
		family: 'engineering',
		difficulty: 4,
		governs: 'Empuje de los propulsores',
		requirements: [{ skill: 'power_management', level: 3 }]
	},
	{
		code: 'armor_compensation',
		name: 'Compensación de blindaje',
		family: 'engineering',
		difficulty: 4,
		governs: 'Resistencias del blindaje',
		requirements: [{ skill: 'armor', level: 4 }]
	},
	{
		code: 'shield_compensation',
		name: 'Compensación de escudos',
		family: 'engineering',
		difficulty: 4,
		governs: 'Resistencias del escudo',
		requirements: [{ skill: 'shields', level: 4 }]
	},
	{
		code: 'rig_fitting',
		name: 'Montaje de refuerzos',
		family: 'engineering',
		difficulty: 4,
		governs: 'Requisito y penalización de los refuerzos de casco',
		requirements: [{ skill: 'module_fitting', level: 3 }]
	},
	{
		code: 'emergency_systems',
		name: 'Sistemas de emergencia',
		family: 'engineering',
		difficulty: 4,
		governs: 'Qué queda encendido cuando falta potencia',
		requirements: [{ skill: 'power_management', level: 4 }]
	},
	{
		code: 'thermodynamics',
		name: 'Termodinámica',
		family: 'engineering',
		difficulty: 5,
		governs: 'Sobrecargar un módulo sin quemarlo',
		requirements: [{ skill: 'module_fitting', level: 4 }]
	},
	{
		code: 'advanced_engineering',
		name: 'Ingeniería avanzada',
		family: 'engineering',
		difficulty: 8,
		governs: 'Requisito de los módulos de escalón A',
		requirements: [{ skill: 'module_fitting', level: 5 }]
	},

	// --- Extracción: sacarlo de donde está ---
	{
		code: 'mining',
		name: 'Minería',
		family: 'extraction',
		difficulty: 1,
		governs: 'Rendimiento por ciclo de láser',
		requirements: []
	},
	{
		code: 'stowage',
		name: 'Estiba',
		family: 'extraction',
		difficulty: 1,
		governs: 'Cuánto compacta el mineral en bodega',
		requirements: []
	},
	{
		code: 'belt_survey',
		name: 'Supervisión de cinturón',
		family: 'extraction',
		difficulty: 2,
		governs: 'Qué se ve de un cinturón sin escanear cada roca',
		requirements: [{ skill: 'mining', level: 2 }]
	},
	{
		code: 'prospecting',
		name: 'Prospección',
		family: 'extraction',
		difficulty: 3,
		governs: 'Profundidad de la lectura de una roca',
		requirements: [
			{ skill: 'mining', level: 3 },
			{ skill: 'scanning', level: 2 }
		]
	},
	{
		code: 'ice_harvesting',
		name: 'Extracción de hielo',
		family: 'extraction',
		difficulty: 3,
		governs: 'Rendimiento y ciclo de los cosechadores de hielo',
		requirements: [{ skill: 'mining', level: 3 }]
	},
	{
		code: 'ring_mining',
		name: 'Explotación de anillos',
		family: 'extraction',
		difficulty: 3,
		governs: 'Rendimiento en anillos planetarios',
		requirements: [{ skill: 'mining', level: 3 }]
	},
	{
		code: 'strip_mining',
		name: 'Láseres de tira',
		family: 'extraction',
		difficulty: 4,
		governs: 'Requisito y rendimiento de los láseres de tira',
		requirements: [
			{ skill: 'mining', level: 4 },
			{ skill: 'mining_barges', level: 1 }
		]
	},
	{
		code: 'mining_crystals',
		name: 'Cristales de extracción',
		family: 'extraction',
		difficulty: 4,
		governs: 'Cuánto dura un cristal y cuánto suma',
		requirements: [{ skill: 'strip_mining', level: 2 }]
	},
	{
		code: 'gas_harvesting',
		name: 'Extracción de gas',
		family: 'extraction',
		difficulty: 4,
		governs: 'Rendimiento de los aspiradores de nube',
		requirements: [
			{ skill: 'mining', level: 4 },
			{ skill: 'scanning', level: 3 }
		]
	},
	{
		code: 'planetary_mining',
		name: 'Extracción planetaria',
		family: 'extraction',
		difficulty: 4,
		governs: 'Qué se puede sacar de la superficie de un planeta',
		requirements: [
			{ skill: 'mining', level: 3 },
			{ skill: 'scanning', level: 3 }
		]
	},
	{
		code: 'salvaging',
		name: 'Recuperación de pecios',
		family: 'extraction',
		difficulty: 4,
		governs: 'Qué se saca de una nave destruida',
		requirements: [
			{ skill: 'mechanics', level: 3 },
			{ skill: 'scanning', level: 3 }
		]
	},
	{
		code: 'mining_yield',
		name: 'Rendimiento de extracción',
		family: 'extraction',
		difficulty: 5,
		governs: 'Bono general sobre todo lo que se extrae',
		requirements: [{ skill: 'mining', level: 5 }]
	},
	{
		code: 'deep_core_mining',
		name: 'Extracción profunda',
		family: 'extraction',
		difficulty: 5,
		governs: 'Acceso a los minerales que sólo hay sin ley',
		requirements: [
			{ skill: 'strip_mining', level: 4 },
			{ skill: 'prospecting', level: 4 }
		]
	},
	{
		code: 'mining_drones',
		name: 'Drones de extracción',
		family: 'extraction',
		difficulty: 5,
		governs: 'Cuántos drones mineros se controlan',
		requirements: [
			{ skill: 'mining', level: 4 },
			{ skill: 'drones', level: 3 }
		]
	},
	{
		code: 'industrial_mining',
		name: 'Explotación industrial',
		family: 'extraction',
		difficulty: 8,
		governs: 'Bono de rendimiento de las clases pesadas',
		requirements: [
			{ skill: 'exhumers', level: 3 },
			{ skill: 'mining_yield', level: 4 }
		]
	},

	// --- Industria: convertirlo en otra cosa ---
	{
		code: 'refining',
		name: 'Refinado',
		family: 'industry',
		difficulty: 1,
		governs: 'Rendimiento del refinado en estación',
		requirements: []
	},
	{
		code: 'manufacturing',
		name: 'Fabricación',
		family: 'industry',
		difficulty: 1,
		governs: 'Requisito para fabricar; tiempo de trabajo',
		requirements: []
	},
	{
		code: 'munitions',
		name: 'Munición y cargas',
		family: 'industry',
		difficulty: 2,
		governs: 'Fabricar munición, cristales y cargas',
		requirements: [{ skill: 'manufacturing', level: 2 }]
	},
	{
		code: 'recycling',
		name: 'Reciclaje',
		family: 'industry',
		difficulty: 2,
		governs: 'Qué se recupera al desarmar un módulo',
		requirements: [{ skill: 'refining', level: 2 }]
	},
	{
		code: 'components',
		name: 'Componentes',
		family: 'industry',
		difficulty: 2,
		governs: 'Fabricar los componentes intermedios',
		requirements: [{ skill: 'manufacturing', level: 2 }]
	},
	{
		code: 'ore_appraisal',
		name: 'Tasación de mena',
		family: 'industry',
		difficulty: 2,
		governs: 'Estimar el rinde de un lote antes de refinarlo',
		requirements: [
			{ skill: 'refining', level: 2 },
			{ skill: 'materials_analysis', level: 2 }
		]
	},
	{
		code: 'industrial_chemistry',
		name: 'Química industrial',
		family: 'industry',
		difficulty: 3,
		governs: 'Procesar gas y hielo en insumos utilizables',
		requirements: [{ skill: 'refining', level: 3 }]
	},
	{
		code: 'time_efficiency',
		name: 'Eficiencia de tiempo',
		family: 'industry',
		difficulty: 3,
		governs: 'Cuánto tarda un trabajo de fabricación',
		requirements: [{ skill: 'manufacturing', level: 3 }]
	},
	{
		code: 'blueprints',
		name: 'Planos y licencias',
		family: 'industry',
		difficulty: 3,
		governs: 'Cuántos planos se pueden tener en uso',
		requirements: [{ skill: 'manufacturing', level: 3 }]
	},
	{
		code: 'mass_production',
		name: 'Producción en serie',
		family: 'industry',
		difficulty: 3,
		governs: 'Cuántos trabajos simultáneos',
		requirements: [{ skill: 'manufacturing', level: 4 }]
	},
	{
		code: 'material_efficiency',
		name: 'Eficiencia de material',
		family: 'industry',
		difficulty: 4,
		governs: 'Cuánto material se ahorra por trabajo',
		requirements: [{ skill: 'manufacturing', level: 4 }]
	},
	{
		code: 'module_engineering',
		name: 'Ingeniería de módulos',
		family: 'industry',
		difficulty: 4,
		governs: 'Fabricar módulos de escalón intermedio',
		requirements: [
			{ skill: 'components', level: 3 },
			{ skill: 'module_fitting', level: 3 }
		]
	},
	{
		code: 'crystallography',
		name: 'Cristalografía',
		family: 'industry',
		difficulty: 4,
		governs: 'Fabricar cristales de extracción',
		requirements: [
			{ skill: 'components', level: 3 },
			{ skill: 'mining_crystals', level: 2 }
		]
	},
	{
		code: 'advanced_manufacturing',
		name: 'Fabricación avanzada',
		family: 'industry',
		difficulty: 5,
		governs: 'Fabricar módulos de escalón A',
		requirements: [{ skill: 'module_engineering', level: 4 }]
	},
	{
		code: 'hull_construction',
		name: 'Construcción de cascos',
		family: 'industry',
		difficulty: 6,
		governs: 'Fabricar cascos',
		requirements: [
			{ skill: 'components', level: 4 },
			{ skill: 'mass_production', level: 3 }
		]
	},
	{
		code: 'capital_industry',
		name: 'Industria de capital',
		family: 'industry',
		difficulty: 12,
		governs: 'Fabricar cascos y estructuras de clase capital',
		requirements: [{ skill: 'hull_construction', level: 5 }]
	},

	// --- Comercio: moverlo y venderlo ---
	{
		code: 'haggling',
		name: 'Regateo',
		family: 'trade',
		difficulty: 1,
		governs: 'Margen con la estación y comisión del corredor',
		requirements: []
	},
	{
		code: 'appraisal',
		name: 'Tasación',
		family: 'trade',
		difficulty: 2,
		governs: 'Ver el valor real de lo que se compra o se vende',
		requirements: [{ skill: 'haggling', level: 2 }]
	},
	{
		code: 'accounting',
		name: 'Contabilidad',
		family: 'trade',
		difficulty: 2,
		governs: 'Impuesto de venta y cuántas órdenes podés llevar',
		requirements: [{ skill: 'haggling', level: 2 }]
	},
	{
		code: 'tariffs',
		name: 'Aranceles',
		family: 'trade',
		difficulty: 3,
		governs: 'Qué se paga al operar fuera de la propia bandera',
		requirements: [{ skill: 'accounting', level: 3 }]
	},
	{
		code: 'market_analysis',
		name: 'Análisis de mercado',
		family: 'trade',
		difficulty: 3,
		governs: 'Cuántas regiones del mercado ves',
		requirements: [{ skill: 'haggling', level: 3 }]
	},
	{
		code: 'brokerage',
		name: 'Corretaje',
		family: 'trade',
		difficulty: 4,
		governs: 'Comisión al publicar una orden',
		requirements: [{ skill: 'accounting', level: 4 }]
	},
	{
		code: 'contacts',
		name: 'Contactos',
		family: 'trade',
		difficulty: 4,
		governs: 'Cuánto tiempo puede quedar publicada una orden',
		requirements: [
			{ skill: 'haggling', level: 4 },
			{ skill: 'accounting', level: 3 }
		]
	},
	{
		code: 'contracts',
		name: 'Contratos',
		family: 'trade',
		difficulty: 4,
		governs: 'Cuántos contratos propios se sostienen',
		requirements: [{ skill: 'brokerage', level: 3 }]
	},
	{
		code: 'trade_logistics',
		name: 'Logística comercial',
		family: 'trade',
		difficulty: 4,
		governs: 'Costo de mover carga por encargo',
		requirements: [{ skill: 'accounting', level: 3 }]
	},
	{
		code: 'speculation',
		name: 'Especulación',
		family: 'trade',
		difficulty: 5,
		governs: 'Ver el histórico de precios y su tendencia',
		requirements: [{ skill: 'market_analysis', level: 4 }]
	},
	{
		code: 'trade_networks',
		name: 'Redes comerciales',
		family: 'trade',
		difficulty: 6,
		governs: 'Alcance de las órdenes a distancia',
		requirements: [
			{ skill: 'market_analysis', level: 5 },
			{ skill: 'contacts', level: 4 }
		]
	},

	// --- Combate: y no perder la carga ---
	{
		code: 'gunnery',
		name: 'Puntería',
		family: 'combat',
		difficulty: 1,
		governs: 'Daño base de las armas montadas',
		requirements: []
	},
	{
		code: 'targeting',
		name: 'Enganche',
		family: 'combat',
		difficulty: 2,
		governs: 'A cuántos blancos se apunta y a qué distancia',
		requirements: [{ skill: 'gunnery', level: 2 }]
	},
	{
		code: 'mass_cannons',
		name: 'Cañones de masa',
		family: 'combat',
		difficulty: 2,
		governs: 'Daño cinético',
		requirements: [{ skill: 'gunnery', level: 3 }]
	},
	{
		code: 'ion_emitters',
		name: 'Emisores iónicos',
		family: 'combat',
		difficulty: 2,
		governs: 'Daño iónico',
		requirements: [
			{ skill: 'gunnery', level: 3 },
			{ skill: 'power_management', level: 2 }
		]
	},
	{
		code: 'thermal_lances',
		name: 'Lanzas térmicas',
		family: 'combat',
		difficulty: 2,
		governs: 'Daño térmico',
		requirements: [{ skill: 'gunnery', level: 3 }]
	},
	{
		code: 'ammunition',
		name: 'Municiones',
		family: 'combat',
		difficulty: 2,
		governs: 'Qué cargas se pueden usar y cuánto rinden',
		requirements: [{ skill: 'gunnery', level: 2 }]
	},
	{
		code: 'rate_of_fire',
		name: 'Cadencia',
		family: 'combat',
		difficulty: 3,
		governs: 'Tiempo de ciclo de las armas',
		requirements: [{ skill: 'gunnery', level: 4 }]
	},
	{
		code: 'precision',
		name: 'Precisión',
		family: 'combat',
		difficulty: 3,
		governs: 'Cuánto pega a blanco chico o rápido',
		requirements: [{ skill: 'targeting', level: 3 }]
	},
	{
		code: 'drones',
		name: 'Drones',
		family: 'combat',
		difficulty: 3,
		governs: 'Cuántos drones se controlan',
		requirements: [{ skill: 'module_fitting', level: 2 }]
	},
	{
		code: 'electronic_warfare',
		name: 'Guerra electrónica',
		family: 'combat',
		difficulty: 4,
		governs: 'Interferir, trabar o escapar de un enganche',
		requirements: [
			{ skill: 'power_management', level: 3 },
			{ skill: 'scanning', level: 2 }
		]
	},
	{
		code: 'sensor_disruption',
		name: 'Perturbación de sensores',
		family: 'combat',
		difficulty: 4,
		governs: 'Bajar los sensores del otro',
		requirements: [{ skill: 'electronic_warfare', level: 3 }]
	},
	{
		code: 'jump_inhibition',
		name: 'Inhibición de salto',
		family: 'combat',
		difficulty: 5,
		governs: 'Impedir que el otro salte',
		requirements: [
			{ skill: 'electronic_warfare', level: 4 },
			{ skill: 'astrogation', level: 3 }
		]
	},
	{
		code: 'heavy_artillery',
		name: 'Artillería pesada',
		family: 'combat',
		difficulty: 6,
		governs: 'Armas de clase 5 en adelante',
		requirements: [
			{ skill: 'rate_of_fire', level: 4 },
			{ skill: 'cruisers', level: 3 }
		]
	},

	// --- Ciencias: encontrar, entender y esconderse ---
	{
		code: 'sensors',
		name: 'Sensores',
		family: 'science',
		difficulty: 1,
		governs: 'Alcance de los sensores pasivos',
		requirements: []
	},
	{
		code: 'scanning',
		name: 'Escaneo',
		family: 'science',
		difficulty: 2,
		governs: 'Alcance y calidad del escáner activo',
		requirements: []
	},
	{
		code: 'materials_analysis',
		name: 'Análisis de materiales',
		family: 'science',
		difficulty: 2,
		governs: 'Identificar lo que se extrae o se encuentra',
		requirements: [{ skill: 'scanning', level: 2 }]
	},
	{
		code: 'survey_probes',
		name: 'Sondas de exploración',
		family: 'science',
		difficulty: 3,
		governs: 'Cuántas sondas se lanzan y cómo se ubican',
		requirements: [{ skill: 'scanning', level: 3 }]
	},
	{
		code: 'signature_analysis',
		name: 'Análisis de firmas',
		family: 'science',
		difficulty: 3,
		governs: 'Distinguir qué es una señal antes de ir',
		requirements: [{ skill: 'survey_probes', level: 2 }]
	},
	{
		code: 'cartography',
		name: 'Cartografía',
		family: 'science',
		difficulty: 3,
		governs: 'Registrar rutas y sistemas no cartografiados',
		requirements: [
			{ skill: 'scanning', level: 3 },
			{ skill: 'astrogation', level: 2 }
		]
	},
	{
		code: 'signature_profile',
		name: 'Perfil de firma',
		family: 'science',
		difficulty: 4,
		governs: 'Bajar la propia firma: no ser encontrado',
		requirements: [{ skill: 'sensors', level: 3 }]
	},
	{
		code: 'astrometrics',
		name: 'Astrometría',
		family: 'science',
		difficulty: 4,
		governs: 'Fuerza de escaneo: qué tan débil puede ser la señal',
		requirements: [{ skill: 'survey_probes', level: 3 }]
	},
	{
		code: 'archaeology',
		name: 'Arqueología',
		family: 'science',
		difficulty: 4,
		governs: 'Abrir yacimientos y restos',
		requirements: [{ skill: 'signature_analysis', level: 3 }]
	},
	{
		code: 'cryptography',
		name: 'Criptografía',
		family: 'science',
		difficulty: 4,
		governs: 'Abrir depósitos de datos',
		requirements: [{ skill: 'signature_analysis', level: 3 }]
	},
	{
		code: 'counter_surveillance',
		name: 'Contravigilancia',
		family: 'science',
		difficulty: 5,
		governs: 'Detectar que a uno lo están escaneando',
		requirements: [{ skill: 'signature_profile', level: 4 }]
	},
	{
		code: 'tracking',
		name: 'Rastreo',
		family: 'science',
		difficulty: 5,
		governs: 'Encontrar una nave concreta y no una señal',
		requirements: [{ skill: 'astrometrics', level: 4 }]
	},
	{
		code: 'research',
		name: 'Investigación',
		family: 'science',
		difficulty: 5,
		governs: 'Mejorar planos: material y tiempo',
		requirements: [{ skill: 'materials_analysis', level: 4 }]
	},
	{
		code: 'jump_physics',
		name: 'Física de salto',
		family: 'science',
		difficulty: 6,
		governs: 'Entender y usar pasajes no cartografiados',
		requirements: [
			{ skill: 'cartography', level: 4 },
			{ skill: 'jump_calculus', level: 3 }
		]
	},
	{
		code: 'xenoarchaeology',
		name: 'Xenoarqueología',
		family: 'science',
		difficulty: 8,
		governs: 'Los restos que nadie sabe leer todavía',
		requirements: [
			{ skill: 'archaeology', level: 5 },
			{ skill: 'cryptography', level: 4 }
		]
	},

	// --- Mando: la gente, que es el recurso que no se mina ---
	{
		code: 'leadership',
		name: 'Liderazgo',
		family: 'command',
		difficulty: 1,
		governs: 'Cuánto se reparte de los bonos de mando',
		requirements: []
	},
	{
		code: 'negotiation',
		name: 'Negociación',
		family: 'command',
		difficulty: 3,
		governs: 'Recompensa de los contratos de agente',
		requirements: [
			{ skill: 'leadership', level: 2 },
			{ skill: 'haggling', level: 3 }
		]
	},
	{
		code: 'fleet_formation',
		name: 'Vuelo en formación',
		family: 'command',
		difficulty: 4,
		governs: 'Cuántas naves coordina una flota',
		requirements: [{ skill: 'leadership', level: 3 }]
	},
	{
		code: 'escort_tactics',
		name: 'Tácticas de escolta',
		family: 'command',
		difficulty: 4,
		governs: 'Bono a lo que se protege, no a uno mismo',
		requirements: [
			{ skill: 'leadership', level: 3 },
			{ skill: 'targeting', level: 3 }
		]
	},
	{
		code: 'fleet_command',
		name: 'Mando de flota',
		family: 'command',
		difficulty: 6,
		governs: 'Bono que se reparte a toda la flota',
		requirements: [{ skill: 'fleet_formation', level: 3 }]
	},
	{
		code: 'corporate_diplomacy',
		name: 'Diplomacia corporativa',
		family: 'command',
		difficulty: 6,
		governs: 'Reputación ganada por operar con una bandera',
		requirements: [{ skill: 'negotiation', level: 4 }]
	},
	{
		code: 'fleet_doctrine',
		name: 'Doctrina de flota',
		family: 'command',
		difficulty: 8,
		governs: 'Cuántos bonos de mando se sostienen a la vez',
		requirements: [{ skill: 'fleet_command', level: 4 }]
	}
] as const satisfies readonly Skill[];

/** El código de cualquier habilidad del catálogo. */
export type SkillCode = (typeof CATALOG)[number]['code'];

/** El catálogo en orden de declaración, que es el que dibuja el árbol. */
export const SKILL_LIST: readonly Skill[] = CATALOG;

/** El catálogo indexado por código. */
export const SKILLS = indexByCode(CATALOG);

/** Devuelve una habilidad por su código, o falla con un mensaje claro. */
export function getSkill(code: string): Skill {
	return lookup(SKILLS, code, 'la habilidad');
}

/** Agrupa el catálogo por familia, conservando el orden de declaración. */
export function skillsByFamily(): Record<SkillFamily, readonly Skill[]> {
	const grouped = Object.fromEntries(
		SKILL_FAMILIES.map((family) => [family, [] as Skill[]])
	) as Record<SkillFamily, Skill[]>;
	for (const skill of CATALOG) grouped[skill.family].push(skill);
	return grouped;
}

/** Las habilidades que se pueden entrenar sin haber entrenado nada antes. */
export function entrySkills(): readonly Skill[] {
	return CATALOG.filter((skill) => skill.requirements.length === 0);
}

/**
 * De una lista de requisitos, los que el piloto no cumple.
 *
 * Vive acá y no en cada catálogo porque **un requisito es un requisito**: el que
 * pide una habilidad para entrenarse, el que pide un módulo para montarse y el
 * que pide un casco para volarse se comprueban igual. Tres copias de esta
 * comparación serían tres lugares donde arreglar el mismo error.
 *
 * `levels` son los niveles actuales del piloto por código de habilidad; lo que no
 * está se considera nivel 0.
 */
export function unmetFrom(
	requirements: readonly Requirement[],
	levels: Readonly<Record<string, number>>
): readonly Requirement[] {
	return requirements.filter((requirement) => (levels[requirement.skill] ?? 0) < requirement.level);
}

/**
 * Requisitos que le faltan a un piloto para entrenar una habilidad.
 *
 * Devuelve una lista vacía si puede entrenarla.
 */
export function unmetRequirements(
	code: string,
	levels: Readonly<Record<string, number>>
): readonly Requirement[] {
	return unmetFrom(getSkill(code).requirements, levels);
}

/** ¿El piloto cumple los requisitos para entrenar esta habilidad? */
export function canTrain(code: string, levels: Readonly<Record<string, number>>): boolean {
	return unmetRequirements(code, levels).length === 0;
}
