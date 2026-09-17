/** Mandar y leer mensajes privados: a quién llegan, quién los ve y qué los apaga. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import {
	MessageError,
	archivedPage,
	inboxPage,
	markRead,
	messageFor,
	sendMessage,
	sentPage,
	setArchived,
	unreadMessages
} from './messages';

/** Dos pilotos, que es lo mínimo para que haya correspondencia. */
async function dos(db: ReturnType<typeof seededDb>) {
	return { uno: await crearPiloto(db, 'Halcon'), otro: await crearPiloto(db, 'Zorro') };
}

describe('mandar', () => {
	it('deja el mensaje en la bandeja del otro y en los enviados de uno', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);

		sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral el martes.');

		// **Una fila, dos vistas.** Es el mismo hecho mirado desde dos lados, y el
		// test existe para que nadie lo convierta en dos filas que un día difieran.
		expect(inboxPage(db, otro.id).entries.map((m) => m.subject)).toEqual(['Trato']);
		expect(sentPage(db, uno.id).entries.map((m) => m.subject)).toEqual(['Trato']);
		expect(inboxPage(db, uno.id).total).toBe(0);
	});

	it('encuentra al destinatario sin mirar mayúsculas', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);

		// Quien escribe el nombre a mano no tiene por qué acordarse de cómo lo tipeó
		// el otro al registrarse, y un «no existe» por una mayúscula es el peor
		// error posible para un formulario que ya te hizo escribir el mensaje entero.
		sendMessage(db, uno, 'zOrRo', '', 'Hola.');

		expect(inboxPage(db, otro.id).total).toBe(1);
	});

	it('no manda a quien no existe, ni a uno mismo, ni vacío', async () => {
		const db = seededDb();
		const { uno } = await dos(db);

		expect(() => sendMessage(db, uno, 'Nadie', 'Hola', 'Hola')).toThrow(MessageError);
		expect(() => sendMessage(db, uno, 'Halcon', 'Hola', 'Hola')).toThrow(MessageError);
		expect(() => sendMessage(db, uno, 'Zorro', 'Hola', '   ')).toThrow(MessageError);
	});
});

describe('leer', () => {
	it('lo abre quien lo recibió y ahí se apaga el aviso', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		expect(unreadMessages(db, otro.id)).toBe(1);

		markRead(db, otro.id, mandado.id);

		expect(unreadMessages(db, otro.id)).toBe(0);
	});

	it('abrir lo propio no marca nada: `readAt` dice si lo vio el otro', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		// Es lo que va a permitir que la bandeja de enviados diga si lo abrieron.
		markRead(db, uno.id, mandado.id);

		expect(unreadMessages(db, otro.id)).toBe(1);
	});

	it('no deja abrir la correspondencia de otro', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const ajeno = await crearPiloto(db, 'Mirlo');
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		// La pantalla pide el número que venga en la URL: sin este filtro, cambiar un
		// dígito a mano abre lo que se escribieron otros dos.
		expect(messageFor(db, ajeno.id, mandado.id)).toBeUndefined();
		expect(messageFor(db, uno.id, mandado.id)?.id).toBe(mandado.id);
		expect(messageFor(db, otro.id, mandado.id)?.id).toBe(mandado.id);
	});
});

describe('archivar', () => {
	it('lo saca de la bandeja de uno y lo deja en la de los dos', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		setArchived(db, otro.id, mandado.id, true);

		// Sale de recibidos y entra al archivo, sin dejar de existir.
		expect(inboxPage(db, otro.id).total).toBe(0);
		expect(archivedPage(db, otro.id).total).toBe(1);
		// Y el otro lo sigue teniendo en enviados: cada lado decide el suyo.
		expect(sentPage(db, uno.id).total).toBe(1);
		expect(archivedPage(db, uno.id).total).toBe(0);
	});

	it('vuelve con la misma llamada, porque archivar no borra', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		setArchived(db, otro.id, mandado.id, true);
		setArchived(db, otro.id, mandado.id, false);

		expect(inboxPage(db, otro.id).total).toBe(1);
		expect(archivedPage(db, otro.id).total).toBe(0);
	});

	it('lo archivado deja de encender el aviso del Neocom', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		// Sin abrirlo: guardarlo sin leer es una forma de decir que no importa, y el
		// Neocom no puede quedar titilando por algo que el jugador ya descartó.
		setArchived(db, otro.id, mandado.id, true);

		expect(unreadMessages(db, otro.id)).toBe(0);
	});

	it('no deja archivar lo que no es tuyo', async () => {
		const db = seededDb();
		const { uno } = await dos(db);
		const ajeno = await crearPiloto(db, 'Mirlo');
		const mandado = sendMessage(db, uno, 'Zorro', 'Trato', 'Te paso el mineral.');

		expect(() => setArchived(db, ajeno.id, mandado.id, true)).toThrow(MessageError);
	});
});

describe('la bandeja paginada', () => {
	it('trae lo último primero y no repite entre páginas', async () => {
		const db = seededDb();
		const { uno, otro } = await dos(db);
		for (let i = 1; i <= 7; i++) sendMessage(db, uno, 'Zorro', `Nº ${i}`, 'Cuerpo.');

		const primera = inboxPage(db, otro.id, 1, 4);
		const segunda = inboxPage(db, otro.id, 2, 4);

		expect(primera.total).toBe(7);
		expect(primera.pages).toBe(2);
		expect(primera.entries).toHaveLength(4);
		expect(segunda.entries).toHaveLength(3);

		// Ningún mensaje en las dos páginas: es lo que rompe cuando se ordena sólo
		// por fecha y varios caen en el mismo segundo.
		const ids = [...primera.entries, ...segunda.entries].map((m) => m.id);
		expect(new Set(ids).size).toBe(7);
	});

	it('con la bandeja vacía sigue habiendo una página', async () => {
		const db = seededDb();
		const { uno } = await dos(db);

		const vacia = inboxPage(db, uno.id);

		expect(vacia.total).toBe(0);
		expect(vacia.pages).toBe(1);
		expect(vacia.entries).toEqual([]);
	});
});
