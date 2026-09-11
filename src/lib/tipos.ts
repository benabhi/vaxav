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

/** Un módulo de la estación, listo para dibujar en el mosaico. */
export interface BaldosaModulo {
	readonly code: string;
	readonly name: string;
	readonly icon: IconName;
	readonly summary: string;
	/** Fase del roadmap en que el módulo empieza a funcionar de verdad. */
	readonly phase: string;
	/** Si la estación lo tiene instalado. Los que no, se dibujan apagados. */
	readonly available: boolean;
}

/** Un agente de la estación, listo para dibujar. */
export interface FilaAgente {
	readonly code: string;
	readonly name: string;
	readonly corporation: string;
	readonly faction: string;
	readonly kind: string;
	readonly kindIcon: IconName;
	/** Ruta de su retrato, o vacía si todavía no hay ninguna imagen. */
	readonly portrait: string;
	/** Nivel de las misiones que reparte, en romanos. */
	readonly level: string;
	readonly description: string;
	/** Si este piloto tiene reputación suficiente para que lo atienda. */
	readonly open: boolean;
	/** Qué le falta, cuando no. */
	readonly requirement: string;
}

/**
 * El lugar exacto donde está el piloto.
 *
 * Cuando va en camino no describe la estación que ya dejó atrás: describe el
 * viaje, y se queda sin módulos ni agentes, porque no se está en ninguna
 * estación. Vaciarlos es parte de decir la verdad, no un descuido.
 */
export interface Ubicacion {
	readonly name: string;
	readonly kind: string;
	readonly icon: IconName;
	readonly description: string;
	readonly parent: string;
	readonly system: string;
	readonly distance: string;
	readonly exploration: string;
	readonly isStation: boolean;
	readonly inTransit: boolean;
	readonly corporation: string;
	readonly corporationKind: string;
	readonly owner: string;
	readonly modules: readonly BaldosaModulo[];
	/** "3 de 8": cuántos módulos tiene la estación de los que podría tener. */
	readonly moduleCount: string;
	readonly agents: readonly FilaAgente[];
	readonly agentCount: string;
}

/**
 * Un cuerpo del sistema, listo para dibujar como fila del árbol.
 *
 * Trae resuelto su lugar en el árbol —qué guías dibujar, si es el último hijo,
 * si se puede plegar— porque eso es forma del árbol y no una decisión de la
 * pantalla. La pantalla dibuja lo que le dan.
 *
 * **No trae `expanded`**: plegar es estado de interfaz y vive en el navegador.
 */
export interface FilaCuerpo {
	readonly code: string;
	readonly name: string;
	readonly kind: string;
	readonly icon: IconName;
	readonly depth: number;
	/**
	 * Una guía por columna de ancestro: `true` si la rama que pasa por esa
	 * columna todavía tiene algo abajo, y entonces su línea vertical atraviesa
	 * esta fila.
	 */
	readonly rails: readonly boolean[];
	/** Último hijo de su padre: se dibuja el codo del árbol y no la horquilla. */
	readonly isLast: boolean;
	/** Si algo lo orbita. Sólo estas filas se pueden plegar. */
	readonly hasChildren: boolean;
	readonly explored: boolean;
	readonly exploration: string;
	readonly explorationIcon: IconName;
	/** Cuán lejos está del piloto, no de lo que orbita. Vacío en su propia fila. */
	readonly distance: string;
	/** Cuánto tardaría llegar, ya calculado. Vacío en la propia fila. */
	readonly travelLabel: string;
	readonly description: string;
	readonly isStation: boolean;
	readonly corporation: string;
	readonly corporationKind: string;
	readonly owner: string;
	readonly services: readonly string[];
	/** Marca dónde está parado el piloto ahora mismo. */
	readonly isHere: boolean;
}

/** El sistema donde está el piloto, con todos sus cuerpos. */
export interface Sistema {
	readonly name: string;
	readonly description: string;
	readonly region: string;
	readonly constellation: string;
	readonly controlledBy: string;
	readonly government: string;
	readonly security: string;
	readonly coordinates: string;
	readonly bodyCount: string;
	readonly stationCount: string;
	readonly exploredCount: string;
	readonly bodies: readonly FilaCuerpo[];
	/** Lo único que el botón de viajar necesita para saber si mostrarse bloqueado. */
	readonly hasShip: boolean;
	readonly actionInProgress: boolean;
}
