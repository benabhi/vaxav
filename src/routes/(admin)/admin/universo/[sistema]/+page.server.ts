/**
 * El constructor de un sistema: todo lo que se le puede hacer, en un solo lugar.
 *
 * Hay muchas acciones y ninguna pantalla intermedia, y es a propósito: construir
 * un sistema es un rato largo de retoques —mover una órbita, renombrar una luna,
 * colgar una estación— y cada ida y vuelta a otra URL rompe el hilo. Todas
 * escriben, todas vuelven acá y todas dejan constancia.
 *
 * **La comprobación de permiso vive en cada acción**, y no sólo en el guardia del
 * área: el guardia deja pasar a quien tenga `universe.read`, que alcanza para
 * mirar y no para tocar.
 */

import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildConstructor } from '$lib/server/views/worldbuilding';
import {
	BuilderError,
	connectGates,
	createBody,
	createGate,
	deleteBody,
	deleteSystem,
	disconnectGate,
	setGateClosed,
	growFromGate,
	setDeposits,
	setStation,
	updateBody,
	updateSystem,
	type BodyDraft
} from '$lib/server/services/worldbuilding';
import { can } from '$lib/permissions';
import {
	ATMOSPHERES,
	BODY_CLASSES,
	BODY_KINDS,
	GATE_BEARINGS,
	GOVERNMENTS,
	STAR_CLASSES,
	type BodyKind,
	type GateBearing,
	type Government
} from '$lib/game/universe';
import { STATION_SERVICES, type StationServiceKind } from '$lib/game/universe';
import { isOre } from '$lib/game/items';
import { ADMIN_ROUTE } from '$lib/admin';
import { setFlash } from '$lib/server/flash';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const constructor = buildConstructor(db, params.sistema);
	if (!constructor) error(404, 'No existe ese sistema.');

	return { constructor };
};

/** Un entero del formulario, o cero si vino cualquier cosa. */
function entero(datos: FormData, campo: string): number {
	const numero = Number.parseInt(String(datos.get(campo) ?? ''), 10);
	return Number.isFinite(numero) ? numero : 0;
}

/** Sólo quien puede construir escribe. Esconder un botón no protege nada. */
function exigir(permisos: ReadonlySet<string>): void {
	if (!can(permisos, 'universe.edit')) {
		throw new BuilderError('No tenés permiso para construir el universo.');
	}
}

/** Sólo quien puede borrar borra. Es la otra llave, y es de las peligrosas. */
function exigirBorrado(permisos: ReadonlySet<string>): void {
	if (!can(permisos, 'universe.delete')) {
		throw new BuilderError('No tenés permiso para borrar partes del universo.');
	}
}

/**
 * Corre una acción y convierte su queja en algo que la pantalla sepa mostrar.
 *
 * Todas las acciones de acá tienen la misma forma —validar, escribir, volver— y
 * sin esto cada una repetiría el mismo `try` de seis líneas.
 */
async function intentar(trabajo: () => void) {
	try {
		trabajo();
		return { ok: true };
	} catch (problema) {
		if (problema instanceof BuilderError) return fail(400, { error: problema.message });
		throw problema;
	}
}

/** Lo que define a un cuerpo, leído del formulario. */
function cuerpoDe(datos: FormData, kind: BodyKind): BodyDraft {
	const parentId = entero(datos, 'parentId');
	return {
		name: String(datos.get('name') ?? ''),
		kind,
		parentId: parentId > 0 ? parentId : null,
		orbitDistance: entero(datos, 'orbitDistance'),
		explored: datos.get('explored') !== 'no',
		bodyClass: deLista(datos, 'bodyClass', BODY_CLASSES),
		atmosphere: deLista(datos, 'atmosphere', ATMOSPHERES),
		starClass: deLista(datos, 'starClass', STAR_CLASSES)
	};
}

/**
 * Un valor de una lista cerrada, o vacío.
 *
 * Lo que no está en la lista se descarta en silencio en vez de fallar: el
 * formulario sólo ofrece lo que corresponde al tipo de cuerpo, así que un valor
 * fuera de lista es alguien tocando el HTML. Que los atributos correspondan al
 * tipo lo hace cumplir el servicio, que es donde vale para todos los que
 * escriban.
 */
function deLista<T extends string>(datos: FormData, campo: string, valores: readonly T[]): T | '' {
	const valor = String(datos.get(campo) ?? '');
	return valores.includes(valor as T) ? (valor as T) : '';
}

/** Lo que define a un sistema, leído del formulario. */
function sistemaDe(datos: FormData) {
	const government = String(datos.get('government') ?? '');
	if (!GOVERNMENTS.includes(government as Government)) {
		throw new BuilderError('Ese gobierno no existe.');
	}

	const controllingFaction = String(datos.get('controllingFaction') ?? '');
	return {
		name: String(datos.get('name') ?? ''),
		constellationId: entero(datos, 'constellationId'),
		government: government as Government,
		security: entero(datos, 'security'),
		controllingFaction,
		capitalOf: datos.get('capital') === 'on' ? controllingFaction : ''
	};
}

export const actions: Actions = {
	/** Los datos del sistema: nombre, gobierno, seguridad, dueño. */
	sistema: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const abierto = buildConstructor(db, params.sistema);
		if (!abierto) error(404, 'No existe ese sistema.');

		return intentar(() => {
			exigir(locals.permissions);
			updateSystem(db, abierto.id, sistemaDe(datos), locals.pilot?.id ?? null);
		});
	},

	/** Agrega un cuerpo. Si es puerta, además le planta su rumbo. */
	cuerpo: async ({ request, locals, params }) => {
		const datos = await request.formData();
		const abierto = buildConstructor(db, params.sistema);
		if (!abierto) error(404, 'No existe ese sistema.');

		const kind = String(datos.get('kind') ?? '');
		if (!BODY_KINDS.includes(kind as BodyKind)) return fail(400, { error: 'Ese tipo no existe.' });

		const actor = locals.pilot?.id ?? null;
		const draft = cuerpoDe(datos, kind as BodyKind);

		return intentar(() => {
			exigir(locals.permissions);

			if (kind !== 'gate') {
				createBody(db, abierto.id, draft, actor);
				return;
			}

			const bearing = String(datos.get('bearing') ?? '');
			if (!GATE_BEARINGS.includes(bearing as GateBearing)) {
				throw new BuilderError('Ese rumbo no existe.');
			}
			createGate(db, abierto.id, draft, bearing as GateBearing, actor);
		});
	},

	/** Cambia un cuerpo que ya existe. */
	editar: async ({ request, locals }) => {
		const datos = await request.formData();
		const kind = String(datos.get('kind') ?? '');
		if (!BODY_KINDS.includes(kind as BodyKind)) return fail(400, { error: 'Ese tipo no existe.' });

		return intentar(() => {
			exigir(locals.permissions);
			updateBody(
				db,
				entero(datos, 'bodyId'),
				cuerpoDe(datos, kind as BodyKind),
				locals.pilot?.id ?? null
			);
		});
	},

	/** Borra un cuerpo, si no hay nada que lo retenga. */
	borrar: async ({ request, locals }) => {
		const datos = await request.formData();

		return intentar(() => {
			exigirBorrado(locals.permissions);
			deleteBody(db, entero(datos, 'bodyId'), locals.pilot?.id ?? null);
		});
	},

	/** La corporación y los módulos de una estación. */
	estacion: async ({ request, locals }) => {
		const datos = await request.formData();
		const services = datos
			.getAll('services')
			.map(String)
			.filter((uno): uno is StationServiceKind =>
				STATION_SERVICES.includes(uno as StationServiceKind)
			);

		return intentar(() => {
			exigir(locals.permissions);
			setStation(
				db,
				entero(datos, 'bodyId'),
				String(datos.get('corporation') ?? ''),
				services,
				locals.pilot?.id ?? null
			);
		});
	},

	/**
	 * Los minerales de un cinturón.
	 *
	 * Llegan los tres campos en paralelo —mineral, tope y reposición— porque un
	 * formulario HTML no manda objetos: se arman de vuelta por posición, y se
	 * descarta la fila a la que le falte el mineral, que es la que quedó vacía.
	 */
	minerales: async ({ request, locals }) => {
		const datos = await request.formData();
		const ores = datos.getAll('ore').map(String);
		const capacities = datos.getAll('capacity').map(String);
		const regens = datos.getAll('regen').map(String);

		const deposits = ores
			.map((ore, indice) => ({
				ore,
				capacity: Number.parseInt(capacities[indice] ?? '0', 10) || 0,
				regenPerHour: Number.parseInt(regens[indice] ?? '0', 10) || 0
			}))
			.filter((uno) => uno.ore && isOre(uno.ore));

		return intentar(() => {
			exigir(locals.permissions);
			setDeposits(db, entero(datos, 'bodyId'), deposits, locals.pilot?.id ?? null);
		});
	},

	/** Une esta puerta con una suelta de otro sistema. */
	conectar: async ({ request, locals }) => {
		const datos = await request.formData();

		return intentar(() => {
			exigir(locals.permissions);
			connectGates(
				db,
				entero(datos, 'gateId'),
				entero(datos, 'otherGateId'),
				entero(datos, 'jumpDistance'),
				locals.pilot?.id ?? null
			);
		});
	},

	/** Las separa. Las dos quedan sueltas, no borradas. */
	/**
	 * Cierra o reabre el paso por una puerta.
	 *
	 * **No es desconectar.** Desconectar deshace el enlace y deja dos muñones;
	 * cerrar deja la puerta donde está y no deja pasar. Es lo que hace falta para
	 * aislar un sistema sin tocarle el mapa a nadie.
	 */
	cerrar: async ({ request, locals }) => {
		const datos = await request.formData();

		return intentar(() => {
			exigir(locals.permissions);
			setGateClosed(
				db,
				entero(datos, 'gateId'),
				datos.get('closed') === '1',
				locals.pilot?.id ?? null
			);
		});
	},

	desconectar: async ({ request, locals }) => {
		const datos = await request.formData();

		return intentar(() => {
			exigir(locals.permissions);
			disconnectGate(db, entero(datos, 'gateId'), locals.pilot?.id ?? null);
		});
	},

	/**
	 * Crea el sistema del otro lado de una puerta suelta, ya conectado.
	 *
	 * Es el gesto que uno quiere al armar una galaxia: se planta la salida y desde
	 * ahí se crea lo que hay del otro lado, sin ir a otra pantalla ni acordarse de
	 * volver a conectar.
	 */
	vecino: async ({ request, locals }) => {
		const datos = await request.formData();

		let code: string;
		try {
			exigir(locals.permissions);
			code = growFromGate(
				db,
				entero(datos, 'gateId'),
				sistemaDe(datos),
				entero(datos, 'jumpDistance'),
				locals.pilot?.id ?? null
			).code;
		} catch (problema) {
			if (problema instanceof BuilderError) return fail(400, { error: problema.message });
			throw problema;
		}

		// Se va derecho al vecino recién creado: nadie lo crea para quedarse
		// mirando el que ya tenía.
		redirect(303, `${ADMIN_ROUTE}/universo/${code}`);
	},

	/** Borra el sistema entero y vuelve al listado. */
	eliminar: async ({ request, locals, params, cookies }) => {
		const datos = await request.formData();
		const abierto = buildConstructor(db, params.sistema);
		if (!abierto) error(404, 'No existe ese sistema.');

		// La pantalla hace escribir el nombre: es una traba para el dedo apurado,
		// no una autorización. La de verdad es el permiso.
		if (String(datos.get('confirm') ?? '').trim() !== abierto.name) {
			return fail(400, { error: `Escribí ${abierto.name} para confirmar.` });
		}

		try {
			exigirBorrado(locals.permissions);
			deleteSystem(db, abierto.id, locals.pilot?.id ?? null);
		} catch (problema) {
			if (problema instanceof BuilderError) return fail(400, { error: problema.message });
			throw problema;
		}

		// El aviso viaja en una cookie de un solo uso: la URL queda limpia, así que
		// recargar el listado no vuelve a anunciar un borrado viejo.
		setFlash(cookies, `Se borró el sistema ${abierto.name} y todo lo que tenía.`);
		redirect(303, `${ADMIN_ROUTE}/universo`);
	}
};
