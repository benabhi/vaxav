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
import { bodyDetail, type AgentInfo } from '../services/universe';
import { situation } from '../services/status';
import { FACTIONS } from '$lib/game/factions';
import { MIN_REPUTATION, canBeHired, requiredReputation } from '$lib/game/reputation';
import { SERVICES, type StationServiceKind } from '$lib/game/universe';
import {
	bodyKindIcon,
	bodyKindLabel,
	corporationKindLabel,
	explorationLabel,
	missionKindIcon,
	missionKindLabel,
	roman,
	serviceIcon
} from '$lib/format';
import type { BaldosaModulo, FilaAgente, Ubicacion } from '$lib/tipos';

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
