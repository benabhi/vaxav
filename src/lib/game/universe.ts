/**
 * El plano del universo: qué sistemas existen y qué hay en cada uno.
 *
 * Datos puros, sin base de datos, igual que el resto de la capa de reglas. De
 * acá los toma el guión de siembra y los escribe en la base; el día que exista
 * un generador de galaxias, va a producir estas mismas estructuras.
 *
 * **Toda estación es orbital** y cuelga de otro cuerpo —planeta, luna o
 * cinturón—. No hay bases en superficie.
 *
 * Corresponde a docs/systems/UNIVERSE.md.
 */

import type { AgentBlueprint } from './agents';
import { floorDiv } from './math';

/**
 * Qué es un cuerpo. Define qué se puede hacer con él y cómo se dibuja.
 *
 * **La puerta estelar es un cuerpo más**, y no una tabla aparte. Así aparece en
 * el árbol del sistema, tiene distancia orbital y se le puede viajar sin tocar
 * una línea de lo que ya existe: es un lugar del sistema al que hay que llegar
 * antes de poder usarlo, que es exactamente lo que es. A dónde lleva sí es una
 * tabla propia, porque es una relación entre dos cuerpos y no un atributo.
 */
export const BODY_KINDS = ['star', 'planet', 'moon', 'belt', 'station', 'gate'] as const;
export type BodyKind = (typeof BODY_KINDS)[number];

/**
 * Los cuerpos que pueden colgar de otro, y de cuáles.
 *
 * Es la regla que impide armar un sistema imposible desde el constructor: una
 * luna orbitando una estación, o dos estrellas anidadas. Se lee como se dice en
 * voz alta —«de un planeta cuelgan lunas, cinturones y estaciones»— y el
 * constructor la usa para ofrecer sólo lo que entra.
 *
 * La **estrella es la raíz** y por eso no figura como hija de nadie.
 */
export const BODY_CHILDREN: Readonly<Record<BodyKind, readonly BodyKind[]>> = {
	star: ['planet', 'belt', 'station', 'gate'],
	planet: ['moon', 'belt', 'station'],
	moon: ['station'],
	belt: ['station'],
	// Ni una estación ni una puerta tienen nada orbitándolas: son el final de la
	// rama. Una estación colgada de otra sería un muelle, que es otra cosa.
	station: [],
	gate: []
};

/** Si un cuerpo de ese tipo puede colgar de uno de aquél. */
export function canOrbit(child: BodyKind, parent: BodyKind): boolean {
	return BODY_CHILDREN[parent].includes(child);
}

/**
 * De qué está hecho un planeta o una luna.
 *
 * Existe porque **antes vivía adentro de una frase**. El plano decía «gigante
 * gaseoso» y «luna helada» en la descripción, y ahí eso no servía para nada: no
 * se puede consultar, ni filtrar, ni cosechar gas de una cadena de texto. Como
 * campo, la misma palabra es la razón por la que ese cuerpo tiene lo que tiene.
 *
 * Vacío en lo que no es planeta ni luna: una estrella no es de roca y un
 * cinturón no es un cuerpo sino muchos.
 */
export const BODY_CLASSES = ['rocky', 'gas', 'ice', 'ocean', 'volcanic'] as const;
export type BodyClass = (typeof BODY_CLASSES)[number];

/**
 * Qué se respira, si se respira.
 *
 * Es del planeta y no del clima: la temperatura sale de la órbita y de la
 * estrella, y por eso no se guarda. Esto no se deduce de ningún otro número.
 */
export const ATMOSPHERES = ['none', 'thin', 'breathable', 'dense', 'toxic'] as const;
export type Atmosphere = (typeof ATMOSPHERES)[number];

/**
 * La clase espectral de una estrella, de la más caliente a la más fría.
 *
 * Es la secuencia real, y el orden importa: de acá sale **a qué distancia está
 * la zona templada** de cada sistema, así que la misma órbita es templada
 * alrededor de una G y hielo alrededor de una M. Un dato de una letra que le da
 * clima a todo el sistema sin escribir el clima de ningún planeta.
 */
export const STAR_CLASSES = ['O', 'B', 'A', 'F', 'G', 'K', 'M'] as const;
export type StarClass = (typeof STAR_CLASSES)[number];

/** Qué tan crudo es el clima de una órbita, de adentro hacia afuera. */
export const THERMAL_BANDS = ['scorched', 'warm', 'temperate', 'cold', 'frozen'] as const;
export type ThermalBand = (typeof THERMAL_BANDS)[number];

/**
 * A qué distancia de cada clase de estrella está la zona templada.
 *
 * Es la única cifra que hace falta para darle clima a un sistema entero: todo lo
 * demás se mide **en proporción a ésta**. Una M es tan fría que su zona templada
 * está casi encima; una O quema a distancias donde una G ya es hielo.
 *
 * Los números son de balance y se eligieron para que Ánfora —una G— quede como
 * estaba escrita a mano: el I abrasado a 40, el II templado a 95, el III frío a
 * 210 y el IV helado a 380.
 */
const TEMPERATE_DISTANCE: Readonly<Record<StarClass, number>> = {
	O: 600,
	B: 400,
	A: 240,
	F: 150,
	G: 95,
	K: 55,
	M: 25
};

/**
 * En qué banda cae una órbita, dada la estrella que la calienta.
 *
 * `starDistance` es la distancia **a la estrella**, no al cuerpo que se orbita:
 * una luna está a seis unidades de su planeta y a doscientas de la estrella, y
 * la que manda en el clima es la segunda.
 *
 * Sin coma flotante, como todo el balance: se compara en décimos.
 */
export function thermalBand(starClass: StarClass | '', starDistance: number): ThermalBand | '' {
	if (starClass === '' || starDistance <= 0) return '';
	const decimos = floorDiv(starDistance * 10, TEMPERATE_DISTANCE[starClass]);
	if (decimos < 5) return 'scorched';
	if (decimos < 8) return 'warm';
	if (decimos < 15) return 'temperate';
	if (decimos < 30) return 'cold';
	return 'frozen';
}

/**
 * Los servicios que puede ofrecer una estación.
 *
 * Que una tenga refinería y no astillero es **dato**, no esquema: por eso en la
 * base son filas y no columnas.
 */
export const STATION_SERVICES = [
	'shipyard',
	'outfitting',
	'refinery',
	'workshop',
	'market',
	'contacts',
	'missions',
	'storage'
] as const;
export type StationServiceKind = (typeof STATION_SERVICES)[number];

/**
 * La ficha de un módulo de estación.
 *
 * Un servicio no es sólo un rótulo: la pantalla de ubicación lo muestra como una
 * baldosa con su nombre y qué se hace ahí. El nombre vive acá y no en la capa de
 * presentación por la misma razón que el de una facción o una profesión: es
 * contenido del juego.
 */
export interface ServiceSpec {
	readonly name: string;
	readonly summary: string;
}

/**
 * Los ocho módulos que puede tener una estación, con su ficha completa.
 *
 * El día que los jugadores instalen los suyos, conviene que cada uno ya sepa
 * decir qué es y qué ofrece. El orden es el que dibuja el mosaico.
 */
export const SERVICES: Readonly<Record<StationServiceKind, ServiceSpec>> = {
	shipyard: {
		name: 'Astillero',
		summary: 'Comprar naves y dejarlas en hangar.'
	},
	outfitting: {
		name: 'Equipamiento',
		summary: 'Montar y desmontar los módulos de la nave.'
	},
	storage: {
		name: 'Bodega',
		summary: 'Dejar carga guardada en tierra firme.'
	},
	market: {
		name: 'Mercado',
		summary: 'Órdenes de compra y venta de la estación.'
	},
	refinery: {
		name: 'Refinería',
		summary: 'Convertir el mineral en material aprovechable.'
	},
	workshop: {
		name: 'Taller',
		summary: 'Fabricar módulos y componentes.'
	},
	// Los agentes ya están en la base y se ven en la estación; lo que falta son
	// las misiones.
	contacts: {
		name: 'Contactos',
		summary: 'Los agentes que reparten trabajo en la estación.'
	},
	missions: {
		name: 'Tablón',
		summary: 'Trabajos abiertos a cualquiera que pase.'
	}
};

/** El orden en que se muestran los módulos de una estación. */
export const SERVICE_ORDER: readonly StationServiceKind[] = [
	'shipyard',
	'outfitting',
	'storage',
	'market',
	'refinery',
	'workshop',
	'contacts',
	'missions'
];

/** La ficha de un módulo de estación. */
export function serviceSpec(service: StationServiceKind): ServiceSpec {
	return SERVICES[service];
}

/**
 * Cómo se gobierna un sistema.
 *
 * Seis para empezar, tomados de Elite: cubren todo el arco de seguridad y cada
 * uno se distingue del resto de un vistazo. Los once del juego incluyen varios
 * que hoy serían el mismo gobierno con otro nombre.
 */
export const GOVERNMENTS = [
	'anarchy',
	'feudal',
	'prison',
	'dictatorship',
	'democracy',
	'corporate'
] as const;
export type Government = (typeof GOVERNMENTS)[number];

/**
 * Cuánta protección hay, **como número de 0 a 100**.
 *
 * Es un número y no cuatro cajones porque la doc del proyecto ya lo había
 * prometido: «la seguridad es un gradiente, no un interruptor». Con cuatro
 * niveles, cincuenta sistemas se parten en cuatro montones indistinguibles; con
 * un número, dos sistemas corporativos pueden no ser el mismo lugar.
 *
 * Entero, como todo número del juego: 70, no 0,7.
 */
export const SECURITY_MIN = 0;
export const SECURITY_MAX = 100;

/** Los cuatro cajones en que se **lee** un número de seguridad. */
export const SECURITY_LEVELS = ['lawless', 'low', 'medium', 'high'] as const;
export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

/** Desde qué número empieza cada cajón, del más alto al más bajo. */
const LEVEL_FLOORS: readonly (readonly [number, SecurityLevel])[] = [
	[65, 'high'],
	[35, 'medium'],
	[1, 'low'],
	[SECURITY_MIN, 'lawless']
];

/**
 * En qué cajón cae un número.
 *
 * Los cajones son para **leer**, no para calcular: una columna que dice «Media»
 * se recorre de un vistazo y una que dice `47` no. Las mecánicas usan el número.
 *
 * Las bandas de los gobiernos cruzan los cajones a propósito —una colonia penal
 * puede quedar baja o media— y eso es justamente lo que hace que valga la pena
 * guardar el número.
 */
export function securityLevel(security: number): SecurityLevel {
	for (const [desde, level] of LEVEL_FLOORS) if (security >= desde) return level;
	return 'lawless';
}

/**
 * Qué tan riesgoso es estar en un lugar **a cielo abierto**.
 *
 * Es otra pregunta que la seguridad del sistema, y por eso es otra función: la
 * seguridad describe al sistema entero y esto describe un punto adentro. Un
 * cinturón en el borde de un sistema vigilado no está tan cuidado como la
 * estación del mismo sistema, y el piloto merece saberlo **antes** de encargar
 * una orden de varias horas.
 *
 * Adentro de una estación no corresponde: atracado no te ataca nadie. Por eso
 * quien lo consulta pregunta primero si está en una.
 */
export const THREAT_LEVELS = ['calm', 'watched', 'exposed', 'hostile'] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

/**
 * Cruza la seguridad del sistema con lo lejos que esté del centro.
 *
 * Ninguna de las dos alcanza sola: un cinturón interior de un sistema sin ley es
 * peligroso, y uno en el borde de uno vigilado también.
 */
export function threatLevel(security: number, atEdge: boolean): ThreatLevel {
	switch (securityLevel(security)) {
		case 'lawless':
			return 'hostile';
		case 'low':
			return atEdge ? 'hostile' : 'exposed';
		case 'medium':
			return atEdge ? 'exposed' : 'watched';
		case 'high':
			return atEdge ? 'watched' : 'calm';
	}
}

/** Entre qué números puede moverse la seguridad de un sistema. */
export interface SecurityBand {
	readonly min: number;
	readonly max: number;
}

/**
 * Qué seguridad admite cada gobierno.
 *
 * El gobierno **no fija** la seguridad: fija hasta dónde puede llegar. Es lo que
 * deja que el gobierno signifique algo por sí mismo en vez de ser otro nombre
 * para el mismo número, y lo que sigue impidiendo la contradicción que preocupaba
 * desde el principio: una anarquía no puede tener seguridad alta porque su banda
 * no llega hasta ahí.
 *
 * **La colonia penal y la dictadura dejan de ser lo mismo.** Una colonia penal
 * está *vigilada*, no *protegida*: mucho ojo encima y poca ayuda si pasa algo.
 * Ése es el matiz que se perdía al mapear las dos a «media».
 */
export const SECURITY_BANDS: Readonly<Record<Government, SecurityBand>> = {
	anarchy: { min: 0, max: 0 },
	feudal: { min: 10, max: 35 },
	prison: { min: 25, max: 50 },
	dictatorship: { min: 30, max: 60 },
	democracy: { min: 55, max: 85 },
	corporate: { min: 60, max: 100 }
};

/**
 * El techo del espacio sin dueño.
 *
 * Una facción controladora no es un rótulo: es **quién paga las patrullas**. Sin
 * ella no hay a quién reclamarle, por muy corporativo que sea el gobierno local,
 * así que la seguridad no pasa de acá. Es lo que le da por fin una consecuencia
 * mecánica a `controllingFaction`, y la forma imperio contra espacio libre que el
 * proyecto ya había elegido.
 */
export const FREE_SPACE_CEILING = 50;

/**
 * La banda real de un sistema: la de su gobierno, con el techo del espacio libre.
 *
 * En espacio libre **el piso del gobierno no aplica, sólo el techo**. El piso es
 * una garantía —«acá se responde al menos hasta tanto»— y garantizarlo es lo que
 * hace una facción; sin ella no hay quien lo sostenga, por corporativo que sea el
 * gobierno local. Así un sistema sin dueño puede ser cualquier cosa entre la nada
 * y el techo, que es lo que uno espera de una frontera.
 */
export function securityBand(government: Government, controlled: boolean): SecurityBand {
	const banda = SECURITY_BANDS[government];
	if (controlled) return banda;

	return { min: SECURITY_MIN, max: Math.min(banda.max, FREE_SPACE_CEILING) };
}

/**
 * Qué problema tiene esa seguridad, o `null` si no tiene ninguno.
 *
 * Devuelve la frase lista para mostrar, como el resto de las validaciones del
 * proyecto: quien la llama no tiene que saber redactar el motivo.
 */
export function securityProblem(
	security: number,
	government: Government,
	controlled: boolean
): string | null {
	if (!Number.isInteger(security)) return 'La seguridad es un número entero.';

	const { min, max } = securityBand(government, controlled);
	if (security < min || security > max) {
		return controlled
			? 'Con ese gobierno, la seguridad va de ' + min + ' a ' + max + '.'
			: 'Sin una facción que lo controle, la seguridad va de ' +
					min +
					' a ' +
					max +
					': no hay quien pague las patrullas.';
	}

	return null;
}

/**
 * La seguridad que se propone por omisión.
 *
 * El medio de la banda: ni el sistema más protegido de su clase ni el peor, que
 * es lo que uno quiere cuando todavía no pensó el número. El constructor lo
 * ofrece y quien lo usa lo mueve.
 */
export function suggestedSecurity(government: Government, controlled: boolean): number {
	const { min, max } = securityBand(government, controlled);
	return Math.floor((min + max) / 2);
}

/**
 * Lo que hace estación a un cuerpo: quién la opera, qué ofrece y quién para.
 *
 * Los agentes cuelgan de la estación y no de la corporación porque lo que
 * importa es **dónde están sentados**: un piloto los encuentra caminando por la
 * estación, no consultando un directorio.
 */
export interface StationBlueprint {
	/** Código de la corporación que la opera. */
	readonly corporation: string;
	readonly services: readonly StationServiceKind[];
	/**
	 * Los agentes que atienden acá. Requieren el módulo de Contactos: sin él no
	 * hay dónde recibir a nadie.
	 */
	readonly agents: readonly AgentBlueprint[];
}

/**
 * Un cuerpo y lo que lo orbita.
 *
 * Los hijos se anidan, así que el archivo se lee como el sistema se ve.
 */
export interface BodyBlueprint {
	readonly code: string;
	readonly name: string;
	readonly kind: BodyKind;
	readonly orbitDistance: number;
	/**
	 * De qué está hecho, si es planeta o luna. Vacío en todo lo demás.
	 *
	 * Junto con la atmósfera y la clase de la estrella es **todo lo que hace
	 * falta para describirlo**: la descripción se deriva de acá y no se escribe.
	 * Ver `describeBody`.
	 */
	readonly bodyClass: BodyClass | '';
	/** Qué se respira, si es planeta o luna. Vacío en todo lo demás. */
	readonly atmosphere: Atmosphere | '';
	/** La clase espectral, si es una estrella. Vacío en todo lo demás. */
	readonly starClass: StarClass | '';
	readonly station: StationBlueprint | null;
	readonly children: readonly BodyBlueprint[];
	/**
	 * Si está en las cartas. El plano describe lo que se conoce, así que lo
	 * normal es que sí; lo que haya que salir a encontrar se marca a mano.
	 *
	 * Es el estado del **mundo**, no el de un piloto: que cada uno lleve su
	 * propio registro de qué descubrió llega con la cartografía, en F13.
	 */
	readonly explored: boolean;
	/**
	 * Qué minerales tiene y en qué cantidad, si es un cinturón.
	 *
	 * Es **contenido**: qué se saca de dónde es la decisión que hace que un
	 * cinturón valga el viaje o no. Los Anillos tienen lo común en cantidad; el
	 * Cinturón Exterior tiene lo que el otro no tiene, poco y de recuperación
	 * lenta, y ésa es toda la razón para irse tan lejos.
	 */
	readonly deposits: readonly DepositBlueprint[];
}

/** Un mineral de un cinturón: cuánto aguanta y a qué ritmo se rehace. */
export interface DepositBlueprint {
	readonly ore: string;
	/** El tope al que se recupera. */
	readonly capacity: number;
	/** Unidades que se rehacen por hora. */
	readonly regenPerHour: number;
}

/** Una estación sin agentes es normal: la Planta Escarcha no tiene Contactos. */
type StationSpec = Omit<StationBlueprint, 'agents'> & {
	readonly agents?: readonly AgentBlueprint[];
};

/** Lo que hay que declarar de un cuerpo; el resto toma su valor habitual. */
type BodySpec = Partial<Omit<BodyBlueprint, 'station'>> &
	Pick<BodyBlueprint, 'code' | 'name' | 'kind'> & { readonly station?: StationSpec | null };

/**
 * Declara un cuerpo completando lo que no se dice.
 *
 * El plano se escribe con lo que cada cuerpo tiene, no con una plantilla llena
 * de ceros; el resto de la aplicación recibe siempre todos los campos.
 */
function defineBody(spec: BodySpec): BodyBlueprint {
	const { station, ...rest } = spec;
	return {
		orbitDistance: 0,
		bodyClass: '',
		atmosphere: '',
		starClass: '',
		children: [],
		explored: true,
		deposits: [],
		...rest,
		station: station ? { agents: [], ...station } : null
	};
}

/**
 * Un sistema con su estrella a la cabeza.
 *
 * `controllingFaction` puede estar vacío, y ahí está lo importante: como en EVE,
 * las tres potencias controlan un puñado de sistemas y **todo el resto es
 * espacio libre**, para que lo reclamen las corporaciones de jugadores.
 */
export interface SystemBlueprint {
	readonly code: string;
	readonly name: string;
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly government: Government;
	/** De 0 a 100, dentro de la banda que le deja el gobierno. */
	readonly security: number;
	readonly root: BodyBlueprint;
	readonly controllingFaction: string;
	/**
	 * La facción de la que éste es el sistema **principal**, o vacío.
	 *
	 * Es un campo aparte de `controllingFaction` y no un booleano porque la
	 * pregunta que se le hace no es «¿es capital?» sino «¿de quién?». Con un
	 * booleano habría que cruzarlo siempre con la otra columna para contestar,
	 * y una capital de una facción que no controla el sistema sería un estado
	 * imposible que nada impediría escribir.
	 */
	readonly capitalOf: string;
}

export interface ConstellationBlueprint {
	readonly code: string;
	readonly name: string;
	readonly systems: readonly SystemBlueprint[];
}

export interface RegionBlueprint {
	readonly code: string;
	readonly name: string;
	readonly constellations: readonly ConstellationBlueprint[];
}

export interface GalaxyBlueprint {
	readonly code: string;
	readonly name: string;
	readonly regions: readonly RegionBlueprint[];
}

/**
 * Las corporaciones que la siembra carga, que son todas las del catálogo.
 *
 * Se reexporta desde acá porque quien siembra pide **el plano del mundo** y no
 * tiene por qué saber en qué archivo vive cada catálogo. El día que la siembra
 * cargue sólo algunas, el recorte se hace acá y nadie más se entera.
 */
export { CORPORATIONS, type CorporationBlueprint, type CorporationKind } from './corporations';

/** El único sistema que existe hoy. Todo lo demás cuelga de él. */
const ANFORA: SystemBlueprint = {
	code: 'anfora',
	name: 'Ánfora',
	x: 0,
	y: 0,
	z: 0,
	government: 'corporate',
	// Alta, pero no lo más alto que da el gobierno corporativo: es un sistema de
	// frontera administrado como concesión, no el corazón del Dominio.
	security: 78,
	controllingFaction: 'dominion',
	capitalOf: '',
	root: defineBody({
		code: 'anfora_estrella',
		name: 'Ánfora',
		kind: 'star',
		starClass: 'G',
		children: [
			defineBody({
				code: 'anfora_i',
				name: 'Ánfora I',
				kind: 'planet',
				orbitDistance: 40,
				bodyClass: 'rocky',
				atmosphere: 'none'
			}),
			defineBody({
				code: 'anfora_ii',
				name: 'Ánfora II',
				kind: 'planet',
				orbitDistance: 95,
				bodyClass: 'rocky',
				atmosphere: 'thin',
				children: [
					defineBody({
						code: 'puerto_anfora',
						name: 'Puerto Ánfora',
						kind: 'station',
						orbitDistance: 3,
						station: {
							corporation: 'casa_verlan',
							services: [
								'shipyard',
								'outfitting',
								'refinery',
								'market',
								'contacts',
								'missions',
								'storage'
							],
							agents: [
								{
									code: 'verlan_aduana',
									name: 'Sela Verlan',
									corporation: 'casa_verlan',
									level: 1,
									missionKind: 'courier',
									description:
										'Sobrina del titular y la que firma los despachos menores. Por ' +
										'su ventanilla empieza todo el mundo.'
								},
								{
									code: 'anillo_enlace_anfora',
									name: 'Idra Nolm',
									corporation: 'extractora_anillo',
									level: 2,
									missionKind: 'mining',
									description:
										'Enlace de la Extractora en el puerto. Compra mineral y manda a ' +
										'buscar lo que falta, sin pisar los anillos.'
								},
								{
									code: 'verlan_contratos',
									name: 'Oren Casteig',
									corporation: 'casa_verlan',
									level: 3,
									missionKind: 'trade',
									description:
										'Lleva los contratos que no se publican en el tablón. No recibe ' +
										'a cualquiera.'
								},
								{
									code: 'vigilia_patrullas',
									name: 'Renna Bosc',
									corporation: 'vigilia_anfora',
									level: 4,
									missionKind: 'combat',
									description:
										'Capitana de la Vigilia. Subcontrata lo que sus patrullas no ' +
										'llegan a cubrir, que es casi todo el borde del sistema.'
								}
							]
						}
					})
				]
			}),
			defineBody({
				code: 'anfora_iii',
				name: 'Ánfora III',
				kind: 'planet',
				orbitDistance: 210,
				bodyClass: 'gas',
				atmosphere: 'dense',
				children: [
					defineBody({
						code: 'anillos_anfora_iii',
						name: 'Anillos de Ánfora III',
						kind: 'belt',
						orbitDistance: 2,
						// Lo común, en cantidad y de recuperación rápida: acá nadie se queda
						// sin trabajo, y por eso es donde se empieza.
						deposits: [
							{ ore: 'ferrous_silicate', capacity: 60_000, regenPerHour: 3_000 },
							{ ore: 'carbon_chondrite', capacity: 40_000, regenPerHour: 2_000 }
						]
					}),
					defineBody({
						code: 'muelle_de_los_anillos',
						name: 'Muelle de los Anillos',
						kind: 'station',
						orbitDistance: 4,
						station: {
							corporation: 'extractora_anillo',
							services: ['outfitting', 'refinery', 'market', 'contacts', 'storage'],
							agents: [
								{
									code: 'anillo_capataz',
									name: 'Tova Reik',
									corporation: 'extractora_anillo',
									level: 1,
									missionKind: 'mining',
									description:
										'Capataz de turno. Reparte las cuotas que la cooperativa no ' +
										'llega a cubrir con su propia gente.'
								},
								{
									code: 'anillo_logistica',
									name: 'Pell Auren',
									corporation: 'extractora_anillo',
									level: 2,
									missionKind: 'courier',
									description:
										'Mueve el mineral del muelle al puerto. Nunca tiene bodegas ' + 'suficientes.'
								}
							]
						}
					}),
					defineBody({
						code: 'anfora_iii_a',
						name: 'Ánfora III-a',
						kind: 'moon',
						orbitDistance: 6,
						bodyClass: 'ice',
						atmosphere: 'none',
						children: [
							defineBody({
								code: 'planta_escarcha',
								name: 'Planta Escarcha',
								kind: 'station',
								orbitDistance: 1,
								station: {
									corporation: 'hidros_escarcha',
									services: ['refinery', 'storage']
								}
							})
						]
					})
				]
			}),
			defineBody({
				code: 'anfora_iv',
				name: 'Ánfora IV',
				kind: 'planet',
				orbitDistance: 380,
				bodyClass: 'rocky',
				atmosphere: 'none',
				children: [
					defineBody({
						code: 'amarre_franco',
						name: 'Amarre Franco',
						kind: 'station',
						orbitDistance: 2,
						station: {
							corporation: 'libre_amarre',
							services: ['outfitting', 'market', 'contacts', 'storage'],
							agents: [
								{
									code: 'franco_despacho',
									name: 'Bram Ossuk',
									corporation: 'libre_amarre',
									level: 2,
									missionKind: 'courier',
									description:
										'Despacha carga sin preguntar de quién es. Atiende a ' +
										'cualquiera, que es exactamente el negocio.'
								},
								{
									code: 'franco_rutas',
									name: 'La Chueca',
									corporation: 'libre_amarre',
									level: 4,
									missionKind: 'trade',
									description:
										'Nadie sabe su nombre y nadie lo pregunta. Conoce rutas que no ' +
										'están en ninguna carta.'
								}
							]
						}
					})
				]
			}),
			defineBody({
				code: 'cinturon_exterior',
				name: 'Cinturón Exterior',
				kind: 'belt',
				orbitDistance: 520,
				// Lo que el otro cinturón no tiene, y poco: la recuperación lenta es lo
				// que hace que valga la pena competir por él en vez de acampar.
				deposits: [
					{ ore: 'pyroxene', capacity: 9_000, regenPerHour: 260 },
					{ ore: 'iridium_vein', capacity: 2_400, regenPerHour: 60 }
				],
				children: [
					defineBody({
						code: 'habitat_talo',
						name: 'Hábitat Talo',
						kind: 'station',
						orbitDistance: 1,
						station: {
							corporation: 'comuna_talo',
							services: ['outfitting', 'refinery', 'workshop', 'market', 'contacts', 'storage'],
							agents: [
								{
									code: 'talo_asamblea',
									name: 'Mira Ossen',
									corporation: 'comuna_talo',
									level: 1,
									missionKind: 'mining',
									description:
										'Vocera de la asamblea esta temporada. Lo que reparte lo ' +
										'votaron entre todos la noche anterior.'
								},
								{
									code: 'talo_prospeccion',
									name: 'Yuli Trant',
									corporation: 'comuna_talo',
									level: 3,
									missionKind: 'exploration',
									description:
										'Busca dónde excavar el próximo hábitat. Manda gente lejos y no ' +
										'siempre vuelve toda.'
								}
							]
						}
					})
				]
			})
		]
	})
};

/** El plano completo: de acá lo toma la siembra y lo escribe en la base. */
export const GALAXY: GalaxyBlueprint = {
	code: 'vaxav',
	name: 'Vaxav',
	regions: [
		{
			code: 'deriva_exterior',
			name: 'Deriva Exterior',
			constellations: [{ code: 'cadena_de_anfora', name: 'Cadena de Ánfora', systems: [ANFORA] }]
		}
	]
};

/** Recorre un cuerpo y todo lo que cuelga de él, de arriba hacia abajo. */
export function* walk(body: BodyBlueprint): Generator<BodyBlueprint> {
	yield body;
	for (const child of body.children) yield* walk(child);
}

/** Todos los sistemas del plano, sin importar dónde estén. */
export function allSystems(): readonly SystemBlueprint[] {
	return GALAXY.regions.flatMap((region) =>
		region.constellations.flatMap((constellation) => constellation.systems)
	);
}

/** Todos los cuerpos del plano. */
export function allBodies(): readonly BodyBlueprint[] {
	return allSystems().flatMap((system) => [...walk(system.root)]);
}

/** Todos los agentes del plano, sin importar dónde estén sentados. */
export function allAgents(): readonly AgentBlueprint[] {
	return allBodies().flatMap((body) => body.station?.agents ?? []);
}

/**
 * ¿Es espacio libre, o lo controla una facción?
 *
 * El espacio de las facciones no se reclama; todo el resto sí, cuando exista la
 * mecánica.
 */
export function isClaimable(system: SystemBlueprint): boolean {
	return !system.controllingFaction;
}

/** Busca un cuerpo por código en todo el plano. */
export function findBody(code: string): BodyBlueprint | null {
	return allBodies().find((body) => body.code === code) ?? null;
}

// --- Las puertas y la roseta ------------------------------------------------

/**
 * Por qué lado del sistema sale una puerta.
 *
 * Existe para el **mapa de la galaxia**, que va a dibujarse como en X4: cada
 * sistema es una casilla y sus salidas apuntan hacia afuera. Sin un rumbo, dos
 * puertas del mismo sistema no tienen dónde ponerse y el mapa se arma solo, mal;
 * con un rumbo, cada sistema tiene ocho lugares donde colgar una salida y el
 * dibujo sale del dato en vez de adivinarse.
 *
 * **Seis y no ocho, ni grados.** Seis porque la galaxia se dibuja como una
 * grilla de hexágonos, y un hexágono tiene seis vecinos: con ocho rumbos había
 * dos —este y oeste— que no tenían casilla adonde llevar. Y rumbos y no grados
 * porque lo que hace falta es que no se pisen: dos puertas a 12° y 13° son un
 * choque, dos en `n` y `ne` no lo son nunca. La base lo garantiza con un índice
 * único por sistema y rumbo.
 *
 * El hexágono es de **tapa plana**, así que los vecinos están arriba, abajo y en
 * las cuatro diagonales. Por eso sobreviven el norte y el sur y se van el este y
 * el oeste: en esta grilla, a los costados no hay nadie.
 *
 * El orden es el de las agujas del reloj arrancando del norte, y eso no es
 * cosmético: `oppositeBearing` cuenta media vuelta sobre esta lista y
 * `bearingAngle` reparte los 360° entre sus elementos. Reordenarla los rompe a
 * los dos en silencio.
 *
 * Va en la puerta y no en el sistema porque es de la puerta: describe **esta
 * salida**, no el lugar.
 */
export const GATE_BEARINGS = ['n', 'ne', 'se', 's', 'sw', 'nw'] as const;
export type GateBearing = (typeof GATE_BEARINGS)[number];

/**
 * El rumbo de enfrente.
 *
 * Sirve para proponer el de la puerta gemela: lo normal es que si de Ánfora se
 * sale al norte, desde el otro lado se vuelva por el sur. Es una **sugerencia**
 * —el constructor la ofrece y se puede pisar—, porque una galaxia donde todo
 * cierra en espejo es una grilla, y un mapa interesante tiene atajos torcidos.
 */
export function oppositeBearing(bearing: GateBearing): GateBearing {
	const mitad = GATE_BEARINGS.length / 2;
	const posicion = GATE_BEARINGS.indexOf(bearing);
	return GATE_BEARINGS[(posicion + mitad) % GATE_BEARINGS.length];
}

/**
 * El ángulo de un rumbo, en grados, con el norte arriba y girando como el reloj.
 *
 * Lo usa el dibujo: la roseta reparte los seis rumbos cada 60°, así que la
 * posición de una salida en el borde de una casilla sale de una multiplicación y
 * no de una tabla de coordenadas que haya que mantener.
 */
export function bearingAngle(bearing: GateBearing): number {
	return GATE_BEARINGS.indexOf(bearing) * (360 / GATE_BEARINGS.length);
}

/** Los rumbos que todavía tiene libres un sistema. */
export function freeBearings(taken: readonly GateBearing[]): readonly GateBearing[] {
	return GATE_BEARINGS.filter((bearing) => !taken.includes(bearing));
}

// --- Cómo se llaman las cosas -----------------------------------------------
//
// La nomenclatura es la de EVE y **el nombre de un cuerpo dice dónde está**: con
// nombres propios sueltos hay que aprenderse el mapa de memoria; con esta
// convención, leer un nombre es leer una dirección. Ver docs/systems/UNIVERSE.md.
//
// Todo lo de acá abajo **propone**, no impone. El constructor ofrece el nombre
// que sigue y quien lo usa lo pisa cuando quiere: un cinturón con nombre propio
// —«Cinturón Exterior»— dice más que «Cinturón de Ánfora V».

/** Los símbolos romanos, de mayor a menor, para armar cualquier número. */
const ROMAN: readonly (readonly [number, string])[] = [
	[1000, 'M'],
	[900, 'CM'],
	[500, 'D'],
	[400, 'CD'],
	[100, 'C'],
	[90, 'XC'],
	[50, 'L'],
	[40, 'XL'],
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I']
];

/**
 * El número romano de una posición, contando desde 1.
 *
 * Los planetas se numeran **desde la estrella hacia afuera**, así que el número
 * no es un rótulo sino la posición: «Ánfora IV» está más lejos que «Ánfora II»
 * sin tener que consultar nada.
 */
export function romanNumeral(position: number): string {
	let resto = Math.max(1, Math.trunc(position));
	let salida = '';

	for (const [valor, simbolo] of ROMAN) {
		while (resto >= valor) {
			salida += simbolo;
			resto -= valor;
		}
	}

	return salida;
}

/**
 * La letra de una luna, contando desde 1: `a`, `b`, … `z`, `aa`.
 *
 * Sigue después de la z en vez de cortarse: un gigante gaseoso con veintisiete
 * lunas es raro, pero que el generador se quede sin nombres es peor que un
 * nombre feo.
 */
export function moonLetter(position: number): string {
	let resto = Math.max(1, Math.trunc(position));
	let salida = '';

	while (resto > 0) {
		resto--;
		salida = String.fromCharCode(97 + (resto % 26)) + salida;
		resto = Math.floor(resto / 26);
	}

	return salida;
}

/**
 * El código de un nombre: minúsculas, sin acentos y con guiones bajos.
 *
 * Los códigos no se escriben a mano. `body.code` es **único en toda la galaxia**
 * —no por sistema—, así que copiar un sistema sin renombrar cada cuerpo es la
 * clase de error que revienta recién al sembrar. Derivarlo del nombre, con el
 * sistema por delante, lo vuelve imposible de olvidar.
 */
export function codeFrom(name: string): string {
	return (
		name
			.normalize('NFD')
			// Los diacríticos quedan como caracteres sueltos después de normalizar.
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '')
	);
}

/** El código de un cuerpo, con el del sistema por delante para que no choque. */
export function bodyCodeFrom(systemCode: string, name: string): string {
	const propio = codeFrom(name);
	// Si el nombre ya arranca con el del sistema —«Ánfora III»— no se repite.
	return propio.startsWith(systemCode + '_') || propio === systemCode
		? propio
		: systemCode + '_' + propio;
}

/** Qué hace falta saber para proponer el nombre de un cuerpo nuevo. */
export interface NameContext {
	/** Cómo se llama el sistema: `Ánfora`. */
	readonly systemName: string;
	/** Cómo se llama el cuerpo del que va a colgar, si cuelga de alguno. */
	readonly parentName?: string;
	/**
	 * Cuántos hermanos de su mismo tipo ya tiene el padre.
	 *
	 * Se cuenta **por tipo y no en total**: las lunas se nombran entre lunas y los
	 * planetas entre planetas, así que un planeta con un cinturón y dos lunas
	 * sigue proponiendo `-c` para la tercera luna.
	 */
	readonly siblings: number;
	/** Adónde lleva, si es una puerta. */
	readonly destinationName?: string;
	/**
	 * Por qué lado sale, si es una puerta que todavía no lleva a ningún lado.
	 *
	 * Una puerta se planta antes de saber qué hay del otro lado, así que nombrarla
	 * por su destino no siempre es posible. Por el rumbo sí, siempre: «Puerta
	 * Norte» dice dónde está aunque no diga adónde va, y renombrarla cuando se
	 * conecte es un renglón.
	 */
	readonly bearingName?: string;
}

/**
 * El nombre que le toca a un cuerpo nuevo.
 *
 * Las **estaciones llevan nombre propio** y por eso se proponen en blanco: son
 * obra de alguien —una corporación las construyó y las bautizó— y un número las
 * volvería intercambiables, que es justo lo contrario de lo que son.
 */
export function suggestedBodyName(kind: BodyKind, context: NameContext): string {
	const { systemName, parentName, siblings, destinationName, bearingName } = context;
	const posicion = siblings + 1;

	switch (kind) {
		case 'star':
			// La estrella se llama como el sistema. Una segunda —un binario— lleva
			// letra, como en el cielo de verdad: Ánfora A, Ánfora B.
			return siblings === 0 ? systemName : systemName + ' ' + moonLetter(posicion).toUpperCase();

		case 'planet':
			return systemName + ' ' + romanNumeral(posicion);

		case 'moon':
			return parentName ? parentName + '-' + moonLetter(posicion) : '';

		case 'belt':
			// Los anillos de un planeta se nombran por él; un cinturón suelto en la
			// órbita de la estrella es un lugar y suele merecer nombre propio.
			return parentName ? 'Anillos de ' + parentName : '';

		case 'gate':
			if (destinationName) return 'Puerta a ' + destinationName;
			return bearingName ? 'Puerta ' + bearingName : '';

		case 'station':
			return '';
	}
}
