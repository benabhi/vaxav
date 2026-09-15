<!--
	Propiedades: todo lo del piloto, lugar por lugar.

	La pregunta de esta pantalla no es "qué tengo" sino **"qué tengo y dónde"**, y
	por eso se agrupa por lugar y no por ítem. Con una lista plana, doscientas
	unidades de hierro repartidas en cuatro estaciones se leen como doscientas
	unidades de hierro, y lo que hay que decidir es a cuál de las cuatro ir.

	Cada lugar dice **cuánto vale lo que hay ahí**. Es lo que convierte "tengo
	cosas en el Muelle" en "tengo catorce mil créditos parados en el Muelle", que
	es una frase que hace actuar.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ProgressBar from '$lib/components/meters/ProgressBar.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let assets = $derived(data.assets);
</script>

<svelte:head><title>Propiedades · Vaxav</title></svelte:head>

<div class="flex w-full flex-col items-start gap-1">
	<Eyebrow>Propiedades</Eyebrow>
	<DisplayTitle>Lo que tenés</DisplayTitle>
</div>

<!-- Del mismo tamaño y alineadas por arriba, como la fila del mercado. -->
<div class="flex w-full flex-wrap items-start gap-x-5 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Valor de referencia</Label>
		<p class="font-mono text-2 text-data">{assets.totalValue} CR</p>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Lugares con carga</Label>
		<p class="font-mono text-2 text-text-body">{assets.placeCount}</p>
	</div>
</div>

<div class="flex w-full flex-col gap-4">
	{#each assets.places as lugar (lugar.key)}
		<TitledPanel title={lugar.name} detail="{lugar.value} CR" class="w-full">
			<div class="flex w-full flex-col gap-3">
				<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
					<Icon
						name={lugar.kind === 'ship' ? 'rocket' : 'buildings'}
						weight="duotone"
						size="0.9rem"
						class="text-accent"
					/>
					<span class="font-display text-1 tracking-label text-accent-dim uppercase">
						{lugar.where}
					</span>
					{#if lugar.here}
						<!--
							Estar parado ahí cambia todo lo que se puede hacer con eso, así que
							se dice con una etiqueta y no con un matiz de color.
						-->
						<span
							class="border border-data px-[0.35rem] py-[0.05rem] font-display text-[0.6rem]
								font-bold tracking-label text-data uppercase"
						>
							Estás acá
						</span>
					{/if}
					<div class="grow"></div>
					<span class="font-mono text-[0.72rem] text-text-muted">
						{lugar.used}{lugar.capacity ? ` / ${lugar.capacity}` : ''} m³
					</span>
				</div>

				{#if lugar.capacity}
					<ProgressBar percent={lugar.percent} />
				{/if}

				{#if lugar.lines.length === 0}
					<p class="text-1 text-text-muted">Vacía.</p>
				{:else}
					<div class="w-full overflow-x-auto">
						<table
							class="w-full min-w-[26rem] border-collapse text-left [&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
						>
							<thead>
								<tr class="border-b border-border-soft">
									<th
										class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Ítem
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Unidades
									</th>
									<th
										class="py-2 pr-3 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Volumen
									</th>
									<th
										class="py-2 text-right font-display text-1 tracking-label text-accent-dim uppercase"
									>
										Valor
									</th>
								</tr>
							</thead>
							<tbody>
								{#each lugar.lines as fila (fila.itemCode + (fila.listed ? '-listed' : ''))}
									<tr class="border-b border-border-soft/40 last:border-0">
										<td class="py-[0.4rem] pr-3">
											<div class="flex flex-wrap items-center gap-2">
												<Icon name={fila.icon} weight="duotone" size="0.9rem" class="text-accent" />
												<span class="text-2 text-text-strong">{fila.name}</span>
												{#if fila.listed}
													<!--
														Sigue siendo del piloto, pero está en garantía de una orden:
														no se puede montar ni llevar sin cancelarla primero.
													-->
													<span
														class="border border-border-soft px-[0.3rem] font-display text-[0.55rem]
															tracking-label text-text-muted uppercase"
													>
														Publicado
													</span>
												{/if}
											</div>
										</td>
										<td
											class="py-[0.4rem] pr-3 text-right font-mono text-[0.8rem] text-accent-bright"
										>
											{fila.quantity}
										</td>
										<td
											class="py-[0.4rem] pr-3 text-right font-mono text-[0.72rem] text-text-muted"
										>
											{fila.volume}
										</td>
										<td class="py-[0.4rem] text-right font-mono text-[0.75rem] text-data">
											{fila.value}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</TitledPanel>
	{:else}
		<Panel class="w-full p-5">
			<p class="text-1 text-text-muted">
				Todavía no tenés nada en ningún lado. Lo que mines y lo que compres va a aparecer acá, con
				el lugar donde quedó.
			</p>
		</Panel>
	{/each}
</div>
