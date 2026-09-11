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

/** La nave del piloto, resumida para la credencial. */
export interface NaveDelPiloto {
	readonly name: string;
	readonly role: string;
	readonly shield: string;
	readonly armor: string;
	readonly structure: string;
	/** Si la configuración que lleva se puede volar. */
	readonly flyable: boolean;
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
	/** Cuánta experiencia lleva en cada rama del árbol. */
	readonly families: readonly RamaXp[];
	/** Desde cuándo vuela, en milisegundos UTC. */
	readonly since: number;
	/**
	 * A qué corporación pertenece. Vacío quiere decir independiente: las
	 * corporaciones de jugadores llegan en F12 (docs/systems/CORPORATIONS.md),
	 * así que hoy no hay ninguna a la que pertenecer y la ficha lo dice.
	 */
	readonly corporation: string;
	/** Qué está haciendo ahora mismo, en una palabra. */
	readonly statusLabel: string;
	readonly inTransit: boolean;
	/** La nave que lleva, o `null` si no tiene ninguna. */
	readonly ship: NaveDelPiloto | null;
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

/** Una ranura del casco, ya resuelta para dibujar en el anillo o en la lista. */
export interface FilaRanura {
	readonly index: number;
	readonly kind: string;
	readonly kindLabel: string;
	readonly icon: IconName;
	/** Qué es esta ranura: el sistema esencial, o el tipo con su clase. */
	readonly title: string;
	readonly classLabel: string;
	readonly moduleName: string;
	/**
	 * Clase y calificación de lo montado (`2A`), o la clase de la ranura vacía
	 * (`c2`). Es lo que se lee dentro del círculo sin pasar el mouse.
	 */
	readonly badge: string;
	readonly filled: boolean;
	readonly selected: boolean;
	/** Posición en el anillo, en porcentaje del cuadro. */
	readonly left: string;
	readonly top: string;
}

/** Las ranuras de una categoría, para la lista que acompaña al anillo. */
export interface GrupoRanuras {
	readonly label: string;
	readonly icon: IconName;
	readonly rows: readonly FilaRanura[];
}

/**
 * La nave del piloto, tal como sale de la base.
 *
 * Va cruda a propósito: el casco, lo montado y las habilidades alcanzan para que
 * la pantalla calcule sola la hoja de rendimiento y las opciones de cada ranura,
 * que son reglas puras. Así el interruptor de habilidades y elegir una ranura no
 * cuestan una ida y vuelta.
 */
export interface Nave {
	readonly hullCode: string;
	/** Un código de módulo por ranura. Vacío quiere decir ranura libre. */
	readonly fitted: readonly string[];
	readonly pilotLevels: Readonly<Record<string, number>>;
	/** Dónde está atracado el piloto y qué módulos tiene ese lugar. */
	readonly stationName: string;
	readonly stationServices: readonly string[];
	/** Si puede tocar la nave acá y ahora, y por qué no si no puede. */
	readonly canRefit: boolean;
	readonly refitBlocked: string;
}

/**
 * Una línea de la experiencia repartida por una acción.
 *
 * Lleva el nivel **de ese momento** y no el de hoy: la bitácora es un registro,
 * así que un informe de la semana pasada tiene que seguir contando lo que pasó
 * la semana pasada.
 */
export interface GananciaXp {
	readonly skill: string;
	readonly name: string;
	/** A qué rama del árbol pertenece: Pilotaje, Extracción, Combate… */
	readonly family: string;
	readonly xp: number;
	/** La experiencia acumulada que tenía antes y la que quedó. */
	readonly before: number;
	readonly after: number;
	/** El nivel al que quedó la habilidad después de sumar, en romanos. */
	readonly level: string;
	/** En el que estaba antes. Distinto del anterior quiere decir que subió. */
	readonly levelBefore: string;
	/** Si esta acción la hizo subir de nivel: lo que el jugador estaba esperando. */
	readonly leveledUp: boolean;
	/** Cuánto lleva del nivel siguiente, de 0 a 100. */
	readonly progress: number;
	/** Cuánto le falta al siguiente, en puntos. Cero si ya está al tope. */
	readonly toNext: number;
}

/**
 * El informe de una acción resuelta.
 *
 * Es la misma pieza en dos lugares: el aviso que salta al volver y cada fila de
 * la bitácora. Que sea una sola forma es lo que hace que digan exactamente lo
 * mismo. Ver docs/systems/ACTIONS.md.
 */
export interface Informe {
	readonly id: number;
	readonly kind: string;
	/**
	 * El titular, igual para toda acción: "Acción terminada". Genérico a
	 * propósito —van a ser muchas— y lo que cambia es `kindLabel`.
	 */
	readonly title: string;
	/** Qué acción fue: "Viaje", "Extracción", "Refinado". */
	readonly kindLabel: string;
	readonly icon: IconName;
	/** Dónde terminó: el titular del informe. */
	readonly place: string;
	/** Milisegundos desde la época, en UTC, para que el navegador lo fecha. */
	readonly at: number;
	/** Las lecturas del informe: rótulo y valor, en orden. */
	readonly details: readonly { readonly label: string; readonly value: string }[];
	readonly xp: readonly GananciaXp[];
	/** Todo lo que repartió la acción, sumado. */
	readonly xpTotal: number;
	readonly unread: boolean;
}

/** Una página de la bitácora, con lo que hace falta para dibujar el paginador. */
export interface PaginaBitacora {
	readonly entries: readonly Informe[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/**
 * La experiencia que el piloto acumuló en una rama del árbol.
 *
 * Hoy es la **suma de lo que tienen sus habilidades** de esa familia, que es lo
 * que se puede decir con verdad: la experiencia va derecha a la habilidad que la
 * usó. Cuando llegue el pozo por familia —decidido y sin implementar, ver
 * docs/systems/SKILLS.md— esta misma ficha pasa a mostrar el pozo, que es un
 * número gastable, sin cambiar de lugar ni de forma.
 */
export interface RamaXp {
	readonly family: string;
	readonly name: string;
	readonly icon: IconName;
	/** Experiencia acumulada en las habilidades de la rama. */
	readonly xp: number;
	/** Cuántas habilidades de la rama tiene entrenadas, de cuántas hay. */
	readonly trained: number;
	readonly total: number;
	/** Cuánto pesa esta rama sobre la que más tiene, de 0 a 100. */
	readonly share: number;
}
