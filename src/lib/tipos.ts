/**
 * Las formas que viajan del servidor a la pantalla.
 *
 * Viven fuera de `server/` porque las usan los dos lados: el `load` las arma y
 * el componente las dibuja. Nada de esto toca la base.
 */

import type { IconName } from '$lib/icons';

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

/** La nave del piloto, resumida para la credencial. */
export interface NaveDelPiloto {
	readonly name: string;
	readonly role: string;
	readonly shield: string;
	readonly armor: string;
	readonly structure: string;
	/**
	 * Lo que hay en el tanque sobre lo que entra: `113 / 120`.
	 *
	 * Va en la credencial y no sólo en la ficha de la nave porque es un número que
	 * se agota y que decide si el próximo salto se puede dar. Un dato así no puede
	 * vivir a dos pestañas de distancia: mirarlo tiene que ser gratis.
	 */
	readonly fuel: string;
	/** Cuántos saltos permite lo que hay, no lo que entraría con el tanque lleno. */
	readonly jumps: string;
	/** Si la configuración que lleva se puede volar. */
	readonly flyable: boolean;
}

/** Lo que toda pantalla del juego sabe del piloto conectado. */
/**
 * El índice del piloto y su rango, ya escritos para la pantalla.
 *
 * El rango va con su número de escalón porque **la pantalla lo enciende cada vez
 * más**: un número suelto que sube no se siente como progreso, y cruzar un umbral
 * sí. Ver `game/rating.ts`.
 */
export interface IndicePiloto {
	/** La cifra, con separador de miles. */
	readonly value: string;
	readonly rank: string;
	/** Qué escalón es, de cero en adelante, y cuántos hay. */
	readonly step: number;
	readonly steps: number;
	/** Qué falta para el que sigue, ya escrito. Vacío en el último. */
	readonly next: string;
}

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
	/** Cuánta experiencia lleva en cada rama del árbol. */
	readonly families: readonly RamaXp[];
	/** Qué tan lejos llegó, en un solo número con su rango. */
	readonly rating: IndicePiloto;
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

/**
 * La corporación a la que pertenece el piloto.
 *
 * **Sin corporación no es un hueco**: es un independiente, y la pantalla lo dice
 * con esas palabras. Va a ser el estado normal el día que se pueda renunciar.
 */
/** Un escalón de la escalera, tal como lo dibuja la figura. */
export interface EscalonReputacion {
	/** Desconocido, Conocido, Confiable, Aliado, Leal. */
	readonly name: string;
	/** En qué punto de la escala de cien está, para ubicarlo en el dibujo. */
	readonly at: number;
	/** Qué nivel de agente abre, en romanos. */
	readonly level: string;
	readonly reached: boolean;
}

/**
 * Lo que una corporación piensa del piloto, ya escrito para la pantalla.
 *
 * Viene con **las dos escaleras**: la suya y la de su bandera. No es un dato de
 * más —la de la facción abre ese mismo nivel en todas las corporaciones que la
 * llevan—, así que mostrar una sin la otra dejaría al jugador sin entender por
 * qué un agente que debería estar cerrado lo atiende.
 */
export interface ReputacionCorporacion {
	/** Lo que tiene con ella, con dos decimales. */
	readonly value: string;
	/** Lo mismo como número de cien, para dibujar. */
	readonly percent: number;
	readonly tier: string;
	/** Cuántos escalones lleva y cuántos hay, para el medidor compacto. */
	readonly reached: number;
	readonly tiers: number;
	/** Qué falta para el próximo, ya escrito. Vacío si ya está arriba de todo. */
	readonly next: string;
	/** El nombre de la bandera, y lo que tiene con ella. */
	readonly faction: string;
	readonly factionValue: string;
	readonly factionPercent: number;
	readonly factionTier: string;
	/** El nivel de agente que le atiende hoy, en romanos: el mayor de los dos. */
	readonly level: string;
	readonly ladder: readonly EscalonReputacion[];
}

export interface Corporacion {
	/** Si pertenece a alguna. Lo demás describe a cuál, o a la falta de una. */
	readonly belongs: boolean;
	readonly name: string;
	readonly code: string;
	/** El rubro, en palabras y en ícono. */
	readonly kind: string;
	readonly kindIcon: IconName;
	/**
	 * Si la fundó el mundo o la fundaron jugadores, ya escrito.
	 *
	 * Hoy son todas del mundo, así que el rótulo dice siempre lo mismo. Va igual:
	 * el día que existan las de jugadores, el que mire una ficha tiene que poder
	 * saber de cuál de las dos clases es **sin haberlo aprendido antes**, y una
	 * distinción que aparece recién cuando hay con qué confundirse llega tarde.
	 */
	readonly origin: string;
	/** A qué facción responde, o vacío. */
	readonly faction: string;
	readonly factionCode: string;
	readonly description: string;
	/** Cuántos pilotos son, ya escrito. */
	readonly members: string;
	/** Las estaciones que opera. Puede no operar ninguna y existir igual. */
	/**
	 * Las primeras estaciones que opera, no todas.
	 *
	 * Una corporación grande puede operar cientos y el panel de una ficha no es el
	 * lugar para leerlas: lo que contesta acá es «¿de qué tamaño es y por dónde
	 * anda?». La lista entera la contesta el mapa, con su recorte puesto.
	 */
	readonly stations: readonly EstacionCorporacion[];
	/** Cuántas quedaron afuera de esa muestra. Cero si entran todas. */
	readonly moreStations: number;
	/** Cuántas opera en total, ya escrito. */
	readonly stationCount: string;
	/** Cuántos agentes tiene, ya escrito. La lista vive en su pestaña. */
	readonly agentCount: string;
	/** Dónde tiene gente sentada repartiendo trabajo. */
	/**
	 * Lo que piensa de vos, o `null` si no respondés a ninguna.
	 *
	 * Es lo único de esta pantalla que habla del piloto y no de ella, y por eso va
	 * aparte: un independiente no tiene reputación «con nadie», tiene reputación
	 * con cada una por separado, y eso es otra pantalla.
	 */
	readonly reputation: ReputacionCorporacion | null;
}

/** Una estación que opera la corporación. */
export interface EstacionCorporacion {
	readonly code: string;
	readonly name: string;
	readonly system: string;
	/** Qué ofrece, ya escrito. */
	readonly services: readonly string[];
}

/**
 * Los miembros de la corporación.
 *
 * Pestaña aparte de la ficha porque es otra pregunta —quiénes son los otros— y
 * porque va a crecer sola: el día que una corporación tenga dos mil pilotos, acá
 * van a hacer falta orden, filtros y paginado, y la ficha va a seguir cabiendo en
 * una pantalla.
 */
export interface Miembros {
	readonly belongs: boolean;
	/** Cuántos son en total, ya escrito. No cambia al filtrar. */
	readonly count: string;
	/** La página pedida, ya ordenada y recortada. */
	readonly members: readonly MiembroCorporacion[];
	readonly query: ConsultaMiembros;
	/** Cuántos hay, cuántos pasaron el recorte y en cuántas páginas entran. */
	readonly total: number;
	readonly found: number;
	readonly pages: number;
	/**
	 * Los oficios que hay adentro, para el desplegable.
	 *
	 * Sólo los que alguien tiene: un filtro que ofrece seis opciones de las que
	 * cinco no encuentran nada hace perder el tiempo cinco veces de cada seis.
	 */
	readonly professions: readonly OpcionConstructor[];
}

/** Un agente de la corporación, tal como lo lista su pestaña. */
export interface FilaAgenteCorporacion {
	readonly code: string;
	readonly name: string;
	/** Qué clase de misiones reparte, en palabras y en ícono. */
	readonly kind: string;
	readonly kindCode: string;
	readonly kindIcon: IconName;
	/** El nivel en romanos para leer, y en número para ordenar. */
	readonly level: string;
	readonly levelValue: number;
	readonly station: string;
	readonly system: string;
	/** Si este piloto tiene reputación suficiente para que lo atienda. */
	readonly open: boolean;
	/** Qué le falta, cuando no. */
	readonly requirement: string;
}

/** Lo que se pidió del listado de agentes. */
export interface ConsultaAgentes {
	readonly search: string;
	readonly sort: string;
	readonly dir: 'asc' | 'desc';
	readonly page: number;
	/** La clase de misión, o vacío. */
	readonly kind: string;
	/** Si se muestran sólo los que ya atienden a este piloto. */
	readonly onlyOpen: boolean;
}

/**
 * La pestaña Agentes: quiénes reparten trabajo en nombre de la corporación.
 *
 * Nace con recorte, orden y paginado como todo listado del proyecto: una
 * corporación grande puede tener un agente por estación, y eso crece por su
 * cuenta mucho después de que la ficha dejó de crecer.
 */
export interface AgentesCorporacion {
	readonly belongs: boolean;
	readonly name: string;
	/** Cuántos son en total, ya escrito. No cambia al filtrar. */
	readonly count: string;
	readonly agents: readonly FilaAgenteCorporacion[];
	readonly query: ConsultaAgentes;
	readonly total: number;
	readonly found: number;
	readonly pages: number;
	/** Cuántos te atienden hoy, para decirlo al lado del filtro. */
	readonly open: number;
	/**
	 * Las clases de misión que hay adentro, para el desplegable.
	 *
	 * Sólo las que alguien reparte: ofrecer las cinco cuando la corporación sólo
	 * tiene mineros hace perder el tiempo cuatro veces de cada cinco.
	 */
	readonly kinds: readonly OpcionConstructor[];
}

/** Lo que se pidió del listado de miembros. */
export interface ConsultaMiembros {
	readonly search: string;
	/** Código de oficio, o vacío para no filtrar por eso. */
	readonly profession: string;
	readonly sort: string;
	readonly dir: 'asc' | 'desc';
	readonly page: number;
}

/** Un piloto de la corporación, con lo que es público de él. */
export interface MiembroCorporacion {
	readonly callsign: string;
	readonly profession: string;
	/** El código además del rótulo: el rótulo es para leer y el código para filtrar. */
	readonly professionCode: string;
	readonly faction: string;
	/** Desde cuándo vuela, en milisegundos UTC: la fecha la escribe el navegador. */
	readonly since: number;
	/** Si sos vos, para que la fila se destaque. */
	readonly isYou: boolean;
}

/** Un módulo de la estación, listo para dibujar en el mosaico. */
export interface BaldosaModulo {
	readonly code: string;
	readonly name: string;
	readonly icon: IconName;
	readonly summary: string;
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
	/**
	 * Qué se puede extraer acá, si es un cinturón.
	 *
	 * Va en Ubicación y no en el árbol del sistema porque **minar es algo que se
	 * hace donde estás parado**: el árbol dice adónde ir, la ubicación dice qué
	 * hacer una vez que llegaste.
	 */
	/** Lo que el piloto sabe de este cinturón, si es uno. */
	readonly field: CampoRocas;
	readonly asteroids: readonly Roca[];
	/** Adónde lleva y qué cuesta, si es una puerta. */
	readonly gate: SalidaPuerta | null;
	/** El tramo que está haciendo, si va en camino. */
	readonly leg: Tramo | null;
}

/**
 * El viaje en curso, visto desde la ubicación.
 *
 * Mientras la nave está en camino, la pestaña no puede decir dónde está —no está
 * en ningún lado— pero sí **de dónde a dónde y cuánto falta**, que es todo lo que
 * uno quiere saber mirando por la ventanilla. Sin eso la pantalla es un cartel
 * que dice «esperá» y nada más.
 */
export interface Tramo {
	readonly kind: string;
	readonly kindLabel: string;
	readonly icon: IconName;
	/** De dónde sale y adónde llega, cada punta con su sistema. */
	readonly origin: PuntaTramo;
	readonly destination: PuntaTramo;
	/** Milisegundos desde la época, para que el navegador cuente solo. */
	readonly startedAt: number;
	readonly durationSeconds: number;
	/** Cuánto tarda en total, ya escrito: `4 m 27 s`. */
	readonly duration: string;
	/** La distancia del salto, ya escrita, o vacío si el viaje es interno. */
	readonly distance: string;
	/** Qué se quema al llegar, ya escrito, o vacío si no se quema nada. */
	readonly fuel: string;
}

/**
 * Una punta del tramo: el cuerpo, y **el sistema donde está**.
 *
 * El sistema va en las dos puntas y no sólo en la de llegada porque en un salto
 * son distintos, y la gracia del salto es justamente ésa. Además viaja con quién
 * manda y cuánta ley hay: el momento en que uno mira adónde va es el momento en
 * que quiere saber a qué está entrando, y en tránsito no hay ninguna otra
 * pantalla que lo diga —la ficha del lugar no existe mientras la nave vuela—.
 */
export interface PuntaTramo {
	readonly name: string;
	/** Qué clase de cuerpo es: estación, puerta estelar, planeta. */
	readonly kindLabel: string;
	readonly icon: IconName;
	readonly system: string;
	/** Quién lo controla, o el rótulo del espacio libre. */
	readonly faction: string;
	/** Cuánta ley hay: `Alta 72`. */
	readonly security: string;
	/** Cómo se gobierna. */
	readonly government: string;
}

/**
 * Una puerta vista desde adentro: adónde lleva y qué cuesta cruzarla.
 *
 * **Todo se dice antes de apretar.** Un salto que se cobra después de ordenarlo
 * es un salto que nadie puede planear, y planear es la mitad de lo que se hace en
 * un juego de naves.
 */
export interface SalidaPuerta {
	/** El sistema del otro lado, o vacío si todavía no lleva a ninguna parte. */
	readonly destination: string;
	/** La puerta gemela, que es donde se aparece. */
	readonly arrival: string;
	/** La distancia, ya escrita: `1,4 al`. */
	readonly distance: string;
	/** Cuánto tarda, en segundos, y escrito. */
	readonly seconds: number;
	readonly duration: string;
	/** Cuánto combustible cuesta, y cuánto hay. */
	readonly fuel: number;
	readonly fuelInTank: number;
	/** El alcance de la nave, para comparar con la distancia. */
	readonly range: string;
	/** Por qué no se puede, o vacío si se puede. */
	readonly blocked: string;
	/** Qué módulo permite saltar y qué habilidades lo mejoran. */
	readonly source: Procedencia;
}

/**
 * Una roca del cinturón, con lo que el piloto sabe de ella.
 *
 * **Sin lectura vigente sale sin identificar**: se ve el bulto pero no de qué es
 * ni cuánto tiene. Eso es lo que le da trabajo al escáner, y lo que hace que
 * llegar a un cinturón desconocido sea algo que hacer en vez de una lista que ya
 * venía escrita.
 */
export interface Roca {
	readonly id: number;
	/** Si tiene lectura vigente. Sin eso no se sabe de qué es ni cuánto tiene. */
	readonly identified: boolean;
	readonly name: string;
	readonly icon: IconName;
	readonly description: string;
	/**
	 * Unidades que quedan, y cuánto es eso de lo que traía al aparecer.
	 *
	 * **Vacío con una lectura superficial**: sin Escaneo se sabe de qué es la
	 * roca, no cuánto tiene. Es lo que hace que entrenar la habilidad se note.
	 */
	readonly remaining: string;
	readonly share: number;
	/** Lo que una orden traería, ya calculado con tu nave y tu bodega. */
	readonly units: number;
	readonly volume: string;
	readonly value: string;
	readonly duration: string;
	/** De cuándo es la lectura: «recién», «hace 9 h». Vacío si nunca la miró. */
	readonly age: string;
	/** Lectura tomada pero vencida: se muestra igual, pero no habilita extraer. */
	readonly stale: boolean;
	/** Por qué no se puede extraer de esta roca, o vacío si se puede. */
	readonly blocked: string;
	/** Por qué no se puede escanearla, o vacío si se puede. */
	readonly scanBlocked: string;
}

/**
 * De dónde sale un verbo, dicho para que el jugador lo lea.
 *
 * **La regla es que el juego no explique la cadena sólo cuando se rompe.** Un
 * piloto con el escáner montado nunca se entera de que hacía falta un escáner, ni
 * de qué habilidades hacen que su lectura sea mejor: se entera el día que le
 * falta algo, que es tarde. Esto va debajo del verbo y lo dice siempre.
 *
 * Distingue dos relaciones que no se parecen y que mostradas iguales confunden:
 * **la llave** habilita —sin escáner no hay verbo— y **la palanca** mejora —con
 * más Escaneo la lectura es mejor, pero sin Escaneo igual se escanea—.
 */
export interface Procedencia {
	/** El verbo del que se habla: «Escanear», «Extraer». */
	readonly verb: string;
	/**
	 * Por qué no se puede **ahora mismo**. Vacía si se puede.
	 *
	 * No es lo mismo que un módulo que falta, y confundirlos fue el error: un
	 * módulo que falta es una carencia permanente que se arregla comprando, y esto
	 * es por qué el botón está apagado en este momento, que puede ser una orden en
	 * curso y se arregla esperando. Un botón apagado sin este renglón es un botón
	 * que no explica nada, y es exactamente lo que el aviso vino a evitar.
	 */
	readonly blockers: readonly string[];
	/**
	 * Los módulos que el verbo necesita montados, cumplidos o no.
	 *
	 * Los que faltan viajan igual: son lo que hay que comprar, y el único motivo
	 * por el que alguien abre este aviso cuando el botón está apagado.
	 */
	readonly modules: readonly Aparato[];
	/** Las habilidades que cambian el resultado, tenidas o no. */
	readonly levers: readonly Palanca[];
	/** Qué rinde hoy, con su rótulo: «Alcance · 2,7 al». */
	readonly effects: readonly Lectura[];
	/**
	 * Qué daría cada escalón siguiente, o vacía si no hay ninguno a la vista.
	 *
	 * Es lo que convierte el rótulo en una decisión: sin esto la línea informa, y
	 * con esto es el motivo para entrenar la habilidad de al lado.
	 */
	readonly next: readonly string[];
}

/** Un módulo que un verbo necesita: qué hace falta, y qué hay puesto. */
export interface Aparato {
	/** Qué clase de pieza pide: «Motor de salto», «Escáner». */
	readonly requirement: string;
	/** El módulo montado que lo cumple, o vacío si falta. */
	readonly name: string;
	readonly fitted: boolean;
}

/**
 * Un rótulo y su valor, ya escritos.
 *
 * Existe porque esta pareja aparece en media docena de lugares —el cartel de
 * confirmación, el informe, la procedencia— y escribirla a mano en cada uno deja
 * seis formas de lo mismo.
 */
export interface Lectura {
	readonly label: string;
	readonly value: string;
}

/** Una habilidad que mueve el resultado de un verbo. */
export interface Palanca {
	readonly name: string;
	/** El nivel que tiene, en romano, o vacío si todavía no la tiene. */
	readonly level: string;
	/** Si la tiene. Las que faltan se dibujan apagadas: son la lista de compras. */
	readonly known: boolean;
}

/**
 * El campo de rocas y el instrumento con que se lo mira.
 *
 * Es lo que las rocas tienen en común —cuántas hay, cuántas están identificadas,
 * qué lectura sacaría el escáner montado— y va aparte de ellas porque no es de
 * ninguna: es de la nave y del cinturón.
 */
export interface CampoRocas {
	/** Si acá hay algo que escanear. Falso en cualquier cuerpo que no sea un cinturón. */
	readonly scannable: boolean;
	/** Cuántas rocas hay y cuántas están identificadas. */
	readonly count: string;
	/** Qué lectura sacaría el escáner que lleva montado. */
	readonly depthLabel: string;
	readonly duration: string;
	/** A qué ritmo repone el campo. Sólo con una lectura completa y vigente. */
	readonly regen: string;
	/** Por qué no se puede escanear nada acá, o vacío si se puede. */
	readonly blocked: string;
	/**
	 * De dónde salen los dos verbos del cinturón.
	 *
	 * Van acá y no en cada roca porque el escáner y el láser son **de la nave**:
	 * repetirlos debajo de las ocho piedras sería decir ocho veces lo mismo, que es
	 * el mismo motivo por el que este tipo existe.
	 */
	readonly scanSource: Procedencia;
	readonly mineSource: Procedencia;
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
	/**
	 * Qué módulo permite viajar y qué habilidades lo mejoran.
	 *
	 * Uno solo para todo el árbol: los propulsores son de la nave, no del cuerpo al
	 * que se va. Cada fila lo muestra igual porque el botón vive en la fila, y la
	 * explicación tiene que estar donde está el botón.
	 */
	readonly travelSource: Procedencia;
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
	/** La clase de la ranura: el nodo la dice por su tamaño. */
	readonly size: number;
	/**
	 * Dónde cae en el anillo: el ángulo desde arriba y la posición en porcentaje.
	 *
	 * El ángulo viaja además de la posición porque la pantalla lo necesita para
	 * decidir **hacia dónde abrir** el panel de la ranura: hacia afuera del
	 * círculo, que es el único lado donde no tapa ni la nave ni las otras.
	 */
	readonly angle: number;
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
	/**
	 * Lo que le queda en el tanque.
	 *
	 * Es el contenido; la capacidad la calcula la ficha con el equipamiento. Van
	 * separados porque cambian por motivos distintos: la capacidad al montar un
	 * tanque, el contenido al saltar.
	 */
	readonly fuel: number;
	/** Dónde está atracado el piloto y qué módulos tiene ese lugar. */
	readonly stationName: string;
	/**
	 * Los códigos de los módulos que lleva **en la nave**.
	 *
	 * Un montón por código y no una unidad por entrada: son fungibles, así que
	 * cuál de los tres se monta da igual.
	 */
	readonly cargoModules: readonly string[];
	/**
	 * Y los que tiene guardados **en esta estación**.
	 *
	 * Son las dos bodegas del piloto, y la diferencia importa: lo de la nave viaja
	 * con vos, lo de la estación hay que venir a buscarlo. Vacío si no está
	 * atracado.
	 */
	readonly stationModules: readonly string[];
	/** Si puede tocar la nave acá y ahora, y por qué no si no puede. */
	readonly canRefit: boolean;
	readonly refitBlocked: string;
}

/**
 * Lo que una acción depositó en el pozo de una rama.
 *
 * Es lo que el informe cuenta desde que existe el pozo por familia: una acción
 * le paga a la rama, no a la habilidad, y el piloto decide después en qué
 * gastarlo.
 */
export interface GananciaPozo {
	readonly family: string;
	readonly name: string;
	readonly icon: IconName;
	readonly xp: number;
	/** Lo que había en el pozo antes y lo que quedó para gastar. */
	readonly before: number;
	readonly after: number;
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
	/** El depósito al pozo, que es lo que una acción deja hoy. */
	readonly deposit: GananciaPozo | null;
	/**
	 * La experiencia por habilidad de los informes anteriores al pozo. Vacía en
	 * los nuevos: hoy una acción no le paga a una habilidad.
	 */
	readonly xp: readonly GananciaXp[];
	/**
	 * Lo que la acción produjo, si produjo algo.
	 *
	 * La experiencia dice lo que el piloto aprendió; esto dice lo que se trajo, y
	 * son dos cosas distintas. Un informe de extracción sin el botín cuenta la
	 * mitad de lo que pasó.
	 */
	readonly loot: GananciaCarga | null;
	/** Todo lo que dejó la acción, sumado. */
	readonly xpTotal: number;
	readonly unread: boolean;
}

/** Lo que una acción trajo a la bodega. */
export interface GananciaCarga {
	readonly itemCode: string;
	readonly name: string;
	readonly icon: IconName;
	readonly units: number;
	readonly volume: string;
	readonly value: string;
}

/** Una página de la bitácora, con lo que hace falta para dibujar el paginador. */
export interface PaginaBitacora {
	readonly entries: readonly Informe[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/**
 * Cómo le fue al piloto en una rama del árbol, **en sus dos números**.
 *
 * Son dos cosas distintas y las dos importan: lo que ya se convirtió en niveles
 * y lo que está esperando en el pozo. Una rama con mucho invertido dice quién es
 * el piloto; una con mucho pozo dice qué puede ser mañana, y mirar una sola de
 * las dos deja afuera media respuesta. Ver docs/systems/SKILLS.md.
 */
export interface RamaXp {
	readonly family: string;
	readonly name: string;
	readonly icon: IconName;
	/** Lo ya invertido: la suma de lo que tienen sus habilidades. */
	readonly xp: number;
	/** Lo que queda en el pozo de la rama, sin gastar. */
	readonly pool: number;
	/** Cuántas habilidades de la rama tiene entrenadas, de cuántas hay. */
	readonly trained: number;
	readonly total: number;
	/** Cuánto pesa lo invertido sobre la rama más cargada, de 0 a 100. */
	readonly share: number;
	/**
	 * Lo mismo para el pozo, **contra el mismo techo**: si cada uno se midiera
	 * contra su propio máximo, las dos figuras del hexágono no se podrían comparar.
	 */
	readonly poolShare: number;
}

/** Una habilidad del catálogo, con lo que el piloto tiene de ella. */
export interface FilaArbol {
	readonly code: string;
	readonly name: string;
	readonly family: string;
	readonly familyName: string;
	readonly familyIcon: IconName;
	/** Sobre qué actúa, para el detalle. */
	readonly governs: string;
	/** El multiplicador de x1 a x5: cuántas veces cuesta la curva base. */
	readonly difficulty: number;
	readonly level: number;
	/** El nivel en romanos, o "0" cuando todavía no empezó. */
	readonly levelLabel: string;
	readonly xp: number;
	/** Cuánto lleva del nivel siguiente, de 0 a 100. */
	readonly progress: number;
	/** Lo que cuesta el salto al nivel siguiente. Cero si está al tope. */
	readonly cost: number;
	readonly nextLevel: number;
	/** Si el pozo de su rama alcanza y los requisitos están. */
	readonly canInvest: boolean;
	/** Por qué no se puede, escrito para mostrar. Vacío si se puede. */
	readonly blocked: string;
	/** Las habilidades que le faltan, ya con su nombre y nivel. */
	readonly missing: readonly string[];
	/** Si el piloto la tiene empezada. */
	readonly trained: boolean;
	readonly maxed: boolean;
}

/** Un pozo listo para mostrar, con lo que hay para gastar. */
export interface PozoRama {
	readonly family: string;
	readonly name: string;
	readonly icon: IconName;
	readonly xp: number;
	/** Cuántas habilidades de la rama se pueden subir con lo que hay. */
	readonly affordable: number;
	readonly total: number;
}

/** Todo lo que la pantalla de habilidades necesita. */
export interface Arbol {
	readonly pools: readonly PozoRama[];
	readonly skills: readonly FilaArbol[];
	/** Cuántas tiene empezadas, de cuántas hay. */
	readonly trained: number;
	readonly total: number;
}

/** Una línea de la bodega: un montón de algo, con lo que ocupa y lo que vale. */
export interface FilaCarga {
	readonly itemCode: string;
	readonly name: string;
	readonly kindLabel: string;
	readonly icon: IconName;
	readonly quantity: number;
	/** Lo que ocupa este montón, ya escrito en metros cúbicos. */
	readonly volume: string;
	/** Cuánto pesa sobre lo ocupado, de 0 a 100. Es lo que dibuja la barra. */
	readonly share: number;
	/** Lo que valdría a precio de referencia, para saber si vale el viaje. */
	readonly value: string;
}

/**
 * La bodega de la nave, lista para dibujar.
 *
 * Lleva lo ocupado **y** el tope porque la pregunta de una bodega nunca es
 * cuánto llevás: es cuánto más entra.
 */
export interface Bodega {
	readonly shipName: string;
	readonly lines: readonly FilaCarga[];
	readonly used: string;
	readonly capacity: string;
	readonly free: string;
	/** Cuánto va lleno, de 0 a 100. */
	readonly percent: number;
	readonly totalValue: string;
	/**
	 * Lo que el piloto tiene guardado **en la estación donde está**, si está en
	 * una.
	 *
	 * Va en la misma pantalla que la bodega de la nave y no en otra: son las dos
	 * mitades de la misma pregunta —qué tengo y dónde—, y separarlas obligaría a
	 * ir y volver para compararlas. Sin tope: una estación no cobra por metro
	 * cúbico todavía.
	 */
	readonly stationName: string;
	readonly stationLines: readonly FilaCarga[];
	readonly stationValue: string;
}

/** Un movimiento de la billetera, listo para dibujar. */
export interface MovimientoBilletera {
	readonly id: number;
	readonly at: number;
	readonly kindLabel: string;
	readonly icon: IconName;
	/** Con su signo y su unidad: "+480 CR", "−1.200 CR". */
	readonly amount: string;
	readonly incoming: boolean;
	/** El saldo con el que quedó, que es lo que hace auditable el libro. */
	readonly balanceAfter: string;
	readonly memo: string;
	readonly place: string;
}

/** La billetera del piloto: el saldo y el libro que lo explica. */
/** Un asiento del libro de reputación, ya escrito para la tabla. */
export interface MovimientoReputacion {
	readonly id: number;
	/** Con el signo escrito y no sólo pintado: `+1,00`. */
	readonly amount: string;
	readonly positive: boolean;
	/** El valor que dejó, para poder seguir la escalera fila por fila. */
	readonly valueAfter: string;
	/** Por qué se movió, en palabras. */
	readonly reason: string;
	readonly icon: IconName;
	readonly memo: string;
	/** Cuándo, en milisegundos UTC: lo formatea el navegador. */
	readonly at: number;
}

/**
 * La pestaña Reputación: la escalera con tu corporación y cómo llegaste ahí.
 *
 * Es la única pantalla del juego que contesta «¿de dónde salió este número?», y
 * por eso el histórico no es un adorno: es la mitad de la pantalla.
 */
export interface PaginaReputacion {
	readonly belongs: boolean;
	readonly name: string;
	readonly code: string;
	readonly reputation: ReputacionCorporacion | null;
	readonly moves: readonly MovimientoReputacion[];
	readonly page: number;
	readonly pages: number;
	readonly total: number;
}

export interface Billetera {
	readonly balance: string;
	/**
	 * Lo que entró y lo que salió desde siempre, los dos en positivo.
	 *
	 * El saldo dice dónde estás; estos dos dicen **cómo llegaste**. Un piloto con
	 * cien mil créditos que movió un millón y otro que movió ciento diez mil no
	 * están en la misma situación aunque el saldo sea el mismo.
	 */
	readonly incoming: string;
	readonly outgoing: string;
	readonly entries: readonly MovimientoBilletera[];
	readonly total: number;
}

/**
 * La horquilla de una estación, desarmada para poder explicarla.
 *
 * Viaja en pedazos y no como un solo porcentaje porque la figura de la pantalla
 * del mercado es exactamente esto: cuánto se queda la estación y qué lo está
 * angostando. Un 13 % suelto no enseña nada; "20 de base, −3 por casa comercial,
 * −4 por Regateo" enseña el juego mientras se lo juega.
 */
export interface Horquilla {
	readonly percent: number;
	readonly base: number;
	readonly corporationEdge: number;
	readonly haggling: number;
	/** Si el piso fue lo que terminó decidiendo el número. */
	readonly atFloor: boolean;
}

/**
 * Una rama del árbol del mercado.
 *
 * Es el examinador de categorías: dos niveles, con los módulos abriéndose por
 * ranura. El día que haya seiscientos módulos, es lo que hace que encontrar uno
 * siga siendo posible sin saber cómo se llama.
 */
export interface GrupoMercado {
	readonly code: string;
	readonly label: string;
	readonly icon: IconName;
	/** La rama de la que cuelga, o vacío si es de primer nivel. */
	readonly parent: string;
	readonly count: number;
}

/**
 * Dónde está una estación, desarmado para poder mostrarlo entero al señalarlo.
 *
 * En la tabla va **sólo el nombre**: una designación completa en cada renglón
 * empuja las cifras fuera de la pantalla. El camino —qué orbita, en qué sistema,
 * en qué región— aparece en el aviso, que es donde hace falta y no molesta.
 */
export interface LugarOrden {
	readonly station: string;
	/** El planeta, la luna o el cinturón donde está amarrada. */
	readonly orbits: string;
	readonly system: string;
	readonly region: string;
	/** Cuántos saltos, o "Acá" si es el mostrador donde uno está parado. */
	readonly jumps: string;
}

/**
 * Un renglón del catálogo del mercado.
 *
 * Lleva **lo mínimo para decidir si vale abrirlo**: el mejor precio de cada lado
 * y cuántas órdenes hay detrás. El libro entero se pide al abrir el ítem, porque
 * traerlo de los cincuenta y un renglones sería pedir miles de filas de las que
 * se miran dos.
 *
 * Y lleva todo resuelto —grupo, clase, escalón— para poder buscar y filtrar en el
 * navegador: una lista que va al servidor por cada tecla es insoportable en
 * cuanto la lista crece.
 */
export interface FilaMercado {
	readonly itemCode: string;
	readonly name: string;
	readonly icon: IconName;
	readonly kindLabel: string;
	/** La rama del árbol donde cuelga. */
	readonly group: string;
	readonly groupLabel: string;
	/** Clase y escalón juntos, como los escribe el equipamiento: "2E". */
	readonly tier: string;
	readonly size: number;
	readonly tierLetter: string;
	readonly volume: string;
	readonly summary: string;
	/** El precio de referencia, para poder rehacer la cuenta del lote. */
	readonly basePrice: number;
	/**
	 * Lo más barato que alguien vende, contando a la estación, **y dónde está**.
	 *
	 * El mercado se mira desde cualquier parte, así que un precio sin lugar no
	 * alcanza para decidir nada: lo barato a cuatro saltos es barato más un viaje.
	 */
	readonly bestAsk: number | null;
	readonly bestAskLabel: string;
	readonly bestAskPlace: LugarOrden | null;
	/** Lo más que alguien paga, y dónde. */
	readonly bestBid: number | null;
	readonly bestBidLabel: string;
	readonly bestBidPlace: LugarOrden | null;
	readonly sellOrders: number;
	readonly buyOrders: number;
	/** Cuánto tiene el piloto, sumando todas sus bodegas de la galaxia. */
	readonly held: number;
}

/**
 * Una orden propia, tal como se lista en la mesa del piloto.
 *
 * Incluye las que **todavía se están acordando**: no están en el libro y hay que
 * decirlo, o el piloto las busca ahí y cree que se perdieron.
 */
export interface OrdenPropia {
	readonly id: number;
	readonly kind: string;
	readonly kindLabel: string;
	readonly itemCode: string;
	readonly name: string;
	readonly quantity: number;
	readonly initialQuantity: number;
	readonly price: string;
	readonly value: string;
	readonly stationName: string;
	readonly pending: boolean;
	readonly opensAt: number;
	readonly expiresAt: number;
}

/** Cuánto puede durar una orden, de las que este piloto puede elegir. */
export interface DuracionOrden {
	readonly days: number;
	readonly label: string;
}

/** El mercado de la región, visto desde donde está el piloto. */
export interface Mercado {
	readonly regionName: string;
	/** Cuántas regiones alcanza a ver, contando la propia. */
	readonly regionsInRange: number;
	/**
	 * Los niveles del piloto, para la ayuda que dice qué habilidad mueve cada
	 * número de la pantalla. Van todos y no los tres que se usan: son veintitrés
	 * enteros, y recortarlos obligaría a tocar el servidor cada vez que la pantalla
	 * quiera explicar un número más.
	 */
	readonly pilotLevels: Readonly<Record<string, number>>;
	readonly stationCount: number;
	/** Dónde está atracado, o vacío si no lo está. */
	readonly dockedAt: string;
	/** La estación donde puede operar, o nula si no puede. */
	readonly dockedStationId: number | null;
	readonly canTradeHere: boolean;
	/** Por qué no puede operar, escrito para el jugador. */
	readonly whyNot: string;
	readonly balance: string;
	/** Cuántas órdenes tiene abiertas de cada lado, y el tope por lado. */
	readonly openBuys: number;
	readonly openSells: number;
	readonly orderLimit: number;
	/** Hasta dónde puede llegar una orden de compra suya, en regiones. */
	readonly maxRange: number;
	/** Lo que le cobran por publicar y por vender, en milésimos. */
	readonly brokerPermille: number;
	readonly taxPermille: number;
	readonly oreSpread: Horquilla;
	readonly moduleSpread: Horquilla;
	readonly groups: readonly GrupoMercado[];
	readonly items: readonly FilaMercado[];
	/** Las duraciones que puede elegir al publicar. El tope lo da Contactos. */
	readonly durations: readonly DuracionOrden[];
	/** Sus órdenes abiertas y las que todavía se están acordando. */
	readonly orders: readonly OrdenPropia[];
	readonly cargoFree: string;
}

/** Un montón de algo, en algún lugar de la galaxia. */
export interface FilaPropiedad {
	readonly itemCode: string;
	readonly name: string;
	readonly icon: IconName;
	readonly kindLabel: string;
	readonly quantity: number;
	readonly volume: string;
	readonly value: string;
	/** Si está publicado en una orden de venta: sigue siendo tuyo, pero atado. */
	readonly listed: boolean;
}

/**
 * Un lugar donde el piloto tiene cosas.
 *
 * Lleva **su valor**: es lo que convierte "tengo cosas en el Muelle" en "tengo
 * catorce mil créditos parados en el Muelle", que es una frase que hace actuar.
 */
export interface LugarPropiedad {
	readonly key: string;
	readonly kind: string;
	readonly name: string;
	/** El sistema y la región, o "Con vos" si es la bodega de la nave. */
	readonly where: string;
	/** A dónde viajar para tocarlo. Nulo en la nave, que ya viaja con uno. */
	readonly bodyId: number | null;
	readonly lines: readonly FilaPropiedad[];
	readonly used: string;
	/** El tope, sólo donde hay uno. */
	readonly capacity: string;
	readonly percent: number;
	readonly value: string;
	readonly valueRaw: number;
	/** Si el piloto está parado justo ahí. */
	readonly here: boolean;
	readonly listedCount: number;
}

/** Todo lo del piloto, lugar por lugar. */
export interface Propiedades {
	readonly places: readonly LugarPropiedad[];
	readonly totalValue: string;
	readonly placeCount: number;
}

/**
 * Una orden del libro, lista para dibujar.
 *
 * Es la misma forma para las dos tablas y para los dos orígenes: una orden de
 * jugador y la de la estación se dibujan igual, y lo único que las distingue es
 * que la de la estación **no se agota** y que no tiene id con el que operar.
 */
export interface OrdenMercado {
	/** Nulo en la de la estación: no es una fila de la base. */
	readonly id: number | null;
	readonly npc: boolean;
	/** Si es del propio piloto, para poder cancelarla y no comprarse a sí mismo. */
	readonly mine: boolean;
	/** Nulo cuando no tiene tope. */
	readonly quantity: number | null;
	readonly quantityLabel: string;
	readonly price: number;
	readonly priceLabel: string;
	readonly stationId: number;
	readonly stationName: string;
	readonly systemName: string;
	/** Cuán lejos está de donde está el piloto. Cero es "acá mismo". */
	readonly distance: number;
	readonly distanceLabel: string;
	/** Dónde está, desarmado, para el aviso que lo muestra entero. */
	readonly place: LugarOrden;
	/** Hasta dónde alcanza, sólo en las de compra. */
	readonly rangeLabel: string;
}

/**
 * Lo que muestra la pestaña de las órdenes propias de un lado.
 *
 * Es su propia vista y no un recorte del mercado entero: esta pantalla no
 * necesita el catálogo de cincuenta y un ítems ni el árbol de ramas, y armarlos
 * para tirarlos sería trabajo del servidor que nadie mira.
 */
export interface MisOrdenes {
	readonly kind: 'sell' | 'buy';
	readonly orders: readonly OrdenPropia[];
	/** Cuántas hay del otro lado, para el número de la otra pestaña. */
	readonly otherCount: number;
	readonly balance: string;
}

/** Un día de mercado, que es la unidad en que se mira una tendencia. */
export interface DiaMercado {
	readonly at: number;
	readonly low: number;
	readonly high: number;
	readonly average: number;
	readonly volume: number;
	readonly trades: number;
}

/** Los dos libros de un ítem, con su historial y lo que el piloto tiene a mano. */
export interface LibroMercado {
	readonly itemCode: string;
	readonly name: string;
	/**
	 * La cabeza de cada lado, no el libro entero.
	 *
	 * Un ítem popular puede juntar miles de órdenes y nadie opera contra la
	 * número ochocientos. El total va aparte para poder decir cuántas quedaron
	 * afuera, que es lo que dice si el mercado está profundo.
	 */
	readonly sellers: readonly OrdenMercado[];
	readonly buyers: readonly OrdenMercado[];
	readonly sellersTotal: number;
	readonly buyersTotal: number;
	readonly history: readonly DiaMercado[];
	readonly inShip: number;
	readonly inStation: number;
}

// --- Cuartel general --------------------------------------------------------

/** Una fila del registro de eventos, lista para dibujar. */
export interface FilaEvento {
	readonly id: number;
	/** Milisegundos desde la época, en UTC. */
	readonly at: number;
	readonly kind: string;
	readonly label: string;
	readonly icon: IconName;
	readonly tone: 'neutral' | 'notable' | 'grave';
	readonly categoryLabel: string;
	/** La frase ya redactada a partir de lo que se guardó. */
	readonly text: string;
	/** Quién lo hizo. Vacío quiere decir que no lo hizo nadie. */
	readonly actor: string;
	/**
	 * Su número de piloto, para poder filtrar por él.
	 *
	 * Sigue viniendo aunque la cuenta ya no exista: el registro lo guarda y
	 * filtrar por ella es justo lo que uno quiere hacer después de una baja.
	 */
	readonly actorId: number | null;
}

/**
 * Un día de la traza de actividad.
 *
 * Es la unidad de la figura del registro: una barra por día. El alto sale del
 * total y no de un porcentaje calculado en el servidor, para que la figura pueda
 * escalarse contra el día más movido sin pedir nada de vuelta.
 */
export interface DiaRegistro {
	/** El día en UTC, como `2026-09-16`. */
	readonly day: string;
	readonly total: number;
}

/** Con qué se está filtrando el registro ahora mismo. */
export interface FiltroRegistro {
	readonly category: string;
	readonly kind: string;
	/** El día elegido en la traza, o vacío si se miran todos. */
	readonly day: string;
	/**
	 * El piloto cuyos actos se están mirando, o `null` si se miran los de todos.
	 *
	 * Va el número y el nombre por separado: el número es lo que arma la URL y el
	 * nombre lo que se muestra, y el nombre de una cuenta dada de baja tiene que
	 * poder salir del propio registro.
	 */
	readonly actor: number | null;
	readonly actorName: string;
}

/** Una opción del filtro, con su cuenta dentro del período mirado. */
export interface OpcionFiltro {
	readonly value: string;
	readonly label: string;
}

/** El registro de eventos, tal como lo dibuja el cuartel. */
export interface Registro {
	readonly rows: readonly FilaEvento[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
	readonly days: readonly DiaRegistro[];
	readonly filters: FiltroRegistro;
	readonly categories: readonly OpcionFiltro[];
	readonly kinds: readonly OpcionFiltro[];
}

/** Un rol del piloto, tal como se lo muestra en el cuartel. */
export interface RolPropio {
	readonly code: string;
	readonly name: string;
	readonly description: string;
}

/** Una llave, con lo que abre explicado para quien no escribió el código. */
export interface LlaveCuartel {
	readonly label: string;
	readonly summary: string;
	readonly dangerous: boolean;
}

/** Las llaves de un área, agrupadas para poder leerlas. */
export interface AreaCuartel {
	readonly label: string;
	readonly keys: readonly LlaveCuartel[];
}

/** La portada del cuartel: qué podés hacer y qué pasó recién. */
export interface Cuartel {
	readonly roles: readonly RolPropio[];
	readonly areas: readonly AreaCuartel[];
	/** Los últimos eventos, o vacío si no tiene la llave para verlos. */
	readonly recent: readonly FilaEvento[];
	readonly events: number;
}

// --- El constructor de sistemas ---------------------------------------------

/** Una opción de un desplegable del constructor. */
export interface OpcionConstructor {
	readonly value: string;
	readonly label: string;
	/** Para agrupar: la constelación dice de qué región es. */
	readonly group?: string;
}

/** Un gobierno con la banda de seguridad que admite. */
export interface OpcionGobierno {
	readonly value: string;
	readonly label: string;
	readonly min: number;
	readonly max: number;
	/** La misma banda, ya recortada por el techo del espacio libre. */
	readonly freeMin: number;
	readonly freeMax: number;
}

/** Lo que el constructor ofrece para llenar sus formularios. */
export interface OpcionesConstructor {
	readonly regions: readonly OpcionConstructor[];
	readonly constellations: readonly OpcionConstructor[];
	readonly factions: readonly OpcionConstructor[];
	readonly governments: readonly OpcionGobierno[];
	readonly corporations: readonly OpcionConstructor[];
	readonly services: readonly OpcionConstructor[];
	readonly ores: readonly OpcionConstructor[];
	readonly bodyKinds: readonly OpcionConstructor[];
}

/** Un sistema en el listado del cuartel. */
export interface FilaSistema {
	readonly id: number;
	readonly code: string;
	readonly name: string;
	readonly constellation: string;
	/** El color elegido de cada una, o vacío para el automático. */
	readonly regionColor: string;
	readonly constellationColor: string;
	readonly region: string;
	readonly government: string;
	/**
	 * Los códigos, además de los rótulos.
	 *
	 * El rótulo es para leer y el código para filtrar: comparar por el texto
	 * visible ata el filtro al idioma, y rompe el día que «Corporativo» se escriba
	 * distinto.
	 */
	readonly governmentCode: string;
	readonly controllingFactionCode: string;
	readonly security: number;
	readonly securityLevel: string;
	/** Quién lo controla, o «Espacio libre». */
	readonly controlledBy: string;
	/** De quién es capital, o vacío. */
	readonly capitalOf: string;
	readonly bodies: number;
	readonly stations: number;
	/**
	 * Los servicios que hay en el sistema, juntando todas sus estaciones.
	 *
	 * Sale del mismo lugar que los del mapa —una sola cuenta para las dos vistas—
	 * y es lo que deja filtrar «los que tienen astillero» sin abrir sistema por
	 * sistema a ver dónde quedó el único que hay.
	 */
	readonly services: readonly string[];
	readonly gates: number;
	/** Cuántas de sus puertas todavía no llevan a ninguna parte. */
	readonly loose: number;
}

/** El universo entero, como lo ve quien lo construye. */
export interface Universo {
	readonly systems: readonly FilaSistema[];
	readonly options: OpcionesConstructor;
	readonly totalBodies: number;
	readonly totalGates: number;
	readonly totalLoose: number;
	/** El mapa: los mismos sistemas, puestos en la grilla. */
	readonly map: MapaGalaxia;
	/**
	 * Los códigos que pasan el filtro.
	 *
	 * **El mapa recibe la galaxia entera igual.** Un mapa que sólo dibuja lo
	 * filtrado deja de ser un mapa: se pierde la forma del conjunto, que es lo
	 * único que no da la tabla. Lo que el filtro hace es apagar el resto, no
	 * borrarlo.
	 */
	readonly matches: readonly string[];
	/** Cómo quedó la consulta, para que la pantalla dibuje sus controles. */
	readonly query: ConsultaUniverso;
	/**
	 * Las regiones con sus constelaciones, para el panel que las edita.
	 *
	 * Van con la cuenta de sistemas de cada una: una constelación vacía es trabajo a
	 * medio hacer, y verlo en la lista es la única forma de acordarse de terminarla.
	 */
	readonly taxonomy: readonly FilaRegion[];
	/** Cuántos sistemas hay en total y cuántos pasan el filtro. */
	readonly total: number;
	readonly found: number;
	readonly pages: number;
}

/** Una región del cuartel, con sus constelaciones adentro. */
export interface FilaRegion {
	readonly id: number;
	readonly name: string;
	/** El color elegido, o vacío. El resuelto lo calcula la pantalla. */
	readonly color: string;
	readonly systems: number;
	readonly constellations: readonly FilaConstelacion[];
}

/** Una constelación, con cuántos sistemas tiene adentro. */
export interface FilaConstelacion {
	readonly id: number;
	readonly name: string;
	readonly color: string;
	readonly systems: number;
}

/** Lo que se pidió del listado de sistemas: filtros, orden y página. */
export interface ConsultaUniverso {
	readonly search: string;
	readonly faction: string;
	readonly region: string;
	readonly constellation: string;
	readonly government: string;
	/** Código de un servicio de estación, o vacío para no filtrar por eso. */
	readonly service: string;
	readonly sort: string;
	readonly dir: 'asc' | 'desc';
	readonly page: number;
	/** Por qué criterio pinta el mapa. */
	readonly paint: string;
	/**
	 * Qué territorio dibuja el mapa por debajo: `region`, `constelacion` o nada.
	 *
	 * Va en la consulta y no en el navegador porque es parte de **cómo se está
	 * mirando** la galaxia, igual que el pintado: un mapa que alguien comparte
	 * tiene que llegar del otro lado como lo estaba viendo.
	 */
	readonly territory: string;
}

/**
 * La galaxia lista para dibujar: casillas y las líneas entre ellas.
 *
 * **Va entera en una sola carga.** Sin niebla de guerra —como en EVE, el mapa se
 * conoce y lo que cuesta es llegar— no hay nada que esconder, y una galaxia de
 * unos cientos de sistemas pesa menos que una pantalla de mercado. El día que no
 * entre, el recorte natural es por región, no por cercanía.
 */
export interface CorporacionEnElMapa {
	readonly code: string;
	readonly name: string;
}

export interface MapaGalaxia {
	readonly systems: readonly NodoGalaxia[];
	readonly links: readonly EnlaceGalaxia[];
	/**
	 * Las corporaciones que operan **al menos un puesto** del mapa, por nombre.
	 *
	 * Van acá y no se deducen de los sistemas porque el desplegable necesita el
	 * nombre y el nodo guarda códigos. Y son sólo las que tienen algo: un filtro
	 * que ofrece cuarenta opciones de las que treinta y cinco no encuentran nada
	 * hace perder el tiempo siete veces de cada ocho.
	 */
	readonly corporations: readonly CorporacionEnElMapa[];
	/** Qué tan grande es el mapa, en casillas, para encuadrar el dibujo. */
	readonly radius: number;
	/** Cuántos sistemas quedaron fuera del mapa por no llegar a la semilla. */
	readonly adrift: number;
}

/**
 * La pestaña Galaxia: el mapa, dónde estás y adónde podés ir.
 *
 * Es el tercer nivel de acercamiento de Navegación —cuerpo, sistema, galaxia— y
 * contesta una sola pregunta que las otras dos no pueden: **dónde queda esto que
 * estoy mirando, y qué hay alrededor**.
 */
export interface Galaxia {
	readonly map: MapaGalaxia;
	readonly pilot: PilotoEnElMapa;
	/** El sistema donde está, ya resuelto, para la ficha de entrada. */
	readonly here: NodoGalaxia | null;
	/** Las salidas del sistema donde está, con lo que cuesta cada una. */
	readonly exits: readonly SalidaGalaxia[];
	/** Los códigos que pasan el filtro. Vacío si no hay filtro puesto. */
	readonly matches: readonly string[];
	readonly query: ConsultaGalaxia;
	readonly total: number;
	readonly found: number;
	/**
	 * De dónde sale el verbo del mapa, que es **viajar** y no saltar.
	 *
	 * Desde el mapa no se cruza una puerta: para eso hay que estar parado en ella.
	 * Lo que el mapa ofrece es la orden de ir hasta la puerta, y como cualquier otra
	 * acción del juego dice qué la habilita y por qué no se puede.
	 */
	readonly travelSource: Procedencia;
	/**
	 * Y de dónde sale **saltar**, para el único control del mapa que no viaja.
	 *
	 * Cuando ya estás parado en la puerta, lo que falta es cruzarla, y eso se hace
	 * desde Ubicación. El mapa no da esa orden pero sí ofrece el camino hasta ella,
	 * así que tiene que saber **por qué no se puede** —con una orden en curso,
	 * Ubicación muestra el viaje y no la puerta— o mandaría a una pantalla que no
	 * tiene el botón que promete.
	 */
	readonly jumpSource: Procedencia;
}

/** Una salida del sistema donde está el piloto, vista desde el mapa. */
export interface SalidaGalaxia {
	/** Adónde lleva: el código y el nombre del sistema del otro lado. */
	readonly code: string;
	readonly name: string;
	/** La puerta de este lado, que es adonde hay que viajar para cruzar. */
	readonly gate: string;
	readonly gateCode: string;
	readonly bearing: string;
	/**
	 * Qué cuesta llegar hasta la puerta, que es lo que el mapa ordena.
	 *
	 * **Es un viaje dentro del sistema, no el salto.** Van los dos porque son dos
	 * cosas distintas y las dos se pagan: primero se cruza medio sistema hasta la
	 * puerta, y recién ahí se salta.
	 */
	readonly travelDistance: string;
	readonly travelDuration: string;
	/** Qué cuesta el salto, ya escrito. */
	readonly distance: string;
	readonly duration: string;
	readonly fuel: string;
	/** Si el piloto ya está parado en esa puerta. */
	readonly standingThere: boolean;
	/** Por qué no se puede cruzar, o vacío. */
	readonly blocked: string;
}

/** Lo que se pidió del mapa: los filtros del jugador. */
export interface ConsultaGalaxia {
	readonly search: string;
	readonly faction: string;
	readonly region: string;
	readonly security: string;
	readonly service: string;
	/** Código de la corporación cuyos puestos se quieren ver, o vacío. */
	readonly corporation: string;
	readonly paint: string;
	readonly territory: string;
}

/**
 * Lo que el mapa sabe del piloto que lo está mirando.
 *
 * **Va aparte del mapa porque no es del mapa: es de quien lo mira.** Dos pilotos
 * abren la misma galaxia y ven cosas distintas —uno puede cruzar una puerta que al
 * otro no le alcanza el tanque— y meter eso en el dato del mapa obligaría a
 * rearmarlo entero por piloto.
 */
export interface PilotoEnElMapa {
	/** El código del sistema donde está parado. */
	readonly system: string;
	/**
	 * A cuántos saltos queda cada sistema, por código.
	 *
	 * Lo que no está **no se puede alcanzar**, que es distinto de estar lejos: una
	 * cifra grande diría que hay camino, y a veces no lo hay.
	 */
	readonly jumps: Readonly<Record<string, number>>;
	/**
	 * Por qué no se puede saltar a cada vecino, o vacío si se puede.
	 *
	 * Sólo tiene entradas para los vecinos del sistema donde está: saltar es de a
	 * una puerta por vez. El motivo sale de `jumpProblem`, la misma función pura que
	 * apaga el botón en la pestaña Ubicación y que usa el servicio para rechazar la
	 * orden, así que el mapa, la pantalla y el servidor dicen exactamente lo mismo.
	 */
	readonly reach: Readonly<Record<string, string>>;
	/**
	 * El salto que está cruzando ahora mismo, o `null`.
	 *
	 * Sólo existe mientras hay un salto en curso: un viaje adentro del sistema no
	 * cruza ninguna línea del mapa y no tendría qué dibujar. Trae cuándo empezó y
	 * cuánto dura para que el mapa pueda mostrar **cuánto lleva recorrido**, que es
	 * lo que convierte una línea resaltada en un viaje.
	 *
	 * Es la base de lo que va a necesitar el autopiloto: un recorrido de varios
	 * saltos es esta misma línea, repetida.
	 */
	readonly route: RutaEnElMapa | null;
}

/** El tramo que el piloto está cruzando, en códigos de sistema. */
export interface RutaEnElMapa {
	readonly from: string;
	readonly to: string;
	/** En milisegundos UTC, para que el navegador lleve la cuenta. */
	readonly startedAt: number;
	readonly durationSeconds: number;
}

/** Un sistema en su casilla de la grilla. */
export interface NodoGalaxia {
	readonly code: string;
	readonly name: string;
	/** La casilla, en coordenadas cúbicas. El dibujo la convierte a píxeles. */
	readonly hex: { readonly x: number; readonly y: number; readonly z: number };
	readonly government: string;
	readonly security: number;
	readonly securityLevel: string;
	/** Código de la facción que lo controla, para pintar, y su nombre para leer. */
	readonly faction: string;
	readonly factionName: string;
	readonly region: string;
	readonly constellation: string;
	/**
	 * El color elegido para su región y su constelación, o vacío.
	 *
	 * **Vacío no es un dato que falte, es «usá el automático»**: el que se genera a
	 * partir del nombre. Viaja desde el servidor y no se resuelve acá porque quien
	 * pinta el mapa no tiene por qué saber cuál de los dos corresponde.
	 */
	readonly regionColor: string;
	readonly constellationColor: string;
	readonly bodies: number;
	readonly stations: number;
	/**
	 * Los servicios que hay en el sistema, juntando todas sus estaciones.
	 *
	 * **Del sistema y no de cada estación**: desde el mapa la pregunta es «¿dónde
	 * refino?», y en cuál de las tres estaciones está la refinería lo contesta la
	 * pestaña Sistema una vez que llegaste.
	 */
	readonly services: readonly string[];
	/**
	 * Las corporaciones con un puesto en el sistema, por código.
	 *
	 * Códigos y no nombres porque es con lo que se filtra; el nombre para leer lo
	 * pone el mapa una sola vez, en su propia lista.
	 */
	readonly corporations: readonly string[];
	/** Cuántas salidas tiene. */
	readonly gates: number;
	/**
	 * Los rumbos con una puerta que no lleva a ninguna parte.
	 *
	 * El contador de arriba de la pantalla dice **cuántas** hay; esto dice
	 * **dónde**, que es lo que hace falta para ir a terminarlas. El mapa las dibuja
	 * como un muñón saliendo del hexágono.
	 */
	readonly looseBearings: readonly string[];
	/** Los rumbos libres: por dónde se puede seguir construyendo. */
	readonly free: readonly string[];
	/**
	 * Si no llega caminando hasta la semilla.
	 *
	 * Un ramal armado aparte tiene casilla pero no tiene lugar: su posición no
	 * significa nada hasta que se lo enganche. El mapa lo dibuja aparte, porque es
	 * exactamente la clase de trabajo a medio hacer que sólo se ve mirando el
	 * conjunto.
	 */
	readonly adrift: boolean;
}

/** Una puerta entre dos sistemas, vista desde el mapa. */
export interface EnlaceGalaxia {
	readonly from: string;
	readonly to: string;
	/** El rumbo por el que sale de `from`. */
	readonly bearing: string;
	/** Distancia de salto en décimas de año luz, ya escrita. */
	readonly distance: string;
	/**
	 * Si el paso está cerrado.
	 *
	 * Distinto de no estar conectada: la puerta existe y lleva adonde llevaba, pero
	 * no se cruza. Sirve para aislar un sistema sin borrarle las salidas ni moverle
	 * la casilla a nadie.
	 */
	readonly closed: boolean;
	/**
	 * Si las dos puntas no son vecinas en la grilla.
	 *
	 * No es un error: es un pasaje que se saltea el camino largo, y se dibuja
	 * torcido justamente para que se vea.
	 */
	readonly shortcut: boolean;
}

/** Un mineral de un cinturón, en el constructor. */
export interface FilaMineral {
	readonly ore: string;
	readonly name: string;
	readonly capacity: number;
	readonly remaining: number;
	readonly regenPerHour: number;
}

/** Una salida del sistema, con su rumbo y adónde va. */
export interface FilaPuerta {
	readonly gateId: number;
	readonly bodyId: number;
	readonly name: string;
	readonly bearing: string;
	readonly bearingLabel: string;
	/** El ángulo en la roseta, para dibujarla. */
	readonly angle: number;
	/** Adónde lleva, o vacío si todavía no lleva a ninguna parte. */
	readonly destination: string;
	readonly destinationSystem: string;
	readonly jumpDistance: number;
	/**
	 * Si el paso está cerrado.
	 *
	 * Distinto de no estar conectada: la puerta existe y lleva adonde llevaba, pero
	 * no se cruza. Cerrar es una decisión; no estar conectada es obra a medio hacer.
	 */
	readonly closed: boolean;
}

/** Un cuerpo en el árbol del constructor. */
export interface FilaConstruccion {
	readonly id: number;
	readonly code: string;
	readonly name: string;
	readonly kind: string;
	readonly kindLabel: string;
	readonly icon: IconName;
	readonly depth: number;
	readonly rails: readonly boolean[];
	readonly isLast: boolean;
	readonly hasChildren: boolean;
	readonly parentId: number | null;
	readonly orbitDistance: number;
	readonly explored: boolean;
	readonly description: string;
	/** Qué tipos de cuerpo pueden colgar de éste. Vacío quiere decir ninguno. */
	readonly accepts: readonly OpcionConstructor[];
	/** Qué lo retiene, si algo lo retiene. Vacío quiere decir que se puede borrar. */
	readonly blockers: readonly string[];
	/** Sólo si es estación. */
	readonly corporation: string;
	readonly services: readonly string[];
	/** Sólo si es cinturón. */
	readonly ores: readonly FilaMineral[];
	/** Sólo si es puerta. */
	readonly gate: FilaPuerta | null;
}

/** Un sistema abierto en el constructor. */
export interface Constructor {
	readonly id: number;
	readonly code: string;
	readonly name: string;
	readonly description: string;
	readonly constellationId: number;
	readonly constellation: string;
	readonly region: string;
	readonly government: string;
	readonly governmentLabel: string;
	readonly security: number;
	readonly securityLevel: string;
	readonly controllingFaction: string;
	readonly controlledBy: string;
	readonly capitalOf: string;
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly bodies: readonly FilaConstruccion[];
	/** Qué se puede plantar en la raíz: hoy, otra estrella. */
	readonly rootKinds: readonly OpcionConstructor[];
	readonly gates: readonly FilaPuerta[];
	/** Los ocho rumbos, diciendo cuál está ocupado. */
	readonly bearings: readonly { value: string; label: string; angle: number; taken: boolean }[];
	/** Las puertas sueltas de toda la galaxia, para poder enlazar. */
	readonly loose: readonly { gateId: number; label: string }[];
	readonly blockers: readonly string[];
	readonly options: OpcionesConstructor;
}

// --- Administración de cuentas ----------------------------------------------

/** Un piloto en el listado del cuartel. */
export interface FilaPiloto {
	readonly id: number;
	readonly callsign: string;
	readonly email: string;
	readonly faction: string;
	readonly profession: string;
	readonly credits: string;
	readonly location: string;
	/** Milisegundos desde la época, en UTC. */
	readonly createdAt: number;
	/** Cuántas sanciones tiene puestas. Cero es lo normal. */
	readonly sanctions: number;
	/** Si ahora mismo no puede entrar, y por qué clase de sanción. */
	readonly blocked: string;
	/** Los roles que lleva, ya con su nombre. */
	readonly roles: readonly string[];
}

/** El listado de pilotos, con lo que hace falta para buscar en él. */
export interface Pilotos {
	readonly rows: readonly FilaPiloto[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
	/** Con qué se está filtrando: el texto buscado y el estado. */
	readonly search: string;
	readonly state: string;
	readonly blocked: number;
}

/** Una sanción en el historial de un piloto. */
export interface FilaSancion {
	readonly id: number;
	readonly kind: string;
	readonly kindLabel: string;
	readonly reason: string;
	readonly issuedBy: string;
	/** Milisegundos desde la época. */
	readonly at: number;
	readonly until: number | null;
	readonly liftedAt: number | null;
	readonly liftedBy: string;
	/** Si pesa ahora mismo. */
	readonly active: boolean;
	/** Si además le cierra la puerta. Un aviso está activo y no bloquea. */
	readonly blocks: boolean;
}

/** Un rol, con si este piloto lo lleva. */
export interface FilaRolPiloto {
	readonly id: number;
	readonly code: string;
	readonly name: string;
	readonly description: string;
	readonly held: boolean;
	/** Quién se lo dio, si lo lleva. */
	readonly grantedBy: string;
}

/** La ficha de un piloto, como la ve quien administra. */
export interface FichaPiloto {
	readonly id: number;
	readonly callsign: string;
	readonly email: string;
	readonly faction: string;
	readonly factionCode: string;
	readonly profession: string;
	readonly credits: string;
	readonly creditsRaw: number;
	readonly location: string;
	readonly locationId: number;
	readonly system: string;
	readonly createdAt: number;
	/** El mensaje de por qué no puede entrar, o vacío. */
	readonly blockedMessage: string;
	readonly sanctions: readonly FilaSancion[];
	readonly roles: readonly FilaRolPiloto[];
	/** Qué impide darlo de baja. Vacío quiere decir que se puede. */
	readonly blockers: readonly string[];
	/** Los cuerpos a los que se lo puede mover, agrupados por sistema. */
	readonly bodies: readonly OpcionConstructor[];
	/** Las clases de sanción que se le pueden poner. */
	readonly sanctionKinds: readonly OpcionConstructor[];
}
