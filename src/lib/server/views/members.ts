/**
 * Los miembros de la corporación del piloto.
 *
 * Vive aparte de `corporation.ts` porque es **otra consulta y otra pantalla**: la
 * ficha describe a la corporación y esto lista gente, que crece por su cuenta. Con
 * dos mil pilotos, la ficha sigue cabiendo en una pantalla y esto no; por eso nace
 * ya con recorte, orden y paginado, como todo listado del proyecto.
 *
 * **Lo que se muestra de cada uno es lo público**: cómo se llama, a qué se dedica y
 * desde cuándo vuela. Dónde está parado ahora no: eso es información operativa, y
 * un listado de miembros no es un radar.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { asc, eq } from 'drizzle-orm';
import { corporation as corporationTable, pilot, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { PLAYABLE_PROFESSIONS, getProfession } from '$lib/game/professions';
import { FACTIONS } from '$lib/game/factions';
import { readListing, paginate, sift, type Ordenes } from './listing';
import type { ConsultaMiembros, MiembroCorporacion, Miembros } from '$lib/tipos';

/** Cuántos miembros entran en una página. El mismo número que el resto del juego. */
export const MEMBERS_PER_PAGE = 25;

/**
 * Por qué columnas se puede ordenar el listado.
 *
 * Una columna que no está acá no se ofrece como ordenable en la pantalla, así que
 * es imposible prometer un orden que el servidor no sabe hacer.
 */
export const MEMBER_SORTS: Ordenes<MiembroCorporacion> = {
	distintivo: (fila) => fila.callsign.toLocaleLowerCase('es'),
	oficio: (fila) => fila.profession.toLocaleLowerCase('es'),
	bandera: (fila) => fila.faction.toLocaleLowerCase('es'),
	antiguedad: (fila) => fila.since
};

/**
 * Los filtros, cada uno con su propia pregunta. Se apilan: entra quien pasa todos.
 *
 * Son dos porque hay dos preguntas que uno le hace a una lista de compañeros:
 * **cómo se llamaba aquel** y **quién sabe hacer esto**. La segunda es la que va a
 * importar el día que se armen operaciones: hacen falta tres mineros y un escolta.
 */
const MEMBER_FILTERS: readonly ((fila: MiembroCorporacion, query: ConsultaMiembros) => boolean)[] =
	[
		(fila, query) =>
			!query.search ||
			fila.callsign.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
		(fila, query) => !query.profession || fila.professionCode === query.profession
	];

/** Lee la consulta del listado desde la URL, validada contra los catálogos. */
export function readMembersQuery(params: URLSearchParams): ConsultaMiembros {
	const profession = params.get('oficio') ?? '';
	const conocido = PLAYABLE_PROFESSIONS.some((uno) => uno.code === profession);

	return {
		...readListing(params, MEMBER_SORTS, 'antiguedad'),
		profession: conocido ? profession : ''
	};
}

/** Lo que muestra la pestaña cuando el piloto no pertenece a ninguna. */
const SIN_CORPORACION: Miembros = {
	belongs: false,
	count: '',
	members: [],
	query: readMembersQuery(new URLSearchParams()),
	total: 0,
	found: 0,
	pages: 1,
	professions: []
};

/**
 * Quiénes son los otros.
 *
 * Una sola consulta y el resto en memoria: ordenar y cortar una lista de miles de
 * filas cuesta menos que la ida a la base, y el día que deje de ser cierto el lugar
 * donde cambiarlo es `listing.ts` y nada más.
 *
 * El orden de entrada es **por antigüedad**, que es como una corporación se cuenta
 * a sí misma —quién estaba antes— y no el alfabético, que no dice nada.
 */
export function buildMiembros(
	db: Db,
	row: Pilot,
	query = readMembersQuery(new URLSearchParams()),
	/** De cuál. Vacío quiere decir la propia. */
	code = ''
): Miembros {
	const otra = code
		? db.select().from(corporationTable).where(eq(corporationTable.code, code)).get()
		: undefined;
	// De cuál se listan los pilotos: la pedida, o la propia si no pidieron ninguna.
	const cual = code ? (otra?.id ?? null) : row.corporationId;
	if (cual === null) return { ...SIN_CORPORACION, query };

	// **Por antigüedad y después por identificador.** La fecha se guarda al segundo,
	// así que cuatro pilotos dados de alta en el mismo minuto empatan; el que entró
	// primero es el de identificador más bajo, y ése es el orden que la lista tiene
	// que conservar. Como `sort` es estable, alcanza con que llegue ordenado.
	const filas = db
		.select()
		.from(pilot)
		.where(eq(pilot.corporationId, cual))
		.orderBy(asc(pilot.createdAt), asc(pilot.id))
		.all();

	const todos: MiembroCorporacion[] = filas.map((uno) => ({
		callsign: uno.callsign,
		profession: professionName(uno.profession),
		professionCode: uno.profession,
		faction: FACTIONS[uno.faction as keyof typeof FACTIONS]?.name ?? 'Sin bandera',
		since: uno.createdAt.getTime(),
		isYou: uno.id === row.id
	}));

	const pasan = sift(todos, query, MEMBER_FILTERS);
	// Sin función de desempate: las filas ya vienen en el orden que corresponde y el
	// ordenamiento es estable, así que las empatadas lo conservan.
	const pagina = paginate(pasan, query, MEMBER_SORTS, MEMBERS_PER_PAGE);

	return {
		belongs: true,
		count: todos.length === 1 ? '1 piloto' : `${todos.length} pilotos`,
		members: pagina.rows,
		query: { ...query, page: pagina.page },
		total: todos.length,
		found: pagina.found,
		pages: pagina.pages,
		// **Sólo los oficios que hay adentro**, y no el catálogo entero: un filtro
		// que ofrece seis opciones de las que cinco no encuentran nada es un filtro
		// que hace perder el tiempo cinco veces de cada seis.
		professions: [...new Set(todos.map((uno) => uno.professionCode))]
			.map((code) => ({ value: code, label: professionName(code) }))
			.sort((a, b) => a.label.localeCompare(b.label, 'es'))
	};
}

/** El oficio, en palabras. Un código desconocido se muestra tal cual y no revienta. */
function professionName(code: string): string {
	try {
		return getProfession(code).name;
	} catch {
		return code;
	}
}
