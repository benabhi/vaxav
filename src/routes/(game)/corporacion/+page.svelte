<!--
	Pestaña Corporación: a quién le rinde cuentas el piloto.

	**La figura de esta pantalla es el sello.** Una corporación se reconoce por su
	emblema antes que por su nombre, igual que una facción por su color, y el sello
	sale del nombre así que ninguna queda sin cara. Al lado van las cifras exactas,
	como manda la regla de las figuras: el dibujo dice *cuál* y la lista dice *qué*.

	Tres bloques y ninguno más, porque hoy no hay más: quién es, dónde se la
	encuentra y quiénes son los otros. La billetera compartida, los roles y los
	contratos suman su bloque cuando existan; la pantalla no los anuncia antes.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let corp = $derived(data.corporacion);
</script>

<svelte:head><title>Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Corporación</Eyebrow>
	<DisplayTitle>{corp.name}</DisplayTitle>
</div>

{#if !corp.belongs}
	<!--
		Sin corporación no se dibuja una ficha vacía: se dice qué significa estar
		afuera. Es un estado legítimo, no un dato que falte.
	-->
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>{corp.description}</BodyText>
		</div>
	</Panel>
{:else}
	<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
		<!--
			La ficha de identidad: el sello grande y, al lado, lo que el sello no puede
			decir. Una figura dice bien «cuál» y mal «cuánto».
		-->
		<div class="w-full min-w-0 lg:flex-[2_1_0]">
			<TitledPanel title="Quién es" detail={corp.members} class="w-full">
				<div class="flex w-full flex-col items-start gap-4 xs:flex-row">
					<div class="w-[8rem] shrink-0 self-center xs:self-start">
						<Identicon name={corp.name} size="100%" title="Sello de {corp.name}" />
					</div>

					<div class="flex min-w-0 grow flex-col gap-3">
						<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.35rem]">
							<Label>Rubro</Label>
							<span class="flex items-center gap-[0.4rem] text-1 text-text-body">
								<Icon name={corp.kindIcon} weight="bold" size="0.85rem" class="text-accent" />
								{corp.kind}
							</span>

							<Label>Responde a</Label>
							<span class="text-1 text-text-body">{corp.faction}</span>

							<Label>Pilotos</Label>
							<span class="font-mono text-1 text-data">{corp.members}</span>
						</div>

						<BodyText>{corp.description}</BodyText>
					</div>
				</div>
			</TitledPanel>
		</div>

		<!--
			Dónde se la encuentra. Una corporación **puede no operar ninguna estación** y
			existir igual, sólo como gente: por eso los dos bloques van separados y cada
			uno dice qué pasa cuando está vacío.
		-->
		<div class="w-full min-w-0 lg:flex-[1_1_0]">
			<TitledPanel title="Dónde se la encuentra" class="w-full">
				<div class="flex w-full flex-col gap-4">
					<div class="flex w-full flex-col gap-2">
						<Label>Estaciones que opera</Label>
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
						{:else}
							<span class="text-1 text-text-muted">
								Ninguna. No todas las corporaciones tienen edificios: ésta es gente.
							</span>
						{/if}
					</div>

					<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-3">
						<Label>Gente repartiendo trabajo</Label>
						{#if corp.agents.length > 0}
							{#each corp.agents as uno (uno.code)}
								<span class="flex items-baseline gap-2">
									<Icon
										name="identification-badge"
										weight="bold"
										size="0.75rem"
										class="shrink-0 text-accent"
									/>
									<span class="truncate text-1 text-text-body">{uno.name}</span>
									<span class="truncate text-[0.7rem] text-text-muted">
										{uno.station}{uno.system ? ` · ${uno.system}` : ''}
									</span>
								</span>
							{/each}
						{:else}
							<span class="text-1 text-text-muted">
								Todavía no tiene a nadie sentado en ninguna estación.
							</span>
						{/if}
					</div>

					<HudLink href="/navegacion/galaxia" variant="outline" size="1">
						<Icon name="map-trifold" weight="bold" size="0.7rem" />
						Ver en el mapa
					</HudLink>
				</div>
			</TitledPanel>
		</div>
	</div>
{/if}
