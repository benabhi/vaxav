/**
 * Las fichas que se miran sin salir de donde estás: el «ver quién es» del juego.
 *
 * Una ficha es **una ventana y no una pantalla**. Llevar a alguien al módulo
 * Corporación para mostrarle una corporación ajena —con el Neocom marcando
 * «Corporación» y las pestañas de uno al lado— la hace leer como si fuera la
 * suya; y sacar cada ficha a su propia ruta agregaría el tercer nivel de
 * navegación que el proyecto no tiene. La ventana se abre encima, se mira y se
 * cierra.
 *
 * **Su estado vive en la URL igual.** Cuál está abierta, qué sección se está
 * mirando y por dónde va su listado son recortes, y la regla del proyecto es que
 * un recorte viaja en la URL: así una ficha se comparte por mensaje, se cierra
 * con el botón de atrás y se recarga sin perderla. Una ventana que sólo existe
 * en la memoria del navegador no se puede mandar a nadie.
 *
 * Y por eso los parámetros llevan prefijo: **abajo de la ventana hay una
 * pantalla** con sus propios `buscar`, `orden` y `pagina`, y sin prefijo el
 * buscador de la ficha filtraría la tabla de atrás. La URL queda más larga; a
 * cambio, las dos cosas funcionan a la vez.
 *
 * Este módulo vive fuera de `server/` porque lo necesitan los dos lados: el
 * servidor para armar la ficha y la pantalla para construir los enlaces.
 */

/** Qué clase de cosa se está mirando. */
export const FICHA_KINDS = ['corporacion', 'piloto', 'agente'] as const;
export type FichaKind = (typeof FICHA_KINDS)[number];

/**
 * El prefijo de todo parámetro de la ventana.
 *
 * Una letra y un guion bajo: lo bastante corto para no ensuciar la URL y lo
 * bastante raro para que ninguna pantalla lo use por casualidad.
 */
export const FICHA_PREFIX = 'f_';

/** El parámetro que dice qué ficha está abierta, y con qué forma. */
export const FICHA_PARAM = 'ficha';

/** Las secciones de la ficha de una corporación, en el orden en que se muestran. */
export const CORPORATION_SECTIONS = [
	{ code: 'info', label: 'Información' },
	{ code: 'reputacion', label: 'Reputación' },
	{ code: 'ubicaciones', label: 'Ubicaciones' },
	{ code: 'agentes', label: 'Agentes' },
	{ code: 'miembros', label: 'Miembros' }
] as const;

export type CorporationSection = (typeof CORPORATION_SECTIONS)[number]['code'];

/** Qué ficha pide una URL, ya partida. `null` si no pide ninguna. */
export interface FichaPedida {
	readonly kind: FichaKind;
	readonly code: string;
	readonly section: string;
}

/**
 * Lee de la URL qué ficha abrir.
 *
 * El valor es `clase:código` —«corporacion:casa_verlan»— y no dos parámetros
 * sueltos: los dos viajan siempre juntos y separarlos deja abierta la
 * posibilidad de una clase sin código, que no quiere decir nada.
 */
export function readFicha(params: URLSearchParams): FichaPedida | null {
	const crudo = params.get(FICHA_PARAM) ?? '';
	const corte = crudo.indexOf(':');
	if (corte < 1) return null;

	const kind = crudo.slice(0, corte);
	const code = crudo.slice(corte + 1);
	if (!code || !FICHA_KINDS.includes(kind as FichaKind)) return null;

	return {
		kind: kind as FichaKind,
		code,
		section: params.get(`${FICHA_PREFIX}seccion`) ?? ''
	};
}

/**
 * Los parámetros del listado de la ventana, sin el prefijo.
 *
 * Es lo que deja **reusar los lectores de consulta tal cual**: `readAgentsQuery`
 * y sus hermanos esperan `buscar`, `orden` y `pagina`, y no tienen por qué saber
 * que esta vez vinieron con un prefijo adelante.
 */
export function sinPrefijo(params: URLSearchParams): URLSearchParams {
	const limpios = new URLSearchParams();
	for (const [clave, valor] of params) {
		if (clave.startsWith(FICHA_PREFIX)) limpios.set(clave.slice(FICHA_PREFIX.length), valor);
	}
	return limpios;
}

/** Cómo se nombra una ficha en la URL. */
export function fichaValue(kind: FichaKind, code: string): string {
	return `${kind}:${code}`;
}

/**
 * El enlace que abre una ficha sin perder dónde estabas.
 *
 * Conserva lo que la pantalla tenía en la URL —su búsqueda, su página— y limpia
 * lo de cualquier ficha que estuviera abierta: abrir otra empieza de cero, que es
 * lo único que tiene sentido cuando se cambia de quién se está mirando.
 */
export function hrefFicha(url: URL, kind: FichaKind, code: string): string {
	const params = new URLSearchParams(url.searchParams);
	for (const clave of [...params.keys()]) {
		if (clave.startsWith(FICHA_PREFIX)) params.delete(clave);
	}
	params.set(FICHA_PARAM, fichaValue(kind, code));
	return `${url.pathname}?${params.toString()}`;
}
