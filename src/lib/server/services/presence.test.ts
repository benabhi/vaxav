/** Quién más está donde estás: quién cuenta, quién no y a quién no se le muestra. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { getBody } from './universe';
import { startTravel } from './actions';
import { pilotsAt } from './presence';

/** El puerto principal del sistema sembrado, que es donde se juntan. */
const PUERTO = 'puerto_anfora';

describe('quiénes están', () => {
	it('lista a los otros y no a vos mismo', async () => {
		const db = seededDb();
		const uno = moverPiloto(db, await crearPiloto(db, 'Halcon'), PUERTO);
		moverPiloto(db, await crearPiloto(db, 'Zorro'), PUERTO);

		const aqui = pilotsAt(db, uno.locationId, uno.id);

		expect(aqui.total).toBe(1);
		expect(aqui.pilots.map((p) => p.callsign)).toEqual(['Zorro']);
	});

	it('no cuenta a los que están en otro lado', async () => {
		const db = seededDb();
		const uno = moverPiloto(db, await crearPiloto(db, 'Halcon'), PUERTO);
		moverPiloto(db, await crearPiloto(db, 'Zorro'), 'muelle_de_los_anillos');

		expect(pilotsAt(db, uno.locationId, uno.id).total).toBe(0);
	});

	it('el que salió de viaje deja de estar acá', async () => {
		const db = seededDb();
		const uno = moverPiloto(db, await crearPiloto(db, 'Halcon'), PUERTO);
		const otro = moverPiloto(db, await crearPiloto(db, 'Zorro'), PUERTO);

		expect(pilotsAt(db, uno.locationId, uno.id).total).toBe(1);

		// Mientras la nave va en camino, el piloto sigue teniendo guardado el cuerpo
		// del que salió —así el mapa sabe de dónde arrancó—, y sin el filtro
		// aparecería atracado en un lugar del que ya se fue. Es la misma verdad que
		// dice la pantalla de Ubicación: en tránsito no estás en ningún lado.
		startTravel(db, otro, getBody(db, 'muelle_de_los_anillos')!);

		expect(pilotsAt(db, uno.locationId, uno.id).total).toBe(0);
	});

	it('trae la corporación de cada uno, o vacío si vuela por su cuenta', async () => {
		const db = seededDb();
		const uno = moverPiloto(db, await crearPiloto(db, 'Halcon'), PUERTO);
		moverPiloto(db, await crearPiloto(db, 'Zorro'), PUERTO);

		// Se nace independiente, así que el vacío es el caso normal y no el raro.
		expect(pilotsAt(db, uno.locationId, uno.id).pilots[0].corporation).toBe('');
	});
});
