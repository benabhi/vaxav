<!--
	Qué significa lo que se ve en el mapa de la galaxia.

	Un mapa que codifica cinco cosas en el trazo y ocho en el color y no dice cuáles
	es un mapa que hay que adivinar. Pero una leyenda de trece entradas sueltas,
	todas del mismo tamaño y en mayúsculas, **tampoco se lee**: es una pared de
	texto chiquito donde no se distingue qué contesta qué.

	Tres decisiones la ordenan:

	1. **Cada fila dice qué explica**, con un rótulo a la izquierda de ancho fijo.
	   Son dos preguntas distintas —qué significa el color, qué significa la línea—
	   y el color encima cambia con el filtro mientras el trazo es siempre el mismo.
	   El ancho fijo alinea las entradas en columna de una fila a la otra, y esa
	   alineación es la mitad de lo que hace que deje de parecer un amontonamiento.
	2. **Los nombres no van en mayúsculas.** «Marca de Ávila» es un nombre propio,
	   no un rótulo del HUD: en versalitas espaciadas cuesta el doble leerlo, y son
	   justo los que más hay. Los del trazo sí, porque son etiquetas fijas.
	3. **El color se corta a unas pocas.** Con veinte regiones la leyenda sería más
	   alta que el mapa; se muestran las primeras y el resto se pide. Los nombres de
	   los territorios ya están dibujados sobre el mapa, así que lo que se esconde
	   acá no se pierde.

	**Acá no hay botones.** Los controles de la cámara viven en el mapa, arriba a la
	derecha junto al de agrandar: son del mapa y no de su explicación, y apoyados acá
	abajo le comían una franja de galaxia entera para dos botones.
-->
<script lang="ts">
	/** Una entrada: una muestra de color y qué quiere decir. */
	export interface EntradaLeyenda {
		readonly label: string;
		readonly color: string;
	}

	interface Props {
		/** Qué dice el color de cada sistema. Vacío cuando el mapa no está pintado. */
		paint?: readonly EntradaLeyenda[];
		/** Qué dice cada clase de línea. Es fija: se aprende una sola vez. */
		strokes: readonly EntradaLeyenda[];
	}

	let { paint = [], strokes }: Props = $props();

	/**
	 * Cuántas entradas de color se muestran antes de ofrecer el resto.
	 *
	 * Seis entran en una fila de escritorio y en dos de teléfono. Con más, la
	 * leyenda empieza a comerse el mapa que viene a explicar.
	 */
	const TOPE = 6;

	let todas = $state(false);
	let mostradas = $derived(todas ? paint : paint.slice(0, TOPE));
	let ocultas = $derived(Math.max(0, paint.length - mostradas.length));
</script>

<div class="flex w-full flex-col gap-[0.4rem]">
	{#if paint.length > 0}
		<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
			<span
				class="w-[2.8rem] shrink-0 font-display text-[0.6rem] tracking-label text-accent-dim
					uppercase"
			>
				Color
			</span>

			{#each mostradas as entrada (entrada.label)}
				<span class="flex min-w-0 items-center gap-[0.35rem]">
					<span
						class="inline-block h-[0.5rem] w-[0.5rem] shrink-0 rounded-full"
						style="background: {entrada.color}"
					></span>
					<span class="truncate text-[0.68rem] text-text-body">{entrada.label}</span>
				</span>
			{/each}

			{#if ocultas > 0 || todas}
				<!--
					Pedir el resto, sin sacar al jugador de donde está. Es un botón y no un
					enlace porque no cambia el recorte: cambia cuánto de la leyenda se ve.
				-->
				<button
					type="button"
					class="shrink-0 cursor-pointer border-0 bg-transparent p-0 font-display text-[0.6rem]
						tracking-label text-accent-dim uppercase hover:text-accent-bright"
					onclick={() => (todas = !todas)}
				>
					{todas ? 'Ver menos' : `+${ocultas} más`}
				</button>
			{/if}
		</div>
	{/if}

	<div
		class="flex w-full flex-wrap items-center gap-x-3 gap-y-1
			{paint.length > 0 ? 'border-t border-border-soft/50 pt-[0.4rem]' : ''}"
	>
		<span
			class="w-[2.8rem] shrink-0 font-display text-[0.6rem] tracking-label text-accent-dim uppercase"
		>
			Trazo
		</span>

		{#each strokes as entrada (entrada.label)}
			<span class="flex items-center gap-[0.35rem]">
				<span class="inline-block h-[2px] w-[1.1rem] shrink-0" style="background: {entrada.color}"
				></span>
				<span class="text-[0.6rem] tracking-label text-text-muted uppercase">{entrada.label}</span>
			</span>
		{/each}
	</div>
</div>
