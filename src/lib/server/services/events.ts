/**
 * El registro de eventos: lo que pasó en el juego, escrito una sola vez.
 *
 * Es **append-only**. No hay función para editar ni para borrar una fila, y eso
 * no es un descuido: un registro que se puede retocar no sirve para lo único
 * para lo que sirve un registro, que es creerle cuando algo no cierra. Si algo
 * quedó mal escrito, se escribe otro evento que lo diga.
 *
 * Guarda **código y JSON**, no la frase. Quien la arma es `$lib/events.ts`, al
 * mostrarla. Ver docs/systems/ADMIN.md.
 *
 * Mismo patrón que la bitácora: la base entra como primer argumento, así que
 * dejar constancia puede ir **dentro de la transacción del hecho**. Es la única
 * forma de que un hecho y su registro no puedan separarse.
 */

import { and, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { auditEvent, pilot, type AuditEvent } from '../db/schema';
import type { Db } from '../db/types';
import type { EventPayload, EventSubject } from '$lib/events';

/** Cuántos eventos entran en una página. */
export const PAGE_SIZE = 25;

/** Cuántos días abarca la traza de actividad. Un mes entra en pantalla. */
export const ACTIVITY_DAYS = 30;

/** La medianoche UTC de hace `atras` días. */
function startOfDayUtc(from: Date, atras: number): Date {
	const fecha = new Date(from);
	fecha.setUTCHours(0, 0, 0, 0);
	fecha.setUTCDate(fecha.getUTCDate() - atras);
	return fecha;
}

/** La más nueva de dos fechas, para no ensanchar el período que pidió el filtro. */
function maxDate(a: Date | undefined, b: Date): Date {
	return a && a.getTime() > b.getTime() ? a : b;
}

/** Lo que hace falta para dejar constancia de algo. */
export interface EventEntry {
	/** Un código del catálogo de `$lib/events.ts`. */
	readonly kind: string;
	/**
	 * Quién lo hizo, o `null` si no lo hizo nadie.
	 *
	 * Anulable a propósito: hay cosas que no tienen responsable —la siembra que
	 * crea el universo, una orden que caduca sola— y forzar uno inventaría un
	 * culpable. Un evento sin actor se lee como «el sistema».
	 */
	readonly actorId: number | null;
	/** Sobre qué fue, si fue sobre algo. */
	readonly subject?: { readonly kind: EventSubject; readonly id: number | null };
	/**
	 * Los datos del hecho.
	 *
	 * Van acá **los nombres además de los identificadores**. Parece redundante y
	 * es justamente el punto: el evento de una baja de cuenta tiene que poder
	 * decir de quién era cuando esa fila ya no existe.
	 */
	readonly payload?: EventPayload;
}

/** Un evento con el nombre de quien lo hizo, para poder mostrarlo. */
export interface EventRow {
	readonly id: number;
	readonly kind: string;
	readonly actorId: number | null;
	/** El nombre del actor, o `null` si no hubo actor o si ya no existe. */
	readonly actor: string | null;
	readonly subjectKind: string;
	readonly subjectId: number | null;
	readonly payload: EventPayload;
	readonly createdAt: Date;
}

/** Una página del registro, con lo que hace falta para dibujar el paginador. */
export interface EventPage {
	readonly rows: readonly EventRow[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/** Por qué se puede filtrar el registro. */
export interface EventFilters {
	/** Códigos de evento. Vacío quiere decir todos. */
	readonly kinds?: readonly string[];
	readonly actorId?: number | null;
	readonly subjectKind?: string;
	readonly subjectId?: number | null;
	readonly since?: Date;
	readonly until?: Date;
}

/**
 * Deja constancia de un hecho.
 *
 * **No falla nunca por culpa del catálogo**: un código que no está guardado
 * igual, porque perder un hecho es peor que guardarlo sin nombre y la pantalla
 * ya sabe mostrar uno que no reconoce. Lo que sí hace es no dejar que un
 * problema al escribir el registro tumbe la operación que lo generó cuando va
 * fuera de transacción —eso lo decide quien llama, pasando su propia `tx`.
 */
export function record(db: Db, entry: EventEntry): AuditEvent {
	return db
		.insert(auditEvent)
		.values({
			kind: entry.kind,
			actorId: entry.actorId,
			subjectKind: entry.subject?.kind ?? '',
			subjectId: entry.subject?.id ?? null,
			payload: JSON.stringify({ ...entry.payload, actor: actorName(db, entry) })
		})
		.returning()
		.get();
}

/**
 * El nombre de quien lo hizo, congelado dentro del JSON.
 *
 * Parece redundante —el id ya está en su columna— y es justamente lo que hace
 * que el registro sobreviva: cuando la cuenta del actor se da de baja, el id
 * apunta a una fila que ya no existe y sin esto la mitad del historial pasaría a
 * decir «alguien». Se resuelve al escribir, una vez, y no en cada lectura.
 */
function actorName(db: Db, entry: EventEntry): string | null {
	if (typeof entry.payload?.actor === 'string') return entry.payload.actor;
	if (entry.actorId === null) return null;

	return (
		db.select({ callsign: pilot.callsign }).from(pilot).where(eq(pilot.id, entry.actorId)).get()
			?.callsign ?? null
	);
}

/**
 * Desarma el JSON guardado.
 *
 * Devuelve un objeto vacío si no se puede leer en vez de romper: una fila
 * escrita por una versión anterior no debería poder tumbar la pantalla que la
 * lista, y el catálogo ya sabe redactar con campos faltantes.
 */
function payloadOf(raw: string): EventPayload {
	try {
		const parsed: unknown = JSON.parse(raw);
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as EventPayload)
			: {};
	} catch {
		return {};
	}
}

/** Las condiciones de un filtro, o `undefined` si no filtra nada. */
function conditions(filters: EventFilters) {
	const partes = [];

	if (filters.kinds) {
		// Una lista **vacía** quiere decir "ninguno", no "todos". Es la diferencia
		// entre no pedir filtro —`undefined`— y pedir uno que no puede cumplir
		// nadie, y confundirlas hace que elegir una categoría sin tipos registrados
		// muestre el registro entero justo cuando se esperaba verlo vacío.
		partes.push(
			filters.kinds.length > 0 ? inArray(auditEvent.kind, [...filters.kinds]) : sql`0 = 1`
		);
	}
	if (typeof filters.actorId === 'number') partes.push(eq(auditEvent.actorId, filters.actorId));
	if (filters.subjectKind) partes.push(eq(auditEvent.subjectKind, filters.subjectKind));
	if (typeof filters.subjectId === 'number') {
		partes.push(eq(auditEvent.subjectId, filters.subjectId));
	}
	if (filters.since) partes.push(gte(auditEvent.createdAt, filters.since));
	if (filters.until) partes.push(lte(auditEvent.createdAt, filters.until));

	return partes.length > 0 ? and(...partes) : undefined;
}

/**
 * Una página del registro, de lo más nuevo a lo más viejo.
 *
 * El nombre del actor sale de un `leftJoin` y no de una consulta por fila: son
 * veinticinco filas por página y el N+1 se nota. Es **izquierdo** porque el
 * actor puede no existir —un evento sobrevive a la cuenta que lo causó— y esa
 * fila tiene que seguir apareciendo.
 */
export function eventsPage(
	db: Db,
	filters: EventFilters = {},
	page = 1,
	size = PAGE_SIZE
): EventPage {
	const donde = conditions(filters);

	const total = db.select({ n: count() }).from(auditEvent).where(donde).get()?.n ?? 0;

	// Con el registro vacío sigue habiendo una página: la que dice que no pasó
	// nada todavía.
	const pages = Math.max(1, Math.ceil(total / size));
	const actual = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

	const filas = db
		.select({
			id: auditEvent.id,
			kind: auditEvent.kind,
			actorId: auditEvent.actorId,
			actor: pilot.callsign,
			subjectKind: auditEvent.subjectKind,
			subjectId: auditEvent.subjectId,
			payload: auditEvent.payload,
			createdAt: auditEvent.createdAt
		})
		.from(auditEvent)
		.leftJoin(pilot, eq(pilot.id, auditEvent.actorId))
		.where(donde)
		// Por id y no sólo por fecha: dos eventos del mismo segundo tienen que
		// salir siempre en el mismo orden, o la paginación repite o se saltea filas.
		.orderBy(desc(auditEvent.createdAt), desc(auditEvent.id))
		.limit(size)
		.offset((actual - 1) * size)
		.all();

	const rows = filas.map((fila) => {
		const payload = payloadOf(fila.payload);
		return {
			id: fila.id,
			kind: fila.kind,
			actorId: fila.actorId,
			// El nombre de ahora si la cuenta sigue viva, y si no el que quedó
			// guardado: un piloto que se cambió el distintivo se lee con el actual, y
			// uno que se dio de baja se sigue leyendo.
			actor: fila.actor ?? (typeof payload.actor === 'string' ? payload.actor : null),
			subjectKind: fila.subjectKind,
			subjectId: fila.subjectId,
			payload,
			createdAt: fila.createdAt
		};
	});

	return { rows, total, page: actual, pages };
}

/** Cuánto pasó un día, y cuánto de eso fue grave. */
export interface DayActivity {
	/** El día en UTC, como `2026-09-16`. */
	readonly day: string;
	readonly total: number;
}

/**
 * Cuántos eventos hubo por día, para dibujar la traza de actividad.
 *
 * Se agrupa **en SQL y no en memoria**: la alternativa es traerse las fechas de
 * todo el período para contarlas del lado de acá, y el registro es la tabla que
 * más crece de todas. Acá se leen treinta números.
 *
 * Los días van en **UTC**, como todo instante del juego. Un registro que agrupa
 * según el huso de quien mira contaría un mismo hecho en dos días distintos
 * según desde dónde se lo lea, y entonces no se puede citar.
 *
 * Devuelve **todos los días del período, incluso los vacíos**: la traza tiene
 * que mostrar los huecos, que es la mitad de lo que se lee en ella.
 */
export function activityByDay(
	db: Db,
	filters: EventFilters = {},
	days = ACTIVITY_DAYS
): readonly DayActivity[] {
	const desde = startOfDayUtc(new Date(), days - 1);
	const donde = conditions({ ...filters, since: maxDate(filters.since, desde) });

	const dia = sql<string>`strftime('%Y-%m-%d', ${auditEvent.createdAt}, 'unixepoch')`;
	const filas = db
		.select({ day: dia, total: count() })
		.from(auditEvent)
		.where(donde)
		.groupBy(dia)
		.all();

	const contados = new Map(filas.map((fila) => [fila.day, fila.total]));

	return Array.from({ length: days }, (_, paso) => {
		const fecha = startOfDayUtc(new Date(), days - 1 - paso);
		const day = fecha.toISOString().slice(0, 10);
		return { day, total: contados.get(day) ?? 0 };
	});
}

/**
 * Los últimos eventos que tocaron a alguien o a algo.
 *
 * Es lo que va a querer la ficha de un piloto: no el registro entero filtrado a
 * mano, sino «qué pasó con éste». Busca por sujeto **y** por actor, porque las
 * dos cosas cuentan la historia de esa cuenta.
 */
export function eventsAbout(
	db: Db,
	subjectKind: EventSubject,
	subjectId: number,
	limit = 10
): readonly EventRow[] {
	return eventsPage(db, { subjectKind, subjectId }, 1, limit).rows;
}
