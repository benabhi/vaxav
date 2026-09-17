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
	}

	interface Props {
		tabs: readonly Solapa[];
		/** Cuál está abierta. Vive afuera: la pantalla decide qué dibuja. */
		active: string;
	}

	let { tabs, active = $bindable('') }: Props = $props();
</script>

<div class="tab-bar w-full border border-border-soft bg-well">
	<div class="flex w-max min-w-full items-stretch">
		{#each tabs as seccion (seccion.code)}
			<button
				type="button"
				onclick={() => (active = seccion.code)}
				class="relative flex shrink-0 cursor-pointer items-center gap-[0.35rem] border-0
					border-r border-r-border-soft/60 px-[0.6rem] py-[0.4rem] font-display text-[0.62rem]
					font-semibold tracking-[0.12em] whitespace-nowrap uppercase transition-[background-color,color]
					last:border-r-0
					{seccion.code === active
					? 'bg-surface-strong text-accent-bright'
					: 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-accent-bright'}"
			>
				<!--
					El filo encendido del segmento elegido. Va absoluto para que no empuje el
					texto medio píxel al cambiar de sección.
				-->
				{#if seccion.code === active}
					<span class="absolute inset-x-0 top-0 h-[2px] bg-accent shadow-glow"></span>
				{/if}
				{seccion.label}
				{#if seccion.detail}
					<span
						class="font-mono text-[0.58rem] normal-case
							{seccion.code === active ? 'text-data' : 'text-text-muted'}"
					>
						{seccion.detail}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</div>
