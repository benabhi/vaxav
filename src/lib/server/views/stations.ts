/**
 * Los puestos de una corporación: dónde se la encuentra.
 *
 * Vive aparte de `corporation.ts` por lo mismo que los agentes y los miembros:
 * **es otra consulta y otra pantalla**. La ficha describe a la corporación y esto
 * lista lugares, que crecen por su cuenta —una naviera grande opera un puesto por
 * sistema—, así que nace con recorte, orden y paginado como todo listado del
 * proyecto.
 *
 * Estuvo en la columna angosta de la ficha, mostrando cinco y contando el resto
 * con un «y N más». Eso alcanzaba mientras las corporaciones tuvieran dos puestos
 * y dejaba de alcanzar exactamente cuando la lista empezaba a importar: con veinte
 * estaciones, «y quince más» no contesta ninguna de las preguntas que uno le hace
 * a esa lista —dónde tienen refinería, cuál queda cerca—.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { eq } from 'drizzle-orm';
import { corporation, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { estacionesDe } from './corporation';
import { readListing, paginate, sift, type Ordenes } from './listing';
import type { ConsultaUbicaciones, EstacionCorporacion, Ubicaciones } from '$lib/tipos';

/** Cuántos puestos entran en una página. El mismo número que el resto del juego. */
export const STATIONS_PER_PAGE = 25;

/**
 * Por qué columnas se puede ordenar.
 *
 * Una columna que no está acá no se ofrece como ordenable en la pantalla, así que
 * es imposible prometer un orden que el servidor no sabe hacer.
 */
export const STATION_SORTS: Ordenes<EstacionCorporacion> = {
	nombre: (fila) => fila.name.toLocaleLowerCase('es'),
	sistema: (fila) => fila.system.toLocaleLowerCase('es'),
	// Por cuánto ofrece: un puerto con seis módulos y uno con uno no son la misma
	// parada, y ordenar por eso es la manera de encontrar dónde se puede hacer todo.
	servicios: (fila) => fila.services.length
};

/**
 * Los recortes, cada uno con su pregunta. Se apilan: entra quien pasa todos.
 *
 * El del servicio es el que vuelve útil la lista cuando es larga: de veinte
 * puestos, cuáles tienen refinería es la única pregunta que importa cuando uno
 * sale con la bodega llena de mineral.
 */
const STATION_FILTERS: readonly ((
	fila: EstacionCorporacion,
	query: ConsultaUbicaciones
) => boolean)[] = [
	(fila, query) =>
		!query.search ||
		fila.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')) ||
		fila.system.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
	(fila, query) => !query.service || fila.services.includes(query.service)
];

/** Lee la consulta del listado desde la URL. */
export function readStationsQuery(params: URLSearchParams): ConsultaUbicaciones {
	return {
		...readListing(params, STATION_SORTS, 'nombre'),
		// El servicio se valida contra lo que haya adentro, y eso se sabe recién
		// cuando están las filas: acá alcanza con acotarlo a algo razonable.
		service: (params.get('servicio') ?? '').slice(0, 40)
	};
}

/** Lo que se muestra cuando no hay corporación a la que mirarle los puestos. */
const SIN_CORPORACION = {
	belongs: false,
	name: '',
	code: '',
	count: '',
	stations: [],
	total: 0,
	found: 0,
	pages: 1,
	services: []
} as const;

/**
 * Los puestos de una corporación, recortados y paginados.
 *
 * **Con código se miran los de cualquiera; sin código, los de la tuya.** Es el
 * mismo constructor para la pestaña del módulo y para la ventana de una ficha
 * ajena: dos maneras de listar lo mismo serían dos que un día dicen cosas
 * distintas.
 */
export function buildUbicaciones(
	db: Db,
	row: Pilot,
	query = readStationsQuery(new URLSearchParams()),
	code = ''
): Ubicaciones {
	const suya = code
		? db.select().from(corporation).where(eq(corporation.code, code)).get()
		: row.corporationId === null
			? undefined
			: db.select().from(corporation).where(eq(corporation.id, row.corporationId)).get();

	if (!suya) return { ...SIN_CORPORACION, query };

	const todas = estacionesDe(db, suya.id);
	const pagina = paginate(
		sift(todas, query, STATION_FILTERS),
		query,
		STATION_SORTS,
		STATIONS_PER_PAGE
	);

	return {
		belongs: true,
		name: suya.name,
		code: suya.code,
		count: todas.length === 1 ? '1 puesto' : `${todas.length} puestos`,
		stations: pagina.rows,
		query: { ...query, page: pagina.page },
		total: todas.length,
		found: pagina.found,
		pages: pagina.pages,
		// Sólo los servicios que alguno ofrece: un desplegable con ocho opciones de
		// las que seis no encuentran nada hace perder el tiempo seis veces de cada
		// ocho.
		services: [...new Set(todas.flatMap((una) => una.services))]
			.map((uno) => ({ value: uno, label: uno }))
			.sort((a, b) => a.label.localeCompare(b.label, 'es'))
	};
}
