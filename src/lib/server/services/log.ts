/**
 * La bitácora: los informes de todo lo que el piloto resolvió.
 *
 * En un juego donde las cosas pasan mientras no estás, la bitácora no es un
 * adorno: es el relato de la partida, y lo primero que se lee al volver. Ver
 * docs/systems/ACTIONS.md.
 *
 * Mismo patrón que el resto de los servicios: la base entra como primer
 * argumento, así que la escritura puede ir dentro de la transacción de quien
 * llama —y tiene que ir, para que un informe no se pierda nunca.
 */

import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { pilotLog, type PilotLog } from '../db/schema';
import type { Db } from '../db/types';

/** Cuántos informes entran en una página de la bitácora. */
export const PAGE_SIZE = 10;

/** Lo que hace falta para escribir un informe. */
export interface LogEntry {
	readonly kind: string;
	readonly durationSeconds: number;
	readonly originBodyId: number | null;
	readonly destinationBodyId: number | null;
	readonly xpAwarded: Readonly<Record<string, number>>;
}

/** Una página de la bitácora, con lo que hace falta para dibujar el paginador. */
export interface LogPage {
	readonly entries: readonly PilotLog[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/**
 * Escribe un informe.
 *
 * Recibe la conexión y no la abre: quien resuelve una acción la llama **dentro
 * de su transacción**, para que aplicar el resultado y dejar constancia sean la
 * misma cosa. Un informe que se pierde es una acción que el jugador no sabe que
 * ocurrió.
 */
export function recordEntry(db: Db, pilotId: number, entry: LogEntry): PilotLog {
	return db
		.insert(pilotLog)
		.values({
			pilotId,
			kind: entry.kind,
			durationSeconds: entry.durationSeconds,
			originBodyId: entry.originBodyId,
			destinationBodyId: entry.destinationBodyId,
			xpAwarded: JSON.stringify(entry.xpAwarded)
		})
		.returning()
		.get();
}

/**
 * Una página de la bitácora, de lo más nuevo a lo más viejo.
 *
 * `page` arranca en 1 y se acota a lo que existe: una página fuera de rango
 * devuelve la última, que es más útil que una lista vacía y evita tener que
 * validar el número en cada pantalla que enlace acá.
 */
export function logPage(db: Db, pilotId: number, page = 1, size = PAGE_SIZE): LogPage {
	const total =
		db.select({ n: count() }).from(pilotLog).where(eq(pilotLog.pilotId, pilotId)).get()?.n ?? 0;

	// Con la bitácora vacía sigue habiendo una página: la que dice que no hay
	// nada todavía.
	const pages = Math.max(1, Math.ceil(total / size));
	const actual = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

	const entries = db
		.select()
		.from(pilotLog)
		.where(eq(pilotLog.pilotId, pilotId))
		// Por id y no sólo por fecha: dos informes del mismo segundo tienen que
		// salir siempre en el mismo orden, o la paginación repite o se saltea filas.
		.orderBy(desc(pilotLog.createdAt), desc(pilotLog.id))
		.limit(size)
		.offset((actual - 1) * size)
		.all();

	return { entries, total, page: actual, pages };
}

/** Cuántos informes no vio todavía. Es lo que enciende la notificación. */
export function unreadCount(db: Db, pilotId: number): number {
	return (
		db
			.select({ n: count() })
			.from(pilotLog)
			.where(and(eq(pilotLog.pilotId, pilotId), isNull(pilotLog.readAt)))
			.get()?.n ?? 0
	);
}

/**
 * Da por vistos todos los informes del piloto y devuelve cuántos eran.
 *
 * Todos y no sólo los de la página que se está mirando: la notificación dice
 * "hay algo nuevo", y el jugador que abre la bitácora ya sabe que lo hay. Dejarle
 * el aviso encendido después de entrar sería pedirle que pagine hasta apagarlo.
 */
export function markRead(db: Db, pilotId: number): number {
	return db
		.update(pilotLog)
		.set({ readAt: new Date() })
		.where(and(eq(pilotLog.pilotId, pilotId), isNull(pilotLog.readAt)))
		.returning()
		.all().length;
}
