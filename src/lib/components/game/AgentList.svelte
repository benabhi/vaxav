<!--
	La lista de agentes de una corporación: quiénes reparten trabajo y quién te
	recibe.

	**Vive acá porque la piden dos**: la pestaña del módulo, que muestra los de tu
	corporación, y la ventana de una ficha ajena, que muestra los de ésa. Es la
	misma tabla con los mismos filtros y las mismas columnas, y escrita dos veces
	sería garantizar que dentro de un mes una muestre una columna que la otra no.
	Es lo que ya pasó con el esqueleto de las tablas antes de `HudTable`.

	**Lo que no sabe es cómo se arman las URL.** Cada lugar que la usa tiene las
	suyas —la pestaña manda sus recortes en parámetros sueltos, la ventana en los
	suyos para no pisar los de la pantalla que hay debajo—, así que eso llega como
	función. La pieza pone la forma; quién la abre pone la navegación.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import SelectField from '../forms/SelectField.svelte';
	import TextField from '../forms/TextField.svelte';
	import HudTable, { type Columna } from '../ui/HudTable.svelte';
	import Paginator from '../ui/Paginator.svelte';
	import Identicon from './Identicon.svelte';
	import type { AgentesCorporacion } from '$lib/tipos';

	interface Props {
		agentes: AgentesCorporacion;
		/** La URL con unos parámetros cambiados, conservando lo demás. */
		hrefFor: (cambios: Record<string, string>) => string;
		/**
		 * Lo que el formulario tiene que arrastrar para no perder dónde estaba.
		 *
		 * Un `GET` manda **sólo lo que tiene adentro**, así que todo recorte que no
		 * sea un campo visible —la ventana abierta, la sección, el orden— se pierde
		 * al filtrar si no viaja como campo escondido. Cada lugar sabe cuáles son
		 * los suyos.
		 */
		hidden?: Readonly<Record<string, string>>;
	}

	let { agentes, hrefFor, hidden = {} }: Props = $props();

	let consulta = $derived(agentes.query);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'nombre', label: 'Agente', width: '14rem' },
		{ key: 'nivel', label: 'Nivel', width: '5rem' },
		{ key: 'clase', label: 'Reparte', width: '10rem' },
		{ key: 'estacion', label: 'Estación', from: 'md' },
		{ label: 'Atiende', width: '11rem', class: 'text-right' }
	];

	let opcionesClase = $derived([{ value: '', label: 'Todas' }, ...agentes.kinds]);

	/** Ordena por esa columna, y la segunda vez al revés. */
	function ordenPor(columna: string): string {
		const mismo = consulta.sort === columna;
		return hrefFor({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	let hayFiltro = $derived(Boolean(consulta.search || consulta.kind || consulta.onlyOpen));
</script>

<!--
	La barra de recorte, con el mismo aspecto que la del listado de miembros y la
	del mapa: buscar por nombre, la clase de misión, y el interruptor que deja
	sólo los que ya te reciben.
-->
<form
	method="GET"
	class="flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface px-[0.9rem]
		py-[0.7rem]"
>
	{#each Object.entries(hidden) as [clave, valor] (clave)}
		<input type="hidden" name={clave} value={valor} />
	{/each}

	<div class="w-full min-w-0 xs:w-[12rem]">
		<TextField label="Buscar" name="buscar" size="1" value={consulta.search} placeholder="Nombre" />
	</div>

	<div class="w-full min-w-0 xs:w-[10rem]">
		<SelectField
			label="Reparte"
			name="clase"
			size="1"
			onchange={alCambiar}
			value={consulta.kind}
			options={opcionesClase}
		/>
	</div>

	<!--
		El recorte que vuelve útil la lista en cuanto la reputación se mueve: de
		veinte agentes, saber cuáles te reciben hoy es la única pregunta que importa
		antes de salir a buscar trabajo. Va como enlace y no como casilla porque es
		un recorte más, y los recortes de este juego viven en la URL.
	-->
	<HudLink
		href={hrefFor({ atienden: consulta.onlyOpen ? '' : '1' })}
		size="1"
		variant={consulta.onlyOpen ? 'primary' : 'outline'}
	>
		<Icon name={consulta.onlyOpen ? 'check' : 'users-three'} weight="bold" size="0.7rem" />
		Disponibles
	</HudLink>

	<!-- Conservan el orden al filtrar: sin esto, buscar lo perdería. -->
	<input type="hidden" name="orden" value={consulta.sort} />
	<input type="hidden" name="dir" value={consulta.dir} />
	{#if consulta.onlyOpen}
		<input type="hidden" name="atienden" value="1" />
	{/if}

	<HudButton type="submit" variant="primary" size="1">
		<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
		Filtrar
	</HudButton>

	{#if hayFiltro}
		<HudLink href={hrefFor({ buscar: '', clase: '', atienden: '' })} variant="outline" size="1">
			<Icon name="x" weight="bold" size="0.7rem" />
			Quitar
		</HudLink>
	{/if}

	<div class="grow"></div>
	<span class="font-mono text-[0.72rem] text-text-muted">
		{agentes.open} de {agentes.total} disponibles
	</span>
</form>

<HudTable
	columns={COLUMNAS}
	minWidth="42rem"
	sort={consulta.sort}
	dir={consulta.dir}
	sortHref={ordenPor}
	class="mt-3"
>
	{#each agentes.agents as uno (uno.code)}
		<tr
			class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover
				{uno.open ? '' : 'opacity-60'}"
		>
			<td class="py-2">
				<span class="flex items-center gap-2">
					<!--
						Con su sello, igual que el listado de miembros lleva el del piloto: un
						nombre entre cincuenta es texto, un nombre con su emblema al lado se
						encuentra sin leer.
					-->
					<Identicon
						name={uno.name}
						family="agente"
						size="1.6rem"
						class={uno.open ? '' : 'opacity-50 saturate-[0.35]'}
					/>
					<span class="truncate font-display text-1 tracking-display text-text-strong uppercase">
						{uno.name}
					</span>
				</span>
			</td>
			<td class="py-2 font-display text-1 tracking-display text-accent-bright">{uno.level}</td>
			<td class="py-2">
				<span class="flex items-center gap-2">
					<Icon name={uno.kindIcon} weight="bold" size="0.75rem" class="shrink-0 text-accent-dim" />
					<span class="truncate text-1 text-text-body">{uno.kind}</span>
				</span>
			</td>
			<td class="hidden py-2 md:table-cell">
				<span class="flex items-baseline gap-2">
					<span class="truncate text-1 text-text-body">{uno.station}</span>
					<span class="truncate text-[0.7rem] text-text-muted">{uno.system}</span>
				</span>
			</td>
			<td class="py-2 text-right">
				{#if uno.open}
					<span class="font-display text-1 tracking-label text-data uppercase">Sí</span>
				{:else}
					<!--
						Lo que falta, no un «no» pelado: un agente cerrado sin motivo se lee
						como un error del juego y no como un escalón por subir.
					-->
					<span class="text-[0.7rem] text-text-muted">{uno.requirement}</span>
				{/if}
			</td>
		</tr>
	{/each}
</HudTable>

{#if agentes.found === 0}
	<p class="w-full pt-3 text-1 text-text-muted">
		{#if agentes.total === 0}
			Esta corporación no tiene a nadie repartiendo trabajo.
		{:else}
			Ningún agente pasa ese recorte.
		{/if}
	</p>
{/if}

<Paginator
	page={consulta.page}
	pages={agentes.pages}
	href={(n) => hrefFor({ pagina: String(n) })}
	class="mt-3"
/>
