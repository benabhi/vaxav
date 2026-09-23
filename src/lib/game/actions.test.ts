/**
 * La matemática de viajar: duración a partir de la distancia y de la nave.
 *
 * Valida la fórmula sin base de datos. Son **dos sumandos** —alineación más
 * crucero— y lo que se prueba acá es que sigan separados: la alineación se paga
 * igual en el viaje más corto del sistema, y sólo el crucero escala con la
 * distancia.
 */

import { describe, expect, it } from 'vitest';
import { REFERENCE_SHIP, travelDurationSeconds, travelXp, type TravelShip } from './actions';
import { buildReadout, defaultFit } from './fitting';
import { STARTING_HULL, getHull } from './hulls';
import { warpSeconds } from './warp';

/** Una nave de viaje cualquiera, para no depender del catálogo en cada caso. */
function nave(warpSpeed: number, alignSeconds: number): TravelShip {
	return { warpSpeed, alignSeconds };
}

describe('la duración de un viaje', () => {
	it('con la nave de referencia es alineación más crucero', () => {
		// La nave de referencia es la lanzadera de astillero, que es contra la que
		// está calibrado el universo sembrado.
		const distance = 100;
		expect(travelDurationSeconds(distance)).toBe(
			REFERENCE_SHIP.alignSeconds + warpSeconds(distance, REFERENCE_SHIP.warpSpeed)
		);
	});

	it('baja si la nave tiene más warp', () => {
		// Es la razón de que la velocidad de warp entre en la fórmula.
		expect(travelDurationSeconds(400, nave(60, 4))).toBeLessThan(
			travelDurationSeconds(400, nave(20, 4))
		);
	});

	it('decrece con el warp, sin curvas raras', () => {
		const duraciones = [20, 25, 35, 60].map((warp) => travelDurationSeconds(300, nave(warp, 4)));
		expect(duraciones).toEqual([...duraciones].sort((a, b) => b - a));
	});

	it('con el doble de warp es la mitad del tramo que escala, no del viaje', () => {
		// **La alineación no se divide**, y ése es todo el modelo nuevo: comprar
		// warp acorta el crucero y no el arranque.
		const lenta = nave(25, 10);
		const rapida = nave(50, 10);

		const crucero = travelDurationSeconds(600, lenta) - lenta.alignSeconds;
		expect(travelDurationSeconds(600, rapida)).toBe(rapida.alignSeconds + crucero / 2);
	});

	it('paga la alineación entera aunque el viaje sea de una unidad', () => {
		// El costo fijo es fijo: es lo que diferencia un trayecto corto de uno largo.
		const una = nave(50, 12);
		expect(travelDurationSeconds(1, una)).toBe(una.alignSeconds);
	});

	it('dos distancias con la misma nave se diferencian sólo en el crucero', () => {
		const una = nave(35, 9);
		const diferencia = travelDurationSeconds(700, una) - travelDurationSeconds(200, una);
		expect(diferencia).toBe(warpSeconds(700, 35) - warpSeconds(200, 35));
	});

	it('y esa diferencia no lleva nada de alineación adentro', () => {
		// El mismo examen sin nombrar la cuenta: dos naves que cruzan igual de rápido
		// y alinean muy distinto **abren la misma brecha** entre un viaje corto y uno
		// largo. Si algo de la alineación se hubiera colado en el tramo que escala,
		// la torpe abriría más.
		const brecha = (una: TravelShip) =>
			travelDurationSeconds(700, una) - travelDurationSeconds(200, una);

		expect(brecha(nave(35, 15))).toBe(brecha(nave(35, 3)));
	});

	it('no vuelve a aplicar Maniobra', () => {
		// El bono ya está adentro de la velocidad; acá no se vuelve a aplicar. La
		// firma no lo acepta siquiera, que es la forma más barata de impedir que
		// alguien lo sume de nuevo sin darse cuenta. Contar el mismo bono dos veces
		// para el mismo efecto es justo lo que la regla de "una sola bolsa" de
		// ACTIONS.md quiere evitar. Este error de tipos es la prueba: si la firma
		// creciera, `npm run check` dejaría de pasar acá.
		// @ts-expect-error la firma sólo acepta distancia y nave
		travelDurationSeconds(100, REFERENCE_SHIP, 1.2);

		expect(travelDurationSeconds.length).toBe(1);
	});

	it('usa de referencia una Pioner de astillero, y no dos literales copiados', () => {
		// El mapa le promete tiempos a un piloto que todavía no tiene nave, y esa
		// promesa tiene que salir del mismo lugar que la que paga la orden. Si los
		// dos números se escribieran a mano, el día que la Pioner cambie de clase la
		// pantalla sin nave seguiría prometiendo los de antes.
		const astillero = buildReadout(getHull(STARTING_HULL), defaultFit(getHull(STARTING_HULL)));

		expect(REFERENCE_SHIP.warpSpeed).toBe(astillero.warpSpeed);
		expect(REFERENCE_SHIP.alignSeconds).toBe(astillero.alignSeconds);
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

	it('y da exactamente los que aprobó el documento', () => {
		// docs/systems/SHIPS.md, «La única constante de calibración»: en el trayecto
		// más largo de Ánfora la Pioner pasa de 111 a 116 segundos —los cinco de
		// diferencia son la alineación, y el ritmo del crucero no se movió—, la
		// Percal llega a 235 y la Mula a 295. **Los cascos lentos se frenaron a
		// propósito**, con estos números sobre la mesa al aprobarlo: si alguno se
		// corre, es una decisión de balance y no un descuido.
		const EXTREMOS = 520 + 1 + 40;

		expect(travelDurationSeconds(EXTREMOS)).toBe(116);
		expect(travelDurationSeconds(EXTREMOS, nave(25, 11))).toBe(235);
		expect(travelDurationSeconds(EXTREMOS, nave(20, 15))).toBe(295);
	});

	it('nunca da menos de un segundo', () => {
		// Una distancia mínima no puede resolver instantáneamente: el piso lo pone
		// la alineación, que nunca es cero.
		expect(travelDurationSeconds(0)).toBeGreaterThanOrEqual(1);
		expect(travelDurationSeconds(1)).toBeGreaterThanOrEqual(1);
	});

	it('se niega con una distancia negativa', () => {
		expect(() => travelDurationSeconds(-1)).toThrow();
	});

	it('se niega con una nave sin motor de warp', () => {
		// Sin warp no hay viaje, y la fórmula se niega antes de dividir.
		expect(() => travelDurationSeconds(100, nave(0, 4))).toThrow();
	});
});

describe('lo que paga un viaje', () => {
	/*
	 * **Paga por lo recorrido y no por lo que tardó**, y ése es el arreglo entero.
	 * Con la duración, la misma ruta pagaba 21 de Pilotaje en la exploradora y 64
	 * en la carguera, y montar un optimizador —la mejora que existe para acortar el
	 * viaje— le sacaba al piloto el 41 % de lo que ese viaje pagaba: **mejorar la
	 * nave castigaba**, que es un incentivo al revés y de los que se descubren
	 * tarde, cuando ya hay pilotos que aprendieron a no mejorarla.
	 *
	 * Los números salen de docs/systems/SKILLS.md —el pozo es
	 * `10 × minutos × dificultad`— y de la dificultad 0,5 que viajar se lleva por
	 * ser el piso del rango documentado: no arriesga nada, no gasta nada y no hay
	 * forma de hacerlo mal. Los minutos son los de la nave de referencia, así que
	 * la cuenta del documento sigue siendo la misma y no hay una segunda al lado.
	 */
	it('deposita lo que dice la distancia', () => {
		expect(travelXp(135)).toBe(2);
		expect(travelXp(738)).toBe(12);
		expect(travelXp(1041)).toBe(17);
	});

	it('y no mira con qué nave se hizo', () => {
		// La firma es la que lo garantiza, y es la forma más barata de garantizarlo:
		// no recibe la nave, así que no hay por dónde colar el casco en la cuenta.
		// @ts-expect-error la cuenta sólo acepta la distancia
		travelXp(738, nave(20, 15));

		expect(travelXp.length).toBe(1);
	});

	it('no le cobra la alineación, que no es distancia recorrida', () => {
		// Cien unidades son veinte segundos de crucero y cuatro de alineación. Los
		// veinte pagan 1 y los veinticuatro pagarían 2: si el arranque entrara en la
		// cuenta, un casco torpe cobraría más por la misma ruta, que es justo el
		// incentivo que se acaba de sacar.
		expect(travelDurationSeconds(100)).toBe(24);
		expect(travelXp(100)).toBe(1);
		expect(travelXp(100)).not.toBe(2);
	});

	it('trunca a cero el saltito de al lado', () => {
		// **Deliberado**: el pozo trunca, así que ir de una luna a su planeta no
		// deposita nada. Es lo que corta el farmeo de saltitos, que con una acción
		// que no arriesga ni gasta sería la forma más barata de subir Pilotaje.
		expect(travelXp(0)).toBe(0);
		expect(travelXp(10)).toBe(0);
	});

	it('nunca paga menos por ir más lejos', () => {
		// La propiedad que tiene que valer siempre, y la que una fórmula con curvas
		// rompería sin que se note: más camino nunca es menos experiencia.
		const pagos = [0, 60, 135, 400, 738, 1041, 5000].map(travelXp);
		expect(pagos).toEqual([...pagos].sort((a, b) => a - b));
	});

	it('se niega con una distancia negativa', () => {
		expect(() => travelXp(-1)).toThrow(RangeError);
	});
});
