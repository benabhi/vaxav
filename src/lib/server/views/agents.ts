/**
 * Los agentes de la corporación del piloto: quiénes reparten trabajo.
 *
 * Vive aparte de `corporation.ts` por lo mismo que los miembros: **es otra
 * consulta y otra pantalla**. La ficha describe a la corporación y esto lista
 * gente que crece por su cuenta —una corporación grande puede tener un agente por
 * estación—, así que nace con recorte, orden y paginado.
 *
 * Y va aparte de los miembros aunque los dos listen gente, porque **las preguntas
 * son distintas**: a los miembros se les pregunta «¿quién más vuela acá?» y a los
 * agentes «¿a quién le puedo pedir trabajo?». Las columnas no se parecen —nivel,
 * clase de misión, estación y si te atiende contra oficio y antigüedad— y los
 * filtros tampoco. Un interruptor adentro de una sola tabla sería dos tablas
 * peleando por un archivo.
 *
 * Es además **la pantalla donde la reputación se cobra**: lo que se ganó con la
 * corporación se lee acá, en quién pasa a atender.
 *
 * Corresponde a docs/systems/CORPORATIONS.md y docs/systems/MISSIONS.md.
 */

import { asc, eq } from 'drizzle-orm';
import { agent, body, corporation, station, system as systemTable, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { MISSION_KINDS, type MissionKind } from '$lib/game/agents';
import { FACTIONS } from '$lib/game/factions';
import { canBeHired, requiredReputation } from '$lib/game/reputation';
import { missionKindIcon, missionKindLabel, roman } from '$lib/format';
import { pilotStandings } from '../services/reputation';
import { readListing, paginate, sift, type Ordenes } from './listing';
import type { AgentesCorporacion, ConsultaAgentes, FilaAgenteCorporacion } from '$lib/tipos';

/** Cuántos agentes entran en una página. El mismo número que el resto del juego. */
export const AGENTS_PER_PAGE = 25;

/**
 * Por qué columnas se puede ordenar.
 *
 * Una columna que no está acá no se ofrece como ordenable en la pantalla, así que
 * es imposible prometer un orden que el servidor no sabe hacer.
 */
export const AGENT_SORTS: Ordenes<FilaAgenteCorporacion> = {
	nombre: (fila) => fila.name.toLocaleLowerCase('es'),
	nivel: (fila) => fila.levelValue,
	clase: (fila) => fila.kind.toLocaleLowerCase('es'),
	estacion: (fila) => fila.station.toLocaleLowerCase('es')
};

/**
 * Los filtros, cada uno con su pregunta. Se apilan: entra quien pasa todos.
 *
 * El de «sólo los que me atienden» es el que vuelve útil la lista una vez que la
 * reputación empieza a moverse: de veinte agentes, saber cuáles cuatro te reciben
 * hoy es la única pregunta que importa antes de salir a buscar trabajo.
 */
const AGENT_FILTERS: readonly ((fila: FilaAgenteCorporacion, query: ConsultaAgentes) => boolean)[] =
	[
		(fila, query) =>
			!query.search ||
			fila.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
		(fila, query) => !query.kind || fila.kindCode === query.kind,
		(fila, query) => !query.onlyOpen || fila.open
	];

/** Lee la consulta del listado desde la URL, validada contra el catálogo. */
export function readAgentsQuery(params: URLSearchParams): ConsultaAgentes {
	const kind = params.get('clase') ?? '';

	return {
		...readListing(params, AGENT_SORTS, 'nivel'),
		kind: MISSION_KINDS.includes(kind as MissionKind) ? kind : '',
		// Cualquier valor sirve para encenderlo: lo que importa es que el parámetro
		// esté o no, como cualquier casilla que viaja en una URL.
		onlyOpen: params.get('atienden') !== null
	};
}

/** Lo que muestra la pestaña cuando el piloto no pertenece a ninguna. */
const SIN_CORPORACION: AgentesCorporacion = {
	belongs: false,
	name: 'Independiente',
	count: '',
	agents: [],
	query: readAgentsQuery(new URLSearchParams()),
	total: 0,
	found: 0,
	pages: 1,
	open: 0,
	kinds: []
};

/**
 * Quiénes reparten trabajo, y cuáles te reciben.
 *
 * Cuatro consultas y el resto en memoria, como el listado de miembros: ordenar y
 * cortar en JavaScript cuesta menos que la ida a la base, y el día que deje de ser
 * cierto el lugar donde cambiarlo es `listing.ts` y nada más.
 *
 * **El orden de entrada es por nivel.** Es la escalera: el de nivel uno atiende a
 * cualquiera y el de nivel cinco es la meta, así que leer de arriba hacia abajo es
 * leer el camino. El alfabético no diría nada.
 */
export function buildAgentes(
	db: Db,
	row: Pilot,
	query = readAgentsQuery(new URLSearchParams())
): AgentesCorporacion {
	if (row.corporationId === null) return { ...SIN_CORPORACION, query };

	const suya = db.select().from(corporation).where(eq(corporation.id, row.corporationId)).get();
	if (!suya) return { ...SIN_CORPORACION, query };

	const suyos = db
		.select()
		.from(agent)
		.where(eq(agent.corporationId, suya.id))
		.orderBy(asc(agent.level), asc(agent.id))
		.all();

	// Dónde está sentado cada uno. Dos mapas y no una consulta por agente: una
	// corporación con veinte puestos no puede costar veinte viajes a la base.
	const puestos = new Map(
		db
			.select()
			.from(station)
			.all()
			.map((uno) => [uno.id, uno])
	);
	const cuerpos = new Map(
		db
			.select()
			.from(body)
			.all()
			.map((uno) => [uno.id, uno])
	);
	const sistemas = new Map(
		db
			.select()
			.from(systemTable)
			.all()
			.map((uno) => [uno.id, uno])
	);

	// Las dos escaleras del piloto con esta corporación y con su bandera.
	const reputacion = pilotStandings(db, row.id);
	const conLaCorporacion = reputacion.corporations[suya.code] ?? 0;
	const conLaBandera = suya.faction ? (reputacion.factions[suya.faction] ?? 0) : 0;
	const bandera = FACTIONS[suya.faction as keyof typeof FACTIONS]?.name ?? 'Sin bandera';

	const todos: FilaAgenteCorporacion[] = suyos.map((uno) => {
		const puesto = puestos.get(uno.stationId);
		const cuerpo = puesto ? cuerpos.get(puesto.bodyId) : undefined;
		const kind = uno.missionKind as MissionKind;
		const needed = requiredReputation(uno.level, suya.faction);

		return {
			code: uno.code,
			name: uno.name,
			kind: missionKindLabel(kind),
			kindCode: uno.missionKind,
			kindIcon: missionKindIcon(kind),
			level: roman(uno.level),
			levelValue: uno.level,
			station: cuerpo?.name ?? '',
			system: cuerpo ? (sistemas.get(cuerpo.systemId)?.name ?? '') : '',
			open: canBeHired(uno.level, suya.faction, conLaCorporacion, conLaBandera),
			// La misma frase que la ficha del lugar, palabra por palabra: el mismo
			// hecho se dice igual en todos lados.
			requirement: `Requiere ${needed} de reputación con ${suya.name} o con ${bandera}`
		};
	});

	const pasan = sift(todos, query, AGENT_FILTERS);
	const pagina = paginate(pasan, query, AGENT_SORTS, AGENTS_PER_PAGE);

	return {
		belongs: true,
		name: suya.name,
		count: todos.length === 1 ? '1 agente' : `${todos.length} agentes`,
		agents: pagina.rows,
		query: { ...query, page: pagina.page },
		total: todos.length,
		found: pagina.found,
		pages: pagina.pages,
		open: todos.filter((uno) => uno.open).length,
		kinds: [...new Set(todos.map((uno) => uno.kindCode))]
			.map((code) => ({ value: code, label: missionKindLabel(code as MissionKind) }))
			.sort((a, b) => a.label.localeCompare(b.label, 'es'))
	};
}
