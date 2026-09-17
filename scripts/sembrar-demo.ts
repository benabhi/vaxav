/**
 * Siembra una galaxia grande, para mirar el mapa y los filtros a escala.
 *
 *     npm run db:seed:demo
 *
 * **Es contenido de prueba, no el universo del juego.** Ánfora y lo que siembra
 * `db:seed` son el plano oficial; esto agrega sesenta sistemas alrededor para
 * contestar preguntas que con dos no se pueden contestar: si el mapa se lee con
 * cien nodos, si los filtros sirven de algo, si la grilla de hexágonos se ve como
 * una galaxia o como un panal.
 *
 * **Es aditivo e idempotente por nombre.** Lo que ya existe se saltea, así que
 * correrlo dos veces no duplica nada y no toca lo que había. Para volver al
 * universo chico hay que borrar `data/vaxav.db` y sembrar de nuevo.
 *
 * **El mapa que produce es siempre el mismo.** El azar sale de una semilla fija,
 * porque una galaxia distinta en cada corrida no sirve para comparar un cambio de
 * dibujo con el de ayer.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import {
	body as bodyTable,
	constellation as constellationTable,
	gate,
	pilot as pilotTable,
	region as regionTable,
	system as systemTable
} from '../src/lib/server/db/schema';
import type { Db } from '../src/lib/server/db/types';
import { seeded } from '../src/lib/random';
import {
	connectGates,
	createBody,
	createConstellation,
	createGate,
	createRegion,
	createSystem,
	deleteSystem,
	disconnectGate,
	setGateClosed,
	setStation
} from '../src/lib/server/services/worldbuilding';
import {
	GATE_BEARINGS,
	romanNumeral,
	type GateBearing,
	type Government
} from '../src/lib/game/universe';
import { neighbourOf, type Hex } from '../src/lib/game/galaxy';
import { bearingLabel } from '../src/lib/format';
import { oppositeBearing } from '../src/lib/game/universe';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL');

const sqlite = new Database(url);
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema }) as unknown as Db;

// --- El azar, con semilla ----------------------------------------------------
//
// Lo que importa no es la calidad del azar sino que sea **el mismo todas las
// veces**, o comparar el dibujo de hoy con el de ayer deja de ser posible. El
// generador vive en `$lib/random` porque también lo usa el sello de las
// corporaciones: dos copias del mismo mulberry32 son dos que se pueden desfasar.
const dado = seeded(20260917);

/** Un entero de `min` a `max`, los dos incluidos. */
const entre = (min: number, max: number) => min + Math.floor(dado() * (max - min + 1));

/** Uno cualquiera de la lista, o nada si está vacía. */
function alguno<T>(lista: readonly T[]): T | undefined {
	return lista.length === 0 ? undefined : lista[Math.floor(dado() * lista.length)];
}

/** Uno cualquiera, cuando la lista no puede estar vacía. */
function unoDe<T>(lista: readonly T[]): T {
	const elegido = alguno(lista);
	if (elegido === undefined) throw new Error('La lista estaba vacía');
	return elegido;
}

/** La lista mezclada, sin tocar la original. */
function mezclar<T>(lista: readonly T[]): T[] {
	const copia = [...lista];
	for (let i = copia.length - 1; i > 0; i--) {
		const j = Math.floor(dado() * (i + 1));
		[copia[i], copia[j]] = [copia[j], copia[i]];
	}
	return copia;
}

// --- El contenido ------------------------------------------------------------

interface PlanFaccion {
	readonly code: string;
	/** Dónde cae la capital, que es el primero que se planta. */
	readonly capital: string;
	/** Dos regiones, cada una con sus constelaciones. */
	readonly regions: readonly {
		readonly name: string;
		readonly constellations: readonly string[];
	}[];
	/** Los veinte nombres, capital incluida. */
	readonly systems: readonly string[];
	/** Los gobiernos que se reparten, con el peso que da repetirlos. */
	readonly governments: readonly Government[];
}

const PLAN: readonly PlanFaccion[] = [
	{
		code: 'dominion',
		capital: 'Alcázar',
		regions: [
			{ name: 'Marca de Ávila', constellations: ['Cerco de Ávila', 'Peñascales', 'Alto Zurita'] },
			{ name: 'Cuenca de Velasco', constellations: ['Lomas de Velasco', 'Serranía Baja'] }
		],
		systems: [
			'Alcázar',
			'Ávila',
			'Quintana',
			'Bastión',
			'Torre Negra',
			'Velasco',
			'Caldera',
			'Monteverde',
			'Rivera Alta',
			'Peñasco',
			'Zurita',
			'Lumbre',
			'Coronado',
			'Sagrada',
			'Yelmo',
			'Serrana',
			'Baluarte',
			'Aldaba',
			'Ventura',
			'Cerrojo'
		],
		governments: ['corporate', 'corporate', 'dictatorship', 'feudal', 'dictatorship']
	},
	{
		code: 'concord',
		capital: 'Concordia',
		regions: [
			{ name: 'Mar de Almadía', constellations: ['Bajos de Almadía', 'Vela Blanca'] },
			{
				name: 'Bancos del Norte',
				constellations: ['Pleamar', 'Sotavento', 'Rompientes']
			}
		],
		systems: [
			'Concordia',
			'Almadía',
			'Ribera',
			'Marejada',
			'Vela Blanca',
			'Calafate',
			'Bahía Larga',
			'Sotavento',
			'Estuario',
			'Norte Claro',
			'Pleamar',
			'Espigón',
			'Corriente',
			'Fanal',
			'Ancla Azul',
			'Muelle Viejo',
			'Resaca',
			'Brisa',
			'Cabotaje',
			'Bitácora'
		],
		governments: ['democracy', 'democracy', 'democracy', 'corporate', 'feudal']
	},
	{
		code: 'pact',
		capital: 'Yunque',
		regions: [
			{ name: 'Cinturón de Hollín', constellations: ['Carbonera', 'Humos Altos'] },
			{ name: 'Yermo de Esquirla', constellations: ['Chatarral', 'Brasas', 'Filo Roto'] }
		],
		systems: [
			'Yunque',
			'Forja',
			'Escoria',
			'Carbonera',
			'Hollín',
			'Remache',
			'Cincel',
			'Barreno',
			'Herrumbre',
			'Fundición',
			'Perno',
			'Estribo',
			'Taladro',
			'Chatarra',
			'Soldadura',
			'Cuña',
			'Roldana',
			'Garrucha',
			'Esquirla',
			'Brasa'
		],
		governments: ['feudal', 'prison', 'dictatorship', 'anarchy', 'feudal']
	}
];

/** Entre qué números puede moverse la seguridad de cada gobierno, ya controlado. */
const BANDAS: Record<Government, readonly [number, number]> = {
	anarchy: [0, 0],
	feudal: [10, 35],
	prison: [25, 50],
	dictatorship: [30, 60],
	democracy: [55, 85],
	corporate: [60, 100]
};

const CORPORACIONES: Record<string, readonly string[]> = {
	dominion: ['casa_verlan', 'vigilia_anfora'],
	concord: ['extractora_anillo', 'hidros_escarcha'],
	pact: ['comuna_talo']
};

const SERVICIOS = ['shipyard', 'outfitting', 'storage', 'market', 'refinery'] as const;

const conteo: Record<string, number> = {
	regiones: 0,
	constelaciones: 0,
	sistemas: 0,
	'estrellas dobles': 0,
	cuerpos: 0,
	estaciones: 0,
	puertas: 0,
	atajos: 0,
	'pasos cerrados': 0,
	'puertas sueltas': 0,
	'sin enganchar': 0
};

// --- La grilla ---------------------------------------------------------------

/** Las casillas tomadas, para no plantar dos sistemas encima. */
function ocupadas(): Set<string> {
	return new Set(
		db
			.select()
			.from(systemTable)
			.all()
			.map((uno) => `${uno.x},${uno.y},${uno.z}`)
	);
}

/**
 * Un rumbo libre de ese sistema que además caiga en una casilla vacía.
 *
 * Las dos condiciones, no una: un rumbo sin puerta puede apuntar igual a la
 * casilla de un vecino que llegó por otro lado. `connectGates` no comprueba esto
 * —coloca donde le dicen— así que la galaxia que salga de acá es tan sana como lo
 * sea esta función.
 */
function rumboConLugar(systemId: number, hex: Hex, tomadas: Set<string>): GateBearing | null {
	const conPuerta = new Set(
		db
			.select()
			.from(gate)
			.where(eq(gate.systemId, systemId))
			.all()
			.map((una) => una.bearing)
	);

	const posibles = mezclar(GATE_BEARINGS).filter((rumbo) => {
		if (conPuerta.has(rumbo)) return false;
		const destino = neighbourOf(hex, rumbo);
		return !tomadas.has(`${destino.x},${destino.y},${destino.z}`);
	});

	return posibles[0] ?? null;
}

/**
 * La región, creándola sólo si no estaba.
 *
 * **La idempotencia se hace acá y no en el servicio.** `createRegion` se niega a
 * repetir un nombre, y hace bien: dos regiones que se llaman igual son un error
 * del constructor. Pero un sembrador que se puede correr dos veces necesita
 * reusar lo que encuentra, y la diferencia entre «crear» y «asegurar» es de quien
 * siembra, no de quien valida.
 */
function asegurarRegion(nombre: string): number {
	const existente = db
		.select()
		.from(regionTable)
		.all()
		.find((una) => una.name === nombre);
	if (existente) return existente.id;
	conteo.regiones++;
	return createRegion(db, nombre, null).id;
}

/** Lo mismo para la constelación, que además va colgada de su región. */
function asegurarConstelacion(regionId: number, nombre: string): number {
	const existente = db
		.select()
		.from(constellationTable)
		.all()
		.find((una) => una.name === nombre);
	if (existente) return existente.id;
	conteo.constelaciones++;
	return createConstellation(db, regionId, nombre, null).id;
}

/**
 * La estrella de un sistema, que es de quien cuelgan sus puertas.
 *
 * Una puerta orbita como cualquier otro cuerpo: está lejos del sol y hay que
 * viajar hasta ella antes de saltar. Es lo que hace que su distancia importe.
 */
function estrellaDe(systemId: number): number {
	return db
		.select()
		.from(bodyTable)
		.where(eq(bodyTable.systemId, systemId))
		.all()
		.find((uno) => uno.kind === 'star' && uno.parentId === null)!.id;
}

/** Dónde está un sistema en la grilla, leído de la base. */
function hexDe(systemId: number): Hex {
	const fila = db.select().from(systemTable).where(eq(systemTable.id, systemId)).get()!;
	return { x: fila.x, y: fila.y, z: fila.z };
}

// --- La siembra --------------------------------------------------------------

/**
 * Borra lo que sembró esta herramienta, para poder volver a sembrarlo.
 *
 *     npm run db:seed:demo -- --limpiar
 *
 * Toca **sólo lo suyo**: los sistemas que están en el plan y lo que cuelga de
 * ellos, y después las regiones y constelaciones que quedaron vacías. Ánfora,
 * Omega y los pilotos no se tocan.
 *
 * **Borra con `deleteSystem`, no a mano.** Ese servicio ya sabe el orden en que
 * hay que soltar las cosas —de la hoja a la raíz, con las estaciones y los
 * depósitos antes que el cuerpo— y reimplementarlo acá sería tener ese
 * conocimiento en dos lados para que uno de los dos se quede viejo. Lo único que
 * hay que hacer antes es soltar las puertas, porque un sistema al que le apuntan
 * no se deja borrar, y con razón.
 */
function limpiar(): void {
	const nombres = new Set(PLAN.flatMap((una) => una.systems));
	const suyos = db
		.select()
		.from(systemTable)
		.all()
		.filter((uno) => nombres.has(uno.name));

	if (suyos.length === 0) {
		console.log('No hay nada de la galaxia de prueba para borrar.');
		return;
	}

	const ids = new Set(suyos.map((uno) => uno.id));
	const cuerpos = db
		.select()
		.from(bodyTable)
		.all()
		.filter((uno) => ids.has(uno.systemId));
	const cuerposId = new Set(cuerpos.map((uno) => uno.id));

	// Un piloto parado adentro es motivo para no borrar: moverlo sin avisarle es
	// peor que dejar la galaxia de prueba puesta.
	const parados = db
		.select()
		.from(pilotTable)
		.all()
		.filter((uno) => cuerposId.has(uno.locationId));
	if (parados.length > 0) {
		throw new Error(
			`Hay pilotos parados ahí: ${parados.map((uno) => uno.callsign).join(', ')}. ` +
				'Movelos antes de limpiar.'
		);
	}

	// Primero se sueltan todas las puertas que tocan uno de estos sistemas, de
	// cualquiera de las dos puntas: las de adentro y las de afuera que apuntan
	// para adentro.
	// Se relee cada una antes de soltarla: `disconnectGate` suelta **las dos
	// puntas**, así que la gemela ya está suelta cuando el bucle llega a ella y la
	// foto de hace un rato diría que no.
	for (const vieja of db.select().from(gate).all()) {
		const una = db.select().from(gate).where(eq(gate.id, vieja.id)).get();
		if (!una || una.destinationId === null) continue;
		if (ids.has(una.systemId) || cuerposId.has(una.destinationId)) {
			disconnectGate(db, una.id, null);
		}
	}

	for (const uno of suyos) deleteSystem(db, uno.id, null);

	// Y las constelaciones y regiones que quedaron sin nada adentro.
	const conSistemas = new Set(
		db
			.select()
			.from(systemTable)
			.all()
			.map((uno) => uno.constellationId)
	);
	for (const una of db.select().from(constellationTable).all()) {
		if (!conSistemas.has(una.id)) {
			db.delete(constellationTable).where(eq(constellationTable.id, una.id)).run();
		}
	}

	const conConstelaciones = new Set(
		db
			.select()
			.from(constellationTable)
			.all()
			.map((una) => una.regionId)
	);
	for (const una of db.select().from(regionTable).all()) {
		if (!conConstelaciones.has(una.id)) {
			db.delete(regionTable).where(eq(regionTable.id, una.id)).run();
		}
	}

	console.log(`Borrados ${suyos.length} sistemas de prueba y lo que colgaba de ellos.`);
}

if (process.argv.includes('--limpiar')) {
	limpiar();
	process.exit(0);
}

/** Lo que ya existe, para saltearlo: esto se puede correr dos veces. */
const yaEstaban = new Set(
	db
		.select()
		.from(systemTable)
		.all()
		.map((uno) => uno.name)
);

/** Los sistemas plantados en esta corrida, por facción. */
const plantados: Record<string, number[]> = { dominion: [], concord: [], pact: [] };

/** El ancla de la primera facción: el sistema inicial, que es el origen. */
const anfora = db.select().from(systemTable).where(eq(systemTable.code, 'anfora')).get();
if (!anfora) throw new Error('Falta el universo base. Corré primero: npm run db:seed');

let anteriorFaccion: number[] = [anfora.id];

for (const faccion of PLAN) {
	// --- Regiones y constelaciones -------------------------------------------
	const constelaciones: number[] = [];
	for (const region of faccion.regions) {
		const suId = asegurarRegion(region.name);
		for (const nombre of region.constellations) {
			constelaciones.push(asegurarConstelacion(suId, nombre));
		}
	}

	// --- Los veinte sistemas --------------------------------------------------
	// **Cada constelación se llena antes de empezar la siguiente**, y cada sistema
	// nuevo se cuelga de uno de la suya. Antes la constelación salía del orden de
	// plantado y el padre se elegía en todo el racimo: el treinta por ciento de las
	// veces el sistema aterrizaba lejos de sus hermanos y el territorio salía en
	// parches sueltos. Una región es un continente, no un archipiélago.
	const cupo = Math.ceil(faccion.systems.length / constelaciones.length);
	const porConstelacion: Record<number, number[]> = {};

	for (const [indice, nombre] of faccion.systems.entries()) {
		const cual = Math.min(constelaciones.length - 1, Math.floor(indice / cupo));
		const miConstelacion = constelaciones[cual];
		porConstelacion[cual] ??= [];
		// **Lo que ya estaba también cuenta como plantado.** Saltearlo del todo lo
		// dejaba fuera de la lista de enganche, y el siguiente se quedaba sin nada
		// de dónde colgar. Una siembra a medias tiene que poder continuarse.
		if (yaEstaban.has(nombre)) {
			const previo = db
				.select()
				.from(systemTable)
				.all()
				.find((uno) => uno.name === nombre);
			if (previo) plantados[faccion.code].push(previo.id);
			continue;
		}

		const esCapital = nombre === faccion.capital;
		const government = esCapital ? faccion.governments[0] : unoDe(faccion.governments);
		const [min, max] = BANDAS[government];

		const { system, star } = createSystem(
			db,
			{
				name: nombre,
				constellationId: miConstelacion,
				government,
				security: entre(min, max),
				controllingFaction: faccion.code,
				capitalOf: esCapital ? faccion.code : '',
				description: esCapital
					? `El corazón de ${faccion.code === 'dominion' ? 'El Dominio' : faccion.code === 'concord' ? 'La Concordia' : 'El Pacto'}.`
					: ''
			},
			null
		);
		conteo.sistemas++;

		// **Algunos binarios, pocos.** Una segunda estrella es raíz, no cuelga de la
		// primera: un sistema binario tiene dos soles y cada uno lo suyo.
		if (dado() < 0.12) {
			createBody(
				db,
				system.id,
				{
					name: `${nombre} B`,
					kind: 'star',
					parentId: null,
					orbitDistance: 0,
					description: 'La compañera, más chica y más fría.',
					explored: true
				},
				null
			);
			conteo['estrellas dobles']++;
		}

		// --- Planetas, y alguna estación -----------------------------------------
		const cuantos = esCapital ? 4 : entre(1, 3);
		let ultimo = star.id;
		for (let i = 1; i <= cuantos; i++) {
			const planeta = createBody(
				db,
				system.id,
				{
					name: `${nombre} ${romanNumeral(i)}`,
					kind: 'planet',
					parentId: star.id,
					orbitDistance: 60 + i * entre(40, 120),
					description: '',
					explored: true
				},
				null
			);
			conteo.cuerpos++;
			ultimo = planeta.id;
		}

		if (esCapital || dado() < 0.35) {
			const estacion = createBody(
				db,
				system.id,
				{
					name: `${esCapital ? 'Puerto' : unoDe(['Muelle', 'Amarre', 'Hábitat', 'Estación'])} ${nombre}`,
					kind: 'station',
					parentId: ultimo,
					orbitDistance: entre(1, 6),
					description: '',
					explored: true
				},
				null
			);
			conteo.cuerpos++;
			setStation(
				db,
				estacion.id,
				unoDe(CORPORACIONES[faccion.code] ?? ['libre_amarre']),
				mezclar(SERVICIOS).slice(0, entre(2, 4)),
				null
			);
			conteo.estaciones++;
		}

		// --- Y la puerta que lo cuelga del mapa ----------------------------------
		//
		// El primero de cada facción se engancha a la anterior —así la galaxia queda
		// de una pieza y se puede caminar de punta a punta— y el resto crece sobre
		// los suyos.
		// **De quién se cuelga, en orden de preferencia.** Primero los de su propia
		// constelación, que es lo que la vuelve un continente y no un archipiélago;
		// después cualquiera de la facción, para cuando la constelación está rodeada;
		// y el primero de todos se engancha a la facción anterior, así la galaxia
		// queda de una pieza y se puede caminar de punta a punta.
		//
		// Dentro de la propia constelación, setenta por ciento sobre lo último
		// plantado y treinta sobre cualquiera: siempre desde el último sale una
		// víbora, siempre al azar sale una mancha redonda, y mezclando salen ramas
		// con brotes.
		//
		// **Se prueba candidato por candidato hasta encontrar uno con lugar.** Con
		// seis vecinos por casilla el frente se satura enseguida, y rendirse al
		// primero que no tiene libre dejaba racimos enteros flotando en el origen.
		const hermanos = porConstelacion[cual];
		const cerca = hermanos.slice(-6);
		const propios =
			dado() < 0.7 && cerca.length > 0
				? [...mezclar(cerca), ...mezclar(hermanos)]
				: mezclar(hermanos);

		const orden =
			indice === 0
				? mezclar(anteriorFaccion)
				: [...propios, ...mezclar(plantados[faccion.code]), ...mezclar(anteriorFaccion)];

		const tomadas = ocupadas();
		let enganchado = false;
		for (const fuente of orden) {
			const rumbo = rumboConLugar(fuente, hexDe(fuente), tomadas);
			if (!rumbo) continue;

			const salida = createGate(
				db,
				fuente,
				{
					name: `Puerta ${bearingLabel(rumbo)}`,
					kind: 'gate',
					parentId: estrellaDe(fuente),
					orbitDistance: entre(300, 800),
					description: '',
					explored: true
				},
				rumbo,
				null
			);
			const vuelta = createGate(
				db,
				system.id,
				{
					name: `Puerta ${bearingLabel(oppositeBearing(rumbo))}`,
					kind: 'gate',
					parentId: star.id,
					orbitDistance: entre(300, 800),
					description: '',
					explored: true
				},
				oppositeBearing(rumbo),
				null
			);
			connectGates(db, salida.gate.id, vuelta.gate.id, entre(4, 28), null);
			conteo.puertas++;
			enganchado = true;
			break;
		}

		// Que esto pase quiere decir que el racimo quedó cerrado por todos lados, y
		// con sesenta sistemas no debería. Se avisa fuerte en vez de dejar el sistema
		// flotando en silencio.
		if (!enganchado) {
			console.warn(`  ¡${nombre} quedó sin enganchar: no hay casilla libre alrededor!`);
			conteo['sin enganchar']++;
		}

		plantados[faccion.code].push(system.id);
		porConstelacion[cual].push(system.id);
	}

	anteriorFaccion = plantados[faccion.code];
}

// --- Los adornos que hacen que el mapa tenga todos sus estados ---------------

const todos = [...plantados.dominion, ...plantados.concord, ...plantados.pact];

/**
 * Unos cuantos atajos: puertas entre sistemas que **no** son vecinos.
 *
 * No son un error: es lo que impide que la galaxia sea una grilla prolija donde
 * todo cierra en espejo. El mapa los dibuja torcidos justamente para que se vean.
 */
for (let i = 0; i < 9 && todos.length > 4; i++) {
	const uno = alguno(todos);
	const otro = alguno(todos);
	if (!uno || !otro || uno === otro) continue;

	const tomadas = ocupadas();
	const rumboUno = rumboConLugar(uno, hexDe(uno), tomadas);
	const rumboOtro = rumboConLugar(otro, hexDe(otro), tomadas);
	if (!rumboUno || !rumboOtro) continue;

	try {
		const salida = createGate(
			db,
			uno,
			{
				name: `Puerta ${bearingLabel(rumboUno)}`,
				kind: 'gate',
				parentId: estrellaDe(uno),
				orbitDistance: entre(300, 900),
				description: '',
				explored: true
			},
			rumboUno,
			null
		);
		const vuelta = createGate(
			db,
			otro,
			{
				name: `Puerta ${bearingLabel(rumboOtro)}`,
				kind: 'gate',
				parentId: estrellaDe(otro),
				orbitDistance: entre(300, 900),
				description: '',
				explored: true
			},
			rumboOtro,
			null
		);
		connectGates(db, salida.gate.id, vuelta.gate.id, entre(10, 40), null);
		conteo.atajos++;
	} catch {
		// Un rumbo que se ocupó entre medio: se saltea y sigue. Un adorno que no
		// sale no es motivo para abortar una siembra de sesenta sistemas.
	}
}

/** Tres pasos cerrados, para ver cómo se lee un bloqueo en el mapa. */
const conectadas = db
	.select()
	.from(gate)
	.all()
	.filter((una) => una.destinationId !== null);
for (const una of mezclar(conectadas).slice(0, 3)) {
	try {
		setGateClosed(db, una.id, true, null);
		conteo['pasos cerrados']++;
	} catch {
		// Ya estaba cerrada, o se desconectó. No importa.
	}
}

/** Y cuatro puertas plantadas sin conectar: obra a medio hacer, que el mapa marca. */
for (let i = 0; i < 4; i++) {
	const donde = alguno(todos);
	if (!donde) continue;
	const tomadas = ocupadas();
	const rumbo = rumboConLugar(donde, hexDe(donde), tomadas);
	if (!rumbo) continue;
	try {
		createGate(
			db,
			donde,
			{
				name: `Puerta ${bearingLabel(rumbo)}`,
				kind: 'gate',
				parentId: estrellaDe(donde),
				orbitDistance: entre(300, 900),
				description: '',
				explored: true
			},
			rumbo,
			null
		);
		conteo['puertas sueltas']++;
	} catch {
		// Otro rumbo ocupado. Se saltea.
	}
}

console.log('Galaxia de prueba sembrada:');
for (const [que, cuantos] of Object.entries(conteo)) {
	console.log(`  ${String(cuantos).padStart(4)}  ${que}`);
}
