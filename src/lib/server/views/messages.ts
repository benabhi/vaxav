/**
 * Las dos bandejas de mensajes, listas para dibujar.
 *
 * **Una sola función para las dos.** Recibidos y enviados no son dos pantallas:
 * son la misma lista mirada desde el otro lado, y lo único que cambia es de qué
 * lado está el otro y qué decir cuando no hay nada. Escribirlas por separado
 * sería garantizar que dentro de un mes se vean distinto.
 *
 * El mensaje abierto viaja **con la página** y no aparte: la pantalla es una
 * lista con el detalle al lado, que es como este proyecto resuelve la
 * profundidad en vez de agregar un tercer nivel de navegación. Ver CLAUDE.md.
 *
 * Corresponde a `docs/systems/INTERFACE.md`.
 */

import { eq, inArray } from 'drizzle-orm';
import { pilot, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import {
	inboxPage,
	markRead,
	messageFor,
	sentPage,
	unreadMessages,
	type MessagePage
} from '../services/messages';
import { NO_SUBJECT } from '$lib/game/messages';
import type { Bandeja, Buzon, FilaMensaje, MensajeAbierto } from '$lib/tipos';

/** Lo que distingue a una bandeja de la otra, dicho una sola vez. */
const BUZONES: Record<Buzon, { base: string; counterpartLabel: string; empty: string }> = {
	recibidos: {
		base: '/mensajes',
		counterpartLabel: 'De',
		empty: 'No te escribió nadie todavía. Acá van a caer los mensajes que te manden.'
	},
	enviados: {
		base: '/mensajes/enviados',
		counterpartLabel: 'Para',
		empty: 'Todavía no escribiste a nadie. Acá queda copia de lo que mandes.'
	}
};

/**
 * Los distintivos de un puñado de pilotos, en una sola consulta.
 *
 * De a uno serían quince consultas por página, que es el error que se paga
 * cuando la bandeja crece y nadie mira por qué la pantalla tarda.
 */
function distintivos(db: Db, ids: readonly number[]): Map<number, string> {
	if (ids.length === 0) return new Map();
	const filas = db
		.select({ id: pilot.id, callsign: pilot.callsign })
		.from(pilot)
		.where(inArray(pilot.id, [...new Set(ids)]))
		.all();
	return new Map(filas.map((fila) => [fila.id, fila.callsign]));
}

/**
 * Una bandeja, con la página pedida y el mensaje abierto si hay uno.
 *
 * **Abrir marca leído**, y acá: es el único lugar por el que se lee un mensaje,
 * así que ponerlo en otro lado sería dejar abierta la puerta de leer sin marcar.
 */
export function buildBandeja(db: Db, row: Pilot, box: Buzon, page = 1, openId = 0): Bandeja {
	const pagina: MessagePage =
		box === 'recibidos' ? inboxPage(db, row.id, page) : sentPage(db, row.id, page);

	// El otro extremo es el que no sos vos, y cuál es depende de la bandeja.
	const otros = pagina.entries.map((fila) =>
		box === 'recibidos' ? fila.senderId : fila.recipientId
	);
	const abierto = openId > 0 ? messageFor(db, row.id, openId) : undefined;
	if (abierto) markRead(db, row.id, abierto.id);

	const nombres = distintivos(db, [
		...otros,
		...(abierto ? [abierto.senderId, abierto.recipientId] : [])
	]);

	const rows: FilaMensaje[] = pagina.entries.map((fila) => ({
		id: fila.id,
		subject: fila.subject || NO_SUBJECT,
		counterpart:
			nombres.get(box === 'recibidos' ? fila.senderId : fila.recipientId) ?? 'Piloto retirado',
		at: fila.sentAt.getTime(),
		// Sin leer sólo tiene sentido de este lado: `readAt` dice cuándo lo abrió
		// quien lo recibió, así que en enviados hablaría del otro y no de vos.
		unread: box === 'recibidos' && fila.readAt === null,
		open: abierto !== undefined && fila.id === abierto.id
	}));

	const open: MensajeAbierto | null = abierto
		? {
				id: abierto.id,
				subject: abierto.subject || NO_SUBJECT,
				from: nombres.get(abierto.senderId) ?? 'Piloto retirado',
				to: nombres.get(abierto.recipientId) ?? 'Piloto retirado',
				body: abierto.body,
				at: abierto.sentAt.getTime(),
				mine: abierto.senderId === row.id,
				// Que el otro lo haya abierto sólo se dice de lo que mandaste vos: de lo
				// que te mandaron, el que lo abrió sos vos y no es noticia.
				seen: abierto.senderId === row.id && abierto.readAt !== null
			}
		: null;

	return {
		box,
		...BUZONES[box],
		rows,
		open,
		page: pagina.page,
		pages: pagina.pages,
		total: pagina.total,
		// El contador va en las dos bandejas: estando en enviados uno también quiere
		// ver que le llegó algo, y el número es el mismo que enciende el Neocom.
		unread: unreadMessages(db, row.id)
	};
}

/** El distintivo de un piloto por su id, para prellenar el destinatario. */
export function callsignOf(db: Db, id: number): string {
	return (
		db.select({ callsign: pilot.callsign }).from(pilot).where(eq(pilot.id, id)).get()?.callsign ??
		''
	);
}
