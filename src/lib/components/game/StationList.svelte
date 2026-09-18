<!--
	La lista de puestos de una corporación: dónde se la encuentra.

	**Vive acá porque la piden dos**, igual que la de agentes y la de miembros: la
	pestaña del módulo, que muestra los de tu corporación, y la ventana de una ficha
	ajena, que muestra los de ésa. Misma tabla, mismos filtros, mismas columnas.

	Es una tabla y no una lista de tarjetas porque lo que uno hace con ella es
	**buscar dónde**: cuál queda cerca, cuál tiene refinería. Para eso sirve una
	lista ordenable, y por eso nace con recorte, orden y paginado —una naviera grande
	opera un puesto por sistema, y «y quince más» no contesta ninguna de esas dos
	preguntas—.

	**Lo que no sabe es cómo se arman las URL.** Cada lugar que la usa tiene las
	suyas, así que eso llega como función: la pieza pone la forma y quien la abre
	pone la navegación.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import SelectField from '../forms/SelectField.svelte';
	import TextField from '../forms/TextField.svelte';
	import HudTable, { type Columna } from '../ui/HudTable.svelte';
	import Paginator from '../ui/Paginator.svelte';
	import type { Ubicaciones } from '$lib/tipos';

	interface Props {
		ubicaciones: Ubicaciones;
		/** La URL con unos parámetros cambiados, conservando lo demás. */
		hrefFor: (cambios: Record<string, string>) => string;
		/** Lo que el formulario tiene que arrastrar para no perder dónde estaba. */
		hidden?: Readonly<Record<string, string>>;
		/**
		 * El prefijo de los campos del formulario.
		 *
		 * Vacío en una pantalla y con prefijo en la ventana de una ficha: abajo de la
		 * ventana hay otra pantalla con sus propios `buscar` y `pagina`, y sin esto el
		 * buscador de la ficha filtraría la tabla de atrás.
		 */
		prefix?: string;
	}

	let { ubicaciones, hrefFor, hidden = {}, prefix = '' }: Props = $props();

	let consulta = $derived(ubicaciones.query);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'nombre', label: 'Puesto', width: '14rem' },
		{ key: 'sistema', label: 'Sistema', width: '10rem' },
		{ key: 'servicios', label: 'Qué ofrece' }
	];

	let opcionesServicio = $derived([{ value: '', label: 'Todos' }, ...ubicaciones.services]);

	/** Ordena por esa columna, y la segunda vez al revés. */
	function ordenPor(columna: string): string {
		const mismo = consulta.sort === columna;
		return hrefFor({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	let hayFiltro = $derived(Boolean(consulta.search || consulta.service));
</script>

<form
	method="GET"
	class="flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface px-[0.9rem]
		py-[0.7rem]"
>
	{#each Object.entries(hidden) as [clave, valor] (clave)}
		<input type="hidden" name={clave} value={valor} />
	{/each}

	<div class="w-full min-w-0 xs:w-[12rem]">
		<TextField
			label="Buscar"
			name="{prefix}buscar"
			size="1"
			value={consulta.search}
			placeholder="Puesto o sistema"
		/>
	</div>

	<!--
		El recorte que vuelve útil la lista en cuanto es larga: de veinte puestos,
		cuáles tienen refinería es la única pregunta que importa cuando uno sale con
		la bodega llena.
	-->
	<div class="w-full min-w-0 xs:w-[11rem]">
		<SelectField
			label="Ofrece"
			name="{prefix}servicio"
			size="1"
			onchange={alCambiar}
			value={consulta.service}
			options={opcionesServicio}
		/>
	</div>

	<!-- El orden viaja en la URL: sin esto, filtrar lo perdería. -->
	<input type="hidden" name="{prefix}orden" value={consulta.sort} />
	<input type="hidden" name="{prefix}dir" value={consulta.dir} />

	<HudButton type="submit" size="1" variant="primary">
		<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
		Filtrar
	</HudButton>

	{#if hayFiltro}
		<HudLink href={hrefFor({ buscar: '', servicio: '' })} size="1" variant="outline">
			<Icon name="x" weight="bold" size="0.7rem" />
			Quitar
		</HudLink>
	{/if}

	<div class="grow"></div>

	<span class="font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
		{#if hayFiltro}
			{ubicaciones.found} de {ubicaciones.total}
		{:else}
			{ubicaciones.count}
		{/if}
	</span>
</form>

<HudTable
	columns={COLUMNAS}
	minWidth="34rem"
	sort={consulta.sort}
	dir={consulta.dir}
	sortHref={ordenPor}
	class="mt-3"
>
	{#each ubicaciones.stations as puesto (puesto.code)}
		<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
			<td class="py-[0.5rem] pr-3">
				<span class="flex min-w-0 items-center gap-2">
					<Icon name="buildings" weight="bold" size="0.75rem" class="shrink-0 text-accent" />
					<span class="truncate font-display text-[0.82rem] tracking-display text-text-strong">
						{puesto.name}
					</span>
				</span>
			</td>
			<td class="py-[0.5rem] pr-3">
				<!-- El sistema lleva al mapa, con él elegido: un nombre que no lleva a
				     ninguna parte no dice dónde queda nada. -->
				<a
					href="/navegacion/galaxia?sistema={puesto.systemCode}"
					class="block truncate text-1 text-text-body underline decoration-dotted
						underline-offset-[0.2rem] hover:text-accent-bright"
				>
					{puesto.system}
				</a>
			</td>
			<td class="py-[0.5rem] text-1 text-text-muted">
				{#if puesto.services.length > 0}
					<span class="block truncate">{puesto.services.join(' · ')}</span>
				{:else}
					<!-- Un amarre pelado también es un puesto: dice que hay dónde atracar. -->
					<span class="block truncate text-text-muted/70">Sólo amarre</span>
				{/if}
			</td>
		</tr>
	{/each}
</HudTable>

{#if ubicaciones.found === 0}
	<p class="w-full pt-3 text-1 text-text-muted">
		{#if ubicaciones.total === 0}
			Ninguna. No todas las corporaciones tienen edificios: ésta es gente.
		{:else}
			Ningún puesto pasa ese recorte.
		{/if}
	</p>
{/if}

<Paginator
	page={consulta.page}
	pages={ubicaciones.pages}
	href={(n) => hrefFor({ pagina: String(n) })}
	class="mt-3"
/>
