/**
 * La ficha de un piloto, con todo lo que se le puede hacer.
 *
 * **Cada acción comprueba su permiso.** El guardia del área deja pasar a quien
 * tenga `pilots.read`, que alcanza para mirar; editar pide `pilots.edit`, dar de
 * baja pide `pilots.delete`, y repartir roles pide `roles.edit`, que es otra
 * llave y de las peligrosas. Esconder un botón no protege nada.
 */

import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildFicha } from '$lib/server/views/accounts';
import {
	AccountError,
	adjustCredits,
	deletePilot,
	movePilot,
	renamePilot,
	resetPassword,
	setEmail
} from '$lib/server/services/accounts';
import { ModerationError, lift, punish } from '$lib/server/services/moderation';
import { RoleError, grantRole, revokeRole } from '$lib/server/services/roles';
import { can } from '$lib/permissions';
import { isSanctionKind } from '$lib/sanctions';
import { ADMIN_ROUTE } from '$lib/admin';
import { setFlash } from '$lib/server/flash';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	const id = Number.parseInt(params.piloto, 10);
	const ficha = Number.isInteger(id) ? buildFicha(db, id, locals.pilot?.id ?? null) : null;
	if (!ficha) error(404, 'No existe ese piloto.');

	return { ficha };
};

/** Un entero del formulario, o cero si vino cualquier cosa. */
function entero(datos: FormData, campo: string): number {
	const numero = Number.parseInt(String(datos.get(campo) ?? ''), 10);
	return Number.isFinite(numero) ? numero : 0;
}

/** El id del piloto de la URL, que toda acción necesita. */
function objetivo(params: { piloto: string }): number {
	const id = Number.parseInt(params.piloto, 10);
	if (!Number.isInteger(id)) error(404, 'No existe ese piloto.');
	return id;
}

/** Sólo quien tiene la llave escribe. */
function exigir(permisos: ReadonlySet<string>, llave: string, verbo: string): void {
	if (!can(permisos, llave)) throw new AccountError(`No tenés permiso para ${verbo}.`);
}

/**
 * Corre una acción y convierte su queja en algo que la pantalla sepa mostrar.
 *
 * Atrapa los tres errores del área —cuenta, moderación y roles— porque una misma
 * pantalla los puede disparar a todos, y para quien la mira son lo mismo: algo no
 * se pudo hacer, y acá dice por qué.
 */
async function intentar(trabajo: () => void | Promise<void>) {
	try {
		await trabajo();
		return { ok: true };
	} catch (problema) {
		if (
			problema instanceof AccountError ||
			problema instanceof ModerationError ||
			problema instanceof RoleError
		) {
			return fail(400, { error: problema.message });
		}
		throw problema;
	}
}

export const actions: Actions = {
	/** El distintivo y el correo, que son la identidad. */
	identidad: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);

		return intentar(() => {
			exigir(locals.permissions, 'pilots.edit', 'editar pilotos');
			renamePilot(db, id, String(datos.get('callsign') ?? ''), locals.pilot);
			setEmail(db, id, String(datos.get('email') ?? ''), locals.pilot);
		});
	},

	/** Una contraseña nueva, sin pedir la anterior. */
	contrasena: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);

		return intentar(async () => {
			exigir(locals.permissions, 'pilots.edit', 'editar pilotos');
			await resetPassword(db, id, String(datos.get('password') ?? ''), locals.pilot);
		});
	},

	/** Lo mueve a otro cuerpo del universo. */
	mover: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);

		return intentar(() => {
			exigir(locals.permissions, 'pilots.edit', 'editar pilotos');
			movePilot(db, id, entero(datos, 'bodyId'), locals.pilot);
		});
	},

	/** Le suma o le resta créditos, por asiento del libro mayor. */
	creditos: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);

		return intentar(() => {
			exigir(locals.permissions, 'pilots.edit', 'editar pilotos');
			adjustCredits(
				db,
				id,
				entero(datos, 'amount'),
				String(datos.get('reason') ?? ''),
				locals.pilot
			);
		});
	},

	/** Le pone una sanción. */
	sancionar: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);

		const kind = String(datos.get('kind') ?? '');
		if (!isSanctionKind(kind)) return fail(400, { error: 'Esa clase de sanción no existe.' });

		// La fecha llega como `2026-10-01` de un campo de fecha: se toma como
		// medianoche UTC, que es como se guarda todo instante del juego.
		const texto = String(datos.get('until') ?? '').trim();
		const until = texto ? new Date(`${texto}T00:00:00.000Z`) : null;
		if (until !== null && Number.isNaN(until.getTime())) {
			return fail(400, { error: 'Esa fecha no se entiende.' });
		}

		return intentar(() => {
			exigir(locals.permissions, 'pilots.edit', 'sancionar pilotos');
			punish(db, id, { kind, reason: String(datos.get('reason') ?? ''), until }, locals.pilot);
		});
	},

	/** Levanta una sanción puesta. No la borra. */
	levantar: async ({ request, locals }) => {
		const datos = await request.formData();

		return intentar(() => {
			exigir(locals.permissions, 'pilots.edit', 'levantar sanciones');
			lift(db, entero(datos, 'sanctionId'), String(datos.get('reason') ?? ''), locals.pilot);
		});
	},

	/**
	 * Le da o le saca un rol.
	 *
	 * Pide `roles.edit` y no `pilots.edit`: repartir poder es otra cosa que editar
	 * una cuenta, y el catálogo lo marca como peligroso justamente porque incluye
	 * poder dárselo a uno mismo.
	 */
	rol: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const id = objetivo(params);
		const roleId = entero(datos, 'roleId');
		const dar = datos.get('grant') === 'si';

		return intentar(() => {
			exigir(locals.permissions, 'roles.edit', 'administrar roles');
			if (dar) grantRole(db, id, roleId, locals.pilot?.id ?? null);
			else revokeRole(db, id, roleId, locals.pilot?.id ?? null);
		});
	},

	/** Da de baja la cuenta y vuelve al listado. */
	eliminar: async ({ request, locals, params, cookies }) => {
		const datos = await request.formData();
		const id = objetivo(params);
		const ficha = buildFicha(db, id, locals.pilot?.id ?? null);
		if (!ficha) error(404, 'No existe ese piloto.');

		// Escribir el distintivo es una traba para el dedo apurado, no una
		// autorización: la de verdad es el permiso.
		if (String(datos.get('confirm') ?? '').trim() !== ficha.callsign) {
			return fail(400, { error: `Escribí ${ficha.callsign} para confirmar.` });
		}

		try {
			exigir(locals.permissions, 'pilots.delete', 'dar de baja pilotos');
			deletePilot(db, id, locals.pilot);
		} catch (problema) {
			if (problema instanceof AccountError) return fail(400, { error: problema.message });
			throw problema;
		}

		setFlash(cookies, `Se dio de baja la cuenta de ${ficha.callsign} y todo lo que tenía.`);
		redirect(303, `${ADMIN_ROUTE}/pilotos`);
	}
};
