/**
 * Los roles de un piloto y las llaves que le dan.
 *
 * Un piloto puede tener **varios roles** y sus permisos se suman. Es a propósito:
 * los oficios de administración se acumulan —quien modera también suele mirar
 * estadísticas— y con un rol por cuenta habría que inventar un rol combinado por
 * cada mezcla que aparezca.
 *
 * La pregunta que importa es siempre la misma —«¿este piloto puede esto?»— y se
 * contesta con `permissionsOf` más `can` de `$lib/permissions.ts`, que es una
 * función pura. Así **la comprobación es idéntica en el servidor y en la
 * pantalla**: el servidor la usa para decidir y la pantalla para no ofrecer un
 * botón que va a rebotar.
 *
 * **Todo lo que reparte poder deja constancia.** Por eso los cambios reciben un
 * actor y escriben en el registro dentro de su propia transacción: un rol que se
 * otorga sin que quede anotado es exactamente el movimiento que después nadie
 * puede reconstruir.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { and, eq, inArray } from 'drizzle-orm';
import { pilot, pilotRole, role, rolePermission, type Role } from '../db/schema';
import type { Db } from '../db/types';
import { ALL_PERMISSIONS, isPermission } from '$lib/permissions';
import { record } from './events';

/** No se pudo tocar un rol. El mensaje se le muestra a quien lo intentó. */
export class RoleError extends Error {}

/**
 * El rol que trae todas las llaves.
 *
 * Existe desde la siembra y **no se puede borrar**: quedarse sin él es quedarse
 * afuera del cuartel sin forma de volver a entrar.
 */
export const ADMIN_ROLE = 'admin';

/** Lo que define a un rol: cómo se llama, para qué es, y qué abre. */
export interface RoleDraft {
	readonly name: string;
	readonly description: string;
	readonly permissions: readonly string[];
}

/** Los roles de un piloto, en orden de creación. */
export function rolesOf(db: Db, pilotId: number): readonly Role[] {
	const filas = db.select().from(pilotRole).where(eq(pilotRole.pilotId, pilotId)).all();
	if (filas.length === 0) return [];

	return db
		.select()
		.from(role)
		.where(
			inArray(
				role.id,
				filas.map((fila) => fila.roleId)
			)
		)
		.all();
}

/**
 * Todos los permisos de un piloto, sumando los de sus roles.
 *
 * Devuelve un conjunto y no una lista porque la pregunta que se le hace es
 * siempre de pertenencia, y porque dos roles que comparten una llave no tienen
 * por qué contarla dos veces.
 *
 * **Sin roles, el conjunto es vacío**: no hay permisos implícitos, ni siquiera
 * de lectura. Un piloto común no tiene ninguno y eso es lo correcto.
 */
export function permissionsOf(db: Db, pilotId: number): ReadonlySet<string> {
	const roles = rolesOf(db, pilotId);
	if (roles.length === 0) return new Set();

	const filas = db
		.select()
		.from(rolePermission)
		.where(
			inArray(
				rolePermission.roleId,
				roles.map((fila) => fila.id)
			)
		)
		.all();

	return new Set(filas.map((fila) => fila.permission));
}

/** Un rol por su código, o `null` si no existe. */
export function roleByCode(db: Db, code: string): Role | null {
	return db.select().from(role).where(eq(role.code, code)).get() ?? null;
}

/** Un rol por su id, o `null` si no existe. */
export function roleById(db: Db, roleId: number): Role | null {
	return db.select().from(role).where(eq(role.id, roleId)).get() ?? null;
}

/** Todos los roles, en orden de creación: primero los que trae el juego. */
export function allRoles(db: Db): readonly Role[] {
	return db.select().from(role).orderBy(role.id).all();
}

/** Los permisos de un rol. */
export function permissionsOfRole(db: Db, roleId: number): readonly string[] {
	return db
		.select()
		.from(rolePermission)
		.where(eq(rolePermission.roleId, roleId))
		.all()
		.map((fila) => fila.permission);
}

/** Cuántos pilotos lleva cada rol, por id. Una consulta y no una por rol. */
export function bearerCounts(db: Db): Readonly<Record<number, number>> {
	const conteo: Record<number, number> = {};
	for (const fila of db.select({ roleId: pilotRole.roleId }).from(pilotRole).all()) {
		conteo[fila.roleId] = (conteo[fila.roleId] ?? 0) + 1;
	}
	return conteo;
}

/** Los pilotos que llevan un rol, con su distintivo. */
export function bearersOf(db: Db, roleId: number): readonly { id: number; callsign: string }[] {
	return db
		.select({ id: pilot.id, callsign: pilot.callsign })
		.from(pilotRole)
		.innerJoin(pilot, eq(pilot.id, pilotRole.pilotId))
		.where(eq(pilotRole.roleId, roleId))
		.orderBy(pilot.callsign)
		.all();
}

/**
 * Deja el rol con exactamente estos permisos.
 *
 * Se borran las filas y se escriben las nuevas en vez de ir buscando cuál cambió:
 * son unas pocas, y comparar cuesta más código que reescribir. Es lo mismo que
 * hace el equipamiento de una nave con sus ranuras.
 *
 * **Descarta los que no están en el catálogo** en vez de fallar: el catálogo
 * cambia con el código, y un pedido que trae una llave que ya no existe se
 * entiende igual —quiere las otras— mientras que rechazarlo entero dejaría el
 * panel inutilizable después de un despliegue.
 */
function writePermissions(db: Db, roleId: number, permissions: readonly string[]): string[] {
	const validos = [...new Set(permissions.filter(isPermission))];

	db.delete(rolePermission).where(eq(rolePermission.roleId, roleId)).run();
	if (validos.length > 0) {
		db.insert(rolePermission)
			.values(validos.map((permission) => ({ roleId, permission })))
			.run();
	}

	return validos;
}

/** El código de un rol nuevo, tal como se guarda. */
function cleanCode(code: string): string {
	const limpio = code.trim().toLowerCase();
	if (!/^[a-z][a-z0-9_-]{1,30}$/.test(limpio)) {
		throw new RoleError(
			'El código del rol empieza con letra y sigue con minúsculas, números o guiones.'
		);
	}
	return limpio;
}

/**
 * Crea un rol con sus permisos.
 *
 * El **código no se vuelve a tocar nunca**: es lo que el código fuente nombra
 * cuando necesita un rol concreto, y renombrarlo dejaría esa referencia
 * apuntando a nada. El nombre visible sí se cambia cuando haga falta.
 */
export function createRole(db: Db, code: string, draft: RoleDraft, actorId: number | null): Role {
	const limpio = cleanCode(code);
	if (!draft.name.trim()) throw new RoleError('El rol necesita un nombre.');
	if (roleByCode(db, limpio)) throw new RoleError(`Ya hay un rol con el código ${limpio}.`);

	return db.transaction((tx) => {
		const creado = tx
			.insert(role)
			.values({ code: limpio, name: draft.name.trim(), description: draft.description.trim() })
			.returning()
			.get();

		const permisos = writePermissions(tx, creado.id, draft.permissions);

		record(tx, {
			kind: 'role.created',
			actorId,
			subject: { kind: 'role', id: creado.id },
			payload: { name: creado.name, code: creado.code, permissions: permisos }
		});

		return creado;
	});
}

/**
 * Cambia el nombre, la descripción y los permisos de un rol.
 *
 * **A los de la siembra sí se les cambian los permisos.** La razón de que se
 * pueda es que el catálogo crece: un administrador al que le faltara la llave de
 * la herramienta recién construida no podría abrirla. Lo que no se puede es
 * borrarlos.
 */
export function updateRole(db: Db, roleId: number, draft: RoleDraft, actorId: number | null): void {
	const fila = roleById(db, roleId);
	if (!fila) throw new RoleError('Ese rol no existe.');
	if (!draft.name.trim()) throw new RoleError('El rol necesita un nombre.');

	db.transaction((tx) => {
		tx.update(role)
			.set({ name: draft.name.trim(), description: draft.description.trim() })
			.where(eq(role.id, roleId))
			.run();

		const permisos = writePermissions(tx, roleId, draft.permissions);

		record(tx, {
			kind: 'role.updated',
			actorId,
			subject: { kind: 'role', id: roleId },
			payload: { name: draft.name.trim(), code: fila.code, permissions: permisos }
		});
	});
}

/**
 * Borra un rol y se lo quita a quien lo tenga.
 *
 * Los de la siembra no se borran: son los que sostienen el cuartel, y sin el de
 * administrador nadie podría volver a entrar a crearlo.
 */
export function deleteRole(db: Db, roleId: number, actorId: number | null): void {
	const fila = roleById(db, roleId);
	if (!fila) throw new RoleError('Ese rol no existe.');
	if (fila.builtin) throw new RoleError(`${fila.name} viene con el juego y no se puede borrar.`);

	db.transaction((tx) => {
		tx.delete(rolePermission).where(eq(rolePermission.roleId, roleId)).run();
		tx.delete(pilotRole).where(eq(pilotRole.roleId, roleId)).run();
		tx.delete(role).where(eq(role.id, roleId)).run();

		record(tx, {
			kind: 'role.deleted',
			actorId,
			subject: { kind: 'role', id: roleId },
			payload: { name: fila.name, code: fila.code }
		});
	});
}

/** Le da un rol a un piloto. Dárselo dos veces no hace nada, ni anota de más. */
export function grantRole(db: Db, pilotId: number, roleId: number, actorId: number | null): void {
	const fila = roleById(db, roleId);
	if (!fila) throw new RoleError('Ese rol no existe.');

	const quien = db.select().from(pilot).where(eq(pilot.id, pilotId)).get();
	if (!quien) throw new RoleError('Ese piloto no existe.');

	db.transaction((tx) => {
		const puesto = tx
			.insert(pilotRole)
			.values({ pilotId, roleId, grantedBy: actorId })
			.onConflictDoNothing()
			.returning()
			.get();

		// Ya lo tenía: no pasó nada, así que no hay nada que registrar. Un registro
		// que anota los no-eventos se vuelve ruido, y el ruido no se audita.
		if (!puesto) return;

		record(tx, {
			kind: 'role.granted',
			actorId,
			subject: { kind: 'pilot', id: pilotId },
			payload: { callsign: quien.callsign, name: fila.name, code: fila.code }
		});
	});
}

/**
 * Se lo quita.
 *
 * **No deja al juego sin administradores.** Quitarle el rol de administración a
 * la última cuenta que lo tiene es cerrar la puerta desde afuera con la llave
 * adentro, y no hay pantalla desde donde arreglarlo.
 */
export function revokeRole(db: Db, pilotId: number, roleId: number, actorId: number | null): void {
	const fila = roleById(db, roleId);
	if (!fila) throw new RoleError('Ese rol no existe.');

	if (fila.code === ADMIN_ROLE && adminCount(db) <= 1) {
		throw new RoleError('Es el único administrador que queda: el juego no puede quedarse sin uno.');
	}

	const quien = db.select().from(pilot).where(eq(pilot.id, pilotId)).get();

	db.transaction((tx) => {
		const sacado = tx
			.delete(pilotRole)
			.where(and(eq(pilotRole.pilotId, pilotId), eq(pilotRole.roleId, roleId)))
			.returning()
			.get();

		if (!sacado) return;

		record(tx, {
			kind: 'role.revoked',
			actorId,
			subject: { kind: 'pilot', id: pilotId },
			payload: { callsign: quien?.callsign ?? '—', name: fila.name, code: fila.code }
		});
	});
}

/** Cuántos pilotos tienen el rol de administrador. */
export function adminCount(db: Db): number {
	const admin = roleByCode(db, ADMIN_ROLE);
	if (!admin) return 0;
	return db.select().from(pilotRole).where(eq(pilotRole.roleId, admin.id)).all().length;
}

/**
 * Deja creado el rol de administrador con **todas** las llaves del catálogo.
 *
 * Se vuelve a aplicar en cada siembra a propósito: el catálogo crece con el
 * código, y un administrador al que le faltara la llave nueva no podría abrir la
 * herramienta que se acaba de construir. Los permisos de los demás roles no se
 * tocan, que son decisión de quien los armó.
 *
 * No deja constancia: la siembra no es un acto de nadie, y anotarlo en cada
 * corrida llenaría el registro de una fila que no cuenta nada.
 */
export function ensureAdminRole(db: Db): Role {
	const existente = roleByCode(db, ADMIN_ROLE);
	if (existente) {
		writePermissions(db, existente.id, ALL_PERMISSIONS);
		return existente;
	}

	return db.transaction((tx) => {
		const creado = tx
			.insert(role)
			.values({
				code: ADMIN_ROLE,
				name: 'Administrador',
				description: 'Todas las llaves del cuartel. No se puede borrar.',
				builtin: true
			})
			.returning()
			.get();

		writePermissions(tx, creado.id, ALL_PERMISSIONS);
		return creado;
	});
}
