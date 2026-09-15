/**
 * Cambiar el retrato del piloto conectado.
 *
 * Es una ruta y no una acción de formulario porque lo que llega **no es un
 * formulario**: es una imagen que el navegador acaba de fabricar recortándola y
 * recodificándola, y que sube como bytes. Meterla en un `FormData` para sacarla
 * del otro lado sería envolverla en un sobre para abrirlo enseguida.
 *
 * Y porque la usan **dos pantallas** —la credencial del piloto y Opciones—: una
 * sola ruta con un solo camino de validación es lo que evita que un día sólo una
 * de las dos compruebe el peso.
 *
 * `DELETE` la saca. Volver a la silueta tiene que ser tan fácil como ponerla, o
 * subir una foto es una decisión irreversible por accidente.
 */

import { error, json } from '@sveltejs/kit';
import {
	PortraitError,
	deletePortrait,
	portraitVersion,
	savePortrait
} from '$lib/server/services/portraits';
import { PORTRAIT_MAX_BYTES } from '$lib/game/portraits';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.pilot) error(401, 'Tu sesión venció. Volvé a entrar.');

	// Se mira el tamaño declarado antes de leer el cuerpo: si alguien anuncia cien
	// megas, no hay ninguna razón para recibirlos primero y descartarlos después.
	const declarado = Number(request.headers.get('content-length') ?? 0);
	if (declarado > PORTRAIT_MAX_BYTES) {
		error(413, `La imagen pesa más de ${Math.round(PORTRAIT_MAX_BYTES / 1024)} kB.`);
	}

	const bytes = new Uint8Array(await request.arrayBuffer());
	const type = request.headers.get('content-type') ?? '';

	try {
		savePortrait(locals.pilot.id, bytes, type);
	} catch (problema) {
		if (problema instanceof PortraitError) error(400, problema.message);
		throw problema;
	}

	// La versión vuelve para que la pantalla pueda pedir la imagen nueva sin
	// esperar a que se recargue toda la página.
	return json({ version: portraitVersion(locals.pilot.id) });
};

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.pilot) error(401, 'Tu sesión venció. Volvé a entrar.');

	deletePortrait(locals.pilot.id);
	return json({ version: 0 });
};
