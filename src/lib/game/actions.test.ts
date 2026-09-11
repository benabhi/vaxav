/**
 * La matemática de viajar: duración a partir de la distancia y de la nave.
 *
 * Valida la fórmula sin base de datos. Que la velocidad mande es lo que hace que
 * la masa de los módulos cueste tiempo de verdad: una placa de blindaje que no
 * consume energía igual te frena, y frenar es llegar más tarde.
 */

import { describe, expect, it } from 'vitest';
import { REFERENCE_SPEED, SECONDS_PER_DISTANCE_UNIT, travelDurationSeconds } from './actions';
import { roundHalfEven } from './math';

describe('la duración de un viaje', () => {
	it('a la velocidad de referencia es la base', () => {
		// La constante está calibrada contra una lanzadera recién salida del taller.
		const distance = 100;
		expect(travelDurationSeconds(distance)).toBe(
			roundHalfEven(distance * SECONDS_PER_DISTANCE_UNIT)
		);
	});

	it('baja si la nave es más rápida', () => {
		// Es la razón de que la velocidad entre en la fórmula.
		expect(travelDurationSeconds(400, 300)).toBeLessThan(travelDurationSeconds(400, 100));
	});

	it('decrece con la velocidad, sin curvas raras', () => {
		const duraciones = [80, 150, 220, 400].map((speed) => travelDurationSeconds(300, speed));
		expect(duraciones).toEqual([...duraciones].sort((a, b) => b - a));
	});

	it('con el doble de velocidad es la mitad de viaje', () => {
		// La relación es inversa y directa: sin curvas raras que explicarle a nadie.
		const lento = travelDurationSeconds(600, REFERENCE_SPEED);
		const rapido = travelDurationSeconds(600, REFERENCE_SPEED * 2);
		expect(rapido).toBe(roundHalfEven(lento / 2));
	});

	it('no vuelve a aplicar Navegación', () => {
		// El bono ya está adentro de la velocidad; acá no se vuelve a aplicar. La
		// firma no lo acepta siquiera, que es la forma más barata de impedir que
		// alguien lo sume de nuevo sin darse cuenta. Contar el mismo bono dos veces
		// para el mismo efecto es justo lo que la regla de "una sola bolsa" de
		// ACTIONS.md quiere evitar. Este error de tipos es la prueba: si la firma
		// creciera, `npm run check` dejaría de pasar acá.
		// @ts-expect-error la firma sólo acepta distancia y velocidad
		travelDurationSeconds(100, REFERENCE_SPEED, 1.2);

		expect(travelDurationSeconds.length).toBe(1);
	});

	it('da segundos razonables con los valores reales de Ánfora', () => {
		// Ánfora I (40) a Ánfora II (95), ambos hijos directos de la estrella.
		const distanciaVecinos = 40 + 95;
		expect(travelDurationSeconds(distanciaVecinos)).toBeGreaterThanOrEqual(10);
		expect(travelDurationSeconds(distanciaVecinos)).toBeLessThanOrEqual(60);

		// Los dos extremos del sistema: Cinturón Exterior (520+1) a Ánfora I (40).
		const distanciaExtremos = 520 + 1 + 40;
		expect(travelDurationSeconds(distanciaExtremos)).toBeLessThanOrEqual(130);
	});

	it('nunca da menos de un segundo', () => {
		// Una distancia mínima no puede resolver instantáneamente.
		expect(travelDurationSeconds(0)).toBe(1);
		expect(travelDurationSeconds(1)).toBeGreaterThanOrEqual(1);
	});

	it('se niega con una distancia negativa', () => {
		expect(() => travelDurationSeconds(-1)).toThrow();
	});

	it('se niega con una nave sin velocidad', () => {
		// Sin propulsores no hay viaje, y la fórmula se niega antes de dividir.
		expect(() => travelDurationSeconds(100, 0)).toThrow();
	});
});
