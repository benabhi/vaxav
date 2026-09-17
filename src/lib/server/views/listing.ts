/**
 * Recortar, ordenar y paginar una lista. Una sola vez, para todas.
 *
 * **Es la tercera vez que aparecía el mismo bloque** —el listado de sistemas, el
 * registro del cuartel, ahora los miembros de una corporación— y siempre con las
 * mismas cuatro decisiones: una tabla de órdenes que el servidor sabe hacer, una
 * pila de filtros que se apilan, un desempate estable y el corte de la página. Con
 * el mismo bloque copiado, arreglar el redondeo de la última página significa
 * acordarse de los tres.
 *
 * Lo que **no** vive acá es qué se filtra y cómo se ordena cada cosa: eso es propio
 * de cada lista y entra como tablas. El día que haya que agregar un filtro, se
 * agrega una fila allá y esto no se toca.
 *
 * Es puro: recibe filas ya leídas y devuelve filas. Ordenar en memoria es lo
 * correcto hasta bien entradas las decenas de miles, y cuando deje de serlo, el
 * lugar donde cambiarlo es éste y nada más.
 */

/**
 * Lo que toda lista larga lee de la URL.
 *
 * **Viaja en la URL y no en el navegador** porque un recorte se comparte, se vuelve
 * con el botón de atrás y se recarga sin perderlo. Es la misma decisión de todo
 * listado del proyecto.
 */
export interface ConsultaLista {
	readonly search: string;
	readonly sort: string;
	readonly dir: 'asc' | 'desc';
	readonly page: number;
}

/**
 * Por qué columnas se puede ordenar una lista, y con qué clave.
 *
 * Es una tabla y no un `switch` porque **agregar una columna ordenable tiene que
 * ser agregar una fila**. La pantalla dibuja sus encabezados desde la misma
 * declaración, así que es imposible que un encabezado prometa un orden que el
 * servidor no sabe hacer.
 */
export type Ordenes<T> = Readonly<Record<string, (fila: T) => string | number>>;

/** El resultado: la página pedida y con qué contarla. */
export interface Pagina<T> {
	readonly rows: readonly T[];
	/** La página que se devolvió, que puede no ser la pedida si se pasó de largo. */
	readonly page: number;
	readonly pages: number;
	/** Cuántas filas pasaron el recorte, contando todas las páginas. */
	readonly found: number;
}

/**
 * Lee de la URL lo que toda lista necesita, validado.
 *
 * Nada de confiar en el parámetro: una columna de orden inventada o una página
 * negativa entran igual de fácil que las buenas, y el borde es acá.
 */
export function readListing<T>(
	params: URLSearchParams,
	sorts: Ordenes<T>,
	fallback: string
): ConsultaLista {
	const sort = params.get('orden') ?? '';

	return {
		search: (params.get('buscar') ?? '').trim().slice(0, 60),
		sort: sort in sorts ? sort : fallback,
		dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
		page: Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1)
	};
}

/**
 * Ordena y corta la página que se pidió.
 *
 * **La página se acota a lo que hay.** Quedarse en la siete de un listado que
 * ahora tiene dos es una pantalla vacía sin explicación, y eso pasa solo apenas
 * alguien filtra estando en una página alta.
 *
 * **El desempate no es un lujo**: dos filas con la misma clave de orden pueden
 * salir en cualquier orden entre dos cargas, y una lista que se reacomoda sola
 * mientras se la mira es una lista rota.
 *
 * Se puede resolver de dos maneras y las dos valen:
 *
 * - **Con una función**, cuando hay un campo único que sirve de segundo criterio
 *   —el nombre de un sistema, el distintivo de un piloto—.
 * - **Sin ella**, cuando las filas ya vienen en un orden determinista de la base.
 *   `sort` es estable desde ES2019, así que las empatadas conservan el orden en que
 *   llegaron. Es lo correcto cuando ese orden **significa algo**: los miembros de
 *   una corporación empatan en antigüedad —la fecha se guarda al segundo— y ahí el
 *   que entró primero es el de identificador más bajo, no el que va primero en el
 *   alfabeto.
 */
export function paginate<T>(
	rows: readonly T[],
	query: ConsultaLista,
	sorts: Ordenes<T>,
	perPage: number,
	tiebreak: (a: T, b: T) => number = () => 0
): Pagina<T> {
	const clave = sorts[query.sort] ?? Object.values(sorts)[0];
	const vuelta = query.dir === 'desc' ? -1 : 1;

	const ordenadas = [...rows].sort((a, b) => {
		if (!clave) return tiebreak(a, b);
		const izquierda = clave(a);
		const derecha = clave(b);
		if (izquierda === derecha) return tiebreak(a, b);
		return (izquierda > derecha ? 1 : -1) * vuelta;
	});

	const pages = Math.max(1, Math.ceil(ordenadas.length / perPage));
	const page = Math.min(query.page, pages);
	const desde = (page - 1) * perPage;

	return {
		rows: ordenadas.slice(desde, desde + perPage),
		page,
		pages,
		found: ordenadas.length
	};
}

/**
 * Aplica una pila de filtros: una fila entra si pasa todos.
 *
 * Existe para que cada lista declare sus filtros como tabla y no como una cadena
 * de `&&` que crece hasta no poder leerse. Agregar un filtro es agregar una fila.
 */
export function sift<T, Q>(
	rows: readonly T[],
	query: Q,
	filters: readonly ((fila: T, query: Q) => boolean)[]
): readonly T[] {
	return rows.filter((fila) => filters.every((cumple) => cumple(fila, query)));
}
