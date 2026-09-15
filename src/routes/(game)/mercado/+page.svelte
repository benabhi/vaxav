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
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import PriceChart from '$lib/components/game/PriceChart.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { askTotal, bidTotal } from '$lib/game/market';
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
	/** Lo que se pide al publicar. */
	let price = $state(0);
	let range = $state(0);
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

	/** Lo que de verdad cobra o paga la estación por un lote, con su redondeo. */
	function stationTotal(side: 'buy' | 'sell', quantity: number): number {
		if (!chosen) return 0;
		return side === 'buy'
			? askTotal(chosen.basePrice, quantity, spread.percent)
			: bidTotal(chosen.basePrice, quantity, spread.percent);
	}

	/** Lo que tiene el piloto a mano de lo que está abierto. */
	let atHand = $derived(book ? (fromHold === 'ship' ? book.inShip : book.inStation) : 0);
</script>

<svelte:head><title>Mercado · Vaxav</title></svelte:head>

<div class="flex w-full flex-col items-start gap-1">
	<Eyebrow>Mercado de</Eyebrow>
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
						class="h-[2.15rem] w-full border border-border-soft bg-field pr-3 pl-8 font-body text-2
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
								<th class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase">
									Ítem
								</th>
								<th class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase">
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
	</div>
</div>

<!-- La ventana del ítem: sus dos libros, su historial y lo que se puede hacer. -->
<Modal bind:open title={chosen?.name ?? ''} detail={chosen?.tier ?? ''} icon="storefront" size="lg">
	{#if chosen}
		{@const item = chosen}
		<div class="flex w-full flex-col gap-5">
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
			<BodyText>{item.summary}</BodyText>

			{#if loading && !book}
				<p class="text-1 text-text-muted">Leyendo el libro…</p>
			{:else if book}
				{@const libro = book}

				<!-- La figura: a cuánto se estuvo comerciando esto de verdad. -->
				<PriceChart history={libro.history} />

				{#if market.canTradeHere}
					<div class="flex w-full flex-wrap items-center gap-3 border-y border-border-soft py-3">
						<Label>Cantidad</Label>
						<input
							type="number"
							min="1"
							bind:value={units}
							aria-label="Unidades"
							class="h-[2.15rem] w-24 border border-border-soft bg-field px-3 text-right font-mono
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
									size="1"
									variant={fromHold === origen.code ? 'primary' : 'outline'}
									onclick={() => (fromHold = origen.code)}
								>
									{origen.label} ×{origen.units}
								</HudButton>
							{/each}
						</div>
						{#if atHand > 0}
							<HudButton size="1" variant="ghost" onclick={() => (units = atHand)}>Todo</HudButton>
						{/if}
					</div>
				{/if}

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
											<td class="py-2 pr-3 text-right font-mono text-[0.72rem] text-text-muted">
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
														<HudButton type="submit" size="1" variant="ghost">Cancelar</HudButton>
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
														<HudButton type="submit" size="1" variant="ghost">Cancelar</HudButton>
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
														<input type="hidden" name="unidades" value={Math.min(units, atHand)} />
														<input type="hidden" name="desde" value={fromHold} />
														<input type="hidden" name="estacion" value={market.dockedStationId} />
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

				{#if market.canTradeHere}
					<!--
						Publicar es el otro verbo del mercado: en vez de tomar el precio de
						alguien, poner el propio y esperar.
					-->
					<div class="flex w-full flex-col gap-3 border-t border-border-soft pt-4">
						<div class="flex w-full flex-wrap items-baseline gap-2">
							<Label>Publicar una orden</Label>
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
								class="h-[2.15rem] w-28 border border-border-soft bg-field px-3 text-right font-mono
									text-2 text-text-strong hover:border-border focus:border-accent focus:shadow-glow
									focus:outline-none"
							/>
							<span class="font-mono text-[0.72rem] text-text-muted">CR por unidad</span>
							<div class="grow"></div>
							<span class="font-mono text-[0.72rem] text-data">
								{thousands(price * units)} CR por {units}
							</span>
						</div>

						<div class="flex w-full flex-wrap items-center gap-3">
							<form
								method="POST"
								action="?/publicarVenta"
								use:enhance={() =>
									async ({ update }) => {
										await update();
										await refrescar();
									}}
							>
								<input type="hidden" name="item" value={item.itemCode} />
								<input type="hidden" name="unidades" value={Math.min(units, atHand)} />
								<input type="hidden" name="precio" value={price} />
								<input type="hidden" name="desde" value={fromHold} />
								<input type="hidden" name="estacion" value={market.dockedStationId} />
								<HudButton type="submit" size="1" disabled={atHand < 1}>Vender: publicar</HudButton>
							</form>

							<form
								method="POST"
								action="?/publicarCompra"
								use:enhance={() =>
									async ({ update }) => {
										await update();
										await refrescar();
									}}
							>
								<input type="hidden" name="item" value={item.itemCode} />
								<input type="hidden" name="unidades" value={units} />
								<input type="hidden" name="precio" value={price} />
								<input type="hidden" name="alcance" value={range} />
								<input type="hidden" name="estacion" value={market.dockedStationId} />
								<HudButton type="submit" size="1">Comprar: publicar</HudButton>
							</form>

							{#if market.maxRange > 0}
								<div class="flex items-center gap-2">
									<Label>Alcance</Label>
									<select
										bind:value={range}
										aria-label="Alcance de la orden de compra"
										class="h-[2.15rem] border border-border-soft bg-field px-2 font-mono text-2
											text-text-strong hover:border-border focus:border-accent focus:outline-none"
									>
										<option value={0}>Esta estación</option>
										{#each Array.from({ length: market.maxRange }, (_, i) => i + 1) as regiones (regiones)}
											<option value={regiones}>{regiones} región{regiones > 1 ? 'es' : ''}</option>
										{/each}
									</select>
								</div>
							{/if}
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
	{/if}
</Modal>
