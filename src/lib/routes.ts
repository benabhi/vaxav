/**
 * Las rutas de la aplicación.
 *
 * Las URL están en español porque son parte de lo que ve el jugador; los
 * identificadores, como todo el código, en inglés. Centralizarlas evita que una
 * ruta escrita a mano en un enlace quede desincronizada del árbol de navegación.
 */

// --- Públicas ---------------------------------------------------------------

export const INDEX_ROUTE = '/';
export const LOGIN_ROUTE = '/entrar';
export const REGISTER_ROUTE = '/registro';

// --- Secciones del juego ----------------------------------------------------
//
// Son las que lista el Neocom, y todas exigen sesión abierta.

export const PILOT_ROUTE = '/piloto';
export const SHIP_ROUTE = '/nave';
export const NAVIGATION_ROUTE = '/navegacion';
export const MARKET_ROUTE = '/mercado';
export const WALLET_ROUTE = '/billetera';
export const ASSETS_ROUTE = '/propiedades';
export const MAIL_ROUTE = '/mensajes';
export const CORPORATION_ROUTE = '/corporacion';

/**
 * No vive en el Neocom junto a las demás: cuelga aparte, entre "Plegar" y
 * "Salir". Igual exige sesión y tiene su página como cualquier otra.
 */
export const OPTIONS_ROUTE = '/opciones';

/** A dónde va el piloto apenas entra. */
export const HOME_ROUTE = PILOT_ROUTE;
