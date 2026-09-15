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
	/**
	 * Qué se puede extraer acá, si es un cinturón.
	 *
	 * Va en Ubicación y no en el árbol del sistema porque **minar es algo que se
	 * hace donde estás parado**: el árbol dice adónde ir, la ubicación dice qué
	 * hacer una vez que llegaste.
	 */
	readonly ores: readonly VetaMineral[];
}

/** Un mineral de este cinturón, con lo que la orden prometería. */
export interface VetaMineral {
	readonly code: string;
	readonly name: string;
	readonly description: string;
	/** Unidades que quedan, y cuánto es eso de su tope. */
	readonly remaining: string;
	readonly share: number;
	/** Lo que una orden traería, ya calculado con tu nave y tu bodega. */
	readonly units: number;
	readonly volume: string;
	readonly value: string;
	readonly duration: string;
	/** Por qué no se puede, o vacío si se puede. */
	readonly blocked: string;
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
export interface Billetera {
	readonly balance: string;
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
	/** Lo más barato que alguien vende, contando a la estación. Nulo si nadie. */
	readonly bestAsk: number | null;
	readonly bestAskLabel: string;
	/** Lo más que alguien paga. */
	readonly bestBid: number | null;
	readonly bestBidLabel: string;
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
	readonly stationCount: number;
	/** Dónde está atracado, o vacío si no lo está. */
	readonly dockedAt: string;
	/** La estación donde puede operar, o nula si no puede. */
	readonly dockedStationId: number | null;
	readonly canTradeHere: boolean;
	/** Por qué no puede operar, escrito para el jugador. */
	readonly whyNot: string;
	readonly balance: string;
	readonly openOrders: number;
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
	/** Hasta dónde alcanza, sólo en las de compra. */
	readonly rangeLabel: string;
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
	readonly sellers: readonly OrdenMercado[];
	readonly buyers: readonly OrdenMercado[];
	readonly history: readonly DiaMercado[];
	readonly inShip: number;
	readonly inStation: number;
}
