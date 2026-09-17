<!--
	La escalera de reputación: los cinco escalones y dónde estás parado.

	**Es la figura de la pantalla Reputación**, y lo que informa por su forma no es
	sólo cuánto llevás: es que **los escalones no están repartidos parejo**. De
	Desconocido a Conocido hay diez puntos y de Aliado a Leal hay treinta, así que
	el dibujo muestra de un vistazo que el último tramo es el más largo de todos —lo
	que el jugador tiene que entender antes de empezar a subir, no después—.

	Que arranque vacía no la invalida: lo que se ve es la escalera que tiene por
	delante, el mismo criterio con el que la ficha del lugar muestra apagados a los
	agentes que todavía no atienden.

	**Va en banda horizontal y con alto fijo**, que es la excepción declarada a la
	regla de las figuras: una banda no se deforma al estirarse, igual que la traza
	de actividad del registro. Y está hecha con cajas de un píxel en vez de SVG,
	porque un SVG estirado a lo ancho de un panel adelgaza los trazos verticales y
	engorda los horizontales.

	Va `aria-hidden` porque las lecturas de al lado dicen los mismos números.
-->
<script lang="ts">
	import type { EscalonReputacion } from '$lib/tipos';

	interface Props {
		ladder: readonly EscalonReputacion[];
		/** Dónde está parado, de cero a cien. */
		percent: number;
		class?: string;
	}

	let { ladder, percent, class: extra = '' }: Props = $props();

	/**
	 * El riel no llega a los cantos: deja lugar para que el rótulo del cero y el
	 * del techo no se corten contra el borde del panel.
	 */
	const DESDE = 2;
	const HASTA = 98;

	/** De un valor de la escala a su posición a lo ancho del riel. */
	function posicion(valor: number): number {
		return DESDE + (Math.min(100, Math.max(0, valor)) * (HASTA - DESDE)) / 100;
	}

	let donde = $derived(posicion(percent));
</script>

<div class="relative h-[4.5rem] w-full {extra}" aria-hidden="true">
	<!-- El riel entero, apagado: el camino completo siempre está a la vista. -->
	<div
		class="absolute top-[2.25rem] h-px bg-border-soft"
		style="left: {DESDE}%; right: {100 - HASTA}%"
	></div>

	<!-- Y lo caminado, encendido encima. -->
	<div
		class="absolute top-[2.15rem] h-[3px] bg-accent shadow-glow"
		style="left: {DESDE}%; width: {donde - DESDE}%"
	></div>

	<!-- El techo, que no es un escalón: de Leal para arriba no se abre nada nuevo. -->
	<div class="absolute top-[1.9rem] h-[0.8rem] w-px bg-dead-line" style="left: {HASTA}%"></div>
	<span
		class="absolute top-[2.95rem] -translate-x-full font-mono text-[0.6rem] text-text-muted"
		style="left: {HASTA}%"
	>
		100
	</span>

	{#each ladder as escalon, indice (escalon.name)}
		{@const x = posicion(escalon.at)}
		<!--
			Cada escalón en su posición real. El primero se alinea por la izquierda y
			el resto por su centro, para que ninguno se salga del panel.
		-->
		<div
			class="absolute top-[1.9rem] h-[0.8rem] w-px {escalon.reached ? 'bg-accent' : 'bg-dead-dash'}"
			style="left: {x}%"
		></div>

		<!--
			Los rótulos se alternan **arriba y abajo del riel**. Entre Desconocido y
			Conocido hay diez puntos: del mismo lado se encabalgan en cualquier ancho, y
			achicar la letra hasta que entren sería ilegible en los cinco. Repartidos,
			el vecino más cercano de cada uno queda a veinticinco puntos, y los ticks
			quedan todos del mismo largo.

			El que va arriba se apila al revés para que la cifra quede siempre pegada al
			riel y el nombre por fuera.
		-->
		<div
			class="absolute flex {indice % 2 === 0
				? 'top-[0.2rem] flex-col-reverse'
				: 'top-[3rem] flex-col'}
				{indice === 0 ? 'items-start' : '-translate-x-1/2 items-center'}"
			style="left: {x}%"
		>
			<span class="flex items-baseline gap-1">
				<span class="font-mono text-[0.6rem] {escalon.reached ? 'text-data' : 'text-text-muted'}">
					{escalon.at}
				</span>
				<span class="font-display text-[0.58rem] tracking-label text-accent-dim uppercase">
					{escalon.level}
				</span>
			</span>
			<!--
				El nombre se esconde en pantalla angosta: la cifra sola alcanza para leer
				la forma, y cinco nombres en 375 px no entran ni alternados.
			-->
			<span
				class="hidden font-display text-[0.62rem] tracking-label whitespace-nowrap uppercase sm:block
					{escalon.reached ? 'text-text-strong' : 'text-text-muted'}"
			>
				{escalon.name}
			</span>
		</div>
	{/each}

	<!-- Dónde estás: la única marca llena del dibujo. -->
	<div
		class="absolute top-[0.35rem] h-[0.7rem] w-[0.7rem] -translate-x-1/2 rotate-45 border
			border-accent bg-accent-bright"
		style="left: {donde}%"
	></div>
</div>
