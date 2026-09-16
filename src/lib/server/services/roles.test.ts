/** Los roles reparten llaves, y repartir poder siempre deja constancia. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { eventsPage } from './events';
import {
	ADMIN_ROLE,
	RoleError,
	adminCount,
	allRoles,
	bearerCounts,
	bearersOf,
	createRole,
	deleteRole,
	ensureAdminRole,
	grantRole,
	permissionsOf,
	permissionsOfRole,
	revokeRole,
	roleByCode,
	rolesOf,
	updateRole
} from './roles';
import { ALL_PERMISSIONS, can } from '$lib/permissions';
import { canEnterAdmin, sectionsFor } from '$lib/admin';

/** Un rol de moderación, que es el ejemplo más chico que no es el de administrador. */
function moderador(db: ReturnType<typeof seededDb>, actorId: number | null = null) {
	return createRole(
		db,
		'moderador',
		{
			name: 'Moderador',
			description: 'Mira cuentas y el registro.',
			permissions: ['pilots.read', 'events.read']
		},
		actorId
	);
}

describe('el rol de administrador', () => {
	it('lo deja creado con todas las llaves del catálogo', () => {
		const db = seededDb();
		const rol = ensureAdminRole(db);

		expect(rol.code).toBe(ADMIN_ROLE);
		expect(rol.builtin).toBe(true);
		expect([...permissionsOfRole(db, rol.id)].sort()).toEqual([...ALL_PERMISSIONS].sort());
	});

	/*
	 * El catálogo crece con el código. Un administrador al que le faltara la
	 * llave de la herramienta recién construida no podría abrirla, y la siembra
	 * es el único momento en que se le pueden dar las nuevas.
	 */
	it('es idempotente y le devuelve las llaves que le falten', () => {
		const db = seededDb();
		const rol = ensureAdminRole(db);

		updateRole(db, rol.id, { name: 'Administrador', description: '', permissions: [] }, null);
		expect(permissionsOfRole(db, rol.id)).toHaveLength(0);

		const otra = ensureAdminRole(db);
		expect(otra.id).toBe(rol.id);
		expect(permissionsOfRole(db, rol.id)).toHaveLength(ALL_PERMISSIONS.length);
		expect(allRoles(db)).toHaveLength(1);
	});

	it('no se puede borrar', () => {
		const db = seededDb();
		const rol = ensureAdminRole(db);

		expect(() => deleteRole(db, rol.id, null)).toThrow(RoleError);
	});
});

describe('crear y cambiar roles', () => {
	it('guarda el código en minúsculas y rechaza los que no son código', () => {
		const db = seededDb();

		expect(
			createRole(db, '  Moderador  ', { name: 'Moderador', description: '', permissions: [] }, null)
				.code
		).toBe('moderador');

		for (const malo of ['', '9inicio', 'con espacio', 'eñe', 'x'.repeat(40)]) {
			expect(() =>
				createRole(db, malo, { name: 'Otro', description: '', permissions: [] }, null)
			).toThrow(RoleError);
		}
	});

	it('no deja repetir un código', () => {
		const db = seededDb();
		moderador(db);

		expect(() => moderador(db)).toThrow(RoleError);
	});

	/*
	 * El catálogo cambia con el código: un pedido que trae una llave que ya no
	 * existe se entiende igual —quiere las otras— y rechazarlo entero dejaría el
	 * panel inutilizable después de un despliegue.
	 */
	it('descarta los permisos que no están en el catálogo, sin fallar', () => {
		const db = seededDb();
		const rol = createRole(
			db,
			'raro',
			{
				name: 'Raro',
				description: '',
				permissions: ['pilots.read', 'pilots.volar', 'pilots.read']
			},
			null
		);

		expect(permissionsOfRole(db, rol.id)).toEqual(['pilots.read']);
	});

	it('deja el rol con exactamente los permisos que se le pasan', () => {
		const db = seededDb();
		const rol = moderador(db);

		updateRole(
			db,
			rol.id,
			{ name: 'Vigía', description: 'Sólo mira.', permissions: ['events.read'] },
			null
		);

		expect(permissionsOfRole(db, rol.id)).toEqual(['events.read']);
		expect(roleByCode(db, 'moderador')!.name).toBe('Vigía');
	});

	it('nunca cambia el código, que es lo que el código fuente nombra', () => {
		const db = seededDb();
		const rol = moderador(db);

		updateRole(db, rol.id, { name: 'Otra cosa', description: '', permissions: [] }, null);
		expect(roleByCode(db, 'moderador')!.id).toBe(rol.id);
	});

	it('al borrarlo se lo saca a quien lo tenía', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const rol = moderador(db);

		grantRole(db, piloto.id, rol.id, null);
		expect(rolesOf(db, piloto.id)).toHaveLength(1);

		deleteRole(db, rol.id, null);
		expect(rolesOf(db, piloto.id)).toHaveLength(0);
		expect(permissionsOf(db, piloto.id).size).toBe(0);
	});
});

describe('las llaves de un piloto', () => {
	it('sin roles no tiene ninguna', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(permissionsOf(db, piloto.id).size).toBe(0);
	});

	/*
	 * Los oficios de administración se acumulan. Que se sumen es lo que evita
	 * tener que inventar un rol combinado por cada mezcla que aparezca.
	 */
	it('suma las de todos sus roles y no cuenta dos veces la repetida', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const uno = moderador(db);
		const otro = createRole(
			db,
			'contador',
			{ name: 'Contador', description: '', permissions: ['events.read', 'stats.read'] },
			null
		);

		grantRole(db, piloto.id, uno.id, null);
		grantRole(db, piloto.id, otro.id, null);

		expect([...permissionsOf(db, piloto.id)].sort()).toEqual([
			'events.read',
			'pilots.read',
			'stats.read'
		]);
	});

	it('dárselo dos veces no lo duplica', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const rol = moderador(db);

		grantRole(db, piloto.id, rol.id, null);
		grantRole(db, piloto.id, rol.id, null);

		expect(rolesOf(db, piloto.id)).toHaveLength(1);
		expect(bearerCounts(db)[rol.id]).toBe(1);
		expect(bearersOf(db, rol.id).map((uno) => uno.callsign)).toEqual([piloto.callsign]);
	});
});

describe('el último administrador', () => {
	/*
	 * Quitarle el rol a la última cuenta que lo tiene es cerrar la puerta desde
	 * afuera con la llave adentro: no queda ninguna pantalla desde donde volver a
	 * crearlo.
	 */
	it('no se puede quedar sin el rol', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const rol = ensureAdminRole(db);

		grantRole(db, piloto.id, rol.id, null);
		expect(adminCount(db)).toBe(1);
		expect(() => revokeRole(db, piloto.id, rol.id, null)).toThrow(RoleError);
	});

	it('si hay dos, a cualquiera se le puede sacar', async () => {
		const db = seededDb();
		const uno = await crearPiloto(db, 'Halcon');
		const otro = await crearPiloto(db, 'Cuervo');
		const rol = ensureAdminRole(db);

		grantRole(db, uno.id, rol.id, null);
		grantRole(db, otro.id, rol.id, null);
		expect(adminCount(db)).toBe(2);

		revokeRole(db, otro.id, rol.id, uno.id);
		expect(adminCount(db)).toBe(1);
		expect(rolesOf(db, otro.id)).toHaveLength(0);
	});
});

/*
 * Es la prueba de que el sistema hace lo que se le pidió: un rol a medida, con
 * exactamente las llaves que uno elija, que abre sólo esas puertas. Toda la
 * cadena —crear el rol, dárselo, resolver sus permisos y decidir qué ve— va
 * junta acá, porque lo que importa no es cada eslabón sino que encadenen.
 */
describe('roles a medida', () => {
	it('uno que sólo mira el registro entra al cuartel y ve sólo esa sección', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Vigia');

		const rol = createRole(
			db,
			'vigia',
			{ name: 'Vigía', description: 'Sólo mira el registro.', permissions: ['events.read'] },
			null
		);
		grantRole(db, piloto.id, rol.id, null);

		const llaves = permissionsOf(db, piloto.id);
		expect(canEnterAdmin(llaves)).toBe(true);
		expect(sectionsFor(llaves).map((una) => una.code)).toEqual(['overview', 'events']);
		expect(can(llaves, 'events.read')).toBe(true);
		expect(can(llaves, 'stats.read')).toBe(false);
		expect(can(llaves, 'pilots.delete')).toBe(false);
	});

	it('uno que sólo construye el universo no puede mirar el registro', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Cartografo');

		const rol = createRole(
			db,
			'cartografo',
			{
				name: 'Cartógrafo',
				description: 'Arma sistemas.',
				permissions: ['universe.read', 'universe.edit']
			},
			null
		);
		grantRole(db, piloto.id, rol.id, null);

		const llaves = permissionsOf(db, piloto.id);
		expect(canEnterAdmin(llaves)).toBe(true);
		expect(can(llaves, 'universe.edit')).toBe(true);
		// Construir no es borrar, y no es mirar lo que hicieron los demás.
		expect(can(llaves, 'universe.delete')).toBe(false);
		expect(can(llaves, 'events.read')).toBe(false);
		// Ve el cuartel y la sección del universo, que es la que necesita. El
		// registro no: mirar lo que hicieron los demás es otra llave.
		expect(sectionsFor(llaves).map((una) => una.code)).toEqual(['overview', 'universe']);
	});

	it('sin ningún rol, el cuartel no existe', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Comun');

		expect(canEnterAdmin(permissionsOf(db, piloto.id))).toBe(false);
	});
});

describe('la constancia de lo que se reparte', () => {
	it('anota crear, cambiar, otorgar, retirar y borrar', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');
		const nuevo = await crearPiloto(db, 'Cuervo');

		const rol = moderador(db, jefe.id);
		updateRole(db, rol.id, { name: 'Vigía', description: '', permissions: [] }, jefe.id);
		grantRole(db, nuevo.id, rol.id, jefe.id);
		revokeRole(db, nuevo.id, rol.id, jefe.id);
		deleteRole(db, rol.id, jefe.id);

		const anotados = eventsPage(db, { kinds: undefined }, 1, 50).rows.map((fila) => fila.kind);
		expect(anotados).toContain('role.created');
		expect(anotados).toContain('role.updated');
		expect(anotados).toContain('role.granted');
		expect(anotados).toContain('role.revoked');
		expect(anotados).toContain('role.deleted');
	});

	/*
	 * Un registro que anota los no-eventos se vuelve ruido, y el ruido no se
	 * audita.
	 */
	it('no anota nada cuando no pasó nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const rol = moderador(db);

		grantRole(db, piloto.id, rol.id, null);
		const despues = eventsPage(db, { kinds: ['role.granted'] }).total;

		grantRole(db, piloto.id, rol.id, null);
		revokeRole(db, piloto.id, rol.id, null);
		revokeRole(db, piloto.id, rol.id, null);

		expect(eventsPage(db, { kinds: ['role.granted'] }).total).toBe(despues);
		expect(eventsPage(db, { kinds: ['role.revoked'] }).total).toBe(1);
	});

	it('guarda el nombre de quien lo hizo, no sólo su número', async () => {
		const db = seededDb();
		const jefe = await crearPiloto(db, 'Halcon');
		moderador(db, jefe.id);

		const fila = eventsPage(db, { kinds: ['role.created'] }).rows[0];
		expect(fila.actor).toBe('Halcon');
		expect(fila.payload.actor).toBe('Halcon');
	});
});
