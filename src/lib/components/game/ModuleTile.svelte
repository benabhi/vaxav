<!--
	Una baldosa del mosaico de módulos, en sus tres estados.

	Elite Dangerous no presenta los servicios de una estación como una lista: los
	pone en una grilla de baldosas grandes con su ícono, y la elegida se rellena
	de naranja. Es la pantalla más reconocible del juego y la que le da a la
	estación una forma propia, distinta de cualquier otra ficha.

	- **Disponible**: superficie translúcida, ícono en `duotone` y la marca de
	  agua al fondo.
	- **Elegida**: relleno naranja sólido y texto casi negro, que es la inversión
	  con la que todo el juego marca lo elegido.
	- **No disponible**: sin marca de agua, ícono en `thin` y todo apagado. No
	  responde al clic, porque no hay nada que abrir.

	El día que un jugador instale módulos en su propia estación (F15) va a ser la
	misma pieza: una baldosa apagada es, visualmente, una ranura vacía.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		icon: IconName;
		name: string;
		summary: string;
		available: boolean;
		selected: boolean;
		onChoose: () => void;
	}

	let { icon, name, summary, available, selected, onChoose }: Props = $props();

	/** El color del nombre y el del ícono, que no siempre son el mismo. */
	let textColor = $derived(
		selected ? 'text-on-accent' : available ? 'text-text-strong' : 'text-text-muted'
	);
	let accentColor = $derived(
		selected ? 'text-on-accent' : available ? 'text-accent' : 'text-text-muted'
	);
</script>

<button
	type="button"
	onclick={onChoose}
	disabled={!available}
	aria-pressed={selected}
	class="relative h-[7.5rem] overflow-hidden p-[0.85rem] text-left
		transition-[background-color,border-color,box-shadow]
		{selected
		? 'border border-t-[2px] border-border-soft border-t-accent-bright bg-accent shadow-glow-strong'
		: available
			? 'cursor-pointer border border-t-[2px] border-border-soft border-t-border bg-surface hover:bg-surface-hover'
			: 'cursor-default border border-t-[2px] border-dead-border border-t-dead-edge bg-dead'}"
>
	<!--
		El ícono enorme y apagado del fondo, que es lo que le da cuerpo. Se asoma
		por el vértice de abajo a la derecha, cortado por el borde: entero y
		centrado parecería un dibujo, y así parece una marca.
	-->
	{#if available && !selected}
		<span class="pointer-events-none absolute -right-[1.5rem] -bottom-[1.75rem] opacity-[0.07]">
			<Icon name={icon} weight="fill" size="7rem" />
		</span>
	{/if}

	<div class="relative z-[1] flex h-full w-full flex-col items-start gap-1">
		<Icon name={icon} weight={available ? 'duotone' : 'thin'} size="2rem" class={accentColor} />
		<div class="grow"></div>
		<p
			class="w-full overflow-hidden font-display text-[0.85rem] font-bold tracking-display
				text-ellipsis whitespace-nowrap uppercase {textColor}"
		>
			{name}
		</p>
		<!-- Dos renglones y basta: el tercero desalinearía la grilla. -->
		<p class="line-clamp-2 text-1 leading-[1.3] {selected ? 'text-on-accent' : 'text-text-muted'}">
			{summary}
		</p>
	</div>
</button>
