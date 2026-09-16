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
	type Body
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
	securityBand,
	securityLevel,
	type BodyKind,
	type GateBearing,
	type Government
} from '$lib/game/universe';
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
	Constructor,
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

		// La estrella no está: se crea con el sistema y no se agrega a mano.
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

/** El listado de sistemas, con lo que hace falta para elegir cuál abrir. */
export function buildUniverso(db: Db): Universo {
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

	return {
		systems: filas,
		options: buildOptions(db),
		totalBodies: cuerpos.length,
		totalGates: puertas.length,
		totalLoose: puertas.filter((una) => una.destinationId === null).length
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
			jumpDistance: una.jumpDistance
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
