<!--
	La ficha de una corporación, en una ventana: el «mirar quién es» del juego.

	**Es una ventana y no una pantalla**, y esa es toda la decisión. Puesta en el
	módulo Corporación —con el Neocom marcando «Corporación» y las pestañas de uno
	al lado— una corporación ajena se lee como si fuera la tuya. Acá se abre encima
	de donde estabas, se mira y se cierra, que es lo que uno quiere cuando aprieta
	un nombre que apareció en una lista.

	**Trae la ficha al abrirse y no antes.** El panorama del piloto lista cuarenta:
	cargarlas todas por si acaso sería cuarenta consultas para mirar una. Y la
	guarda mientras la ventana viva, así volver a la misma no vuelve a pedirla.

	Muestra lo que hace falta para decidir si trabajar con ellos —qué son, de quién
	son, dónde tienen puestos, qué piensan de vos— y no todo lo que la ficha propia
	muestra: para eso está la pantalla, que además tiene las pestañas.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import Modal from '../ui/Modal.svelte';
	import SegmentBar from '../meters/SegmentBar.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import Label from '../typography/Label.svelte';
	import Identicon from './Identicon.svelte';
	import type { Corporacion } from '$lib/tipos';

	interface Props {
		/** Cuál se está mirando. Vacío quiere decir que la ventana está cerrada. */
		code: string;
	}

	let { code = $bindable('') }: Props = $props();

	/** Lo que ya se trajo, por código: volver a la misma no vuelve a pedirla. */
	let vistas = $state<Record<string, Corporacion>>({});
	let cargando = $state(false);
	let fallo = $state('');

	let ficha = $derived(code ? (vistas[code] ?? null) : null);

	$effect(() => {
		if (!code || vistas[code] || cargando) return;

		cargando = true;
		fallo = '';
		fetch(`/fichas/corporacion?code=${encodeURIComponent(code)}`)
			.then((respuesta) => {
				if (!respuesta.ok) throw new Error('No se pudo abrir la ficha.');
				return respuesta.json();
			})
			.then((datos: Corporacion) => {
				vistas = { ...vistas, [datos.code]: datos };
			})
			.catch(() => {
				fallo = 'No se pudo abrir la ficha. Probá de nuevo.';
			})
			.finally(() => {
				cargando = false;
			});
	});

	/**
	 * Si la ventana está abierta.
	 *
	 * El código es la verdad —quien abre la ficha pone un código— y la ventana lo
	 * sigue; al cerrarse por Escape o por la cruz, suelta el código para que el de
	 * afuera se entere. Son dos estados y no uno porque el `<dialog>` del navegador
	 * decide por su cuenta cuándo se cierra, y esto lo escucha.
	 */
	let abierta = $state(false);

	$effect(() => {
		if (code) abierta = true;
	});

	$effect(() => {
		if (!abierta) code = '';
	});
</script>

<Modal
	bind:open={abierta}
	title={ficha?.name ?? 'Corporación'}
	detail={ficha?.kind ?? ''}
	icon="share-network"
	size="lg"
>
	{#if cargando && !ficha}
		<p class="w-full py-6 text-center text-1 text-text-muted">Buscando…</p>
	{:else if fallo}
		<p class="w-full py-6 text-center text-1 text-danger">{fallo}</p>
	{:else if ficha}
		<div class="flex w-full flex-col gap-5">
			<div class="flex w-full flex-col items-start gap-4 sm:flex-row">
				<Identicon
					name={ficha.name}
					family="corporacion"
					size="5rem"
					title="Sello de {ficha.name}"
					class="shrink-0"
				/>

				<div class="flex min-w-0 grow flex-col gap-3">
					<div class="grid w-full grid-cols-2 gap-3">
						<span class="flex flex-col items-start gap-[0.1rem]">
							<Label>Rubro</Label>
							<span class="truncate text-1 text-text-body">{ficha.kind}</span>
						</span>
						<span class="flex flex-col items-start gap-[0.1rem]">
							<Label>Clase</Label>
							<span class="truncate text-1 text-text-body">{ficha.origin}</span>
						</span>
						<span class="flex flex-col items-start gap-[0.1rem]">
							<Label>Responde a</Label>
							<span class="truncate text-1 text-text-body">{ficha.faction}</span>
						</span>
						<span class="flex flex-col items-start gap-[0.1rem]">
							<Label>Pilotos</Label>
							<span class="truncate font-mono text-[0.78rem] text-data">{ficha.members}</span>
						</span>
					</div>

					{#if ficha.reputation}
						<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-3">
							<Label>Reputación</Label>
							<SegmentBar
								filled={ficha.reputation.reached}
								total={ficha.reputation.tiers}
								class="w-20"
							/>
							<span class="font-display text-1 tracking-display text-accent-bright uppercase">
								{ficha.reputation.tier}
							</span>
							<span class="font-mono text-[0.72rem] text-data">{ficha.reputation.value}</span>
						</div>
					{/if}
				</div>
			</div>

			{#if ficha.description}
				<BodyText>{ficha.description}</BodyText>
			{/if}

			<!--
				Dónde tiene puestos, que es lo primero que se pregunta de una ajena. Las
				que no entran se cuentan: verlas todas es el mapa, que para eso recorta
				por corporación.
			-->
			{#if ficha.stations.length > 0}
				<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-4">
					<Label>Dónde opera · {ficha.stationCount}</Label>
					{#each ficha.stations as puesto (puesto.code)}
						<span class="flex min-w-0 items-baseline gap-2">
							<Icon name="buildings" weight="bold" size="0.7rem" class="shrink-0 text-accent" />
							<span class="truncate text-1 text-text-body">{puesto.name}</span>
							<a
								href="/navegacion/galaxia?sistema={puesto.systemCode}"
								class="truncate text-[0.7rem] text-text-muted no-underline hover:text-accent-bright"
							>
								{puesto.system}
							</a>
						</span>
					{/each}
					{#if ficha.moreStations > 0}
						<span class="pl-[1.2rem] text-[0.7rem] text-text-muted">
							y {ficha.moreStations} más
						</span>
					{/if}
				</div>
			{/if}

			<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
				<!--
					**Alistarse, sólo si estás libre.** Con corporación propia el botón ni
					se dibuja: no es que no se pueda apretar, es que primero hay que
					renunciar, y un botón que existe para explicar eso molesta más de lo
					que ayuda.
				-->
				{#if !ficha.mine && ficha.canJoin !== null}
					{#if ficha.joinBlocked}
						<span class="text-[0.7rem] text-text-muted">{ficha.joinBlocked}</span>
					{/if}
					<form method="POST" action="/corporacion?/unirse">
						<input type="hidden" name="corporacion" value={ficha.code} />
						<HudButton
							type="submit"
							variant="primary"
							size="1"
							disabled={!ficha.canJoin}
							title={ficha.joinBlocked || undefined}
						>
							<Icon name="handshake" weight="bold" size="0.7rem" />
							Alistarse
						</HudButton>
					</form>
				{/if}

				{#if ficha.mine}
					<Label>Respondés a ella</Label>
				{/if}

				<div class="grow"></div>

				<HudLink href="/navegacion/galaxia?corporacion={ficha.code}" variant="outline" size="1">
					<Icon name="map-trifold" weight="bold" size="0.7rem" />
					Verla en el mapa
				</HudLink>
			</div>
		</div>
	{/if}
</Modal>
