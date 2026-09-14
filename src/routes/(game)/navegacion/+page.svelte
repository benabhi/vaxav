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
	import ConfirmAction from '$lib/components/game/ConfirmAction.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import ProgressBar from '$lib/components/meters/ProgressBar.svelte';
	import ModuleGrid from '$lib/components/game/ModuleGrid.svelte';
	import ModuleTile from '$lib/components/game/ModuleTile.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import HudValue from '$lib/components/typography/HudValue.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

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
						interactivo desde hoy en vez de una fila de botones muertos: se puede
						ver qué ofrece cada módulo y cuáles tiene esta estación.
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
										<Label>{chosen.available ? 'Instalado' : 'No instalado'}</Label>
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
		Lo que se puede extraer acá. Va en esta pantalla y no en el árbol del
		sistema porque **minar se hace donde estás parado**: el árbol dice adónde
		ir, esto dice qué hacer una vez que llegaste.

		Cada veta muestra lo que la orden traería **con esta nave y esta bodega**, y
		no sólo cuánto queda en la roca: "quedan 48.000 unidades" no dice nada,
		"traés 225 y tardás 38 minutos" dice si vale la pena.
	-->
	{#if place.ores.length > 0}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<TitledPanel title="Extracción" detail={place.name} class="w-full">
				{#if form?.error}
					<div
						class="mb-3 flex w-full flex-wrap items-center gap-[0.4rem] border border-danger
							bg-danger-wash px-[0.6rem] py-2"
					>
						<Icon name="warning" weight="fill" size="0.85rem" class="text-danger" />
						<span class="text-1 text-danger">{form.error}</span>
					</div>
				{/if}

				<div class="flex w-full flex-col gap-3">
					{#each place.ores as veta (veta.code)}
						<div
							class="flex w-full flex-col gap-2 border border-l-[3px] px-[0.7rem] py-[0.7rem]
								{veta.blocked
								? 'border-border-soft border-l-border-soft bg-transparent'
								: 'border-border-soft border-l-data bg-surface'}"
						>
							<div class="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
								<Icon
									name="diamond"
									weight={veta.blocked ? 'thin' : 'duotone'}
									size="0.95rem"
									class={veta.blocked ? 'text-text-muted' : 'text-accent'}
								/>
								<span
									class="font-display text-[0.84rem] font-bold tracking-display uppercase
										{veta.blocked ? 'text-text-muted' : 'text-text-strong'}"
								>
									{veta.name}
								</span>
								<div class="grow"></div>
								<span class="flex shrink-0 items-baseline gap-2">
									<Label>Queda</Label>
									<span class="font-mono text-[0.78rem] text-accent-bright">{veta.remaining}</span>
								</span>
							</div>

							<!-- Cuánto queda contra su propio tope: dice si está trabajado. -->
							<ProgressBar percent={veta.share} />

							<p class="text-1 text-text-muted">{veta.description}</p>

							{#if veta.blocked}
								<span class="text-1 text-warning">{veta.blocked}</span>
							{:else}
								<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
									<span class="flex items-baseline gap-2">
										<Label>Traés</Label>
										<span class="font-mono text-[0.8rem] text-data">
											{veta.units} u · {veta.volume} m³
										</span>
									</span>
									<span class="flex items-baseline gap-2">
										<Label>Tarda</Label>
										<span class="font-mono text-[0.8rem] text-accent-bright">{veta.duration}</span>
									</span>
									<span class="flex items-baseline gap-2">
										<Label>Vale</Label>
										<span class="font-mono text-[0.8rem] text-data">{veta.value} CR</span>
									</span>
									<div class="grow"></div>

									<ConfirmAction
										formAction="?/minar"
										title="Extraer {veta.name}"
										icon="diamond"
										confirmLabel="Empezar"
										readings={[
											{ label: 'Traés', value: `${veta.units} u · ${veta.volume} m³` },
											{ label: 'Duración', value: veta.duration },
											{ label: 'Vale', value: `${veta.value} CR` }
										]}
										note="Mientras dure la extracción no vas a poder dar otra orden."
									>
										{#snippet trigger(abrir)}
											<HudButton type="button" size="1" onclick={abrir}>
												<Icon name="diamond" weight="bold" size="0.75rem" />
												Extraer
											</HudButton>
										{/snippet}
										{#snippet fields()}
											<input type="hidden" name="mineral" value={veta.code} />
										{/snippet}
									</ConfirmAction>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</TitledPanel>
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
