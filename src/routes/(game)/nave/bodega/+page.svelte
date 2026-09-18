<!--
	Pestaña Bodega: qué llevás, cuánto lugar queda y qué conviene dejar.

	**La pregunta de una bodega no es cuánto llevás, es cuánto más entra**, y por
	eso lo primero de la pantalla son las bahías y no la lista. La capacidad
	limitada es un pilar del juego —todo lo que se carga obliga a dejar otra cosa—,
	así que el número que decide tiene que estar arriba de todo.

	Tres decisiones que hacen a la pantalla:

	- **Cada bahía dibuja su composición**, no sólo su porcentaje. Un medidor que
	  dice «78 % lleno» informa una vez; uno partido por montones contesta **qué la
	  está llenando**, que es lo que uno quiere saber cuando no entra algo.
	- **Baldosas o lista**, y las dos sirven para preguntas distintas: la grilla se
	  barre de un vistazo para ver qué hay, la lista se lee en columnas para
	  comparar cifras. La elección viaja en la URL con el resto del recorte.
	- **La densidad es una columna de primera.** Créditos por metro cúbico es la
	  cuenta que decide qué se tira, y la que en EVE los mineros hacen a mano.

	El recorte entero —buscar, tipo, orden, página, vista— vive en la URL, como en
	el resto de las tablas del juego: se comparte, se vuelve con el botón de atrás
	y sobrevive a recargar.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import CargoBay from '$lib/components/game/CargoBay.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import { CONTROL_HEIGHTS } from '$lib/components/buttons/estilos';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { FilaCarga } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let bodega = $derived(data.bodega);
	let consulta = $derived(bodega.query);
	let filtrando = $derived(consulta.search !== '' || consulta.kind !== '');

	/** El montón señalado, para encenderlo a la vez en la barra y en su fila. */
	let señalado = $state('');

	/** Cómo se puede ordenar. El rótulo dice qué contesta cada orden. */
	const ORDENES = [
		{ code: 'volumen', label: 'Volumen' },
		{ code: 'densidad', label: 'CR / m³' },
		{ code: 'valor', label: 'Valor' },
		{ code: 'cantidad', label: 'Cantidad' },
		{ code: 'nombre', label: 'Nombre' }
	];

	/**
	 * La misma URL con unos parámetros cambiados.
	 *
	 * Cambiar de orden o de vista **no puede perder lo que se buscó**, así que se
	 * parte de lo que ya hay en la barra en vez de armar una URL nueva.
	 */
	function conParametro(cambios: Record<string, string>): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const [clave, valor] of Object.entries(cambios)) {
			if (valor === '') params.delete(clave);
			else params.set(clave, valor);
		}
		// Cualquier cambio de recorte vuelve a la primera página: quedarse en la
		// cuatro de una lista que ahora tiene dos es mostrar una pantalla vacía.
		if (!('pagina' in cambios)) params.delete('pagina');
		const texto = params.toString();
		return texto ? `?${texto}` : '?';
	}

	/** El orden inverso del actual, para que tocar dos veces la misma clave dé vuelta. */
	function conOrden(code: string): string {
		const inverso = consulta.sort === code && consulta.dir === 'asc' ? 'desc' : 'asc';
		return conParametro({ orden: code, dir: inverso });
	}

	/**
	 * Los campos vacíos no viajan en la URL.
	 *
	 * Un formulario `GET` manda todo, incluso lo que no se llenó, y la barra queda
	 * con `?buscar=` colgando. Una URL que se comparte tiene que poder leerse.
	 */
	function alEnviar(evento: SubmitEvent & { currentTarget: HTMLFormElement }) {
		const vacios = [...evento.currentTarget.elements].filter(
			(campo): campo is HTMLInputElement => campo instanceof HTMLInputElement && campo.value === ''
		);
		for (const campo of vacios) campo.disabled = true;
		setTimeout(() => {
			for (const campo of vacios) campo.disabled = false;
		});
	}
</script>

<svelte:head><title>Bodega · Nave · Vaxav</title></svelte:head>

<!--
	Un montón, en las dos vistas. Baldosa y renglón dicen lo mismo con la misma
	jerarquía —cantidad, nombre, volumen, valor, densidad— así que cambiar de vista
	no obliga a volver a aprender dónde está cada cifra.
-->
{#snippet cifras(fila: FilaCarga)}
	<span class="font-mono text-[0.68rem] whitespace-nowrap text-text-muted">{fila.volume} m³</span>
	<span class="font-mono text-[0.68rem] whitespace-nowrap text-data">{fila.value} CR</span>
	<span class="font-mono text-[0.68rem] whitespace-nowrap text-text-muted">
		{fila.density} CR/m³
	</span>
{/snippet}

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Bodega</Eyebrow>
	<DisplayTitle>{bodega.shipName || 'Sin nave'}</DisplayTitle>
</div>

<!--
	Las bahías, arriba de todo. Son la figura de la pantalla y la única lectura que
	cambia una decisión antes de dar una orden.
-->
{#if bodega.bays.length > 0}
	<Panel class="w-full">
		<div class="flex w-full flex-col gap-5">
			{#each bodega.bays as bay (bay.code)}
				<CargoBay {bay} highlight={señalado} onHighlight={(code) => (señalado = code)} />
			{/each}

			<div
				class="flex w-full flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-border-soft pt-3"
			>
				<span class="flex items-baseline gap-2">
					<Label>Valor a bordo</Label>
					<span class="font-mono text-[0.9rem] text-data">{bodega.totalValue} CR</span>
				</span>
				<span class="flex items-baseline gap-2">
					<Label>Montones</Label>
					<span class="font-mono text-[0.78rem] text-text-strong">{bodega.total}</span>
				</span>
			</div>
		</div>
	</Panel>
{/if}

<TitledPanel
	title="Carga"
	detail={bodega.found === bodega.total
		? `${bodega.total} ${bodega.total === 1 ? 'montón' : 'montones'}`
		: `${bodega.found} de ${bodega.total}`}
	class="w-full"
>
	<div class="flex w-full flex-col items-start gap-3">
		<!-- El recorte. Todo en un renglón que envuelve: en un teléfono se apila solo. -->
		<form
			method="GET"
			onsubmit={alEnviar}
			class="flex w-full flex-wrap items-center gap-2 border-b border-border-soft pb-3"
		>
			<label class="flex min-w-0 flex-[1_1_11rem] items-center gap-2">
				<Icon
					name="magnifying-glass"
					weight="bold"
					size="0.8rem"
					class="shrink-0 text-accent-dim"
				/>
				<input
					type="search"
					name="buscar"
					value={consulta.search}
					placeholder="Buscar en la bodega"
					class="{CONTROL_HEIGHTS['2']} w-full min-w-0 border border-border-soft bg-field px-2
						font-body text-[0.78rem] text-text-strong transition-[border-color,box-shadow]
						placeholder:text-text-muted hover:border-border focus:border-accent focus:shadow-glow
						focus:outline-none"
				/>
			</label>

			<!-- Lo que no se toca al buscar viaja escondido: buscar no pierde el recorte. -->
			<input type="hidden" name="tipo" value={consulta.kind} />
			<input type="hidden" name="orden" value={consulta.sort} />
			<input type="hidden" name="dir" value={consulta.dir} />
			<input type="hidden" name="vista" value={consulta.view} />

			<HudButton type="submit" size="2" variant="outline">
				<Icon name="magnifying-glass" weight="bold" size="0.6rem" />
				Buscar
			</HudButton>

			{#if filtrando}
				<HudLink href="?" size="2" variant="ghost">
					<Icon name="x" weight="bold" size="0.6rem" />
					Limpiar
				</HudLink>
			{/if}

			<!--
				La vista, a la derecha del todo y siempre en el mismo lugar: es lo único
				de esta barra que no recorta nada, así que no compite con los filtros.
			-->
			<div class="ml-auto flex items-center">
				<HudLink
					href={conParametro({ vista: 'baldosas' })}
					size="2"
					variant={consulta.view === 'baldosas' ? 'primary' : 'outline'}
					title="Ver en baldosas"
				>
					<Icon name="squares-four" weight="bold" size="0.7rem" />
				</HudLink>
				<HudLink
					href={conParametro({ vista: 'lista' })}
					size="2"
					variant={consulta.view === 'lista' ? 'primary' : 'outline'}
					title="Ver en lista"
				>
					<Icon name="clipboard-text" weight="bold" size="0.7rem" />
				</HudLink>
			</div>
		</form>

		<!--
			Tipo y orden, como enlaces y no como botones: cada recorte es una URL, así
			que se comparte, se vuelve con el botón de atrás y se recarga sin perderlo.
		-->
		<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
			{#if bodega.kinds.length > 1}
				<div class="flex flex-wrap items-center gap-1">
					<Label>Tipo</Label>
					<HudLink
						href={conParametro({ tipo: '' })}
						size="1"
						variant={consulta.kind === '' ? 'primary' : 'ghost'}
					>
						Todo
					</HudLink>
					{#each bodega.kinds as opcion (opcion.value)}
						<HudLink
							href={conParametro({ tipo: opcion.value })}
							size="1"
							variant={consulta.kind === opcion.value ? 'primary' : 'ghost'}
						>
							{opcion.label}
						</HudLink>
					{/each}
				</div>
			{/if}

			<div class="flex flex-wrap items-center gap-1">
				<Label>Ordenar</Label>
				{#each ORDENES as opcion (opcion.code)}
					<HudLink
						href={conOrden(opcion.code)}
						size="1"
						variant={consulta.sort === opcion.code ? 'primary' : 'ghost'}
					>
						{opcion.label}
						{#if consulta.sort === opcion.code}
							<Icon
								name={consulta.dir === 'asc' ? 'caret-up' : 'caret-down'}
								weight="bold"
								size="0.55rem"
							/>
						{/if}
					</HudLink>
				{/each}
			</div>
		</div>

		{#if bodega.lines.length === 0}
			<BodyText>
				{#if bodega.total === 0}
					La bodega está vacía. Lo que extraigas o compres aparece acá.
				{:else}
					No hay nada que cumpla con eso. Probá aflojando los filtros.
				{/if}
			</BodyText>
		{:else if consulta.view === 'baldosas'}
			<!--
				Las baldosas crecen hasta llenar el ancho y envuelven solas, así que en un
				monitor entran cinco y en un teléfono una, sin un punto de corte escrito.
			-->
			<div class="grid w-full [grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))] gap-2">
				{#each bodega.lines as fila (fila.itemCode)}
					<div
						role="listitem"
						onmouseenter={() => (señalado = fila.itemCode)}
						onmouseleave={() => (señalado = '')}
						class="flex min-w-0 flex-col gap-[0.3rem] border bg-surface px-[0.6rem] py-[0.5rem]
							transition-[border-color,background-color]
							{señalado === fila.itemCode ? 'border-accent bg-surface-hover' : 'border-border-soft'}"
					>
						<div class="flex w-full items-center gap-2">
							<Icon name={fila.icon} weight="duotone" size="1rem" class="shrink-0 text-accent" />
							<span class="ml-auto font-mono text-[0.95rem] text-text-strong">
								{fila.quantity}
							</span>
						</div>
						<span
							class="truncate font-display text-[0.74rem] font-semibold tracking-display
								text-text-strong uppercase"
							title={fila.name}
						>
							{fila.name}
						</span>
						<div class="flex flex-wrap items-baseline gap-x-2 gap-y-[0.15rem]">
							{@render cifras(fila)}
						</div>
						<!-- Cuánto de lo cargado se lleva este montón. -->
						<div class="h-[3px] w-full bg-dead-rail">
							<div class="h-[3px] bg-accent" style="width: {fila.share}%"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex w-full flex-col">
				{#each bodega.lines as fila (fila.itemCode)}
					<div
						role="listitem"
						onmouseenter={() => (señalado = fila.itemCode)}
						onmouseleave={() => (señalado = '')}
						class="flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-b border-l-[3px]
							border-border-soft/40 px-[0.5rem] py-[0.45rem] transition-[background-color,border-color]
							last:border-b-0
							{señalado === fila.itemCode ? 'border-l-accent bg-surface-hover' : 'border-l-transparent'}"
					>
						<Icon name={fila.icon} weight="duotone" size="0.95rem" class="shrink-0 text-accent" />
						<span class="w-[2.5rem] shrink-0 text-right font-mono text-[0.8rem] text-text-strong">
							{fila.quantity}
						</span>
						<span
							class="min-w-0 flex-[1_1_8rem] truncate font-display text-[0.74rem] font-semibold
								tracking-display text-text-strong uppercase"
						>
							{fila.name}
						</span>
						<span class="hidden shrink-0 text-1 text-text-muted sm:inline">{fila.kindLabel}</span>
						{@render cifras(fila)}
					</div>
				{/each}
			</div>
		{/if}

		{#if bodega.pages > 1}
			<Paginator
				page={bodega.page}
				pages={bodega.pages}
				href={(numero) => conParametro({ pagina: String(numero) })}
			/>
		{/if}
	</div>
</TitledPanel>

<!--
	Lo que el piloto dejó guardado en la estación donde está. Va acá y no en otra
	pantalla: qué tengo y dónde son las dos mitades de la misma pregunta, y
	separarlas obligaría a ir y volver para compararlas.
-->
{#if bodega.stationName}
	<TitledPanel title="En la estación" detail={bodega.stationName} class="w-full">
		<div class="flex w-full flex-col items-start gap-2">
			{#if bodega.stationLines.length === 0}
				<BodyText>No tenés nada guardado en {bodega.stationName}.</BodyText>
			{:else}
				<div class="flex w-full flex-col">
					{#each bodega.stationLines as fila (fila.itemCode)}
						<div
							class="flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-b
								border-border-soft/40 py-[0.4rem] last:border-b-0"
						>
							<Icon
								name={fila.icon}
								weight="duotone"
								size="0.95rem"
								class="shrink-0 text-accent-dim"
							/>
							<span class="w-[2.5rem] shrink-0 text-right font-mono text-[0.8rem] text-text-strong">
								{fila.quantity}
							</span>
							<span
								class="min-w-0 flex-[1_1_8rem] truncate font-display text-[0.74rem] font-semibold
									tracking-display text-text-body uppercase"
							>
								{fila.name}
							</span>
							{@render cifras(fila)}
						</div>
					{/each}
				</div>
				<span class="flex items-baseline gap-2">
					<Label>Valor guardado</Label>
					<span class="font-mono text-[0.8rem] text-data">{bodega.stationValue} CR</span>
				</span>
			{/if}
		</div>
	</TitledPanel>
{/if}
