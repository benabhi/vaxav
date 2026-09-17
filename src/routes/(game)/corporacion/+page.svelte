<!--
	Pestaña Corporación: a quién le rinde cuentas el piloto.

	**La figura de esta pantalla es el sello.** Una corporación se reconoce por su
	emblema antes que por su nombre, igual que una facción por su color, y el sello
	sale del nombre así que ninguna queda sin cara. Al lado van las cifras exactas,
	como manda la regla de las figuras: el dibujo dice *cuál* y la lista dice *qué*.

	Tres bloques y ninguno más, porque hoy no hay más: qué es, dónde está y qué
	piensa de vos. La billetera compartida, los roles y los contratos suman su
	bloque cuando existan; la pantalla no los anuncia antes.

	**Los rótulos de los paneles son sustantivos, no preguntas.** «Quién es» y
	«dónde se la encuentra» conversan, y la voz del juego informa. Ver «La voz» en
	docs/DESIGN.md.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import CorporationChoice from '$lib/components/game/CorporationChoice.svelte';
	import SealHint from '$lib/components/game/SealHint.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import FloatingPanel from '$lib/components/cards/FloatingPanel.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SuccessCallout from '$lib/components/forms/SuccessCallout.svelte';
	import SegmentBar from '$lib/components/meters/SegmentBar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { corporationsOf } from '$lib/game/corporations';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let corp = $derived(data.corporacion);

	/**
	 * Las que reciben a este piloto.
	 *
	 * Salen del catálogo y no del servidor: son datos puros que el navegador puede
	 * importar, igual que en el alta, así que pedírselos a un `load` sería un viaje
	 * para traer algo que ya está de este lado. Y son **las mismas** que ofrece el
	 * alta, porque el servicio valida con la misma regla.
	 */
	let opciones = $derived(corporationsOf(data.faction));

	/** La que está marcada antes de confirmar: alistarse de un solo clic, no. */
	let elegida = $state('');
	let renunciando = $state(false);
</script>

<svelte:head><title>Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Corporación</Eyebrow>
	<DisplayTitle>{corp.name}</DisplayTitle>
</div>

<ErrorCallout message={form?.error} />
<SuccessCallout message={form?.done} />

{#if !corp.belongs}
	<!--
		Sin corporación no se dibuja una ficha vacía: se dice qué significa estar
		afuera —es un estado legítimo, no un dato que falte— y se ofrece la salida.
		Un cartel que sólo explica por qué la pantalla está vacía sigue siendo una
		pantalla vacía, con mejor redacción.
	-->
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>{corp.description}</BodyText>
		</div>
	</Panel>

	<TitledPanel title="Corporaciones" detail="{opciones.length} de tu bandera" class="w-full">
		<form method="POST" action="?/unirse" use:enhance class="flex w-full flex-col gap-4">
			<div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each opciones as una (una.code)}
					<CorporationChoice
						corporation={una}
						selected={elegida === una.code}
						onChoose={() => (elegida = una.code)}
					/>
				{/each}
			</div>

			<input type="hidden" name="corporacion" value={elegida} />
			<div class="flex w-full flex-wrap items-center gap-3">
				<HudButton type="submit" variant="primary" disabled={!elegida}>Alistarme</HudButton>
				<span class="text-1 text-text-muted">
					Las NPC aceptan siempre. Se puede renunciar cuando quieras, y lo que hayas ganado con
					ellas no se pierde.
				</span>
			</div>
		</form>
	</TitledPanel>
{:else}
	<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
		<!--
			La ficha de identidad: el sello grande y, al lado, lo que el sello no puede
			decir. Una figura dice bien «cuál» y mal «cuánto».
		-->
		<div class="w-full min-w-0 lg:flex-[2_1_0]">
			<TitledPanel title="Información" detail={corp.members} class="w-full">
				<div class="flex w-full flex-col items-start gap-4 xs:flex-row">
					<div class="relative w-[8rem] shrink-0 self-center xs:self-start">
						<Identicon name={corp.name} size="100%" title="Sello de {corp.name}" />
						<SealHint />
					</div>

					<div class="flex min-w-0 grow flex-col gap-3">
						<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.35rem]">
							<Label>Rubro</Label>
							<span class="flex items-center gap-[0.4rem] text-1 text-text-body">
								<Icon name={corp.kindIcon} weight="bold" size="0.85rem" class="text-accent" />
								{corp.kind}
							</span>

							<Label>Clase</Label>
							<!--
								El «?» va pegado al valor y no al rótulo: lo que hay que explicar es
								«NPC», que es una palabra de afuera del juego, y no la palabra «clase».
							-->
							<span class="flex items-center gap-[0.35rem] text-1 text-text-body">
								{corp.origin}
								<Popover label="Qué quiere decir NPC">
									{#snippet trigger()}
										<Icon
											name="question"
											weight="bold"
											size="0.65rem"
											class="text-text-muted transition-colors hover:text-accent-bright"
										/>
									{/snippet}
									<FloatingPanel class="flex max-w-[20rem] flex-col gap-1 p-3">
										<span class="font-display text-1 tracking-label text-accent-dim uppercase">
											NPC o de jugadores
										</span>
										<BodyText>
											Las corporaciones NPC son parte del mundo: están desde siempre, operan las
											estaciones y reparten trabajo. Las de jugadores las funda y las maneja gente
											como vos, con sus propios roles, su billetera y sus bienes.
										</BodyText>
									</FloatingPanel>
								</Popover>
							</span>

							<Label>Responde a</Label>
							<span class="text-1 text-text-body">{corp.faction}</span>

							<Label>Pilotos</Label>
							<span class="font-mono text-1 text-data">{corp.members}</span>

							{#if corp.reputation}
								<!--
									Lo único de esta ficha que habla de vos. Va con el medidor de cinco
									bloques —uno por escalón— porque el título dice dónde estás y no
									cuánto falta; los dos juntos son una escalera.
								-->
								<Label>Reputación</Label>
								<span class="flex flex-wrap items-center gap-x-3 gap-y-1">
									<SegmentBar
										filled={corp.reputation.reached}
										total={corp.reputation.tiers}
										class="w-[5rem]"
									/>
									<span class="font-display text-1 tracking-display text-accent-bright uppercase">
										{corp.reputation.tier}
									</span>
									<span class="font-mono text-1 text-data">{corp.reputation.value}</span>
								</span>
							{/if}
						</div>

						<BodyText>{corp.description}</BodyText>

						{#if corp.reputation}
							<div
								class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-3"
							>
								{#if corp.reputation.next}
									<span class="text-[0.7rem] text-text-muted">{corp.reputation.next}</span>
								{/if}
								<div class="grow"></div>
								<HudLink href="/corporacion/reputacion" variant="outline" size="1">
									<Icon name="scales" weight="bold" size="0.7rem" />
									Ver la reputación
								</HudLink>
								<HudButton variant="ghost" size="1" onclick={() => (renunciando = true)}>
									Renunciar
								</HudButton>
							</div>
						{/if}
					</div>
				</div>
			</TitledPanel>
		</div>

		<!--
			Dónde está. Una corporación **puede no operar ninguna estación** y existir
			igual, sólo como gente: por eso los dos bloques van separados y cada uno dice
			qué pasa cuando está vacío.
		-->
		<div class="w-full min-w-0 lg:flex-[1_1_0]">
			<TitledPanel title="Ubicaciones" detail={corp.stationCount} class="w-full">
				<div class="flex w-full flex-col gap-4">
					<div class="flex w-full flex-col gap-2">
						<Label>Estaciones</Label>
						{#if corp.stations.length > 0}
							{#each corp.stations as puesto (puesto.code)}
								<div class="flex w-full flex-col gap-[0.15rem]">
									<span class="flex items-baseline gap-2">
										<Icon
											name="buildings"
											weight="bold"
											size="0.75rem"
											class="shrink-0 text-accent"
										/>
										<span
											class="truncate font-display text-[0.8rem] tracking-display text-text-strong"
										>
											{puesto.name}
										</span>
										<span class="text-[0.7rem] text-text-muted">{puesto.system}</span>
									</span>
									{#if puesto.services.length > 0}
										<span class="pl-[1.35rem] text-[0.7rem] text-text-muted">
											{puesto.services.join(' · ')}
										</span>
									{/if}
								</div>
							{/each}
							{#if corp.moreStations > 0}
								<!--
									Lo que no entra se cuenta, no se esconde. Verlas todas es el mapa,
									que para eso ya recorta por corporación.
								-->
								<span class="pl-[1.35rem] text-[0.7rem] text-text-muted">
									y {corp.moreStations} más
								</span>
							{/if}
						{:else}
							<span class="text-1 text-text-muted">
								Ninguna. No todas las corporaciones tienen edificios: ésta es gente.
							</span>
						{/if}
					</div>

					<!--
						De los agentes, sólo la cuenta. La lista con lo que la hace útil
						—nivel, clase de misión y si te atiende— vive en su pestaña, que es
						donde se la puede recortar y ordenar; repetirla acá sería tener dos
						listas de lo mismo y una sola que sirve.
					-->
					<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-3">
						<Label>Agentes</Label>
						<span class="flex items-baseline gap-2">
							<Icon
								name="identification-badge"
								weight="bold"
								size="0.75rem"
								class="shrink-0 text-accent"
							/>
							<span class="text-1 text-text-body">{corp.agentCount}</span>
						</span>
						<HudLink href="/corporacion/agentes" variant="outline" size="1">
							<Icon name="address-book" weight="bold" size="0.7rem" />
							Ver quién reparte trabajo
						</HudLink>
					</div>

					<!--
						Va con el recorte puesto: sin él la galaxia se abre entera y el botón
						promete «ver esto» para mostrar todo lo demás. El mapa deja el filtro
						a la vista en su desplegable, así que se saca desde ahí.
					-->
					<HudLink href="/navegacion/galaxia?corporacion={corp.code}" variant="outline" size="1">
						<Icon name="map-trifold" weight="bold" size="0.7rem" />
						Ver en el mapa
					</HudLink>
				</div>
			</TitledPanel>
		</div>
	</div>

	<!--
		Renunciar se confirma. No porque cueste caro —la reputación no se pierde y
		alistarse de nuevo es un clic— sino porque es de las cosas que uno no quería
		hacer: dejar de responderle a alguien no debería pasar por rozar un botón.
	-->
	<Modal bind:open={renunciando} title="Renunciar a {corp.name}" icon="sign-out">
		<div class="flex w-full flex-col items-start gap-4">
			<BodyText>
				Volvés a volar por tu cuenta. Lo que ganaste con ellos no se pierde: la reputación es tuya y
				sigue ahí si algún día volvés.
			</BodyText>
			<form method="POST" action="?/renunciar" use:enhance>
				<HudButton type="submit" variant="danger" onclick={() => (renunciando = false)}>
					Renunciar
				</HudButton>
			</form>
		</div>
	</Modal>
{/if}
