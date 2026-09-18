<!--
	La lista de pilotos de una corporación: quiénes más vuelan ahí.

	**Vive acá porque la piden dos**, igual que la de agentes: la pestaña del
	módulo, que muestra los de tu corporación, y la ventana de una ficha ajena, que
	muestra los de ésa. Misma tabla, mismos filtros, mismas columnas.

	Y va aparte de `AgentList` aunque las dos listen gente, porque **las preguntas
	son distintas**: a los miembros se les pregunta «¿quién más vuela acá?» y a los
	agentes «¿a quién le puedo pedir trabajo?». Las columnas no se parecen —oficio
	y antigüedad contra nivel, clase de misión y si te atiende— y los filtros
	tampoco. Un interruptor adentro de una sola tabla sería dos tablas peleando por
	un archivo.

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
	import Identicon from './Identicon.svelte';
	import { page } from '$app/state';
	import { hrefFicha } from '$lib/fichas';
	import type { Miembros } from '$lib/tipos';

	interface Props {
		miembros: Miembros;
		/** La URL con unos parámetros cambiados, conservando lo demás. */
		hrefFor: (cambios: Record<string, string>) => string;
		/** Lo que el formulario tiene que arrastrar para no perder dónde estaba. */
		hidden?: Readonly<Record<string, string>>;
		/**
		 * El prefijo de los campos del formulario.
		 *
		 * Vacío en una pantalla y con prefijo en la ventana de una ficha: abajo de la
		 * ventana hay otra pantalla con sus propios `buscar` y `pagina`, y sin esto
		 * el buscador de la ficha filtraría la tabla de atrás. Los enlaces ya lo
		 * resuelven por su cuenta —`hrefFor` los arma—; esto es para lo que manda el
		 * formulario, que viaja por su cuenta.
		 */
		prefix?: string;
	}

	let { miembros, hrefFor, hidden = {}, prefix = '' }: Props = $props();

	let consulta = $derived(miembros.query);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'distintivo', label: 'Piloto', width: '14rem' },
		{ key: 'oficio', label: 'Oficio', width: '9rem' },
		{ key: 'bandera', label: 'Bandera', width: '9rem', from: 'md' },
		{ key: 'antiguedad', label: 'Desde', width: '8rem', class: 'text-right' }
	];

	let opcionesOficio = $derived([{ value: '', label: 'Todos' }, ...miembros.professions]);

	/** Ordena por esa columna, y la segunda vez al revés. */
	function ordenPor(columna: string): string {
		const mismo = consulta.sort === columna;
		return hrefFor({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	let hayFiltro = $derived(Boolean(consulta.search || consulta.profession));

	/** La fecha, escrita por el navegador: el servidor manda el instante en UTC. */
	const fecha = (ms: number) =>
		new Date(ms).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
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
			placeholder="Distintivo"
		/>
	</div>

	<!--
		El filtro que va a importar el día que se armen operaciones: hacen falta tres
		mineros y un escolta, y eso no se contesta leyendo mil nombres.
	-->
	<div class="w-full min-w-0 xs:w-[10rem]">
		<SelectField
			label="Oficio"
			name="{prefix}oficio"
			size="1"
			onchange={alCambiar}
			value={consulta.profession}
			options={opcionesOficio}
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
		<HudLink href={hrefFor({ buscar: '', oficio: '' })} size="1" variant="outline">
			<Icon name="x" weight="bold" size="0.7rem" />
			Quitar filtros
		</HudLink>
	{/if}

	<div class="grow"></div>

	<span class="font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
		{#if hayFiltro}
			{miembros.found} de {miembros.total}
		{:else}
			{miembros.count}
		{/if}
	</span>
</form>

<HudTable
	columns={COLUMNAS}
	minWidth="38rem"
	sort={consulta.sort}
	dir={consulta.dir}
	sortHref={ordenPor}
	class="mt-3"
>
	{#each miembros.members as uno (uno.callsign)}
		<tr
			class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover
				{uno.isYou ? 'bg-surface' : ''}"
		>
			<td class="py-[0.45rem] pr-3">
				<span class="flex min-w-0 items-center gap-2">
					<Identicon
						name={uno.callsign}
						family="piloto"
						size="1.6rem"
						title="Sello de {uno.callsign}"
					/>
					<!--
						El distintivo abre su ficha, acá y en cualquier otra lista: la ventana
						vive en el armazón del juego, así que no hace falta que quien use esta
						tabla sepa nada de fichas.
					-->
					<a
						href={hrefFicha(page.url, 'piloto', uno.callsign)}
						class="truncate font-display text-[0.8rem] font-bold tracking-display
							text-text-strong uppercase no-underline hover:text-accent-bright"
					>
						{uno.callsign}
					</a>
					{#if uno.isYou}
						<!-- La fila propia se encuentra sin leer: es la que uno busca primero. -->
						<span class="flex shrink-0" title="Sos vos">
							<Icon name="crosshair" weight="bold" size="0.7rem" class="text-accent" />
						</span>
					{/if}
				</span>
			</td>
			<td class="py-[0.45rem] pr-3 text-1 text-text-body">{uno.profession}</td>
			<td class="hidden py-[0.45rem] pr-3 text-1 text-text-muted md:table-cell">
				{uno.faction}
			</td>
			<td class="py-[0.45rem] text-right font-mono text-[0.72rem] whitespace-nowrap text-data">
				{fecha(uno.since)}
			</td>
		</tr>
	{/each}
</HudTable>

{#if miembros.found === 0}
	<p class="w-full pt-3 text-1 text-text-muted">
		Ningún piloto de la corporación coincide con ese recorte.
	</p>
{/if}

<Paginator
	page={consulta.page}
	pages={miembros.pages}
	href={(n) => hrefFor({ pagina: String(n) })}
	class="mt-3"
/>
