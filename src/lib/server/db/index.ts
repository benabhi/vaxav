/**
 * El acceso a la base.
 *
 * La conexión se abre una sola vez y se comparte: el resto de la aplicación la
 * recibe como primer argumento, para que cada operación pueda probarse contra
 * una base en memoria y la transacción quede en manos de quien llama.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('Falta DATABASE_URL');

const sqlite = new Database(env.DATABASE_URL);

// Escritura por diario: deja leer mientras se escribe, que es lo que necesita un
// juego donde toda pantalla consulta y sólo algunas guardan.
sqlite.pragma('journal_mode = WAL');
// Sin esto SQLite acepta una referencia a una fila que no existe y el error
// aparece mucho después, cuando ya no se sabe quién la escribió.
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

/** El tipo de la conexión, para tipar lo que reciben los servicios. */
export type Db = typeof db;
