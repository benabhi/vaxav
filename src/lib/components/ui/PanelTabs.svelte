<!--
	Una fila de solapas adentro de un panel.

	**No es la barra de pestañas del módulo**, aunque hable el mismo idioma: aquélla
	navega —cada pestaña es una URL, y el servidor decide qué carga— y ésta reparte
	lo que la pantalla ya tiene en la mano. Son dos comportamientos distintos, así
	que son dos piezas; compartir una obligaría a darle un segundo modo, que es
	justamente lo que CLAUDE.md dice que no se hace.

	Que sea estado de navegador y no de servidor es la regla del proyecto: cambiar
	de solapa no cambia la partida, así que no cuesta una ida y vuelta.

	Sigue la regla de «lo seleccionado se llena»: la activa va rellena de naranja
	con el texto casi negro, como en Elite. Y lleva su cuenta al lado cuando la
	tiene, porque una solapa que dice **cuántos hay** ahorra abrirla para saber que
	está vacía.

	En pantalla angosta la fila se desliza en vez de partirse en dos renglones,
	igual que la del módulo: una columna fina con tres solapas apiladas deja de
	parecer una fila de solapas.

	**El interletrado es más cerrado que el del HUD**, y es la única licencia que se
	toma. El de los rótulos está pensado para títulos que tienen toda la fila; acá
	son tres palabras en una columna que mide un tercio de la pantalla, y con el
	abierto la tercera se salía de la caja.
-->
<script lang="ts">
	/** Una solapa: su código, cómo se llama y cuántos hay adentro. */
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

<div class="tab-bar w-full border-b border-border-soft">
	<div class="flex w-max min-w-full items-center gap-1">
		{#each tabs as solapa (solapa.code)}
			<button
				type="button"
				onclick={() => (active = solapa.code)}
				class="flex h-[1.8rem] shrink-0 cursor-pointer items-center gap-[0.35rem] border-0
					px-[0.5rem] font-display text-[0.62rem] font-semibold tracking-[0.12em] whitespace-nowrap
					uppercase transition-[background-color,color]
					{solapa.code === active
					? 'bg-accent text-on-accent'
					: 'bg-transparent text-accent-dim hover:bg-surface-hover hover:text-accent-bright'}"
			>
				{solapa.label}
				{#if solapa.detail}
					<span
						class="font-mono text-[0.58rem] normal-case
							{solapa.code === active ? 'text-on-accent/70' : 'text-text-muted'}"
					>
						{solapa.detail}
					</span>
				{/if}
			</button>
		{/each}
	</div>
</div>
