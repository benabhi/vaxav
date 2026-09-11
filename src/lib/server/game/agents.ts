/**
 * Los agentes: la gente que reparte trabajo en las estaciones.
 *
 * Un agente no trabaja para la estación, trabaja para una **corporación**, y
 * puede estar sentado en una estación que opera otra. Eso es lo que hace que una
 * estación sea un lugar y no un edificio: en Puerto Ánfora hay gente de la Casa
 * Verlan, un enlace de la Extractora y un capitán de la seguridad contratada, y
 * cada uno ofrece cosas distintas.
 *
 * Cada agente tiene un **nivel del 1 al 5** —el de las misiones que reparte— y
 * una especialidad. El nivel se abre con la reputación con la facción de su
 * corporación; las reglas están en `reputation`.
 *
 * Datos puros. Corresponde a docs/systems/MISSIONS.md.
 */

/**
 * De qué van las misiones que reparte un agente.
 *
 * Cinco clases, una por cada forma de jugar más el transporte, que es el que
 * engancha a todas las demás.
 */
export const MISSION_KINDS = ['courier', 'mining', 'trade', 'combat', 'exploration'] as const;
export type MissionKind = (typeof MISSION_KINDS)[number];

/**
 * Qué clase de retrato le queda a un agente.
 *
 * No es un dato de simulación —el juego no hace nada con esto— sino la llave que
 * ata un personaje a su imagen: los retratos del fondo común se nombran con esta
 * misma letra adelante, así que declarar el aspecto alcanza para que le toque
 * uno que le quede.
 *
 * `x` no es un cajón de sastre: es para quien no entra en los otros dos, y
 * reparte del fondo entero.
 */
export const APPEARANCES = ['m', 'f', 'x'] as const;
export type Appearance = (typeof APPEARANCES)[number];

/**
 * Un agente del mundo, tal como se lo siembra.
 *
 * `corporation` es un código de corporación y **no tiene por qué ser la que
 * opera la estación**: de ahí sale que una misma estación ofrezca trabajo de
 * varias corporaciones, y a veces de facciones distintas.
 */
export interface AgentBlueprint {
	readonly code: string;
	readonly name: string;
	readonly corporation: string;
	/** Nivel de las misiones que reparte, del 1 al 5. */
	readonly level: number;
	readonly missionKind: MissionKind;
	readonly description?: string;
	/** De qué fondo de retratos sale su cara. Ver static/portraits/LEEME.md. */
	readonly appearance?: Appearance;
}
