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

/** Qué es un cuerpo. Define qué se puede hacer con él y cómo se dibuja. */
export const BODY_KINDS = ['star', 'planet', 'moon', 'belt', 'station'] as const;
export type BodyKind = (typeof BODY_KINDS)[number];

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
 * baldosa con su nombre, qué se hace ahí y en qué fase deja de ser un cartel. El
 * nombre vive acá y no en la capa de presentación por la misma razón que el de
 * una facción o una profesión: es contenido del juego.
 */
export interface ServiceSpec {
	readonly name: string;
	readonly summary: string;
	/**
	 * Fase del roadmap en que el módulo empieza a funcionar de verdad. Se dice en
	 * pantalla: es más honesto que un botón que no hace nada.
	 */
	readonly phase: string;
}

/**
 * Los ocho módulos que puede tener una estación, con su ficha completa.
 *
 * En F15 son los que los jugadores instalan en las suyas, así que conviene que
 * desde hoy cada uno sepa decir qué es y qué ofrece. El orden es el que dibuja
 * el mosaico.
 */
export const SERVICES: Readonly<Record<StationServiceKind, ServiceSpec>> = {
	shipyard: {
		name: 'Astillero',
		summary: 'Comprar naves y dejarlas en hangar.',
		phase: 'F6'
	},
	outfitting: {
		name: 'Equipamiento',
		summary: 'Montar y desmontar los módulos de la nave.',
		phase: 'F6'
	},
	storage: {
		name: 'Bodega',
		summary: 'Dejar carga guardada en tierra firme.',
		phase: 'F8'
	},
	market: {
		name: 'Mercado',
		summary: 'Órdenes de compra y venta de la estación.',
		phase: 'F10'
	},
	refinery: {
		name: 'Refinería',
		summary: 'Convertir el mineral en material aprovechable.',
		phase: 'F11'
	},
	workshop: {
		name: 'Taller',
		summary: 'Fabricar módulos y componentes.',
		phase: 'F11'
	},
	// Los agentes ya están en la base y se ven en la estación; lo que falta son
	// las misiones, que en el roadmap todavía no tienen fase asignada.
	contacts: {
		name: 'Contactos',
		summary: 'Los agentes que reparten trabajo en la estación.',
		phase: 'Sin fecha'
	},
	missions: {
		name: 'Tablón',
		summary: 'Trabajos abiertos a cualquiera que pase.',
		phase: 'Sin fecha'
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

/** Cuánta protección hay. Sale del gobierno; no se guarda aparte. */
export const SECURITY_LEVELS = ['lawless', 'low', 'medium', 'high'] as const;
export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

/**
 * De qué gobierno sale cada nivel de seguridad.
 *
 * Es la tabla que después va a decidir qué defensas tiene un sistema y qué NPC
 * aparecen: cerca de lo corporativo, patrullas y comerciantes; cerca de la
 * anarquía, piratas.
 */
const SECURITY_BY_GOVERNMENT: Readonly<Record<Government, SecurityLevel>> = {
	anarchy: 'lawless',
	feudal: 'low',
	prison: 'medium',
	dictatorship: 'medium',
	democracy: 'high',
	corporate: 'high'
};

/**
 * La seguridad de un sistema, a partir de cómo se gobierna.
 *
 * Se calcula y no se guarda: con las dos cosas en la base, tarde o temprano se
 * contradicen, y "anarquía con seguridad alta" es el error que nadie nota hasta
 * que un jugador lo explota.
 */
export function securityFor(government: Government): SecurityLevel {
	return SECURITY_BY_GOVERNMENT[government];
}

/** A qué se dedica una corporación. */
export const CORPORATION_KINDS = [
	'mining',
	'industry',
	'trade',
	'exploration',
	'security',
	'logistics'
] as const;
export type CorporationKind = (typeof CORPORATION_KINDS)[number];

/**
 * Una corporación del mundo.
 *
 * Las estaciones pertenecen a corporaciones, y **las corporaciones responden a
 * una facción o a ninguna**. La facción de una estación se deriva de ahí, así
 * que no se guarda dos veces y no puede contradecirse.
 */
export interface CorporationBlueprint {
	readonly code: string;
	readonly name: string;
	readonly kind: CorporationKind;
	/** Código de facción, o vacío si no responde a ninguna. */
	readonly faction: string;
	readonly description: string;
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
	readonly description: string;
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
		description: '',
		children: [],
		explored: true,
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
	readonly description: string;
	readonly government: Government;
	readonly root: BodyBlueprint;
	readonly controllingFaction: string;
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
 * Las corporaciones del mundo.
 *
 * Una por estación, para empezar. Van a ser muchísimas: cada rubro del juego
 * va a tener las suyas, y las de los jugadores viven en la misma tabla.
 */
export const CORPORATIONS: readonly CorporationBlueprint[] = [
	{
		code: 'casa_verlan',
		name: 'Casa Verlan',
		kind: 'trade',
		faction: 'dominion',
		description:
			'Casa comercial con carta del Dominio. Administra Puerto Ánfora ' +
			'desde hace tres generaciones y lo trata como propiedad ' +
			'familiar, que en los papeles casi lo es.'
	},
	{
		code: 'extractora_anillo',
		name: 'Extractora Anillo',
		kind: 'mining',
		faction: 'concord',
		description:
			'Cooperativa de mineros que creció hasta volverse empresa. ' +
			'Sigue votando sus decisiones en asamblea, aunque ahora la ' +
			'asamblea sean cuatro mil personas.'
	},
	{
		code: 'hidros_escarcha',
		name: 'Hidros Escarcha',
		kind: 'industry',
		faction: 'concord',
		description:
			'Saca agua y combustible del hielo de la luna. Trabajo ' +
			'monótono, turnos largos y una clientela que no puede ir a otro ' +
			'lado.'
	},
	{
		code: 'comuna_talo',
		name: 'Comuna Talo',
		kind: 'mining',
		faction: 'pact',
		description:
			'Nació como el hábitat que excavó el asteroide y nunca dejó de ' +
			'ser eso: la gente que vive ahí es la que la dirige.'
	},
	{
		code: 'vigilia_anfora',
		name: 'Vigilia Ánfora',
		kind: 'security',
		faction: 'dominion',
		description:
			'Seguridad contratada. El Dominio le paga por patrullar el ' +
			'sistema y ella subcontrata a quien esté dispuesto, que suele ' +
			'ser un piloto con la nave a nombre de otro.'
	},
	{
		code: 'libre_amarre',
		name: 'Libre Amarre',
		kind: 'logistics',
		faction: '',
		description:
			'Sin bandera y con eso alcanza para tener clientes. Mueve lo ' +
			'que haya que mover y no pregunta de quién es.'
	}
];

/** El único sistema que existe hoy. Todo lo demás cuelga de él. */
const ANFORA: SystemBlueprint = {
	code: 'anfora',
	name: 'Ánfora',
	x: 0,
	y: 0,
	z: 0,
	description:
		'Una estrella amarilla tranquila en el borde de la región. Es ' +
		'donde empiezan todos los pilotos.',
	government: 'corporate',
	controllingFaction: 'dominion',
	root: defineBody({
		code: 'anfora_estrella',
		name: 'Ánfora',
		kind: 'star',
		description: 'Enana amarilla de clase G, estable y sin sobresaltos.',
		children: [
			defineBody({
				code: 'anfora_i',
				name: 'Ánfora I',
				kind: 'planet',
				orbitDistance: 40,
				description:
					'Rocoso y abrasado. Sin atmósfera, con la cara soleada a 400 °C ' +
					'y metales pesados a la vista en la superficie.'
			}),
			defineBody({
				code: 'anfora_ii',
				name: 'Ánfora II',
				kind: 'planet',
				orbitDistance: 95,
				description:
					'Templado, con atmósfera fina que se respira con equipo. Es el ' +
					'planeta más poblado del sistema.',
				children: [
					defineBody({
						code: 'puerto_anfora',
						name: 'Puerto Ánfora',
						kind: 'station',
						orbitDistance: 3,
						description:
							'La estación principal del sistema: hangar, refinería, mercado ' +
							'y aduana. El Dominio firma acá los papeles que valen.',
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
										'su ventanilla empieza todo el mundo.',
									appearance: 'f'
								},
								{
									code: 'anillo_enlace_anfora',
									name: 'Idra Nolm',
									corporation: 'extractora_anillo',
									level: 2,
									missionKind: 'mining',
									description:
										'Enlace de la Extractora en el puerto. Compra mineral y manda a ' +
										'buscar lo que falta, sin pisar los anillos.',
									appearance: 'f'
								},
								{
									code: 'verlan_contratos',
									name: 'Oren Casteig',
									corporation: 'casa_verlan',
									level: 3,
									missionKind: 'trade',
									description:
										'Lleva los contratos que no se publican en el tablón. No recibe ' +
										'a cualquiera.',
									appearance: 'm'
								},
								{
									code: 'vigilia_patrullas',
									name: 'Renna Bosc',
									corporation: 'vigilia_anfora',
									level: 4,
									missionKind: 'combat',
									description:
										'Capitana de la Vigilia. Subcontrata lo que sus patrullas no ' +
										'llegan a cubrir, que es casi todo el borde del sistema.',
									appearance: 'f'
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
				description:
					'Gigante gaseoso. Sus anillos son el campo de asteroides ' +
					'principal del sistema: silicatos y hierro al alcance.',
				children: [
					defineBody({
						code: 'anillos_anfora_iii',
						name: 'Anillos de Ánfora III',
						kind: 'belt',
						orbitDistance: 2,
						description: 'Denso y bien surtido. Es donde aprende a minar todo el mundo.'
					}),
					defineBody({
						code: 'muelle_de_los_anillos',
						name: 'Muelle de los Anillos',
						kind: 'station',
						orbitDistance: 4,
						description:
							'Plataforma de acopio en órbita del gigante, pegada a los ' +
							'anillos. La Concordia la administra por acuerdo, no por ' +
							'conquista.',
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
										'llega a cubrir con su propia gente.',
									appearance: 'f'
								},
								{
									code: 'anillo_logistica',
									name: 'Pell Auren',
									corporation: 'extractora_anillo',
									level: 2,
									missionKind: 'courier',
									description:
										'Mueve el mineral del muelle al puerto. Nunca tiene bodegas ' + 'suficientes.',
									appearance: 'm'
								}
							]
						}
					}),
					defineBody({
						code: 'anfora_iii_a',
						name: 'Ánfora III-a',
						kind: 'moon',
						orbitDistance: 6,
						description:
							'Luna helada. Hielo de agua hasta donde se mire: combustible y ' + 'soporte vital.',
						children: [
							defineBody({
								code: 'planta_escarcha',
								name: 'Planta Escarcha',
								kind: 'station',
								orbitDistance: 1,
								description:
									'Puesto de agua y combustible en órbita de la luna. Poco más ' +
									'que tanques, una refinería y gente con turnos largos.',
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
				description: 'Rocoso y helado, lejos de todo y pobre en casi todo. Buen ' + 'escondite.',
				children: [
					defineBody({
						code: 'amarre_franco',
						name: 'Amarre Franco',
						kind: 'station',
						orbitDistance: 2,
						description:
							'Un carguero varado y reacondicionado. No responde a ninguna de ' +
							'las tres, y ése es su atractivo.',
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
										'cualquiera, que es exactamente el negocio.',
									appearance: 'm'
								},
								{
									code: 'franco_rutas',
									name: 'La Chueca',
									corporation: 'libre_amarre',
									level: 4,
									missionKind: 'trade',
									description:
										'Nadie sabe su nombre y nadie lo pregunta. Conoce rutas que no ' +
										'están en ninguna carta.',
									appearance: 'f'
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
				description:
					'Disperso y sin vigilancia. Mineral raro para quien se anima a ' + 'estar lejos de todo.',
				children: [
					defineBody({
						code: 'habitat_talo',
						name: 'Hábitat Talo',
						kind: 'station',
						orbitDistance: 1,
						description:
							'Excavado en un asteroide del cinturón. El Pacto nació en ' + 'lugares como éste.',
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
										'votaron entre todos la noche anterior.',
									appearance: 'f'
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

/** Busca una corporación por código. */
export function findCorporation(code: string): CorporationBlueprint | null {
	return CORPORATIONS.find((corporation) => corporation.code === code) ?? null;
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
