/**
 * Los retratos de los pilotos en el disco: guardar, leer y borrar.
 *
 * Viven en `data/` y **no en `static/`**, que es la decisión que ordena todo lo
 * demás. `static/` es contenido del proyecto: entra en el repositorio, se copia
 * en cada despliegue y se borra al reconstruir. Lo que sube un jugador es lo
 * contrario —es suyo, tiene que sobrevivir a un despliegue y no tiene por qué
 * estar en el repositorio—, así que va al lado de la base, que ya es exactamente
 * eso: el estado de la partida, fuera de git.
 *
 * El precio de esa decisión es que SvelteKit no los sirve solo, y por eso existe
 * la ruta `/retratos/[piloto]`. Es un precio barato: son unas pocas líneas y a
 * cambio queda claro qué es contenido y qué es partida.
 *
 * Los retratos de los **agentes** son otra cosa y siguen en `static/portraits/`:
 * ésos sí son contenido del juego, los escribe quien lo hace y no quien lo juega.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PORTRAIT_TYPE, portraitFileName, portraitProblem } from '$lib/game/portraits';

/** No se pudo guardar el retrato. El mensaje se le muestra al jugador. */
export class PortraitError extends Error {}

/**
 * La carpeta donde viven, relativa a la raíz del proyecto.
 *
 * Al lado de la base y por la misma razón: es estado de la partida. `data/` ya
 * está fuera de git.
 */
const PORTRAITS_DIR = join('data', 'retratos');

/** El archivo de un piloto, exista o no. */
function pathFor(pilotId: number): string {
	return join(PORTRAITS_DIR, portraitFileName(pilotId));
}

/**
 * Guarda el retrato de un piloto, reemplazando el anterior.
 *
 * Valida **acá también** aunque el navegador ya haya normalizado la imagen: ese
 * navegador es del jugador y el pedido se puede armar a mano. Es la regla de
 * fallar en el borde, y el borde de verdad es éste.
 */
export function savePortrait(pilotId: number, bytes: Uint8Array, type: string): void {
	const problema = portraitProblem(bytes, type);
	if (problema) throw new PortraitError(problema);

	mkdirSync(PORTRAITS_DIR, { recursive: true });
	// Se escribe sobre el mismo nombre: el archivo está atado a la cuenta, así que
	// cambiar de retrato no deja el anterior tirado ocupando lugar.
	writeFileSync(pathFor(pilotId), bytes);
}

/** Si el piloto tiene retrato propio. */
export function hasPortrait(pilotId: number): boolean {
	return existsSync(pathFor(pilotId));
}

/**
 * Cuándo se subió el que tiene, en milisegundos, o cero si no tiene.
 *
 * Sirve para la URL: sin algo que cambie, el navegador se queda con el retrato
 * viejo en la caché y el jugador cree que la subida no funcionó. Con la marca de
 * tiempo en la consulta, cada retrato nuevo es una URL nueva.
 */
export function portraitVersion(pilotId: number): number {
	const archivo = pathFor(pilotId);
	if (!existsSync(archivo)) return 0;
	return Math.trunc(statSync(archivo).mtimeMs);
}

/** El retrato de un piloto, o `null` si no subió ninguno. */
export function readPortrait(pilotId: number): { bytes: Buffer; type: string } | null {
	const archivo = pathFor(pilotId);
	if (!existsSync(archivo)) return null;
	return { bytes: readFileSync(archivo), type: PORTRAIT_TYPE };
}

/** Lo borra. Vuelve a la silueta, que es lo que hay cuando nunca hubo uno. */
export function deletePortrait(pilotId: number): void {
	rmSync(pathFor(pilotId), { force: true });
}
