/**
 * El color de una categoría cuando nadie lo eligió.
 *
 * Vive acá y no en la pantalla del mapa porque lo necesitan tres: el mapa para
 * pintar, el selector de color para mostrar qué tono le tocaría a lo que se está
 * creando, y la vista para decidir si hay que generar uno o usar el guardado. Tres
 * copias de esta cuenta son tres colores distintos para la misma región.
 *
 * Es puro y sin dependencias: lo corren los dos lados.
 */

/**
 * El ángulo áureo, que es lo que reparte bien los tonos.
 *
 * Sin él, dos nombres parecidos —«Pleamar» y «Peñascales»— dan hashes parecidos y
 * por lo tanto tonos casi iguales, que en un mapa es lo mismo que no tener color.
 * Multiplicar por este ángulo decorrelaciona: nombres vecinos caen en puntos
 * lejanos del círculo.
 */
const ANGULO_AUREO = 137.508;

/**
 * Saturación y brillo, fijos.
 *
 * **Lo único que varía es el tono.** Salen de la paleta del HUD para que ningún
 * color generado desentone con el naranja del juego, y para que un color elegido a
 * mano y uno automático se vean de la misma familia.
 */
export const SATURACION = 68;
export const BRILLO = 62;

/** Un número estable a partir de un texto. Mismo nombre, mismo número, siempre. */
function hash(texto: string): number {
	let suma = 0;
	for (const letra of texto) suma = (suma * 31 + letra.charCodeAt(0)) % 100000;
	return suma;
}

/** El tono que le toca a un nombre, de 0 a 359. */
export function hueOf(nombre: string): number {
	return Math.round((hash(nombre) * ANGULO_AUREO) % 360);
}

/**
 * De HSL a `#rrggbb`.
 *
 * Se guarda hexadecimal y no HSL porque es lo que entienden el lienzo, el CSS y un
 * campo de color de formulario sin traducir nada.
 */
export function hslToHex(h: number, s: number, l: number): string {
	const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
	const canal = (n: number) => {
		const k = (n + h / 30) % 12;
		const valor = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round(255 * valor)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${canal(0)}${canal(8)}${canal(4)}`;
}

/**
 * El color de una categoría: el elegido si hay uno, y si no el que sale del nombre.
 *
 * **Vacío no es un dato que falte, es «elegilo vos».** Una región nueva nunca queda
 * sin color y nadie tiene que decidir nada para que el mapa se vea; el elegido está
 * para cuando el automático no alcanza.
 */
export function colorFor(nombre: string, elegido = ''): string {
	if (elegido) return elegido;
	if (!nombre) return 'var(--color-text-muted)';
	return hslToHex(hueOf(nombre), SATURACION, BRILLO);
}

/**
 * Las muestras que ofrece el selector, repartidas por el círculo.
 *
 * Con el mismo ángulo que el generador, así la grilla cubre el círculo entero sin
 * dos muestras que se confundan.
 */
export function swatches(cuantas = 12): readonly string[] {
	return Array.from({ length: cuantas }, (_, i) =>
		hslToHex(Math.round((i * ANGULO_AUREO) % 360), SATURACION, BRILLO)
	);
}
