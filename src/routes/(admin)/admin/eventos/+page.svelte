<!--
	El registro de eventos: qué pasó en el juego, quién lo hizo y cuándo.

	Arriba, **la figura de la pantalla**: la traza de actividad del último mes. Un
	registro es una lista larguísima de cosas iguales, y la pregunta con la que uno
	lo abre casi nunca es "¿qué pasó?" sino "¿cuándo pasó algo?". La traza contesta
	eso por su forma —un mes tranquilo es una línea baja, una tarde de trabajo es
	un pico— y además es el filtro: se toca la barra y la tabla salta a ese día.

	Debajo, la lista con las cifras exactas, que es la regla de toda figura de
	Vaxav: el dibujo dice bien *cuál* y mal *cuánto*.

	Va **en tabla**, igual que la billetera y por lo mismo: lo que se hace acá es
	recorrer una columna —quién, cuándo, de qué tipo— y con cada evento dibujado
	como una ficha suelta esa lectura vertical no existe. En pantalla angosta las
	columnas accesorias se esconden y la tabla se desplaza dentro de su contenedor.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import EventTrace from '$lib/components/admin/EventTrace.svelte';
	import { TONE_COLOR } from '$lib/components/admin/tonos';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import type { PageProps } from './$types';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';

	let { data }: PageProps = $props();

	let registro = $derived(data.registro);
	let filtrando = $derived(
		Boolean(
			registro.filters.category ||
			registro.filters.kind ||
			registro.filters.day ||
			registro.filters.actor
		)
	);

	/**
	 * La URL de un estado del filtro.
	 *
	 * Parte del que está puesto y cambia lo que se le pide, así que elegir un día
	 * no borra la categoría ni al revés. **Cambiar cualquier filtro vuelve a la
	 * página 1**: quedarse en la siete de un resultado que ahora tiene dos páginas
	 * es la forma más rápida de que una pantalla parezca vacía sin estarlo.
	 */
	function enlace(
		cambio: Partial<{
			category: string;
			kind: string;
			day: string;
			actor: number | null;
			page: number;
		}>
	) {
		const estado = { ...registro.filters, page: 1, ...cambio };
		const partes: string[] = [];

		if (estado.category) partes.push(`categoria=${estado.category}`);
		// Un tipo sólo tiene sentido dentro de su categoría: al cambiar de
		// categoría, el que estaba puesto se cae solo.
		if (estado.kind && cambio.category === undefined) partes.push(`tipo=${estado.kind}`);
		if (estado.day) partes.push(`dia=${estado.day}`);
		if (estado.actor) partes.push(`quien=${estado.actor}`);
		if (estado.page > 1) partes.push(`pagina=${estado.page}`);

		// A mano y no con `URLSearchParams`: los valores salen de catálogos del
		// propio código —códigos, una fecha, un número— así que no hay nada que
		// escapar, y el objeto mutable no tiene lugar dentro de un componente.
		return partes.length > 0 ? `?${partes.join('&')}` : '?';
	}

	/** La fecha en la hora de quien mira, en 24 horas como el reloj del HUD. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	/** El día elegido, escrito como se lee. */
	function diaLargo(day: string): string {
		const [ano, mes, dia] = day.split('-');
		return `${dia}/${mes}/${ano}`;
	}

	/** Las columnas del registro. */
	const COLUMNAS: Columna[] = [
		// Los anchos van declarados: la fecha y el actor tienen que caer siempre en el
		// mismo lugar para poder recorrerlos de un vistazo, y con anchos automáticos se
		// corren según qué diga el renglón más largo.
		{ label: 'Fecha', width: '7.5rem' },
		// 12rem es lo que mide «Cambio de contraseña», que es el título más largo.
		{ label: 'Qué', width: '12rem' },
		{ label: 'Detalle' },
		{ label: 'Quién', width: '9rem', from: 'md' }
	];
</script>

<svelte:head><title>Registro · Cuartel general · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Cuartel general</Eyebrow>
	<DisplayTitle>Registro</DisplayTitle>
</div>

<TitledPanel title="Actividad" detail="últimos 30 días" class="w-full">
	<EventTrace
		days={registro.days}
		selected={registro.filters.day}
		href={(day) => enlace({ day })}
	/>
</TitledPanel>

<!--
	Los filtros son enlaces y no un formulario: cada combinación es una URL, así
	que se comparte, se recarga y se vuelve con el botón de atrás. Y sin JavaScript
	funcionan igual, que en una herramienta de administración no es un lujo.
-->
<div class="flex w-full flex-col gap-3">
	<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
		<Label>Categoría</Label>
		<div class="flex flex-wrap items-center gap-1">
			{#each registro.categories as opcion (opcion.value)}
				{@const activa = registro.filters.category === opcion.value}
				<a href={enlace({ category: opcion.value })} class="chip" class:activo={activa}>
					{opcion.label}
				</a>
			{/each}
		</div>
	</div>

	{#if registro.kinds.length > 0}
		<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
			<Label>Tipo</Label>
			<div class="flex flex-wrap items-center gap-1">
				{#each registro.kinds as opcion (opcion.value)}
					{@const activa = registro.filters.kind === opcion.value}
					<a href={enlace({ kind: opcion.value })} class="chip" class:activo={activa}>
						{opcion.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!--
		Los filtros puestos que no son un chip de arriba —el día, que se elige en la
		traza, y el actor, que se elige tocando un nombre de la tabla— se muestran
		acá con su propia cruz. Sin esto, un filtro elegido en otro lado quedaría
		puesto sin que nada lo diga.
	-->
	{#if filtrando}
		<div class="flex w-full flex-wrap items-center gap-2">
			{#if registro.filters.day}
				<a href={enlace({ day: '' })} class="chip activo">
					<Icon name="clock" weight="fill" size="0.65rem" />
					{diaLargo(registro.filters.day)}
					<Icon name="x" weight="bold" size="0.55rem" />
				</a>
			{/if}
			{#if registro.filters.actor}
				<a href={enlace({ actor: null })} class="chip activo">
					<Icon name="identification-badge" weight="fill" size="0.65rem" />
					{registro.filters.actorName}
					<Icon name="x" weight="bold" size="0.55rem" />
				</a>
			{/if}
			<a href="?" class="chip">
				<Icon name="x" weight="bold" size="0.6rem" />
				Quitar filtros
			</a>
		</div>
	{/if}
</div>

{#if registro.rows.length === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>{filtrando ? 'Nada con esos filtros' : 'Todavía no pasó nada'}</CardTitle>
			<BodyText>
				{#if filtrando}
					Probá con otra categoría, otro día, o quitá los filtros para ver el registro entero.
				{:else}
					Acá se va a ir anotando lo que ocurra: altas y bajas de cuenta, cambios de contraseña y
					cada rol que se reparta. El registro no se edita ni se borra.
				{/if}
			</BodyText>
		</div>
	</Panel>
{:else}
	<TitledPanel
		title="Eventos"
		detail={registro.total === 1 ? '1 evento' : `${registro.total} eventos`}
		class="w-full"
	>
		<HudTable columns={COLUMNAS} minWidth="40rem">
			{#each registro.rows as evento (evento.id)}
				<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
					<td class="py-[0.45rem] pr-3 font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
						{fecha(evento.at)}
					</td>
					<td class="py-[0.45rem] pr-3">
						<div class="flex min-w-0 items-center gap-2">
							<Icon
								name={evento.icon}
								weight="duotone"
								size="0.9rem"
								class="shrink-0 {TONE_COLOR[evento.tone]}"
							/>
							<span
								class="truncate font-display text-[0.76rem] font-bold tracking-display
										text-text-strong uppercase"
							>
								{evento.label}
							</span>
						</div>
					</td>
					<td class="py-[0.45rem] pr-3 text-1 text-text-body">
						<span class="line-clamp-2">{evento.text}</span>
						<!--
								En pantalla angosta la columna "Quién" no está, y quién lo hizo
								es justo lo que no se puede perder en un registro. Baja acá.
							-->
						<span class="mt-[0.15rem] block font-mono text-[0.65rem] text-text-muted md:hidden">
							{evento.actor || 'el sistema'}
						</span>
					</td>
					<!--
							El nombre es un enlace que filtra por él. En un registro, la
							pregunta que sigue a "¿quién hizo esto?" es casi siempre "¿y qué
							más hizo?", y tenerla a un click evita armar la URL a mano.
						-->
					<td
						class="hidden py-[0.45rem] pr-3 font-mono text-[0.75rem] whitespace-nowrap md:table-cell"
					>
						{#if evento.actorId}
							<a
								href={enlace({ actor: evento.actorId })}
								title="Ver todo lo que hizo {evento.actor || 'este piloto'}"
								class="text-text-body no-underline hover:text-accent-bright hover:underline"
							>
								{evento.actor || `#${evento.actorId}`}
							</a>
						{:else}
							<span class="text-text-muted italic">el sistema</span>
						{/if}
					</td>
				</tr>
			{/each}
		</HudTable>

		<Paginator
			page={registro.page}
			pages={registro.pages}
			href={(pagina) => enlace({ page: pagina })}
			class="mt-4"
		/>
	</TitledPanel>
{/if}

<style>
	/*
	 * El control chico del HUD: contorno fino, mayúsculas espaciadas, y lo
	 * seleccionado se llena de naranja con el texto casi negro, como en todo Vaxav.
	 */
	.chip {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--color-border-soft);
		padding: 0.2rem 0.55rem;
		font-family: var(--font-display);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		color: var(--color-accent-bright);
		transition:
			background-color var(--default-transition-duration) var(--ease-hud),
			color var(--default-transition-duration) var(--ease-hud);
	}

	.chip:hover {
		background-color: var(--color-surface-hover);
	}

	.chip.activo {
		border-color: var(--color-accent-bright);
		background-color: var(--color-accent);
		color: var(--color-on-accent);
		box-shadow: var(--shadow-glow);
	}
</style>
