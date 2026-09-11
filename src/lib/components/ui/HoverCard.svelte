<!--
	Un aviso que aparece al señalar algo, hermano del `Popover`.

	Misma mecánica y por las mismas razones: la API de popover del navegador pone
	el panel en la capa superior y lo cierra con Escape, y `ubicar` resuelve
	dónde. Lo que cambia es qué lo abre —señalar en vez de tocar— y que espera un
	momento antes de aparecer: sin esa demora, pasar el mouse por encima de una
	fila de botones enciende todos los avisos de camino.

	Se abre también con el foco del teclado. Un aviso que sólo existe para el
	mouse es un aviso que la mitad de la gente no lee nunca.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Lo que se señala. */
		trigger: Snippet;
		/** Lo que se ve al señalarlo. */
		children: Snippet;
		/** Cuánto aire queda entre el disparador y el panel. */
		gap?: number;
		/** Cuánto espera antes de aparecer, en milisegundos. */
		delay?: number;
	}

	let { trigger, children, gap = 6, delay = 200 }: Props = $props();

	let disparador = $state<HTMLElement>();
	let panel = $state<HTMLElement>();
	let abierto = $state(false);
	let pendiente: ReturnType<typeof setTimeout> | undefined;

	/** Deja el panel pegado al disparador, dentro de la ventana. */
	function ubicar() {
		if (!disparador || !panel) return;
		const ancla = disparador.getBoundingClientRect();
		const caja = panel.getBoundingClientRect();

		// Arriba por omisión —un aviso de botón tapa menos desde arriba—; abajo si
		// arriba no entra.
		const cabeArriba = ancla.top - gap - caja.height >= 0;
		const arriba = cabeArriba ? ancla.top - gap - caja.height : ancla.bottom + gap;

		// Centrado sobre el disparador, sin salirse por los costados.
		const maximo = window.innerWidth - caja.width - gap;
		const centrado = ancla.left + ancla.width / 2 - caja.width / 2;

		panel.style.top = `${arriba}px`;
		panel.style.left = `${Math.max(gap, Math.min(centrado, maximo))}px`;
	}

	function abrir() {
		clearTimeout(pendiente);
		pendiente = setTimeout(() => {
			if (!panel || abierto) return;
			// Se muestra primero y se ubica después: hasta que no está en la capa
			// superior no se puede medir cuánto ocupa.
			panel.showPopover();
			ubicar();
		}, delay);
	}

	function cerrar() {
		clearTimeout(pendiente);
		if (abierto) panel?.hidePopover();
	}

	$effect(() => {
		// Se limpia el temporizador pendiente si el componente se va antes de que
		// el aviso llegue a abrirse.
		return () => clearTimeout(pendiente);
	});
</script>

<!--
	La envoltura sólo detecta el señalar y el foco; lo interactivo es lo que va
	adentro, que trae su propio rol y su propio nombre. No hay nada que
	anunciarle acá a un lector de pantalla, así que se silencia la regla en vez
	de inventarle un rol que mentiría.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	bind:this={disparador}
	class="inline-flex"
	onmouseenter={abrir}
	onmouseleave={cerrar}
	onfocusin={abrir}
	onfocusout={cerrar}
>
	{@render trigger()}
</span>

<div
	bind:this={panel}
	popover="auto"
	class="pointer-events-none m-0 w-fit border-0 bg-transparent p-0"
	ontoggle={(evento) => (abierto = evento.newState === 'open')}
>
	{@render children()}
</div>
