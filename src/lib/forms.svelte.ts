/**
 * Saber cuándo un formulario está trabajando.
 *
 * Existe porque los formularios del cuartel escriben en la base y **a veces
 * tardan**: crear un cuerpo toca varias tablas, y una contraseña nueva pasa por
 * argon2, que es lento a propósito. Sin señal, quien apretó no sabe si el clic
 * entró y vuelve a apretar; con dos envíos en camino, el segundo puede chocar
 * contra lo que dejó el primero.
 *
 * Es una fábrica y no un estado global: **una pantalla puede tener varios
 * formularios** y bloquear todos porque uno está enviando sería peor que no
 * bloquear ninguno. Cada uno pide el suyo, o comparten uno cuando lo que se
 * quiere es justamente que no se pisen.
 *
 * Vive en un `.svelte.ts` porque usa runas, que fuera de un componente sólo
 * funcionan en un módulo con esa extensión.
 */

import { enhance } from '$app/forms';

/**
 * Un control de envío para uno o varios formularios.
 *
 * Se usa así, y el botón se apaga solo mientras el envío está en camino:
 *
 * ```svelte
 * const envio = submitting();
 * <form method="POST" use:envio.enhance>
 *   <HudButton type="submit" disabled={envio.busy}>Guardar</HudButton>
 * </form>
 * ```
 */
export function submitting() {
	let trabajando = $state(false);

	return {
		/** Si hay un envío en curso. Lo miran los botones para apagarse. */
		get busy() {
			return trabajando;
		},

		/** Lo que se le pasa a `use:`. Envuelve al `enhance` de SvelteKit. */
		enhance(form: HTMLFormElement) {
			return enhance(form, () => {
				trabajando = true;

				return async ({ update }) => {
					// **Sin limpiar los campos**: en un formulario de edición, vaciarlo al
					// guardar borra de la pantalla lo que se acaba de escribir.
					await update({ reset: false });
					trabajando = false;
				};
			});
		}
	};
}
