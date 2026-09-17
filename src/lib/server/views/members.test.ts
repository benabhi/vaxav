/** El listado de miembros: quién entra, en qué orden y en qué página. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { corporation, pilot } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import type { Db } from '../db/types';
import { buildMiembros, readMembersQuery } from './members';

/** Mete al piloto en esa corporación, que es lo que hace el alta. */
function alistar(db: Db, callsign: string, code: string): void {
	const suya = db.select().from(corporation).where(eq(corporation.code, code)).get()!;
	db.update(pilot).set({ corporationId: suya.id }).where(eq(pilot.callsign, callsign)).run();
}

/** Una corporación con varios pilotos adentro, que es el caso que hay que probar. */
async function conGente(db: Db) {
	const jefe = await crearPiloto(db, 'Halcon');
	alistar(db, 'Halcon', 'casa_verlan');

	for (const nombre of ['Bruma', 'Ancla', 'Zurdo']) {
		await crearPiloto(db, nombre);
		alistar(db, nombre, 'casa_verlan');
	}

	// Y uno afuera, para verificar que no se cuela en la lista de los otros.
	await crearPiloto(db, 'Suelto');

	return db.select().from(pilot).where(eq(pilot.callsign, 'Halcon')).get() ?? jefe;
}

const consulta = (busqueda = '') => readMembersQuery(new URLSearchParams(busqueda));

describe('los miembros', () => {
	it('un independiente no tiene lista, y eso no es un error', async () => {
		const db = seededDb();
		const suelto = await crearPiloto(db, 'Suelto');

		const vista = buildMiembros(db, suelto);

		expect(vista.belongs).toBe(false);
		expect(vista.members).toEqual([]);
	});

	it('trae a los de su corporación y a nadie más', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		const vista = buildMiembros(db, jefe);

		expect(vista.total).toBe(4);
		expect(vista.members.map((uno) => uno.callsign)).not.toContain('Suelto');
		expect(vista.members.find((uno) => uno.callsign === 'Halcon')?.isYou).toBe(true);
	});

	/*
	 * Por antigüedad, que es como una corporación se cuenta a sí misma —quién estaba
	 * antes— y no alfabético, que no dice nada.
	 */
	it('entra ordenado por antigüedad', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		expect(buildMiembros(db, jefe).members[0].callsign).toBe('Halcon');
	});

	it('se ordena por la columna que se pida, en los dos sentidos', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		const alfabetico = buildMiembros(db, jefe, consulta('orden=distintivo'));
		expect(alfabetico.members.map((uno) => uno.callsign)).toEqual([
			'Ancla',
			'Bruma',
			'Halcon',
			'Zurdo'
		]);

		const alReves = buildMiembros(db, jefe, consulta('orden=distintivo&dir=desc'));
		expect(alReves.members[0].callsign).toBe('Zurdo');
	});

	it('busca por distintivo sin importar las mayúsculas', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		const vista = buildMiembros(db, jefe, consulta('buscar=BRU'));

		expect(vista.members.map((uno) => uno.callsign)).toEqual(['Bruma']);
		expect(vista.found).toBe(1);
		// El total no cambia al filtrar: es cuántos son, no cuántos se ven.
		expect(vista.total).toBe(4);
	});

	it('filtra por oficio, y sólo ofrece los que alguien tiene', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		const vista = buildMiembros(db, jefe, consulta('oficio=miner'));
		expect(vista.found).toBe(4);

		// Todos los de prueba son mineros, así que el desplegable tiene una sola
		// entrada: ofrecer las seis sería hacer perder el tiempo cinco veces.
		expect(vista.professions.map((una) => una.value)).toEqual(['miner']);
	});

	it('un oficio que no existe no filtra nada, en vez de vaciar la lista', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		expect(buildMiembros(db, jefe, consulta('oficio=pirata')).found).toBe(4);
	});

	it('pagina, y no deja pasarse de largo', async () => {
		const db = seededDb();
		const jefe = await conGente(db);

		const vista = buildMiembros(db, jefe, consulta('pagina=99'));

		expect(vista.pages).toBe(1);
		expect(vista.query.page).toBe(1);
		expect(vista.members.length).toBe(4);
	});
});
