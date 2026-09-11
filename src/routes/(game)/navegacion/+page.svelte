<!--
	Pestaña Ubicación: el lugar exacto donde está el piloto.

	Es la primera del módulo a propósito. Hoy describe el lugar y sus módulos,
	pero es donde van a vivir las acciones —atracar, minar, refinar, poner
	rumbo—, así que va a ser de las pantallas más visitadas del juego.

	**Se dibuja distinta del resto a propósito.** Parado en una estación, la
	pantalla es el mosaico de módulos con la ficha al costado; parado en un
	cinturón o una luna, no hay mosaico y la ficha ocupa todo. La forma la decide
	el contenido, no una plantilla.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import AgentCard from '$lib/components/game/AgentCard.svelte';
	import ModuleGrid from '$lib/components/game/ModuleGrid.svelte';
	import ModuleTile from '$lib/components/game/ModuleTile.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import HudValue from '$lib/components/typography/HudValue.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let place = $derived(data.location);

	/**
	 * El módulo abierto debajo del mosaico. Arranca vacío: primero se ve el
	 * conjunto, después se elige. Es estado de pantalla, así que vive acá y no
	 * viaja al servidor.
	 */
	let selected = $state('');

	/**
	 * Al cambiar de lugar el detalle se cierra solo: el módulo que estaba abierto
	 * era de la estación anterior. Se compara contra el último lugar visto porque
	 * navegar a la misma ruta reusa el componente y el estado sobrevive.
	 */
	let lastPlace = $state('');
	$effect(() => {
		if (lastPlace !== place.name) {
			lastPlace = place.name;
			selected = '';
		}
	});

	let chosen = $derived(
		place.modules.find((module) => module.code === selected && module.available)
	);

	function choose(code: string, available: boolean) {
		// Un módulo que la estación no tiene no abre nada.
		selected = available ? code : '';
	}
</script>

<svelte:head><title>Ubicación · Navegación · Vaxav</title></svelte:head>

<!--
	Una lectura de la ficha: etiqueta arriba, valor abajo. Mismo formato que las
	fichas de facción, por la misma razón: apilado, el valor se lleva el ancho de
	su columna y no se parte en dos renglones.
-->
{#snippet reading(name: string, value: string, mono = false)}
	<div class="flex w-full min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		<p
			class="w-full overflow-hidden text-2 font-medium text-ellipsis whitespace-nowrap
				{mono ? 'font-mono text-data' : 'font-display text-accent-bright'}"
		>
			{value}
		</p>
	</div>
{/snippet}

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Estás en</Eyebrow>
	<DisplayTitle>{place.name}</DisplayTitle>
</div>

<!--
	Apilado, los dos bloques se llevan el ancho entero; recién en pantalla grande
	se ponen lado a lado y ahí manda el `flex`. Sin el `w-full`, `items-start` los
	dimensiona por contenido y el mosaico desborda en un teléfono.
-->
<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
	{#if place.isStation}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<div class="flex w-full flex-col gap-4">
				<TitledPanel title="Módulos de la estación" detail={place.moduleCount} class="w-full">
					<ModuleGrid>
						{#each place.modules as module (module.code)}
							<ModuleTile
								icon={module.icon}
								name={module.name}
								summary={module.available ? module.summary : 'No disponible'}
								available={module.available}
								selected={selected === module.code}
								onChoose={() => choose(module.code, module.available)}
							/>
						{/each}
					</ModuleGrid>

					<!--
						El detalle del módulo elegido. Es lo que hace que el mosaico sea
						interactivo desde hoy en vez de una fila de botones muertos: no se
						puede entrar todavía, pero se puede ver qué ofrece cada módulo y en
						qué fase llega.
					-->
					{#if chosen}
						<div
							class="mt-[0.9rem] w-full border-l-[3px] border-l-accent bg-surface-strong p-[0.9rem]"
						>
							<div class="flex w-full items-start gap-[0.9rem]">
								<Icon name={chosen.icon} weight="duotone" size="2rem" class="text-accent" />
								<div class="flex w-full min-w-0 flex-col items-start gap-2">
									<div class="flex w-full flex-wrap items-center gap-2">
										<CardTitle>{chosen.name}</CardTitle>
										<div class="grow"></div>
										<Label>Llega en</Label>
										<HudValue class="text-[0.8rem]">{chosen.phase}</HudValue>
									</div>
									<BodyText>{chosen.summary}</BodyText>
								</div>
							</div>
						</div>
					{:else}
						<p class="mt-[0.9rem] text-1 text-text-muted">Elegí un módulo para ver qué ofrece.</p>
					{/if}
				</TitledPanel>

				<!--
					Los agentes de la estación. No toda estación tiene: hacen falta
					Contactos para recibir a alguien. Cuando no hay, el panel no se dibuja
					en vez de anunciar un vacío.
				-->
				{#if place.agents.length}
					<TitledPanel title="Agentes" detail={place.agentCount} class="w-full">
						<div class="flex w-full flex-col gap-3">
							{#each place.agents as agent (agent.code)}
								<AgentCard {agent} />
							{/each}
						</div>
					</TitledPanel>
				{/if}
			</div>
		</div>
	{/if}

	<!--
		La ficha del lugar: qué es, dónde está y quién lo opera. En la columna
		angosta las lecturas van apiladas: es la misma pieza que en la pestaña
		Sistema, pero acá tiene un tercio del ancho.
	-->
	<div class="w-full min-w-0 flex-[1_1_0]">
		<div class="flex w-full min-w-0 flex-col gap-4">
			<TitledPanel title="Ficha del lugar" class="w-full">
				<div class="flex w-full min-w-0 flex-col items-start gap-4">
					<div class="flex w-full items-start gap-[0.9rem]">
						<Icon name={place.icon} weight="thin" size="3rem" class="text-accent-dim" />
						<BodyText>{place.description}</BodyText>
					</div>
					<div class="grid w-full grid-cols-2 gap-4">
						{@render reading('Tipo', place.kind)}
						{@render reading('Sistema', place.system)}
						{@render reading('Orbita a', place.parent)}
						{@render reading('Distancia', place.distance, true)}
						{@render reading('Estado', place.exploration)}
					</div>
				</div>
			</TitledPanel>

			{#if place.isStation}
				<TitledPanel title="Operada por" class="w-full">
					<div class="flex w-full flex-col items-start gap-2">
						<HudValue>{place.corporation}</HudValue>
						<div class="flex flex-wrap items-center gap-[0.4rem]">
							<Label>{place.corporationKind}</Label>
							<span class="text-accent-dim">·</span>
							<Label>{place.owner}</Label>
						</div>
					</div>
				</TitledPanel>
			{/if}
		</div>
	</div>
</div>
