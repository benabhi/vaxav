<!--
	Una ranura del anillo, que dice qué tiene sin que le pasen el mouse.

	El ícono es el **del módulo montado**, no el de la categoría: con un engranaje
	para los siete internos esenciales, la planta, los propulsores y el motor de
	salto eran tres círculos idénticos. Debajo, la clase y calificación de lo
	montado —`2A`— o la clase de la ranura vacía —`c2`—.

	Vacía va **punteada**, que en esta pantalla quiere decir hueco: lo mismo que
	el anillo de escudo cuando no hay generador.

	Y **el tamaño del círculo es la clase de la ranura**. No es decoración: en una
	nave que traga módulos de clase 3 las baldosas grandes se ven desde lejos, y
	comparar dos cascos deja de ser leer catorce cifras. Es la misma idea que el
	arco por categoría, un escalón más abajo.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { FilaRanura } from '$lib/tipos';

	interface Props {
		slot: FilaRanura;
		onChoose: (index: number) => void;
	}

	let { slot, onChoose }: Props = $props();

	/**
	 * El diámetro de la baldosa según la clase.
	 *
	 * Los saltos son chicos a propósito: tienen que leerse como una diferencia de
	 * porte, no como dos componentes distintos. Una clase que el catálogo todavía
	 * no usa cae en el tamaño de la mayor conocida en vez de romper el anillo.
	 */
	const DIAMETERS: Record<number, string> = {
		1: 'h-[2.5rem] w-[2.5rem]',
		2: 'h-[2.9rem] w-[2.9rem]',
		3: 'h-[3.3rem] w-[3.3rem]'
	};

	let diameter = $derived(DIAMETERS[slot.size] ?? DIAMETERS[3]);
</script>

<button
	type="button"
	onclick={() => onChoose(slot.index)}
	title={slot.title}
	aria-pressed={slot.selected}
	style="left: {slot.left}; top: {slot.top}"
	class="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center
		justify-center rounded-full transition-[background-color,color,border-color] {diameter}
		{slot.selected
		? 'border border-accent-bright bg-accent text-on-accent shadow-glow-strong hover:bg-accent'
		: slot.filled
			? 'border border-border bg-surface-strong text-accent-bright hover:bg-surface-hover'
			: 'border border-dashed border-dead-dash bg-well text-text-muted hover:bg-surface-hover'}"
>
	<Icon name={slot.icon} weight={slot.filled ? 'fill' : 'light'} size="1.05rem" />
	<span class="font-mono text-[0.5rem] leading-none">{slot.badge}</span>
</button>
