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

	// Falta algo es **que falte alguna**, no que la lista esté vacía: a una nave con
	// el escáner y sin láser le falta igual que si no tuviera ninguno de los dos.
	//
	// **Una lista vacía no es una carencia**, y mientras esto pidió «alguna montada»
	// lo era: un verbo que no pide ninguna pieza —cruzar una puerta— y una nave de
	// astillero, que corre con lo que el casco trae de fábrica, se quedaban sin ver
	// lo que rinden.
	let falta = $derived(source.modules.some((aparato) => !aparato.fitted));
</script>

<div class="flex w-full flex-col gap-[0.55rem]">
	{#if heading}
		<div class="flex flex-wrap items-baseline gap-x-2 border-b border-border-soft pb-[0.4rem]">
			<span class="font-display text-1 font-bold tracking-label text-text-strong uppercase">
				{source.verb}
			</span>
			<!--
				**Cada lectura con su rótulo.** Mientras el verbo prometía una sola cifra,
				la unidad alcanzaba para saber de qué hablaba; desde que viajar dice dos
				—cuánto corre en warp y cuánto tarda en salir—, dos números sueltos uno al
				lado del otro se leen como un solo dato partido. El rótulo va con la misma
				letra chica que los nombres de las habilidades de abajo, así que el
				encabezado y las filas se leen igual: nombre apagado, cifra en cian.

				Cada par no se corta: envuelve el renglón entero, nunca el número lejos de
				su rótulo.
			-->
			{#if !falta}
				{#each source.effects as efecto (efecto.label)}
					<span class="flex items-baseline gap-[0.3rem] whitespace-nowrap">
						<span class="font-display text-[0.62rem] tracking-label text-accent-dim uppercase">
							{efecto.label}
						</span>
						<span class="font-mono text-[0.78rem] text-data">{efecto.value}</span>
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
		La pieza primero porque es el requisito duro; las habilidades después porque
		mejoran y no habilitan —mostrarlas iguales es lo que confundía—; y la mejora
		al final, que es lo único de las tres que habla del futuro.

		**Los rótulos son palabras del juego, no del diseño.** Acá decía «aparato» y
		«llaves», que es el vocabulario con que `docs/DESIGN.md` piensa la cadena:
		sirve para razonar y no lo entiende nadie que no haya leído el documento.

		Y decía «Módulo», que dejó de ser cierto: la mayoría de estas piezas las trae
		el casco de fábrica, y un rótulo que promete un módulo al lado de un renglón
		que dice «del casco» se contradice solo. «Pieza» es verdad para las dos
		fuentes, y es la palabra con la que el resto del proyecto ya las nombra.
	-->
	<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.3rem]">
		{#if source.modules.length > 0}
			<Label>{source.modules.length > 1 ? 'Piezas' : 'Pieza'}</Label>
			<!--
				Una por renglón, y **cada una dice de dónde sale**: del casco, de un módulo
				montado, o de ninguno de los dos. El renglón decía sólo un nombre, y con eso
				una nave de astillero leía «Falta: Propulsores» por algo que ninguna nave
				puede montar: los propulsores son del casco desde que los internos
				esenciales dejaron de ser módulos.

				**Y los que faltan salen igual**, en rojo y con el nombre de la pieza.
				Esconderlos dejaría el aviso diciendo qué tenés justo cuando lo que se busca
				es qué te falta.
			-->
			<div class="flex min-w-0 flex-col gap-[0.3rem]">
				{#each source.modules as aparato (aparato.requirement)}
					<div class="flex min-w-0 flex-col gap-[0.1rem]">
						{#if aparato.source === 'missing'}
							<span class="text-1 text-danger">Falta: {aparato.requirement}</span>
						{:else if aparato.source === 'hull'}
							<span class="flex min-w-0 flex-wrap items-baseline gap-x-[0.35rem]">
								<span class="font-display text-1 tracking-label text-accent-dim uppercase">
									{aparato.requirement}
								</span>
								<!--
									El casco y su nombre son **un solo pedazo**: en dos, la caja angosta del
									aviso parte «del casco» del modelo y deja el nombre solo en la línea de
									abajo, como si fueran dos cosas distintas.
								-->
								<span class="text-[0.72rem] text-text-muted">
									· del casco
									<span class="font-display tracking-label text-accent-dim uppercase">
										{aparato.name}
									</span>
								</span>
							</span>
							<!--
								El auxiliar va **debajo y con un más**, no en lugar del casco: un
								propulsor auxiliar suma encima de los propulsores de fábrica y no los
								reemplaza. Escrito en un solo renglón se lee como que sin él la nave no
								se mueve, que es justo lo contrario, y es la distinción que hace falta
								para entender qué se gana montándolo.
							-->
							{#if aparato.upgrade}
								<span class="flex min-w-0 flex-wrap items-baseline gap-x-[0.35rem]">
									<span class="font-display text-1 tracking-label text-accent-bright uppercase">
										<span class="font-mono">+</span>
										{aparato.upgrade}
									</span>
									<span class="text-[0.72rem] text-text-muted">· suma encima</span>
								</span>
							{/if}
						{:else}
							<span class="font-display text-1 tracking-label text-accent-dim uppercase">
								{aparato.name}
							</span>
						{/if}
					</div>
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
