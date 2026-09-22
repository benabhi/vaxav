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
	deleteBody,
	deleteSystem,
	disconnectGate,
	setGateClosed,
	setStation,
	updateBody,
	type BodyDraft
} from '../src/lib/server/services/worldbuilding';
import {
	GATE_BEARINGS,
	romanNumeral,
	type Atmosphere,
	type BodyClass,
	type BodyKind,
	type GateBearing,
	type Government,
	type StarClass
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

// --- Los atributos de cada cuerpo --------------------------------------------
//
// El plano oficial escribe de qué está hecho cada cuerpo uno por uno. Acá son
// sesenta sistemas y nadie los va a escribir a mano, así que se derivan de lo
// que el cuerpo es. **No pretende ser un generador de planetas**: alcanza con
// que ninguno salga diciendo un disparate, porque de estos tres campos se arma
// la frase que el jugador lee en pantalla y una incoherencia ahí se nota antes
// que cualquier otra cosa del mapa.
//
// El vocabulario es **el mismo del plano oficial** —`BODY_CLASSES`,
// `ATMOSPHERES` y la secuencia espectral—. Si la demo inventara valores propios,
// los filtros del mapa estarían mirando dos galaxias que no se pueden comparar,
// que es justo lo contrario de para lo que existe esta herramienta.

/** De qué está hecho un planeta. Repetir un valor es lo que le da su peso. */
const CLASES_DE_PLANETA: readonly BodyClass[] = [
	'rocky',
	'rocky',
	'rocky',
	'gas',
	'gas',
	'ice',
	'ocean',
	'volcanic'
];

/** Una luna es chica y fría: no retiene gas ni le sobra agua para un océano. */
const CLASES_DE_LUNA: readonly BodyClass[] = ['rocky', 'rocky', 'ice'];

/**
 * Qué puede haber en el aire sobre cada clase de cuerpo.
 *
 * La atmósfera sale de la composición y no de un sorteo aparte, que es lo único
 * que hace falta para que la descripción derivada no se contradiga sola: no hay
 * gigantes gaseosos con aire respirable ni bolas de hielo con atmósfera densa.
 */
const ATMOSFERAS_DE: Readonly<Record<BodyClass, readonly Atmosphere[]>> = {
	rocky: ['none', 'none', 'thin', 'breathable'],
	gas: ['dense', 'dense', 'toxic'],
	ice: ['none', 'thin'],
	ocean: ['breathable', 'dense'],
	volcanic: ['toxic', 'toxic', 'thin']
};

/**
 * Las clases espectrales que se reparten, con el peso de la secuencia real: las
 * frías son la mayoría y las azules casi no existen.
 *
 * No es ambientación. De la clase de la estrella sale **a qué distancia está la
 * zona templada**, así que repartirlas es lo que hace que la misma órbita sea
 * templada en un sistema y hielo en el de al lado. Con sesenta estrellas G el
 * mapa no tendría climas que mirar.
 */
const CLASES_DE_ESTRELLA: readonly StarClass[] = [
	'M',
	'M',
	'M',
	'M',
	'K',
	'K',
	'K',
	'G',
	'G',
	'F',
	'A',
	'B',
	'O'
];

/**
 * Los tres atributos que le tocan a un cuerpo por ser lo que es.
 *
 * Van juntos y listos para volcar en el `BodyDraft` porque **el servicio los
 * valida cruzados**: sólo un planeta o una luna tienen composición y atmósfera, y
 * sólo una estrella tiene clase espectral. Pedirlos por separado invitaría a
 * armar la combinación prohibida y enterarse recién al guardar.
 *
 * Un cinturón, una estación y una puerta se van con los tres vacíos, y eso **es
 * lo correcto y no un hueco**: son lugares, no mundos.
 */
function atributosDe(kind: BodyKind): Pick<BodyDraft, 'bodyClass' | 'atmosphere' | 'starClass'> {
	if (kind === 'star') {
		return { bodyClass: '', atmosphere: '', starClass: unoDe(CLASES_DE_ESTRELLA) };
	}
	if (kind === 'planet' || kind === 'moon') {
		const bodyClass = unoDe(kind === 'planet' ? CLASES_DE_PLANETA : CLASES_DE_LUNA);
		return { bodyClass, atmosphere: unoDe(ATMOSFERAS_DE[bodyClass]), starClass: '' };
	}
	return { bodyClass: '', atmosphere: '', starClass: '' };
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

/**
 * Cuánto se aparta del baricentro el segundo sol de un binario.
 *
 * Es la separación entre las dos estrellas: la primaria nace en el centro con su
 * órbita en cero y la secundaria se corre esto. Con cero las dos estarían en el
 * mismo punto y viajar de una a la otra no llevaría tiempo, que es la clase de
 * dato que después se lee como un error. Cae en la banda de las primeras
 * órbitas, para que el segundo sol quede adentro del sistema y no más lejos que
 * las puertas.
 *
 * **Fijo y no sorteado** a propósito: cada tirada del dado corre todas las que
 * vienen después, y este guión promete que la misma semilla dibuja siempre la
 * misma galaxia. Un número al azar acá cambiaría el mapa entero de la próxima
 * siembra limpia, que es justo lo que la semilla fija viene a evitar.
 */
const SEPARACION_BINARIA = 120;

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

	// **Las puertas de afuera que esta herramienta plantó también son suyas.** El
	// primer sistema de cada facción se cuelga de uno que ya estaba, y para eso se
	// le abre una puerta al que ya estaba: si al limpiar se suelta el enlace pero
	// se deja el cuerpo, Ánfora queda con salidas que no llevan a ningún lado y
	// **con esos rumbos ocupados**. La siembra siguiente encuentra menos lugar
	// libre alrededor del origen, elige otro rumbo, y a partir de ahí dibuja una
	// galaxia distinta: la promesa de que la misma semilla da el mismo mapa se
	// rompe en la segunda corrida. Ya pasó.
	const puertasDeAfuera = db
		.select()
		.from(gate)
		.all()
		.filter((una) => !ids.has(una.systemId) && una.destinationId !== null)
		.filter((una) => cuerposId.has(una.destinationId!))
		.map((una) => una.bodyId);

	// Un piloto parado adentro es motivo para no borrar: moverlo sin avisarle es
	// peor que dejar la galaxia de prueba puesta. Vale también para esas puertas
	// de afuera, que es donde aparece el que acaba de volver.
	const aBorrar = new Set([...cuerposId, ...puertasDeAfuera]);
	const parados = db
		.select()
		.from(pilotTable)
		.all()
		.filter((uno) => aBorrar.has(uno.locationId));
	if (parados.length > 0) {
		// **Se dice dónde está cada uno**, no sólo quiénes son: el que lee esto tiene
		// que ir a moverlos, y con el nombre del lugar sabe adónde ir. Sin eso hay
		// que salir a buscar a dos pilotos por sesenta sistemas.
		const porNombre = new Map(
			db
				.select()
				.from(bodyTable)
				.all()
				.map((uno) => [uno.id, uno.name])
		);
		const quienes = parados.map(
			(uno) => `${uno.callsign} (${porNombre.get(uno.locationId) ?? 'quién sabe dónde'})`
		);
		throw new Error(`Hay pilotos parados ahí: ${quienes.join(', ')}. Movelos antes de limpiar.`);
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

	// Y las puertas que quedaron colgando en los sistemas de afuera, ya sueltas y
	// apuntando a un sistema que ya no está. Van con `deleteBody` por lo mismo que
	// los sistemas van con `deleteSystem`: el servicio sabe qué hay que soltar
	// antes y avisa si algo las retiene.
	for (const bodyId of puertasDeAfuera) deleteBody(db, bodyId, null);

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
				capitalOf: esCapital ? faccion.code : ''
			},
			null
		);
		conteo.sistemas++;

		// La estrella nace G porque `createSystem` no tiene de dónde sacar otra
		// cosa, y sesenta soles iguales dejan el mapa sin climas que comparar. Se
		// le pone la suya acá, que es **donde vive el dato**: de la clase sale la
		// zona templada, y de ahí la banda térmica de cada órbita del sistema.
		updateBody(
			db,
			star.id,
			{
				name: star.name,
				kind: 'star',
				parentId: star.parentId,
				orbitDistance: star.orbitDistance,
				explored: star.explored,
				...atributosDe('star')
			},
			null
		);

		// **Algunos binarios, pocos.** Una segunda estrella es raíz, no cuelga de la
		// primera: un sistema binario tiene dos soles y cada uno lo suyo. Su órbita
		// no es a nadie sino al baricentro del sistema, que es lo que la aparta del
		// otro sol.
		if (dado() < 0.12) {
			createBody(
				db,
				system.id,
				{
					name: `${nombre} B`,
					kind: 'star',
					parentId: null,
					orbitDistance: SEPARACION_BINARIA,
					explored: true,
					...atributosDe('star')
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
					explored: true,
					...atributosDe('planet')
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
					explored: true,
					...atributosDe('station')
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
					explored: true,
					...atributosDe('gate')
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
					explored: true,
					...atributosDe('gate')
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
//
// **Los tres sólo se ponen si esta corrida plantó algo.** A diferencia de los
// sistemas, que se reconocen por nombre y se saltean, un atajo y una puerta
// suelta no tienen con qué reconocerse: correr el guión dos veces sobre la misma
// galaxia sumaba nueve atajos más, tres pasos cerrados más y cuatro puertas
// sueltas más en cada pasada, hasta convertir el mapa en una maraña. El
// encabezado promete que correrlo dos veces no duplica nada, y esta guarda es lo
// que faltaba para que sea verdad.
//
// Los cinturones, que van al final, **sí se ponen igual**: ésos se reconocen por
// sistema, así que agregarlos a una galaxia que ya estaba es exactamente lo que
// se quiere de una siembra aditiva.

const todos = [...plantados.dominion, ...plantados.concord, ...plantados.pact];
const plantoAlgo = conteo.sistemas > 0;

/**
 * Unos cuantos atajos: puertas entre sistemas que **no** son vecinos.
 *
 * No son un error: es lo que impide que la galaxia sea una grilla prolija donde
 * todo cierra en espejo. El mapa los dibuja torcidos justamente para que se vean.
 */
for (let i = 0; plantoAlgo && i < 9 && todos.length > 4; i++) {
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
				explored: true,
				...atributosDe('gate')
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
				explored: true,
				...atributosDe('gate')
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
for (let i = 0; plantoAlgo && i < 4; i++) {
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
				explored: true,
				...atributosDe('gate')
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
