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

/**
 * Donde termina un piloto sancionado.
 *
 * Tiene pantalla propia y no es un error del ingreso porque hay que decirle tres
 * cosas —qué tiene, por qué y hasta cuándo— y porque la sanción puede caerle con
 * la sesión ya abierta: sin un lugar a donde mandarlo, el juego lo rebotaría a
 * una pantalla de ingreso que no explica nada.
 */
export const SUSPENDED_ROUTE = '/suspendido';

/** A dónde va el piloto apenas entra. */
export const HOME_ROUTE = PILOT_ROUTE;
