<!--
	Campo de texto con su etiqueta y, si hace falta, una aclaración debajo.

	Sigue el HUD: fondo casi transparente, borde fino, esquinas rectas y un halo
	naranja al enfocarlo. El anillo interior claro y la sangría de once píxeles
	vienen del campo original y se conservan para que no se mueva nada.

	**Mide lo mismo que un botón**: en una cabina los controles están alineados, y
	un campo más alto que el botón que tiene al lado se nota aunque nadie sepa por
	qué. La medida es literal porque no está en la escala de espaciado, que es lo
	que manda CLAUDE.md para este caso.
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { CONTROL_HEIGHTS, type ControlSize } from '../buttons/estilos';

	// Se descarta el `size` del HTML —que cuenta caracteres— para usar el nombre
	// en la escala de controles, que es lo que significa acá.
	interface Props extends Omit<HTMLInputAttributes, 'value' | 'size'> {
		label: string;
		name: string;
		hint?: string;
		/** La misma escala que los botones, para que queden a la misma altura. */
		size?: ControlSize;
		/**
		 * Enlazable, para los formularios que además del envío necesitan lo
		 * escrito: el alta parte la cuenta en pasos y el campo deja de existir al
		 * pasar al siguiente, así que lo tipeado tiene que vivir afuera.
		 */
		value?: string;
	}

	let { label, name, hint = '', size = '2', value = $bindable(''), ...rest }: Props = $props();
</script>

<div class="flex w-full flex-col items-start gap-2">
	<label for={name} class="font-display text-1 font-medium tracking-label text-accent uppercase">
		{label}
	</label>
	<input
		id={name}
		{name}
		class="text-base {CONTROL_HEIGHTS[size]} w-full border border-border-soft
			bg-field p-px indent-[11px] font-body leading-6 text-text-strong shadow-[inset_0_0_0_1px_rgb(255_251_237/0.235)]
			transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-border focus:border-accent
			focus:shadow-glow focus:outline-none"
		{...rest}
		bind:value
	/>
	{#if hint}
		<p class="text-1 text-text-muted">{hint}</p>
	{/if}
</div>
