/**
 * Las formas que viajan del servidor a la pantalla.
 *
 * Viven fuera de `server/` porque las usan los dos lados: el `load` las arma y
 * el componente las dibuja. Nada de esto toca la base.
 */

import type { IconName } from '$lib/icons';
import type { StarState } from '$lib/format';

/**
 * La orden que el piloto tiene en curso.
 *
 * Se manda el instante en que arrancó y cuánto dura —no el porcentaje—: el
 * avance lo calcula el navegador, que es lo único que puede hacerlo sin
 * preguntarle al servidor una vez por segundo.
 */
export interface AccionEnCurso {
	readonly kind: string;
	readonly label: string;
	readonly icon: IconName;
	readonly origin: string;
	readonly destination: string;
	/** Milisegundos desde la época, en UTC. */
	readonly startedAt: number;
	readonly durationSeconds: number;
}

/** Una habilidad del piloto, ya resuelta para mostrar. */
export interface FilaHabilidad {
	readonly code: string;
	readonly name: string;
	readonly family: string;
	readonly level: string;
	readonly xp: number;
	readonly progress: number;
	readonly stars: readonly StarState[];
}

/** Lo que toda pantalla del juego sabe del piloto conectado. */
export interface PilotoConectado {
	readonly callsign: string;
	readonly professionName: string;
	readonly factionName: string;
	readonly factionCode: string;
	readonly factionArchetype: string;
	readonly factionGovernment: string;
	readonly factionMotto: string;
	readonly station: string;
	readonly system: string;
	readonly credits: number;
	readonly creditsLabel: string;
	readonly locationLabel: string;
	readonly skills: readonly FilaHabilidad[];
}
