<!--
	El viaje, dibujado: de dónde saliste, dónde está la nave y adónde va.

	**Es la figura de la pantalla de Ubicación mientras se viaja.** Antes el tramo
	eran dos columnas de texto con una flecha chiquita en el medio, y eso no da la
	sensación de estar yendo a ningún lado: la pantalla que uno mira **mientras
	espera** tiene que mostrar que algo se mueve, o el juego se siente detenido
	aunque no lo esté.

	Informa por su forma en tres cosas que el texto decía mal: **cuánto falta** se
	lee sin leer la cifra, **hacia dónde** se lee por las puntas de flecha, y
	**dónde está la nave ahora** por dónde cae el casco. La lista de al lado sigue
	diciendo los números exactos, como manda la regla de las figuras.

	Va en banda de alto fijo y a todo el ancho, que es la excepción declarada:
	una banda no se deforma al estirarse, y acá el ancho **es** el viaje. Cajas y
	SVG chico en vez de un lienzo estirado, por lo mismo que la escalera de
	reputación.

	El reloj late una vez por segundo y sólo mientras hay tramo, como el indicador
	de acción de la barra.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import { remainingLabel } from '$lib/format';
	import type { PuntaTramo } from '$lib/tipos';

	interface Props {
		origin: PuntaTramo;
		destination: PuntaTramo;
		/** Cuándo empezó, en milisegundos UTC. */
		startedAt: number;
		durationSeconds: number;
	}

	let { origin, destination, startedAt, durationSeconds }: Props = $props();

	let ahora = $state(Date.now());

	$effect(() => {
		const reloj = setInterval(() => (ahora = Date.now()), 1000);
		return () => clearInterval(reloj);
	});

	let transcurrido = $derived(Math.max(0, (ahora - startedAt) / 1000));
	let fraccion = $derived(durationSeconds > 0 ? Math.min(1, transcurrido / durationSeconds) : 1);
	/** Dónde cae la nave, dejando aire en las dos puntas para los nodos. */
	let donde = $derived(6 + fraccion * 88);
	let restante = $derived(Math.max(0, Math.ceil(durationSeconds - transcurrido)));

	/**
	 * Las puntas de flecha del riel, repartidas parejo.
	 *
	 * Son lo que dice **hacia dónde** sin una sola palabra. Las que quedaron atrás
	 * se apagan: el camino recorrido ya no es una promesa.
	 */
	const FLECHAS = [16, 28, 40, 52, 64, 76];
</script>

<div class="relative h-[5.5rem] w-full">
	<!-- El riel entero, punteado: lo que falta. -->
	<div
		class="absolute top-[2.15rem] h-0 border-t border-dashed border-border"
		style="left: 6%; right: 6%"
	></div>

	<!-- Y lo recorrido encima, lleno y encendido. -->
	<div
		class="absolute top-[2.1rem] h-[2px] bg-data shadow-data-glow"
		style="left: 6%; width: {Math.max(0, donde - 6)}%"
	></div>

	{#each FLECHAS as x (x)}
		<span
			class="absolute top-[2.15rem] -translate-x-1/2 -translate-y-1/2
				{x <= donde ? 'text-data' : 'text-text-muted'}"
			style="left: {x}%"
		>
			<Icon name="caret-right" weight="bold" size="0.6rem" />
		</span>
	{/each}

	<!-- Los dos extremos, con su ícono adentro del nodo. -->
	{#each [{ x: 6, punta: origin, hecho: true }, { x: 94, punta: destination, hecho: fraccion >= 1 }] as extremo (extremo.punta.name)}
		<span
			class="absolute top-[2.15rem] flex h-[1.6rem] w-[1.6rem] -translate-x-1/2 -translate-y-1/2
				items-center justify-center border bg-background
				{extremo.hecho ? 'border-data text-data' : 'border-border-soft text-text-muted'}"
			style="left: {extremo.x}%"
		>
			<Icon name={extremo.punta.icon} weight="bold" size="0.8rem" />
		</span>
	{/each}

	<!--
		La nave. Apunta a la derecha porque el viaje va de izquierda a derecha, y es
		el mismo alambre que la figura del anillo: una silueta y no un casco
		concreto, que dibujar cinco naves es trabajo de arte.
	-->
	<span class="absolute top-[2.15rem] -translate-x-1/2 -translate-y-1/2" style="left: {donde}%">
		<svg
			viewBox="0 0 100 100"
			width="22"
			height="22"
			aria-hidden="true"
			style="filter: drop-shadow(0 0 8px rgb(79 210 238 / 0.55))"
		>
			<g transform="rotate(90 50 50)">
				<path
					d="M50 4 L62 32 L88 62 L88 76 L58 66 L54 92 L50 97 L46 92 L42 66 L12 76 L12 62 L38 32 Z"
					fill="var(--color-background)"
					stroke="var(--color-data)"
					stroke-width="6"
					stroke-linejoin="round"
				/>
			</g>
		</svg>
	</span>

	<!-- Cuánto lleva, arriba del casco y siguiéndolo. -->
	<span
		class="absolute top-[0.4rem] -translate-x-1/2 font-mono text-[0.72rem] whitespace-nowrap text-data"
		style="left: {donde}%"
	>
		{Math.round(fraccion * 100)} % · {remainingLabel(restante)}
	</span>

	<!-- Y las dos puntas, con el nombre del lado que les toca. -->
	<span class="absolute top-[3.4rem] left-0 flex max-w-[45%] flex-col items-start gap-[0.1rem]">
		<Label>Salida</Label>
		<span class="truncate font-display text-1 tracking-display text-text-strong uppercase">
			{origin.name}
		</span>
		<span class="truncate text-[0.68rem] text-text-muted">{origin.system}</span>
	</span>

	<span class="absolute top-[3.4rem] right-0 flex max-w-[45%] flex-col items-end gap-[0.1rem]">
		<Label>Llegada</Label>
		<span class="truncate font-display text-1 tracking-display text-text-strong uppercase">
			{destination.name}
		</span>
		<span class="truncate text-[0.68rem] text-text-muted">{destination.system}</span>
	</span>
</div>
