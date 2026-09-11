<!--
	Pestaña Ficha: armar la nave y ver en qué se convierte.

	La hoja de rendimiento se calcula **en el navegador**. Todo lo que muestra
	—los presupuestos, las capas, las barras, qué le entra a cada ranura— sale de
	reglas puras que viven en `$lib/game`, así que el interruptor de habilidades y
	elegir una ranura no cuestan una ida y vuelta. Del servidor sólo viene qué
	casco hay, qué lleva montado y dónde está parado el piloto.

	Montar sí va al servidor, y **se guarda en cada cambio**: en un juego que se
	juega de a ratos, una configuración a medias que se pierde al cerrar la
	pestaña es peor que cualquier ahorro de escrituras.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import FittingRig from '$lib/components/game/FittingRig.svelte';
	import IntegrityReadings from '$lib/components/game/IntegrityReadings.svelte';
	import SlotList from '$lib/components/game/SlotList.svelte';
	import ProgressBar from '$lib/components/meters/ProgressBar.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import HudValue from '$lib/components/typography/HudValue.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import {
		bonusTargetLabel,
		damageTypeShort,
		moduleIcon,
		slotKindIcon,
		slotKindLabel,
		tenths,
		thousands
	} from '$lib/format';
	import { DAMAGE_TYPES } from '$lib/game/damage';
	import { buildReadout, maxedSkills } from '$lib/game/fitting';
	import { SLOT_KINDS, getHull } from '$lib/game/hulls';
	import { availableForSlot } from '$lib/game/inventory';
	import { getSkill } from '$lib/game/skills';
	import type { StationServiceKind } from '$lib/game/universe';
	import { buildRingSlots, buildSlotGroups, fittedModules, moduleSummary } from '$lib/rig';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let ship = $derived(data.ship);
	let hull = $derived(getHull(ship.hullCode));
	let modules = $derived(fittedModules(ship.hullCode, ship.fitted));

	/** Qué ranura está abierta, o -1 si ninguna. */
	let selected = $state(-1);
	/** Modo "con todo entrenado": muestra qué compraría entrenar. */
	let showMaxed = $state(false);

	// Al cambiar de nave se cierra la ranura abierta: era de la otra.
	let lastHull = $state('');
	$effect(() => {
		if (lastHull !== ship.hullCode) {
			lastHull = ship.hullCode;
			selected = -1;
		}
	});

	/**
	 * Las habilidades con que se calcula: las del piloto, o todas al máximo.
	 *
	 * Con el interruptor apagado son las de verdad, así que la hoja dice lo que la
	 * nave rinde **hoy**; encendido, lo que rendiría entrenando todo, que es la
	 * comparación que explica la progresión sin un tutorial.
	 */
	let readout = $derived(buildReadout(hull, modules, showMaxed ? maxedSkills() : ship.pilotLevels));

	let slots = $derived(buildRingSlots(ship.hullCode, ship.fitted, selected));
	let groups = $derived(buildSlotGroups(ship.hullCode, ship.fitted, selected));

	let hasSelection = $derived(selected >= 0 && selected < hull.slots.length);
	let slotSpec = $derived(hasSelection ? hull.slots[selected] : null);
	let selectedIsCore = $derived(slotSpec?.kind === 'core');
	let selectedTitle = $derived(
		slotSpec
			? `${slots.find((s) => s.index === selected)?.title ?? ''} · clase ${slotSpec.size}`
			: ''
	);

	/**
	 * Qué se le puede montar a la ranura abierta, y de dónde sale.
	 *
	 * Sólo lo que está en la bodega o en la estación donde está el piloto: un
	 * módulo que no está en ningún lado no se puede montar, y ofrecerlo sería
	 * mentir. La bodega va vacía hasta que exista el hangar.
	 */
	let options = $derived(
		slotSpec
			? availableForSlot(
					slotSpec.kind,
					slotSpec.size,
					slotSpec.core,
					ship.stationServices as StationServiceKind[]
				).map((disponible) => ({
					code: disponible.module.code,
					name: disponible.module.name,
					rating: `${disponible.module.size}${disponible.module.rating}`,
					summary: moduleSummary(disponible.module),
					icon: moduleIcon(disponible.module),
					mounted: disponible.module.code === ship.fitted[selected],
					source: disponible.source === 'cargo' ? 'En la bodega' : 'En la estación',
					sourceIcon: disponible.source === 'cargo' ? ('package' as const) : ('buildings' as const)
				}))
			: []
	);

	/**
	 * Por qué la ranura abierta no tiene nada para montar, si no tiene.
	 *
	 * Nombra el lugar: "acá no hay nada" es una queja, "no hay nada en Planta
	 * Escarcha" es una instrucción para ir a otro lado.
	 */
	let nothingAvailable = $derived(
		hasSelection && options.length === 0
			? `Nada para esta ranura en ${ship.stationName || 'este lugar'}.`
			: ''
	);

	/** El bono de rol, escrito como se lee: «+5 % … por nivel de Minería». */
	let hullBonus = $derived(
		`+${hull.bonus.percentPerLevel} % de ${bonusTargetLabel(hull.bonus.target)} ` +
			`por nivel de ${getSkill(hull.bonus.skill).name}`
	);

	/** Cuánto de la recarga se está gastando. */
	let capacitorPercent = $derived(
		readout.rechargePerHour <= 0
			? readout.drainPerHour
				? 100
				: 0
			: Math.min(100, Math.round((readout.drainPerHour * 100) / readout.rechargePerHour))
	);

	/** Cuánto aguanta contra cada tipo, y por dónde se la van a romper. */
	let effectiveHp = $derived.by(() => {
		const techo = Math.max(...Object.values(readout.effectiveHp)) || 1;
		return DAMAGE_TYPES.map((tipo) => ({
			label: damageTypeShort(tipo),
			value: thousands(readout.effectiveHp[tipo]),
			percent: Math.round((readout.effectiveHp[tipo] * 100) / techo),
			weak: tipo === readout.weakSpot
		}));
	});

	/** Daño por segundo de cada tipo, que es como se compara un armamento. */
	let damage = $derived.by(() => {
		const techo = Math.max(...Object.values(readout.dps)) || 1;
		return DAMAGE_TYPES.map((tipo) => ({
			label: damageTypeShort(tipo),
			value: tenths(readout.dps[tipo]),
			percent: Math.round((readout.dps[tipo] * 100) / techo),
			weak: false
		}));
	});

	let mobility = $derived([
		{ label: 'Masa', value: thousands(readout.mass), unit: 't' },
		{ label: 'Velocidad', value: thousands(readout.speed), unit: 'u/s' },
		{ label: 'Alcance', value: tenths(readout.jumpRange), unit: 'al' },
		{ label: 'Saltos', value: String(readout.jumps), unit: '' }
	]);

	let capacity = $derived([
		{ label: 'Bodega', value: thousands(readout.cargo), unit: 'm³' },
		{ label: 'Combustible', value: String(readout.fuel), unit: '' },
		{ label: 'Sensores', value: String(readout.sensorRange), unit: 'u' },
		{ label: 'Firma', value: String(readout.signature), unit: '' }
	]);

	/** Abre una ranura, o la cierra si ya estaba abierta. */
	function chooseSlot(index: number) {
		selected = index === selected ? -1 : index;
	}
</script>

<svelte:head><title>Ficha · Nave · Vaxav</title></svelte:head>

<!--
	Un presupuesto: cuánto se usa de cuánto hay, con su barra. Se pone en rojo al
	pasarse en vez de impedir la elección: el jugador tiene que poder armar algo
	imposible y **ver** por qué no cierra.
-->
{#snippet budget(name: string, value: string, percent: number, over: boolean)}
	<div class="flex w-full flex-col gap-1">
		<div class="flex w-full items-center">
			<Label>{name}</Label>
			<div class="grow"></div>
			<span class="font-mono text-[0.78rem] {over ? 'text-danger' : 'text-data'}">{value}</span>
		</div>
		<ProgressBar {percent} color={over ? 'var(--color-danger)' : 'var(--color-accent)'} />
	</div>
{/snippet}

<!--
	Una fila comparable: el rótulo corto, la barra y la cifra. Tres letras y una
	barra es la forma de ver de un vistazo cuál es el flojo, que es la pregunta
	que se le hace a esta tabla.
-->
{#snippet barRow(row: { label: string; value: string; percent: number; weak: boolean })}
	<div class="flex w-full items-center gap-2">
		<span
			class="w-[2.2rem] shrink-0 font-display text-[0.65rem] font-bold tracking-label
				{row.weak ? 'text-warning' : 'text-accent-dim'}"
		>
			{row.label}
		</span>
		<div class="min-w-0 flex-[1_1_0]">
			<ProgressBar
				percent={row.percent}
				color={row.weak ? 'var(--color-warning)' : 'var(--color-accent)'}
			/>
		</div>
		<span class="w-[3.6rem] shrink-0 text-right font-mono text-[0.75rem] text-text-strong">
			{row.value}
		</span>
	</div>
{/snippet}

<!-- Una lectura suelta: rótulo arriba, valor abajo. -->
{#snippet reading(row: { label: string; value: string; unit: string })}
	<div class="flex min-w-0 flex-col items-start gap-1">
		<Label>{row.label}</Label>
		<div class="flex items-baseline gap-1">
			<span class="font-mono text-[0.95rem] text-data">{row.value}</span>
			{#if row.unit}<span class="text-1 text-text-muted">{row.unit}</span>{/if}
		</div>
	</div>
{/snippet}

<div class="flex w-full flex-wrap items-center gap-4">
	<div class="flex min-w-0 flex-col items-start gap-1">
		<Eyebrow>{hull.role}</Eyebrow>
		<DisplayTitle>{hull.name}</DisplayTitle>
	</div>
	<div class="grow"></div>
	<!--
		El interruptor de habilidades. Comparar la hoja actual con la de todo
		entrenado es la forma más directa de explicar la progresión sin escribir un
		tutorial: el jugador ve, en números, qué le compraría entrenar.
	-->
	<button
		type="button"
		onclick={() => (showMaxed = !showMaxed)}
		aria-pressed={showMaxed}
		class="flex cursor-pointer items-center gap-[0.4rem] border border-border-soft px-[0.6rem]
			py-[0.3rem] transition-[background-color,color]
			{showMaxed
			? 'bg-accent text-on-accent hover:bg-accent'
			: 'bg-transparent text-accent-bright hover:bg-surface-hover'}"
	>
		<Icon name={showMaxed ? 'star' : 'star-half'} weight="fill" size="0.8rem" />
		<span
			class="font-display text-[0.68rem] font-semibold tracking-label whitespace-nowrap uppercase"
		>
			{showMaxed ? 'Con todo entrenado' : 'Con mis habilidades'}
		</span>
	</button>
</div>

<!-- Por qué la nave no se puede volar. Vacío cuando cierra. -->
{#if !readout.flyable}
	<Panel class="w-full border-danger bg-danger-wash">
		<div class="flex w-full flex-col items-start gap-1">
			<div class="flex items-center gap-[0.4rem] text-danger">
				<Icon name="warning" weight="fill" size="0.9rem" />
				<span class="font-display text-[0.72rem] font-bold tracking-label uppercase">
					No se puede volar
				</span>
			</div>
			{#each readout.problems as problema (problema)}
				<p class="text-1 text-text-body">{problema}</p>
			{/each}
		</div>
	</Panel>
{/if}

<div class="flex w-full flex-col items-start gap-6 lg:flex-row">
	<!--
		Tres quintos para el anillo y su lista, dos para la hoja: el anillo necesita
		ancho para no achicarse, la hoja no.
	-->
	<div class="flex w-full min-w-0 flex-[3_1_0] flex-col gap-4">
		<div class="flex w-full flex-wrap items-start gap-[1.25rem]">
			<div class="flex min-w-0 flex-[1_1_20rem] flex-col gap-3">
				<FittingRig {slots} onChoose={chooseSlot} hasShield={readout.shield > 0} />
				<IntegrityReadings
					shield={thousands(readout.shield)}
					armor={thousands(readout.armor)}
					structure={thousands(readout.structure)}
				/>
				<!--
					Las cuatro categorías del anillo, en una línea. Cuesta un renglón y
					explica la estructura del anillo de un vistazo.
				-->
				<div class="flex w-full flex-wrap justify-center gap-[0.9rem]">
					{#each SLOT_KINDS as kind (kind)}
						<span class="flex items-center gap-[0.3rem] text-text-muted">
							<Icon name={slotKindIcon(kind)} weight="bold" size="0.7rem" />
							<span
								class="font-display text-[0.6rem] font-semibold tracking-label whitespace-nowrap uppercase"
							>
								{slotKindLabel(kind)}
							</span>
						</span>
					{/each}
				</div>
			</div>
			<!-- En pantalla angosta la lista se envuelve y cae debajo del anillo. -->
			<div class="min-w-0 flex-[1_1_12rem]">
				<SlotList {groups} onChoose={chooseSlot} />
			</div>
		</div>

		<Panel class="w-full">
			<div class="flex w-full flex-col items-start gap-2">
				<BodyText>{hull.description}</BodyText>
				<div class="flex flex-wrap items-center gap-[0.4rem]">
					<Icon name="star" weight="fill" size="0.75rem" class="text-accent" />
					<span class="text-1 text-accent-bright">{hullBonus}</span>
				</div>
			</div>
		</Panel>

		<!-- El banco de trabajo: qué se le puede montar a la ranura abierta. -->
		{#if hasSelection}
			<TitledPanel title="Banco de trabajo" detail={selectedTitle} class="w-full">
				<div class="flex w-full flex-col gap-2">
					<!--
						Por qué no se puede tocar la nave, si no se puede. Un banco de
						trabajo apagado sin explicación es peor que uno que no está.
					-->
					{#if !ship.canRefit}
						<div
							class="flex w-full flex-wrap items-center gap-[0.4rem] border border-warning
								bg-warning-wash px-[0.6rem] py-2"
						>
							<Icon name="warning" weight="fill" size="0.85rem" class="text-warning" />
							<span class="text-1 text-warning">{ship.refitBlocked}</span>
						</div>
					{/if}

					{#if form?.error}
						<div
							class="flex w-full flex-wrap items-center gap-[0.4rem] border border-danger
								bg-danger-wash px-[0.6rem] py-2"
						>
							<Icon name="warning" weight="fill" size="0.85rem" class="text-danger" />
							<span class="text-1 text-danger">{form.error}</span>
						</div>
					{/if}

					{#if selectedIsCore}
						<p class="text-1 text-text-muted">Un interno esencial se mejora, no se quita.</p>
					{:else}
						<form method="POST" action="?/montar" use:enhance class="w-fit">
							<input type="hidden" name="ranura" value={selected} />
							<input type="hidden" name="modulo" value="" />
							<button
								type="submit"
								disabled={!ship.canRefit}
								class="flex cursor-pointer items-center gap-[0.35rem] border border-border-soft
									px-2 py-1 text-text-muted transition-colors hover:text-danger
									disabled:cursor-not-allowed disabled:opacity-45"
							>
								<Icon name="x" weight="bold" size="0.7rem" />
								<span class="font-display text-[0.68rem] font-semibold tracking-label uppercase">
									Dejar vacía
								</span>
							</button>
						</form>
					{/if}

					{#if nothingAvailable}
						<p class="text-1 text-warning">{nothingAvailable}</p>
					{/if}

					{#each options as option (option.code)}
						<form method="POST" action="?/montar" use:enhance class="w-full">
							<input type="hidden" name="ranura" value={selected} />
							<input type="hidden" name="modulo" value={option.code} />
							<button
								type="submit"
								disabled={!ship.canRefit}
								class="w-full border border-l-[3px] border-border-soft px-3 py-[0.6rem] text-left
									transition-[background-color,color] disabled:cursor-not-allowed disabled:opacity-45
									{option.mounted
									? 'border-l-accent-bright bg-accent text-on-accent hover:bg-accent'
									: 'border-l-border-soft bg-surface text-text-strong hover:bg-surface-hover'}"
							>
								<div class="flex w-full flex-col items-start gap-1">
									<div class="flex w-full items-center gap-2">
										<Icon
											name={option.icon}
											weight="duotone"
											size="0.95rem"
											class={option.mounted ? 'text-on-accent' : 'text-accent'}
										/>
										<span
											class="min-w-0 font-display text-[0.82rem] font-bold tracking-display uppercase"
										>
											{option.name}
										</span>
										<div class="grow"></div>
										<span
											class="shrink-0 font-mono text-[0.75rem] {option.mounted
												? 'text-on-accent'
												: 'text-data'}"
										>
											{option.rating}
										</span>
									</div>
									<span
										class="font-mono text-1 leading-[1.4] {option.mounted
											? 'text-on-accent'
											: 'text-text-muted'}"
									>
										{option.summary}
									</span>
									<!--
										De dónde sale. Un módulo que no está en ningún lado no se
										puede montar, así que decir dónde está es parte de ofrecerlo.
									-->
									<span
										class="flex items-center gap-[0.3rem] {option.mounted
											? 'text-on-accent'
											: 'text-accent-dim'}"
									>
										<Icon name={option.sourceIcon} weight="fill" size="0.7rem" />
										<span
											class="font-display text-[0.6rem] font-semibold tracking-label whitespace-nowrap uppercase"
										>
											{option.source}
										</span>
									</span>
								</div>
							</button>
						</form>
					{/each}
				</div>
			</TitledPanel>
		{:else}
			<Panel class="w-full">
				<div class="flex flex-col items-start gap-2">
					<CardTitle>Elegí una ranura</CardTitle>
					<BodyText>
						Tocá cualquiera del anillo para ver qué le entra. Todo lo que montes se refleja al
						instante en la hoja de la derecha.
					</BodyText>
				</div>
			</Panel>
		{/if}
	</div>

	<!-- La hoja de rendimiento: en qué se convirtió la nave que se armó. -->
	<div class="flex w-full min-w-0 flex-[2_1_0] flex-col gap-4">
		<TitledPanel title="Presupuestos" class="w-full">
			<div class="flex w-full flex-col gap-3">
				{@render budget(
					'Potencia',
					`${readout.power.used} / ${readout.power.total} MW`,
					readout.power.percent,
					readout.power.over
				)}
				{@render budget(
					'Cómputo',
					`${readout.computing.used} / ${readout.computing.total} u`,
					readout.computing.percent,
					readout.computing.over
				)}
				{@render budget(
					'Acumulador',
					`${readout.capacitor} u · ${Math.floor(readout.rechargePerHour / 3600)} u/s`,
					capacitorPercent,
					!readout.stable
				)}
				{#if !readout.stable}
					<p class="text-1 text-warning">
						El acumulador no sostiene todo lo encendido: el trabajo rinde en proporción a lo que la
						recarga paga.
					</p>
				{/if}
			</div>
		</TitledPanel>

		<TitledPanel title="Aguante" detail={damageTypeShort(readout.weakSpot)} class="w-full">
			<div class="flex w-full flex-col gap-2">
				{#each effectiveHp as row (row.label)}
					{@render barRow(row)}
				{/each}
				<p class="text-1 text-text-muted">
					Puntos efectivos por tipo de daño. El flojo va marcado.
				</p>
			</div>
		</TitledPanel>

		{#if readout.totalDps > 0}
			<TitledPanel title="Armamento" class="w-full">
				<div class="flex w-full flex-col gap-2">
					{#each damage as row (row.label)}
						{@render barRow(row)}
					{/each}
					<p class="text-1 text-text-muted">
						Daño por segundo de cada tipo, ya con tus habilidades.
					</p>
				</div>
			</TitledPanel>
		{/if}

		{#if readout.miningPerHour > 0}
			<TitledPanel title="Trabajo" class="w-full">
				<div class="flex w-full items-center">
					<Label>Extracción</Label>
					<div class="grow"></div>
					<HudValue>{thousands(readout.miningPerHour)} m³/h</HudValue>
				</div>
			</TitledPanel>
		{/if}

		<TitledPanel title="Movilidad" class="w-full">
			<div class="grid w-full grid-cols-2 gap-4">
				{#each mobility as row (row.label)}
					{@render reading(row)}
				{/each}
			</div>
		</TitledPanel>

		<TitledPanel title="Capacidad" class="w-full">
			<div class="grid w-full grid-cols-2 gap-4">
				{#each capacity as row (row.label)}
					{@render reading(row)}
				{/each}
			</div>
		</TitledPanel>
	</div>
</div>
