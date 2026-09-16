<!--
	Los pilotos: quiénes son y cuál tiene algo encima.

	La búsqueda mira **distintivo y correo** porque es lo que uno tiene a mano
	cuando llega un reclamo, y no siempre viene con el mismo de los dos.

	**Los que no pueden entrar se cuentan aparte y se encienden.** Es el único dato
	de la tabla que pide una decisión: una cuenta con la puerta cerrada es alguien
	esperando una respuesta.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import SuccessCallout from '$lib/components/forms/SuccessCallout.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import { ADMIN_ROUTE } from '$lib/admin';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let pilotos = $derived(data.pilotos);

	/** Los cuatro estados, con el que está puesto. */
	const ESTADOS = [
		{ value: '', label: 'Todos' },
		{ value: 'blocked', label: 'Sin acceso' },
		{ value: 'sanctioned', label: 'Con sanciones' },
		{ value: 'clean', label: 'Sin sanciones' }
	];

	/**
	 * La URL de un estado del filtro.
	 *
	 * Cambiar cualquier filtro vuelve a la página 1: quedarse en la siete de un
	 * resultado que ahora tiene dos es la forma más rápida de que una pantalla
	 * parezca vacía sin estarlo.
	 */
	function enlace(cambio: Partial<{ search: string; state: string; page: number }>) {
		const estado = {
			search: pilotos.search,
			state: pilotos.state,
			page: 1,
			...cambio
		};
		const partes: string[] = [];

		if (estado.search) partes.push(`buscar=${encodeURIComponent(estado.search)}`);
		if (estado.state) partes.push(`estado=${estado.state}`);
		if (estado.page > 1) partes.push(`pagina=${estado.page}`);

		return partes.length > 0 ? `?${partes.join('&')}` : '?';
	}

	/** La fecha de alta, corta: en una tabla el año alcanza. */
	function fecha(at: number): string {
		return new Date(at).toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit'
		});
	}
</script>

<svelte:head><title>Pilotos · Cuartel general · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Cuartel general</Eyebrow>
	<DisplayTitle>Pilotos</DisplayTitle>
</div>

<SuccessCallout message={data.aviso} />

<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Cuentas</Label>
		<span class="font-mono text-3 text-text-body">{pilotos.total}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Sin acceso</Label>
		<span class="font-mono text-3 {pilotos.blocked > 0 ? 'text-danger' : 'text-text-muted'}">
			{pilotos.blocked}
		</span>
	</div>
</div>

<!--
	La búsqueda es un formulario y los estados son enlaces. No es una
	inconsistencia: escribir necesita un envío, y elegir entre cuatro opciones no.
-->
<div class="flex w-full flex-col gap-3">
	<form method="GET" class="flex w-full flex-wrap items-center gap-2">
		{#if pilotos.state}
			<input type="hidden" name="estado" value={pilotos.state} />
		{/if}
		<div class="flex min-w-[14rem] flex-1 items-center gap-2">
			<Icon name="magnifying-glass" weight="bold" size="0.85rem" class="shrink-0 text-accent-dim" />
			<input
				name="buscar"
				value={pilotos.search}
				placeholder="Distintivo o correo"
				class="h-[2.15rem] w-full border border-border-soft bg-field px-[11px] font-body
					text-[0.85rem] text-text-strong focus:border-accent focus:shadow-glow focus:outline-none"
			/>
		</div>
		<HudButton type="submit">Buscar</HudButton>
		{#if pilotos.search}
			<a href={enlace({ search: '' })} class="chip">
				<Icon name="x" weight="bold" size="0.6rem" />
				Limpiar
			</a>
		{/if}
	</form>

	<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
		<Label>Estado</Label>
		<div class="flex flex-wrap items-center gap-1">
			{#each ESTADOS as opcion (opcion.value)}
				<a
					href={enlace({ state: opcion.value })}
					class="chip"
					class:activo={pilotos.state === opcion.value}
				>
					{opcion.label}
				</a>
			{/each}
		</div>
	</div>
</div>

{#if pilotos.rows.length === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>Ningún piloto con esos filtros</CardTitle>
			<BodyText>
				Probá con otro texto o quitá el estado. La búsqueda mira el distintivo y el correo.
			</BodyText>
		</div>
	</Panel>
{:else}
	<TitledPanel
		title="Cuentas"
		detail={pilotos.total === 1 ? '1 piloto' : `${pilotos.total} pilotos`}
		class="w-full"
	>
		<div class="w-full overflow-x-auto">
			<table
				class="w-full min-w-[48rem] table-fixed border-collapse text-left
					[&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
			>
				<colgroup>
					<col class="w-[12rem]" />
					<col class="hidden lg:table-column lg:w-[13rem]" />
					<col class="w-[9rem]" />
					<col class="hidden md:table-column md:w-[10rem]" />
					<col class="w-[8rem]" />
					<col class="w-[7rem]" />
				</colgroup>
				<thead class="sticky top-0 z-10 bg-well">
					<tr class="border-b border-border-soft">
						{#each [{ label: 'Piloto', class: '' }, { label: 'Correo', class: 'hidden lg:table-cell' }, { label: 'Facción', class: '' }, { label: 'Dónde está', class: 'hidden md:table-cell' }, { label: 'Créditos', class: 'text-right' }, { label: 'Estado', class: 'text-right' }] as columna (columna.label)}
							<th
								class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase
									{columna.class}"
							>
								{columna.label}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each pilotos.rows as fila (fila.id)}
						<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
							<td class="py-[0.45rem] pr-3">
								<a
									href="{ADMIN_ROUTE}/pilotos/{fila.id}"
									class="flex min-w-0 flex-col gap-[0.1rem] no-underline"
								>
									<span class="flex min-w-0 items-center gap-2">
										<span
											class="truncate font-display text-[0.8rem] font-bold tracking-display
												text-text-strong uppercase hover:text-accent-bright"
										>
											{fila.callsign}
										</span>
										{#if fila.roles.length > 0}
											<span class="flex shrink-0" title={fila.roles.join(' · ')}>
												<Icon
													name="shield-chevron"
													weight="fill"
													size="0.7rem"
													class="text-accent-dim"
												/>
											</span>
										{/if}
									</span>
									<span class="font-mono text-[0.62rem] text-text-muted">
										{fila.profession} · desde {fecha(fila.createdAt)}
									</span>
								</a>
							</td>
							<td class="hidden py-[0.45rem] pr-3 text-1 text-text-muted lg:table-cell">
								<span class="truncate">{fila.email}</span>
							</td>
							<td class="py-[0.45rem] pr-3 text-1 text-text-body">{fila.faction}</td>
							<td class="hidden py-[0.45rem] pr-3 text-1 text-text-muted md:table-cell">
								<span class="truncate">{fila.location}</span>
							</td>
							<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.78rem] text-data">
								{fila.credits}
							</td>
							<td class="py-[0.45rem] text-right">
								{#if fila.blocked}
									<span
										class="inline-flex items-center gap-1 border border-danger px-[0.35rem]
											py-[0.1rem] text-danger"
									>
										<Icon name="warning" weight="fill" size="0.6rem" />
										<span class="font-display text-[0.6rem] tracking-label uppercase">
											{fila.blocked}
										</span>
									</span>
								{:else if fila.sanctions > 0}
									<span class="font-mono text-[0.7rem] text-warning">
										{fila.sanctions} sanción{fila.sanctions === 1 ? '' : 'es'}
									</span>
								{:else}
									<span class="font-mono text-[0.7rem] text-text-muted">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Paginator
			page={pilotos.page}
			pages={pilotos.pages}
			href={(pagina) => enlace({ page: pagina })}
			class="mt-4"
		/>
	</TitledPanel>
{/if}

<style>
	/*
	 * El mismo control chico del HUD que usa el registro: contorno fino, mayúsculas
	 * espaciadas, y lo seleccionado se llena de naranja con el texto casi negro.
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
