/**
 * Mandar y leer mensajes privados entre pilotos.
 *
 * **Es la única forma de hablarle a alguien que no está donde estás vos.** Vaxav
 * es un juego de esperar: el otro no va a estar mirando la pantalla cuando vos
 * escribís, así que lo que hace falta no es un chat sino algo que quede guardado
 * hasta que lo abra. Por eso el módulo vuelve al Neocom recién ahora: estuvo
 * fuera desde que se sacaron las pantallas cartel, y la regla que lo sacó decía
 * que el menú crece cuando hay algo detrás.
 *
 * Las dos bandejas son **dos consultas sobre la misma fila**, no dos tablas: un
 * mensaje enviado y uno recibido son el mismo hecho mirado desde dos lados, y
 * guardarlo dos veces es la manera segura de que un día digan cosas distintas.
 *
 * El paginado va **en SQL y no en memoria**: una bandeja crece para siempre, así
 * que es el caso de `logPage` y no el de `listing.ts`. Ver ARCHITECTURE.md.
 *
 * Corresponde a `docs/systems/INTERFACE.md`.
 */

import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { message, pilot, type Message, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { messageProblem, trimBody, trimSubject } from '$lib/game/messages';

/** No se pudo mandar. El mensaje se le muestra al jugador. */
export class MessageError extends Error {}

/** Cuántos mensajes entran en una página de la bandeja. */
export const PAGE_SIZE = 15;

/** Una página de una bandeja, con de dónde sacar la siguiente. */
export interface MessagePage {
	readonly entries: readonly Message[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/**
 * El piloto con ese distintivo, buscado sin mirar mayúsculas.
 *
 * **Sin distinguir mayúsculas a propósito**: quien escribe el nombre a mano no
 * tiene por qué acordarse de cómo lo tipeó el otro al registrarse, y un «no
 * existe» por una mayúscula es el peor error posible para un formulario que ya
 * te hizo escribir el mensaje entero.
 */
function porDistintivo(db: Db, callsign: string): Pilot | undefined {
	const buscado = callsign.trim();
	if (buscado === '') return undefined;
	return db
		.select()
		.from(pilot)
		.where(sql`lower(${pilot.callsign}) = lower(${buscado})`)
		.get();
}

/**
 * Manda un mensaje de un piloto a otro, por su distintivo.
 *
 * **No hace falta estar cerca.** Un mensaje no es una conversación: llega a donde
 * esté el otro, y esa es media razón de que exista. Lo que sí pide estar en el
 * mismo lugar es enterarse de que el otro existe, y de eso se ocupa la lista de
 * quiénes hay en la estación.
 */
export function sendMessage(
	db: Db,
	from: Pilot,
	toCallsign: string,
	subject: string,
	body: string
): Message {
	const problema = messageProblem(subject, body);
	if (problema) throw new MessageError(problema);

	const destinatario = porDistintivo(db, toCallsign);
	if (!destinatario) throw new MessageError(`No hay ningún piloto llamado «${toCallsign.trim()}».`);
	// Escribirse a uno mismo no es un error de tipeo interesante: es una bandeja
	// que se llena de ruido propio y un aviso del Neocom que se enciende solo.
	if (destinatario.id === from.id) throw new MessageError('No podés escribirte a vos mismo.');

	return db
		.insert(message)
		.values({
			senderId: from.id,
			recipientId: destinatario.id,
			subject: trimSubject(subject),
			body: trimBody(body)
		})
		.returning()
		.get();
}

/** Una página de lo que le llegó y todavía no archivó. */
export function inboxPage(db: Db, pilotId: number, page = 1, size = PAGE_SIZE): MessagePage {
	return pagina(
		db,
		and(eq(message.recipientId, pilotId), eq(message.recipientArchived, false)),
		page,
		size
	);
}

/** Y una de lo que mandó, con la misma regla. */
export function sentPage(db: Db, pilotId: number, page = 1, size = PAGE_SIZE): MessagePage {
	return pagina(
		db,
		and(eq(message.senderId, pilotId), eq(message.senderArchived, false)),
		page,
		size
	);
}

/**
 * Y una de lo que guardó, venga del lado que venga.
 *
 * **Un solo archivo para los dos lados.** Quien busca algo viejo no se acuerda de
 * si lo escribió o se lo escribieron; se acuerda de con quién fue. Partirlo en
 * dos archivos obligaría a buscar dos veces lo mismo.
 */
export function archivedPage(db: Db, pilotId: number, page = 1, size = PAGE_SIZE): MessagePage {
	return pagina(
		db,
		or(
			and(eq(message.recipientId, pilotId), eq(message.recipientArchived, true)),
			and(eq(message.senderId, pilotId), eq(message.senderArchived, true))
		),
		page,
		size
	);
}

/**
 * Guarda un mensaje en archivados, o lo devuelve a su bandeja.
 *
 * **Cada lado decide el suyo.** La fila es una sola y los dos extremos la ven:
 * que el que lo mandó lo archive no tiene por qué sacarlo de la bandeja del otro.
 * Por eso la columna que se toca depende de quién lo pide.
 *
 * Archivar **no borra**: el mensaje sigue entero y vuelve con la misma llamada.
 */
export function setArchived(db: Db, pilotId: number, id: number, archived: boolean): void {
	const fila = messageFor(db, pilotId, id);
	if (!fila) throw new MessageError('Ese mensaje no es tuyo.');

	db.update(message)
		.set(
			fila.recipientId === pilotId ? { recipientArchived: archived } : { senderArchived: archived }
		)
		.where(eq(message.id, id))
		.run();
}

/** Si ese piloto ya lo tiene guardado en archivados. */
export function isArchived(row: Message, pilotId: number): boolean {
	return row.recipientId === pilotId ? row.recipientArchived : row.senderArchived;
}

/** El trabajo común de las tres bandejas, que sólo se diferencian en el filtro. */
function pagina(db: Db, filtro: ReturnType<typeof and>, page: number, size: number): MessagePage {
	const total = db.select({ n: count() }).from(message).where(filtro).get()?.n ?? 0;

	// Con la bandeja vacía sigue habiendo una página: la que dice que no hay nada.
	const pages = Math.max(1, Math.ceil(total / size));
	const actual = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

	const entries = db
		.select()
		.from(message)
		.where(filtro)
		// Por id y no sólo por fecha: dos mensajes del mismo segundo tienen que salir
		// siempre en el mismo orden, o la paginación repite o se saltea filas.
		.orderBy(desc(message.sentAt), desc(message.id))
		.limit(size)
		.offset((actual - 1) * size)
		.all();

	return { entries, total, page: actual, pages };
}

/**
 * Un mensaje, **si es tuyo**: lo mandaste vos o te lo mandaron a vos.
 *
 * La comprobación va acá y no en la pantalla porque la pantalla pide el número
 * que venga en la URL: sin este filtro, cambiar un dígito a mano abre la
 * correspondencia de otro.
 */
export function messageFor(db: Db, pilotId: number, id: number): Message | undefined {
	const fila = db.select().from(message).where(eq(message.id, id)).get();
	if (!fila) return undefined;
	return fila.senderId === pilotId || fila.recipientId === pilotId ? fila : undefined;
}

/**
 * Marca como leído lo que acaba de abrir, y sólo si es suyo recibirlo.
 *
 * Abrir lo que uno mismo mandó no marca nada: `readAt` dice cuándo lo vio **el
 * que lo recibió**, y es lo que va a permitir que la bandeja de enviados diga si
 * el otro lo abrió.
 */
export function markRead(db: Db, pilotId: number, id: number): void {
	db.update(message)
		.set({ readAt: new Date() })
		.where(and(eq(message.id, id), eq(message.recipientId, pilotId), isNull(message.readAt)))
		.run();
}

/** Cuántos no abrió todavía. Es lo que enciende el aviso del Neocom. */
export function unreadMessages(db: Db, pilotId: number): number {
	return (
		db
			.select({ n: count() })
			.from(message)
			.where(
				and(
					eq(message.recipientId, pilotId),
					eq(message.recipientArchived, false),
					isNull(message.readAt)
				)
			)
			.get()?.n ?? 0
	);
}
