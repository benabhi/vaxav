/** El motor de acciones contra una base real: viajar, de punta a punta. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { body, fittedModule, pilot, pilotAction, pilotSkill, ship } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { travelDurationSeconds } from '$lib/game/actions';
import { coreSlotIndex } from '$lib/game/hulls';
import { TRAVEL_KIND, ActionError, currentAction, resolveIfDue, startTravel } from './actions';
import { skillXp } from './pilots';
import { activeShip, saveFit, shipFit, shipHull, shipReadout } from './ships';
import { bodyDistance, getBody } from './universe';

describe('la distancia', () => {
	it('suma el árbol hasta el ancestro común', () => {
		const db = seededDb();
		const puerto = getBody(db, 'puerto_anfora')!;
		const anforaI = getBody(db, 'anfora_i')!;
		// Puerto Ánfora (3) -> Ánfora II (95) -> estrella -> Ánfora I (40).
		expect(bodyDistance(db, puerto.id, anforaI.id)).toBe(3 + 95 + 40);
	});

	it('es cero hasta uno mismo', () => {
		const db = seededDb();
		const puerto = getBody(db, 'puerto_anfora')!;
		expect(bodyDistance(db, puerto.id, puerto.id)).toBe(0);
	});
});

describe('dar la orden de viajar', () => {
	it('crea la orden con su duración', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;

		const orden = startTravel(db, piloto, destino);

		expect(orden.kind).toBe(TRAVEL_KIND);
		expect(orden.originBodyId).toBe(piloto.locationId);
		expect(orden.destinationBodyId).toBe(destino.id);

		// La duración sale de la distancia y de la **velocidad real de su nave**,
		// que ya trae adentro el bono de Navegación con el que el minero arranca.
		// Se calcula acá en vez de asumir un número, para no depender ni de la XP
		// inicial de la profesión ni de los propulsores que traiga la Pioner el
		// día que cambien.
		const distancia = bodyDistance(db, orden.originBodyId, destino.id);
		const readout = shipReadout(db, piloto)!;
		expect(orden.durationSeconds).toBe(travelDurationSeconds(distancia, readout.speed));
	});

	it('acorta el mismo viaje con una nave más rápida', async () => {
		// Es lo que hace que equipar la nave importe fuera de la pantalla de nave.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;
		const distancia = bodyDistance(db, piloto.locationId, destino.id);

		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);
		const deFabrica = travelDurationSeconds(distancia, shipReadout(db, piloto)!.speed);

		// Los propulsores de mejor calificación empujan más y pesan un poco más.
		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[coreSlotIndex(hull, 'thrusters')] = 'thrusters_2a';
		saveFit(db, nave, codigos);

		const conMejores = travelDurationSeconds(distancia, shipReadout(db, piloto)!.speed);
		expect(conMejores).toBeLessThan(deFabrica);
	});

	it('se niega sin nave', async () => {
		// El servicio no confía en que la interfaz haya bloqueado el botón.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		// Primero las ranuras: con las claves foráneas activas, una nave no se
		// puede borrar dejando huérfano lo que tenía montado.
		const nave = activeShip(db, piloto.id)!;
		db.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();
		db.delete(ship).where(eq(ship.id, nave.id)).run();

		expect(() => startTravel(db, piloto, getBody(db, 'anfora_i')!)).toThrow(/nave/);
	});

	it('se niega con una orden ya en curso', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		expect(() => startTravel(db, piloto, getBody(db, 'anfora_ii')!)).toThrow(ActionError);
	});

	it('se niega a viajar al lugar donde ya se está', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const aqui = db.select().from(body).where(eq(body.id, piloto.locationId)).get()!;

		expect(() => startTravel(db, piloto, aqui)).toThrow(ActionError);
	});
});

describe('resolver la orden', () => {
	it('no hace nada si todavía no venció', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		expect(resolveIfDue(db, piloto)).toBeNull();
		expect(currentAction(db, piloto.id)).not.toBeNull();
	});

	it('mueve al piloto y reparte la experiencia cuando venció', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;
		const xpPrevio = skillXp(db, piloto.id).navigation ?? 0;
		const orden = startTravel(db, piloto, destino);

		// Simula que ya pasó el tiempo: nadie espera 28 segundos en un test.
		db.update(pilotAction)
			.set({ startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		const parte = resolveIfDue(db, piloto);

		expect(parte).not.toBeNull();
		expect(parte!.destinationName).toBe(destino.name);
		// La experiencia va al pozo de la rama y no a la habilidad usada: es lo
		// que convierte especializarse en una decisión (docs/systems/SKILLS.md).
		expect(parte!.deposit.family).toBe('piloting');
		expect(parte!.deposit.xp).toBeGreaterThan(0);
		expect(parte!.deposit.after).toBe(parte!.deposit.before + parte!.deposit.xp);

		const despues = db.select().from(pilot).where(eq(pilot.id, piloto.id)).get()!;
		expect(despues.locationId).toBe(destino.id);
		expect(currentAction(db, piloto.id)).toBeNull();

		// Y la habilidad **no** se movió sola: resolver un viaje ya no entrena
		// Navegación, la deja pagada en el pozo para que el piloto elija.
		const fila = db
			.select()
			.from(pilotSkill)
			.where(eq(pilotSkill.pilotId, piloto.id))
			.all()
			.find((row) => row.skill === 'navigation')!;
		expect(fila.xp).toBe(xpPrevio);
	});

	it('sólo la resuelve una vez', async () => {
		// Dos consultas simultáneas no pueden entregar el botín dos veces.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const orden = startTravel(db, piloto, getBody(db, 'anfora_i')!);
		db.update(pilotAction)
			.set({ startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		const primera = resolveIfDue(db, piloto);
		const segunda = resolveIfDue(db, piloto);

		expect(primera).not.toBeNull();
		expect(segunda).toBeNull();
	});
});
