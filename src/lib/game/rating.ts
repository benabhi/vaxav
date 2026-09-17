/**
 * El IPP: el Índice de Pericia del Piloto.
 *
 * Un número para saber qué tan lejos llegó un piloto: la **experiencia invertida
 * en habilidades**, sumada.
 *
 * Se lo nombra por la sigla, como el TSI de Hattrick, y ése es medio el punto:
 * un índice se vuelve una cosa del juego recién cuando los jugadores lo dicen en
 * voz alta. En pantalla va «IPP» y el nombre entero aparece donde haya lugar para
 * explicarlo.
 *
 * Responde «¿qué tan armado está este piloto?» sin tener que leerle el árbol
 * entero: sirve para compararse, para ordenar una lista y —el día que existan—
 * para que una corporación de jugadores pida un mínimo para entrar.
 *
 * **Se extiende solo.** No hay nada que registrar cuando se agrega una habilidad
 * al catálogo: si tiene experiencia adentro, entra en la cuenta. Ésa es la razón
 * de que sea la XP y no una fórmula con pesos por rama, que habría que revisar
 * cada vez que el árbol crece —y el árbol se quiere grande a propósito—.
 *
 * **Cuenta lo invertido y no el pozo.** Lo que está sin gastar es potencial, no
 * poder: dos pilotos con el mismo pozo y distinto árbol no vuelan igual.
 *
 * Y tiene **rangos con nombre**, como los de Elite Dangerous. Un número suelto
 * que sube no se siente como progreso: cruzar un umbral y pasar de Veterano a
 * Experto, sí. Es la misma idea que los escalones de la reputación, del otro lado
 * del juego.
 *
 * Reglas puras: acá no hay base de datos ni jugador. Corresponde a
 * docs/systems/SKILLS.md.
 */

/** Un rango del índice: dónde empieza y cómo se llama. */
export interface RatingRank {
	/** De cero en adelante, para que la pantalla sepa cuánto encender. */
	readonly step: number;
	readonly name: string;
	/** El índice a partir del cual se lleva ese nombre. */
	readonly at: number;
}

/**
 * Los siete rangos, de menor a mayor.
 *
 * Son **datos de balance**, como los escalones de la reputación: los umbrales se
 * van a mover cuando el catálogo de habilidades crezca, y moverlos tiene que ser
 * cambiar esta tabla y nada más.
 *
 * Los saltos triplican, que es la misma forma de la curva de experiencia: cada
 * nivel de una habilidad cuesta el triple que el anterior, así que un índice que
 * avanzara parejo mentiría sobre lo que costó llegar. Con las veintitrés
 * habilidades de hoy, tenerlas todas al máximo da 580.800, así que Élite es una
 * meta lejana y no un trámite.
 */
export const RATING_RANKS: readonly RatingRank[] = [
	{ step: 0, name: 'Recluta', at: 0 },
	{ step: 1, name: 'Novato', at: 1_000 },
	{ step: 2, name: 'Competente', at: 5_000 },
	{ step: 3, name: 'Veterano', at: 20_000 },
	{ step: 4, name: 'Experto', at: 60_000 },
	{ step: 5, name: 'Maestro', at: 180_000 },
	{ step: 6, name: 'Élite', at: 420_000 }
];

/**
 * El índice, a partir de lo invertido en cada rama.
 *
 * Recibe lo ya sumado por rama y no la lista de habilidades porque quien lo
 * consume ya tiene eso a mano: volver a recorrer el árbol sería recorrerlo dos
 * veces para llegar al mismo número.
 */
export function pilotIndex(investedByFamily: Readonly<Record<string, number>>): number {
	return Object.values(investedByFamily).reduce((suma, xp) => suma + Math.max(0, xp), 0);
}

/** El rango más alto alcanzado con ese índice. */
export function rankFor(index: number): RatingRank {
	let alcanzado = RATING_RANKS[0];
	for (const rango of RATING_RANKS) {
		if (index >= rango.at) alcanzado = rango;
	}
	return alcanzado;
}

/** El que sigue, o `null` si ya está arriba de todo. */
export function nextRankFor(index: number): RatingRank | null {
	return RATING_RANKS.find((rango) => rango.at > index) ?? null;
}

/**
 * Cuánto del tramo hasta el próximo rango lleva, de 0 a 1.
 *
 * En el último rango devuelve 1: no hay tramo que recorrer, y devolver 0 haría
 * que la pantalla dibujara vacío justo al que más lejos llegó.
 */
export function rankProgress(index: number): number {
	const actual = rankFor(index);
	const siguiente = nextRankFor(index);
	if (!siguiente) return 1;

	const tramo = siguiente.at - actual.at;
	return Math.min(1, Math.max(0, (index - actual.at) / tramo));
}
