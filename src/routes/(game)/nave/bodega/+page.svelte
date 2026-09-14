<!--
	Pestaña Bodega: qué llevás y cuánto lugar queda.

	**La pregunta de una bodega no es cuánto llevás, es cuánto más entra**, y por
	eso lo primero de la pantalla es el medidor y no la lista. La capacidad
	limitada es un pilar del juego —todo lo que se carga obliga a dejar otra
	cosa—, así que el número que decide tiene que estar arriba de todo.

	Cada montón dice además lo que vale a precio de referencia. Es lo que convierte
	"está llena" en "conviene volver", que es la decisión de verdad.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ProgressBar from '$lib/components/meters/ProgressBar.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { thousands } from '$lib/format';
	import type { FilaCarga } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let bodega = $derived(data.bodega);
	/** Casi llena: es cuando el número deja de ser informativo y pasa a avisar. */
	let apretada = $derived(bodega.percent >= 85);
</script>

<svelte:head><title>Bodega · Nave · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Bodega</Eyebrow>
	<DisplayTitle>{bodega.shipName || 'Sin nave'}</DisplayTitle>
</div>

<!--
	El medidor, arriba de todo. Se pone en cian cuando queda poco: es la única
	lectura de esta pantalla que cambia una decisión antes de dar una orden.
-->
<TitledPanel title="Capacidad" detail="{bodega.percent} % ocupado" class="w-full">
	<div class="flex w-full flex-col gap-3">
		<ProgressBar
			percent={bodega.percent}
			color={apretada ? 'var(--color-data)' : 'var(--color-accent)'}
		/>

		<div class="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
			<!--
				Las cuatro en monoespaciada y sin mayúsculas: son cifras con unidad, y
				"m³" en mayúscula deja de ser el símbolo de metro cúbico.
			-->
			<span class="flex flex-col gap-1">
				<Label>Cargado</Label>
				<span class="font-mono text-[0.95rem] text-accent-bright">{bodega.used} m³</span>
			</span>
			<span class="flex flex-col gap-1">
				<Label>Capacidad</Label>
				<span class="font-mono text-[0.95rem] text-accent-bright">{bodega.capacity} m³</span>
			</span>
			<span class="flex flex-col gap-1">
				<Label>Libre</Label>
				<span class="font-mono text-[0.95rem] {apretada ? 'text-data' : 'text-accent-bright'}">
					{bodega.free} m³
				</span>
			</span>
			<span class="flex flex-col gap-1">
				<Label>Valor a bordo</Label>
				<span class="font-mono text-[0.95rem] text-data">{bodega.totalValue} CR</span>
			</span>
		</div>
	</div>
</TitledPanel>

<!--
	Una fila de carga. Va como snippet porque la dibujan los dos paneles —la de la
	nave y la de la estación— y son la misma cosa vista en dos lugares.
-->
{#snippet fila(linea: FilaCarga)}
	<div
		class="flex w-full flex-col gap-1 border-b border-border-soft px-[0.6rem] py-[0.7rem]
			last:border-b-0"
	>
		<div class="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
			<Icon name={linea.icon} weight="duotone" size="0.95rem" class="text-accent" />
			<span
				class="min-w-0 overflow-hidden font-display text-[0.82rem] font-bold tracking-display
					text-ellipsis whitespace-nowrap text-text-strong uppercase"
			>
				{linea.name}
			</span>
			<span class="font-display text-[0.58rem] tracking-label text-accent-dim uppercase">
				{linea.kindLabel}
			</span>
			<div class="grow"></div>
			<!--
				Las tres cifras van juntas: si la fila no entra, bajan las tres de una y
				no queda un número suelto en su propio renglón.
			-->
			<span class="flex shrink-0 items-baseline gap-3">
				<span class="w-[3.5rem] text-right font-mono text-[0.82rem] text-accent-bright">
					{thousands(linea.quantity)}
				</span>
				<span class="w-[4.5rem] text-right font-mono text-[0.75rem] text-text-muted">
					{linea.volume} m³
				</span>
				<span class="w-[4.5rem] text-right font-mono text-[0.78rem] text-data">
					{linea.value} CR
				</span>
			</span>
		</div>

		<!--
			La barra compara contra lo cargado y no contra el tope: con la bodega a
			medio llenar, todas serían igual de cortas y no se vería qué la está
			llenando.
		-->
		<ProgressBar percent={linea.share} />
	</div>
{/snippet}

{#if bodega.lines.length === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>La bodega está vacía</CardTitle>
			<BodyText>
				Acá va a quedar lo que traigas: mineral de un cinturón, módulos de repuesto, lo que compres
				en una estación. La Pioner no lleva mucho, así que vas a tener que elegir.
			</BodyText>
		</div>
	</Panel>
{:else}
	<TitledPanel
		title="Carga"
		detail={bodega.lines.length === 1 ? '1 montón' : `${bodega.lines.length} montones`}
		class="w-full"
	>
		<div class="flex w-full flex-col">
			{#each bodega.lines as linea (linea.itemCode)}
				{@render fila(linea)}
			{/each}
		</div>
	</TitledPanel>
{/if}

<!--
	Y lo que tenés guardado en la estación donde estás. Va en esta pantalla y no en
	otra: son las dos mitades de la misma pregunta —qué tengo y dónde—, y
	separarlas obligaría a ir y volver para compararlas.

	Es además donde aparece lo que desmontás de la nave, que si no sería una pieza
	que se va a ningún lado.
-->
{#if bodega.stationName}
	<TitledPanel
		title="En {bodega.stationName}"
		detail={bodega.stationLines.length > 0 ? `${bodega.stationValue} CR` : 'Sin nada guardado'}
		class="w-full"
	>
		{#if bodega.stationLines.length === 0}
			<BodyText>
				Lo que dejes acá se queda acá: no viaja con la nave. Es donde cae lo que desmontás y lo que
				compres sin llevarte puesto.
			</BodyText>
		{:else}
			<div class="flex w-full flex-col">
				{#each bodega.stationLines as linea (linea.itemCode)}
					{@render fila(linea)}
				{/each}
			</div>
		{/if}
	</TitledPanel>
{/if}
