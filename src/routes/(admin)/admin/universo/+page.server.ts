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
import { buildUniverso } from '$lib/server/views/worldbuilding';
import {
	BuilderError,
	createConstellation,
	createRegion,
	createSystem
} from '$lib/server/services/worldbuilding';
import { can } from '$lib/permissions';
import { GOVERNMENTS, type Government } from '$lib/game/universe';
import { ADMIN_ROUTE } from '$lib/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { universo: buildUniverso(db) };
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
	region: async ({ request, locals }) => {
		const datos = await request.formData();
		const nombre = String(datos.get('name') ?? '');

		try {
			exigirPermiso(locals.permissions);
			const creada = createRegion(db, nombre, locals.pilot?.id ?? null);
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
				locals.pilot?.id ?? null
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
						datos.get('capital') === 'on' ? String(datos.get('controllingFaction') ?? '') : '',
					description: String(datos.get('description') ?? ''),
					x: entero(datos.get('x')),
					y: entero(datos.get('y')),
					z: entero(datos.get('z'))
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
