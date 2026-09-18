<!--
	Una bahía de la nave: su barra, y de qué está hecha.

	**La barra está partida por lo que hay adentro**, y ahí está toda la gracia. Un
	medidor que sólo dice «78 % lleno» es un adorno: informa una vez y después se
	mira sin leerlo. Éste contesta la pregunta que uno le hace de verdad a una
	bodega llena —**qué me la está llenando**— y por lo tanto qué conviene tirar.

	Con la barra compuesta se ve de un vistazo algo que las cifras esconden: que el
	montón más caro suele ser una franja fina, porque lo valioso ocupa menos. Ésa
	es la decisión del minero, dibujada.

	El hueco del final es lo libre, y se deja sin pintar a propósito: es lo único
	que el jugador quiere que crezca.

	Se dibuja una por bahía. Hoy toda nave tiene una sola bodega general, pero las
	barcazas van a tener la de mineral aparte y las cargueras su bahía de flota;
	este componente no se entera.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { Bahia } from '$lib/tipos';

	interface Props {
		bay: Bahia;
		/** El montón señalado, para encenderlo en la barra. */
		highlight?: string;
		onHighlight?: (itemCode: string) => void;
	}

	let { bay, highlight = '', onHighlight }: Props = $props();
</script>

<div class="flex w-full flex-col gap-[0.35rem]">
	<div class="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
		<span class="flex items-center gap-[0.4rem]">
			<Icon name={bay.icon} weight="duotone" size="0.85rem" class="shrink-0 text-accent" />
			<span
				class="font-display text-[0.68rem] font-bold tracking-label whitespace-nowrap
					text-text-strong uppercase"
			>
				{bay.name}
			</span>
		</span>

		<span class="ml-auto font-mono text-[0.78rem] whitespace-nowrap text-text-strong">
			{bay.used} <span class="text-text-muted">/ {bay.capacity} m³</span>
		</span>
		<span
			class="font-mono text-[0.72rem] whitespace-nowrap
				{bay.percent >= 95 ? 'text-warning' : 'text-text-muted'}"
		>
			{bay.percent} %
		</span>
	</div>

	<!--
		La barra. Los tramos van de mayor a menor y el hueco final es lo libre, así
		que se lee de izquierda a derecha como se llena una bodega.
	-->
	<div class="flex h-[1.1rem] w-full border border-border-soft bg-well">
		{#each bay.segments as segment (segment.itemCode)}
			<button
				type="button"
				title="{segment.name} · {segment.percent} % de la bodega"
				aria-label="{segment.name}, {segment.percent} por ciento de la bodega"
				onmouseenter={() => onHighlight?.(segment.itemCode)}
				onmouseleave={() => onHighlight?.('')}
				onfocus={() => onHighlight?.(segment.itemCode)}
				onblur={() => onHighlight?.('')}
				style="width: {segment.percent}%; background-color: {segment.color}"
				class="h-full cursor-pointer border-0 p-0 transition-opacity
					{highlight && highlight !== segment.itemCode ? 'opacity-35' : 'opacity-100'}"
			></button>
		{/each}
		<!-- Lo libre: sin pintar, porque es lo único que uno quiere que crezca. -->
		<span class="h-full flex-1"></span>
	</div>

	<span class="font-mono text-[0.66rem] text-text-muted">
		{bay.free} m³ libres
		{#if bay.segments.length > 0}
			· cada tramo es un montón
		{/if}
	</span>
</div>
