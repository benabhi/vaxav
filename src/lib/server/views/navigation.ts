/**
 * Lo que la pestaña Ubicación necesita saber del lugar donde está el piloto.
 *
 * Igual que el constructor de la ficha del piloto: recibe lo que hay en la base
 * y devuelve lo que la pantalla dibuja. Las tres piezas —el mosaico, los agentes
 * y la ficha— se arman por separado para poder probarlas por separado.
 */

import { eq } from 'drizzle-orm';
import { body, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { portraitFor } from '../portraits';
import { currentAction } from '../services/actions';
import { activeShip, shipReadout } from '../services/ships';
import { situation } from '../services/status';
import {
	bodyDetail,
	bodyDistance,
	systemOverview,
	systemTree,
	type AgentInfo,
	type SystemNode
} from '../services/universe';
import { REFERENCE_SPEED, travelDurationSeconds } from '$lib/game/actions';
import { FACTIONS } from '$lib/game/factions';
import { MIN_REPUTATION, canBeHired, requiredReputation } from '$lib/game/reputation';
import { SERVICES, type StationServiceKind } from '$lib/game/universe';
import {
	bodyKindIcon,
	bodyKindLabel,
	corporationKindLabel,
	explorationIcon,
	explorationLabel,
	governmentLabel,
	missionKindIcon,
	missionKindLabel,
	roman,
	securityLabel,
	serviceIcon,
	serviceLabel,
	thousands
} from '$lib/format';
import type { BaldosaModulo, FilaAgente, FilaCuerpo, Sistema, Ubicacion } from '$lib/tipos';

/**
 * Mientras Ánfora sea el único sistema, es el que se muestra. Cuando el piloto
 * pueda moverse entre sistemas, saldrá de dónde esté parado.
 */
const DEFAULT_SYSTEM = 'anfora';

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
		phase: spec.phase,
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

/** Lo que muestra la pestaña mientras la nave está en camino. */
function transit(): Ubicacion {
	return {
		name: 'En tránsito',
		kind: 'Viaje',
		icon: 'rocket-launch',
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
		agentCount: ''
	};
}

/** Lo que muestra la pestaña cuando el piloto no está parado en ningún lado. */
function nowhere(): Ubicacion {
	return {
		...transit(),
		name: 'Sin ubicación',
		kind: '',
		icon: 'map-pin',
		description:
			'No hay un cuerpo asignado a este piloto. Puede que la base no tenga universo cargado.',
		inTransit: false
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
	if (situation(db, row).inTransit) return transit();

	const place = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const detail = place ? bodyDetail(db, place.code) : null;
	if (detail === null) return nowhere();

	// El mosaico y los agentes son de la estación: en un cinturón o una luna no
	// hay ninguno de los dos, y armarlos sería mandarle al navegador ocho
	// baldosas apagadas que la pantalla no va a dibujar.
	const isStation = detail.station !== null;
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
		agentCount: isStation ? `${abiertos} de ${agents.length}` : ''
	};
}

/**
 * Aplana el árbol en filas, calculando las guías de cada una.
 *
 * Las guías se llevan en una pila mientras se baja: al llegar a un nodo se
 * recorta a su profundidad —lo que sobra son ramas ya cerradas— y queda una
 * marca por ancestro, que dice si la línea de ese ancestro sigue bajando. Es la
 * forma barata de dibujar un árbol con una lista plana.
 *
 * La columna `k` es la de los codos de los nodos de profundidad `k+1`, así que
 * la marca que va ahí es la del ancestro de profundidad `k+1`: de ahí el
 * corrimiento de uno. Se descarta la primera, la de la estrella, que no tiene
 * hermanos ni columna donde caer.
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
	const sigue: boolean[] = [];

	for (const node of nodes) {
		sigue.length = node.depth;
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
			rails: sigue.slice(1),
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

		// Para los hijos: la línea de este nodo sigue si le quedan hermanos.
		sigue.push(!node.isLast);
	}

	return filas;
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
 * El sistema actual y todos sus cuerpos, en una sola pasada.
 *
 * La velocidad sale de la hoja de rendimiento de su nave, que ya trae adentro el
 * bono de Navegación y el del casco: la duración que se muestra en cada fila es
 * exactamente la que se va a cobrar.
 */
export function buildSystemView(db: Db, row: Pilot): Sistema {
	const overview = systemOverview(db, DEFAULT_SYSTEM);
	// Sin universo sembrado no hay nada que dibujar, y decirlo es mejor que
	// mostrar una pantalla vacía sin explicación.
	if (overview === null) return uncharted();

	const system = overview.system;
	const here = db.select().from(body).where(eq(body.id, row.locationId)).get();
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
		security: securityLabel(overview.security),
		coordinates: `${system.x} · ${system.y} · ${system.z}`,
		bodyCount: String(overview.bodyCount),
		stationCount: String(overview.stationCount),
		exploredCount: `${overview.exploredCount} de ${overview.bodyCount}`,
		bodies: buildBodyRows(
			db,
			systemTree(db, DEFAULT_SYSTEM),
			here?.code ?? '',
			row.locationId,
			readout?.speed ?? REFERENCE_SPEED
		),
		hasShip: activeShip(db, row.id) !== null,
		actionInProgress: currentAction(db, row.id) !== null
	};
}
