/**
 * Lo que la pestaña Ubicación necesita saber del lugar donde está el piloto.
 *
 * Igual que el constructor de la ficha del piloto: recibe lo que hay en la base
 * y devuelve lo que la pantalla dibuja. Las tres piezas —el mosaico, los agentes
 * y la ficha— se arman por separado para poder probarlas por separado.
 */

import { eq } from 'drizzle-orm';
import { body, gate, system as systemTable, type Body, type Pilot } from '../db/schema';
import { railsFor } from '$lib/tree';
import type { Db } from '../db/types';
import { portraitFor } from '../portraits';
import { currentAction } from '../services/actions';
import { beltDeposits, miningPlan } from '../services/mining';
import { asteroidsAt } from '../services/asteroids';
import { surveyPlan, surveysOf } from '../services/prospecting';
import { activeShip, shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { depthLabel, surveyAge } from '$lib/game/prospecting';
import {
	bodyDetail,
	bodyDistance,
	getBodyById,
	systemOverview,
	systemTree,
	type AgentInfo,
	type SystemNode
} from '../services/universe';
import { JUMP_KIND, REFERENCE_SPEED, travelDurationSeconds } from '$lib/game/actions';
import { FACTIONS } from '$lib/game/factions';
import { baseValueOf, getOre } from '$lib/game/items';
import { roundHalfEven } from '$lib/game/math';
import { jumpFuel, jumpProblem, jumpSeconds, lightYears } from '$lib/game/jumps';
import { MIN_REPUTATION, canBeHired, requiredReputation } from '$lib/game/reputation';
import { SERVICES, securityLevel, type StationServiceKind } from '$lib/game/universe';
import {
	actionIcon,
	actionLabel,
	bodyKindIcon,
	bodyKindLabel,
	corporationKindLabel,
	cubicMeters,
	explorationIcon,
	explorationLabel,
	governmentLabel,
	itemIcon,
	missionKindIcon,
	missionKindLabel,
	remainingLabel,
	roman,
	securityLabel,
	serviceIcon,
	serviceLabel,
	thousands
} from '$lib/format';
import type {
	PuntaTramo,
	SalidaPuerta,
	Tramo,
	BaldosaModulo,
	FilaAgente,
	FilaCuerpo,
	CampoRocas,
	Roca,
	Sistema,
	Ubicacion
} from '$lib/tipos';

/**
 * La reputación del piloto con cada facción todavía no se guarda: la escriben
 * las misiones, que llegan en F9. Hasta entonces todos empiezan de cero, y la
 * pantalla muestra qué agentes se abren con eso y cuáles no.
 */
export const PILOT_REPUTATION = MIN_REPUTATION;

/** Nombre de la facción dueña, o el rótulo de las que no tienen bandera. */
function factionName(code: string): string {
	return FACTIONS[code as keyof typeof FACTIONS]?.name ?? 'Sin bandera';
}

/**
 * Los ocho módulos posibles, marcando cuáles tiene esta estación.
 *
 * Se muestran también los que faltan: es lo que deja leer de un vistazo qué
 * clase de estación es ésta.
 */
export function buildModuleTiles(
	services: readonly StationServiceKind[]
): readonly BaldosaModulo[] {
	const instalados = new Set(services);
	return Object.entries(SERVICES).map(([code, spec]) => ({
		code,
		name: spec.name,
		icon: serviceIcon(code as StationServiceKind),
		summary: spec.summary,
		available: instalados.has(code as StationServiceKind)
	}));
}

/**
 * Los agentes de la estación, con lo que hace falta para que atiendan.
 *
 * Los que todavía no atienden también salen: son la escalera que el piloto tiene
 * por delante, y esconderlos sería más prolijo y mucho peor.
 */
export function buildAgentRows(
	agents: readonly AgentInfo[],
	reputation: number = PILOT_REPUTATION
): readonly FilaAgente[] {
	return agents.map(({ agent, corporation }) => {
		const faction = corporation.faction;
		const name = faction ? factionName(faction) : 'Sin bandera';
		const needed = requiredReputation(agent.level, faction);
		return {
			code: agent.code,
			name: agent.name,
			corporation: corporation.name,
			faction: name,
			kind: missionKindLabel(agent.missionKind),
			kindIcon: missionKindIcon(agent.missionKind),
			portrait: portraitFor(agent.code, agent.appearance),
			level: roman(agent.level),
			description: agent.description,
			open: canBeHired(agent.level, faction, reputation),
			requirement: `Requiere ${needed} de reputación con ${name}`
		};
	});
}

/**
 * Una punta del tramo, con el sistema donde está.
 *
 * El sistema viaja en las dos puntas porque en un salto son distintos, y ésa es
 * toda la gracia del salto. Va con bandera, gobierno y ley porque mientras la
 * nave está en camino **no hay ninguna otra pantalla que lo diga**: la ficha del
 * lugar se apaga en tránsito, y justo ahí es cuando uno quiere saber a qué está
 * entrando.
 */
function punta(db: Db, cuerpo: Body | null): PuntaTramo {
	if (!cuerpo) {
		return {
			name: '',
			kindLabel: '',
			icon: 'map-pin',
			system: '',
			faction: '',
			security: '',
			government: ''
		};
	}

	const suyo = db.select().from(systemTable).where(eq(systemTable.id, cuerpo.systemId)).get();

	return {
		name: cuerpo.name,
		kindLabel: bodyKindLabel(cuerpo.kind),
		icon: bodyKindIcon(cuerpo.kind),
		system: suyo?.name ?? '',
		faction: suyo
			? suyo.controllingFaction
				? factionName(suyo.controllingFaction)
				: 'Sin bandera'
			: '',
		security: suyo ? `${securityLabel(securityLevel(suyo.security))} ${suyo.security}` : '',
		government: suyo ? governmentLabel(suyo.government) : ''
	};
}

/**
 * Lo que muestra la pestaña mientras la nave está en camino.
 *
 * **Dice de dónde a dónde y cuánto falta.** No puede decir dónde está —no está en
 * ningún lado— pero un cartel que sólo dice «esperá» es una pantalla que no sirve
 * para nada, y el viaje es justo el momento en que uno la mira para ver cuánto
 * queda.
 */
function transit(db: Db, row: Pilot): Ubicacion {
	const orden = currentAction(db, row.id);
	const origen = orden?.originBodyId ? getBodyById(db, orden.originBodyId) : null;
	const destino = orden?.destinationBodyId ? getBodyById(db, orden.destinationBodyId) : null;

	// La distancia y el combustible sólo existen si esto es un salto: un viaje
	// dentro del sistema no quema nada y su distancia ya la dice el árbol. Se
	// vuelven a calcular acá en vez de guardarse en la orden porque `resolveJump`
	// también los recalcula al llegar, y dos cuentas que tienen que dar lo mismo
	// es mejor que dos números que pueden desfasarse.
	const puerta =
		orden?.kind === JUMP_KIND && origen
			? db.select().from(gate).where(eq(gate.bodyId, origen.id)).get()
			: undefined;
	const readout = puerta ? shipReadout(db, row) : null;

	const leg: Tramo | null = orden
		? {
				kind: orden.kind,
				kindLabel: actionLabel(orden.kind),
				icon: actionIcon(orden.kind),
				origin: punta(db, origen),
				destination: punta(db, destino),
				startedAt: orden.startedAt.getTime(),
				durationSeconds: orden.durationSeconds,
				duration: remainingLabel(orden.durationSeconds),
				distance: puerta ? lightYears(puerta.jumpDistance) : '',
				fuel: puerta && readout ? `${jumpFuel(puerta.jumpDistance, readout.mass)} u` : ''
			}
		: null;

	return {
		name: destino ? `Rumbo a ${destino.name}` : 'En tránsito',
		kind: leg?.kindLabel ?? 'Viaje',
		icon: leg?.icon ?? 'rocket-launch',
		description:
			'La nave está en camino. Cuando llegue vas a poder atracar, ' +
			'reconfigurarla y volver a dar órdenes.',
		parent: '',
		system: '',
		distance: '',
		exploration: '',
		isStation: false,
		inTransit: true,
		corporation: '',
		corporationKind: '',
		owner: '',
		modules: [],
		moduleCount: '',
		agents: [],
		agentCount: '',
		field: SIN_CAMPO,
		asteroids: [],
		gate: null,
		leg
	};
}

/**
 * Lo que muestra la pestaña cuando el piloto no está parado en ningún lado.
 *
 * Ya no se arma copiando la de tránsito: aquélla pasó a leer la orden en curso, y
 * acá no hay ninguna. Son dos vacíos distintos —ir en camino y no estar en
 * ningún lado— y uno no puede definirse como el otro.
 */
function nowhere(): Ubicacion {
	return {
		name: 'Sin ubicación',
		kind: '',
		icon: 'map-pin',
		description:
			'No hay un cuerpo asignado a este piloto. Puede que la base no tenga universo cargado.',
		parent: '',
		system: '',
		distance: '',
		exploration: '',
		isStation: false,
		inTransit: false,
		corporation: '',
		corporationKind: '',
		owner: '',
		modules: [],
		moduleCount: '',
		agents: [],
		agentCount: '',
		field: SIN_CAMPO,
		asteroids: [],
		gate: null,
		leg: null
	};
}

/**
 * Todo lo que la pestaña Ubicación necesita, en una sola pasada.
 *
 * Si el piloto va en camino la pestaña **no describe la estación que ya dejó
 * atrás**: describe el viaje. Mostrar el origen como si se estuviera ahí es la
 * clase de mentira que hace dudar de todo lo demás.
 */
export function buildLocationView(db: Db, row: Pilot): Ubicacion {
	const ahora = situation(db, row);
	// **Sólo viajar esconde el lugar.** Minar ocurre en el cinturón donde estás:
	// tapar la pantalla mientras trabajás sería decir que no estás en ningún lado,
	// que es falso. Lo que sí corresponde es apagar las acciones, y de eso se
	// encarga el motivo de bloqueo que viaja con cada veta.
	if (ahora.inTransit) return transit(db, row);

	const place = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const detail = place ? bodyDetail(db, place.code) : null;
	if (detail === null) return nowhere();

	// El mosaico y los agentes son de la estación: en un cinturón o una luna no
	// hay ninguno de los dos, y armarlos sería mandarle al navegador ocho
	// baldosas apagadas que la pantalla no va a dibujar.
	const isStation = detail.station !== null;
	// Las rocas son del cinturón: en cualquier otro cuerpo no hay ninguna, y
	// armarlas sería consultar la base para mandar una lista vacía.
	const cinturon =
		detail.body.kind === 'belt'
			? buildBelt(db, row, ahora.orderBlocked)
			: { field: SIN_CAMPO, asteroids: [] };
	const agents = isStation ? buildAgentRows(detail.agents) : [];
	const abiertos = agents.filter((agent) => agent.open).length;

	return {
		name: detail.body.name,
		kind: bodyKindLabel(detail.body.kind),
		icon: bodyKindIcon(detail.body.kind),
		description: detail.body.description,
		parent: detail.parent?.name ?? '',
		system: detail.system.name,
		distance: detail.body.orbitDistance ? `${detail.body.orbitDistance} ud` : '',
		exploration: explorationLabel(detail.body.explored),
		isStation,
		inTransit: false,
		corporation: detail.corporation?.name ?? '',
		corporationKind: detail.corporation ? corporationKindLabel(detail.corporation.kind) : '',
		owner: detail.corporation ? factionName(detail.corporation.faction) : '',
		modules: isStation ? buildModuleTiles(detail.services) : [],
		moduleCount: isStation ? `${detail.services.length} de ${Object.keys(SERVICES).length}` : '',
		agents,
		agentCount: isStation ? `${abiertos} de ${agents.length}` : '',
		field: cinturon.field,
		asteroids: cinturon.asteroids,
		gate: buildSalida(db, row, detail.body),
		leg: null
	};
}

/** Un campo apagado: acá no hay rocas ni nada que escanear. */
const SIN_CAMPO: CampoRocas = {
	scannable: false,
	count: '',
	depthLabel: '',
	duration: '',
	regen: '',
	blocked: ''
};

/**
 * Aplana el árbol en filas.
 *
 * Las guías las calcula `railsFor`, que es el mismo cálculo que usa el
 * constructor del universo: vive aparte porque es de los que se re-deducen mal.
 *
 * De paso, cada fila que no sea la del piloto lleva **su distancia desde donde
 * está el piloto** y cuánto tardaría llegar. La distancia al cuerpo que se
 * orbita no sirve para decidir nada: lo que un piloto necesita saber es cuán
 * lejos está *de él*, y ese número es además el que explica el tiempo de viaje
 * que ve al lado.
 */
export function buildBodyRows(
	db: Db,
	nodes: readonly SystemNode[],
	here: string,
	originId: number | null,
	speed: number
): readonly FilaCuerpo[] {
	const filas: FilaCuerpo[] = [];
	const guias = railsFor(nodes);

	for (const [indice, node] of nodes.entries()) {
		const esAqui = node.body.code === here;

		let distance = '';
		let travelLabel = '';
		if (!esAqui && originId !== null) {
			const unidades = bodyDistance(db, originId, node.body.id);
			distance = `${thousands(unidades)} ud`;
			travelLabel = `${travelDurationSeconds(unidades, speed)}s`;
		}

		filas.push({
			code: node.body.code,
			name: node.body.name,
			kind: bodyKindLabel(node.body.kind),
			icon: bodyKindIcon(node.body.kind),
			depth: node.depth,
			rails: guias[indice],
			isLast: node.isLast,
			hasChildren: node.hasChildren,
			explored: node.body.explored,
			exploration: explorationLabel(node.body.explored),
			explorationIcon: explorationIcon(node.body.explored),
			distance,
			travelLabel,
			description: node.body.description,
			isStation: node.station !== null,
			corporation: node.corporation?.name ?? '',
			corporationKind: node.corporation ? corporationKindLabel(node.corporation.kind) : '',
			owner: node.corporation ? factionName(node.corporation.faction) : '',
			services: node.services.map(serviceLabel).sort(),
			isHere: esAqui
		});
	}

	return filas;
}

/**
 * Lo que hay del otro lado de una puerta, y qué cuesta cruzarla.
 *
 * **Todo se calcula antes de apretar.** Un salto que se cobra después de
 * ordenarlo es un salto que nadie puede planear, y planear es la mitad de lo que
 * se hace en un juego de naves. El motivo por el que no se puede sale de
 * `jumpProblem`, que es puro y lo comparte el servicio: el botón apagado y el
 * rechazo del servidor dicen exactamente lo mismo.
 */
function buildSalida(db: Db, row: Pilot, cuerpo: Body): SalidaPuerta | null {
	if (cuerpo.kind !== 'gate') return null;

	const puerta = db.select().from(gate).where(eq(gate.bodyId, cuerpo.id)).get();
	if (!puerta) return null;

	const gemela = puerta.destinationId === null ? null : getBodyById(db, puerta.destinationId);
	const suSistema = gemela
		? db.select().from(systemTable).where(eq(systemTable.id, gemela.systemId)).get()
		: null;

	const readout = shipReadout(db, row);
	const nave = activeShip(db, row.id);

	const tenths = gemela ? puerta.jumpDistance : null;
	const alcance = readout?.jumpRange ?? 0;
	const masa = readout?.mass ?? 0;
	const tanque = nave?.fuel ?? 0;

	const problema =
		readout === null || nave === null
			? 'Necesitás una nave para saltar.'
			: jumpProblem(
					{ jumpRange: alcance, mass: masa, fuel: tanque, flyable: readout.flyable },
					tenths
				);

	// El costo y el tiempo se muestran **aunque no se pueda cruzar**: saber que
	// faltan doce de combustible es lo que dice qué hacer, y un panel en blanco
	// con un "no podés" no dice nada.
	const segundos = tenths !== null && alcance > 0 ? jumpSeconds(tenths, alcance) : 0;

	return {
		destination: suSistema?.name ?? '',
		arrival: gemela?.name ?? '',
		distance: tenths === null ? '' : lightYears(tenths),
		seconds: segundos,
		duration: segundos > 0 ? remainingLabel(segundos) : '',
		fuel: tenths === null ? 0 : jumpFuel(tenths, masa),
		fuelInTank: tanque,
		range: lightYears(alcance),
		blocked: problema ?? ''
	};
}

/** Lo que muestra la pestaña Sistema cuando no hay universo sembrado. */
function uncharted(): Sistema {
	return {
		name: 'Sin cartografiar',
		description: 'La base no tiene universo cargado. Corré `npm run db:seed` para sembrarlo.',
		region: '',
		constellation: '',
		controlledBy: '',
		government: '',
		security: '',
		coordinates: '',
		bodyCount: '',
		stationCount: '',
		exploredCount: '',
		bodies: [],
		hasShip: false,
		actionInProgress: false
	};
}

/**
 * Las rocas del cinturón, cada una con lo que el piloto sabe de ella.
 *
 * Una roca sin lectura vigente sale **sin identificar**: se ve el bulto pero no
 * de qué es ni cuánto tiene. Eso es lo que le da trabajo al escáner, y lo que
 * convierte llegar a un cinturón desconocido en algo que hacer en vez de una
 * lista que ya venía escrita.
 *
 * Cada roca identificada trae ya resuelto **cuánto traería y cuánto tardaría con
 * esta nave y esta bodega**, y no sólo cuánto queda en la piedra: "quedan 4.800
 * unidades" no dice nada; "traés 225 y tardás 38 minutos" dice si vale la pena.
 */
function buildBelt(
	db: Db,
	row: Pilot,
	orderBlocked: string
): { field: CampoRocas; asteroids: readonly Roca[] } {
	const plan = surveyPlan(db, row);
	const rocas = asteroidsAt(db, row.locationId);
	const lecturas = surveysOf(
		db,
		row.id,
		rocas.map((roca) => roca.id)
	);

	const asteroids = rocas
		.map((roca) => {
			const lectura = lecturas.get(roca.id) ?? null;
			const edad = lectura ? surveyAge(lectura.takenAt.getTime()) : null;
			const identificada = edad !== null && !edad.stale;
			const ore = getOre(roca.oreCode);
			// Qué tan fina fue la lectura decide qué se ve. Una superficial dice de qué
			// es la roca, no cuánto tiene.
			const conCantidad = identificada && (lectura?.depth ?? 0) >= 1;
			const orden = identificada ? miningPlan(db, row, roca.id) : null;

			return {
				id: roca.id,
				identified: identificada,
				// Sin lectura vigente no se dice de qué es: ése es el punto del escáner.
				name: identificada ? ore.name : 'Roca sin identificar',
				icon: identificada ? itemIcon(ore) : ('circles-three' as const),
				description: identificada
					? ore.description
					: 'Un bulto en el radar. Habría que apuntarle el escáner.',
				remaining: conCantidad ? thousands(roca.units) : '',
				// Contra lo que traía al aparecer: es lo que dice cuán picada está.
				share:
					conCantidad && roca.initialUnits > 0
						? Math.min(100, roundHalfEven((roca.units * 100) / roca.initialUnits))
						: 0,
				units: orden?.units ?? 0,
				volume: orden ? cubicMeters(orden.units * ore.volumeTenths) : '',
				value: orden ? thousands(baseValueOf(ore.code, orden.units)) : '',
				duration: orden ? remainingLabel(orden.durationSeconds) : '',
				// Una lectura vieja no se esconde: se muestra con su antigüedad, y el
				// piloto decide si le alcanza para volver a mirarla.
				age: edad === null ? '' : edad.hours < 1 ? 'recién' : `hace ${edad.hours} h`,
				stale: edad !== null && edad.stale,
				// El motivo de más arriba gana: con una orden en curso da igual que la
				// bodega esté vacía, y "ya hay una orden" es lo que el jugador necesita
				// leer para saber qué hacer.
				blocked: identificada
					? orderBlocked || orden?.blocked || ''
					: 'Escaneala antes de picarla: no sabés qué tiene.',
				scanBlocked: orderBlocked || plan.blocked
			};
		})
		// Lo identificado primero y lo más grande arriba: es el orden en que uno
		// elige a cuál apuntarle el láser.
		.sort((a, b) => Number(b.identified) - Number(a.identified) || b.units - a.units);

	const identificadas = asteroids.filter((roca) => roca.identified).length;
	// El ritmo de reposición es del cinturón, no de una piedra: se aprende mirando
	// cualquiera de sus rocas con una lectura completa, y se dice una sola vez.
	const completa = [...lecturas.values()].some(
		(fila) => fila.depth >= 2 && !surveyAge(fila.takenAt.getTime()).stale
	);
	const ritmo = completa
		? beltDeposits(db, row.locationId).reduce((suma, plano) => suma + plano.regenPerHour, 0)
		: 0;

	return {
		field: {
			scannable: true,
			count: `${identificadas} de ${rocas.length} identificadas`,
			depthLabel: depthLabel(plan.depth),
			duration: remainingLabel(plan.durationSeconds),
			regen: ritmo > 0 ? `${thousands(ritmo)} u/h` : '',
			blocked: orderBlocked || plan.blocked
		},
		asteroids
	};
}

/**
 * El sistema actual y todos sus cuerpos, en una sola pasada.
 *
 * La velocidad sale de la hoja de rendimiento de su nave, que ya trae adentro el
 * bono de Navegación y el del casco: la duración que se muestra en cada fila es
 * exactamente la que se va a cobrar.
 */
export function buildSystemView(db: Db, row: Pilot): Sistema {
	// **El sistema sale de dónde está parado el piloto**, no de una constante.
	// Con un sistema fijo, el día que alguien esté en otro, el árbol se dibuja con
	// los cuerpos del sistema equivocado y el cálculo de distancia no encuentra
	// ancestro común: la pantalla revienta y el piloto queda encerrado sin forma
	// de volver.
	const here = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const donde = here
		? db.select().from(systemTable).where(eq(systemTable.id, here.systemId)).get()
		: undefined;

	const overview = donde ? systemOverview(db, donde.code) : null;
	// Sin universo sembrado no hay nada que dibujar, y decirlo es mejor que
	// mostrar una pantalla vacía sin explicación.
	if (overview === null) return uncharted();

	const system = overview.system;
	const readout = shipReadout(db, row);

	return {
		name: system.name,
		description: system.description,
		region: overview.region.name,
		constellation: overview.constellation.name,
		controlledBy: system.controllingFaction
			? factionName(system.controllingFaction)
			: 'Espacio libre',
		government: governmentLabel(system.government),
		// El cajón y el número: «Alta» se lee de un vistazo y el 78 dice cuánto.
		security: `${securityLabel(overview.securityLevel)} · ${overview.security}`,
		coordinates: `${system.x} · ${system.y} · ${system.z}`,
		bodyCount: String(overview.bodyCount),
		stationCount: String(overview.stationCount),
		exploredCount: `${overview.exploredCount} de ${overview.bodyCount}`,
		bodies: buildBodyRows(
			db,
			systemTree(db, system.code),
			here?.code ?? '',
			row.locationId,
			readout?.speed ?? REFERENCE_SPEED
		),
		hasShip: activeShip(db, row.id) !== null,
		actionInProgress: currentAction(db, row.id) !== null
	};
}
