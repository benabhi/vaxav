/**
 * Las reglas de escanear, sin base de datos.
 *
 * Lo que se prueba acá son las tres decisiones que ordenan el sistema: que un
 * instrumento mejor lea más rápido pero **nunca en cero**, que la habilidad
 * gobierne **cuánto se ve y no si se ve**, y que una lectura envejezca.
 */

import { describe, expect, it } from 'vitest';
import {
	BASE_SURVEY_SECONDS,
	MIN_SURVEY_SECONDS,
	REFERENCE_SENSOR_RANGE,
	SURVEY_FRESH_HOURS,
	depthLabel,
	surveyAge,
	surveyDepth,
	surveySeconds
} from './prospecting';

const UNA_HORA = 3_600_000;

describe('cuánto tarda una lectura', () => {
	it('con el escáner de referencia tarda lo que dice la base', () => {
		expect(surveySeconds(REFERENCE_SENSOR_RANGE)).toBe(BASE_SURVEY_SECONDS);
	});

	it('más alcance, menos tiempo', () => {
		expect(surveySeconds(REFERENCE_SENSOR_RANGE * 2)).toBeLessThan(BASE_SURVEY_SECONDS);
	});

	it('por mucho instrumento que se monte, mirar lleva un rato', () => {
		// La regla del piso, la misma que tienen la extracción y la horquilla.
		expect(surveySeconds(100_000)).toBe(MIN_SURVEY_SECONDS);
	});

	it('sin escáner no se acorta nada', () => {
		expect(surveySeconds(0)).toBe(BASE_SURVEY_SECONDS);
	});
});

describe('qué tan fina sale una lectura', () => {
	it('sin entrenar nada igual se lee algo', () => {
		// La habilidad no es el permiso: si lo fuera, un minero nuevo no podría
		// escanear nunca, porque Escaneo es de Ciencias y escanear es lo único que
		// paga Ciencias. Sería una puerta cerrada con la llave adentro.
		expect(surveyDepth(0, 0)).toBe(0);
	});

	it('Escaneo trae las cantidades', () => {
		expect(surveyDepth(1, 0)).toBe(1);
	});

	it('Prospección sola no alcanza: afina, no habilita', () => {
		expect(surveyDepth(0, 5)).toBe(0);
	});

	it('las dos juntas dan la lectura completa', () => {
		expect(surveyDepth(1, 1)).toBe(2);
	});
});

describe('cómo se nombra una lectura', () => {
	it('cada profundidad tiene su nombre', () => {
		expect(depthLabel(0)).toBe('Superficial');
		expect(depthLabel(1)).toBe('Con cantidades');
		expect(depthLabel(2)).toBe('Completa');
	});

	it('una profundidad que el catálogo ya no conoce se nombra igual', () => {
		// Lo que llega de la base es un entero: una lectura vieja guardada con una
		// profundidad que se sacó del catálogo tiene que poder dibujarse.
		expect(depthLabel(9)).toBe('Completa');
		expect(depthLabel(-1)).toBe('Superficial');
	});
});

describe('la antigüedad de una lectura', () => {
	it('la de recién no tiene horas', () => {
		const ahora = Date.now();
		expect(surveyAge(ahora, ahora)).toEqual({ hours: 0, stale: false });
	});

	it('sigue sirviendo hasta el día', () => {
		const ahora = Date.now();
		const casi = ahora - (SURVEY_FRESH_HOURS - 1) * UNA_HORA;

		expect(surveyAge(casi, ahora).stale).toBe(false);
	});

	it('al día cumplido queda vieja', () => {
		const ahora = Date.now();
		const justo = ahora - SURVEY_FRESH_HOURS * UNA_HORA;

		expect(surveyAge(justo, ahora)).toEqual({ hours: SURVEY_FRESH_HOURS, stale: true });
	});

	it('una lectura del futuro no cuenta horas negativas', () => {
		// El reloj del navegador y el del servidor no son el mismo: una lectura
		// escrita "dentro de un segundo" no tiene que salir con horas en negativo.
		const ahora = Date.now();
		expect(surveyAge(ahora + UNA_HORA, ahora).hours).toBe(0);
	});
});
