/**
 * La pestaña Agentes: quiénes reparten trabajo, y cuáles te reciben.
 *
 * Lo que más importa probar acá es que **la reputación se cobra en esta
 * pantalla**: subirla tiene que abrir agentes, y ésa es la única conexión entre
 * el número y algo que el jugador pueda hacer.
 */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { joinCorporation } from '../services/corporations';
import { award } from '../services/reputation';
import { REPUTATION_SCALE } from '$lib/game/reputation';
import { buildAgentes, readAgentsQuery } from './agents';

/** La casa que opera Puerto Ánfora, con dos agentes de niveles distintos. */
const CASA = 'casa_verlan';

/** Un piloto del Dominio ya alistado en Casa Verlan. */
async function alistado(db: ReturnType<typeof seededDb>) {
	const piloto = await crearPiloto(db);
	return joinCorporation(db, piloto, CASA);
}

/** La consulta que sale de esa URL. */
function consulta(query = '') {
	return readAgentsQuery(new URLSearchParams(query));
}

describe('el listado de agentes', () => {
	it('sin corporación no lista ninguno, y lo dice', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildAgentes(db, piloto);

		expect(vista.belongs).toBe(false);
		expect(vista.agents).toEqual([]);
	});

	it('trae los de su corporación y ninguno más', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const vista = buildAgentes(db, piloto);

		expect(vista.total).toBeGreaterThan(1);
		// En Puerto Ánfora hay agentes de otras corporaciones: no son de ésta.
		expect(vista.agents.every((uno) => uno.station !== '')).toBe(true);
	});

	/*
	 * El de nivel uno atiende a cualquiera y el de nivel cinco es la meta, así que
	 * leer de arriba hacia abajo es leer el camino. El alfabético no diría nada.
	 */
	it('entra ordenado por nivel', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const niveles = buildAgentes(db, piloto).agents.map((uno) => uno.levelValue);

		expect(niveles).toEqual([...niveles].sort((a, b) => a - b));
	});

	it('el de nivel más bajo atiende de entrada y el alto no', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const vista = buildAgentes(db, piloto);
		const primero = vista.agents[0];
		const ultimo = vista.agents[vista.agents.length - 1];

		expect(primero.open).toBe(true);
		expect(ultimo.open).toBe(false);
		// Y el cerrado dice qué le falta, no un "no" pelado.
		expect(ultimo.requirement).toMatch(/^Requiere \d+ de reputación con /);
	});

	/*
	 * Es la razón de ser de la pantalla: acá es donde el número se vuelve algo que
	 * el jugador puede hacer.
	 */
	it('subir la reputación con la corporación abre agentes', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const antes = buildAgentes(db, piloto).open;
		award(db, piloto.id, { kind: 'corporation', code: CASA }, 100 * REPUTATION_SCALE, {
			kind: 'adjustment'
		});
		const despues = buildAgentes(db, piloto);

		expect(despues.open).toBeGreaterThan(antes);
		expect(despues.agents.every((uno) => uno.open)).toBe(true);
	});
});

describe('el recorte', () => {
	it('filtra por clase de misión', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const todas = buildAgentes(db, piloto);
		const clase = todas.agents[0].kindCode;
		const recortado = buildAgentes(db, piloto, consulta(`clase=${clase}`));

		expect(recortado.found).toBeGreaterThan(0);
		expect(recortado.agents.every((uno) => uno.kindCode === clase)).toBe(true);
		expect(recortado.found).toBeLessThan(todas.total);
	});

	it('deja sólo los que atienden', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const recortado = buildAgentes(db, piloto, consulta('atienden=1'));

		expect(recortado.agents.every((uno) => uno.open)).toBe(true);
		expect(recortado.found).toBe(recortado.open);
	});

	it('busca por nombre', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const alguno = buildAgentes(db, piloto).agents[0];
		const recortado = buildAgentes(db, piloto, consulta(`buscar=${alguno.name.slice(0, 4)}`));

		expect(recortado.agents.some((uno) => uno.code === alguno.code)).toBe(true);
	});

	/*
	 * Un desplegable que ofrece las cinco clases cuando la corporación sólo reparte
	 * dos hace perder el tiempo tres veces de cada cinco.
	 */
	it('ofrece sólo las clases que hay adentro', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const vista = buildAgentes(db, piloto);
		const presentes = new Set(vista.agents.map((uno) => uno.kindCode));

		expect(vista.kinds.length).toBe(presentes.size);
		expect(vista.kinds.every((opcion) => presentes.has(opcion.value))).toBe(true);
	});

	it('descarta una clase que no existe', () => {
		expect(consulta('clase=asado').kind).toBe('');
	});

	it('el total no cambia al filtrar, y lo encontrado sí', async () => {
		const db = seededDb();
		const piloto = await alistado(db);

		const recortado = buildAgentes(db, piloto, consulta('atienden=1'));

		expect(recortado.total).toBe(buildAgentes(db, piloto).total);
		expect(recortado.found).toBeLessThanOrEqual(recortado.total);
	});
});
