<!--
	La ventana de una ficha: el «ver quién es» del juego.

	**Vive en el armazón y no en una pantalla.** Se dibuja una vez, encima de
	todo, y por eso cualquier nombre de cualquier lista puede abrirla: una ventana
	que sólo se puede abrir desde algunas pantallas es media función.

	**Tiene lo mismo que el módulo**, sección por sección, y con las mismas piezas:
	la tabla de agentes y la de miembros son literalmente las de las pestañas. Una
	ficha ajena que muestre menos que la propia obliga a preguntarse qué falta.

	Su estado vive en la URL —cuál está abierta, qué sección, por dónde va su
	listado—, así que se comparte por mensaje, se cierra con el botón de atrás y se
	recarga sin perderla. Los parámetros llevan prefijo porque **abajo hay una
	pantalla** con sus propios `buscar` y `pagina`: sin él, el buscador de la
	ventana filtraría la tabla de atrás.

	Cerrar es sacar el parámetro, y por eso es un enlace y no un botón: el navegador
	ya sabe volver.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import Modal from '../ui/Modal.svelte';
	import PanelTabs, { type Solapa } from '../ui/PanelTabs.svelte';
	import SegmentBar from '../meters/SegmentBar.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import Label from '../typography/Label.svelte';
	import AgentList from './AgentList.svelte';
	import Identicon from './Identicon.svelte';
	import MemberList from './MemberList.svelte';
	import ReputationLadder from './ReputationLadder.svelte';
	import { CORPORATION_SECTIONS, FICHA_PARAM, FICHA_PREFIX } from '$lib/fichas';
	import type { Ficha } from '$lib/tipos';

	interface Props {
		ficha: Ficha | null;
	}

	let { ficha }: Props = $props();

	/**
	 * La URL con unos parámetros de la ventana cambiados.
	 *
	 * Todo lo de la ventana lleva prefijo, así que lo de la pantalla de abajo queda
	 * intacto: se puede filtrar la tabla de la ficha sin perder en qué página
	 * estaba la lista que hay detrás.
	 */
	function conParametro(cambios: Record<string, string>): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const [clave, valor] of Object.entries(cambios)) {
			const propio = `${FICHA_PREFIX}${clave}`;
			if (valor) params.set(propio, valor);
			else params.delete(propio);
		}
		// Cambiar cualquier cosa vuelve a la primera página de la ventana.
		if (!('pagina' in cambios)) params.delete(`${FICHA_PREFIX}pagina`);
		return `${page.url.pathname}?${params.toString()}`;
	}

	/** Cambiar de sección limpia el recorte de la anterior: son otras columnas. */
	function aSeccion(code: string): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const clave of [...params.keys()]) {
			if (clave.startsWith(FICHA_PREFIX)) params.delete(clave);
		}
		params.set(`${FICHA_PREFIX}seccion`, code);
		return `${page.url.pathname}?${params.toString()}`;
	}

	/** Cerrar la ventana es sacar todo lo suyo de la URL. */
	function cerrada(): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.delete(FICHA_PARAM);
		for (const clave of [...params.keys()]) {
			if (clave.startsWith(FICHA_PREFIX)) params.delete(clave);
		}
		const texto = params.toString();
		return texto ? `${page.url.pathname}?${texto}` : page.url.pathname;
	}

	/**
	 * Lo que el formulario de una lista tiene que arrastrar.
	 *
	 * Un `GET` manda sólo lo que tiene adentro, así que sin esto filtrar cerraría
	 * la ventana y perdería la pantalla de abajo.
	 */
	let escondidos = $derived.by(() => {
		const campos: Record<string, string> = {};
		for (const [clave, valor] of page.url.searchParams) {
			if (!clave.startsWith(FICHA_PREFIX) && clave !== FICHA_PARAM) campos[clave] = valor;
		}
		campos[FICHA_PARAM] = page.url.searchParams.get(FICHA_PARAM) ?? '';
		campos[`${FICHA_PREFIX}seccion`] = ficha?.section ?? '';
		return campos;
	});

	let solapas = $derived<Solapa[]>(
		CORPORATION_SECTIONS.map((una) => ({
			code: una.code,
			label: una.label,
			href: aSeccion(una.code)
		}))
	);

	/**
	 * La ventana está abierta mientras la URL pida una ficha.
	 *
	 * Derivado y escribible: lo calcula la URL, y la ventana puede cerrarse sola
	 * —Escape, la cruz, el clic afuera— sin que eso sea la verdad. La verdad es la
	 * URL: al cerrarse se navega a la de al lado sin la ficha, el dato deja de
	 * venir y el derivado vuelve a decir que no hay nada abierto.
	 */
	let abierta = $derived(ficha !== null);

	$effect(() => {
		if (!abierta && ficha) goto(cerrada(), { noScroll: true, keepFocus: true });
	});
</script>

{#if ficha}
	<Modal
		bind:open={abierta}
		title={ficha.title}
		detail={ficha.subtitle}
		icon="share-network"
		size="lg"
	>
		<div class="flex w-full flex-col gap-4">
			<PanelTabs tabs={solapas} active={ficha.section} />

			{#if ficha.section === 'info' && ficha.corporation}
				{@const corp = ficha.corporation}
				<div class="flex w-full flex-col items-start gap-4 sm:flex-row">
					<Identicon
						name={corp.name}
						family="corporacion"
						size="5rem"
						title="Sello de {corp.name}"
						class="shrink-0"
					/>

					<div class="flex min-w-0 grow flex-col gap-3">
						<div class="grid w-full grid-cols-2 gap-3">
							<span class="flex flex-col items-start gap-[0.1rem]">
								<Label>Rubro</Label>
								<span class="truncate text-1 text-text-body">{corp.kind}</span>
							</span>
							<span class="flex flex-col items-start gap-[0.1rem]">
								<Label>Clase</Label>
								<span class="truncate text-1 text-text-body">{corp.origin}</span>
							</span>
							<span class="flex flex-col items-start gap-[0.1rem]">
								<Label>Responde a</Label>
								<span class="truncate text-1 text-text-body">{corp.faction}</span>
							</span>
							<span class="flex flex-col items-start gap-[0.1rem]">
								<Label>Pilotos</Label>
								<span class="truncate font-mono text-[0.78rem] text-data">{corp.members}</span>
							</span>
						</div>

						{#if corp.reputation}
							<div
								class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-3"
							>
								<Label>Reputación</Label>
								<SegmentBar
									filled={corp.reputation.reached}
									total={corp.reputation.tiers}
									class="w-20"
								/>
								<span class="font-display text-1 tracking-display text-accent-bright uppercase">
									{corp.reputation.tier}
								</span>
								<span class="font-mono text-[0.72rem] text-data">{corp.reputation.value}</span>
							</div>
						{/if}
					</div>
				</div>

				{#if corp.description}
					<BodyText>{corp.description}</BodyText>
				{/if}

				<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
					<!--
						**Alistarse, sólo si estás libre.** Con corporación propia el botón ni
						se dibuja: no es que no se pueda apretar, es que primero hay que
						renunciar, y un botón que existe para explicar eso molesta más de lo
						que ayuda.
					-->
					{#if !corp.mine && corp.canJoin !== null}
						{#if corp.joinBlocked}
							<span class="text-[0.7rem] text-text-muted">{corp.joinBlocked}</span>
						{/if}
						<form method="POST" action="/corporacion?/unirse">
							<input type="hidden" name="corporacion" value={corp.code} />
							<HudButton
								type="submit"
								variant="primary"
								size="1"
								disabled={!corp.canJoin}
								title={corp.joinBlocked || undefined}
							>
								<Icon name="handshake" weight="bold" size="0.7rem" />
								Alistarse
							</HudButton>
						</form>
					{/if}

					{#if corp.mine}
						<Label>Respondés a ella</Label>
					{/if}

					<div class="grow"></div>

					<HudLink href="/navegacion/galaxia?corporacion={corp.code}" variant="outline" size="1">
						<Icon name="map-trifold" weight="bold" size="0.7rem" />
						Verla en el mapa
					</HudLink>
				</div>
			{:else if ficha.section === 'reputacion' && ficha.reputation}
				{@const rep = ficha.reputation}
				{#if rep.reputation}
					<div class="w-full">
						<ReputationLadder ladder={rep.reputation.ladder} percent={rep.reputation.percent} />
					</div>
					<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
						<Label>Escalón</Label>
						<span class="font-display text-1 tracking-display text-accent-bright uppercase">
							{rep.reputation.tier}
						</span>
						<span class="font-mono text-[0.78rem] text-data">{rep.reputation.value}</span>
						<div class="grow"></div>
						<Label>Abre agentes</Label>
						<span class="font-mono text-[0.78rem] text-text-body">{rep.reputation.level}</span>
					</div>
					{#if rep.total === 0}
						<p class="w-full text-1 text-text-muted">
							Todavía no pasó nada entre ustedes. Acá va a quedar cada movimiento, con lo que sumó y
							el número que dejó.
						</p>
					{:else}
						<p class="w-full text-1 text-text-muted">
							{rep.total === 1 ? '1 movimiento' : `${rep.total} movimientos`}. El libro entero está
							en la pestaña de tu corporación.
						</p>
					{/if}
				{/if}
			{:else if ficha.section === 'ubicaciones' && ficha.stations}
				<!--
					**Todas y no un puñado.** En la ficha propia se muestran cinco y se
					cuenta el resto porque ahí compiten con lo demás del panel; acá la
					sección es de ellas, así que no hay nada que recortar.
				-->
				{#if ficha.stations.length === 0}
					<p class="w-full text-1 text-text-muted">
						Ninguna. No todas las corporaciones tienen edificios: ésta es gente.
					</p>
				{:else}
					<div class="flex w-full flex-col gap-3">
						{#each ficha.stations as puesto (puesto.code)}
							<div
								class="flex w-full flex-col gap-[0.15rem] border-b border-border-soft/40 pb-2 last:border-0"
							>
								<span class="flex min-w-0 items-baseline gap-2">
									<Icon
										name="buildings"
										weight="bold"
										size="0.75rem"
										class="shrink-0 text-accent"
									/>
									<span
										class="truncate font-display text-[0.85rem] tracking-display text-text-strong"
									>
										{puesto.name}
									</span>
									<a
										href="/navegacion/galaxia?sistema={puesto.systemCode}"
										class="truncate text-[0.7rem] text-text-muted no-underline hover:text-accent-bright"
									>
										{puesto.system}
									</a>
								</span>
								{#if puesto.services.length > 0}
									<span class="pl-[1.45rem] text-[0.7rem] text-text-muted">
										{puesto.services.join(' · ')}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else if ficha.section === 'agentes' && ficha.agents}
				<AgentList
					agentes={ficha.agents}
					hrefFor={conParametro}
					hidden={escondidos}
					prefix={FICHA_PREFIX}
				/>
			{:else if ficha.section === 'miembros' && ficha.members}
				<MemberList
					miembros={ficha.members}
					hrefFor={conParametro}
					hidden={escondidos}
					prefix={FICHA_PREFIX}
				/>
			{/if}
		</div>
	</Modal>
{/if}
