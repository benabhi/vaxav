/**
 * El guardia del cuartel general.
 *
 * Vive en el layout del grupo y no en cada página por la misma razón que el del
 * juego: agregar una herramienta nueva no debería obligar a acordarse de
 * protegerla, y la protección tiene que estar acá y no en que la barra lateral
 * no dibuje el enlace.
 *
 * **Comprueba dos cosas**: que se pueda cruzar la puerta —cualquier llave
 * alcanza— y que se pueda abrir la sección concreta que se pidió. Lo segundo es
 * lo que hace que un rol que sólo mira estadísticas no pueda escribir a mano la
 * URL del registro.
 *
 * Y responde **404 y no 403**. Un 403 confirma que la página existe, y a quien
 * está probando URL a ver qué encuentra no hay por qué contestarle esa pregunta.
 * Para quien sí tiene la llave, la diferencia no existe: nunca ve ninguno de los
 * dos.
 */

import { error, redirect } from '@sveltejs/kit';
import { canEnterAdmin, sectionForRoute, sectionsFor } from '$lib/admin';
import { LOGIN_ROUTE } from '$lib/routes';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	const pilot = locals.pilot;

	// Sin sesión se va a entrar, no a un 404: no es que no pueda, es que todavía
	// no dijo quién es.
	if (!pilot) redirect(303, LOGIN_ROUTE);
	if (!canEnterAdmin(locals.permissions)) error(404, 'No existe esa página.');

	const section = sectionForRoute(url.pathname);
	if (section?.permission && !locals.permissions.has(section.permission)) {
		error(404, 'No existe esa página.');
	}

	return {
		// Con qué nombre queda firmado lo que se haga acá. Va arriba de todo en la
		// pantalla, y no es decoración: el registro lo va a anotar.
		callsign: pilot.callsign,
		sections: sectionsFor(locals.permissions),
		activeSection: section?.code ?? '',
		permissions: [...locals.permissions]
	};
};
