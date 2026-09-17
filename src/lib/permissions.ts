/**
 * Los permisos del cuartel general: qué se puede hacer con las herramientas de
 * administración.
 *
 * **El catálogo está en código y no en la base**, y ésa es la decisión que
 * ordena todo lo demás. Un permiso es la llave que algún `if` del servidor
 * consulta antes de dejar pasar; uno inventado desde un panel no lo mira nadie,
 * así que sería una casilla que miente. Los **roles** sí son filas —un rol es un
 * manojo de permisos y tiene sentido armar uno nuevo sin desplegar— pero las
 * llaves que ese manojo puede llevar son exactamente éstas.
 *
 * Vive en `$lib` y no bajo `server/` porque lo necesitan los dos lados: el
 * servidor para decidir, y la pantalla para no ofrecer un botón que va a
 * rebotar. **Ofrecer menos no es proteger**: quien decide es siempre el
 * servidor, y esto sólo evita mostrarle a alguien una puerta que no puede abrir.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

/**
 * Las áreas en que se agrupan los permisos.
 *
 * No son una jerarquía —no existe "tener el área"— sino la forma de leerlos: un
 * panel con veinte casillas sueltas es una lista, uno con cuatro grupos de cinco
 * es un formulario que se entiende.
 */
export const PERMISSION_AREAS = ['pilots', 'universe', 'roles', 'oversight'] as const;
export type PermissionArea = (typeof PERMISSION_AREAS)[number];

/** Cómo se llama cada área en pantalla. */
export const AREA_LABELS: Readonly<Record<PermissionArea, string>> = {
	pilots: 'Pilotos',
	universe: 'Universo',
	roles: 'Roles y permisos',
	oversight: 'Vigilancia'
};

/** Un permiso del catálogo. */
export interface Permission {
	readonly code: string;
	readonly area: PermissionArea;
	readonly label: string;
	/** Qué habilita, escrito para quien arma un rol y no escribió el código. */
	readonly summary: string;
	/**
	 * Si otorgarlo es peligroso.
	 *
	 * Los marcados dejan **borrar cosas que no vuelven** o **repartir poder**. No
	 * cambian la comprobación —un permiso es un permiso— pero el panel los pinta
	 * distinto, porque marcar una casilla de más no debería ser igual de barato
	 * que marcar cualquier otra.
	 */
	readonly dangerous: boolean;
}

function define(
	code: string,
	area: PermissionArea,
	label: string,
	summary: string,
	dangerous = false
): Permission {
	return { code, area, label, summary, dangerous };
}

/**
 * El catálogo entero, en el orden en que se muestra.
 *
 * Cada uno se lee **por separado**: no hay permisos que impliquen otros. Que
 * editar no implique leer parece redundante y es lo que hace que la comprobación
 * sea siempre una sola pregunta; un rol que edita sin leer no tiene sentido, pero
 * armarlo es problema de quien lo arma y no una trampa del sistema.
 */
export const PERMISSIONS: readonly Permission[] = [
	define('pilots.read', 'pilots', 'Ver pilotos', 'Buscar cuentas y abrir su ficha.'),
	define(
		'pilots.edit',
		'pilots',
		'Editar pilotos',
		'Cambiar los datos de una cuenta y lo que tiene: créditos, carga, naves.'
	),
	define(
		'pilots.delete',
		'pilots',
		'Dar de baja pilotos',
		'Borrar una cuenta y todo lo que colgaba de ella. No se puede deshacer.',
		true
	),

	define(
		'pilots.rush',
		'pilots',
		'Terminar órdenes',
		'Terminar al instante la orden en curso, sin esperar el reloj. Es una ' +
			'herramienta para probar el juego, no una del juego.',
		true
	),

	define('universe.read', 'universe', 'Ver el universo', 'Abrir sistemas, cuerpos y estaciones.'),
	define(
		'universe.edit',
		'universe',
		'Construir el universo',
		'Crear y editar sistemas, cuerpos, estaciones y puertas.'
	),
	define(
		'universe.delete',
		'universe',
		'Borrar del universo',
		'Eliminar sistemas o cuerpos, con todo lo que tengan encima.',
		true
	),

	define(
		'roles.read',
		'roles',
		'Ver roles',
		'Consultar qué roles hay y qué permisos lleva cada uno.'
	),
	define(
		'roles.edit',
		'roles',
		'Administrar roles',
		'Crear roles, cambiarles los permisos y asignárselos a un piloto. Incluye poder darse permisos a uno mismo.',
		true
	),

	define(
		'events.read',
		'oversight',
		'Ver el registro',
		'Leer el registro de lo que pasó en el juego.'
	),
	define('stats.read', 'oversight', 'Ver estadísticas', 'Mirar los números agregados del juego.')
];

/**
 * La llave de terminar una orden al instante.
 *
 * Tiene nombre porque la preguntan dos lugares —el layout del juego, para
 * dibujar el botón, y el endpoint, para dejar pasar— y un código escrito a mano
 * en dos archivos es el que un día queda mal escrito en uno solo.
 */
export const RUSH_PERMISSION = 'pilots.rush';

/** El catálogo por código, para preguntar por uno. */
const BY_CODE = new Map(PERMISSIONS.map((permission) => [permission.code, permission]));

/** Todos los códigos, que es lo que lleva el rol de administrador. */
export const ALL_PERMISSIONS: readonly string[] = PERMISSIONS.map((permission) => permission.code);

/** Si ese código existe en el catálogo. */
export function isPermission(code: string): boolean {
	return BY_CODE.has(code);
}

/** Un permiso por su código, o `null` si no está en el catálogo. */
export function getPermission(code: string): Permission | null {
	return BY_CODE.get(code) ?? null;
}

/**
 * Cómo se lee un permiso guardado.
 *
 * Devuelve el código a secas cuando el catálogo ya no lo conoce, en vez de
 * romper: un rol viejo puede llevar una llave que se sacó del código, y la
 * pantalla tiene que poder mostrarla para que alguien la quite.
 */
export function permissionLabel(code: string): string {
	return BY_CODE.get(code)?.label ?? code;
}

/** Los permisos de un área, en el orden del catálogo. */
export function permissionsOfArea(area: PermissionArea): readonly Permission[] {
	return PERMISSIONS.filter((permission) => permission.area === area);
}

/**
 * Si ese manojo de permisos abre esa puerta.
 *
 * Es una función pura y la única forma de preguntar, así que la comprobación es
 * la misma en el servidor y en la pantalla. Un conjunto vacío no abre nada: **no
 * hay permisos implícitos**, ni siquiera de lectura.
 */
export function can(granted: Iterable<string>, permission: string): boolean {
	for (const code of granted) if (code === permission) return true;
	return false;
}

/** Si abre **todas** las puertas de la lista. Sin lista, no abre nada. */
export function canAll(granted: Iterable<string>, permissions: readonly string[]): boolean {
	if (permissions.length === 0) return false;
	const tiene = new Set(granted);
	return permissions.every((permission) => tiene.has(permission));
}

/** Si abre **alguna** de las puertas de la lista. */
export function canAny(granted: Iterable<string>, permissions: readonly string[]): boolean {
	const tiene = new Set(granted);
	return permissions.some((permission) => tiene.has(permission));
}
