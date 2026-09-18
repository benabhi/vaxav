/**
 * El listado de sistemas y el alta de uno nuevo.
 *
 * **La región y la constelación se crean desde acá**, no en pantallas propias.
 * La constelación es taxonomía —hoy no cambia ninguna mecánica— y obligar a
 * pasar por un alta aparte para crear un contenedor vacío es fricción sin nada a
 * cambio. Se crean donde uno se acuerda de que hacen falta: llenando el
 * formulario del sistema. El día que una constelación signifique algo, tendrá su
 * pantalla.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildUniverso, readUniverseQuery } from '$lib/server/views/worldbuilding';
import { takeFlash } from '$lib/server/flash';
import {
	BuilderError,
	createConstellation,
	createRegion,
	createSystem,
	updateConstellation,
	updateRegion
} from '$lib/server/services/worldbuilding';
import { can } from '$lib/permissions';
import { GOVERNMENTS, type Government } from '$lib/game/universe';
import { ADMIN_ROUTE } from '$lib/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies, url }) => {
	return {
		// Los filtros viajan en la URL, como en toda lista del proyecto: así se
		// comparten, se vuelve con el botón de atrás y se recarga sin perder nada.
		universo: buildUniverso(db, readUniverseQuery(url.searchParams)),
		// El aviso de lo que se acaba de hacer, si se acaba de hacer algo. Leerlo lo
		// consume, así que aparece exactamente una vez.
		aviso: takeFlash(cookies)
	};
};

/** Un entero del formulario, o cero si vino cualquier cosa. */
function entero(valor: FormDataEntryValue | null): number {
	const numero = Number.parseInt(String(valor ?? ''), 10);
	return Number.isFinite(numero) ? numero : 0;
}

/**
 * Sólo quien puede construir escribe.
 *
 * El guardia del área deja pasar a quien tenga `universe.read`, que alcanza para
 * mirar. Escribir pide la otra llave, y se comprueba **acá y no en la pantalla**:
 * esconder un botón no protege nada.
 */
function exigirPermiso(permisos: ReadonlySet<string>): void {
	if (!can(permisos, 'universe.edit')) {
		throw new BuilderError('No tenés permiso para construir el universo.');
	}
}

export const actions: Actions = {
	/** Crea una región desde el mismo formulario del sistema. */
	/**
	 * Cambia el nombre y el color de una región o de una constelación.
	 *
	 * **Una sola acción para las dos** porque hacen lo mismo con la misma forma, y
	 * qué se está editando lo dice el campo `que`. Dos acciones gemelas serían dos
	 * lugares donde arreglar lo que salga mal en una.
	 */
	editarTaxonomia: async ({ request, locals }) => {
		const datos = await request.formData();
		const nombre = String(datos.get('name') ?? '');
		const color = String(datos.get('color') ?? '');
		const id = entero(datos.get('id'));

		try {
			exigirPermiso(locals.permissions);
			if (datos.get('que') === 'region') {
				updateRegion(db, id, nombre, color, locals.pilot?.id ?? null);
			} else {
				updateConstellation(db, id, nombre, color, locals.pilot?.id ?? null);
			}
			return { ok: true };
		} catch (error) {
			if (error instanceof BuilderError) return fail(400, { error: error.message });
			throw error;
		}
	},

	region: async ({ request, locals }) => {
		const datos = await request.formData();
		const nombre = String(datos.get('name') ?? '');

		try {
			exigirPermiso(locals.permissions);
			const creada = createRegion(
				db,
				nombre,
				locals.pilot?.id ?? null,
				String(datos.get('color') ?? '')
			);
			return { regionId: creada.id };
		} catch (error) {
			if (error instanceof BuilderError) return fail(400, { error: error.message });
			throw error;
		}
	},

	/** Ídem la constelación. */
	constelacion: async ({ request, locals }) => {
		const datos = await request.formData();

		try {
			exigirPermiso(locals.permissions);
			const creada = createConstellation(
				db,
				entero(datos.get('regionId')),
				String(datos.get('name') ?? ''),
				locals.pilot?.id ?? null,
				String(datos.get('color') ?? '')
			);
			return { constellationId: creada.id };
		} catch (error) {
			if (error instanceof BuilderError) return fail(400, { error: error.message });
			throw error;
		}
	},

	/**
	 * Crea el sistema y **lleva derecho a su constructor**.
	 *
	 * Redirige en vez de volver al listado porque nadie crea un sistema para
	 * mirarlo en una lista: lo crea para ponerle planetas.
	 */
	sistema: async ({ request, locals }) => {
		const datos = await request.formData();
		const government = String(datos.get('government') ?? 'corporate');

		if (!GOVERNMENTS.includes(government as Government)) {
			return fail(400, { error: 'Ese gobierno no existe.' });
		}

		let code: string;
		try {
			exigirPermiso(locals.permissions);
			const { system } = createSystem(
				db,
				{
					name: String(datos.get('name') ?? ''),
					constellationId: entero(datos.get('constellationId')),
					government: government as Government,
					security: entero(datos.get('security')),
					controllingFaction: String(datos.get('controllingFaction') ?? ''),
					capitalOf:
						datos.get('capital') === 'on' ? String(datos.get('controllingFaction') ?? '') : ''
				},
				locals.pilot?.id ?? null
			);
			code = system.code;
		} catch (error) {
			if (error instanceof BuilderError) return fail(400, { error: error.message });
			throw error;
		}

		redirect(303, `${ADMIN_ROUTE}/universo/${code}`);
	}
};
