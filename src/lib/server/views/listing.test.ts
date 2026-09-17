/** Recortar, ordenar y paginar: las reglas que comparten todas las listas. */

import { describe, expect, it } from 'vitest';
import { paginate, readListing, sift, type Ordenes } from './listing';

interface Fila {
	readonly nombre: string;
	readonly peso: number;
}

const ORDENES: Ordenes<Fila> = {
	nombre: (fila) => fila.nombre,
	peso: (fila) => fila.peso
};

const FILAS: readonly Fila[] = [
	{ nombre: 'carla', peso: 2 },
	{ nombre: 'ana', peso: 3 },
	{ nombre: 'bruno', peso: 1 },
	{ nombre: 'dora', peso: 2 }
];

const porNombre = (a: Fila, b: Fila) => a.nombre.localeCompare(b.nombre, 'es');

describe('lo que se lee de la URL', () => {
	it('acepta lo que la lista sabe ordenar', () => {
		const query = readListing(
			new URLSearchParams('orden=peso&dir=desc&pagina=3'),
			ORDENES,
			'nombre'
		);
		expect(query).toEqual({ search: '', sort: 'peso', dir: 'desc', page: 3 });
	});

	/*
	 * Una columna de orden inventada o una página negativa entran igual de fácil que
	 * las buenas: el borde es acá y no en la pantalla.
	 */
	it('descarta lo que no existe y cae en el orden por omisión', () => {
		const query = readListing(
			new URLSearchParams('orden=color&dir=raro&pagina=-4'),
			ORDENES,
			'nombre'
		);
		expect(query.sort).toBe('nombre');
		expect(query.dir).toBe('asc');
		expect(query.page).toBe(1);
	});

	it('recorta la búsqueda y le saca los espacios de las puntas', () => {
		const query = readListing(new URLSearchParams(), ORDENES, 'nombre');
		expect(query.search).toBe('');

		const larga = 'x'.repeat(200);
		expect(
			readListing(new URLSearchParams(`buscar=  ${larga}  `), ORDENES, 'nombre').search
		).toHaveLength(60);
	});
});

describe('el recorte', () => {
	it('se apila: entra la fila que pasa todos', () => {
		const pasan = sift(FILAS, { peso: 2 }, [
			(fila) => fila.peso === 2,
			(fila) => fila.nombre.startsWith('d')
		]);
		expect(pasan.map((fila) => fila.nombre)).toEqual(['dora']);
	});

	it('sin filtros no saca a nadie', () => {
		expect(sift(FILAS, {}, []).length).toBe(FILAS.length);
	});
});

describe('el orden y la página', () => {
	it('ordena por la clave pedida, en los dos sentidos', () => {
		const query = readListing(new URLSearchParams('orden=peso'), ORDENES, 'nombre');
		expect(paginate(FILAS, query, ORDENES, 10, porNombre).rows.map((f) => f.nombre)).toEqual([
			'bruno',
			'carla',
			'dora',
			'ana'
		]);

		const alReves = readListing(new URLSearchParams('orden=peso&dir=desc'), ORDENES, 'nombre');
		expect(paginate(FILAS, alReves, ORDENES, 10, porNombre).rows[0].nombre).toBe('ana');
	});

	/*
	 * Dos filas con la misma clave pueden salir en cualquier orden entre dos cargas,
	 * y una lista que se reacomoda sola mientras se la mira es una lista rota.
	 */
	it('desempata siempre igual', () => {
		const query = readListing(new URLSearchParams('orden=peso'), ORDENES, 'nombre');
		const empatadas = paginate(FILAS, query, ORDENES, 10, porNombre)
			.rows.filter((fila) => fila.peso === 2)
			.map((fila) => fila.nombre);
		expect(empatadas).toEqual(['carla', 'dora']);
	});

	it('corta la página pedida y dice cuántas hay', () => {
		const query = readListing(new URLSearchParams('orden=nombre&pagina=2'), ORDENES, 'nombre');
		const pagina = paginate(FILAS, query, ORDENES, 2, porNombre);

		expect(pagina.rows.map((f) => f.nombre)).toEqual(['carla', 'dora']);
		expect(pagina.page).toBe(2);
		expect(pagina.pages).toBe(2);
		expect(pagina.found).toBe(4);
	});

	/*
	 * Pasa solo apenas alguien filtra estando en una página alta: quedarse en la
	 * siete de un listado que ahora tiene dos es una pantalla vacía sin explicación.
	 */
	it('no deja pasarse de largo: la página se acota a lo que hay', () => {
		const query = readListing(new URLSearchParams('pagina=99'), ORDENES, 'nombre');
		const pagina = paginate(FILAS, query, ORDENES, 2, porNombre);

		expect(pagina.page).toBe(2);
		expect(pagina.rows.length).toBe(2);
	});

	it('una lista vacía tiene una página, no cero', () => {
		const query = readListing(new URLSearchParams(), ORDENES, 'nombre');
		const pagina = paginate([], query, ORDENES, 25, porNombre);

		expect(pagina.pages).toBe(1);
		expect(pagina.page).toBe(1);
		expect(pagina.found).toBe(0);
	});
});
