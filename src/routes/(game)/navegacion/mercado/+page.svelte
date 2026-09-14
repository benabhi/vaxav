<!--
	El mercado de la estación.

	**La forma es la del mercado de EVE Online**, con la voz de Elite: un árbol de
	categorías a la izquierda para examinar, la lista de la rama elegida arriba a
	la derecha, y abajo el ítem seleccionado con sus dos libros de órdenes —quién
	vende y quién compra—. No es un capricho de imitación: es la única forma que
	aguanta un catálogo que va a tener cientos de módulos. Una lista plana con
	filtros funciona con cuarenta y siete y se vuelve inusable con seiscientos, y
	entonces la pantalla habría que hacerla dos veces.

	Mientras la estación sea la única contraparte, cada libro tiene **una sola
	orden**: la suya. El día que haya órdenes de jugadores, son más filas en la
	misma tabla —con su cantidad, su precio y sus saltos—, y la pantalla no cambia
	de forma. Por eso las columnas ya están, aunque hoy digan siempre lo mismo.

	La figura de la pantalla va **entre los dos libros**, que es su lugar natural:
	lo que dibuja es exactamente la distancia entre ellos.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ConfirmAction from '$lib/components/game/ConfirmAction.svelte';
	import PriceSpread from '$lib/components/game/PriceSpread.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { MIN_SPREAD_PERCENT, askTotal, bidTotal } from '$lib/game/market';
	import { thousands } from '$lib/format';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let market = $derived(data.market);

	/** La rama abierta del árbol. Estado de pantalla: no viaja al servidor. */
	let group = $state('held');
	/** Lo tipeado en el buscador. */
	let search = $state('');
	/** El ítem abierto abajo, con sus dos libros. */
	let selected = $state('');
	/** Cuántas unidades se van a mover. Se reinicia al cambiar de ítem. */
	let units = $state(1);

	/**
	 * Al cambiar de estación el mostrador es otro: lo elegido antes puede no estar
	 * a la venta acá. Se compara contra la última vista porque navegar a la misma
	 * ruta reusa el componente y el estado sobrevive.
	 */
	let lastStation = $state('');
	$effect(() => {
		if (lastStation !== market.stationName) {
			lastStation = market.stationName;
			selected = '';
			group = market.items.some((item) => item.held > 0) ? 'held' : 'ore';
		}
	});

	/**
	 * Hecha la operación, la cantidad vuelve a uno.
	 *
	 * Después de vender los 220 que había, dejar "220" escrito en el campo es una
	 * lectura que ya no corresponde a nada: el próximo pedido parte de cero otra
	 * vez.
	 */
	let lastForm = $state<unknown>(null);
	$effect(() => {
		if (form !== lastForm) {
			lastForm = form;
			if (form?.sold || form?.bought) units = 1;
		}
	});

	/** Las ramas de primer nivel y las que cuelgan de cada una. */
	let roots = $derived(market.groups.filter((rama) => rama.parent === ''));
	function children(code: string) {
		return market.groups.filter((rama) => rama.parent === code);
	}

	/**
	 * Qué se lista arriba a la derecha.
	 *
	 * Buscar **ignora la rama abierta**, como en EVE: quien escribe un nombre
	 * quiere encontrarlo, no que le digan que no está en la categoría en la que
	 * quedó parado.
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

	let chosen = $derived(market.items.find((item) => item.itemCode === selected) ?? null);

	/** La horquilla que le toca a lo que está abierto. */
	let spread = $derived(chosen && chosen.group !== 'ore' ? market.moduleSpread : market.oreSpread);

	/** Las dos bodegas que el piloto tiene a mano, con lo que hay en cada una. */
	let holds = $derived([
		{ where: 'ship' as const, label: 'En la nave', units: chosen?.inShip ?? 0 },
		{ where: 'station' as const, label: 'En la estación', units: chosen?.inStation ?? 0 }
	]);

	function choose(code: string) {
		selected = code;
		units = 1;
	}

	/**
	 * Lo que **de verdad** se va a cobrar por un lote.
	 *
	 * Se rehace con las mismas funciones puras que usa el servidor y no
	 * multiplicando el precio de vitrina: 220 silicatos a 10 no son 2.200 sino
	 * 2.191, porque la cuenta se redondea una vez sobre el lote entero. Mostrar
	 * la multiplicación y cobrar otra cosa es la clase de diferencia chica que
	 * hace dudar de todos los demás números de la pantalla.
	 */
	let cobro = $derived((quantity: number) =>
		chosen ? askTotal(chosen.basePrice, quantity, spread.percent) : 0
	);
	let pago = $derived((quantity: number) =>
		chosen ? bidTotal(chosen.basePrice, quantity, spread.percent) : 0
	);
</script>

<svelte:head><title>Mercado · Navegación · Vaxav</title></svelte:head>

<div class="flex w-full flex-col items-start gap-1">
	<Eyebrow>Mercado de</Eyebrow>
	<DisplayTitle>{market.stationName || 'Ningún mostrador'}</DisplayTitle>
</div>

{#if !market.open}
	<Panel class="w-full p-5">
		<div class="flex w-full flex-col items-start gap-4">
			<div class="flex items-center gap-2">
				<Icon name="storefront" weight="duotone" size="1.4rem" class="text-text-muted" />
				<CardTitle>Sin mostrador</CardTitle>
			</div>
			<BodyText>{market.closedReason}</BodyText>
			<HudLink href="/navegacion" size="1">
				<Icon name="caret-left" weight="bold" size="0.7rem" />
				Volver a la ubicación
			</HudLink>
		</div>
	</Panel>
{:else}
	<!--
		La cabecera del mostrador: con quién se está tratando y con qué se cuenta.
		El saldo va acá y no escondido en la billetera porque es la mitad de toda
		decisión que se toma en esta pantalla.
	-->
	<div class="flex w-full flex-wrap items-end gap-x-5 gap-y-3">
		<div class="flex min-w-0 flex-col items-start gap-1">
			<Label>Opera</Label>
			<p class="font-display text-2 font-medium tracking-display text-accent-bright uppercase">
				{market.corporationName}
				{#if market.corporationKind}
					<span class="text-accent-dim">· {market.corporationKind}</span>
				{/if}
			</p>
		</div>
		<div class="grow"></div>
		<div class="flex flex-col items-start gap-1">
			<Label>Saldo</Label>
			<p class="font-mono text-3 text-data">{market.balance} CR</p>
		</div>
		<div class="flex flex-col items-start gap-1">
			<Label>Bodega libre</Label>
			<p class="font-mono text-2 text-text-body">{market.cargoFree} m³</p>
		</div>
	</div>

	{#if form?.error}
		<p
			class="w-full border-l-[3px] border-l-danger bg-danger-wash px-4 py-3 text-2 text-text-strong"
		>
			{form.error}
		</p>
	{:else if form?.sold}
		<p
			class="w-full border-l-[3px] border-l-success bg-success-wash px-4 py-3 font-mono text-2 text-text-strong"
		>
			Vendido · {form.sold}
		</p>
	{:else if form?.bought}
		<p
			class="w-full border-l-[3px] border-l-data bg-surface-strong px-4 py-3 font-mono text-2 text-text-strong"
		>
			Comprado · {form.bought} · queda en la bodega de la estación
		</p>
	{/if}

	<div class="flex w-full flex-col items-start gap-4 lg:flex-row">
		<!--
			El examinador. En pantalla chica va arriba y ocupa todo el ancho: en un
			teléfono no hay dos columnas, y el árbol sigue siendo por dónde se empieza.
		-->
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
							class="h-9 w-full border border-border-soft bg-field pr-3 pl-8 font-body text-2
								text-text-strong transition-[border-color,box-shadow] placeholder:text-text-muted
								hover:border-border focus:border-accent focus:shadow-glow focus:outline-none"
						/>
					</div>

					<!--
						No es un `nav`: el árbol no navega a ningún lado, filtra lo que se
						lista al lado. El único landmark de navegación de una pantalla del
						juego es el Neocom, y hay un humo que lo da por sentado.
					-->
					<div class="flex w-full flex-col" role="group" aria-label="Categorías del mercado">
						{#each roots as rama (rama.code)}
							{@const abierta =
								group === rama.code || children(rama.code).some((h) => h.code === group)}
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

					{#if market.heldTotal !== '0'}
						<div class="flex w-full items-baseline gap-2 border-t border-border-soft pt-3">
							<Label>Tu carga vale</Label>
							<div class="grow"></div>
							<span class="font-mono text-2 text-data">{market.heldTotal} CR</span>
						</div>
					{/if}
				</div>
			</TitledPanel>
		</div>

		<div class="flex w-full min-w-0 flex-[1_1_0] flex-col gap-4">
			<!--
				La lista de la rama. Se desplaza dentro de su propio contenedor: con
				cuarenta y siete módulos ya es larga, y arrastrar la página entera para
				llegar al final no es una forma de mirar un catálogo.
			-->
			<TitledPanel
				title={search.trim()
					? 'Resultados'
					: (roots.find((r) => r.code === group)?.label ?? 'Catálogo')}
				detail="{listed.length} ítems"
				class="w-full"
			>
				<div class="w-full overflow-x-auto">
					<div class="max-h-[22rem] min-w-[32rem] overflow-y-auto">
						<table class="w-full border-collapse text-left">
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
										Volumen
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Te cobran
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Te pagan
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
										onclick={() => choose(item.itemCode)}
										class="cursor-pointer border-b border-border-soft/40 transition-colors
											{selected === item.itemCode ? 'bg-surface-strong' : 'hover:bg-surface-hover'}"
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
											class="py-[0.4rem] pr-3 text-right font-mono text-[0.72rem] text-text-muted"
										>
											{item.volume}
										</td>
										<td
											class="py-[0.4rem] pr-3 text-right font-mono text-[0.75rem] text-accent-bright"
										>
											{item.sells ? item.askLabel : '—'}
										</td>
										<td class="py-[0.4rem] pr-3 text-right font-mono text-[0.75rem] text-data">
											{item.buys ? item.bidLabel : '—'}
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

			<!-- El ítem elegido, con sus dos libros. -->
			{#if chosen}
				<TitledPanel title={chosen.name} detail={chosen.tier} class="w-full">
					<div class="flex w-full flex-col gap-5">
						<div class="flex w-full items-start gap-4">
							<Icon
								name={chosen.icon}
								weight="duotone"
								size="2.2rem"
								class="shrink-0 text-accent"
							/>
							<div class="flex min-w-0 flex-col items-start gap-2">
								<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
									<span class="font-display text-1 tracking-label text-accent-dim uppercase">
										{chosen.groupLabel}
									</span>
									<span class="font-mono text-[0.72rem] text-text-muted">{chosen.volume} m³/u</span>
									{#if chosen.held > 0}
										<span class="font-mono text-[0.72rem] text-data">
											Tenés {chosen.held} u
										</span>
									{/if}
								</div>
								<BodyText>{chosen.summary}</BodyText>
							</div>
						</div>

						<!-- Cuántas unidades mueve el pedido. -->
						<div class="flex w-full flex-wrap items-center gap-3 border-y border-border-soft py-3">
							<Label>Cantidad</Label>
							<input
								type="number"
								min="1"
								bind:value={units}
								aria-label="Unidades"
								class="h-9 w-24 border border-border-soft bg-field px-3 text-right font-mono text-2
									text-text-strong hover:border-border focus:border-accent focus:shadow-glow
									focus:outline-none"
							/>
							{#if chosen.held > 0}
								<HudButton size="1" onclick={() => (units = chosen.held)}>Todo</HudButton>
							{/if}
						</div>

						<!--
							VENDEDORES: quién ofrece el ítem. Hoy sólo la estación, con
							existencias sin tope; mañana, una fila por orden de jugador. Las
							columnas ya son las que van a hacer falta.
						-->
						<div class="flex w-full flex-col gap-2">
							<Label>Vendedores</Label>
							{#if chosen.sells}
								<div class="w-full overflow-x-auto">
									<table class="w-full min-w-[28rem] border-collapse text-left">
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
													Saltos
												</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td class="py-2 pr-3 text-right font-mono text-2 text-text-body"
													>Sin tope</td
												>
												<td class="py-2 pr-3 text-right font-mono text-2 text-accent-bright">
													{chosen.askLabel} CR
												</td>
												<td class="py-2 pr-3 text-2 text-text-body">{market.stationName}</td>
												<td class="py-2 pr-3 text-right font-mono text-[0.72rem] text-text-muted">
													Acá
												</td>
												<td class="py-2 text-right">
													<ConfirmAction
														title="Comprar {units} × {chosen.name}"
														icon="storefront"
														confirmLabel="Comprar"
														formAction="?/comprar"
														readings={[
															{ label: 'Unidades', value: `${units}` },
															{ label: 'Precio', value: `${chosen.askLabel} CR c/u` },
															{ label: 'Total', value: `${thousands(cobro(units))} CR` },
															{ label: 'Saldo', value: `${market.balance} CR` }
														]}
														note="Queda en la bodega de {market.stationName}, listo para montar o subir a bordo."
													>
														{#snippet trigger(abrir)}
															<HudButton size="1" onclick={abrir} disabled={units < 1}>
																Comprar
															</HudButton>
														{/snippet}
														{#snippet fields()}
															<input type="hidden" name="item" value={chosen.itemCode} />
															<input type="hidden" name="unidades" value={units} />
														{/snippet}
													</ConfirmAction>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							{:else}
								<p class="text-1 text-text-muted">
									{market.tradesModules
										? 'La estación no pone esto a la venta.'
										: 'Acá no hay mercado: sólo se puede vender.'}
								</p>
							{/if}
						</div>

						<!-- La figura, entre los dos libros: lo que dibuja es la distancia entre ellos. -->
						<PriceSpread
							{spread}
							subject={chosen.group === 'ore' ? 'Mineral' : 'Módulos'}
							floorPercent={MIN_SPREAD_PERCENT}
						/>

						<!--
							COMPRADORES: quién paga por el ítem. Debajo, lo que el piloto tiene
							para soltar, separado por bodega: lo de la nave viaja con él, lo de
							la estación se queda acá, y vender no es lo mismo en los dos casos.
						-->
						<div class="flex w-full flex-col gap-2">
							<Label>Compradores</Label>
							{#if chosen.buys}
								<div class="w-full overflow-x-auto">
									<table class="w-full min-w-[28rem] border-collapse text-left">
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
													Saltos
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td class="py-2 pr-3 text-right font-mono text-2 text-text-body"
													>Sin tope</td
												>
												<td class="py-2 pr-3 text-right font-mono text-2 text-data">
													{chosen.bidLabel} CR
												</td>
												<td class="py-2 pr-3 text-2 text-text-body">{market.stationName}</td>
												<td class="py-2 pr-3 text-right font-mono text-[0.72rem] text-text-muted">
													Acá
												</td>
											</tr>
										</tbody>
									</table>
								</div>

								<!--
									De dónde sale lo que se vende. Son dos bodegas distintas y la
									diferencia importa: lo de la nave viaja con el piloto, lo de la
									estación se queda acá. Sólo aparece la que tenga algo; una fila
									en cero es ruido.
								-->
								{#if chosen.held > 0}
									<div class="mt-2 flex w-full flex-col gap-2 border-t border-border-soft pt-3">
										<Label>De tu carga</Label>
										{#each holds as origen (origen.where)}
											{#if origen.units > 0}
												{@const cuantas = Math.min(units, origen.units)}
												<div class="flex w-full flex-wrap items-center gap-3">
													<span class="font-mono text-2 text-text-body">
														{origen.label} · {origen.units} u
													</span>
													<div class="grow"></div>
													<span class="font-mono text-[0.75rem] text-data">
														{thousands(pago(cuantas))} CR por {cuantas}
													</span>
													<ConfirmAction
														title="Vender {cuantas} × {chosen.name}"
														icon="coins"
														confirmLabel="Vender"
														formAction="?/vender"
														readings={[
															{ label: 'Unidades', value: `${cuantas}` },
															{ label: 'Precio', value: `${chosen.bidLabel} CR c/u` },
															{ label: 'Total', value: `${thousands(pago(cuantas))} CR` },
															{ label: 'Desde', value: origen.label }
														]}
														note="El precio por unidad es de vitrina; lo que se cobra es el total, que se redondea una sola vez sobre el lote."
													>
														{#snippet trigger(abrir)}
															<HudButton size="1" variant="primary" onclick={abrir}
																>Vender</HudButton
															>
														{/snippet}
														{#snippet fields()}
															<input type="hidden" name="item" value={chosen.itemCode} />
															<input type="hidden" name="unidades" value={cuantas} />
															<input type="hidden" name="desde" value={origen.where} />
														{/snippet}
													</ConfirmAction>
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							{:else}
								<p class="text-1 text-text-muted">{market.stationName} no compra esto.</p>
							{/if}
						</div>
					</div>
				</TitledPanel>
			{:else}
				<Panel class="w-full p-5">
					<p class="text-1 text-text-muted">
						Elegí un ítem de la lista para ver quién lo vende y quién lo compra.
					</p>
				</Panel>
			{/if}

			<div class="flex w-full justify-start">
				<HudLink href="/navegacion" size="1" variant="ghost">
					<Icon name="caret-left" weight="bold" size="0.7rem" />
					Volver a la ubicación
				</HudLink>
			</div>
		</div>
	</div>
{/if}
