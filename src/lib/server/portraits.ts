/**
 * Retratos de los NPC: se **descubren** en `static/portraits/`, no se declaran.
 *
 * La regla es una sola y es lo que hace flexible a la carpeta:
 *
 * > **sólo importa el nombre del archivo; la estructura de carpetas no importa.**
 *
 * Se recorre `static/portraits/` entero, subcarpetas incluidas, y cada imagen se
 * indexa por su nombre sin extensión. De ahí salen dos cosas:
 *
 * 1. Un archivo que se llama igual que un agente —`verlan_aduana.webp`— es *su*
 *    retrato, esté donde esté guardado.
 * 2. Todo lo demás va a un **fondo común** que se reparte entre los agentes que
 *    no tienen uno propio.
 *
 * Así se pueden organizar los archivos como se quiera —por facción, por sexo,
 * por tanda de generación— sin tocar una línea de código, y el día que haya un
 * generador de retratos alcanza con dejar las imágenes ahí adentro para que
 * aparezcan en el juego. Nada en la pantalla depende de cómo esté ordenada la
 * carpeta.
 *
 * Vive bajo `server/` y no en `$lib` porque recorre el disco: el navegador
 * recibe la URL ya resuelta y no necesita saber de dónde salió.
 */

import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';

/**
 * La carpeta que se recorre, relativa a la raíz del proyecto.
 *
 * Vive en `static/` porque SvelteKit sirve lo que hay ahí tal cual, sin
 * registrar nada: un archivo en `static/portraits/x.webp` se pide como
 * `/portraits/x.webp`.
 */
const PORTRAITS_DIR = join('static', 'portraits');

/**
 * Extensiones que se consideran imagen. Cualquier otro archivo —un LEEME, una
 * licencia, un .psd— se ignora sin hacer ruido.
 */
const IMAGE_SUFFIXES = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg', '.gif']);

/** El índice de la carpeta, armado una sola vez. */
interface Index {
	/** Por nombre de archivo sin extensión. */
	readonly named: ReadonlyMap<string, string>;
	/** Todas las imágenes, en orden alfabético. */
	readonly pool: readonly string[];
	/** El fondo común partido por rasgo, según la letra con la que arranca. */
	readonly byLook: ReadonlyMap<string, readonly string[]>;
}

// Armado en el primer uso: la carpeta no cambia mientras el juego corre.
let index: Index | null = null;

/** El nombre de un archivo sin su extensión, y la extensión en minúsculas. */
function split(name: string): { stem: string; suffix: string } {
	const corte = name.lastIndexOf('.');
	if (corte <= 0) return { stem: name, suffix: '' };
	return { stem: name.slice(0, corte), suffix: name.slice(corte).toLowerCase() };
}

/** Todos los archivos que cuelgan de una carpeta, en orden y con su ruta relativa. */
function walk(dir: string): string[] {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		// Sin carpeta no hay retratos, y eso no es motivo para no jugar.
		return [];
	}

	const found: string[] = [];
	// Ordenado para que el reparto del fondo común no dependa de en qué orden el
	// sistema de archivos devuelva las cosas.
	for (const entry of [...entries].sort((a, b) => (a.name < b.name ? -1 : 1))) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...walk(full));
		else if (entry.isFile()) found.push(full);
	}
	return found;
}

function build(): Index {
	const named = new Map<string, string>();
	const pool: string[] = [];
	const byLook = new Map<string, string[]>();

	for (const path of walk(PORTRAITS_DIR)) {
		const { stem, suffix } = split(path.slice(path.lastIndexOf(sep) + 1));
		if (!IMAGE_SUFFIXES.has(suffix)) continue;

		const url = `/portraits/${relative(PORTRAITS_DIR, path).split(sep).join(posix.sep)}`;
		// Un nombre repetido en dos carpetas se queda con el primero por orden
		// alfabético, que es estable y no depende de la máquina.
		if (!named.has(stem)) named.set(stem, url);
		pool.push(url);

		// El rasgo es la letra antes del primer guión. Un nombre sin guión —o con
		// cualquier otra cosa adelante— simplemente no entra en ningún grupo y
		// queda sólo en el fondo entero.
		const guion = stem.indexOf('-');
		if (guion === 1) {
			const look = stem.slice(0, 1);
			byLook.set(look, [...(byLook.get(look) ?? []), url]);
		}
	}

	return { named, pool, byLook };
}

/** Vuelve a recorrer la carpeta. Para las pruebas y para agregar en caliente. */
export function refresh(): void {
	index = build();
}

/**
 * El retrato de ese NPC, o cadena vacía si todavía no hay ninguna imagen.
 *
 * `look` es el rasgo que el personaje declara —la misma letra con la que
 * arrancan los nombres del fondo común—. Con rasgo se reparte sólo entre los que
 * le corresponden; **sin retratos de ese rasgo se cae al fondo entero**, porque
 * una cara que no encaja del todo es mejor que un hueco vacío.
 *
 * Devuelve vacío en vez de una imagen por omisión a propósito: la pantalla
 * dibuja una silueta, que dice "acá falta algo" mejor que una foto genérica
 * repetida diez veces.
 */
export function portraitFor(code: string, look = ''): string {
	index ??= build();

	const propio = index.named.get(code);
	if (propio !== undefined) return propio;

	const candidatos = index.byLook.get(look) ?? index.pool;
	if (candidatos.length === 0) return '';

	// Reparto estable: el mismo código cae siempre en la misma imagen, entre
	// arranques y entre máquinas. Por eso un digest y no algo como `Math.random`
	// ni el orden en que la base devuelva los agentes.
	//
	// El original usaba `blake2b` de Python con `digest_size=8`, que Node no
	// expone: BLAKE2 mete el largo del digest en su estado inicial, así que
	// recortar un blake2b-512 da otra cosa. Se usa sha-256 recortado, que cumple
	// lo único que se le pide a este hash —ser estable—, con la consecuencia de
	// que un agente sin retrato propio puede sacar otra cara que en el original.
	const digest = createHash('sha256').update(code, 'utf8').digest();
	return candidatos[digest.readUInt32BE(0) % candidatos.length];
}

/** Cuántas imágenes hay en la carpeta. Lo usan las pruebas y el diagnóstico. */
export function available(): number {
	index ??= build();
	return index.pool.length;
}
