/**
 * Las guías de un árbol dibujado como lista plana.
 *
 * Es el cálculo que le dice a cada fila qué líneas verticales de sus ancestros
 * la atraviesan. Vive acá y no adentro de una vista porque lo necesitan dos —el
 * árbol del sistema que ve el piloto y el del constructor— y porque es
 * exactamente la clase de cálculo que se re-deduce mal: la primera vez que se
 * escribió dos veces, la segunda copia dejó la vertical de la raíz cortada en
 * las filas de profundidad dos, y no falla nada, sólo se ve roto.
 *
 * Es puro y no toca la base: entra una lista de nodos en preorden con su
 * profundidad, sale una lista de guías por fila.
 */

/** Lo único que hace falta saber de un nodo para calcular sus guías. */
export interface TreeNode {
	readonly depth: number;
	/** Si es el último hijo de su padre. */
	readonly isLast: boolean;
}

/**
 * Las guías de cada fila, en el mismo orden en que entraron los nodos.
 *
 * Se llevan en una pila mientras se baja: al llegar a un nodo se recorta a su
 * profundidad —lo que sobra son ramas ya cerradas— y queda una marca por
 * ancestro, que dice si la línea de ese ancestro sigue bajando. Es la forma
 * barata de dibujar un árbol con una lista plana.
 *
 * **El corrimiento de uno es la parte que se equivoca sola.** La columna `k` es
 * la del cuerpo de profundidad `k`, y lo que hay que saber ahí no es si *ese*
 * cuerpo tiene hermanos sino si su hijo en este camino es el último: la vertical
 * baja mientras le queden hijos por dibujar. Ese dato es el del nivel de abajo,
 * y de ahí que se descarte la primera marca, que no le corresponde a ninguna
 * columna.
 */
export function railsFor(nodes: readonly TreeNode[]): readonly (readonly boolean[])[] {
	const salida: boolean[][] = [];
	const sigue: boolean[] = [];

	for (const node of nodes) {
		sigue.length = node.depth;
		salida.push(sigue.slice(1));
		sigue.push(!node.isLast);
	}

	return salida;
}
