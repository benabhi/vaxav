<!--
	Un panel que se abre desde un disparador, sin librerías.

	Se apoya en la API de popover del navegador: con `popover="auto"` el panel va
	a la capa superior, se cierra con Escape y se cierra al tocar afuera, sin que
	haya que escribir nada de eso. Lo único que queda por resolver es **dónde
	ponerlo**, y de eso se encarga `ubicar`.

	Debajo del disparador y alineado a su izquierda, como en el juego; si no entra
	abajo, se da vuelta y sale arriba.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Lo que se toca para abrirlo. */
		trigger: Snippet;
		/** Lo que se ve al abrirlo. */
		children: Snippet;
		/** Cuánto aire queda entre el disparador y el panel. */
		gap?: number;
		label?: string;
	}

	let { trigger, children, gap = 6, label = '' }: Props = $props();

	let disparador = $state<HTMLElement>();
	let panel = $state<HTMLElement>();
	let abierto = $state(false);

	/** Deja el panel pegado al disparador, dentro de la ventana. */
	function ubicar() {
		if (!disparador || !panel) return;
		const ancla = disparador.getBoundingClientRect();
		const caja = panel.getBoundingClientRect();

		// Abajo por omisión; arriba si abajo no entra y arriba sí.
		const cabeAbajo = ancla.bottom + gap + caja.height <= window.innerHeight;
		const arriba = cabeAbajo ? ancla.bottom + gap : ancla.top - gap - caja.height;

		// Alineado a la izquierda del disparador, sin salirse por la derecha.
		const maximo = window.innerWidth - caja.width - gap;
		const izquierda = Math.max(gap, Math.min(ancla.left, maximo));

		panel.style.top = `${Math.max(gap, arriba)}px`;
		panel.style.left = `${izquierda}px`;
	}

	function alternar() {
		if (!panel) return;
		if (abierto) {
			panel.hidePopover();
		} else {
			// Se muestra primero y se ubica después: hasta que no está en la capa
			// superior no se puede medir cuánto ocupa.
			panel.showPopover();
			ubicar();
		}
	}

	$effect(() => {
		if (!abierto) return;
		const seguir = () => ubicar();
		window.addEventListener('resize', seguir);
		window.addEventListener('scroll', seguir, true);
		return () => {
			window.removeEventListener('resize', seguir);
			window.removeEventListener('scroll', seguir, true);
		};
	});
</script>

<span
	bind:this={disparador}
	role="button"
	tabindex="0"
	aria-label={label || undefined}
	aria-expanded={abierto}
	class="inline-flex cursor-pointer"
	onclick={alternar}
	onkeydown={(evento) => {
		if (evento.key === 'Enter' || evento.key === ' ') {
			evento.preventDefault();
			alternar();
		}
	}}
>
	{@render trigger()}
</span>

<div
	bind:this={panel}
	popover="auto"
	class="m-0 w-fit border-0 bg-transparent p-0"
	ontoggle={(evento) => (abierto = evento.newState === 'open')}
>
	{@render children()}
</div>
