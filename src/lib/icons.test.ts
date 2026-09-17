/**
 * Que todo ícono declarado exista en los seis pesos, y al revés.
 *
 * El comentario de `icons.ts` avisa por qué hace falta: un ícono que no está no
 * rompe la página, deja un **hueco silencioso**, que es peor. El compilador
 * atrapa un nombre mal escrito en el código, pero no puede saber si el archivo
 * llegó a `static/icons/`; eso lo mira esto.
 *
 * Y sobra lo que no se usa: un peso descargado de más es peso muerto que nadie
 * va a volver a revisar.
 */

import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES, ICON_WEIGHTS } from './icons';

/** Los nombres que hay en el disco para ese peso, sin la extensión. */
function enElDisco(weight: string): Set<string> {
	return new Set(
		readdirSync(`static/icons/${weight}`)
			.filter((archivo) => archivo.endsWith('.svg'))
			.map((archivo) => archivo.slice(0, -'.svg'.length))
	);
}

describe('los íconos', () => {
	it('están los seis pesos de cada uno', () => {
		for (const weight of ICON_WEIGHTS) {
			const hay = enElDisco(weight);
			for (const name of ICON_NAMES) {
				expect(hay.has(name), `falta static/icons/${weight}/${name}.svg`).toBe(true);
			}
		}
	});

	it('no hay ninguno descargado que la interfaz no declare', () => {
		const declarados = new Set<string>(ICON_NAMES);
		for (const weight of ICON_WEIGHTS) {
			for (const name of enElDisco(weight)) {
				expect(declarados.has(name), `static/icons/${weight}/${name}.svg no lo usa nadie`).toBe(
					true
				);
			}
		}
	});

	it('no repite nombres en la lista', () => {
		expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
	});
});
