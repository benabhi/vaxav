/** Tocar una cuenta ajena: qué se puede, qué no, y qué queda escrito. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { authSession, pilot as pilotTable } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { eventsPage } from './events';
import { balance } from './wallet';
import { getBody } from './universe';
import { authenticate } from './pilots';
import { ensureAdminRole, grantRole, rolesOf } from './roles';
import { openSession, pilotForToken } from './sessions';
import {
	AccountError,
	accountBlockers,
	adjustCredits,
	deletePilot,
	movePilot,
	pilotById,
	renamePilot,
	resetPassword,
	setEmail
} from './accounts';

describe('la identidad', () => {
	it('se le cambia el distintivo y se le cierran las sesiones', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const token = openSession(db, piloto.id);

		renamePilot(db, piloto.id, 'Cuervo_Mayor', jefe);

		expect(pilotById(db, piloto.id)?.callsign).toBe('Cuervo_Mayor');
		// Enterarse al volver a entrar es mejor que descubrirlo a mitad de una
		// pantalla.
		expect(pilotForToken(db, token)).toBeNull();
	});

	it('no se lo deja repetir ni poner uno inválido', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		expect(() => renamePilot(db, piloto.id, 'Halcon', jefe)).toThrow(AccountError);
		expect(() => renamePilot(db, piloto.id, 'a', jefe)).toThrow(AccountError);
	});

	it('se le cambia el correo, y tampoco se repite', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		setEmail(db, piloto.id, 'otro@ejemplo.com', jefe);
		expect(pilotById(db, piloto.id)?.email).toBe('otro@ejemplo.com');

		expect(() => setEmail(db, piloto.id, 'halcon@ejemplo.com', jefe)).toThrow(AccountError);
	});

	/*
	 * Es la diferencia de fondo con el cambio que hace el dueño: ahí se pide la
	 * contraseña anterior porque el dueño puede demostrar que lo es, y acá el
	 * administrador no. Por eso echa a todas las sesiones.
	 */
	it('se le pone una contraseña nueva sin pedir la anterior', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const token = openSession(db, piloto.id);

		await resetPassword(db, piloto.id, 'otra-contrasena-larga', jefe);

		expect(await authenticate(db, 'Cuervo', 'contrasena-larga')).toBeNull();
		expect(await authenticate(db, 'Cuervo', 'otra-contrasena-larga')).not.toBeNull();
		expect(pilotForToken(db, token)).toBeNull();
	});

	it('no acepta una contraseña que no pasa la validación', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		await expect(resetPassword(db, piloto.id, 'corta', jefe)).rejects.toThrow(AccountError);
	});
});

describe('la ubicación', () => {
	it('se lo mueve a otro cuerpo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		const destino = getBody(db, 'habitat_talo')!;

		movePilot(db, piloto.id, destino.id, jefe);

		expect(pilotById(db, piloto.id)?.locationId).toBe(destino.id);
	});

	it('no a uno que no existe', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		expect(() => movePilot(db, piloto.id, 9999, jefe)).toThrow(AccountError);
	});
});

describe('los créditos', () => {
	/*
	 * El saldo lo escribe sólo `wallet.ts`. Un ajuste que tocara `pilot.credits` a
	 * mano rompería la única garantía que tiene la economía.
	 */
	it('se ajustan por asiento, y el saldo cuadra con el libro', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		adjustCredits(db, piloto.id, 5000, 'Compensación por un bug', jefe);

		expect(balance(db, piloto.id)).toBe(5000);
		expect(pilotById(db, piloto.id)?.credits).toBe(5000);
	});

	it('también hacia abajo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		adjustCredits(db, piloto.id, 5000, 'Compensación', jefe);
		adjustCredits(db, piloto.id, -2000, 'Se revierte la mitad', jefe);

		expect(balance(db, piloto.id)).toBe(3000);
	});

	it('exige motivo y un entero distinto de cero', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		expect(() => adjustCredits(db, piloto.id, 100, '  ', jefe)).toThrow(AccountError);
		expect(() => adjustCredits(db, piloto.id, 0, 'Nada', jefe)).toThrow(AccountError);
		expect(() => adjustCredits(db, piloto.id, 10.5, 'Medio', jefe)).toThrow(AccountError);
	});

	it('queda anotado con el monto y el motivo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		adjustCredits(db, piloto.id, 5000, 'Compensación', jefe);

		const fila = eventsPage(db, { kinds: ['account.credited'] }).rows[0];
		expect(fila.payload.amount).toBe(5000);
		expect(fila.payload.reason).toBe('Compensación');
		expect(fila.actor).toBe('Halcon');
	});
});

describe('la baja', () => {
	it('se lleva la cuenta y todo lo que colgaba', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');
		openSession(db, piloto.id);

		deletePilot(db, piloto.id, jefe);

		expect(pilotById(db, piloto.id)).toBeNull();
		expect(
			db.select().from(authSession).where(eq(authSession.pilotId, piloto.id)).all()
		).toHaveLength(0);
	});

	it('no deja borrar la propia', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');

		expect(accountBlockers(db, jefe.id, jefe.id)).not.toHaveLength(0);
		expect(() => deletePilot(db, jefe.id, jefe)).toThrow(AccountError);
	});

	it('no deja borrar al único administrador', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');
		const otro = await crearPiloto(db, 'Cuervo');
		grantRole(db, jefe.id, ensureAdminRole(db).id, null);

		expect(() => deletePilot(db, jefe.id, otro)).toThrow(AccountError);
	});

	/*
	 * El registro no cuelga del piloto, y por eso puede contar que existió. Es la
	 * razón por la que `audit_event` no lleva claves foráneas.
	 */
	it('el evento sobrevive a la cuenta borrada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');
		const jefe = await crearPiloto(db, 'Halcon');

		deletePilot(db, piloto.id, jefe);

		const fila = eventsPage(db, { kinds: ['account.deleted'] }).rows[0];
		expect(fila.payload.callsign).toBe('Cuervo');
		expect(fila.actor).toBe('Halcon');
	});

	it('los roles que había repartido sobreviven sin su padrino', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');
		const otro = await crearPiloto(db, 'Cuervo');
		const tercero = await crearPiloto(db, 'Lince');
		const admin = ensureAdminRole(db);

		grantRole(db, otro.id, admin.id, jefe.id);
		grantRole(db, tercero.id, admin.id, jefe.id);

		deletePilot(db, jefe.id, otro);

		expect(rolesOf(db, otro.id)).toHaveLength(1);
		expect(db.select().from(pilotTable).where(eq(pilotTable.id, jefe.id)).get()).toBeUndefined();
	});
});
