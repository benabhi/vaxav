<!--
	El historial de precios de un ítem.

	**El precio de algo es su historia.** Una cifra suelta no dice si es buena; lo
	que la vuelve una decisión es ver que el iridio viene subiendo hace cuatro días
	o que alguien acaba de tirar el hierro a la mitad.

	Tres capas, como el gráfico de EVE, y cada una contesta algo distinto:

	- **La banda** entre el mínimo y el máximo de cada día: cuánta pelea hubo. Una
	  banda ancha es un mercado sin acuerdo, donde hay margen para el que sepa
	  mirar; una angosta es un precio asentado.
	- **La línea** del promedio ponderado: a cuánto se estuvo comerciando de verdad.
	- **Las barras** del volumen, abajo: cuánto se movió. Un precio bonito con
	  volumen cero no es un precio, es una anécdota.

	Se dibuja a mano en SVG de trazo fino, como el resto de las figuras del juego.
	Nada de librerías de gráficos: traen su propio aspecto, y acá el aspecto es el
	producto.

	Los días sin operaciones **no se rellenan**: la curva une los que hubo y el
	hueco se ve como lo que es. Rellenarlos con ceros haría que el precio se
	desplome cada vez que nadie comerció, que es lo contrario de lo que pasó.
-->
<script lang="ts">
	import Label from '../typography/Label.svelte';
	import { thousands } from '$lib/format';
	import type { DiaMercado } from '$lib/tipos';

	interface Props {
		history: readonly DiaMercado[];
	}

	let { history }: Props = $props();

	/** El lienzo. El alto sale del `viewBox` y nunca de un valor fijo. */
	const ANCHO = 640;
	const ALTO = 220;
	const MARGEN_IZQ = 52;
	const MARGEN_DER = 12;
	const ARRIBA = 14;
	/** Dónde termina la zona de precios y empieza la de volumen. */
	const PISO_PRECIO = 150;
	const PISO_VOLUMEN = 196;

	let dias = $derived(history.length);

	/** El rango de precios, con un respiro arriba y abajo para que no toque el borde. */
	let rango = $derived.by(() => {
		if (dias === 0) return { min: 0, max: 1 };
		const min = Math.min(...history.map((dia) => dia.low));
		const max = Math.max(...history.map((dia) => dia.high));
		// Un solo precio en toda la historia daría una altura de cero y una división
		// por cero: se le inventa un margen para que la línea quede en el medio.
		if (min === max) return { min: Math.max(0, min - 1), max: max + 1 };
		const respiro = Math.max(1, Math.round((max - min) * 0.12));
		return { min: Math.max(0, min - respiro), max: max + respiro };
	});

	let maxVolumen = $derived(dias === 0 ? 1 : Math.max(...history.map((dia) => dia.volume), 1));

	/** Dónde cae un día en horizontal. */
	function x(index: number): number {
		const util = ANCHO - MARGEN_IZQ - MARGEN_DER;
		if (dias === 1) return MARGEN_IZQ + util / 2;
		return MARGEN_IZQ + (index / (dias - 1)) * util;
	}

	/** Dónde cae un precio en vertical. */
	function y(price: number): number {
		const alto = PISO_PRECIO - ARRIBA;
		return PISO_PRECIO - ((price - rango.min) / (rango.max - rango.min)) * alto;
	}

	/** El ancho de una barra de volumen, sin que se toquen entre sí. */
	let barra = $derived(
		dias <= 1 ? 18 : Math.max(2, ((ANCHO - MARGEN_IZQ - MARGEN_DER) / dias) * 0.6)
	);

	/** La línea del promedio. */
	let curva = $derived(
		history
			.map((dia, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(dia.average)}`)
			.join(' ')
	);

	/** La banda entre mínimos y máximos, ida por arriba y vuelta por abajo. */
	let banda = $derived.by(() => {
		if (dias === 0) return '';
		const arriba = history.map(
			(dia, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(dia.high)}`
		);
		const abajo = history
			.map((dia, index) => `L ${x(dias - 1 - index)} ${y(history[dias - 1 - index].low)}`)
			.slice(1);
		return `${arriba.join(' ')} L ${x(dias - 1)} ${y(history[dias - 1].low)} ${abajo.join(' ')} Z`;
	});

	/** Tres marcas de precio: el piso, el medio y el techo. */
	let marcas = $derived([rango.min, Math.round((rango.min + rango.max) / 2), rango.max]);

	let ultimo = $derived(dias > 0 ? history[dias - 1] : null);

	function fecha(at: number): string {
		return new Date(at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
	}
</script>

<div class="flex w-full flex-col items-start gap-2">
	<div class="flex w-full flex-wrap items-baseline gap-2">
		<Label>Historial</Label>
		<div class="grow"></div>
		{#if ultimo}
			<span class="font-mono text-[0.72rem] text-text-muted">
				último {thousands(ultimo.average)} CR · {thousands(ultimo.volume)} u
			</span>
		{/if}
	</div>

	{#if dias === 0}
		<p class="text-1 text-text-muted">
			Todavía no se comerció nada de esto. El primer trato abre la serie.
		</p>
	{:else}
		<svg
			viewBox="0 0 {ANCHO} {ALTO}"
			class="w-full"
			style="aspect-ratio: {ANCHO} / {ALTO}"
			role="img"
			aria-label="Precio de los últimos {dias} días de mercado"
		>
			<!-- Las guías horizontales y su precio, que es lo que da escala a todo. -->
			{#each marcas as marca (marca)}
				<line
					x1={MARGEN_IZQ}
					y1={y(marca)}
					x2={ANCHO - MARGEN_DER}
					y2={y(marca)}
					stroke="var(--color-dead-line)"
					stroke-width="1"
					stroke-dasharray={marca === marcas[1] ? '3 4' : '0'}
				/>
				<text
					x={MARGEN_IZQ - 8}
					y={y(marca) + 4}
					text-anchor="end"
					class="fill-[var(--color-text-muted)] font-mono text-[11px]"
				>
					{thousands(marca)}
				</text>
			{/each}

			<!-- La pelea del día: entre cuánto y cuánto se movió. -->
			<path d={banda} fill="var(--color-surface-strong)" stroke="none" />

			<!-- A cuánto se comerció de verdad. -->
			<path d={curva} fill="none" stroke="var(--color-accent-bright)" stroke-width="1.5" />

			{#each history as dia, index (dia.at)}
				<circle cx={x(index)} cy={y(dia.average)} r="2" fill="var(--color-accent-bright)" />

				<!--
					El volumen, abajo y en su propia escala. Un precio bonito con volumen
					cero no es un precio: es una anécdota.
				-->
				<rect
					x={x(index) - barra / 2}
					y={PISO_VOLUMEN - (dia.volume / maxVolumen) * (PISO_VOLUMEN - PISO_PRECIO - 10)}
					width={barra}
					height={(dia.volume / maxVolumen) * (PISO_VOLUMEN - PISO_PRECIO - 10)}
					fill="var(--color-data)"
					opacity="0.5"
				/>
			{/each}

			<line
				x1={MARGEN_IZQ}
				y1={PISO_VOLUMEN}
				x2={ANCHO - MARGEN_DER}
				y2={PISO_VOLUMEN}
				stroke="var(--color-border-soft)"
				stroke-width="1"
			/>

			<!-- Sólo las fechas de los extremos: con treinta días, todas serían una mancha. -->
			<text
				x={MARGEN_IZQ}
				y={ALTO - 4}
				class="fill-[var(--color-text-muted)] font-mono text-[11px]"
			>
				{fecha(history[0].at)}
			</text>
			{#if dias > 1}
				<text
					x={ANCHO - MARGEN_DER}
					y={ALTO - 4}
					text-anchor="end"
					class="fill-[var(--color-text-muted)] font-mono text-[11px]"
				>
					{fecha(history[dias - 1].at)}
				</text>
			{/if}

			<text
				x={MARGEN_IZQ - 8}
				y={PISO_VOLUMEN}
				text-anchor="end"
				class="fill-[var(--color-text-muted)] font-display text-[10px] tracking-[0.1em] uppercase"
			>
				Vol
			</text>
		</svg>
	{/if}
</div>
