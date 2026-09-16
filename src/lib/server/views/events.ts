/**
 * El registro de eventos, armado para la pantalla del cuartel.
 *
 * Acá es donde el código y el JSON que guardó el servicio se convierten en una
 * frase. **La redacción no viaja desde la base**: lo que viaja es lo que pasó, y
 * cómo se cuenta lo decide el catálogo de `$lib/events.ts` en el momento de
 * mostrarlo. Cambiar una palabra no obliga a reescribir el pasado.
 *
 * También traduce la URL a un filtro. Los filtros van en la URL y no en el
 * estado del navegador a propósito: un registro que se consulta es un registro
 * que se cita, y para citarlo hay que poder pasar el enlace.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import {
	CATEGORY_ICONS,
	CATEGORY_LABELS,
	EVENT_CATEGORIES,
	EVENT_KINDS,
	eventKind,
	kindsOfCategory,
	type EventCategory
} from '$lib/events';
import type { DiaRegistro, FilaEvento, OpcionFiltro, Registro } from '$lib/tipos';
import { activityByDay, eventsPage, type EventFilters, type EventRow } from '../services/events';
import { eq } from 'drizzle-orm';
import { pilot } from '../db/schema';
import type { Db } from '../db/types';

/** Lo que la URL puede decir sobre qué se quiere mirar. */
export interface EventQuery {
	readonly category: string;
	readonly kind: string;
	readonly day: string;
	/** Quién lo hizo, por su número de piloto. */
	readonly actor: number | null;
	readonly page: number;
}

/** Un día válido es `2026-09-16` y nada más que eso. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lee el filtro de la URL.
 *
 * **Todo lo que no entiende lo descarta** en vez de fallar: un enlace viejo, un
 * parámetro escrito a mano o una categoría que ya no existe tienen que dejar la
 * pantalla en su estado por omisión —el registro entero— y no en un error.
 */
export function readQuery(params: URLSearchParams): EventQuery {
	const category = params.get('categoria') ?? '';
	const kind = params.get('tipo') ?? '';
	const day = params.get('dia') ?? '';
	const actor = Number.parseInt(params.get('quien') ?? '', 10);

	return {
		category: EVENT_CATEGORIES.includes(category as EventCategory) ? category : '',
		kind: EVENT_KINDS.some((uno) => uno.code === kind) ? kind : '',
		day: DAY_PATTERN.test(day) ? day : '',
		actor: Number.isInteger(actor) && actor > 0 ? actor : null,
		page: Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1)
	};
}

/**
 * Qué códigos de evento pidió la consulta, o `undefined` si los quiere todos.
 *
 * Un tipo concreto **gana sobre su categoría**: si se pidió "alta de piloto", no
 * hay razón para traer el resto de las cuentas.
 */
function kindsOf(query: EventQuery): readonly string[] | undefined {
	if (query.kind) return [query.kind];
	if (!query.category) return undefined;
	return kindsOfCategory(query.category as EventCategory).map((uno) => uno.code);
}

/**
 * Las dos puntas del día elegido, o nada si se miran todos.
 *
 * El día entero y no desde una hora: media jornada suelta no es una unidad que
 * alguien quiera leer, y la traza —que es de donde se elige— dibuja días.
 */
function dayRange(day: string): Pick<EventFilters, 'since' | 'until'> {
	if (!day) return {};

	const desde = new Date(`${day}T00:00:00.000Z`);
	const hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000 - 1);
	return { since: desde, until: hasta };
}

/** Una fila del registro, con su frase ya escrita. */
export function buildFila(row: EventRow): FilaEvento {
	const kind = eventKind(row.kind);

	return {
		id: row.id,
		at: row.createdAt.getTime(),
		kind: row.kind,
		label: kind.label,
		icon: CATEGORY_ICONS[kind.category],
		tone: kind.tone,
		categoryLabel: CATEGORY_LABELS[kind.category],
		text: kind.describe(row.payload),
		// Un evento sin actor no es un evento sin dueño: es uno que no hizo nadie.
		// La pantalla lo dice con sus palabras; acá sólo viaja el vacío.
		actor: row.actor ?? '',
		actorId: row.actorId
	};
}

/** Las categorías del filtro, con la opción de no filtrar adelante. */
function buildCategorias(): readonly OpcionFiltro[] {
	return [
		{ value: '', label: 'Todo' },
		...EVENT_CATEGORIES.map((category) => ({
			value: category,
			label: CATEGORY_LABELS[category]
		}))
	];
}

/**
 * Los tipos que se pueden elegir, que son **los de la categoría abierta**.
 *
 * Sin categoría no se ofrece ninguno: una lista con los cuarenta tipos del juego
 * no es un filtro, es otro problema. Primero se elige de qué se está hablando.
 */
function buildTipos(category: string): readonly OpcionFiltro[] {
	if (!category) return [];

	return [
		{ value: '', label: 'Todos' },
		...kindsOfCategory(category as EventCategory).map((kind) => ({
			value: kind.code,
			label: kind.label
		}))
	];
}

/**
 * El registro entero de una consulta.
 *
 * La traza se calcula **con el filtro de tipo puesto pero sin el día**: si se
 * achicara al día elegido, la figura sería una sola barra y dejaría de servir
 * justo para lo que sirve, que es ver a qué otro día saltar.
 */
export function buildRegistro(db: Db, query: EventQuery): Registro {
	const kinds = kindsOf(query);
	const actorId = query.actor;
	const pagina = eventsPage(db, { kinds, actorId, ...dayRange(query.day) }, query.page);
	const days: readonly DiaRegistro[] = activityByDay(db, { kinds, actorId });

	return {
		rows: pagina.rows.map(buildFila),
		total: pagina.total,
		page: pagina.page,
		pages: pagina.pages,
		days,
		filters: {
			category: query.category,
			kind: query.kind,
			day: query.day,
			actor: actorId,
			actorName: actorId === null ? '' : actorName(db, actorId, pagina.rows)
		},
		categories: buildCategorias(),
		kinds: buildTipos(query.category)
	};
}

/**
 * Cómo se llama el piloto que se está filtrando.
 *
 * Sale de las propias filas cuando hay alguna, y de la tabla de pilotos cuando
 * no —porque el filtro puede dejar el resultado vacío y el nombre igual tiene
 * que aparecer en el chip—. Si no está en ninguna de las dos, quedó el número,
 * que es mejor que un chip en blanco.
 */
function actorName(db: Db, actorId: number, rows: readonly EventRow[]): string {
	const enLista = rows.find((fila) => fila.actorId === actorId)?.actor;
	if (enLista) return enLista;

	const fila = db.select().from(pilot).where(eq(pilot.id, actorId)).get();
	return fila?.callsign ?? `#${actorId}`;
}
