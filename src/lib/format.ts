/**
 * Formateo de datos del juego para mostrar.
 *
 * Traducciones de dato a texto que usan tanto las pantallas como lo que las
 * alimenta. Viven fuera de las reglas porque son presentación, y fuera de los
 * componentes porque no dibujan nada.
 */

import type { IconName } from '$lib/icons';
import type { ActionKind } from '$lib/game/actions';
import type { MissionKind } from '$lib/game/agents';
import type { DamageType } from '$lib/game/damage';
import type { BonusTarget, CoreSystem, DockSize, SlotKind } from '$lib/game/hulls';
import { getItem, type Item, type ItemKind } from '$lib/game/items';
import { getModule, type ShipModule } from '$lib/game/modules';
import { startingKit, startingLevels, type ProfessionCode } from '$lib/game/professions';
import { MAX_LEVEL } from '$lib/game/progression';
import { getSkill, type SkillFamily } from '$lib/game/skills';
import {
	SERVICES,
	type BodyKind,
	type CorporationKind,
	type Government,
	type SecurityLevel,
	type StationServiceKind
} from '$lib/game/universe';

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

/**
 * Con qué equipo sale a volar un oficio, en una línea.
 *
 * Va en la pantalla de alta junto a las habilidades: elegir un oficio es elegir
 * **con qué arrancás**, y hasta ahora sólo se veía la mitad —lo que sabés— y no
 * la otra —con qué trabajás—. Un minero sin láser es un minero que no puede
 * minar, y eso tiene que poder leerse antes de elegir.
 */
export function kitSummary(profession: string): string {
	return startingKit(profession)
		.map((entrada) => {
			const nombre = getItem(entrada.item).name;
			const donde = entrada.fitted ? 'montado' : 'en bodega';
			const cuantos = entrada.quantity > 1 ? ` ×${entrada.quantity}` : '';
			return `${nombre}${cuantos} (${donde})`;
		})
		.join(' · ');
}

/**
 * El dibujo de cada oficio.
 *
 * Vive acá y no en el catálogo de profesiones por la misma razón que el de los
 * cuerpos y el de los módulos: a qué se dedicaba el piloto antes de comprarse la
 * nave es contenido del juego, con qué ícono se lo dibuja es presentación.
 *
 * El tipo exige una entrada por profesión declarada, así que sumar un oficio al
 * catálogo sin darle dibujo no compila.
 */
const PROFESSION_ICONS: Record<ProfessionCode, IconName> = {
	miner: 'diamond',
	explorer: 'binoculars',
	hauler: 'package',
	trader: 'scales',
	escort: 'shield',
	technician: 'wrench'
};

/** El ícono de Phosphor que le toca a un oficio. */
export function professionIcon(code: string): IconName {
	return PROFESSION_ICONS[code as ProfessionCode] ?? 'circles-three';
}

const SKILL_FAMILIES: Record<SkillFamily, string> = {
	piloting: 'Pilotaje',
	engineering: 'Ingeniería',
	extraction: 'Extracción',
	trade: 'Comercio',
	combat: 'Combate',
	science: 'Ciencias'
};

/**
 * El dibujo de cada rama del árbol.
 *
 * Misma razón que el de los oficios y el de los cuerpos: a qué se dedica una
 * rama es contenido del juego, con qué ícono se la dibuja es presentación.
 */
const SKILL_FAMILY_ICONS: Record<SkillFamily, IconName> = {
	piloting: 'compass',
	engineering: 'wrench',
	extraction: 'diamond',
	trade: 'scales',
	combat: 'crosshair',
	science: 'atom'
};

/**
 * El escudo de cada facción.
 *
 * Vienen sobre negro, así que quien los dibuja los funde con `screen`: el negro
 * desaparece y queda el emblema apoyado sobre el panel. Cada uno trae su propio
 * color —rojo, azul y verde—, y es la única excepción a la regla del acento
 * único: un escudo es identidad, no interfaz.
 */
const FACTION_CRESTS: Record<string, string> = {
	dominion: '/factions/dominion.webp',
	concord: '/factions/concord.webp',
	pact: '/factions/pact.webp'
};

/** La imagen del escudo de una facción, o cadena vacía si no tiene. */
export function factionCrest(code: string): string {
	return FACTION_CRESTS[code] ?? '';
}

/** El ícono de Phosphor que le toca a una rama del árbol. */
export function skillFamilyIcon(family: string): IconName {
	return SKILL_FAMILY_ICONS[family as SkillFamily] ?? 'circles-three';
}

/** Cómo se llama una rama del árbol de habilidades en pantalla. */
export function skillFamilyLabel(family: string): string {
	return SKILL_FAMILIES[family as SkillFamily] ?? family;
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

/**
 * Un volumen guardado en décimas de m³, escrito con su coma.
 *
 * Siempre con un decimal, aunque sea cero: en una columna de cifras, "30" y
 * "30,4" alineados uno debajo del otro se leen como dos escalas distintas.
 */
export function cubicMeters(tenthsOfCubicMeter: number): string {
	const entero = Math.trunc(tenthsOfCubicMeter / 10);
	return `${thousands(entero)},${Math.abs(tenthsOfCubicMeter) % 10}`;
}

/**
 * Con qué se dibuja un ítem de la bodega.
 *
 * Un módulo guardado usa **el mismo ícono que montado**: es la misma pieza, y
 * cambiarle el dibujo según dónde esté obligaría a aprender dos veces lo mismo.
 */
export function itemIcon(item: Pick<Item, 'code' | 'kind'>): IconName {
	if (item.kind === 'module') return moduleIcon(getModule(item.code));
	return 'diamond';
}

/** Cómo se llama una clase de ítem en pantalla. */
export function itemKindLabel(kind: ItemKind): string {
	return ITEM_KINDS[kind];
}

const ITEM_KINDS: Record<ItemKind, string> = {
	ore: 'Mineral',
	module: 'Módulo'
};

/**
 * Cómo se llama una acción en curso, y con qué se la dibuja.
 *
 * Vive acá y no en el motor de acciones por la misma razón que el nombre de una
 * facción: qué hace una acción es regla, cómo se la cuenta es presentación. El
 * indicador de la barra de estado y la bitácora leen de la misma tabla, así que
 * una acción nueva se nombra en un solo lugar.
 */
const ACTIONS: Record<ActionKind, { label: string; icon: IconName }> = {
	travel: { label: 'Viajando', icon: 'rocket-launch' },
	mine: { label: 'Extrayendo', icon: 'diamond' },
	publish: { label: 'Acordando', icon: 'handshake' },
	survey: { label: 'Escaneando', icon: 'binoculars' }
};

/** El nombre de una acción en curso, o algo genérico si es nueva. */
export function actionLabel(kind: string): string {
	return ACTIONS[kind as ActionKind]?.label ?? 'Trabajando';
}

/** El ícono de una acción, en curso o ya terminada. */
export function actionIcon(kind: string): IconName {
	return ACTIONS[kind as ActionKind]?.icon ?? 'clock';
}

/**
 * Cómo se nombra una acción **ya terminada**: «Viaje», «Extracción».
 *
 * Es el mismo hecho que la etiqueta de arriba pero en otro tiempo verbal:
 * mientras corre se dice qué estás haciendo, y en la bitácora qué pasó.
 */
const ACTION_NOUNS: Record<ActionKind, string> = {
	travel: 'Viaje',
	mine: 'Extracción',
	publish: 'Acuerdo',
	survey: 'Escaneo'
};

/** El nombre de una acción terminada, o algo genérico si es nueva. */
export function actionNoun(kind: string): string {
	return ACTION_NOUNS[kind as ActionKind] ?? 'Acción';
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
 * —`plant_e2` y `plant_a2`— comparten dibujo: son la misma pieza en distinto
 * escalón, y distinguirlas por ícono sería mentir.
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
 * `plant_e2` y `plant_a3` son la misma pieza en distinto escalón y tamaño, así
 * que comparten familia. El sufijo es siempre escalón y clase, de modo que la
 * familia es todo lo que va antes del último guion bajo.
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

/**
 * Cuánto falta, escrito para leerse de un vistazo.
 *
 * Con minutos cuando los hay: "3 m 20 s" se entiende de una, y "200 s" hay que
 * dividirlo mentalmente.
 */
export function remainingLabel(seconds: number): string {
	const total = Math.trunc(Math.max(0, seconds));
	if (total >= 60) {
		return `${Math.floor(total / 60)} m ${String(total % 60).padStart(2, '0')} s`;
	}
	return `${total} s`;
}
