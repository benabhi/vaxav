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
	import Label from '$lib/components/typography/Label.svelte';
	import type { Snippet } from 'svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import FloatingPanel from '$lib/components/cards/FloatingPanel.svelte';
	import {
		bonusTargetLabel,
		damageTypeShort,
		moduleIcon,
		requirementLabel,
		slotKindIcon,
		slotKindLabel,
		tenths,
		thousands
	} from '$lib/format';
	import { roundHalfEven } from '$lib/game/math';
	import { DAMAGE_TYPES } from '$lib/game/damage';
	import { buildReadout, fitFromCodes, maxedSkills } from '$lib/game/fitting';
	import { jumpsWithFuel } from '$lib/game/jumps';
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
	 * Lo que hay en el tanque, acotado a lo que entra.
	 *
	 * Se acota porque desmontar un tanque deja la nave con más combustible del que
	 * puede llevar hasta que el servicio lo recorte, y una ficha que dice
	 * `140 / 120` se lee como un error del juego.
	 */
	let combustible = $derived(Math.min(ship.fuel, hoja.fuel));

	/** Los saltos que permite lo que hay, no lo que entraría con el tanque lleno. */
	let saltos = $derived(jumpsWithFuel(combustible, hoja.mass));

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
			// La capa más floja se pinta como un problema, porque eso es: por ahí te
			// van a romper.
			over: tipo === hoja.weakSpot,
			delta: cambio(readout.effectiveHp[tipo], hoja.effectiveHp[tipo])
		}));
	});

	/** Daño por segundo de cada tipo, que es como se compara un armamento. */
	let damage = $derived.by(() => {
		const techo = Math.max(...Object.values(hoja.dps)) || 1;
		return DAMAGE_TYPES.map((tipo) => ({
			label: `Daño ${damageTypeShort(tipo)}`,
			value: tenths(hoja.dps[tipo]),
			percent: roundHalfEven((hoja.dps[tipo] * 100) / techo),
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
			// **Los saltos que puede hacer ahora**, no los que entrarían con el tanque
			// lleno. La ficha de una nave a medio tanque que promete la autonomía de
			// una llena es la clase de cifra que deja a alguien tirado.
			label: 'Saltos',
			value: String(saltos),
			unit: '',
			delta: cambio(jumpsWithFuel(combustible, readout.mass), saltos),
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
			// Lo que hay sobre lo que entra, con su barra: es la misma forma que los
			// presupuestos de potencia y cómputo, y por la misma razón — lo que
			// importa no es la cifra sola sino cuánto margen queda.
			//
			// La diferencia que marca el simulador es la de la **capacidad**, que es
			// lo que cambia al montar un tanque; lo que hay adentro no lo mueve
			// ningún módulo.
			label: 'Combustible',
			value: `${combustible} / ${hoja.fuel}`,
			unit: '',
			delta: cambio(readout.fuel, hoja.fuel),
			lowerIsBetter: false,
			percent: hoja.fuel > 0 ? Math.round((combustible * 100) / hoja.fuel) : 0
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

	/**
	 * Lo que el casco pide para volarse, y si el piloto lo cumple.
	 *
	 * Se mira contra los niveles de verdad y no contra los del modo "con todo
	 * entrenado": ese modo es para comparar equipamiento, y un requisito que se
	 * pone en verde porque uno activó una simulación sería una mentira.
	 */
	let hullRequirements = $derived(
		hull.requirements.map((requisito) => ({
			label: requirementLabel(requisito),
			met: (ship.pilotLevels[requisito.skill] ?? 0) >= requisito.level
		}))
	);

	/** Cuántos requisitos del casco le faltan al piloto. */
	let missingHull = $derived(hullRequirements.filter((requisito) => !requisito.met).length);

	/** El banco de trabajo, para poder acomodarle el desplazamiento. */
	let banco = $state<HTMLElement>();

	/**
	 * Al abrir una ranura, el banco se acomoda para dejarla arriba.
	 *
	 * Sin esto, tocar una del anillo abre una fila que puede estar fuera de la
	 * parte visible de la lista: el jugador aprieta, no pasa nada a la vista, y
	 * tiene que ir a buscar qué se abrió. Con la fila arriba, lo que se abrió y sus
	 * opciones quedan a la mano sin mover la mano.
	 *
	 * Se mide con rectángulos y no con `offsetTop` porque eso último depende de
	 * quién sea el padre posicionado, y acá el contenedor cambia de altura al
	 * abrirse la fila.
	 */
	$effect(() => {
		// Leer `selected` es lo que hace que esto vuelva a correr al cambiar de
		// ranura; sin la lectura, el efecto no se suscribe a nada.
		if (selected < 0 || !banco) return;

		const fila = banco.querySelector<HTMLElement>('[aria-expanded="true"]');
		if (!fila) return;

		// Se asigna la posición en vez de pedir `scrollBy` con `behavior: 'smooth'`:
		// hay navegadores donde ese modo simplemente no hace nada, y entonces el
		// acomodo no ocurre en absoluto. Con la asignación siempre pasa, y quien
		// pueda animarlo lo anima por el `scroll-smooth` del contenedor.
		banco.scrollTop += fila.getBoundingClientRect().top - banco.getBoundingClientRect().top;
	});

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
	Un renglón de la consola: **la forma que tienen todos**.

	Rótulo a la izquierda, cifra a la derecha y la barra cruzando debajo cuando hay
	algo que medir contra un tope. Que sea siempre igual es lo que hace que los
	cuatro grupos se lean como un tablero y no como cuatro listas apiladas: las
	cifras caen en la misma columna y el ojo baja por ellas sin reaprender nada.

	`percent` es opcional porque no todo se mide contra un tope: la masa y la
	velocidad no tienen máximo, la potencia sí. `over` pinta en rojo lo que se pasó
	—un presupuesto reventado o la capa más floja— en vez de impedirlo: el jugador
	tiene que poder armar algo imposible y **ver** por qué no cierra.
-->
{#snippet linea(row: {
	label: string;
	value: string;
	unit?: string;
	delta?: number | null;
	lowerIsBetter?: boolean;
	percent?: number;
	over?: boolean;
})}
	<div class="flex w-full flex-col gap-[0.25rem]">
		<div class="flex w-full items-baseline gap-2">
			<Label>{row.label}</Label>
			<div class="grow"></div>
			{@render chip(row.delta ?? null, row.lowerIsBetter ?? false)}
			<!--
				Sin cortar: un valor de dos partes —`120 / 120`, `12 / 40`— parte en dos
				renglones apenas las cifras crecen, y la fila deja de leerse como una
				línea de tablero. El espacio lo cede el hueco de la izquierda, que para
				eso está.
			-->
			<span
				class="font-mono text-[0.88rem] whitespace-nowrap {row.over ? 'text-danger' : 'text-data'}"
			>
				{row.value}
			</span>
			<!--
				La caja de la unidad se dibuja **siempre**, tenga unidad o no. Si sólo
				existiera cuando hay algo que escribir, las filas sin unidad —saltos,
				combustible, firma— se correrían a la derecha para ocupar ese lugar y las
				cifras dejarían de caer en una columna, que es justamente lo que hace que
				esto se lea como un tablero.
			-->
			<span class="w-[2.2rem] shrink-0 text-1 text-text-muted">{row.unit ?? ''}</span>
		</div>
		{#if row.percent !== undefined}
			<ProgressBar
				percent={row.percent}
				color={row.over ? 'var(--color-danger)' : 'var(--color-accent)'}
			/>
		{/if}
	</div>
{/snippet}

<!--
	Una esfera del tablero: su nombre arriba y sus renglones debajo.

	La línea vertical que la separa de la anterior es lo único que las divide, y es
	a propósito: un marco por grupo los convertiría en cuatro tarjetas, y lo que
	son es cuatro partes del mismo aparato.
-->
{#snippet celda(name: string, detail: string, body: Snippet)}
	<div
		class="flex min-w-0 flex-col gap-[0.55rem] lg:[&:not(:first-child)]:border-l
			lg:[&:not(:first-child)]:border-border-soft lg:[&:not(:first-child)]:pl-6
			sm:[&:nth-child(2n)]:border-l sm:[&:nth-child(2n)]:border-border-soft
			sm:[&:nth-child(2n)]:pl-6"
	>
		<div class="flex w-full items-baseline gap-2 border-b border-border-soft pb-[0.35rem]">
			<span class="font-display text-1 font-bold tracking-label text-accent-dim uppercase">
				{name}
			</span>
			<div class="grow"></div>
			{#if detail}
				<span class="font-mono text-[0.66rem] text-text-muted">{detail}</span>
			{/if}
		</div>
		{@render body()}
	</div>
{/snippet}

{#snippet presupuestos()}
	{@render linea({
		label: 'Potencia',
		value: `${hoja.power.used} / ${hoja.power.total}`,
		unit: 'MW',
		delta: cambio(readout.power.used, hoja.power.used),
		lowerIsBetter: true,
		percent: hoja.power.percent,
		over: hoja.power.over
	})}
	{@render linea({
		label: 'Cómputo',
		value: `${hoja.computing.used} / ${hoja.computing.total}`,
		unit: 'u',
		delta: cambio(readout.computing.used, hoja.computing.used),
		lowerIsBetter: true,
		percent: hoja.computing.percent,
		over: hoja.computing.over
	})}
	{@render linea({
		label: 'Acumulador',
		value: `${hoja.capacitor}`,
		unit: 'u',
		delta: cambio(readout.capacitor, hoja.capacitor),
		percent: capacitorPercent,
		over: !hoja.stable
	})}
	{@render linea({
		label: 'Recarga',
		value: tenths(Math.round((hoja.rechargePerHour / 3600) * 10)),
		unit: 'u/s',
		delta: cambio(readout.rechargePerHour, hoja.rechargePerHour)
	})}
	{#if !hoja.stable}
		<p class="text-1 text-warning">
			El acumulador no sostiene lo encendido: el trabajo rinde en proporción a lo que la recarga
			paga.
		</p>
	{/if}
{/snippet}

{#snippet defensa()}
	{#each effectiveHp as row (row.label)}
		{@render linea(row)}
	{/each}
	{#if hoja.totalDps > 0}
		{#each damage as row (row.label)}
			{@render linea(row)}
		{/each}
	{/if}
{/snippet}

{#snippet movilidad()}
	{#each mobility as row (row.label)}
		{@render linea(row)}
	{/each}
{/snippet}

{#snippet capacidad()}
	{#each capacity as row (row.label)}
		{@render linea(row)}
	{/each}
	<!--
		Lo que la nave **hace**, debajo de lo que la nave **tiene**: la extracción
		sale de la bodega y del láser, así que se lee después.
	-->
	{#if hoja.miningPerHour > 0}
		{@render linea({
			label: 'Extracción',
			value: thousands(hoja.miningPerHour),
			unit: 'm³/h',
			delta: cambio(readout.miningPerHour, hoja.miningPerHour)
		})}
	{/if}
{/snippet}

<!--
	Qué se le puede montar a la ranura abierta.

	**No es un taller**: acá no se fabrica nada, se monta y se desmonta. Es el mismo
	servicio de Equipamiento que ofrece la estación, y por eso se llama igual.
	Fabricar se hace en el Taller, que es otro módulo de estación y se entra desde
	Ubicación.

	Se dibuja **dentro de la fila de su ranura**, en la lista. No es un panel con
	título propio: es el detalle de un renglón, y ponerle marco lo haría parecer
	otra cosa que está al lado en vez de algo que sale de ahí.
-->
{#snippet equipamiento()}
	<div class="flex w-full flex-col gap-2">
		<!--
			Qué ranura es y de qué clase. La fila de arriba dice qué hay montado; esto
			dice qué **cabe**, que es la pregunta de este bloque.
		-->
		<span class="font-display text-1 tracking-label text-accent-dim uppercase">
			{selectedTitle}
		</span>
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

<!--
	La ficha del casco: **una línea**, no un panel.

	Es de la nave y no del equipamiento —qué es, qué la mejora, qué hay que saber
	para volarla—, así que va debajo del título y no entre los instrumentos: se lee
	una vez al entrar y después no se vuelve a mirar, de modo que pelea por el
	renglón de arriba y no por el espacio del medio, donde está lo que se toca.

	Y va **en un renglón que no crece**. Un casco puede pedir una habilidad o
	quince, y una ficha que se estira con cada requisito empuja la herramienta hacia
	abajo justo cuando más cascos haya. Acá el renglón dice **cuántos** y el detalle
	vive detrás del aviso: con uno o con quince, la pantalla mide lo mismo.

	La descripción sigue el mismo criterio. Es sabor, no dato: se lee una vez y
	ocupaba cuatro renglones, así que se guarda detrás del signo de pregunta.
-->
<div
	class="flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-l-[3px] border-l-accent
		bg-surface px-4 py-[0.55rem]"
>
	<span class="flex items-center gap-[0.4rem]">
		<Icon name="rocket" weight="duotone" size="0.85rem" class="shrink-0 text-accent" />
		<span class="font-display text-[0.72rem] font-bold tracking-label text-text-strong uppercase">
			{hull.role}
		</span>
	</span>

	<span class="flex items-center gap-[0.35rem]">
		<Icon name="star" weight="fill" size="0.7rem" class="shrink-0 text-accent" />
		<span class="text-1 text-text-body">{hullBonus}</span>
	</span>

	<!--
		Qué hay que saber para volarla, **contado y no listado**. Lo que importa de un
		vistazo es si falta algo; cuáles son es la segunda pregunta, y va adentro.
	-->
	<span class="flex items-center gap-[0.35rem]">
		<Label>Para volarla</Label>
		{#if hullRequirements.length === 0}
			<span class="text-1 text-text-muted">no pide nada</span>
		{:else}
			<Popover label="Qué pide este casco">
				{#snippet trigger()}
					<span
						class="flex cursor-pointer items-center gap-[0.3rem] transition-colors
							{missingHull > 0 ? 'text-danger' : 'text-text-body hover:text-accent-bright'}"
					>
						<Icon
							name={missingHull > 0 ? 'warning' : 'check'}
							weight="fill"
							size="0.6rem"
							class="shrink-0"
						/>
						<span class="text-1">
							{missingHull > 0
								? `te faltan ${missingHull} de ${hullRequirements.length}`
								: `${hullRequirements.length} ${hullRequirements.length === 1 ? 'habilidad' : 'habilidades'}`}
						</span>
					</span>
				{/snippet}
				<FloatingPanel class="flex max-w-[18rem] flex-col gap-2 p-3">
					<span class="font-display text-1 tracking-label text-accent-dim uppercase">
						Para volar un {hull.name}
					</span>
					{#each hullRequirements as requisito (requisito.label)}
						<span
							class="flex items-center gap-[0.4rem] {requisito.met
								? 'text-text-body'
								: 'text-danger'}"
						>
							<Icon
								name={requisito.met ? 'check' : 'warning'}
								weight="fill"
								size="0.6rem"
								class="shrink-0"
							/>
							<span class="text-2">{requisito.label}</span>
						</span>
					{/each}
				</FloatingPanel>
			</Popover>
		{/if}
	</span>

	<div class="grow"></div>

	<!-- La descripción, guardada: es sabor y se lee una vez. -->
	<Popover label="Qué es este casco">
		{#snippet trigger()}
			<Icon
				name="question"
				weight="bold"
				size="0.75rem"
				class="text-text-muted transition-colors hover:text-accent-bright"
			/>
		{/snippet}
		<FloatingPanel class="flex max-w-[22rem] flex-col gap-1 p-3">
			<span class="font-display text-1 tracking-label text-accent-dim uppercase">{hull.name}</span>
			<BodyText>{hull.description}</BodyText>
		</FloatingPanel>
	</Popover>
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

<!--
	La bancada de equipamiento: **la nave y su banco de trabajo arriba, la consola
	de lecturas abajo**.

	Arriba, dos columnas de alto parejo: el anillo es la identidad y no se toca
	mientras se trabaja, y la lista es el banco, donde cada ranura se abre en su
	lugar. Abajo, de lado a lado, en qué queda la nave. Es la disposición de una
	cabina —parabrisas arriba, consola abajo— y por eso se lee sola.

	El corte es `md` y no `lg`: a partir de novecientos noventa y dos píxeles ya
	entran las dos columnas, y dejar la disposición de teléfono hasta los mil
	doscientos ochenta le daba una pantalla apilada a un portátil que tiene ancho
	de sobra.

	El reparto de oficios es lo que resuelve el problema que tenía esta pantalla.
	Un anillo informa por su forma pero **no tiene un costado donde abrir un panel**
	—sus ranuras están repartidas en trescientos sesenta grados—, así que todo
	selector que le colgara iba a tapar algo o a correr el dibujo. Separando figura
	de banco de trabajo, no hay nada que acomodar: la fila se abre donde está.
-->
<div class="flex w-full flex-col items-start gap-5 md:h-[28rem] md:flex-row md:items-stretch">
	<!--
		El emblema. Grande, quieto y sin nada encima: es lo que hace que esta
		pantalla se reconozca antes de leer una palabra, y lo único del juego que se
		organiza alrededor de un círculo.

		Sigue siendo clickeable —tocar una ranura abre su fila en la lista— pero ya no
		carga con el trabajo: refleja lo que pasa, incluido lo que estás por montar.
	-->
	<div
		class="flex w-full flex-col items-center gap-3 md:h-full md:w-[20rem] md:shrink-0 lg:w-[23rem]"
	>
		<FittingRig {slots} onChoose={chooseSlot} hasShield={hoja.shield > 0} />
		<IntegrityReadings
			shield={thousands(hoja.shield)}
			armor={thousands(hoja.armor)}
			structure={thousands(hoja.structure)}
		/>

		<!--
			Las cuatro categorías del anillo, en una línea. Ahora que cada una ocupa su
			propio arco, esta línea es su leyenda: dice qué significa cada tramo del
			círculo.
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
		El banco de trabajo. Cada ranura se abre en su lugar y muestra qué le entra;
		lo único que se mueve es lo que está debajo de esa fila.

		**Se desplaza por dentro** en pantalla grande, y ésa es la última pieza que
		faltaba. Dos columnas que comparten el borde de arriba y no el de abajo se
		leen como algo a medio terminar, y encima ésta crecía al abrir una ranura: la
		página se estiraba y la otra quedaba corta. Con el alto fijo de la bancada,
		abrir una ranura no mueve el alto de nada.

		Las veintiocho rem son las que mide el anillo con sus lecturas debajo: la
		bancada mide lo que mide la nave, y el banco se acomoda a eso. El `min-h-0`
		es lo que hace posible el desplazamiento: sin él, un hijo de flex no se deja
		achicar por debajo de su contenido y la barra nunca aparece.
	-->
	<div
		bind:this={banco}
		class="flex w-full min-w-0 flex-[1_1_0] flex-col gap-3 scroll-smooth md:h-full md:min-h-0
			md:overflow-y-auto"
	>
		<SlotList {groups} onChoose={chooseSlot} detail={equipamiento} />

		{#if !hasSelection}
			<!--
				La única instrucción de la pantalla, y sólo mientras haga falta: apenas se
				abre una ranura desaparece, porque ya se aprendió.
			-->
			<p class="text-1 text-text-muted">
				Abrí una ranura —acá o en el anillo— para ver qué le entra. Señalando un módulo, la hoja
				muestra cómo quedaría la nave antes de montarlo.
			</p>
		{/if}
	</div>
</div>

<!--
	La hoja de rendimiento: en qué se convirtió la nave que se armó.

	Va **abajo y de lado a lado**, no en una tercera columna. Apilada en vertical
	era una torre que medía el doble que el anillo, y dos columnas que comparten el
	borde de arriba pero no el de abajo se leen como algo a medio terminar.
	Acostada, sus cuatro grupos caben en paralelo y la banda entera mide lo que
	mide un grupo: deja de ser una torre y pasa a ser la consola de abajo de una
	cabina, que es exactamente lo que es.

	**Todos los renglones tienen la misma forma**, y ésa es la diferencia entre un
	tablero y cuatro listas juntas: rótulo a la izquierda, cifra a la derecha
	alineada con las de arriba y las de abajo, y la barra —cuando la hay— cruzando
	debajo. Antes cada grupo usaba su propia gramática —uno con el rótulo encima,
	otro al costado, unos con barra y otros no— y el ojo tenía que reaprender a
	leer cuatro veces en la misma banda.

	Los grupos se separan con una línea vertical y no con un marco cada uno: son
	**cuatro esferas de un mismo aparato**, no cuatro tarjetas que se juntaron.
-->
<TitledPanel title="Hoja de rendimiento" detail={hull.name} class="w-full">
	<div class="flex w-full flex-col gap-4">
		<!--
			Que lo que se está mirando es una simulación y no la nave. Va **dentro** de
			la banda y cruzándola entera: es una advertencia sobre todo lo que sigue,
			no un panel aparte. Sin esto, las cifras cambian solas al pasar el dedo por
			la lista y uno no sabe si ya montó algo sin querer.
		-->
		{#if futuro}
			<div
				class="flex w-full items-center gap-2 border-l-[3px] border-l-data bg-data-wash px-3 py-[0.4rem]"
			>
				<Icon name="eye-slash" weight="duotone" size="0.85rem" class="shrink-0 text-data" />
				<span class="text-1 text-text-body">
					Así quedaría con <span class="text-data">{previewLabel}</span>
				</span>
			</div>
		{/if}

		<div class="grid w-full grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
			{@render celda('Presupuestos', '', presupuestos)}
			{@render celda('Aguante', `flojo: ${damageTypeShort(hoja.weakSpot)}`, defensa)}
			{@render celda('Movilidad', '', movilidad)}
			{@render celda('Capacidad', '', capacidad)}
		</div>
	</div>
</TitledPanel>
