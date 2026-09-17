/**
 * Azar con semilla: el mismo resultado todas las veces.
 *
 * **Lo que importa acá no es la calidad del azar sino que sea repetible.** Una
 * galaxia de prueba que sale distinta en cada corrida no se puede comparar con la
 * de ayer, y un emblema generado a partir de un nombre tiene que ser *el* emblema
 * de ese nombre, en esta máquina y en la del jugador.
 *
 * Vive en `$lib` y no bajo `server/` porque lo necesitan los dos lados: el
 * sembrador corre en Node y el identicón se dibuja en el navegador.
 */

/**
 * Un generador de números entre 0 y 1, a partir de una semilla.
 *
 * Mulberry32: cuatro líneas y alcanza. No sirve para criptografía —no lo intentes—
 * pero reparte bien y es idéntico en todas las máquinas, que es lo único que se le
 * pide.
 */
export function seeded(semilla: number): () => number {
	let estado = semilla;
	return () => {
		estado |= 0;
		estado = (estado + 0x6d2b79f5) | 0;
		let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Una semilla a partir de un texto: FNV-1a de 32 bits.
 *
 * **No es el hash de `palette.ts`, y es a propósito.** Aquél suma con base 31 y
 * corta a cinco dígitos porque lo único que necesita es un tono; acá hacen falta
 * treinta y dos bits bien mezclados, porque de esta semilla salen doce celdas, dos
 * colores y media docena de variantes. Con el hash corto, dos nombres parecidos
 * darían emblemas parecidos, que es justo lo que un identicón no puede hacer.
 */
export function seedFrom(texto: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < texto.length; i++) {
		hash ^= texto.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/**
 * Cuatro semillas independientes a partir de un texto.
 *
 * **Una sola de treinta y dos bits no alcanzaba.** Un generador sembrado con 32
 * bits sólo puede producir 2³² secuencias distintas, así que por más variantes que
 * tenga el dibujo, dos nombres empiezan a chocar alrededor de los 65 mil —la
 * paradoja del cumpleaños, que aparece en la raíz cuadrada y no en el total—. Con
 * cuatro palabras el estado es de 128 bits y el generador deja de ser el cuello de
 * botella: el límite pasa a ser cuántos dibujos distintos existen, que es una
 * decisión de diseño y no un accidente de la aritmética.
 *
 * Las cuatro salen del mismo texto con sales distintas: mismo costo, y ninguna
 * queda correlacionada con las otras.
 */
export function seedWords(texto: string): [number, number, number, number] {
	return [
		seedFrom(texto),
		seedFrom(`1\u0000${texto}`),
		seedFrom(`2\u0000${texto}`),
		seedFrom(`3\u0000${texto}`)
	];
}

/**
 * Un dado ya sembrado con un texto, que es como se usa casi siempre.
 *
 * Usa **sfc32**, que arranca de esas cuatro palabras. Sigue sin servir para
 * criptografía y sigue siendo idéntico en todas las máquinas, que es lo único que
 * se le pide; lo que gana sobre mulberry32 es el estado ancho.
 */
export function dadoDe(texto: string): () => number {
	let [a, b, c, d] = seedWords(texto);

	// Se descartan las primeras tiradas: con semillas que sólo difieren en unos
	// pocos bits, las primeras salidas de sfc32 todavía se parecen entre sí.
	const dado = () => {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		const t = (((a + b) | 0) + d) | 0;
		d = (d + 1) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};

	for (let i = 0; i < 12; i++) dado();
	return dado;
}
