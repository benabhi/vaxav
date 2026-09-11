/**
 * Hashing de contraseñas.
 *
 * Argon2 con los parámetros por omisión de la librería, que son los que
 * recomienda y se actualizan con ella. Acá no se escribe criptografía: se la
 * delega y se la deja detrás de tres funciones, para que el resto del código no
 * sepa nunca qué algoritmo hay abajo.
 */

import { hash, parseOptions, verify } from '@node-rs/argon2';

/** Devuelve el hash de una contraseña, con su sal incluida. */
export function hashPassword(password: string): Promise<string> {
	return hash(password);
}

/**
 * ¿La contraseña corresponde a ese hash?
 *
 * Devuelve `false` ante cualquier fallo, incluido un hash corrupto: quien llama
 * sólo necesita saber si entra o no entra.
 */
export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
	try {
		return await verify(passwordHash, password);
	} catch {
		return false;
	}
}

/**
 * Los parámetros con los que la librería hashea hoy.
 *
 * Se descubren hasheando algo descartable una sola vez, en vez de escribirlos a
 * mano: escritos a mano dejarían de moverse cuando la librería suba los suyos,
 * que es justo lo que esta comprobación existe para detectar.
 */
let current: Promise<ReturnType<typeof parseOptions>> | null = null;

function currentOptions() {
	current ??= hash('para-descubrir-los-parametros').then(parseOptions);
	return current;
}

/**
 * ¿El hash quedó viejo respecto de los parámetros actuales?
 *
 * Cuando la librería sube sus valores por omisión, los hashes existentes siguen
 * siendo válidos pero conviene rehacerlos en el próximo ingreso exitoso, que es
 * el único momento en que se tiene la contraseña en claro.
 */
export async function needsRehash(passwordHash: string): Promise<boolean> {
	let theirs;
	try {
		theirs = parseOptions(passwordHash);
	} catch {
		// Un hash que no se puede leer no se puede rehacer: lo que corresponde es
		// que el ingreso falle, y de eso se ocupa verifyPassword.
		return false;
	}
	const ours = await currentOptions();
	return (
		theirs.algorithm !== ours.algorithm ||
		theirs.version !== ours.version ||
		theirs.memoryCost !== ours.memoryCost ||
		theirs.timeCost !== ours.timeCost ||
		theirs.parallelism !== ours.parallelism
	);
}
