<!--
	Un selector de secciones adentro de un panel.

	**No es la barra de pestañas del módulo, y no tiene que parecerlo.** Aquélla
	navega —cada pestaña es una URL y el servidor decide qué carga— y ésta reparte
	lo que la pantalla ya tiene en la mano. Son dos cosas distintas, y dibujarlas
	igual le enseña al jugador que son la misma: apretás una y esperás que cambie
	la pantalla entera.

	Así que se dibuja como **un selector de instrumento** y no como una fila de
	pestañas: un recuadro con sus segmentos separados por filos finos, el elegido
	teñido apenas y con una barra encendida **arriba**. La barra va arriba a
	propósito: la del módulo va abajo, y el lado del filo alcanza para que no se
	confundan ni de reojo. Y nada se rellena de naranja sólido, que es lo que hace
	una pestaña abierta.

	Que sea estado de navegador y no de servidor es la regla del proyecto: cambiar
	de sección no cambia la partida, así que no cuesta una ida y vuelta.

	Lleva su cuenta al lado cuando la tiene, porque un segmento que dice **cuántos
	hay** ahorra abrirlo para descubrir que está vacío. Y en pantalla angosta la
	fila se desliza en vez de partirse en dos renglones: una columna fina con tres
	segmentos apilados deja de parecer un selector.
-->
<script lang="ts">
	/** Una sección: su código, cómo se llama y cuántos hay adentro. */
	export interface Solapa {
		readonly code: string;
		readonly label: string;
		/** La cuenta, si tiene sentido decirla. */
		readonly detail?: string;
		/**
		 * Adónde lleva, si elegirla es una vuelta al servidor.
		 *
		 * **No es un segundo comportamiento, es el mismo dicho de dos maneras.** El
		 * trabajo de esta pieza es mostrar cuál de varias está elegida y dejar
		 * elegir otra; si eso cuesta una ida y vuelta o no lo decide quien la usa.
		 * Una sección que reparte lo que la pantalla ya tiene se elige en el
		 * navegador; una que trae otra consulta —con su recorte y su paginado— tiene
		 * que viajar en la URL, que es la regla del proyecto para todo recorte.
		 *
		 * Es el mismo caso que `HudButton` y `HudLink`, que comparten sus clases
		 * porque un `<a>` y un `<button>` tienen que verse idénticos.
		 */
		readonly href?: string;
	}

	interface Props {
		tabs: readonly Solapa[];
		/** Cuál está abierta. Vive afuera: la pantalla decide qué dibuja. */
		active: string;
	}

	let { tabs, active = $bindable('') }: Props = $props();
</script>

<!--
	Lo que hay adentro de un segmento, escrito una vez: lo dibujan igual el enlace y
	el botón, y dos copias serían dos que un día se separan.
-->
{#snippet segmento(seccion: Solapa, elegida: boolean)}
	<!--
		El filo encendido del elegido. Va absoluto para que no empuje el texto medio
		píxel al cambiar de sección.
	-->
	{#if elegida}
		<span class="absolute inset-x-0 top-0 h-[2px] bg-accent shadow-glow"></span>
	{/if}
	{seccion.label}
	{#if seccion.detail}
		<span class="font-mono text-[0.58rem] normal-case {elegida ? 'text-data' : 'text-text-muted'}">
			{seccion.detail}
		</span>
	{/if}
{/snippet}

<div class="tab-bar w-full border border-border-soft bg-well">
	<div class="flex w-max min-w-full items-stretch">
		{#each tabs as seccion (seccion.code)}
			{@const elegida = seccion.code === active}
			{@const clases = `relative flex shrink-0 cursor-pointer items-center gap-[0.35rem] border-0
				border-r border-r-border-soft/60 px-[0.6rem] py-[0.4rem] font-display text-[0.62rem]
				font-semibold tracking-[0.12em] whitespace-nowrap uppercase no-underline
				transition-[background-color,color] last:border-r-0 ${
					elegida
						? 'bg-surface-strong text-accent-bright'
						: 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-accent-bright'
				}`}
			{#if seccion.href}
				<a href={seccion.href} class={clases}>
					{@render segmento(seccion, elegida)}
				</a>
			{:else}
				<button type="button" onclick={() => (active = seccion.code)} class={clases}>
					{@render segmento(seccion, elegida)}
				</button>
			{/if}
		{/each}
	</div>
</div>
