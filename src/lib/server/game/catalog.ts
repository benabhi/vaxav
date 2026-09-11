/**
 * Herramientas para los catálogos estáticos del juego.
 *
 * Habilidades, profesiones, facciones, cascos y módulos se declaran como listas
 * literales y se consultan por código. Estas dos funciones son lo único que
 * comparten, y tenerlas acá evita repetir la misma conversión de tipos y el
 * mismo mensaje de error en cada catálogo.
 */

/** Cualquier cosa del juego que se identifique con un código. */
export interface Coded {
	readonly code: string;
}

/**
 * Indexa un catálogo por código conservando los códigos literales.
 *
 * El tipo que devuelve exige una entrada por cada código declarado, así que el
 * compilador avisa si un catálogo y su índice se desincronizan.
 */
export function indexByCode<T extends Coded>(items: readonly T[]): Readonly<Record<T['code'], T>> {
	const index = {} as Record<T['code'], T>;
	for (const item of items) index[item.code as T['code']] = item;
	return index;
}

/**
 * Busca una entrada por código y falla con un mensaje claro si no está.
 *
 * `what` es el sustantivo con su artículo —"la habilidad", "el casco"— para que
 * el mensaje se lea como una frase y no como un volcado de datos.
 */
export function lookup<T>(index: Readonly<Record<string, T>>, code: string, what: string): T {
	const found = index[code];
	if (!found) throw new Error(`No existe ${what} '${code}'`);
	return found;
}
