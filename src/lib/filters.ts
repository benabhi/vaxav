/**
 * El vocabulario de los filtros que viajan en la URL.
 *
 * Son palabras que **el servidor y la pantalla tienen que leer igual**: una las
 * escribe en un desplegable y el otro las interpreta al recortar. Escritas dos
 * veces, el día que una cambie el filtro deja de encontrar cosas sin que nada
 * falle, que es la peor clase de error.
 *
 * Vive en `$lib` y no bajo `server/` por eso mismo: lo necesitan los dos lados.
 */

/**
 * Cómo se pide «los que no controla nadie» en un filtro de facción.
 *
 * Los catálogos del juego ya usan la cadena vacía para «espacio libre» —un
 * sistema sin dueño— y en un filtro el vacío significa «todas». Hacen falta las
 * dos cosas, así que el espacio libre se pide con un centinela y el vacío queda
 * para no filtrar.
 *
 * Lo usan el mapa del cuartel y el del piloto, que filtran la misma galaxia desde
 * dos pantallas distintas.
 */
export const FREE_SPACE = 'libre';
