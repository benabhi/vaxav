<!--
	El anillo de equipamiento: la nave al centro y sus ranuras alrededor.

	Es la figura de la pantalla de *fitting* de EVE cruzada con el esquema de nave
	del HUD de Elite Dangerous, y es **la única pantalla circular de todo Vaxav**.
	Esa es la mitad de la razón de que exista: el resto del juego son paneles
	rectangulares apilados, así que la nave se distingue por su forma antes de que
	se lea una sola palabra.

	La otra mitad es que la figura dice algo. Las tres capas de integridad son
	tres anillos concéntricos —escudo afuera, casco adentro—, que es exactamente
	el orden en que se las come el daño. Y el anillo de afuera se dibuja punteado
	cuando no hay generador montado: la nave *se ve* sin escudo.

	El alto no se fija: sale de `aspect-ratio`, que es lo único que lo mantiene
	cuadrado cuando la columna se angosta. Con alto fijo, un círculo dentro de un
	rectángulo se vuelve una elipse.
-->
<script lang="ts">
	import type { FilaRanura } from '$lib/tipos';
	import ShipSchematic from './ShipSchematic.svelte';
	import SlotNode from './SlotNode.svelte';

	interface Props {
		slots: readonly FilaRanura[];
		onChoose: (index: number) => void;
		/** Sin generador no hay escudo, y el anillo de afuera lo dice. */
		hasShield: boolean;
	}

	let { slots, onChoose, hasShield }: Props = $props();
</script>

<!--
	Diámetro de cada anillo, en porcentaje del cuadro. De afuera hacia adentro:
	escudo 66, blindaje 54, casco 42. Quedan bien adentro del anillo de ranuras,
	que va al 82: un anillo que roza las baldosas se lee como parte de ellas.
-->
{#snippet ring(diameter: number, extra: string)}
	<span
		class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full {extra}"
		style="width: {diameter}%; height: {diameter}%"
	></span>
{/snippet}

<div class="relative mx-auto aspect-square w-[min(24rem,100%)]">
	<!-- Punteado quiere decir "esta capa no existe": es la forma más directa de
		 mostrar que a la nave le falta el generador de escudo. -->
	{@render ring(
		66,
		hasShield ? 'border border-dashed border-data' : 'border border-dashed border-dead-line'
	)}
	{@render ring(54, 'border border-border')}
	{@render ring(42, 'border border-border-strong')}

	<ShipSchematic />

	{#each slots as slot (slot.index)}
		<SlotNode {slot} {onChoose} />
	{/each}
</div>
