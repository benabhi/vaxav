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
	import BudgetStrip from '$lib/components/game/BudgetStrip.svelte';
	import SlotRack from '$lib/components/game/SlotRack.svelte';
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
		slotKindLabel,
		tenths,
		thousands
	} from '$lib/format';
	import { roundHalfEven } from '$lib/game/math';
	import { DAMAGE_TYPES } from '$lib/game/damage';
	import { buildReadout, fitFromCodes, maxedSkills } from '$lib/game/fitting';
	import { getHull } from '$lib/game/hulls';
	import { availableForSlot } from '$lib/game/inventory';
	import { getModule } from '$lib/game/modules';
	import { getSkill } from '$lib/game/skills';
	import { SLOT_ORDER, buildSlotGroups, fittedModules, moduleSummary } from '$lib/rig';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let ship = $derived(data.ship);
	let hull = $derived(getHull(ship.hullCode));
	let modules = $derived(fittedModules(ship.hullCode, ship.fitted));

	/** Qué ranura está abierta, o -1 si ninguna. */
	let selected = $state(-1);

	/**
	 * Qué columnas están plegadas.
	 *
	 * **Es estado de interfaz y vive en el navegador**, como plegar una rama del
	 * árbol: no cambia la partida y no vale una ida y vuelta al servidor.
	 *
	 * Las dos de la derecha compiten por el mismo ancho y no se usan al mismo
	 * tiempo: mientras se elige un módulo manda el catálogo; cuando se quiere leer
	 * en qué quedó la nave, manda la hoja. Cualquiera de las dos se pliega para
	 * darle su ancho a la otra, y ninguna desaparece: queda un riel que dice qué
	 * hay adentro y vuelve a abrirse de un clic.
	 */
	let plegado = $state(false);
	let plegadaHoja = $state(false);
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

	/**
	 * Un cambio escrito con su signo: «+120», «−4», «+0,3».
	 *
	 * Con `decimal` la cifra viene en **décimas** y se escribe con su coma, que es
	 * como se muestra al lado. Sin eso, montar un optimizador que sube el warp tres
	 * décimas decía «+3» debajo de un «5,0»: el mismo número contado en dos escalas
	 * distintas, y la diferencia entre una mejora chica y una enorme.
	 */
	function firmado(valor: number, decimal = false): string {
		const magnitud = Math.abs(valor);
		return `${valor > 0 ? '+' : '−'}${decimal ? tenths(magnitud) : thousands(magnitud)}`;
	}

	/**
	 * La recarga en décimas de unidad por segundo, que es como se lee.
	 *
	 * La hoja la lleva por hora porque así la gastan las reglas, y el renglón la
	 * dice por segundo. La cuenta vive acá y no adentro de la fila para que la cifra
	 * y su diferencia salgan **de la misma escala**: mientras el valor se convertía
	 * y el cambio no, un módulo mostraba «+3.600» al lado de un «1,0 u/s».
	 */
	function rechargePerSecond(perHour: number): number {
		return Math.round((perHour / 3600) * 10);
	}

	/** Cómo se llama lo que se está simulando, para el aviso de la hoja. */
	let previewLabel = $derived(
		preview === null ? '' : preview === '' ? 'la ranura vacía' : getModule(preview).name
	);

	/**
	 * La terna del casco: anclajes, consolas y bastidor.
	 *
	 * Es **lo primero que se lee de una nave** y lo que la identifica de un
	 * vistazo, venga el jugador de donde venga: un `2·4·3` dice qué clase de nave
	 * es antes que el nombre. Dice lo mismo que la silueta del anillo, en cifras,
	 * que es la regla de toda figura de Vaxav — el dibujo dice cuál y la lista dice
	 * cuánto.
	 *
	 * Los refuerzos quedan afuera de la terna a propósito: son tres en casi todos
	 * los cascos, así que no distinguen a ninguno, y van en su propio renglón.
	 */
	let terna = $derived(
		SLOT_ORDER.filter((kind) => kind !== 'rig')
			.map((kind) => hull.slots.filter((slot) => slot.kind === kind).length)
			.join('·')
	);
	let refuerzos = $derived(hull.slots.filter((slot) => slot.kind === 'rig').length);
	let groups = $derived(buildSlotGroups(ship.hullCode, ship.fitted, selected));

	let hasSelection = $derived(selected >= 0 && selected < hull.slots.length);
	let slotSpec = $derived(hasSelection ? hull.slots[selected] : null);
	let selectedIsRig = $derived(slotSpec?.kind === 'rig');
	let selectedTitle = $derived(
		slotSpec ? `${slotKindLabel(slotSpec.kind)} · clase ${slotSpec.size}` : ''
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
			availableForSlot(slotSpec.kind, slotSpec.size, codes.map(getModule), ship.pilotLevels).map(
				(module) => ({
					module,
					origin,
					units: codes.filter((code) => code === module.code).length
				})
			);

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

	/**
	 * El bono de rol, escrito como se lee: «+5 % … por nivel de Minería».
	 *
	 * **Un casco puede no tener ninguno** —la Pioner, para no empujar al piloto
	 * hacia una especialidad antes de que la elija— y entonces lo dice con todas
	 * las letras, como el renglón de al lado dice «no pide nada». Dejarlo vacío
	 * pondría un ícono solo al lado de la nada.
	 */
	let hullBonus = $derived(
		hull.bonus
			? `+${hull.bonus.percentPerLevel} % de ${bonusTargetLabel(hull.bonus.target)} ` +
					`por nivel de ${getSkill(hull.bonus.skill).name}`
			: 'sin bono de rol'
	);

	/** Cuánto de la recarga se está gastando. */
	let capacitorPercent = $derived(
		hoja.rechargePerHour <= 0
			? hoja.drainPerHour
				? 100
				: 0
			: Math.min(100, roundHalfEven((hoja.drainPerHour * 100) / hoja.rechargePerHour))
	);

	/**
	 * Los cuatro presupuestos, para la banda de arriba.
	 *
	 * Salen de la hoja **simulada** y no de la real, así que señalar un módulo en la
	 * lista ya mueve las barras: es lo que convierte a esta pantalla en una
	 * herramienta de equipamiento en vez de una ficha.
	 */
	let presupuestoBarras = $derived([
		{
			label: 'Grilla',
			value: `${hoja.power.used} / ${hoja.power.total} MW`,
			percent: hoja.power.percent,
			color: 'var(--color-accent)',
			over: hoja.power.over
		},
		{
			label: 'CPU',
			value: `${hoja.computing.used} / ${hoja.computing.total} u`,
			percent: hoja.computing.percent,
			color: 'var(--color-data)',
			over: hoja.computing.over
		},
		{
			label: 'Capacitor',
			value: hoja.stable ? 'estable' : 'no alcanza',
			percent: capacitorPercent,
			color: 'var(--color-warning)',
			over: !hoja.stable
		},
		{
			label: 'Calibración',
			value: `${hoja.calibration.used} / ${hoja.calibration.total}`,
			percent: hoja.calibration.percent,
			color: 'var(--color-text-muted)',
			over: hoja.calibration.over
		}
	]);

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
			// El daño se lleva en décimas, así que su diferencia también: sin esto un
			// cañón que suma 4,5 anunciaba «+45».
			delta: cambio(readout.dps[tipo], hoja.dps[tipo]),
			decimal: true
		}));
	});

	/**
	 * Movilidad: los dos números que deciden el reloj, y la masa que los explica.
	 *
	 * Acá había dos renglones más, «Saltos» y «Alcance», y los dos prometían un
	 * límite que ya no existe: cruzar una puerta es gratis, no pide alcance y tarda
	 * lo mismo para cualquier nave. **Un dato se muestra en las naves que lo usan,
	 * no en todas.**
	 *
	 * Y había un tercero, «Velocidad», que era la sub-warp: **desde que un viaje es
	 * alineación más warp, esa cifra no mueve ningún reloj.** Se sigue calculando
	 * —es la de maniobrar cerca de otra nave— pero mostrarla en la hoja era
	 * prometer que subirla acorta un viaje, que es la clase de mentira que el
	 * jugador descubre midiendo.
	 *
	 * Las dos que quedan **no van juntas, y ése es el punto**: la Alabarda cruza
	 * más rápido que la Percal y alinea peor que el Vencejo. Una nave se elige
	 * contra el trayecto, no contra un único número de movilidad.
	 *
	 * La masa encabeza porque es la causa: pegada a la alineación, montar una placa
	 * mueve las dos cifras una debajo de la otra y se ve de dónde salió el segundo
	 * de más. El warp va último porque casi nada lo toca — sólo el optimizador.
	 *
	 * Nada de esto vuelve por capricho: cuando exista el motor de salto de las
	 * capitales, el alcance y la autonomía vuelven acá, y **sólo en los cascos que
	 * lo tengan**.
	 */
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
			// Lo que se paga por salir, gane o no el viaje: no depende de la distancia.
			// Menos es mejor, como la masa de la que sale.
			label: 'Alineación',
			value: String(hoja.alignSeconds),
			unit: 's',
			delta: cambio(readout.alignSeconds, hoja.alignSeconds),
			lowerIsBetter: true
		},
		{
			// Lo único que escala con la distancia. Va en décimas, así que su
			// diferencia también.
			label: 'Warp',
			value: tenths(hoja.warpSpeed),
			unit: 'ud/s',
			delta: cambio(readout.warpSpeed, hoja.warpSpeed),
			decimal: true,
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
			unit: 'u',
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
		// Elegir una ranura con el catálogo plegado no haría nada visible, que es la
		// peor respuesta posible a un clic. Se despliega solo.
		if (selected >= 0) plegado = false;
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
{#snippet chip(delta: number | null, lowerIsBetter = false, decimal = false)}
	{#if delta !== null}
		{@const mejora = lowerIsBetter ? delta < 0 : delta > 0}
		<span class="shrink-0 font-mono text-[0.7rem] {mejora ? 'text-success' : 'text-danger'}">
			{firmado(delta, decimal)}
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
	/** La cifra y su diferencia vienen en décimas: se escriben con coma. */
	decimal?: boolean;
	percent?: number;
	over?: boolean;
})}
	<div class="flex w-full flex-col gap-[0.25rem]">
		<div class="flex w-full items-baseline gap-2">
			<Label>{row.label}</Label>
			<div class="grow"></div>
			{@render chip(row.delta ?? null, row.lowerIsBetter ?? false, row.decimal ?? false)}
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
				existiera cuando hay algo que escribir, las filas sin unidad —hoy sólo la
				firma— se correrían a la derecha para ocupar ese lugar y las cifras dejarían
				de caer en una columna, que es justamente lo que hace que esto se lea como
				un tablero.
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
		label: 'Grilla',
		value: `${hoja.power.used} / ${hoja.power.total}`,
		unit: 'MW',
		delta: cambio(readout.power.used, hoja.power.used),
		lowerIsBetter: true,
		percent: hoja.power.percent,
		over: hoja.power.over
	})}
	{@render linea({
		label: 'CPU',
		value: `${hoja.computing.used} / ${hoja.computing.total}`,
		unit: 'u',
		delta: cambio(readout.computing.used, hoja.computing.used),
		lowerIsBetter: true,
		percent: hoja.computing.percent,
		over: hoja.computing.over
	})}
	{@render linea({
		label: 'Capacitor',
		value: `${hoja.capacitor}`,
		unit: 'u',
		delta: cambio(readout.capacitor, hoja.capacitor),
		percent: capacitorPercent,
		over: !hoja.stable
	})}
	{@render linea({
		label: 'Recarga',
		value: tenths(rechargePerSecond(hoja.rechargePerHour)),
		unit: 'u/s',
		delta: cambio(
			rechargePerSecond(readout.rechargePerHour),
			rechargePerSecond(hoja.rechargePerHour)
		),
		decimal: true
	})}
	{#if !hoja.stable}
		<p class="text-1 text-warning">
			El capacitor no sostiene lo encendido: el trabajo rinde en proporción a lo que la recarga
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

		{#if selectedIsRig}
			<p class="text-1 text-text-muted">Un refuerzo se suelda al casco: sacarlo lo destruye.</p>
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
		<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
			<DisplayTitle>{hull.name}</DisplayTitle>
			<!--
				La terna, al lado del nombre. Dice qué clase de nave es antes de que se
				lea una palabra, y es la misma cifra que dibuja la silueta del anillo.
			-->
			<span class="flex items-baseline gap-2">
				<span class="font-mono text-4 leading-none tracking-[0.12em] text-text-strong">
					{terna}
				</span>
				<span class="font-mono text-1 text-text-muted">+{refuerzos}r</span>
			</span>
		</div>
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

	<!--
		El bono de rol, **y también cuando no hay ninguno**: la Pioner no tiene.

		El renglón se queda, con la misma forma en todos los cascos: comparar dos
		naves es leer los mismos tres datos en el mismo orden, y un dato que aparece
		en una ficha y desaparece en la otra obliga a buscarlo de nuevo cada vez.

		Pero se apaga. **Una estrella llena anunciando que no hay nada se contradice
		sola**: en este HUD el relleno es lo encendido. Sin bono va la estrella en
		`light` —el mismo dibujo en reposo, que además queda hueca— y el texto en
		gris, igual que el «no pide nada» del renglón de al lado. Los dos son la
		misma clase de respuesta y se escriben igual.
	-->
	<span class="flex items-center gap-[0.35rem]">
		<Icon
			name="star"
			weight={hull.bonus ? 'fill' : 'light'}
			size="0.7rem"
			class="shrink-0 {hull.bonus ? 'text-accent' : 'text-text-muted'}"
		/>
		<span class="text-1 {hull.bonus ? 'text-text-body' : 'text-text-muted'}">{hullBonus}</span>
	</span>

	<!--
		Qué hay que saber para volarla, **contado y no listado**. Lo que importa de un
		vistazo es si falta algo; cuáles son es la segunda pregunta, y va adentro.
	-->
	<span class="flex items-center gap-[0.35rem]">
		<Label>Requisitos</Label>
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
	La banda de presupuestos, arriba de todo y siempre a la vista.

	Es el micro-juego que hace buena a esta pantalla: los presupuestos están
	apretados a propósito, así que la barra crece **mientras mirás la ranura que
	estás llenando**. Señalando un módulo de la lista, las cuatro barras muestran ya
	cómo quedaría la nave — que es lo que convierte a esto en una herramienta de
	equipamiento y no en una ficha.
-->
<BudgetStrip bars={presupuestoBarras} />

<!--
	La bancada, en **tres columnas**: las ranuras, qué entra en la que está abierta,
	y en qué queda la nave.

	La del medio es la que arregla el problema que tenía esto. Con el catálogo
	abriéndose debajo de su bandeja, elegir una ranura empujaba todo lo que tenía
	abajo y la pantalla entera se movía en cada clic — justo cuando uno está
	comparando dos módulos y necesita que las cifras se queden quietas. Con su
	propia columna, abrir una ranura **no mueve un píxel de las otras dos**.

	Cada columna se desplaza por dentro en pantalla grande, así que la bancada mide
	siempre lo mismo tenga el casco cinco ranuras o dieciséis. El `min-h-0` es lo
	que lo hace posible: sin él, un hijo de flex no se deja achicar por debajo de su
	contenido y la barra no aparece nunca.

	En un teléfono se apilan en el orden en que se usan: primero las ranuras, que es
	lo que se toca; después qué entra; al final la hoja.
-->
<div class="flex w-full flex-col items-stretch gap-5 md:h-[32rem] md:flex-row lg:h-[34rem]">
	<!-- Las ranuras. -->
	<div
		class="flex w-full min-w-0 flex-[3_1_0] flex-col gap-4 scroll-smooth md:h-full md:min-h-0
			md:overflow-y-auto md:pr-1"
	>
		{#each groups as group (group.kind)}
			<SlotRack {group} onChoose={chooseSlot} />
		{/each}
	</div>

	<!--
		Qué entra en la ranura abierta.

		**Se pliega**, y es lo que resuelve que ésta y la hoja compitan por el mismo
		ancho: no se usan al mismo tiempo. Mientras se elige un módulo manda el
		catálogo; cuando se quiere leer en qué quedó la nave, estorba. Plegado queda
		un riel de dos centímetros que dice qué ranura está abierta y vuelve a
		abrirse de un clic, así que no se pierde el lugar.
	-->
	<div
		class="flex w-full min-w-0 flex-col border-border-soft transition-[flex] md:h-full
			md:min-h-0 md:border-l md:pl-4
			{plegado ? 'md:w-[2.5rem] md:flex-none md:pl-2' : 'md:flex-[5_1_0]'}"
	>
		<div class="flex w-full items-center gap-2 pb-2 {plegado ? 'md:flex-col' : ''}">
			<!--
				El plegado sólo existe en pantalla ancha: apiladas en un teléfono, las
				columnas no compiten por nada y esconder una sería esconder contenido.
			-->
			<button
				type="button"
				onclick={() => (plegado = !plegado)}
				aria-expanded={!plegado}
				title={plegado ? 'Mostrar qué entra en la ranura' : 'Plegar para leer la hoja'}
				class="hidden shrink-0 cursor-pointer items-center gap-[0.3rem] border border-border-soft
					bg-transparent px-[0.35rem] py-[0.25rem] text-text-muted transition-colors
					hover:border-border hover:text-accent-bright md:flex"
			>
				<Icon name={plegado ? 'caret-right' : 'caret-left'} weight="bold" size="0.7rem" />
			</button>

			{#if !plegado}
				<span
					class="min-w-0 truncate font-display text-[0.64rem] font-bold tracking-label
						text-accent-dim uppercase"
				>
					{hasSelection ? selectedTitle : 'Qué entra'}
				</span>
			{/if}
		</div>

		{#if plegado}
			<!--
				Plegado, el riel sigue diciendo qué ranura está abierta: una columna que
				desaparece sin dejar rastro hace dudar de si se cerró algo importante.
			-->
			<span
				class="hidden font-display text-[0.6rem] tracking-label whitespace-nowrap text-text-muted
					uppercase [writing-mode:vertical-rl] md:inline"
			>
				{hasSelection ? selectedTitle : 'Qué entra'}
			</span>
		{:else}
			<div
				class="flex w-full min-w-0 flex-col scroll-smooth md:min-h-0 md:flex-1 md:overflow-y-auto"
			>
				{#if hasSelection}
					{@render equipamiento()}
				{:else}
					<!--
						La única instrucción de la pantalla, y sólo mientras haga falta: apenas
						se abre una ranura desaparece, porque ya se aprendió.
					-->
					<p class="text-1 text-text-muted">
						Tocá una ranura para ver qué le entra. Señalando un módulo, la hoja y las barras de
						arriba muestran cómo quedaría la nave antes de montarlo.
					</p>
				{/if}
			</div>
		{/if}
	</div>

	<!--
		En qué se convirtió la nave que se armó. A la derecha y no abajo: es lo que
		hay que mirar **mientras** se prueba un módulo, y abajo obligaría a
		desplazarse en cada cambio.

		Con el catálogo plegado se queda con su ancho, y ahí las lecturas dejan de
		amontonarse en una columna flaca: pasan a dos y se leen como un tablero.
	-->
	<div
		class="flex w-full min-w-0 flex-col border-border-soft transition-[flex] md:h-full
			md:min-h-0 md:border-l md:pl-4
			{plegadaHoja ? 'md:w-[2.5rem] md:flex-none md:pl-2' : 'md:flex-[4_1_0]'}"
	>
		<div class="flex w-full items-center gap-2 pb-2">
			<button
				type="button"
				onclick={() => (plegadaHoja = !plegadaHoja)}
				aria-expanded={!plegadaHoja}
				title={plegadaHoja ? 'Mostrar la hoja de rendimiento' : 'Plegar para ver el catálogo'}
				class="hidden shrink-0 cursor-pointer items-center border border-border-soft bg-transparent
					px-[0.35rem] py-[0.25rem] text-text-muted transition-colors hover:border-border
					hover:text-accent-bright md:flex"
			>
				<Icon name={plegadaHoja ? 'caret-left' : 'caret-right'} weight="bold" size="0.7rem" />
			</button>

			{#if !plegadaHoja}
				<span
					class="min-w-0 truncate font-display text-[0.64rem] font-bold tracking-label
						text-accent-dim uppercase"
				>
					Hoja de rendimiento
				</span>
			{/if}
		</div>

		{#if plegadaHoja}
			<span
				class="hidden font-display text-[0.6rem] tracking-label whitespace-nowrap text-text-muted
					uppercase [writing-mode:vertical-rl] md:inline"
			>
				Hoja de rendimiento
			</span>
		{:else}
			<div
				class="flex w-full min-w-0 flex-col gap-4 scroll-smooth md:min-h-0 md:flex-1 md:overflow-y-auto"
			>
				{#if futuro}
					<div
						class="flex w-full items-center gap-2 border-l-[3px] border-l-data bg-data-wash px-3
					py-[0.4rem]"
					>
						<Icon name="eye-slash" weight="duotone" size="0.85rem" class="shrink-0 text-data" />
						<span class="text-1 text-text-body">
							Así quedaría con <span class="text-data">{previewLabel}</span>
						</span>
					</div>
				{/if}

				<!--
			Con el catálogo plegado, la hoja se queda con su ancho y las lecturas
			pasan a dos columnas: dejan de amontonarse en una tira flaca y se leen
			como un tablero.
		-->
				<div class="grid w-full gap-x-5 gap-y-4 {plegado ? 'sm:grid-cols-2' : 'grid-cols-1'}">
					{@render celda('Aguante', `flojo: ${damageTypeShort(hoja.weakSpot)}`, defensa)}
					{@render celda('Capacidad', '', capacidad)}
					<!--
						La agilidad va **en el encabezado y no en un renglón**: es de dónde sale
						la alineación —masa por inercia, con Maniobra descontada—, no algo que se
						lea aparte. Como renglón repetiría a la masa con otra escala, porque la
						inercia del casco no cambia: dos cifras que se mueven siempre juntas son
						una sola contada dos veces. Acá dice de dónde viene el segundo de más sin
						cobrarle una fila a una columna que en un teléfono es angosta.
					-->
					{@render celda('Movilidad', `agilidad ${thousands(hoja.agility)}`, movilidad)}
					{@render celda('Presupuestos', '', presupuestos)}
				</div>
			</div>
		{/if}
	</div>
</div>
