/**
 * Reputación: cuánto confía en un piloto cada facción.
 *
 * Es el atributo que abre el trabajo. Como en EVE, los agentes reparten misiones
 * de **cinco niveles** y no se llega al de arriba pidiendo: se llega habiendo
 * hecho los de abajo. Ésa es la razón de que exista este sistema —darle una
 * escalera al jugador—, y no la de tener un número más en la ficha.
 *
 * Se sube reputación con **tres cosas a la vez** al terminar una misión: con el
 * agente que la dio, con su corporación y con la facción de esa corporación. La
 * del agente se guarda para cuando tenga algo que ofrecer; **las otras dos abren
 * trabajo, y son dos escaleras distintas**:
 *
 * - La de **corporación** abre los agentes **de esa corporación**. Es la barata y
 *   la que hace que elegir para quién trabajar importe.
 * - La de **facción** abre ese nivel en **todas** las corporaciones de la facción
 *   a la vez, y por eso cuesta bastante más. Es el atajo del que ya se ganó el
 *   nombre en todo el sector.
 *
 * Vale la que esté más arriba: al agente le alcanza con que una de las dos llegue.
 *
 * **La escala se guarda en milésimas.** Es un juego largo y la ganancia se achica
 * a medida que se sube —cerca del último escalón una misión mueve dos décimas—,
 * así que con enteros la escalera se moriría justo donde tenía que ponerse
 * interesante. Milésimas enteras y no coma flotante: la regla de que dos pilotos
 * nunca calculen distinto sigue intacta, y los decimales son cosa de la pantalla.
 *
 * Reglas puras: acá no hay base de datos ni jugador. Corresponde a
 * docs/systems/MISSIONS.md.
 */

import { roundHalfEven } from './math';

/**
 * La escala. Entera y acotada, como todo lo que se compara en el juego: dos
 * pilotos nunca tienen que poder calcular distinto por un redondeo.
 */
export const MIN_REPUTATION = 0;
export const MAX_REPUTATION = 100;

/** Cuántos niveles de misión hay. Cinco, como en EVE. */
export const MISSION_LEVELS = 5;

/** Un escalón de la escalera: cuánta reputación abre qué nivel de misión. */
export interface ReputationTier {
	readonly level: number;
	readonly name: string;
	readonly reputation: number;
}

/**
 * Los cinco escalones, de menor a mayor. Son **datos de balance**: los números
 * se van a mover cuando haya misiones que los pongan a prueba, y moverlos tiene
 * que ser cambiar esta tabla y nada más.
 */
export const TIERS: readonly ReputationTier[] = [
	{ level: 1, name: 'Desconocido', reputation: 0 },
	{ level: 2, name: 'Conocido', reputation: 10 },
	{ level: 3, name: 'Confiable', reputation: 25 },
	{ level: 4, name: 'Aliado', reputation: 50 },
	{ level: 5, name: 'Leal', reputation: 80 }
];

/** El escalón que corresponde a un nivel de misión. */
export function tierForLevel(level: number): ReputationTier {
	if (level < 1 || level > MISSION_LEVELS) {
		throw new RangeError(`No existe el nivel de misión ${level}.`);
	}
	return TIERS[level - 1];
}

/** El escalón más alto alcanzado con esa reputación. */
export function tierFor(reputation: number): ReputationTier {
	let reached = TIERS[0];
	for (const tier of TIERS) {
		if (reputation >= tier.reputation) reached = tier;
	}
	return reached;
}

/** El nivel de misión más alto al que se llega con esa reputación. */
export function missionLevelFor(reputation: number): number {
	return tierFor(reputation).level;
}

/**
 * Cuánta reputación hace falta para que un agente de ese nivel atienda.
 *
 * **Sin facción no hay papeles que pedir.** Los agentes de una corporación que no
 * responde a ninguna de las tres atienden a cualquiera, y ése es justamente el
 * atractivo de un puerto sin bandera: se llega antes, y se llega sin haberle
 * caído bien a nadie.
 */
export function requiredReputation(level: number, faction: string): number {
	if (!faction) return MIN_REPUTATION;
	return tierForLevel(level).reputation;
}

// --- La escala guardada ------------------------------------------------------

/**
 * Cuántas unidades guardadas vale un punto de reputación.
 *
 * Todo lo que se guarda y se calcula va en **milésimas enteras**; `TIERS` y
 * `requiredReputation` siguen hablando en puntos porque son datos de balance y
 * se leen mejor así. Convertir es multiplicar por esto, y nunca al revés en el
 * medio de un cálculo.
 */
export const REPUTATION_SCALE = 1000;

/** El techo y el piso, en lo que se guarda. */
export const MIN_REPUTATION_RAW = MIN_REPUTATION * REPUTATION_SCALE;
export const MAX_REPUTATION_RAW = MAX_REPUTATION * REPUTATION_SCALE;

/** Pasa un valor guardado a los puntos con los que habla el balance. */
export function toPoints(raw: number): number {
	return raw / REPUTATION_SCALE;
}

/** El escalón más alto alcanzado, leyendo lo que se guarda. */
export function tierForRaw(raw: number): ReputationTier {
	return tierFor(toPoints(raw));
}

/** El nivel de misión más alto al que se llega, leyendo lo que se guarda. */
export function missionLevelForRaw(raw: number): number {
	return tierForRaw(raw).level;
}

/** Lo que pide un escalón, en lo que se guarda. */
export function requiredReputationRaw(level: number, faction: string): number {
	return requiredReputation(level, faction) * REPUTATION_SCALE;
}

// --- Cuánto se sube ----------------------------------------------------------

/**
 * En cuántas partes se divide la fracción que se gana. Diezmilésimas.
 *
 * Va en enteros como todo lo demás: la ganancia es una división entera y no una
 * multiplicación por un flotante, así que no hay un `0,0025` dando vueltas cerca
 * del balance.
 */
const GAIN_SCALE = 10_000;

/**
 * Cuánto se gana por nivel de misión, en diezmilésimas de lo que falta.
 *
 * Son **datos de balance**, como `TIERS`: moverlos tiene que ser cambiar este
 * número y nada más. Con veinticinco por nivel, ir de cero a Leal con una
 * corporación son **doscientas veinticinco misiones**, subiendo de nivel de misión
 * al tocar cada escalón: cuarenta y tres hasta Conocido, treinta y seis más hasta
 * Confiable, cincuenta y cuatro hasta Aliado y noventa y dos hasta Leal. Es el
 * largo que se buscaba —cada tramo parecido al anterior y el último el doble que
 * el primero—, y el test lo recorre para que moverlo sea una decisión y no un
 * descuido.
 */
const GAIN_PER_LEVEL = 25;

/**
 * Cuánto sube la reputación al terminar una misión de ese nivel.
 *
 * **Se gana una fracción de lo que falta, no una cantidad fija.** Es la forma de
 * EVE y la que hace que el sistema aguante un juego largo sin números gigantes:
 * el primer punto sale casi gratis, el que va de Aliado a Leal cuesta cinco veces
 * más, y nunca se llega a cien. Un tope fijo se alcanza y deja de significar
 * algo; una asíntota no.
 */
export function reputationGain(current: number, level: number): number {
	const falta = Math.max(0, MAX_REPUTATION_RAW - current);
	const ganado = roundHalfEven((falta * GAIN_PER_LEVEL * level) / GAIN_SCALE);
	// Nunca más allá del techo, aunque el redondeo empuje.
	return Math.min(ganado, falta);
}

// --- Las dos escaleras -------------------------------------------------------

/**
 * A qué nivel de misión llega el piloto con esa corporación.
 *
 * **Vale la más alta de las dos.** La de la corporación abre a los suyos; la de
 * la facción abre ese nivel en todas las de su bandera, y por eso cuesta más.
 * Tomar el máximo y no sumarlas es lo que mantiene las dos escaleras separadas:
 * sumarlas haría que ninguna de las dos significara nada por sí sola.
 */
export function effectiveMissionLevel(corporationRaw: number, factionRaw: number): number {
	return Math.max(missionLevelForRaw(corporationRaw), missionLevelForRaw(factionRaw));
}

/**
 * ¿Este piloto puede pedirle trabajo a ese agente?
 *
 * Se compara por **nivel alcanzado** y no por número suelto: es la misma
 * pregunta, pero dicha como la piensa el jugador —«ya llegué al nivel tres»— y la
 * única forma de que las dos escaleras se lean juntas sin inventar una tercera
 * cuenta.
 */
export function canBeHired(
	level: number,
	faction: string,
	corporationRaw: number,
	factionRaw: number
): boolean {
	// Sin bandera no hay papeles que pedir: el puerto franco atiende a cualquiera.
	if (!faction) return true;
	return effectiveMissionLevel(corporationRaw, factionRaw) >= level;
}
