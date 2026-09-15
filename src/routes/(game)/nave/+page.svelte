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
	import { roundHalfEven } from '$lib/game/math';
	import { DAMAGE_TYPES } from '$lib/game/damage';
	import { buildReadout, fitFromCodes, maxedSkills } from '$lib/game/fitting';
	import { SLOT_KINDS, getHull } from '$lib/game/hulls';
	import { availableForSlot } from '$lib/game/inventory';
	import { getModule } from '$lib/game/modules';
	import { getSkill } from '$lib/game/skills';
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

	/**
	 * El módulo que se está señalando en la lista, si se está señalando alguno.
	 *
	 * Cadena vacía quiere decir **vaciar la ranura**, que también es un cambio y
	 * también hay que poder verlo antes de hacerlo.
	 */
	let preview = $state<string | null>(null);

	/**
	 * La hoja que saldría de montar lo que se está señalando.
	 *
	 * **Se calcula acá, en el navegador**, y eso no es un atajo: la calculadora de
	 * equipamiento es una regla pura de `game/`, así que el mismo código que usa el
	 * servidor corre del lado del jugador sin una consulta de por medio. Por eso
	 * pasar el dedo por una lista de doce módulos no son doce idas al servidor.
	 *
	 * Es `null` cuando no se está señalando nada, y ahí no hay nada que comparar.
	 */
	let futuro = $derived.by(() => {
		if (preview === null || !hasSelection) return null;
		const codigos = [...ship.fitted];
		codigos[selected] = preview;
		return buildReadout(
			hull,
			fitFromCodes(hull, codigos),
			showMaxed ? maxedSkills() : ship.pilotLevels
		);
	});

	/** Lo que los paneles dibujan: la simulación si la hay, y si no lo que hay. */
	let hoja = $derived(futuro ?? readout);

	/**
	 * Cuánto cambiaría una magnitud, o `null` si no cambia.
	 *
	 * Devolver `null` y no cero es lo que hace que sólo se enciendan los renglones
	 * que **se mueven**: un tablero donde doce cifras muestran "+0" no dice nada, y
	 * lo que se quiere ver de un vistazo es qué tocó este módulo.
	 */
	function cambio(actual: number, simulado: number): number | null {
		return futuro && simulado !== actual ? simulado - actual : null;
	}

	/** Un cambio escrito con su signo: «+120», «−4». */
	function firmado(valor: number): string {
		return `${valor > 0 ? '+' : '−'}${thousands(Math.abs(valor))}`;
	}

	/** Cómo se llama lo que se está simulando, para el aviso de la hoja. */
	let previewLabel = $derived(
		preview === null ? '' : preview === '' ? 'la ranura vacía' : getModule(preview).name
	);

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
	 * Qué se le puede montar a la ranura abierta: **lo que tenés, y dónde está**.
	 *
	 * Son dos bodegas distintas y la diferencia importa: lo de la nave viaja con
	 * vos, lo de la estación hay que venir a buscarlo. Por eso cada renglón dice
	 * de cuál sale, y el mismo módulo en las dos aparece dos veces —son dos cosas
	 * distintas de las que echar mano—.
	 *
	 * La estación no *vende* nada acá: comprar es del mercado, que es donde viven
	 * la búsqueda y el árbol de categorías.
	 *
	 * **Y sólo lo que el piloto sabe usar.** Un módulo cuyo requisito no cumple no
	 * aparece en la lista: montarlo dejaría la nave en tierra, y ofrecer algo que
	 * rompe la nave no es ofrecer, es tender una trampa. El módulo sigue siendo
	 * suyo —está en la bodega y se ve en Propiedades—, pero la ranura no lo toma
	 * hasta que entrene.
	 */
	let options = $derived.by(() => {
		if (!slotSpec) return [];

		const puesto = ship.fitted[selected] ?? '';
		const desde = (codes: readonly string[], origin: 'ship' | 'station') =>
			availableForSlot(
				slotSpec.kind,
				slotSpec.size,
				slotSpec.core,
				codes.map(getModule),
				ship.pilotLevels
			).map((module) => ({
				module,
				origin,
				units: codes.filter((code) => code === module.code).length
			}));

		const guardados = [
			...desde(ship.cargoModules, 'ship'),
			...desde(ship.stationModules, 'station')
		];

		// Lo que ya está puesto encabeza la lista aunque no esté en ninguna bodega:
		// verlo ahí es lo que dice qué hay en la ranura sin abrir otra pantalla.
		const montado = puesto
			? [{ module: getModule(puesto), origin: 'fitted' as const, units: 0 }]
			: [];

		return [...montado, ...guardados].map(({ module, origin, units }) => ({
			code: module.code,
			name: module.name,
			tier: `${module.size}${module.tier}`,
			summary: moduleSummary(module),
			icon: moduleIcon(module),
			origin,
			units,
			mounted: origin === 'fitted'
		}));
	});

	/**
	 * Por qué la ranura abierta no tiene nada para montar, si no tiene.
	 *
	 * Manda al mercado, que es donde se consigue: "no tenés nada" es una queja,
	 * "se compra en el mercado" es una instrucción.
	 */
	let nothingAvailable = $derived(
		hasSelection && options.filter((option) => !option.mounted).length === 0
			? 'No tenés nada que entre en esta ranura, ni en la nave ni acá. Se compra en el mercado.'
			: ''
	);

	/** El bono de rol, escrito como se lee: «+5 % … por nivel de Minería». */
	let hullBonus = $derived(
		`+${hull.bonus.percentPerLevel} % de ${bonusTargetLabel(hull.bonus.target)} ` +
			`por nivel de ${getSkill(hull.bonus.skill).name}`
	);

	/** Cuánto de la recarga se está gastando. */
	let capacitorPercent = $derived(
		hoja.rechargePerHour <= 0
			? hoja.drainPerHour
				? 100
				: 0
			: Math.min(100, roundHalfEven((hoja.drainPerHour * 100) / hoja.rechargePerHour))
	);

	/** Cuánto aguanta contra cada tipo, y por dónde se la van a romper. */
	let effectiveHp = $derived.by(() => {
		const techo = Math.max(...Object.values(hoja.effectiveHp)) || 1;
		return DAMAGE_TYPES.map((tipo) => ({
			label: damageTypeShort(tipo),
			value: thousands(hoja.effectiveHp[tipo]),
			percent: roundHalfEven((hoja.effectiveHp[tipo] * 100) / techo),
			weak: tipo === hoja.weakSpot,
			delta: cambio(readout.effectiveHp[tipo], hoja.effectiveHp[tipo])
		}));
	});

	/** Daño por segundo de cada tipo, que es como se compara un armamento. */
	let damage = $derived.by(() => {
		const techo = Math.max(...Object.values(hoja.dps)) || 1;
		return DAMAGE_TYPES.map((tipo) => ({
			label: damageTypeShort(tipo),
			value: tenths(hoja.dps[tipo]),
			percent: roundHalfEven((hoja.dps[tipo] * 100) / techo),
			weak: false,
			delta: cambio(readout.dps[tipo], hoja.dps[tipo])
		}));
	});

	let mobility = $derived([
		{
			label: 'Masa',
			value: thousands(hoja.mass),
			unit: 't',
			delta: cambio(readout.mass, hoja.mass),
			// Más masa es peor, y el color tiene que decirlo: en todo lo demás, subir
			// es mejorar.
			lowerIsBetter: true
		},
		{
			label: 'Velocidad',
			value: thousands(hoja.speed),
			unit: 'u/s',
			delta: cambio(readout.speed, hoja.speed),
			lowerIsBetter: false
		},
		{
			label: 'Alcance',
			value: tenths(hoja.jumpRange),
			unit: 'al',
			delta: cambio(readout.jumpRange, hoja.jumpRange),
			lowerIsBetter: false
		},
		{
			label: 'Saltos',
			value: String(hoja.jumps),
			unit: '',
			delta: cambio(readout.jumps, hoja.jumps),
			lowerIsBetter: false
		}
	]);

	let capacity = $derived([
		{
			label: 'Bodega',
			value: thousands(hoja.cargo),
			unit: 'm³',
			delta: cambio(readout.cargo, hoja.cargo),
			lowerIsBetter: false
		},
		{
			label: 'Combustible',
			value: String(hoja.fuel),
			unit: '',
			delta: cambio(readout.fuel, hoja.fuel),
			lowerIsBetter: false
		},
		{
			label: 'Sensores',
			value: String(hoja.sensorRange),
			unit: 'u',
			delta: cambio(readout.sensorRange, hoja.sensorRange),
			lowerIsBetter: false
		},
		{
			// Una firma chica es mejor: es cuánto se te ve.
			label: 'Firma',
			value: String(hoja.signature),
			unit: '',
			delta: cambio(readout.signature, hoja.signature),
			lowerIsBetter: true
		}
	]);

	/** Abre una ranura, o la cierra si ya estaba abierta. */
	function chooseSlot(index: number) {
		selected = index === selected ? -1 : index;
		// La simulación era de la ranura anterior: dejarla encendida mostraría una
		// hoja que no corresponde a nada de lo que hay en pantalla.
		preview = null;
	}
</script>

<svelte:head><title>Ficha · Nave · Vaxav</title></svelte:head>

<!--
	Un presupuesto: cuánto se usa de cuánto hay, con su barra. Se pone en rojo al
	pasarse en vez de impedir la elección: el jugador tiene que poder armar algo
	imposible y **ver** por qué no cierra.
-->
{#snippet budget(
	name: string,
	value: string,
	percent: number,
	over: boolean,
	delta: number | null = null
)}
	<div class="flex w-full flex-col gap-1">
		<div class="flex w-full items-center gap-2">
			<Label>{name}</Label>
			<div class="grow"></div>
			<!-- En un presupuesto, gastar más es peor: el signo se lee al revés. -->
			{@render chip(delta, true)}
			<span class="font-mono text-[0.78rem] {over ? 'text-danger' : 'text-data'}">{value}</span>
		</div>
		<ProgressBar {percent} color={over ? 'var(--color-danger)' : 'var(--color-accent)'} />
	</div>
{/snippet}

<!--
	Cuánto movería el módulo que se está señalando. **Sólo aparece si algo se
	mueve**: un tablero donde doce cifras dicen "+0" no dice nada, y lo que hay que
	ver de un vistazo es qué tocó este módulo.

	El color no dice el signo, dice **si conviene**: más masa es peor y menos firma
	es mejor, así que pintar por el signo mentiría en la mitad de los renglones.
-->
{#snippet chip(delta: number | null, lowerIsBetter = false)}
	{#if delta !== null}
		{@const mejora = lowerIsBetter ? delta < 0 : delta > 0}
		<span class="shrink-0 font-mono text-[0.7rem] {mejora ? 'text-success' : 'text-danger'}">
			{firmado(delta)}
		</span>
	{/if}
{/snippet}

<!--
	Una fila comparable: el rótulo corto, la barra y la cifra. Tres letras y una
	barra es la forma de ver de un vistazo cuál es el flojo, que es la pregunta
	que se le hace a esta tabla.
-->
{#snippet barRow(row: {
	label: string;
	value: string;
	percent: number;
	weak: boolean;
	delta?: number | null;
})}
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
		{@render chip(row.delta ?? null)}
		<span class="w-[3.6rem] shrink-0 text-right font-mono text-[0.75rem] text-text-strong">
			{row.value}
		</span>
	</div>
{/snippet}

<!--
	El corte entre dos secciones de la hoja: una línea fina y un rótulo.

	Es lo que reemplaza a media docena de tarjetas. Un panel con su borde y su
	título cuesta casi dos centímetros de alto cada vez, y acá lo que hace falta es
	separar grupos de lecturas, no encerrarlos.
-->
{#snippet seccion(name: string, detail: string)}
	<div
		class="mt-[0.35rem] flex w-full items-baseline gap-2 border-t border-border-soft pt-[0.6rem]"
	>
		<span class="font-display text-1 tracking-label text-accent-dim uppercase">{name}</span>
		<div class="grow"></div>
		{#if detail}
			<span class="font-mono text-[0.68rem] text-text-muted">{detail}</span>
		{/if}
	</div>
{/snippet}

<!-- Una lectura suelta: rótulo arriba, valor abajo. -->
{#snippet reading(row: {
	label: string;
	value: string;
	unit: string;
	delta?: number | null;
	lowerIsBetter?: boolean;
})}
	<div class="flex min-w-0 flex-col items-start gap-1">
		<Label>{row.label}</Label>
		<div class="flex items-baseline gap-2">
			<span class="font-mono text-[0.95rem] text-data">{row.value}</span>
			{#if row.unit}<span class="text-1 text-text-muted">{row.unit}</span>{/if}
			{@render chip(row.delta ?? null, row.lowerIsBetter ?? false)}
		</div>
	</div>
{/snippet}

<!--
	Qué se le puede montar a la ranura abierta.

	**No es un taller**: acá no se fabrica nada, se monta y se desmonta. Es el mismo
	servicio de Equipamiento que ofrece la estación, y por eso se llama igual.
	Fabricar se hace en el Taller, que es otro módulo de estación y se entra desde
	Ubicación.

	Va **al lado del anillo y no debajo de todo**, que es donde estaba. Elegir una
	ranura obligaba a bajar, y bajar sacaba de la pantalla justo lo que hay que
	mirar para decidir: la hoja de rendimiento. Ahora el anillo queda a la
	izquierda, lo que entra en la ranura al medio y la hoja a la derecha, y montar
	un módulo no mueve nada de lugar.
-->
{#snippet equipamiento()}
	<TitledPanel title="Equipamiento" detail={selectedTitle} class="w-full">
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
						onmouseenter={() => (preview = '')}
						onmouseleave={() => (preview = null)}
						onfocus={() => (preview = '')}
						onblur={() => (preview = null)}
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

			<!--
				Un renglón por montón, con **de qué bodega sale**. Lo montado va
				primero y encendido; lo demás es lo que podés poner en su lugar.
			-->
			{#each options as option (`${option.origin}:${option.code}`)}
				<!--
					Señalar un módulo **simula montarlo**: la hoja de la derecha pasa a
					mostrar cómo quedaría y marca lo que se mueve. Con el foco del teclado
					también, porque si no la simulación sólo existiría para quien usa mouse.
				-->
				<form method="POST" action="?/montar" use:enhance class="w-full">
					<input type="hidden" name="ranura" value={selected} />
					<input type="hidden" name="modulo" value={option.code} />
					<input type="hidden" name="origen" value={option.origin} />
					<button
						type="submit"
						disabled={!ship.canRefit}
						onmouseenter={() => (preview = option.code)}
						onmouseleave={() => (preview = null)}
						onfocus={() => (preview = option.code)}
						onblur={() => (preview = null)}
						class="w-full border border-l-[3px] border-border-soft px-3 py-[0.6rem] text-left
							transition-[background-color,color] disabled:cursor-not-allowed disabled:opacity-45
							{option.mounted
							? 'border-l-accent-bright bg-accent text-on-accent hover:bg-accent'
							: 'border-l-accent-dim bg-surface text-text-strong hover:bg-surface-hover'}"
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
								<!--
									De qué bodega sale, y cuántos hay ahí. Es la diferencia que
									importa antes de zarpar: lo de la nave viaja con vos, lo de la
									estación se queda acá.

									La cantidad va con la cruz de multiplicar, como en todo el juego:
									un número suelto detrás de un punto se lee como un identificador,
									y un identificador que nadie puede usar para nada es ruido.
								-->
								<span
									class="flex shrink-0 items-center gap-[0.3rem] border px-[0.4rem] py-[0.1rem]
										{option.mounted
										? 'border-on-accent/40 text-on-accent'
										: option.origin === 'ship'
											? 'border-border-soft text-accent-bright'
											: 'border-border-soft text-text-muted'}"
								>
									<Icon
										name={option.mounted
											? 'check'
											: option.origin === 'ship'
												? 'package'
												: 'buildings'}
										weight="fill"
										size="0.6rem"
									/>
									<span
										class="font-display text-[0.58rem] font-semibold tracking-label whitespace-nowrap uppercase"
									>
										{option.mounted
											? 'Puesto'
											: option.origin === 'ship'
												? `En la nave ×${option.units}`
												: `En la estación ×${option.units}`}
									</span>
								</span>
								<span
									class="shrink-0 font-mono text-[0.75rem] {option.mounted
										? 'text-on-accent'
										: 'text-data'}"
								>
									{option.tier}
								</span>
							</div>
							<span
								class="font-mono text-1 leading-[1.4] {option.mounted
									? 'text-on-accent'
									: 'text-text-muted'}"
							>
								{option.summary}
							</span>
						</div>
					</button>
				</form>
			{/each}
		</div>
	</TitledPanel>
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
			<!--
				Con una ranura abierta el anillo cede ancho: los dos piden lo suyo y en la
				columna no entran los dos enteros, así que uno se iba abajo y volvíamos a
				tener que bajar. El anillo achicado sigue leyéndose —es un círculo de
				doce baldosas, no un plano— y a cambio todo queda en la misma pantalla.
			-->
			<div
				class="flex min-w-0 flex-col gap-3 {hasSelection ? 'flex-[1_1_15rem]' : 'flex-[1_1_20rem]'}"
			>
				<FittingRig {slots} onChoose={chooseSlot} hasShield={hoja.shield > 0} />
				<IntegrityReadings
					shield={thousands(hoja.shield)}
					armor={thousands(hoja.armor)}
					structure={thousands(hoja.structure)}
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
			<!--
				La columna del medio cambia de oficio según haya ranura elegida o no: sin
				elegir muestra **qué hay montado**, y con una elegida **qué le entra**. Es
				la misma pregunta en dos momentos, y por eso ocupa el mismo lugar en vez
				de empujar la pantalla hacia abajo.

				En pantalla angosta se envuelve y cae debajo del anillo.
			-->
			<div class="min-w-0 {hasSelection ? 'flex-[1_1_18rem]' : 'flex-[1_1_12rem]'}">
				{#if hasSelection}
					{@render equipamiento()}
				{:else}
					<div class="flex w-full flex-col gap-2">
						<SlotList {groups} onChoose={chooseSlot} />
						<!--
							La única instrucción de la pantalla, y sólo mientras haga falta:
							apenas se elige una ranura desaparece, porque ya se aprendió.
						-->
						<p class="text-1 text-text-muted">
							Tocá una ranura del anillo para ver qué le entra. Lo que montes se refleja al instante
							en la hoja.
						</p>
					</div>
				{/if}
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
	</div>

	<!--
		La hoja de rendimiento: en qué se convirtió la nave que se armó.

		**Se queda pegada arriba** en pantalla grande: es la respuesta a todo lo que
		se hace del otro lado, y perderla de vista al bajar es perder el motivo por el
		que uno estaba mirando. En pantalla chica no se pega, porque ahí no hay dos
		columnas que mirar a la vez.
	-->
	<div class="flex w-full min-w-0 flex-[2_1_0] flex-col gap-4 lg:sticky lg:top-4">
		<!--
			Que lo que se está mirando es una simulación y no la nave. Sin esto, las
			cifras cambian solas al pasar el dedo por la lista y uno no sabe si ya montó
			algo sin querer.
		-->
		{#if futuro}
			<div
				class="flex w-full items-center gap-2 border border-l-[3px] border-border-soft
					border-l-data bg-surface px-3 py-2"
			>
				<Icon name="eye-slash" weight="duotone" size="0.9rem" class="shrink-0 text-data" />
				<span class="text-1 text-text-body">
					Así quedaría con <span class="text-data">{previewLabel}</span>
				</span>
			</div>
		{/if}

		<!--
			La hoja entera en **un solo instrumento**, no en seis tarjetas apiladas.

			Cada tarjeta traía su borde, su título y su aire, y seis de ellas estiraban
			la columna hasta el doble del alto del anillo: la mitad de la herramienta
			quedaba abajo del pliegue y había que bajar para comparar. Con secciones
			separadas por una línea fina, lo mismo entra de una vez, que es lo que
			convierte esto en un panel de cabina en vez de una página con cajas.
		-->
		<TitledPanel title="Hoja de rendimiento" detail={hull.name} class="w-full">
			<div class="flex w-full flex-col gap-[0.6rem]">
				{@render budget(
					'Potencia',
					`${hoja.power.used} / ${hoja.power.total} MW`,
					hoja.power.percent,
					hoja.power.over,
					cambio(readout.power.used, hoja.power.used)
				)}
				{@render budget(
					'Cómputo',
					`${hoja.computing.used} / ${hoja.computing.total} u`,
					hoja.computing.percent,
					hoja.computing.over,
					cambio(readout.computing.used, hoja.computing.used)
				)}
				{@render budget(
					'Acumulador',
					`${hoja.capacitor} u · ${Math.floor(hoja.rechargePerHour / 3600)} u/s`,
					capacitorPercent,
					!hoja.stable,
					cambio(readout.drainPerHour, hoja.drainPerHour)
				)}
				{#if !hoja.stable}
					<p class="text-1 text-warning">
						El acumulador no sostiene todo lo encendido: el trabajo rinde en proporción a lo que la
						recarga paga.
					</p>
				{/if}

				{@render seccion('Aguante', damageTypeShort(hoja.weakSpot))}
				{#each effectiveHp as row (row.label)}
					{@render barRow(row)}
				{/each}

				{#if hoja.totalDps > 0}
					{@render seccion('Armamento', `${tenths(hoja.totalDps)} total`)}
					{#each damage as row (row.label)}
						{@render barRow(row)}
					{/each}
				{/if}

				{#if hoja.miningPerHour > 0}
					{@render seccion('Trabajo', '')}
					<div class="flex w-full items-center gap-2">
						<Label>Extracción</Label>
						<div class="grow"></div>
						{@render chip(cambio(readout.miningPerHour, hoja.miningPerHour))}
						<HudValue>{thousands(hoja.miningPerHour)} m³/h</HudValue>
					</div>
				{/if}

				{@render seccion('Movilidad y capacidad', '')}
				<div class="grid w-full grid-cols-2 gap-x-4 gap-y-[0.6rem] xs:grid-cols-4 lg:grid-cols-2">
					{#each [...mobility, ...capacity] as row (row.label)}
						{@render reading(row)}
					{/each}
				</div>
			</div>
		</TitledPanel>
	</div>
</div>
