/**
 * Formateo de datos del juego para mostrar.
 *
 * Traducciones de dato a texto que usan tanto las pantallas como lo que las
 * alimenta. Viven fuera de las reglas porque son presentación, y fuera de los
 * componentes porque no dibujan nada.
 */

import type { IconName } from '$lib/icons';
import type { MissionKind } from '$lib/server/game/agents';
import type { DamageType } from '$lib/server/game/damage';
import type { BonusTarget, CoreSystem, DockSize, SlotKind } from '$lib/server/game/hulls';
import type { ShipModule } from '$lib/server/game/modules';
import { startingLevels } from '$lib/server/game/professions';
import { MAX_LEVEL } from '$lib/server/game/progression';
import { getSkill } from '$lib/server/game/skills';
import {
	SERVICES,
	type BodyKind,
	type CorporationKind,
	type Government,
	type SecurityLevel,
	type StationServiceKind
} from '$lib/server/game/universe';

/** Una habilidad va del 0 al 5, así que su ficha son cinco estrellas. */
export const MAX_STARS = MAX_LEVEL;

/** Los niveles se muestran en romanos, como en la ficha de un piloto. */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

/** Nivel en números romanos, o cadena vacía para el nivel 0. */
export function roman(level: number): string {
	return level >= 0 && level < ROMAN.length ? ROMAN[level] : String(level);
}

/**
 * Las habilidades que entrega una profesión, en una línea.
 *
 * Por ejemplo: `Minería II · Estiba II · Navegación I · Mecánica I`.
 */
export function skillsSummary(profession: string): string {
	return Object.entries(startingLevels(profession))
		.map(([skill, level]) => `${getSkill(skill).name} ${roman(level)}`)
		.join(' · ');
}

/** Los tres estados en que puede estar una estrella de una habilidad. */
export type StarState = 'full' | 'half' | 'empty';

/**
 * Las cinco estrellas de una habilidad, según nivel y avance.
 *
 * Una estrella llena por cada nivel alcanzado, media si hay avance hacia el
 * siguiente, y vacías las que faltan. Es la lectura de un vistazo que un número
 * no da: cinco estrellas dicen "cuánto falta" sin hacer ninguna cuenta.
 */
export function starStates(level: number, progress = 0): StarState[] {
	const stars: StarState[] = [];
	for (let index = 0; index < MAX_STARS; index++) {
		if (level > index) stars.push('full');
		else if (level === index && progress > 0) stars.push('half');
		else stars.push('empty');
	}
	return stars;
}

// --- Universo ----------------------------------------------------------------

const BODY_KINDS: Record<BodyKind, string> = {
	star: 'Estrella',
	planet: 'Planeta',
	moon: 'Luna',
	belt: 'Cinturón',
	station: 'Estación'
};

const BODY_ICONS: Record<BodyKind, IconName> = {
	star: 'sun',
	planet: 'planet',
	moon: 'moon',
	belt: 'circles-three',
	station: 'buildings'
};

/**
 * El dibujo de cada módulo de estación.
 *
 * Va acá y no en el plano por la misma razón que el de los cuerpos: el nombre y
 * lo que hace un módulo son contenido del juego, pero con qué ícono se lo dibuja
 * es presentación.
 *
 * Cada uno lleva el suyo a propósito: un mosaico se lee por sus dibujos, y dos
 * baldosas con el mismo ícono se confunden a la distancia a la que se mira una
 * grilla.
 */
const SERVICE_ICONS: Record<StationServiceKind, IconName> = {
	shipyard: 'rocket',
	outfitting: 'wrench',
	refinery: 'factory',
	workshop: 'gear-six',
	market: 'storefront',
	contacts: 'address-book',
	missions: 'clipboard-text',
	storage: 'warehouse'
};

/** Cómo se llama un tipo de cuerpo en pantalla. */
export function bodyKindLabel(kind: BodyKind): string {
	return BODY_KINDS[kind] ?? kind;
}

/** El ícono de Phosphor que le toca a un tipo de cuerpo. */
export function bodyKindIcon(kind: BodyKind): IconName {
	return BODY_ICONS[kind] ?? 'circles-three';
}

/** Cómo se llama un módulo de estación en pantalla. */
export function serviceLabel(service: StationServiceKind): string {
	return SERVICES[service].name;
}

/** El ícono de Phosphor que le toca a un módulo de estación. */
export function serviceIcon(service: StationServiceKind): IconName {
	return SERVICE_ICONS[service] ?? 'circles-three';
}

const GOVERNMENTS: Record<Government, string> = {
	anarchy: 'Anarquía',
	feudal: 'Feudal',
	prison: 'Colonia penal',
	dictatorship: 'Dictadura',
	democracy: 'Democracia',
	corporate: 'Corporativo'
};

const SECURITY: Record<SecurityLevel, string> = {
	lawless: 'Sin ley',
	low: 'Baja',
	medium: 'Media',
	high: 'Alta'
};

const CORPORATION_KINDS: Record<CorporationKind, string> = {
	mining: 'Minería',
	industry: 'Industria',
	trade: 'Comercio',
	exploration: 'Exploración',
	security: 'Seguridad',
	logistics: 'Logística'
};

/** Cómo se llama un gobierno en pantalla. */
export function governmentLabel(government: Government): string {
	return GOVERNMENTS[government] ?? government;
}

/** Cómo se llama un nivel de seguridad en pantalla. */
export function securityLabel(level: SecurityLevel): string {
	return SECURITY[level] ?? level;
}

/** A qué se dedica una corporación, en palabras. */
export function corporationKindLabel(kind: CorporationKind): string {
	return CORPORATION_KINDS[kind] ?? kind;
}

// --- Agentes y misiones ------------------------------------------------------

const MISSION_KINDS: Record<MissionKind, string> = {
	courier: 'Transporte',
	mining: 'Minería',
	trade: 'Comercio',
	combat: 'Combate',
	exploration: 'Exploración'
};

const MISSION_ICONS: Record<MissionKind, IconName> = {
	courier: 'truck',
	mining: 'diamond',
	trade: 'scales',
	combat: 'crosshair',
	exploration: 'magnifying-glass'
};

/** De qué van las misiones de un agente, en palabras. */
export function missionKindLabel(kind: MissionKind): string {
	return MISSION_KINDS[kind] ?? kind;
}

/** El ícono de Phosphor que le toca a una clase de misión. */
export function missionKindIcon(kind: MissionKind): IconName {
	return MISSION_ICONS[kind] ?? 'clipboard-text';
}

/** Si un cuerpo está en las cartas, en una palabra. */
export function explorationLabel(explored: boolean): string {
	return explored ? 'Explorado' : 'Sin explorar';
}

/** El ícono que acompaña a ese estado. */
export function explorationIcon(explored: boolean): IconName {
	return explored ? 'check' : 'binoculars';
}

// --- Naves -------------------------------------------------------------------

const SLOT_KINDS: Record<SlotKind, string> = {
	hardpoint: 'Anclaje',
	utility: 'Utilitario',
	core: 'Esencial',
	optional: 'Opcional'
};

/**
 * El dibujo de cada categoría de ranura.
 *
 * Sólo se ve en las ranuras **vacías** y en la leyenda, así que ninguno puede
 * coincidir con el de un módulo: en el anillo, un hueco y una pieza montada no
 * pueden verse igual.
 */
const SLOT_ICONS: Record<SlotKind, IconName> = {
	hardpoint: 'target',
	utility: 'wrench',
	core: 'gear-six',
	optional: 'squares-four'
};

const CORE_SYSTEMS: Record<CoreSystem, string> = {
	power_plant: 'Planta de energía',
	thrusters: 'Propulsores',
	jump_drive: 'Motor de salto',
	distributor: 'Distribuidor',
	sensors: 'Sensores',
	life_support: 'Soporte vital',
	tank: 'Tanque'
};

const DOCK_SIZES: Record<DockSize, string> = {
	small: 'Amarre chico',
	medium: 'Amarre mediano',
	large: 'Amarre grande'
};

const DAMAGE_TYPES: Record<DamageType, string> = {
	kinetic: 'Cinético',
	ionic: 'Iónico',
	thermal: 'Térmico'
};

/** Abreviaturas de tres letras, para las tablas donde el nombre no entra. */
const DAMAGE_SHORT: Record<DamageType, string> = {
	kinetic: 'CIN',
	ionic: 'ION',
	thermal: 'TER'
};

/** Cómo se llama un tipo de ranura en pantalla. */
export function slotKindLabel(kind: SlotKind): string {
	return SLOT_KINDS[kind] ?? kind;
}

/** El ícono de Phosphor que le toca a un tipo de ranura. */
export function slotKindIcon(kind: SlotKind): IconName {
	return SLOT_ICONS[kind] ?? 'circles-three';
}

/** Cómo se llama un interno esencial en pantalla. */
export function coreSystemLabel(core: CoreSystem): string {
	return CORE_SYSTEMS[core] ?? core;
}

/** En qué amarre entra la nave. */
export function dockSizeLabel(size: DockSize): string {
	return DOCK_SIZES[size] ?? size;
}

/** Cómo se llama un tipo de daño en pantalla. */
export function damageTypeLabel(damageType: DamageType): string {
	return DAMAGE_TYPES[damageType] ?? damageType;
}

/** La abreviatura de tres letras, para las tablas angostas. */
export function damageTypeShort(damageType: DamageType): string {
	return DAMAGE_SHORT[damageType] ?? damageType.slice(0, 3).toUpperCase();
}

/**
 * Un número guardado en décimas, escrito con su coma.
 *
 * Alcance de salto y daño por segundo se llevan en décimas para que no haya un
 * solo decimal en las reglas; la coma aparece recién acá, que es donde se lee.
 */
export function tenths(value: number): string {
	return `${Math.floor(value / 10)},${Math.abs(value) % 10}`;
}

/** Un entero grande con separador de miles, como el resto del HUD. */
export function thousands(value: number): string {
	return value.toLocaleString('en-US').replaceAll(',', '.');
}

const BONUS_TARGETS: Record<BonusTarget, string> = {
	cargo: 'capacidad de bodega',
	speed: 'velocidad',
	jump_range: 'alcance de salto',
	mining_yield: 'rendimiento de extracción',
	damage: 'daño',
	shield: 'escudo',
	armor: 'blindaje',
	sensor_range: 'alcance de sensores',
	capacitor_recharge: 'recarga del acumulador'
};

/**
 * Sobre qué actúa un bono, escrito para meterlo en una frase.
 *
 * En minúscula y sin artículo a propósito: se lee dentro de "+5 % de rendimiento
 * de extracción por nivel de Minería".
 */
export function bonusTargetLabel(target: BonusTarget): string {
	return BONUS_TARGETS[target] ?? target;
}

/**
 * El dibujo de cada familia de módulo.
 *
 * Va acá y no en el catálogo por la misma razón que el de los cuerpos y el de
 * los servicios: qué hace un módulo es contenido del juego, con qué ícono se lo
 * dibuja es presentación.
 *
 * La clave es la familia del módulo, así que las variantes de una misma
 * —`plant_2e` y `plant_2a`— comparten dibujo: son la misma pieza en distinta
 * calificación, y distinguirlas por ícono sería mentir.
 *
 * **Los siete internos esenciales llevan íconos distintos entre sí**, y ésa es
 * la razón de que esta tabla exista: con un engranaje para todos, la planta, los
 * propulsores y el motor de salto eran tres círculos idénticos en el anillo.
 */
const MODULE_ICONS: Record<string, IconName> = {
	// Internos esenciales
	plant: 'lightning',
	thrusters: 'rocket-launch',
	jump: 'arrows-out-cardinal',
	distributor: 'battery-charging',
	sensors: 'broadcast',
	life: 'wind',
	tank: 'gas-can',
	// Anclajes
	mining_laser: 'diamond',
	mass_cannon: 'crosshair',
	ion_emitter: 'atom',
	thermal_lance: 'flame',
	// Utilitarios
	scanner: 'magnifying-glass',
	shield_booster: 'shield-check',
	armor_plate: 'shield-chevron',
	dampener: 'eye-slash',
	// Internos opcionales
	cargo_rack: 'package',
	shield_gen: 'shield',
	collector: 'magnet',
	refinery: 'factory',
	fuel_tank: 'drop',
	armor_bulkhead: 'shield-chevron'
};

/**
 * La familia de un módulo, sacada de su código.
 *
 * `plant_2e` y `plant_3a` son la misma pieza en distinto tamaño y calificación,
 * así que comparten familia. El sufijo es siempre clase y calificación, de modo
 * que la familia es todo lo que va antes del último guion bajo.
 */
export function moduleFamily(code: string): string {
	const corte = code.lastIndexOf('_');
	return corte > 0 ? code.slice(0, corte) : code;
}

/**
 * El ícono de Phosphor que le toca a un módulo.
 *
 * Cae al ícono de su categoría si la familia no está en la tabla: un módulo
 * nuevo se ve genérico, pero se ve. Hay una prueba que impide que eso pase sin
 * que nadie se entere.
 */
export function moduleIcon(module: Pick<ShipModule, 'code' | 'kind'>): IconName {
	return MODULE_ICONS[moduleFamily(module.code)] ?? slotKindIcon(module.kind);
}
