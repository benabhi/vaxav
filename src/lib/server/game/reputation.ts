/**
 * Reputación: cuánto confía en un piloto cada facción.
 *
 * Es el atributo que abre el trabajo. Como en EVE, los agentes reparten misiones
 * de **cinco niveles** y no se llega al de arriba pidiendo: se llega habiendo
 * hecho los de abajo. Ésa es la razón de que exista este sistema —darle una
 * escalera al jugador—, y no la de tener un número más en la ficha.
 *
 * Se sube reputación con **tres cosas a la vez** al terminar una misión: con el
 * agente que la dio, con su corporación y con la facción de esa corporación. Por
 * ahora **sólo la de facción abre misiones**; las otras dos se guardan para
 * cuando haya algo que quieran comprar —precios, acceso a una estación, un
 * contrato exclusivo—.
 *
 * Reglas puras: acá no hay base de datos ni jugador. Corresponde a
 * docs/systems/MISSIONS.md.
 */

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

/** ¿Este piloto puede pedirle trabajo a ese agente? */
export function canBeHired(level: number, faction: string, reputation: number): boolean {
	return reputation >= requiredReputation(level, faction);
}
