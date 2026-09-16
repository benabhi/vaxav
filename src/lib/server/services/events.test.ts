/** El registro se escribe una vez, sobrevive a lo que describe y se puede filtrar. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { auditEvent } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { ACTIVITY_DAYS, activityByDay, eventsAbout, eventsPage, record } from './events';
import { changePassword, deleteAccount } from './pilots';
import type { Db } from '../db/types';

/** Mueve un evento en el tiempo, que es lo único que no se puede fingir de otro modo. */
function fechar(db: Db, id: number, cuando: Date): void {
	db.update(auditEvent).set({ createdAt: cuando }).where(eq(auditEvent.id, id)).run();
}

/** Hace `dias` días, a mediodía UTC para no quedar pegado al borde del día. */
function haceDias(dias: number): Date {
	const fecha = new Date();
	fecha.setUTCHours(12, 0, 0, 0);
	fecha.setUTCDate(fecha.getUTCDate() - dias);
	return fecha;
}

describe('escribir un evento', () => {
	it('guarda el código, el sujeto y lo que se le pase', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		record(db, {
			kind: 'account.password_changed',
			actorId: piloto.id,
			subject: { kind: 'pilot', id: piloto.id },
			payload: { callsign: piloto.callsign }
		});

		const fila = eventsPage(db, { kinds: ['account.password_changed'] }).rows[0];
		expect(fila.kind).toBe('account.password_changed');
		expect(fila.subjectKind).toBe('pilot');
		expect(fila.subjectId).toBe(piloto.id);
		expect(fila.payload.callsign).toBe(piloto.callsign);
	});

	/*
	 * Hay cosas que no las hace nadie —la siembra, una orden que caduca sola— y
	 * forzar un responsable inventaría un culpable.
	 */
	it('acepta que no lo haya hecho nadie', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null, payload: { name: 'Moderador' } });

		const fila = eventsPage(db).rows[0];
		expect(fila.actorId).toBeNull();
		expect(fila.actor).toBeNull();
	});

	/*
	 * Perder un hecho es peor que guardarlo sin nombre: la pantalla ya sabe
	 * mostrar un código que no reconoce.
	 */
	it('guarda un código que el catálogo no conoce', () => {
		const db = seededDb();
		record(db, { kind: 'lo.que.venga', actorId: null });

		expect(eventsPage(db).rows[0].kind).toBe('lo.que.venga');
	});

	it('no se cae leyendo un JSON roto', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });
		db.update(auditEvent).set({ payload: 'esto no es json' }).run();

		expect(eventsPage(db).rows[0].payload).toEqual({});
	});
});

describe('sobrevivir a lo que describe', () => {
	/*
	 * Es la razón de ser de la tabla: si el registro se fuera con la cuenta, no
	 * habría forma de saber que esa cuenta existió. Por eso `actor_id` y
	 * `subject_id` no tienen clave foránea.
	 */
	it('la baja de una cuenta deja su evento, y el evento sabe de quién era', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cuervo');

		await deleteAccount(db, piloto, 'contrasena-larga');

		const fila = eventsPage(db, { kinds: ['account.deleted'] }).rows[0];
		expect(fila.payload.callsign).toBe('Cuervo');
		// La fila del piloto ya no existe, así que el nombre sale del JSON.
		expect(fila.actor).toBe('Cuervo');
		expect(fila.actorId).toBe(piloto.id);
	});

	it('el alta y el cambio de contraseña quedan anotados', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Halcon');

		await changePassword(db, piloto, 'contrasena-larga', 'otra-contrasena', 'otra-contrasena');

		const codigos = eventsPage(db).rows.map((fila) => fila.kind);
		expect(codigos).toContain('account.registered');
		expect(codigos).toContain('account.password_changed');
	});
});

describe('leer el registro', () => {
	it('lo devuelve de lo más nuevo a lo más viejo', () => {
		const db = seededDb();
		for (const nombre of ['uno', 'dos', 'tres']) {
			record(db, { kind: 'role.created', actorId: null, payload: { name: nombre } });
		}

		expect(eventsPage(db).rows.map((fila) => fila.payload.name)).toEqual(['tres', 'dos', 'uno']);
	});

	it('pagina sin repetir ni saltear, aunque todo caiga en el mismo segundo', () => {
		const db = seededDb();
		for (let paso = 0; paso < 7; paso++) {
			record(db, { kind: 'role.created', actorId: null, payload: { name: String(paso) } });
		}

		const primera = eventsPage(db, {}, 1, 3);
		const segunda = eventsPage(db, {}, 2, 3);
		const tercera = eventsPage(db, {}, 3, 3);

		expect(primera.pages).toBe(3);
		expect(primera.total).toBe(7);
		const vistos = [...primera.rows, ...segunda.rows, ...tercera.rows].map((fila) => fila.id);
		expect(new Set(vistos).size).toBe(7);
	});

	/*
	 * Una página fuera de rango devuelve la última, que es más útil que una lista
	 * vacía y evita validar el número en cada pantalla que enlace acá.
	 */
	it('acota la página a lo que existe', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });

		expect(eventsPage(db, {}, 99).page).toBe(1);
		expect(eventsPage(db, {}, 0).page).toBe(1);
	});

	it('con el registro vacío sigue habiendo una página', () => {
		const pagina = eventsPage(seededDb());
		expect(pagina).toMatchObject({ total: 0, page: 1, pages: 1 });
		expect(pagina.rows).toHaveLength(0);
	});

	it('filtra por código, por actor y por sujeto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		record(db, { kind: 'role.created', actorId: piloto.id, subject: { kind: 'role', id: 7 } });
		record(db, { kind: 'role.deleted', actorId: null, subject: { kind: 'role', id: 8 } });

		expect(eventsPage(db, { kinds: ['role.deleted'] }).total).toBe(1);
		expect(eventsPage(db, { actorId: piloto.id }).rows.every((f) => f.actorId === piloto.id)).toBe(
			true
		);
		expect(eventsAbout(db, 'role', 8)).toHaveLength(1);
	});

	/*
	 * Es la diferencia entre no pedir filtro y pedir uno que no puede cumplir
	 * nadie. Una categoría que todavía no registra nada pide una lista vacía, y
	 * confundirla con "todos" mostraría el registro entero justo cuando se
	 * esperaba verlo vacío.
	 */
	it('una lista de códigos vacía quiere decir ninguno, no todos', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });

		expect(eventsPage(db, { kinds: [] }).total).toBe(0);
		expect(eventsPage(db, { kinds: undefined }).total).toBe(1);
	});

	it('filtra por fecha en las dos puntas', () => {
		const db = seededDb();
		const viejo = record(db, { kind: 'role.created', actorId: null });
		record(db, { kind: 'role.deleted', actorId: null });
		fechar(db, viejo.id, haceDias(10));

		expect(eventsPage(db, { since: haceDias(2) }).total).toBe(1);
		expect(eventsPage(db, { until: haceDias(2) }).total).toBe(1);
	});
});

describe('la traza de actividad', () => {
	it('devuelve todos los días del período, incluidos los vacíos', () => {
		const dias = activityByDay(seededDb());

		expect(dias).toHaveLength(ACTIVITY_DAYS);
		expect(dias.every((dia) => dia.total === 0)).toBe(true);
		// El último es hoy: la traza se lee de izquierda a derecha y termina ahora.
		expect(dias[dias.length - 1].day).toBe(new Date().toISOString().slice(0, 10));
	});

	it('cuenta cada evento en su día', () => {
		const db = seededDb();
		const ayer = record(db, { kind: 'role.created', actorId: null });
		fechar(db, ayer.id, haceDias(1));
		record(db, { kind: 'role.created', actorId: null });
		record(db, { kind: 'role.created', actorId: null });

		const dias = activityByDay(db);
		expect(dias[dias.length - 1].total).toBe(2);
		expect(dias[dias.length - 2].total).toBe(1);
	});

	it('no mira más atrás del período, aunque haya eventos más viejos', () => {
		const db = seededDb();
		const antiguo = record(db, { kind: 'role.created', actorId: null });
		fechar(db, antiguo.id, haceDias(ACTIVITY_DAYS + 5));

		expect(activityByDay(db).every((dia) => dia.total === 0)).toBe(true);
	});

	it('respeta el filtro de tipo', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });
		record(db, { kind: 'role.deleted', actorId: null });

		const dias = activityByDay(db, { kinds: ['role.deleted'] });
		expect(dias[dias.length - 1].total).toBe(1);
	});
});
