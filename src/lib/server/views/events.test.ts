/** La URL se vuelve filtro, y el código guardado se vuelve una frase. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { record } from '../services/events';
import { buildRegistro, readQuery } from './events';

/** Lo que llega de la barra de direcciones. */
function consulta(cola: string) {
	return readQuery(new URLSearchParams(cola));
}

describe('leer el filtro de la URL', () => {
	it('sin nada, mira el registro entero desde la primera página', () => {
		expect(consulta('')).toEqual({ category: '', kind: '', day: '', actor: null, page: 1 });
	});

	it('entiende categoría, tipo, día, actor y página', () => {
		expect(consulta('categoria=roles&tipo=role.granted&dia=2026-09-16&quien=4&pagina=3')).toEqual({
			category: 'roles',
			kind: 'role.granted',
			day: '2026-09-16',
			actor: 4,
			page: 3
		});
	});

	/*
	 * Un enlace viejo, un parámetro escrito a mano o una categoría que se sacó
	 * del código tienen que dejar la pantalla en su estado por omisión, no en un
	 * error: es una URL que alguien pegó, no una orden que cambia algo.
	 */
	it.each([
		'categoria=inventada',
		'tipo=lo.que.sea',
		'dia=ayer',
		'dia=2026-9-16',
		'quien=nadie',
		'quien=0',
		'quien=-3',
		'pagina=cero',
		'pagina=-4'
	])('descarta lo que no entiende: %s', (cola) => {
		expect(consulta(cola)).toEqual({ category: '', kind: '', day: '', actor: null, page: 1 });
	});
});

describe('armar el registro', () => {
	it('redacta la frase a partir de lo guardado', () => {
		const db = seededDb();
		record(db, {
			kind: 'account.registered',
			actorId: null,
			payload: { callsign: 'Halcon', faction: 'Dominio' }
		});

		const fila = buildRegistro(db, consulta('')).rows[0];
		expect(fila.text).toBe('Se registró Halcon, de la facción Dominio.');
		expect(fila.label).toBe('Alta de piloto');
		expect(fila.categoryLabel).toBe('Cuentas');
	});

	/*
	 * Una fila escrita por una versión anterior puede no traer el campo que hoy
	 * se quiere mostrar. Se lee igual, con un relleno, en vez de tumbar la
	 * pantalla entera.
	 */
	it('redacta igual un evento al que le faltan datos', () => {
		const db = seededDb();
		record(db, { kind: 'account.registered', actorId: null });

		expect(buildRegistro(db, consulta('')).rows[0].text).toContain('—');
	});

	it('muestra el código a secas cuando el catálogo ya no lo conoce', () => {
		const db = seededDb();
		record(db, { kind: 'lo.que.venga', actorId: null });

		const fila = buildRegistro(db, consulta('')).rows[0];
		expect(fila.label).toBe('lo.que.venga');
		expect(fila.text).toBeTruthy();
	});

	it('filtra por categoría y, dentro de ella, por tipo', () => {
		const db = seededDb();
		record(db, { kind: 'account.registered', actorId: null });
		record(db, { kind: 'role.created', actorId: null });
		record(db, { kind: 'role.deleted', actorId: null });

		expect(buildRegistro(db, consulta('categoria=roles')).total).toBe(2);
		expect(buildRegistro(db, consulta('categoria=roles&tipo=role.deleted')).total).toBe(1);
		expect(buildRegistro(db, consulta('')).total).toBe(3);
	});

	it('ofrece tipos sólo cuando hay una categoría abierta', () => {
		const db = seededDb();

		expect(buildRegistro(db, consulta('')).kinds).toHaveLength(0);
		expect(buildRegistro(db, consulta('categoria=roles')).kinds.length).toBeGreaterThan(1);
	});

	/*
	 * Si la traza se achicara al día elegido sería una sola barra, y dejaría de
	 * servir justo para lo que sirve: ver a qué otro día saltar.
	 */
	it('deja la traza completa aunque haya un día elegido', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });

		const hoy = new Date().toISOString().slice(0, 10);
		const registro = buildRegistro(db, consulta(`dia=${hoy}`));

		expect(registro.total).toBe(1);
		expect(registro.days[registro.days.length - 1].total).toBe(1);
		expect(registro.days.length).toBeGreaterThan(1);
	});

	it('filtra por quién lo hizo y dice cómo se llama', async () => {
		const db = seededDb();
		// El alta ya le anota un evento propio: por eso el filtro por actor no
		// devuelve sólo lo que este test escribe, y está bien que así sea.
		const piloto = await crearPiloto(db, 'Halcon');

		record(db, { kind: 'role.created', actorId: piloto.id });
		record(db, { kind: 'role.deleted', actorId: null });

		const registro = buildRegistro(db, consulta(`quien=${piloto.id}`));
		expect(registro.total).toBe(2);
		expect(registro.rows.every((fila) => fila.actorId === piloto.id)).toBe(true);
		expect(registro.filters.actorName).toBe('Halcon');
	});

	/*
	 * El filtro puede dejar el resultado vacío, y el chip que dice por quién se
	 * está filtrando tiene que seguir nombrándolo: si no, queda un chip en blanco
	 * y no hay forma de saber qué se está mirando.
	 */
	it('nombra al actor aunque el filtro no devuelva nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Halcon');

		// Del universo todavía no se registra nada, así que el cruce queda vacío.
		const registro = buildRegistro(db, consulta(`quien=${piloto.id}&categoria=universe`));
		expect(registro.rows).toHaveLength(0);
		expect(registro.filters.actorName).toBe('Halcon');
	});

	it('un día sin nada deja la lista vacía sin romper la traza', () => {
		const db = seededDb();
		record(db, { kind: 'role.created', actorId: null });

		const registro = buildRegistro(db, consulta('dia=2020-01-01'));
		expect(registro.rows).toHaveLength(0);
		expect(registro.days).not.toHaveLength(0);
	});
});
