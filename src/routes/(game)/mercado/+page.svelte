<!--
	El mercado de la región.

	**La forma es la del mercado de EVE Online**, con la voz de Elite: un árbol de
	categorías a la izquierda para examinar, la lista de la rama elegida a la
	derecha, y al abrir un ítem **una ventana con sus dos libros de órdenes** —
	vendedores arriba, compradores abajo— más el historial de precios.

	El panel de la derecha muestra **o la lista, o el ítem elegido**, nunca las dos
	cosas. Desplegar el detalle debajo de la lista estira la página hasta perder de
	vista aquello de lo que uno venía, y abrirlo en una ventana aparte tapa el
	catálogo justo mientras se lo recorre. Lo único que sí es una ventana es
	confirmar una orden, porque ahí sí hay que detenerse a mirar un número.

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
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ConfirmAction from '$lib/components/game/ConfirmAction.svelte';
	import PriceChart from '$lib/components/game/PriceChart.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { CONTROL_HEIGHTS } from '$lib/components/buttons/estilos';
	import { askTotal, bidTotal } from '$lib/game/market';
	import { tenths, thousands } from '$lib/format';
	import type { FilaMercado, LibroMercado } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let market = $derived(data.market);

	/** Estado de pantalla: nada de esto viaja al servidor. */
	let group = $state('held');
	let search = $state('');
	let chosen = $state<FilaMercado | null>(null);
	let book = $state<LibroMercado | null>(null);
	let loading = $state(false);
	/** Cuántas unidades mueve el próximo pedido. */
	let units = $state(1);
	/**
	 * Qué se mira del ítem abierto: los libros o el historial.
	 *
	 * Los libros primero, como en EVE: la pregunta al abrir un ítem es a cuánto lo
	 * venden y a cuánto lo pagan. El historial es la segunda.
	 */
	let tab = $state<'book' | 'history'>('book');
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

	/** La horquilla que le toca a lo que está abierto. */
	let spread = $derived(chosen && chosen.group !== 'ore' ? market.moduleSpread : market.oreSpread);

	/**
	 * Abre un ítem y **recién ahí** pide su libro.
	 *
	 * Traer las órdenes de los cincuenta y un renglones para dibujar la lista sería
	 * pedir miles de filas de las que se miran dos.
	 */
	async function abrir(item: FilaMercado) {
		chosen = item;
		book = null;
		units = 1;
		price = item.bestBid ?? item.bestAsk ?? item.basePrice;
		range = 0;
		days = market.durations[0]?.days ?? 1;
		tab = 'book';
		fromHold = 'ship';
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

	/** Lo que de verdad cobra o paga la estación por un lote, con su redondeo. */
	function stationTotal(side: 'buy' | 'sell', quantity: number): number {
		if (!chosen) return 0;
		return side === 'buy'
			? askTotal(chosen.basePrice, quantity, spread.percent)
			: bidTotal(chosen.basePrice, quantity, spread.percent);
	}

	/**
	 * Cerrada una publicación, el panel vuelve a la lista.
	 *
	 * Lo que mostraba quedó viejo en el acto: la mercadería se fue a garantía y
	 * los libros cambiaron. Dejarlo con las cifras de antes es peor que volver.
	 */
	let lastForm = $state<unknown>(null);
	$effect(() => {
		if (form !== lastForm) {
			lastForm = form;
			if (form && 'published' in form && form.published) chosen = null;
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

	/** Cómo se llama la duración elegida, para poder decirla al confirmar. */
	let duracion = $derived(
		market.durations.find((opcion) => opcion.days === days)?.label ?? `${days} días`
	);

	/** Lo que tiene el piloto a mano de lo que está abierto. */
	let atHand = $derived(book ? (fromHold === 'ship' ? book.inShip : book.inStation) : 0);
</script>

<svelte:head><title>Mercado · Vaxav</title></svelte:head>

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
		<Label>Órdenes</Label>
		<p class="font-mono text-2 text-text-body">{market.openOrders} / {market.orderLimit}</p>
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
		<p class="text-2 text-text-body">{market.whyNot}</p>
	</div>
{:else}
	<div class="flex w-full items-center gap-3 border-l-[3px] border-l-accent bg-surface px-4 py-3">
		<Icon name="storefront" weight="duotone" size="1rem" class="shrink-0 text-accent" />
		<p class="text-2 text-text-body">
			Operando desde <span class="text-accent-bright">{market.dockedAt}</span>
		</p>
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

	<!--
		El panel de la derecha muestra **o la lista de la rama, o el ítem elegido**,
		nunca las dos cosas. Es como lo resuelve EVE y evita los dos problemas de las
		alternativas: desplegar el detalle debajo estira la página hasta perder de
		vista la lista de la que uno venía, y abrirlo en una ventana aparte tapa el
		catálogo justo cuando se lo está recorriendo.
	-->
	<div class="w-full min-w-0 flex-[1_1_0]">
		{#if chosen}
			{@const item = chosen}
			<TitledPanel title={item.name} detail={item.tier} class="w-full">
				<div class="flex w-full flex-col gap-5">
					<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
						<HudButton size="1" variant="ghost" onclick={() => (chosen = null)}>
							<Icon name="caret-left" weight="bold" size="0.7rem" />
							Volver
						</HudButton>
						<Icon name={item.icon} weight="duotone" size="1.1rem" class="text-accent" />
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
					<BodyText>{item.summary}</BodyText>

					{#if loading && !book}
						<p class="text-1 text-text-muted">Leyendo el libro…</p>
					{:else if book}
						{@const libro = book}

						<!--
					Los dos libros son **el contenido** de esta ventana, pegados uno al otro
					como en EVE: vendedores arriba, compradores abajo. Lo primero que hay
					que ver al abrir un ítem es a cuánto lo venden y a cuánto lo pagan, y
					cualquier cosa que se meta entre medio empuja esa respuesta fuera de la
					pantalla.

					Por eso el historial va en una pestaña y no arriba de todo, que es
					exactamente lo que hace EVE con su "Price History": es la segunda
					pregunta, no la primera.
				-->
						<div
							class="flex w-full flex-wrap items-center gap-x-4 gap-y-3 border-b border-border-soft pb-3"
						>
							<div class="flex items-center gap-1">
								{#each [{ code: 'book' as const, label: 'Mercado' }, { code: 'history' as const, label: 'Historial' }] as vista (vista.code)}
									<HudButton
										size="2"
										variant={tab === vista.code ? 'primary' : 'outline'}
										onclick={() => (tab = vista.code)}
									>
										{vista.label}
									</HudButton>
								{/each}
							</div>
							<div class="grow"></div>
							<div
								class="flex w-full flex-wrap items-center gap-3 border-y border-border-soft py-3"
							>
								<Label>Cantidad</Label>
								<input
									type="number"
									min="1"
									bind:value={units}
									aria-label="Unidades"
									class="{CONTROL_HEIGHTS[
										'2'
									]} w-24 border border-border-soft bg-field px-3 text-right font-mono
							text-2 text-text-strong hover:border-border focus:border-accent focus:shadow-glow
							focus:outline-none"
								/>
								<div class="flex items-center gap-2">
									{#each [{ code: 'ship' as const, label: 'De la nave', units: libro.inShip }, { code: 'station' as const, label: 'De acá', units: libro.inStation }] as origen (origen.code)}
										<!--
								La cantidad va con la cruz de multiplicar: un número suelto
								detrás de un punto se lee como un identificador.
							-->
										<HudButton
											size="2"
											variant={fromHold === origen.code ? 'primary' : 'outline'}
											onclick={() => (fromHold = origen.code)}
										>
											{origen.label} ×{origen.units}
										</HudButton>
									{/each}
								</div>
								{#if atHand > 0}
									<HudButton size="2" variant="ghost" onclick={() => (units = atHand)}
										>Todo</HudButton
									>
								{/if}
							</div>
						</div>

						{#if tab === 'history'}
							<!-- La figura: a cuánto se estuvo comerciando esto de verdad. -->
							<PriceChart history={libro.history} />
						{:else}
							<!--
					VENDEDORES: quién ofrece, del más barato al más caro. Es el orden en
					que se compra, así que lo mejor está siempre arriba.
				-->
							<div class="flex w-full flex-col gap-2">
								<Label>Vendedores</Label>
								{#if libro.sellers.length === 0}
									<p class="text-1 text-text-muted">Nadie vende esto en tu alcance.</p>
								{:else}
									<div class="w-full overflow-x-auto">
										<table
											class="w-full min-w-[30rem] border-collapse text-left [&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
										>
											<thead>
												<tr class="border-b border-border-soft">
													<th
														class="py-1 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Cantidad
													</th>
													<th
														class="py-1 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Precio
													</th>
													<th
														class="py-1 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Ubicación
													</th>
													<th
														class="py-1 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Distancia
													</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{#each libro.sellers as orden (orden.id ?? 'estacion')}
													<tr class="border-b border-border-soft/40 last:border-0">
														<td class="py-2 pr-3 text-right font-mono text-2 text-text-body">
															{orden.quantityLabel}
														</td>
														<td class="py-2 pr-3 text-right font-mono text-2 text-accent-bright">
															{orden.priceLabel} CR
														</td>
														<td class="py-2 pr-3 text-2 text-text-body">
															{orden.stationName}
															{#if orden.npc}
																<span
																	class="font-display text-[0.6rem] tracking-label text-accent-dim uppercase"
																>
																	· estación
																</span>
															{:else if orden.mine}
																<span
																	class="font-display text-[0.6rem] tracking-label text-data uppercase"
																>
																	· tuya
																</span>
															{/if}
														</td>
														<td
															class="py-2 pr-3 text-right font-mono text-[0.72rem] text-text-muted"
														>
															{orden.distanceLabel}
														</td>
														<td class="py-2 text-right">
															{#if orden.mine}
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
																	<HudButton type="submit" size="1" variant="ghost"
																		>Cancelar</HudButton
																	>
																</form>
															{:else if market.canTradeHere}
																<form
																	method="POST"
																	action="?/comprar"
																	use:enhance={() =>
																		async ({ update }) => {
																			await update();
																			await refrescar();
																		}}
																>
																	<input type="hidden" name="orden" value={orden.id ?? 0} />
																	<input type="hidden" name="item" value={item.itemCode} />
																	<input type="hidden" name="unidades" value={units} />
																	<HudButton type="submit" size="1">
																		Comprar {thousands(
																			orden.npc ? stationTotal('buy', units) : orden.price * units
																		)} CR
																	</HudButton>
																</form>
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}
							</div>

							<!-- COMPRADORES: quién paga, del que más paga al que menos. -->
							<div class="flex w-full flex-col gap-2">
								<Label>Compradores</Label>
								{#if libro.buyers.length === 0}
									<p class="text-1 text-text-muted">Nadie compra esto en tu alcance.</p>
								{:else}
									<div class="w-full overflow-x-auto">
										<table
											class="w-full min-w-[30rem] border-collapse text-left [&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
										>
											<thead>
												<tr class="border-b border-border-soft">
													<th
														class="py-1 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Cantidad
													</th>
													<th
														class="py-1 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Precio
													</th>
													<th
														class="py-1 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Ubicación
													</th>
													<th
														class="py-1 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
													>
														Alcance
													</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{#each libro.buyers as orden (orden.id ?? 'estacion')}
													<tr class="border-b border-border-soft/40 last:border-0">
														<td class="py-2 pr-3 text-right font-mono text-2 text-text-body">
															{orden.quantityLabel}
														</td>
														<td class="py-2 pr-3 text-right font-mono text-2 text-data">
															{orden.priceLabel} CR
														</td>
														<td class="py-2 pr-3 text-2 text-text-body">
															{orden.stationName}
															{#if orden.npc}
																<span
																	class="font-display text-[0.6rem] tracking-label text-accent-dim uppercase"
																>
																	· estación
																</span>
															{:else if orden.mine}
																<span
																	class="font-display text-[0.6rem] tracking-label text-data uppercase"
																>
																	· tuya
																</span>
															{/if}
														</td>
														<td class="py-2 pr-3 font-mono text-[0.72rem] text-text-muted">
															{orden.rangeLabel}
														</td>
														<td class="py-2 text-right">
															{#if orden.mine}
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
																	<HudButton type="submit" size="1" variant="ghost"
																		>Cancelar</HudButton
																	>
																</form>
															{:else if market.canTradeHere && atHand > 0}
																<form
																	method="POST"
																	action="?/vender"
																	use:enhance={() =>
																		async ({ update }) => {
																			await update();
																			await refrescar();
																		}}
																>
																	<input type="hidden" name="orden" value={orden.id ?? 0} />
																	<input type="hidden" name="item" value={item.itemCode} />
																	<input
																		type="hidden"
																		name="unidades"
																		value={Math.min(units, atHand)}
																	/>
																	<input type="hidden" name="desde" value={fromHold} />
																	<input
																		type="hidden"
																		name="estacion"
																		value={market.dockedStationId}
																	/>
																	<HudButton type="submit" size="1" variant="primary">
																		Vender {thousands(
																			orden.npc
																				? stationTotal('sell', Math.min(units, atHand))
																				: orden.price * Math.min(units, atHand)
																		)} CR
																	</HudButton>
																</form>
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}
							</div>
						{/if}

						{#if market.canTradeHere}
							<!--
						Publicar es el otro verbo del mercado: en vez de tomar el precio de
						alguien, poner el propio y esperar. **Es una acción con tiempo** —se
						están cerrando condiciones—, así que se confirma como viajar o minar
						y paga experiencia de Comercio.
					-->
							<div class="flex w-full flex-col gap-3 border-t border-border-soft pt-4">
								<div class="flex w-full flex-wrap items-baseline gap-2">
									<Label>Acordar una orden</Label>
									<div class="grow"></div>
									<span class="font-mono text-[0.68rem] text-text-muted">
										comisión {tenths(market.brokerPermille)} % · no se devuelve
									</span>
								</div>

								<div class="flex w-full flex-wrap items-center gap-3">
									<Label>Precio</Label>
									<input
										type="number"
										min="1"
										bind:value={price}
										aria-label="Precio por unidad"
										class="{CONTROL_HEIGHTS[
											'2'
										]} w-28 border border-border-soft bg-field px-3 text-right
									font-mono text-2 text-text-strong hover:border-border focus:border-accent
									focus:shadow-glow focus:outline-none"
									/>
									<span class="font-mono text-[0.72rem] text-text-muted">CR por unidad</span>

									<Label>Dura</Label>
									<select
										bind:value={days}
										aria-label="Cuánto dura la orden"
										class="{CONTROL_HEIGHTS[
											'2'
										]} border border-border-soft bg-field px-2 font-mono text-2
									text-text-strong hover:border-border focus:border-accent focus:outline-none"
									>
										{#each market.durations as opcion (opcion.days)}
											<option value={opcion.days}>{opcion.label}</option>
										{/each}
									</select>

									{#if market.maxRange > 0}
										<Label>Alcance</Label>
										<select
											bind:value={range}
											aria-label="Alcance de la orden de compra"
											class="{CONTROL_HEIGHTS[
												'2'
											]} border border-border-soft bg-field px-2 font-mono
										text-2 text-text-strong hover:border-border focus:border-accent focus:outline-none"
										>
											<option value={0}>Esta estación</option>
											{#each Array.from({ length: market.maxRange }, (_, i) => i + 1) as regiones (regiones)}
												<option value={regiones}>{regiones} región{regiones > 1 ? 'es' : ''}</option
												>
											{/each}
										</select>
									{/if}
								</div>

								<div class="flex w-full flex-wrap items-center gap-3">
									{#each [{ lado: 'sell' as const, label: 'Vender', cuantas: Math.min(units, atHand), bloqueado: atHand < 1 }, { lado: 'buy' as const, label: 'Comprar', cuantas: units, bloqueado: false }] as opcion (opcion.lado)}
										<ConfirmAction
											title="Acordar {opcion.label.toLowerCase()} {opcion.cuantas} × {item.name}"
											icon="handshake"
											confirmLabel="Acordar"
											formAction="?/publicar"
											readings={[
												{ label: 'Unidades', value: `${opcion.cuantas}` },
												{ label: 'Precio', value: `${thousands(price)} CR c/u` },
												{ label: 'Total', value: `${thousands(price * opcion.cuantas)} CR` },
												{
													label: 'Comisión',
													value: `${thousands(Math.max(1, Math.round((price * opcion.cuantas * market.brokerPermille) / 1000)))} CR`
												},
												{ label: 'Dura', value: duracion },
												{ label: 'Tarda', value: '1 min' }
											]}
											note="Acordar ocupa tu turno y deja experiencia de Comercio. La orden entra al libro cuando el trato se cierra; la comisión no se devuelve."
											disabled={opcion.bloqueado}
										>
											{#snippet trigger(abrir)}
												<HudButton size="2" onclick={abrir} disabled={opcion.bloqueado}>
													{opcion.label}: acordar
												</HudButton>
											{/snippet}
											{#snippet fields()}
												<input type="hidden" name="lado" value={opcion.lado} />
												<input type="hidden" name="item" value={item.itemCode} />
												<input type="hidden" name="unidades" value={opcion.cuantas} />
												<input type="hidden" name="precio" value={price} />
												<input type="hidden" name="dias" value={days} />
												<input type="hidden" name="alcance" value={range} />
												<input type="hidden" name="desde" value={fromHold} />
												<input type="hidden" name="estacion" value={market.dockedStationId} />
											{/snippet}
										</ConfirmAction>
									{/each}
									<div class="grow"></div>
									<span class="font-mono text-[0.72rem] text-data">
										{thousands(price * units)} CR por {units}
									</span>
								</div>

								<!--
							La horquilla de la estación, en texto y no como figura: la figura de
							esta pantalla es el historial, y dos figuras compiten y no gana
							ninguna. Igual hay que poder explicar por qué el mostrador paga menos
							de lo que cobra.
						-->
								{#if spread.percent > 0}
									<p class="font-mono text-[0.68rem] text-text-muted">
										La estación se queda con el {spread.percent} %: {spread.base} de base{#if spread.corporationEdge > 0},
											−{spread.corporationEdge}
											por el rubro{/if}{#if spread.haggling > 0}, −{spread.haggling} por Regateo{/if}{#if spread.atFloor}
											· al piso{/if}
									</p>
								{/if}
							</div>
						{/if}
					{:else}
						<Panel class="w-full p-4">
							<p class="text-1 text-text-muted">No se pudo leer el libro de este ítem.</p>
						</Panel>
					{/if}
				</div>
			</TitledPanel>
		{:else}
			<TitledPanel
				title={search.trim()
					? 'Resultados'
					: (roots.find((r) => r.code === group)?.label ?? 'Catálogo')}
				detail="{listed.length} ítems"
				class="w-full"
			>
				<div class="w-full overflow-x-auto">
					<div class="max-h-[30rem] min-w-[34rem] overflow-y-auto">
						<table
							class="w-full border-collapse text-left [&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
						>
							<thead class="sticky top-0 z-10 bg-well">
								<tr class="border-b border-border-soft">
									<th
										class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Ítem
									</th>
									<th
										class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Clase
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Venden a
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Compran a
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Órdenes
									</th>
									<th
										class="py-2 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Tuyo
									</th>
								</tr>
							</thead>
							<tbody>
								{#each listed as item (item.itemCode)}
									<tr
										onclick={() => abrir(item)}
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
											class="py-[0.4rem] pr-3 text-right font-mono text-[0.75rem] text-accent-bright"
										>
											{item.bestAskLabel || '—'}
										</td>
										<td class="py-[0.4rem] pr-3 text-right font-mono text-[0.75rem] text-data">
											{item.bestBidLabel || '—'}
										</td>
										<td class="py-[0.4rem] pr-3 text-right font-mono text-[0.7rem] text-text-muted">
											{item.sellOrders + item.buyOrders || '—'}
										</td>
										<td class="py-[0.4rem] text-right font-mono text-[0.72rem] text-text-body">
											{item.held || '—'}
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan="6" class="py-5 text-center text-1 text-text-muted">
											{search.trim() ? 'Nada con ese nombre.' : 'Nada en esta rama todavía.'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</TitledPanel>
		{/if}
	</div>
</div>

<!--
	La mesa del piloto: lo que tiene puesto, de los dos lados y en toda la región.

	Va en la pantalla y no escondida dentro de cada ítem porque la pregunta "¿qué
	tengo publicado?" es de la mesa entera: con cincuenta y un ítems, contestarla
	abriendo uno por uno no es contestarla.
-->
{#if market.orders.length > 0}
	<TitledPanel
		title="Mis órdenes"
		detail="{market.orders.length} de {market.orderLimit}"
		class="w-full"
	>
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
