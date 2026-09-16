/** Sancionar cierra la puerta, y nunca contra uno mismo ni contra el último administrador. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { authSession, sanction } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { eventsPage } from './events';
import {
	ModerationError,
	activeCounts,
	blockedBy,
	blockedMessage,
	lift,
	punish,
	sanctionsOf
} from './moderation';
import { ensureAdminRole, grantRole } from './roles';
import { openSession, pilotForToken } from './sessions';

/** Una fecha futura, que es lo que pide una suspensión. */
function enUnaSemana(): Date {
	return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

describe('poner una sanción', () => {
	it('un aviso queda escrito y no cierra nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		punish(db, piloto.id, { kind: 'warning', reason: 'Lenguaje', until: null }, jefe);

		expect(sanctionsOf(db, piloto.id)).toHaveLength(1);
		expect(blockedBy(db, piloto.id)).toBeNull();
	});

	it('un baneo cierra la puerta', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		punish(db, piloto.id, { kind: 'ban', reason: 'Macros', until: null }, jefe);

		const cerrada = blockedBy(db, piloto.id);
		expect(cerrada?.kind).toBe('ban');
		expect(blockedMessage(cerrada!)).toContain('Macros');
	});

	/*
	 * Un baneo que recién surte efecto en el próximo ingreso es un baneo que el
	 * baneado decide cuándo empieza.
	 */
	it('le cierra las sesiones abiertas en el momento', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const token = openSession(db, piloto.id);

		expect(pilotForToken(db, token)).not.toBeNull();

		punish(db, piloto.id, { kind: 'ban', reason: 'Macros', until: null }, jefe);

		expect(pilotForToken(db, token)).toBeNull();
		expect(
			db.select().from(authSession).where(eq(authSession.pilotId, piloto.id)).all()
		).toHaveLength(0);
	});

	/* Un aviso no cierra nada, así que tampoco tiene por qué echar a nadie. */
	it('un aviso no le cierra la sesión', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const token = openSession(db, piloto.id);

		punish(db, piloto.id, { kind: 'warning', reason: 'Lenguaje', until: null }, jefe);

		expect(pilotForToken(db, token)).not.toBeNull();
	});

	it('exige motivo, y fecha sólo a la suspensión', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		expect(() => punish(db, piloto.id, { kind: 'ban', reason: '  ', until: null }, jefe)).toThrow(
			ModerationError
		);
		expect(() =>
			punish(db, piloto.id, { kind: 'suspension', reason: 'Macros', until: null }, jefe)
		).toThrow(ModerationError);
	});

	/* Una suspensión que nace vencida no suspende nada y confunde al que la puso. */
	it('rechaza una fecha que ya pasó', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

		expect(() =>
			punish(db, piloto.id, { kind: 'suspension', reason: 'Macros', until: ayer }, jefe)
		).toThrow(ModerationError);
	});

	it('no deja sancionarse a uno mismo', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');

		expect(() => punish(db, jefe.id, { kind: 'ban', reason: 'Prueba', until: null }, jefe)).toThrow(
			ModerationError
		);
	});

	/*
	 * Banear al último administrador deja el juego sin cuartel, y no queda ninguna
	 * pantalla desde donde arreglarlo.
	 */
	it('no deja banear al único administrador', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');
		const otro = await crearPiloto(db, 'Cuervo');
		grantRole(db, jefe.id, ensureAdminRole(db).id, null);

		expect(() => punish(db, jefe.id, { kind: 'ban', reason: 'Prueba', until: null }, otro)).toThrow(
			ModerationError
		);

		// Pero sí un aviso, que no le cierra la puerta.
		expect(() =>
			punish(db, jefe.id, { kind: 'warning', reason: 'Ojo', until: null }, otro)
		).not.toThrow();
	});
});

describe('levantar una sanción', () => {
	it('no la borra: le pone fecha y firma', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const puesta = punish(db, piloto.id, { kind: 'ban', reason: 'Macros', until: null }, jefe);

		lift(db, puesta.id, 'Se aclaró', jefe);

		const historial = sanctionsOf(db, piloto.id);
		expect(historial).toHaveLength(1);
		expect(historial[0].liftedAt).not.toBeNull();
		expect(historial[0].liftedByName).toBe('Halcon');
		expect(blockedBy(db, piloto.id)).toBeNull();
	});

	it('no se levanta dos veces', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const puesta = punish(db, piloto.id, { kind: 'ban', reason: 'Macros', until: null }, jefe);

		lift(db, puesta.id, 'Se aclaró', jefe);
		expect(() => lift(db, puesta.id, 'De nuevo', jefe)).toThrow(ModerationError);
	});

	/*
	 * Es la trampa del historial: levantar la suspensión vieja no puede abrir la
	 * puerta que el baneo posterior había cerrado.
	 */
	it('levantar una vieja no abre la que cerró otra', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		const vieja = punish(
			db,
			piloto.id,
			{ kind: 'suspension', reason: 'Primera', until: enUnaSemana() },
			jefe
		);
		punish(db, piloto.id, { kind: 'ban', reason: 'Reincidencia', until: null }, jefe);

		lift(db, vieja.id, 'Ya estaba', jefe);

		expect(blockedBy(db, piloto.id)?.kind).toBe('ban');
	});
});

describe('el historial', () => {
	it('cuenta las puestas por piloto, sin las vencidas ni las levantadas', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		const una = punish(db, piloto.id, { kind: 'warning', reason: 'Una', until: null }, jefe);
		punish(db, piloto.id, { kind: 'ban', reason: 'Dos', until: null }, jefe);
		expect(activeCounts(db)[piloto.id]).toBe(2);

		lift(db, una.id, 'Ya está', jefe);
		expect(activeCounts(db)[piloto.id]).toBe(1);
	});

	/* Una vencida existe en el historial pero ya no pesa, y la cuenta lo refleja. */
	it('no cuenta una suspensión que venció', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const puesta = punish(
			db,
			piloto.id,
			{ kind: 'suspension', reason: 'Macros', until: enUnaSemana() },
			jefe
		);

		// Se la envejece a mano: es lo único que no se puede fingir de otro modo.
		db.update(sanction)
			.set({ until: new Date(Date.now() - 1000) })
			.where(eq(sanction.id, puesta.id))
			.run();

		expect(activeCounts(db)[piloto.id]).toBeUndefined();
		expect(blockedBy(db, piloto.id)).toBeNull();
	});

	it('todo queda anotado en el registro, con quién lo hizo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const puesta = punish(db, piloto.id, { kind: 'ban', reason: 'Macros', until: null }, jefe);
		lift(db, puesta.id, 'Se aclaró', jefe);

		const filas = eventsPage(db, {}, 1, 50).rows;
		const sancion = filas.find((fila) => fila.kind === 'account.sanctioned')!;
		expect(sancion.actor).toBe('Halcon');
		expect(sancion.payload.reason).toBe('Macros');
		expect(filas.some((fila) => fila.kind === 'account.lifted')).toBe(true);
	});
});
