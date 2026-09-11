/**
 * El tipo de la conexión, aparte de la conexión misma.
 *
 * Los servicios reciben la base como primer argumento y sólo necesitan su tipo;
 * importarlo desde acá evita arrastrar la conexión real —y con ella las
 * variables de entorno— a un test que corre contra una base en memoria.
 */

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from './schema';

export type Db = BetterSQLite3Database<typeof schema>;
