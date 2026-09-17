<!--
	Las tres filas que dicen de dónde sale un verbo. Sin envoltorio.

	Vive aparte del aviso flotante porque **el mismo contenido va en dos lugares**:
	al señalar el botón con el mouse, y adentro del cartel de confirmación, que es
	la única puerta que queda en un teléfono —donde no hay con qué señalar—. Dos
	copias del mismo bloque serían dos que se desfasan.

	**Es una grilla de dos columnas, no filas con un ancho a ojo.** Con un ancho
	fijo, un rótulo largo como «Habilidades» empuja su valor y rompe la columna, y
	cuando las habilidades envuelven, la segunda línea cae contra el margen en vez
	de quedar debajo de la primera. La grilla resuelve las dos cosas sola: la
	columna de rótulos mide lo que mide el más largo, y lo que envuelve lo hace
	adentro de su celda.
-->
<script lang="ts">
	import Label from '../typography/Label.svelte';
	import type { Procedencia } from '$lib/tipos';

	interface Props {
		source: Procedencia;
		/** El encabezado con el verbo. Sobra adentro de un cartel que ya lo dice. */
		heading?: boolean;
	}

	let { source, heading = true }: Props = $props();

	// Habilitado es **todo puesto**, no alguno: a una nave con motor y sin tanque
	// le falta para saltar igual que si no tuviera ninguno de los dos.
	let habilitado = $derived(
		source.modules.length > 0 && source.modules.every((aparato) => aparato.fitted)
	);
</script>

<div class="flex w-full flex-col gap-[0.55rem]">
	{#if heading}
		<div class="flex flex-wrap items-baseline gap-x-2 border-b border-border-soft pb-[0.4rem]">
			<span class="font-display text-1 font-bold tracking-label text-text-strong uppercase">
				{source.verb}
			</span>
			{#if habilitado}
				{#each source.effects as efecto (efecto.label)}
					<span class="font-mono text-[0.78rem] whitespace-nowrap text-data">
						{efecto.value}
					</span>
				{/each}
			{/if}
		</div>
	{/if}

	<!--
		**Por qué no se puede, arriba de todo.** Es lo primero que alguien quiere
		saber cuando el botón está apagado, y antes de esto el aviso contaba de dónde
		salía el verbo mientras callaba el único dato que se estaba buscando.
	-->
	{#if source.blockers.length > 0}
		<div class="flex flex-col gap-[0.15rem]">
			{#each source.blockers as motivo (motivo)}
				<p class="text-1 text-warning">{motivo}</p>
			{/each}
		</div>
	{/if}

	<!--
		El módulo primero porque es el requisito duro; las habilidades después porque
		mejoran y no habilitan —mostrarlas iguales es lo que confundía—; y la mejora
		al final, que es lo único de las tres que habla del futuro.

		**Los rótulos son palabras del juego, no del diseño.** Acá decía «aparato» y
		«llaves», que es el vocabulario con que `docs/DESIGN.md` piensa la cadena:
		sirve para razonar y no lo entiende nadie que no haya leído el documento. El
		jugador ya sabe qué es un módulo y qué es una habilidad.
	-->
	<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.3rem]">
		{#if source.modules.length > 0}
			<Label>{source.modules.length > 1 ? 'Módulos' : 'Módulo'}</Label>
			<!--
				Uno por renglón, y **los que faltan salen igual**, en rojo y con el nombre
				de la pieza que falta. Esconderlos dejaría el aviso diciendo qué tenés
				justo cuando lo que se busca es qué te falta.
			-->
			<div class="flex min-w-0 flex-col gap-[0.15rem]">
				{#each source.modules as aparato (aparato.requirement)}
					{#if aparato.fitted}
						<span class="font-display text-1 tracking-label text-accent-dim uppercase">
							{aparato.name}
						</span>
					{:else}
						<span class="text-1 text-danger">Falta: {aparato.requirement}</span>
					{/if}
				{/each}
			</div>
		{/if}

		{#if source.levers.length > 0}
			<Label>Habilidades</Label>
			<!--
				Las que faltan salen igual, con un guion. Mostrar sólo las entrenadas
				convertiría la fila en un adorno: la que no está es justamente la que dice
				qué entrenar, y es la mitad útil del renglón.
			-->
			<div class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-[0.15rem]">
				{#each source.levers as lever (lever.name)}
					<span class="flex items-baseline gap-[0.35rem] whitespace-nowrap">
						<span
							class="font-display text-[0.62rem] tracking-label uppercase
								{lever.known ? 'text-accent-dim' : 'text-text-muted'}"
						>
							{lever.name}
						</span>
						<span class="font-mono text-[0.72rem] {lever.known ? 'text-data' : 'text-text-muted'}">
							{lever.level || '—'}
						</span>
					</span>
				{/each}
			</div>
		{/if}

		{#if source.next.length > 0}
			<Label>{source.next.length > 1 ? 'Mejoras' : 'Mejora'}</Label>
			<div class="flex min-w-0 flex-col gap-[0.15rem]">
				{#each source.next as paso (paso)}
					<span class="text-1 text-accent-bright">{paso}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
