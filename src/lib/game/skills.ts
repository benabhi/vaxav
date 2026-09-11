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
export const MAX_DIFFICULTY = 5;

/**
 * Las seis ramas en que se agrupa el catálogo.
 *
 * El código va en inglés y el nombre que ve el jugador vive en `format`, junto
 * al del resto de las enumeraciones del juego.
 */
export const SKILL_FAMILIES = [
	'piloting',
	'engineering',
	'extraction',
	'trade',
	'combat',
	'science'
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
 * `difficulty` es el multiplicador de x1 a x5: cuántas veces la curva base de
 * experiencia cuesta esta habilidad.
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
const CATALOG = [
	// --- Pilotaje ---
	{
		code: 'shuttle_handling',
		name: 'Manejo de lanzaderas',
		family: 'piloting',
		difficulty: 1,
		governs: 'Requisito y bonos de las naves más chicas',
		requirements: []
	},
	{
		code: 'navigation',
		name: 'Navegación',
		family: 'piloting',
		difficulty: 1,
		governs: 'Velocidad de viaje dentro del sistema',
		requirements: []
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
		code: 'astrogation',
		name: 'Astrogación',
		family: 'piloting',
		difficulty: 3,
		governs: 'Saltos entre sistemas: tiempo y precisión',
		requirements: [{ skill: 'navigation', level: 3 }]
	},

	// --- Ingeniería ---
	{
		code: 'mechanics',
		name: 'Mecánica',
		family: 'engineering',
		difficulty: 1,
		governs: 'Reparaciones de casco y tiempo de mantenimiento',
		requirements: []
	},
	{
		code: 'power_management',
		name: 'Gestión de energía',
		family: 'engineering',
		difficulty: 2,
		governs: 'Cuántos módulos se pueden sostener encendidos',
		requirements: [{ skill: 'mechanics', level: 2 }]
	},
	{
		code: 'cargo_engineering',
		name: 'Ingeniería de bodega',
		family: 'engineering',
		difficulty: 2,
		governs: 'Capacidad efectiva de carga',
		requirements: [{ skill: 'stowage', level: 3 }]
	},
	{
		code: 'module_fitting',
		name: 'Ajuste de módulos',
		family: 'engineering',
		difficulty: 3,
		governs: 'Requisito para módulos avanzados',
		requirements: [
			{ skill: 'mechanics', level: 3 },
			{ skill: 'power_management', level: 2 }
		]
	},

	// --- Extracción ---
	{
		code: 'mining',
		name: 'Minería',
		family: 'extraction',
		difficulty: 1,
		governs: 'Rendimiento por ciclo de extracción',
		requirements: []
	},
	{
		code: 'stowage',
		name: 'Estiba',
		family: 'extraction',
		difficulty: 1,
		governs: 'Aprovechamiento del espacio de bodega',
		requirements: []
	},
	{
		code: 'refining',
		name: 'Refinado',
		family: 'extraction',
		difficulty: 2,
		governs: 'Mineral en bruto convertido en material útil',
		requirements: [{ skill: 'mining', level: 2 }]
	},
	{
		code: 'prospecting',
		name: 'Prospección',
		family: 'extraction',
		difficulty: 3,
		governs: 'Calidad de lo que se encuentra en un cinturón',
		requirements: [{ skill: 'mining', level: 3 }]
	},

	// --- Comercio ---
	{
		code: 'haggling',
		name: 'Regateo',
		family: 'trade',
		difficulty: 1,
		governs: 'Margen en compras y ventas',
		requirements: []
	},
	{
		code: 'accounting',
		name: 'Contabilidad',
		family: 'trade',
		difficulty: 2,
		governs: 'Comisiones e impuestos de estación',
		requirements: [{ skill: 'haggling', level: 2 }]
	},
	{
		code: 'market_analysis',
		name: 'Análisis de mercado',
		family: 'trade',
		difficulty: 3,
		governs: 'Ver historial y tendencias de precios',
		requirements: [{ skill: 'haggling', level: 3 }]
	},
	{
		code: 'contacts',
		name: 'Contactos',
		family: 'trade',
		difficulty: 4,
		governs: 'Acceso a contratos y precios reservados',
		requirements: [
			{ skill: 'haggling', level: 4 },
			{ skill: 'accounting', level: 3 }
		]
	},

	// --- Combate ---
	{
		code: 'gunnery',
		name: 'Puntería',
		family: 'combat',
		difficulty: 1,
		governs: 'Daño de las armas montadas',
		requirements: []
	},
	{
		code: 'armor',
		name: 'Blindaje',
		family: 'combat',
		difficulty: 2,
		governs: 'Resistencia del casco',
		requirements: [{ skill: 'mechanics', level: 2 }]
	},
	{
		code: 'shields',
		name: 'Escudos',
		family: 'combat',
		difficulty: 2,
		governs: 'Capacidad y recarga de escudos',
		requirements: [{ skill: 'power_management', level: 2 }]
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

	// --- Ciencias ---
	// La única familia sin habilidad x1: su escalón de entrada ya pide oficio.
	{
		code: 'scanning',
		name: 'Escaneo',
		family: 'science',
		difficulty: 2,
		governs: 'Detectar qué hay en un sistema antes de llegar',
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
		code: 'cartography',
		name: 'Cartografía',
		family: 'science',
		difficulty: 3,
		governs: 'Registrar rutas y sistemas no cartografiados',
		requirements: [
			{ skill: 'scanning', level: 3 },
			{ skill: 'astrogation', level: 2 }
		]
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
 * Requisitos que le faltan a un piloto para entrenar una habilidad.
 *
 * `levels` son los niveles actuales del piloto por código de habilidad; lo que
 * no está se considera nivel 0. Devuelve una lista vacía si puede entrenarla.
 */
export function unmetRequirements(
	code: string,
	levels: Readonly<Record<string, number>>
): readonly Requirement[] {
	return getSkill(code).requirements.filter(
		(requirement) => (levels[requirement.skill] ?? 0) < requirement.level
	);
}

/** ¿El piloto cumple los requisitos para entrenar esta habilidad? */
export function canTrain(code: string, levels: Readonly<Record<string, number>>): boolean {
	return unmetRequirements(code, levels).length === 0;
}
