/**
 * El universo tal como lo ve quien lo construye.
 *
 * Es la vista del **constructor**, no la del piloto: donde `views/navigation.ts`
 * dice a qué distancia está cada cuerpo y cuánto tarda llegar, ésta dice de qué
 * cuelga, qué lo retiene y qué se le puede colgar encima. Son dos lecturas del
 * mismo árbol y por eso no comparten constructor, aunque compartan el dibujo:
 * las dos lo pintan con `TreeBranch`.
 *
 * Acá se arman también las opciones de todos los desplegables. Van desde el
 * servidor y no escritas en la pantalla porque salen de catálogos del juego
 * —facciones, gobiernos, minerales— y duplicarlas en un `<select>` sería tener
 * dos listas que se desincronizan en cuanto el catálogo crezca.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { eq } from 'drizzle-orm';
import {
	beltDeposit,
	body,
	constellation,
	corporation,
	gate,
	region,
	station,
	stationService,
	system,
	type Body,
	type System
} from '../db/schema';
import type { Db } from '../db/types';
import { railsFor } from '$lib/tree';
import {
	bodiesOf,
	bodyBlockers,
	constellationsIn,
	allRegions,
	looseGates,
	systemBlockers
} from '../services/worldbuilding';
import {
	BODY_CHILDREN,
	GATE_BEARINGS,
	SECURITY_BANDS,
	SERVICE_ORDER,
	bearingAngle,
	freeBearings,
	securityBand,
	securityLevel,
	type BodyKind,
	type GateBearing,
	type Government
} from '$lib/game/universe';
import { ORIGIN, hexDistance, neighbourOf, sameHex } from '$lib/game/galaxy';
import { lightYears } from '$lib/game/jumps';
import { FREE_SPACE } from '$lib/admin';
import { FACTION_LIST } from '$lib/game/factions';
import { ORE_LIST } from '$lib/game/items';
import {
	bearingLabel,
	bodyKindIcon,
	bodyKindLabel,
	governmentLabel,
	securityLabel,
	serviceLabel
} from '$lib/format';
import type {
	ConsultaUniverso,
	Constructor,
	EnlaceGalaxia,
	MapaGalaxia,
	NodoGalaxia,
	FilaConstruccion,
	FilaMineral,
	FilaPuerta,
	FilaSistema,
	OpcionConstructor,
	OpcionesConstructor,
	Universo
} from '$lib/tipos';

/** Cómo se lee una facción, o «Espacio libre» si no hay ninguna. */
function factionLabel(code: string): string {
	if (!code) return 'Espacio libre';
	return FACTION_LIST.find((una) => una.code === code)?.name ?? code;
}

/**
 * Las opciones de todos los desplegables del constructor.
 *
 * Se arman de una sola vez porque las pantallas las necesitan juntas: el
 * formulario de un sistema pide constelaciones, facciones y gobiernos, y el de
 * un cuerpo pide corporaciones, módulos y minerales. Partirlas en seis consultas
 * sería seis viajes para llenar una pantalla.
 */
export function buildOptions(db: Db): OpcionesConstructor {
	const regiones = allRegions(db);
	const porRegion = new Map(regiones.map((una) => [una.id, una.name]));

	return {
		regions: regiones.map((una) => ({ value: String(una.id), label: una.name })),

		// La constelación lleva su región como grupo: con veinte constelaciones, un
		// desplegable plano no dice en qué parte de la galaxia cae cada una.
		constellations: constellationsIn(db).map((una) => ({
			value: String(una.id),
			label: una.name,
			group: porRegion.get(una.regionId) ?? ''
		})),

		factions: [
			{ value: '', label: 'Espacio libre' },
			...FACTION_LIST.map((una) => ({ value: una.code, label: una.name }))
		],

		// Cada gobierno viaja con su banda: la pantalla usa los límites para acotar
		// el control de seguridad, así que quien lo mueve no puede elegir un número
		// que el servidor vaya a rechazar.
		governments: Object.keys(SECURITY_BANDS).map((code) => {
			const government = code as Government;
			const propia = SECURITY_BANDS[government];
			const libre = securityBand(government, false);
			return {
				value: government,
				label: governmentLabel(government),
				min: propia.min,
				max: propia.max,
				freeMin: libre.min,
				freeMax: libre.max
			};
		}),

		corporations: db
			.select()
			.from(corporation)
			.orderBy(corporation.name)
			.all()
			.map((una) => ({ value: una.code, label: una.name })),

		services: SERVICE_ORDER.map((service) => ({
			value: service,
			label: serviceLabel(service)
		})),

		ores: ORE_LIST.map((ore) => ({ value: ore.code, label: ore.name })),

		bodyKinds: (['planet', 'moon', 'belt', 'station', 'gate'] as const).map((kind) => ({
			value: kind,
			label: bodyKindLabel(kind)
		}))
	};
}

/** Qué tipos de cuerpo se le pueden colgar a éste. */
function accepts(kind: BodyKind): readonly OpcionConstructor[] {
	return BODY_CHILDREN[kind].map((hijo) => ({ value: hijo, label: bodyKindLabel(hijo) }));
}

/**
 * Qué se puede plantar en la **raíz** del sistema.
 *
 * Sólo una estrella, y de ahí que sea una lista de uno: un sistema binario tiene
 * dos soles y cada uno cuelga lo suyo, que es la razón por la que el árbol se
 * dibujó desde el principio aguantando varias raíces. Lo demás orbita algo.
 */
const ROOT_KINDS: readonly OpcionConstructor[] = [{ value: 'star', label: bodyKindLabel('star') }];

/** El listado de sistemas, con lo que hace falta para elegir cuál abrir. */
/**
 * Por qué columnas se puede ordenar el listado, y cómo.
 *
 * Es una tabla y no un `switch` porque **agregar una columna ordenable tiene que
 * ser agregar una fila**. La pantalla dibuja sus encabezados desde acá, así que
 * una columna que no está en esta tabla no aparece como ordenable: no hay forma
 * de que el encabezado prometa un orden que el servidor no sabe hacer.
 */
export const SYSTEM_SORTS: Readonly<Record<string, (fila: FilaSistema) => string | number>> = {
	nombre: (fila) => fila.name.toLocaleLowerCase('es'),
	donde: (fila) => `${fila.region} ${fila.constellation}`.toLocaleLowerCase('es'),
	gobierno: (fila) => fila.government.toLocaleLowerCase('es'),
	seguridad: (fila) => fila.security,
	controla: (fila) => fila.controlledBy.toLocaleLowerCase('es'),
	contenido: (fila) => fila.bodies
};

/**
 * Los filtros del listado, cada uno con su propia pregunta.
 *
 * **Se apilan**: un sistema entra si pasa todos. Agregar «los que tienen
 * astillero» o «los que están en guerra» el día que eso exista es agregar una
 * entrada acá y un select en la pantalla, sin tocar nada más. Ése es el punto de
 * que sea una tabla.
 */
const SYSTEM_FILTERS: readonly ((fila: FilaSistema, query: ConsultaUniverso) => boolean)[] = [
	(fila, query) =>
		!query.search ||
		fila.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
	(fila, query) =>
		!query.faction ||
		(query.faction === FREE_SPACE
			? fila.controllingFactionCode === ''
			: fila.controllingFactionCode === query.faction),
	(fila, query) => !query.region || fila.region === query.region,
	(fila, query) => !query.government || fila.governmentCode === query.government
];

/**
 * Cómo se pide «los que no tiene nadie» en el filtro de facción.
 *
 * El catálogo del constructor ya usa la cadena vacía para «espacio libre», y en
 * un filtro el vacío significa «todas». Hacen falta las dos cosas, así que el
 * espacio libre se pide con un centinela y el vacío queda para no filtrar. Vive
 * en `$lib/admin` porque lo leen los dos lados: el servidor para filtrar y la
 * pantalla para armar el desplegable.
 */

/** Cuántos sistemas entran en una página del listado. */
export const SYSTEMS_PER_PAGE = 25;

/** Por qué se puede pintar el mapa. Otra tabla que crece con una fila. */
export const MAP_PAINTS = ['faccion', 'region', 'seguridad', 'gobierno'] as const;

/**
 * Lee la consulta de la URL, con todo validado contra los catálogos.
 *
 * Nada de confiar en el parámetro: una columna de orden inventada o una página
 * negativa entran igual de fácil que las buenas, y el borde es acá.
 */
export function readUniverseQuery(params: URLSearchParams): ConsultaUniverso {
	const sort = params.get('orden') ?? '';
	const paint = params.get('pintar') ?? '';

	return {
		search: (params.get('buscar') ?? '').trim().slice(0, 60),
		faction: params.get('faccion') ?? '',
		region: params.get('region') ?? '',
		government: params.get('gobierno') ?? '',
		sort: sort in SYSTEM_SORTS ? sort : 'nombre',
		dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
		page: Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1),
		paint: MAP_PAINTS.includes(paint as (typeof MAP_PAINTS)[number]) ? paint : ''
	};
}

/**
 * La galaxia puesta en la grilla, lista para dibujar.
 *
 * **Se arma en el servidor y no en el navegador.** Lo que el lienzo recibe son
 * casillas y líneas, no filas de la base: el dibujo no tiene que saber qué es una
 * puerta gemela ni cómo se reconoce un ramal suelto. Es la misma división que
 * usan todas las vistas del proyecto, y acá pesa más que en ninguna porque el
 * mapa es la pantalla más cara de la administración.
 *
 * Todo sale de **dos consultas**, no de una por sistema: con cincuenta sistemas
 * un `N+1` acá son cincuenta idas a la base cada vez que alguien abre el cuartel.
 */
function buildMapa(
	db: Db,
	sistemas: readonly System[],
	filas: readonly FilaSistema[]
): MapaGalaxia {
	const puertas = db.select().from(gate).all();
	const porSistema = new Map(sistemas.map((uno) => [uno.id, uno]));
	const porCuerpo = new Map(puertas.map((una) => [una.bodyId, una]));
	const datos = new Map(filas.map((una) => [una.code, una]));

	// Qué sistemas llegan caminando hasta la semilla. Un ramal armado aparte tiene
	// casilla pero no tiene lugar: su posición no significa nada hasta engancharlo.
	const semilla = [...sistemas].sort((a, b) => a.id - b.id)[0];
	const enElMapa = new Set<number>();
	if (semilla) {
		const pendientes = [semilla.id];
		enElMapa.add(semilla.id);
		while (pendientes.length > 0) {
			const actual = pendientes.pop()!;
			for (const salida of puertas.filter((una) => una.systemId === actual)) {
				if (salida.destinationId === null) continue;
				const gemela = porCuerpo.get(salida.destinationId);
				if (!gemela || enElMapa.has(gemela.systemId)) continue;
				enElMapa.add(gemela.systemId);
				pendientes.push(gemela.systemId);
			}
		}
	}

	const nodos: NodoGalaxia[] = sistemas.map((uno) => {
		const suyas = puertas.filter((una) => una.systemId === uno.id);
		const fila = datos.get(uno.code);
		const tomados = suyas.map((una) => una.bearing);

		return {
			code: uno.code,
			name: uno.name,
			hex: { x: uno.x, y: uno.y, z: uno.z },
			government: fila?.government ?? '',
			security: uno.security,
			securityLevel: fila?.securityLevel ?? '',
			faction: uno.controllingFaction,
			factionName: fila?.controlledBy ?? '',
			region: fila?.region ?? '',
			constellation: fila?.constellation ?? '',
			bodies: fila?.bodies ?? 0,
			stations: fila?.stations ?? 0,
			gates: suyas.length,
			looseBearings: suyas.filter((una) => una.destinationId === null).map((una) => una.bearing),
			free: freeBearings(tomados),
			adrift: !enElMapa.has(uno.id)
		};
	});

	// Una línea por par y no una por puerta: las dos puntas describen el mismo
	// pasaje, y dibujarlas dos veces engrosaría cada conexión al doble.
	const vistos = new Set<number>();
	const enlaces: EnlaceGalaxia[] = [];
	for (const salida of puertas) {
		if (salida.destinationId === null || vistos.has(salida.id)) continue;
		const gemela = porCuerpo.get(salida.destinationId);
		if (!gemela) continue;
		vistos.add(salida.id);
		vistos.add(gemela.id);

		const aqui = porSistema.get(salida.systemId);
		const alla = porSistema.get(gemela.systemId);
		if (!aqui || !alla) continue;

		enlaces.push({
			from: aqui.code,
			to: alla.code,
			bearing: salida.bearing,
			distance: lightYears(salida.jumpDistance),
			closed: salida.closed,
			shortcut: !sameHex(neighbourOf({ x: aqui.x, y: aqui.y, z: aqui.z }, salida.bearing), {
				x: alla.x,
				y: alla.y,
				z: alla.z
			})
		});
	}

	// Cuán lejos del centro llega el mapa, para encuadrarlo sin medir en el cliente.
	const radio = nodos.reduce((mayor, nodo) => Math.max(mayor, hexDistance(ORIGIN, nodo.hex)), 0);

	return {
		systems: nodos,
		links: enlaces,
		radius: radio,
		adrift: nodos.filter((nodo) => nodo.adrift).length
	};
}

export function buildUniverso(db: Db, query = readUniverseQuery(new URLSearchParams())): Universo {
	const sistemas = db.select().from(system).orderBy(system.name).all();
	const constelaciones = new Map(
		db
			.select()
			.from(constellation)
			.all()
			.map((una) => [una.id, una])
	);
	const regiones = new Map(
		db
			.select()
			.from(region)
			.all()
			.map((una) => [una.id, una])
	);

	const cuerpos = db.select().from(body).all();
	const estaciones = new Set(
		db
			.select()
			.from(station)
			.all()
			.map((una) => una.bodyId)
	);
	const puertas = db.select().from(gate).all();

	const filas: FilaSistema[] = sistemas.map((fila) => {
		const suyos = cuerpos.filter((uno) => uno.systemId === fila.id);
		const susPuertas = puertas.filter((una) => una.systemId === fila.id);
		const suConstelacion = constelaciones.get(fila.constellationId);

		return {
			id: fila.id,
			code: fila.code,
			name: fila.name,
			constellation: suConstelacion?.name ?? '',
			region: suConstelacion ? (regiones.get(suConstelacion.regionId)?.name ?? '') : '',
			government: governmentLabel(fila.government),
			governmentCode: fila.government,
			controllingFactionCode: fila.controllingFaction,
			security: fila.security,
			securityLevel: securityLabel(securityLevel(fila.security)),
			controlledBy: factionLabel(fila.controllingFaction),
			capitalOf: fila.capitalOf ? factionLabel(fila.capitalOf) : '',
			bodies: suyos.length,
			stations: suyos.filter((uno) => estaciones.has(uno.id)).length,
			gates: susPuertas.length,
			loose: susPuertas.filter((una) => una.destinationId === null).length
		};
	});

	// Los que pasan todos los filtros. El mapa recibe la galaxia entera igual: lo
	// que el filtro hace es apagar el resto, no borrarlo, porque un mapa que sólo
	// dibuja lo filtrado pierde la forma del conjunto.
	const pasan = filas.filter((fila) => SYSTEM_FILTERS.every((cumple) => cumple(fila, query)));

	const clave = SYSTEM_SORTS[query.sort] ?? SYSTEM_SORTS.nombre;
	const vuelta = query.dir === 'desc' ? -1 : 1;
	const ordenadas = [...pasan].sort((a, b) => {
		const izquierda = clave(a);
		const derecha = clave(b);
		if (izquierda === derecha) return a.name.localeCompare(b.name, 'es');
		return (izquierda > derecha ? 1 : -1) * vuelta;
	});

	const paginas = Math.max(1, Math.ceil(ordenadas.length / SYSTEMS_PER_PAGE));
	const pagina = Math.min(query.page, paginas);
	const desde = (pagina - 1) * SYSTEMS_PER_PAGE;

	return {
		systems: ordenadas.slice(desde, desde + SYSTEMS_PER_PAGE),
		options: buildOptions(db),
		totalBodies: cuerpos.length,
		totalGates: puertas.length,
		totalLoose: puertas.filter((una) => una.destinationId === null).length,
		map: buildMapa(db, sistemas, filas),
		matches: pasan.map((fila) => fila.code),
		query: { ...query, page: pagina },
		total: filas.length,
		found: pasan.length,
		pages: paginas
	};
}

/** Un cuerpo en su lugar del árbol, antes de saber qué guías le tocan. */
interface Nodo {
	readonly body: Body;
	readonly depth: number;
	readonly isLast: boolean;
	readonly hasChildren: boolean;
}

/**
 * Aplana los cuerpos de un sistema en preorden.
 *
 * Los hermanos se ordenan por distancia orbital: es el orden en que se ven en el
 * sistema, y el que hace que «Ánfora IV» esté después de «Ánfora II» sin que
 * nadie lo declare.
 *
 * **Las guías no se calculan acá.** Las pone `railsFor`, que es el mismo cálculo
 * que usa la vista del juego: tenerlo dos veces ya salió mal una vez.
 */
function ordenar(
	todos: readonly Body[],
	parentId: number | null,
	depth: number,
	salida: Nodo[]
): void {
	const hermanos = todos
		.filter((uno) => uno.parentId === parentId)
		.sort((a, b) => a.orbitDistance - b.orbitDistance || a.name.localeCompare(b.name));

	hermanos.forEach((fila, indice) => {
		salida.push({
			body: fila,
			depth,
			isLast: indice === hermanos.length - 1,
			hasChildren: todos.some((uno) => uno.parentId === fila.id)
		});
		ordenar(todos, fila.id, depth + 1, salida);
	});
}

/** El sistema abierto en el constructor, con todo lo que se le puede tocar. */
export function buildConstructor(db: Db, code: string): Constructor | null {
	const fila = db.select().from(system).where(eq(system.code, code)).get();
	if (!fila) return null;

	const suConstelacion = db
		.select()
		.from(constellation)
		.where(eq(constellation.id, fila.constellationId))
		.get();
	const suRegion = suConstelacion
		? db.select().from(region).where(eq(region.id, suConstelacion.regionId)).get()
		: undefined;

	const cuerpos = bodiesOf(db, fila.id);
	const ordenados: Nodo[] = [];
	ordenar(cuerpos, null, 0, ordenados);
	const guias = railsFor(ordenados);

	// Las tres consultas que resuelven lo que cuelga de un cuerpo, de una vez:
	// preguntarlas por fila sería un N+1 en la pantalla que más filas dibuja.
	const estaciones = new Map(
		db
			.select()
			.from(station)
			.all()
			.map((una) => [una.bodyId, una])
	);
	const corporaciones = new Map(
		db
			.select()
			.from(corporation)
			.all()
			.map((una) => [una.id, una])
	);
	const modulos = new Map<number, string[]>();
	for (const una of db.select().from(stationService).all()) {
		modulos.set(una.stationId, [...(modulos.get(una.stationId) ?? []), serviceLabel(una.service)]);
	}
	const minerales = new Map<number, FilaMineral[]>();
	for (const una of db.select().from(beltDeposit).all()) {
		const ore = ORE_LIST.find((uno) => uno.code === una.oreCode);
		minerales.set(una.bodyId, [
			...(minerales.get(una.bodyId) ?? []),
			{
				ore: una.oreCode,
				name: ore?.name ?? una.oreCode,
				capacity: una.capacity,
				remaining: una.remaining,
				regenPerHour: una.regenPerHour
			}
		]);
	}

	const puertas = new Map(
		db
			.select()
			.from(gate)
			.where(eq(gate.systemId, fila.id))
			.all()
			.map((una) => [una.bodyId, una])
	);
	const porId = new Map(
		db
			.select()
			.from(body)
			.all()
			.map((uno) => [uno.id, uno])
	);
	const sistemasPorId = new Map(
		db
			.select()
			.from(system)
			.all()
			.map((uno) => [uno.id, uno])
	);

	/** La ficha de una puerta, con adónde lleva ya resuelto. */
	function puertaDe(bodyId: number, name: string): FilaPuerta | null {
		const una = puertas.get(bodyId);
		if (!una) return null;

		const destino = una.destinationId === null ? null : (porId.get(una.destinationId) ?? null);
		return {
			gateId: una.id,
			bodyId,
			name,
			bearing: una.bearing,
			bearingLabel: bearingLabel(una.bearing),
			angle: bearingAngle(una.bearing),
			destination: destino?.name ?? '',
			destinationSystem: destino ? (sistemasPorId.get(destino.systemId)?.name ?? '') : '',
			jumpDistance: una.jumpDistance,
			closed: una.closed
		};
	}

	const bodies: FilaConstruccion[] = ordenados.map((nodo, indice) => {
		const suEstacion = estaciones.get(nodo.body.id);
		const suCorporacion = suEstacion ? corporaciones.get(suEstacion.corporationId) : undefined;

		return {
			id: nodo.body.id,
			code: nodo.body.code,
			name: nodo.body.name,
			kind: nodo.body.kind,
			kindLabel: bodyKindLabel(nodo.body.kind),
			icon: bodyKindIcon(nodo.body.kind),
			depth: nodo.depth,
			rails: guias[indice],
			isLast: nodo.isLast,
			hasChildren: nodo.hasChildren,
			parentId: nodo.body.parentId,
			orbitDistance: nodo.body.orbitDistance,
			explored: nodo.body.explored,
			description: nodo.body.description,
			accepts: accepts(nodo.body.kind),
			blockers: bodyBlockers(db, nodo.body.id),
			corporation: suCorporacion?.name ?? '',
			services: suEstacion ? (modulos.get(suEstacion.id) ?? []) : [],
			ores: minerales.get(nodo.body.id) ?? [],
			gate: puertaDe(nodo.body.id, nodo.body.name)
		};
	});

	const gates = bodies
		.map((uno) => uno.gate)
		.filter((una): una is FilaPuerta => una !== null)
		.sort((a, b) => a.angle - b.angle);

	const ocupados = new Set(gates.map((una) => una.bearing as GateBearing));

	return {
		id: fila.id,
		code: fila.code,
		name: fila.name,
		description: fila.description,
		constellationId: fila.constellationId,
		constellation: suConstelacion?.name ?? '',
		region: suRegion?.name ?? '',
		government: fila.government,
		governmentLabel: governmentLabel(fila.government),
		security: fila.security,
		securityLevel: securityLabel(securityLevel(fila.security)),
		controllingFaction: fila.controllingFaction,
		controlledBy: factionLabel(fila.controllingFaction),
		capitalOf: fila.capitalOf,
		x: fila.x,
		y: fila.y,
		z: fila.z,
		bodies,
		rootKinds: ROOT_KINDS,
		gates,
		bearings: GATE_BEARINGS.map((bearing) => ({
			value: bearing,
			label: bearingLabel(bearing),
			angle: bearingAngle(bearing),
			taken: ocupados.has(bearing)
		})),

		// Las de otros sistemas: enlazar dos del mismo no tendría sentido, y
		// ofrecerlas sería ofrecer un error.
		loose: looseGates(db)
			.filter((una) => una.system.id !== fila.id)
			.map((una) => ({
				gateId: una.gate.id,
				label: `${una.system.name} · ${una.body.name} (${bearingLabel(una.gate.bearing)})`
			})),

		blockers: systemBlockers(db, fila.id),
		options: buildOptions(db)
	};
}
