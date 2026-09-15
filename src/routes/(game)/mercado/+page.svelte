<!--
	El mercado de la región.

	**La forma es la del mercado de EVE Online**, con la voz de Elite: un árbol de
	categorías a la izquierda para examinar, la lista de la rama elegida a la
	derecha, y al abrir un ítem **una ventana con sus dos libros de órdenes** —
	vendedores arriba, compradores abajo— más el historial de precios.

	La ventana es una ventana y no un panel que se despliega abajo de la tabla: con
	dos libros, un gráfico y los formularios para publicar, desplegarla estiraría la
	página hasta perder de vista la lista de la que uno vino.

	**Mirar se puede desde cualquier parte; operar exige un mostrador.** El catálogo
	y los precios son información y se ven siempre —parado en un cinturón con la
	bodega llena, saber a cuánto se paga el iridio es lo que decide adónde ir—. Los
	botones sólo aparecen atracado en una estación con módulo de Mercado, y cuando
	no se puede la pantalla dice por qué en vez de esconderlos sin explicación.

	La figura de la pantalla es **el historial**: es lo que dice por su forma si un
	precio es bueno, que es la pregunta de todo el módulo.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import PriceChart from '$lib/components/game/PriceChart.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { CONTROL_HEIGHTS } from '$lib/components/buttons/estilos';
	import { tenths, thousands } from '$lib/format';
	import type { FilaMercado, LibroMercado } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let market = $derived(data.market);

	/** Estado de pantalla: nada de esto viaja al servidor. */
	let group = $state('held');
	let search = $state('');
	let open = $state(false);
	let chosen = $state<FilaMercado | null>(null);
	let book = $state<LibroMercado | null>(null);
	let loading = $state(false);
	/** Cuántas unidades mueve el próximo pedido. */
	let units = $state(1);
	/**
	 * De qué lado del mostrador se entró.
	 *
	 * La fila del catálogo ya lo eligió —de la tabla de venta se compra, de la de
	 * compra se vende—, así que la ventana no tiene que volver a preguntarlo.
	 */
	let side = $state<'sell' | 'buy'>('sell');
	/** Si la ventana está mostrando la serie de precios en vez de la orden. */
	let showHistory = $state(false);
	/** Si está abierta la ventana de publicar, que es la otra cosa del mercado. */
	let publishOpen = $state(false);
	/** Lo que se pide al publicar. */
	let price = $state(0);
	let range = $state(0);
	/** Cuántos días queda publicada. Arranca en lo más corto, que es lo más barato de equivocar. */
	let days = $state(1);
	let fromHold = $state<'ship' | 'station'>('ship');

	let roots = $derived(market.groups.filter((rama) => rama.parent === ''));
	function children(code: string) {
		return market.groups.filter((rama) => rama.parent === code);
	}

	/**
	 * Qué se lista a la derecha.
	 *
	 * Buscar **ignora la rama abierta**, como en EVE: quien escribe un nombre
	 * quiere encontrarlo, no que le digan que no está en la categoría donde quedó
	 * parado.
	 */
	let listed = $derived.by(() => {
		const texto = search.trim().toLowerCase();
		if (texto) {
			return market.items.filter(
				(item) => item.name.toLowerCase().includes(texto) || item.tier.toLowerCase().includes(texto)
			);
		}
		if (group === 'held') return market.items.filter((item) => item.held > 0);
		if (group === 'module') return market.items.filter((item) => item.group !== 'ore');
		return market.items.filter((item) => item.group === group);
	});

	/**
	 * Por qué columna se ordena el catálogo, y hacia dónde.
	 *
	 * Es **una sola** para las dos tablas: son la misma lista mirada de dos lados,
	 * y ordenarlas por separado obligaría a acordarse de cómo quedó cada una.
	 */
	let sortBy = $state<'name' | 'tier' | 'price' | 'where' | 'jumps' | 'orders' | 'held'>('name');
	let sortDir = $state<'asc' | 'desc'>('asc');

	/**
	 * Cambia el orden. Clickear la columna que ya ordena da vuelta el sentido, que
	 * es lo que todo el mundo espera de una tabla.
	 */
	function ordenarPor(columna: typeof sortBy) {
		if (sortBy === columna) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else {
			sortBy = columna;
			sortDir = 'asc';
		}
	}

	/** El indicador de la cabecera: sólo lo lleva la columna que manda. */
	function flecha(columna: typeof sortBy): string {
		if (sortBy !== columna) return '';
		return sortDir === 'asc' ? '▲' : '▼';
	}

	/**
	 * Ordena una tabla del catálogo.
	 *
	 * El precio se lee **del lado que la tabla muestra**: en la de venta, lo que
	 * cobran; en la de compra, lo que pagan. Ordenar las dos por el mismo número
	 * dejaría una al revés de lo que dice su encabezado.
	 */
	function ordenar(filas: readonly FilaMercado[], lado: 'sell' | 'buy'): FilaMercado[] {
		const signo = sortDir === 'asc' ? 1 : -1;
		const precio = (item: FilaMercado) => (lado === 'sell' ? item.bestAsk : item.bestBid) ?? 0;
		const ordenes = (item: FilaMercado) => (lado === 'sell' ? item.sellOrders : item.buyOrders);
		const donde = (item: FilaMercado) => (lado === 'sell' ? item.bestAskWhere : item.bestBidWhere);
		// "Acá" antes que cualquier número: lo que está debajo de los pies no cuesta
		// un viaje, y ordenar por saltos es justamente buscar lo más cerca.
		const saltos = (item: FilaMercado) => {
			const etiqueta = lado === 'sell' ? item.bestAskJumps : item.bestBidJumps;
			if (etiqueta === 'Acá') return -1;
			return Number(etiqueta) || 0;
		};

		return [...filas].sort((a, b) => {
			switch (sortBy) {
				case 'tier':
					return signo * (a.size - b.size || a.tier.localeCompare(b.tier));
				case 'price':
					return signo * (precio(a) - precio(b));
				case 'where':
					return signo * donde(a).localeCompare(donde(b));
				case 'jumps':
					return signo * (saltos(a) - saltos(b));
				case 'orders':
					return signo * (ordenes(a) - ordenes(b));
				case 'held':
					return signo * (a.held - b.held);
				default:
					return signo * a.name.localeCompare(b.name);
			}
		});
	}

	/**
	 * La lista partida en los dos lados del mostrador.
	 *
	 * Un ítem puede estar en las dos —lo normal— y eso no es repetirlo: son dos
	 * ofertas distintas. Lo que no tiene órdenes de ningún lado va aparte, porque
	 * sigue existiendo en el catálogo aunque nadie lo esté comerciando.
	 */
	let enVenta = $derived(listed.filter((item) => item.bestAsk !== null));
	let enCompra = $derived(listed.filter((item) => item.bestBid !== null));
	let sinOrdenes = $derived(
		listed.filter((item) => item.bestAsk === null && item.bestBid === null)
	);

	/** La horquilla que le toca a lo que está abierto. */
	let spread = $derived(chosen && chosen.group !== 'ore' ? market.moduleSpread : market.oreSpread);

	/**
	 * Abre un ítem y **recién ahí** pide su libro.
	 *
	 * Traer las órdenes de los cincuenta y un renglones para dibujar la lista sería
	 * pedir miles de filas de las que se miran dos.
	 */
	async function abrir(item: FilaMercado, lado: 'sell' | 'buy' = 'sell') {
		chosen = item;
		side = lado;
		book = null;
		units = 1;
		price = (lado === 'sell' ? item.bestAsk : item.bestBid) ?? item.basePrice;
		range = 0;
		days = market.durations[0]?.days ?? 1;
		showHistory = false;
		fromHold = 'ship';
		open = true;
		loading = true;
		try {
			const respuesta = await fetch(`/mercado/libro/${item.itemCode}`);
			book = respuesta.ok ? await respuesta.json() : null;
		} finally {
			loading = false;
		}
	}

	/** Vuelve a pedir el libro después de operar: la pantalla ya cambió. */
	async function refrescar() {
		if (!chosen) return;
		loading = true;
		try {
			const respuesta = await fetch(`/mercado/libro/${chosen.itemCode}`);
			book = respuesta.ok ? await respuesta.json() : null;
		} finally {
			loading = false;
		}
		await invalidateAll();
	}

	/**
	 * Cerrada una publicación, la ventana del ítem se cierra sola.
	 *
	 * Lo que mostraba quedó viejo en el acto: la mercadería se fue a garantía y
	 * los libros cambiaron. Dejarla abierta con las cifras de antes es peor que
	 * cerrarla.
	 */
	let lastForm = $state<unknown>(null);
	$effect(() => {
		if (form !== lastForm) {
			lastForm = form;
			if (form && 'published' in form && form.published) open = false;
		}
	});

	/**
	 * Cuánto falta para una fecha, escrito corto.
	 *
	 * Lo calcula el navegador y no el servidor por la misma razón que la cuenta
	 * regresiva de la barra de estado: es la hora del jugador, y un "en 3 días"
	 * rendido en el servidor queda viejo apenas se dibuja.
	 */
	function cuando(at: number): string {
		const segundos = Math.max(0, Math.round((at - Date.now()) / 1000));
		if (segundos < 3600) return `en ${Math.max(1, Math.floor(segundos / 60))} min`;
		const horas = Math.floor(segundos / 3600);
		if (horas < 48) return `en ${horas} h`;
		return `en ${Math.floor(horas / 24)} d`;
	}

	/** Lo que tiene el piloto a mano de lo que está abierto. */
	let atHand = $derived(book ? (fromHold === 'ship' ? book.inShip : book.inStation) : 0);

	/** La orden contra la que se opera: la mejor del lado por el que se entró. */
	let orden = $derived(book ? (side === 'sell' ? book.sellers[0] : book.buyers[0]) : null);

	/**
	 * Cuántas unidades se pueden mover de verdad.
	 *
	 * Comprando, el tope es lo que la orden tiene; vendiendo, lo que hay en la
	 * bodega elegida. Recortarlo acá evita mandar un pedido que el servicio va a
	 * rechazar con un número que el jugador ya podía ver.
	 */
	let operables = $derived.by(() => {
		if (!orden) return 0;
		const tope = side === 'sell' ? (orden.quantity ?? units) : Math.min(units, atHand);
		return Math.max(0, Math.min(units, tope));
	});

	let importe = $derived(orden ? orden.price * operables : 0);

	/** Lo que se va a publicar, recortado a lo que hay si es una venta. */
	let publishUnits = $derived(side === 'sell' ? Math.min(units, atHand) : units);

	/** La comisión del corredor sobre lo que se va a publicar. */
	let comision = $derived(
		Math.max(1, Math.round((price * publishUnits * market.brokerPermille) / 1000))
	);
</script>

<svelte:head><title>Mercado · Vaxav</title></svelte:head>
<!--
	Una tabla del catálogo. Es la misma para los dos lados y cambia sólo qué precio
	muestra: tener dos copias sería garantizar que algún día se emprolije una y la
	otra no.
-->
{#snippet catalogo(titulo: string, filas: readonly FilaMercado[], lado: 'sell' | 'buy')}
	<div class="flex w-full flex-col gap-2">
		<div class="flex w-full flex-wrap items-baseline gap-2">
			<Label>{titulo}</Label>
			<div class="grow"></div>
			<span class="font-mono text-[0.68rem] text-text-muted">{filas.length} ítems</span>
		</div>

		<div class="w-full overflow-x-auto">
			<div class="max-h-[20rem] min-w-[28rem] overflow-y-auto">
				<table
					class="w-full border-collapse text-left [&_:is(th,td):first-child]:pl-2
						[&_:is(th,td):last-child]:pr-2"
				>
					<!--
					Las cabeceras ordenan. Un catálogo de cientos de renglones sin poder
					ordenarlo por precio es una lista que hay que leer entera para
					contestar "¿qué es lo más barato?".
				-->
					<thead class="sticky top-0 z-10 bg-well">
						<tr class="border-b border-border-soft">
							{#each [{ code: 'name' as const, label: 'Ítem', right: false }, { code: 'tier' as const, label: 'Clase', right: false }, { code: 'price' as const, label: lado === 'sell' ? 'Te cobran' : 'Te pagan', right: true }, { code: 'where' as const, label: 'Dónde', right: false }, { code: 'jumps' as const, label: 'Saltos', right: true }, { code: 'orders' as const, label: 'Órdenes', right: true }, { code: 'held' as const, label: 'Tuyo', right: true }] as columna (columna.code)}
								<th class="py-1 {columna.code === 'held' ? '' : 'pr-3'}">
									<button
										type="button"
										onclick={() => ordenarPor(columna.code)}
										aria-label="Ordenar por {columna.label}"
										class="flex w-full cursor-pointer items-center gap-1 py-1 font-display text-1
										tracking-label uppercase transition-colors hover:text-accent-bright
										{columna.right ? 'justify-end' : ''}
										{sortBy === columna.code ? 'text-accent-bright' : 'text-accent-dim'}"
									>
										{columna.label}
										<span class="font-mono text-[0.55rem]">{flecha(columna.code)}</span>
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each ordenar(filas, lado) as item (item.itemCode)}
							<tr
								onclick={() => abrir(item, lado)}
								class="cursor-pointer border-b border-border-soft/40 transition-colors hover:bg-surface-hover"
							>
								<td class="py-[0.4rem] pr-3">
									<div class="flex items-center gap-2">
										<Icon name={item.icon} weight="duotone" size="0.9rem" class="text-accent" />
										<span class="text-2 text-text-strong">{item.name}</span>
									</div>
								</td>
								<td class="py-[0.4rem] pr-3 font-mono text-[0.72rem] text-text-muted">
									{item.tier || '—'}
								</td>
								<td
									class="py-[0.4rem] pr-3 text-right font-mono text-[0.75rem]
										{lado === 'sell' ? 'text-accent-bright' : 'text-data'}"
								>
									{lado === 'sell' ? item.bestAskLabel : item.bestBidLabel}
								</td>
								<!--
									Dónde está el mejor precio, y a cuántos saltos. El mercado se mira
									desde cualquier parte, así que un precio sin lugar no alcanza para
									decidir: lo barato a cuatro saltos es barato más un viaje.
								-->
								<td class="py-[0.4rem] pr-3 text-2 text-text-body">
									{(lado === 'sell' ? item.bestAskWhere : item.bestBidWhere) || '—'}
								</td>
								<td class="py-[0.4rem] pr-3 text-right font-mono text-[0.72rem] text-text-muted">
									{(lado === 'sell' ? item.bestAskJumps : item.bestBidJumps) || '—'}
								</td>
								<td class="py-[0.4rem] pr-3 text-right font-mono text-[0.7rem] text-text-muted">
									{(lado === 'sell' ? item.sellOrders : item.buyOrders) || '—'}
								</td>
								<td class="py-[0.4rem] text-right font-mono text-[0.72rem] text-text-body">
									{item.held || '—'}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="py-4 text-center text-1 text-text-muted">
									{search.trim()
										? 'Nada con ese nombre de este lado.'
										: lado === 'sell'
											? 'Nadie vende nada de esta rama.'
											: 'Nadie compra nada de esta rama.'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/snippet}

<!--
	El título es **la región cuyas órdenes se están mirando**, no el lugar donde
	está el piloto. Decía "Mercado de Deriva Exterior" estando parado en el Hábitat
	Talo, y se leía como si el mercado fuera de otro lado: lo que se ve es el libro
	de toda la región, y desde dónde se opera lo dice la línea de abajo.
-->
<div class="flex w-full flex-col items-start gap-1">
	<Eyebrow>Órdenes de la región</Eyebrow>
	<DisplayTitle>{market.regionName || 'Sin región'}</DisplayTitle>
</div>

<!--
	La fila de lecturas del mostrador.

	Todas del mismo tamaño y alineadas por arriba: es una fila de instrumentos de
	cabina, y uno más grande que los otros rompe la línea sin decir nada que el
	color no diga mejor. El saldo resalta en cian, que es lo que el proyecto usa
	para las cifras que importan.
-->
<div class="flex w-full flex-wrap items-start gap-x-5 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Alcance</Label>
		<p class="font-mono text-2 text-accent-bright">
			{market.regionsInRange}
			{market.regionsInRange === 1 ? 'región' : 'regiones'} · {market.stationCount} mercados
		</p>
	</div>
	<div class="grow"></div>
	<div class="flex flex-col items-start gap-1">
		<Label>Saldo</Label>
		<p class="font-mono text-2 text-data">{market.balance} CR</p>
	</div>
	<div class="flex flex-col items-start gap-1">
		<!--
			El cupo es **por lado**: tener una venta publicada no impide poner una
			compra, así que decir un solo número mentiría sobre lo que queda libre.
		-->
		<Label>Órdenes</Label>
		<p class="font-mono text-2 text-text-body">
			{market.openSells} / {market.orderLimit} vendo · {market.openBuys} / {market.orderLimit} compro
		</p>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Comisión · impuesto</Label>
		<p class="font-mono text-2 text-text-muted">
			{tenths(market.brokerPermille)} % · {tenths(market.taxPermille)} %
		</p>
	</div>
</div>

{#if form?.error}
	<p class="w-full border-l-[3px] border-l-danger bg-danger-wash px-4 py-3 text-2 text-text-strong">
		{form.error}
	</p>
{:else if form?.done}
	<p
		class="w-full border-l-[3px] border-l-success bg-success-wash px-4 py-3 font-mono text-2 text-text-strong"
	>
		{form.done}{#if form.note}<span class="text-text-muted"> · {form.note}</span>{/if}
	</p>
{/if}

{#if !market.canTradeHere}
	<!--
		No bloquea la vista: mirar precios desde lejos es para lo que existe un
		mercado regional. Sólo explica por qué no hay botones.
	-->
	<div class="flex w-full items-center gap-3 border-l-[3px] border-l-border bg-surface px-4 py-3">
		<Icon name="warning" weight="duotone" size="1rem" class="shrink-0 text-accent" />
		<div class="flex min-w-0 flex-col gap-1">
			{#if market.location}
				<p class="font-mono text-2 text-text-body">{market.location}</p>
			{/if}
			<p class="text-1 text-text-muted">{market.whyNot}</p>
		</div>
	</div>
{:else}
	<div class="flex w-full items-center gap-3 border-l-[3px] border-l-accent bg-surface px-4 py-3">
		<Icon name="storefront" weight="duotone" size="1rem" class="shrink-0 text-accent" />
		<!--
			Dónde está parado el piloto, de lo chico a lo grande. Es la respuesta a
			"¿dónde estoy?", que en esta pantalla no es obvia: el título es la región
			que se está mirando, y uno puede estar en cualquier estación de ella.
		-->
		<p class="font-mono text-2 text-text-body">{market.location}</p>
		<div class="grow"></div>
		<!--
			La otra cosa que se puede hacer en un mercado: en vez de tomar un precio,
			poner el propio. Vive acá y no dentro de la ventana de operar porque no es
			una operación sobre la orden de otro.
		-->
		<!--
			Siempre habilitado: la ventana sabe pedir el ítem cuando todavía no hay
			ninguno elegido. Un botón apagado sin decir por qué es una puerta cerrada
			sin cartel.
		-->
		<HudButton size="2" onclick={() => (publishOpen = true)}>Poner una orden</HudButton>
	</div>
{/if}

<div class="flex w-full flex-col items-start gap-4 lg:flex-row">
	<div class="w-full min-w-0 lg:w-[16rem] lg:shrink-0">
		<TitledPanel title="Examinar" class="w-full">
			<div class="flex w-full flex-col gap-3">
				<div class="relative w-full">
					<Icon
						name="magnifying-glass"
						weight="bold"
						size="0.8rem"
						class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
					/>
					<input
						type="search"
						bind:value={search}
						placeholder="Buscar"
						aria-label="Buscar en el mercado"
						class="{CONTROL_HEIGHTS[
							'2'
						]} w-full border border-border-soft bg-field pr-3 pl-8 font-body text-2
							text-text-strong transition-[border-color,box-shadow] placeholder:text-text-muted
							hover:border-border focus:border-accent focus:shadow-glow focus:outline-none"
					/>
				</div>

				<!--
					No es un `nav`: el árbol no navega a ningún lado, filtra lo que se lista
					al lado. El único landmark de navegación del juego es el Neocom.
				-->
				<div class="flex w-full flex-col" role="group" aria-label="Categorías del mercado">
					{#each roots as rama (rama.code)}
						{@const abierta =
							group === rama.code || children(rama.code).some((hoja) => hoja.code === group)}
						<button
							type="button"
							onclick={() => (group = rama.code)}
							class="flex w-full cursor-pointer items-center gap-2 px-2 py-[0.45rem] text-left
								transition-colors {group === rama.code
								? 'bg-accent text-on-accent'
								: 'text-text-body hover:bg-surface-hover hover:text-accent-bright'}"
						>
							<Icon name={rama.icon} weight="duotone" size="0.9rem" />
							<span class="font-display text-2 tracking-label uppercase">{rama.label}</span>
							<div class="grow"></div>
							<span class="font-mono text-[0.68rem] opacity-70">{rama.count}</span>
						</button>

						{#if abierta}
							{#each children(rama.code) as hoja (hoja.code)}
								<button
									type="button"
									onclick={() => (group = hoja.code)}
									class="flex w-full cursor-pointer items-center gap-2 border-l border-border-soft
										py-[0.35rem] pr-2 pl-5 text-left transition-colors {group === hoja.code
										? 'bg-accent text-on-accent'
										: 'text-text-muted hover:bg-surface-hover hover:text-accent-bright'}"
								>
									<Icon name={hoja.icon} weight="bold" size="0.75rem" />
									<span class="font-display text-1 tracking-label uppercase">{hoja.label}</span>
									<div class="grow"></div>
									<span class="font-mono text-[0.64rem] opacity-70">{hoja.count}</span>
								</button>
							{/each}
						{/if}
					{/each}
				</div>
			</div>
		</TitledPanel>
	</div>

	<div class="w-full min-w-0 flex-[1_1_0]">
		<!--
			El catálogo va **en dos tablas**, como el libro de un ítem: arriba lo que
			alguien vende y abajo lo que alguien compra. Con los dos precios en la
			misma fila hay que leer columna por columna para saber de qué lado del
			mostrador está cada cosa; separados, la pregunta "¿qué puedo comprar acá?"
			se contesta mirando una tabla.

			Un ítem aparece en las dos si tiene órdenes de los dos lados, que es lo
			normal, y eso no es una repetición: son dos ofertas distintas.
		-->
		<TitledPanel
			title={search.trim()
				? 'Resultados'
				: (roots.find((r) => r.code === group)?.label ?? 'Catálogo')}
			detail="{listed.length} ítems"
			class="w-full"
		>
			<div class="flex w-full flex-col gap-5">
				{@render catalogo('Órdenes de venta', enVenta, 'sell')}
				{@render catalogo('Órdenes de compra', enCompra, 'buy')}

				{#if sinOrdenes.length > 0}
					<!--
						Lo que existe en el catálogo pero nadie está comerciando. Tiene que
						poder verse igual: es la mitad de la información al decidir qué
						fabricar o adónde ir a buscar algo.
					-->
					<div class="flex w-full flex-col gap-2">
						<div class="flex w-full flex-wrap items-baseline gap-2">
							<Label>Sin órdenes</Label>
							<div class="grow"></div>
							<span class="font-mono text-[0.68rem] text-text-muted">
								{sinOrdenes.length} ítems
							</span>
						</div>
						<div class="flex w-full flex-wrap gap-x-4 gap-y-1">
							{#each sinOrdenes as item (item.itemCode)}
								<button
									type="button"
									onclick={() => abrir(item, 'sell')}
									class="cursor-pointer text-1 text-text-muted transition-colors hover:text-accent-bright"
								>
									{item.name}{item.tier ? ` ${item.tier}` : ''}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</TitledPanel>
	</div>
</div>

<!--
	La mesa del piloto: lo que tiene puesto, de los dos lados y en toda la región.

	Va en la pantalla y no escondida dentro de cada ítem porque la pregunta "¿qué
	tengo publicado?" es de la mesa entera: con cincuenta y un ítems, contestarla
	abriendo uno por uno no es contestarla.
-->
{#if market.orders.length > 0}
	<TitledPanel title="Mis órdenes" detail="{market.orders.length} abiertas" class="w-full">
		<div class="w-full overflow-x-auto">
			<table
				class="w-full min-w-[34rem] border-collapse text-left
					[&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
			>
				<thead>
					<tr class="border-b border-border-soft">
						<th class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase">
							Orden
						</th>
						<th
							class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
						>
							Quedan
						</th>
						<th
							class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
						>
							Precio
						</th>
						<th class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase">
							Dónde
						</th>
						<th class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase">
							Vence
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each market.orders as orden (orden.id)}
						<tr class="border-b border-border-soft/40 last:border-0">
							<td class="py-[0.45rem] pr-3">
								<div class="flex flex-wrap items-center gap-2">
									<span
										class="font-display text-[0.62rem] tracking-label uppercase
											{orden.kind === 'sell' ? 'text-accent-bright' : 'text-data'}"
									>
										{orden.kindLabel}
									</span>
									<span class="text-2 text-text-strong">{orden.name}</span>
									{#if orden.pending}
										<!--
											Todavía no está en el libro. Decirlo es lo que evita que el
											piloto la busque ahí y crea que se perdió.
										-->
										<span
											class="border border-border-soft px-[0.3rem] font-display text-[0.55rem]
												tracking-label text-text-muted uppercase"
										>
											Acordando
										</span>
									{/if}
								</div>
							</td>
							<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.78rem] text-text-body">
								{orden.quantity} / {orden.initialQuantity}
							</td>
							<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.78rem] text-accent-bright">
								{orden.price} CR
							</td>
							<td class="py-[0.45rem] pr-3 text-2 text-text-body">{orden.stationName}</td>
							<td class="py-[0.45rem] pr-3 font-mono text-[0.72rem] text-text-muted">
								{cuando(orden.expiresAt)}
							</td>
							<td class="py-[0.45rem] text-right">
								<form
									method="POST"
									action="?/cancelar"
									use:enhance={() =>
										async ({ update }) => {
											await update();
											await refrescar();
										}}
								>
									<input type="hidden" name="orden" value={orden.id} />
									<HudButton type="submit" size="1" variant="ghost">Cancelar</HudButton>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</TitledPanel>
{/if}

<!-- La ventana del ítem: sus dos libros, su historial y lo que se puede hacer. -->

<!--
	Poner el propio precio en vez de tomar el de otro, en **su propia ventana**.

	Es la otra cosa que se puede hacer en un mercado, y no cabe junto a la de
	operar: aquélla es un click sobre una orden que ya existe, ésta es una decisión
	—cuánto, a cuánto, por cuánto tiempo— que además compromete el turno del piloto.
	Mezclarlas obligaba a leer un formulario entero para hacer lo más simple.

	La ventana **es** la confirmación: muestra lo que va a costar y lo que va a
	tardar, así que no hace falta un segundo diálogo encima preguntando lo mismo.

	Trabaja sobre el último ítem que se miró, que es el que uno tiene en la cabeza
	cuando decide que ninguno de los precios del libro le sirve.
-->
<Modal bind:open={publishOpen} title="Poner una orden" detail={chosen?.name ?? ''} icon="handshake">
	{#if !chosen}
		<p class="text-1 text-text-muted">Elegí un ítem del catálogo para poner tu propio precio.</p>
	{:else}
		{@const item = chosen}
		<div class="flex w-full flex-col gap-3">
			<div class="flex w-full flex-wrap items-center gap-3">
				<Label>Lado</Label>
				{#each [{ code: 'sell' as const, label: 'Vendo' }, { code: 'buy' as const, label: 'Compro' }] as opcion (opcion.code)}
					<HudButton
						size="2"
						variant={side === opcion.code ? 'primary' : 'outline'}
						onclick={() => (side = opcion.code)}
					>
						{opcion.label}
					</HudButton>
				{/each}

				<Label>Precio</Label>
				<input
					type="number"
					min="1"
					bind:value={price}
					aria-label="Precio por unidad"
					class="{CONTROL_HEIGHTS['2']} w-28 border border-border-soft bg-field px-3 text-right
							font-mono text-2 text-text-strong hover:border-border focus:border-accent
							focus:shadow-glow focus:outline-none"
				/>
				<span class="font-mono text-[0.72rem] text-text-muted">CR c/u</span>

				<Label>Cantidad</Label>
				<input
					type="number"
					min="1"
					bind:value={units}
					aria-label="Unidades"
					class="{CONTROL_HEIGHTS['2']} w-24 border border-border-soft bg-field px-3 text-right
							font-mono text-2 text-text-strong hover:border-border focus:border-accent
							focus:shadow-glow focus:outline-none"
				/>
			</div>

			<div class="flex w-full flex-wrap items-center gap-3">
				<Label>Dura</Label>
				<select
					bind:value={days}
					aria-label="Cuánto dura la orden"
					class="{CONTROL_HEIGHTS['2']} border border-border-soft bg-field px-2 font-mono text-2
							text-text-strong hover:border-border focus:border-accent focus:outline-none"
				>
					{#each market.durations as opcion (opcion.days)}
						<option value={opcion.days}>{opcion.label}</option>
					{/each}
				</select>

				{#if side === 'buy' && market.maxRange > 0}
					<Label>Alcance</Label>
					<select
						bind:value={range}
						aria-label="Alcance de la orden de compra"
						class="{CONTROL_HEIGHTS['2']} border border-border-soft bg-field px-2 font-mono text-2
								text-text-strong hover:border-border focus:border-accent focus:outline-none"
					>
						<option value={0}>Esta estación</option>
						{#each Array.from({ length: market.maxRange }, (_, i) => i + 1) as regiones (regiones)}
							<option value={regiones}>{regiones} región{regiones > 1 ? 'es' : ''}</option>
						{/each}
					</select>
				{/if}

				{#if side === 'sell' && book}
					<Label>Sale de</Label>
					{#each [{ code: 'ship' as const, label: 'La nave', units: book.inShip }, { code: 'station' as const, label: 'Acá', units: book.inStation }] as origen (origen.code)}
						<HudButton
							size="2"
							variant={fromHold === origen.code ? 'primary' : 'outline'}
							onclick={() => (fromHold = origen.code)}
						>
							{origen.label} ×{origen.units}
						</HudButton>
					{/each}
				{/if}

				<div class="grow"></div>
				<span class="font-mono text-[0.72rem] text-text-muted">
					comisión {thousands(comision)} CR · no se devuelve
				</span>
				<span class="font-mono text-2 text-data">{thousands(price * publishUnits)} CR</span>
			</div>

			<!--
				La horquilla de la estación, que es contra lo que se compite: nadie te va a
				comprar por debajo de lo que paga ella, ni vender por encima de lo que
				cobra. El precio propio se elige dentro de esa banda.
			-->
			{#if spread.percent > 0}
				<p class="font-mono text-[0.68rem] text-text-muted">
					La estación se queda con el {spread.percent} %: {spread.base} de base{#if spread.corporationEdge > 0},
						−{spread.corporationEdge}
						por el rubro{/if}{#if spread.haggling > 0}, −{spread.haggling} por Regateo{/if}
				</p>
			{/if}
			<!--
					La ventana ya es la parada donde se mira el número antes de comprometer
					tiempo y plata, así que confirma acá mismo: un segundo diálogo encima
					preguntando lo mismo es un click que no agrega nada.
				-->
			<div
				class="flex w-full flex-wrap items-center justify-end gap-3 border-t border-border-soft pt-3"
			>
				<span class="font-mono text-[0.7rem] text-text-muted">
					ocupa tu turno · 1 min · deja experiencia de Comercio
				</span>
				<div class="grow"></div>
				<HudButton size="2" variant="ghost" onclick={() => (publishOpen = false)}>
					Cancelar
				</HudButton>
				<form
					method="POST"
					action="?/publicar"
					use:enhance={() => {
						publishOpen = false;
						return async ({ update }) => {
							await update();
							await refrescar();
						};
					}}
				>
					<input type="hidden" name="lado" value={side} />
					<input type="hidden" name="item" value={item.itemCode} />
					<input type="hidden" name="unidades" value={publishUnits} />
					<input type="hidden" name="precio" value={price} />
					<input type="hidden" name="dias" value={days} />
					<input type="hidden" name="alcance" value={range} />
					<input type="hidden" name="desde" value={fromHold} />
					<input type="hidden" name="estacion" value={market.dockedStationId} />
					<HudButton type="submit" size="2" variant="primary" disabled={publishUnits < 1}>
						<Icon name="handshake" weight="bold" size="0.75rem" />
						Acordar
					</HudButton>
				</form>
			</div>
		</div>
	{/if}
</Modal>

<!--
	La ventana de la operación: **una orden, y qué hacer con ella**.

	Se abre desde una fila del catálogo, y esa fila ya eligió el lado del mostrador
	—de la tabla de venta se compra, de la de compra se vende—, así que acá no hay
	nada que volver a elegir. Todo lo que muestra es sobre esa orden: quién la puso,
	a cuánto, cuánto hay y a qué distancia.

	Poner el propio precio **no está acá**, está en su panel: son dos cosas
	distintas, y meter el formulario adentro obligaba a leerlo entero para hacer la
	operación más simple del mercado.
-->
<Modal bind:open title={chosen?.name ?? ''} detail={chosen?.tier ?? ''} icon="storefront">
	{#if chosen}
		{@const item = chosen}
		<div class="flex w-full flex-col gap-4">
			<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
				<span class="font-display text-1 tracking-label text-accent-dim uppercase">
					{item.groupLabel}
				</span>
				<span class="font-mono text-[0.72rem] text-text-muted">{item.volume} m³/u</span>
				{#if book}
					<span class="font-mono text-[0.72rem] text-data">
						Tenés {book.inShip} en la nave · {book.inStation} acá
					</span>
				{/if}
			</div>

			{#if loading && !book}
				<p class="text-1 text-text-muted">Leyendo el libro…</p>
			{:else if book}
				{@const libro = book}
				{@const orden = side === 'sell' ? libro.sellers[0] : libro.buyers[0]}

				{#if showHistory}
					<PriceChart history={libro.history} />
					<div class="flex w-full justify-end border-t border-border-soft pt-3">
						<HudButton size="2" variant="ghost" onclick={() => (showHistory = false)}>
							Volver a la orden
						</HudButton>
					</div>
				{:else if orden}
					<!-- La orden elegida, escrita con todas las letras. -->
					<div class="flex w-full flex-col gap-1 border-y border-border-soft py-3">
						{#each [{ label: orden.mine ? 'Es tuya' : side === 'sell' ? 'Te vende' : 'Te compra', value: orden.npc ? `${orden.stationName} · la estación` : orden.stationName }, { label: 'Precio', value: `${orden.priceLabel} CR por unidad` }, { label: 'Disponible', value: orden.quantityLabel }, { label: 'Distancia', value: orden.distanceLabel }] as lectura (lectura.label)}
							<div class="flex w-full items-baseline gap-3">
								<span class="w-[6.5rem] shrink-0"><Label>{lectura.label}</Label></span>
								<span class="min-w-0 font-mono text-[0.82rem] text-accent-bright">
									{lectura.value}
								</span>
							</div>
						{/each}
					</div>

					{#if market.canTradeHere}
						<div class="flex w-full flex-wrap items-center gap-3">
							<Label>Cantidad</Label>
							<input
								type="number"
								min="1"
								bind:value={units}
								aria-label="Unidades"
								class="{CONTROL_HEIGHTS[
									'2'
								]} w-24 border border-border-soft bg-field px-3 text-right
									font-mono text-2 text-text-strong hover:border-border focus:border-accent
									focus:shadow-glow focus:outline-none"
							/>
							{#if side === 'buy'}
								{#each [{ code: 'ship' as const, label: 'La nave', units: libro.inShip }, { code: 'station' as const, label: 'Acá', units: libro.inStation }] as origen (origen.code)}
									<HudButton
										size="2"
										variant={fromHold === origen.code ? 'primary' : 'outline'}
										onclick={() => (fromHold = origen.code)}
									>
										{origen.label} ×{origen.units}
									</HudButton>
								{/each}
							{/if}
							<div class="grow"></div>
							<span class="font-mono text-2 text-data">{thousands(importe)} CR</span>
						</div>

						<div class="flex w-full flex-wrap items-center justify-end gap-3">
							<HudButton size="2" variant="ghost" onclick={() => (showHistory = true)}>
								Historial
							</HudButton>
							{#if orden.mine}
								<!--
									La mejor orden puede ser la propia. Comprársela a uno mismo no es
									una operación: lo único que se puede hacer con ella es retirarla.
								-->
								<form
									method="POST"
									action="?/cancelar"
									use:enhance={() => {
										open = false;
										return async ({ update }) => {
											await update();
											await refrescar();
										};
									}}
								>
									<input type="hidden" name="orden" value={orden.id} />
									<HudButton type="submit" size="2" variant="primary">Cancelar la orden</HudButton>
								</form>
							{:else}
								<form
									method="POST"
									action={side === 'sell' ? '?/comprar' : '?/vender'}
									use:enhance={() =>
										async ({ update }) => {
											await update();
											await refrescar();
										}}
								>
									<input type="hidden" name="orden" value={orden.id ?? 0} />
									<input type="hidden" name="item" value={item.itemCode} />
									<input type="hidden" name="unidades" value={operables} />
									<input type="hidden" name="desde" value={fromHold} />
									<input type="hidden" name="estacion" value={market.dockedStationId} />
									<HudButton type="submit" size="2" variant="primary" disabled={operables < 1}>
										{side === 'sell' ? 'Comprar' : 'Vender'}
										{operables}
									</HudButton>
								</form>
							{/if}
						</div>
					{:else}
						<p class="text-1 text-text-muted">{market.whyNot}</p>
					{/if}
				{:else}
					<p class="text-1 text-text-muted">
						{side === 'sell'
							? 'Nadie vende esto en tu alcance. Podés poner tu propio precio abajo.'
							: 'Nadie compra esto en tu alcance. Podés poner tu propio precio abajo.'}
					</p>
					<div class="flex w-full justify-end">
						<HudButton size="2" variant="ghost" onclick={() => (showHistory = true)}>
							Historial
						</HudButton>
					</div>
				{/if}
			{:else}
				<p class="text-1 text-text-muted">No se pudo leer el libro de este ítem.</p>
			{/if}
		</div>
	{/if}
</Modal>
