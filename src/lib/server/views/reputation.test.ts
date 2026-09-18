/** El panorama del piloto: quién entra en la lista, y qué nivel de agente abre. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { joinCorporation } from '../services/corporations';
import { award } from '../services/reputation';
import { buildPanorama, readPanoramaQuery } from './reputation';

/** Del Dominio, que es la facción con la que nace el piloto de prueba. */
const CASA = 'casa_verlan';
/** Otra del Dominio, para que haya una que no es la suya. */
const OTRA = 'vigilia_anfora';

describe('las banderas', () => {
	it('están todas, tenga número con ellas o no', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const panorama = buildPanorama(db, piloto);

		// Son cuatro contadas y son el marco del sector: una bandera en cero no es
		// una ausencia, es un dato —«no te conocen»— y esconderla dejaría la
		// pantalla en blanco justo al empezar.
		expect(panorama.factions.length).toBeGreaterThanOrEqual(3);
		expect(panorama.factions.every((una) => una.value === '0,00')).toBe(true);
		expect(panorama.known).toBe(0);
	});

	it('llevan su color propio, que es el mismo en todo el juego', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(buildPanorama(db, piloto).factions.every((una) => una.color !== '')).toBe(true);
	});
});

describe('las corporaciones', () => {
	it('están todas las del sector, aunque ninguna te conozca', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const panorama = buildPanorama(db, piloto);

		// Es un directorio antes que un resumen: una corporación en cero no es
		// ruido, es la que todavía no trabajaste, y saber que existe y bajo qué
		// bandera está es la mitad de la decisión.
		expect(panorama.total).toBeGreaterThan(5);
		expect(panorama.corporations.every((una) => una.value === '0,00')).toBe(true);
		expect(panorama.known).toBe(0);
	});

	it('la tuya aparece aunque esté en cero', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const alistado = joinCorporation(db, piloto, CASA);
		award(db, alistado.id, { kind: 'corporation', code: OTRA }, 5_000, {
			kind: 'adjustment',
			memo: 'de prueba'
		});

		const panorama = buildPanorama(db, alistado);
		const suya = panorama.corporations.find((una) => una.mine)!;

		// Es tuya y está marcada, pero **no se ancla arriba**: la lista se ordena por
		// reputación y de mayor a menor, y un encabezado que promete un orden tiene
		// que cumplirlo. Se la reconoce por el rótulo, no por el lugar.
		expect(suya.value).toBe('0,00');
		expect(panorama.corporations[0].code).toBe(OTRA);
	});

	it('a igualdad de número, la tuya primero', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const alistado = joinCorporation(db, piloto, CASA);

		// Las dos en cero: ahí sí decide el desempate, y lo propio va antes que lo
		// ajeno. Sin desempate, dos filas empatadas cambian de lugar entre cargas.
		award(db, alistado.id, { kind: 'corporation', code: OTRA }, 0, {
			kind: 'adjustment',
			memo: 'de prueba'
		});

		expect(buildPanorama(db, alistado).corporations[0].mine).toBe(true);
	});

	it('se puede recortar por bandera y por nombre', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const alistado = joinCorporation(db, piloto, CASA);
		award(db, alistado.id, { kind: 'corporation', code: OTRA }, 5_000, {
			kind: 'adjustment',
			memo: 'de prueba'
		});

		// Nace con recorte y paginado porque la reputación se gana con cualquier
		// corporación del mundo: un piloto veterano va a tener decenas.
		const porNombre = buildPanorama(
			db,
			alistado,
			readPanoramaQuery(new URLSearchParams('buscar=verlan'))
		);
		expect(porNombre.found).toBe(1);
		expect(porNombre.total).toBeGreaterThan(1);

		// El recorte por bandera corta de verdad, y deja afuera a las que no son.
		const ajenas = buildPanorama(
			db,
			alistado,
			readPanoramaQuery(new URLSearchParams('bandera=concord'))
		);
		expect(ajenas.found).toBeGreaterThan(0);
		expect(ajenas.found).toBeLessThan(ajenas.total);
		expect(ajenas.corporations.every((una) => una.faction === 'concord')).toBe(true);
	});
});

describe('hasta qué nivel de agente te abre cada una', () => {
	it('la bandera abre ese nivel en todas sus corporaciones', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// Una corporación que no te conoce de nada, y su bandera que sí.
		award(db, piloto.id, { kind: 'corporation', code: CASA }, 1_000, {
			kind: 'adjustment',
			memo: 'de prueba'
		});
		award(db, piloto.id, { kind: 'faction', code: 'dominion' }, 26_000, {
			kind: 'adjustment',
			memo: 'de prueba'
		});

		const panorama = buildPanorama(db, piloto);
		const suya = panorama.corporations.find((una) => una.code === CASA)!;

		// **Es la regla que el jugador no entiende hasta que la ve escrita**: la
		// corporación está en el primer escalón y sin embargo abre el tercero,
		// porque la bandera llegó ahí y abre ese nivel en todas las que la llevan.
		expect(suya.tier).toBe('Desconocido');
		expect(suya.opens).toBe('III');
	});

	it('y una bandera se abre a sí misma, sin una escalera por encima', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		award(db, piloto.id, { kind: 'faction', code: 'dominion' }, 11_000, {
			kind: 'adjustment',
			memo: 'de prueba'
		});

		const dominio = buildPanorama(db, piloto).factions.find((una) => una.code === 'dominion')!;

		expect(dominio.tier).toBe('Conocido');
		expect(dominio.opens).toBe('II');
	});
});
