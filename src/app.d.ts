import type { ActionReport } from '$lib/server/services/actions';
import type { Pilot, Sanction } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			/** El piloto de la sesión abierta, o `null` si no hay ninguna. */
			pilot: Pilot | null;
			/** El token de la cookie, para poder cerrarla al salir. */
			sessionToken: string;
			/**
			 * La orden que venció en este pedido y se acaba de aplicar, o `null`.
			 * La resuelve el hook para que todas las pantallas vean lo mismo.
			 */
			resolved: ActionReport | null;
			/**
			 * Las llaves de administración del piloto, resueltas por el hook.
			 * Vacío si no hay sesión: **no hay permisos implícitos**.
			 */
			permissions: ReadonlySet<string>;
			/**
			 * La sanción que le cierra la puerta ahora mismo, o `null` si puede
			 * entrar. La resuelve el hook para que el rebote no dependa de qué
			 * pantalla haya pedido.
			 */
			sanction: Sanction | null;
		}
	}
}

export {};
