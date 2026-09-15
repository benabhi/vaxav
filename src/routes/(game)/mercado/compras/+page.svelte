<!--
	Pestaña «Órdenes de compra»: lo que el piloto está pidiendo, con la plata ya apartada.

	La tabla la pone `OwnOrders`, que es la misma de la pestaña de ventas: lo único
	que cambia entre las dos es qué órdenes le llegan.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import OwnOrders from '$lib/components/game/OwnOrders.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import SkillHint from '$lib/components/game/SkillHint.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let orders = $derived(data.orders);
</script>

<svelte:head><title>Órdenes de compra · Vaxav</title></svelte:head>

<div class="flex w-full flex-col items-start gap-1">
	<Eyebrow>Lo que pedís</Eyebrow>
	<DisplayTitle>Órdenes de compra</DisplayTitle>
</div>

<div class="flex w-full flex-wrap items-start gap-x-5 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<div class="flex items-center gap-[0.35rem]">
			<Label>Publicadas</Label>
			<SkillHint what="Cuántas órdenes podés tener abiertas" skills={['accounting']} />
		</div>
		<p class="font-mono text-2 text-accent-bright">{orders.orders.length}</p>
	</div>
	<div class="flex flex-col items-start gap-1">
		<div class="flex items-center gap-[0.35rem]">
			<Label>Duración</Label>
			<SkillHint what="Cuánto puede quedar publicada" skills={['contacts']} />
		</div>
		<p class="font-mono text-2 text-text-muted">se elige al publicar</p>
	</div>
	<div class="grow"></div>
	<div class="flex flex-col items-start gap-1">
		<Label>Saldo</Label>
		<p class="font-mono text-2 text-data">{orders.balance} CR</p>
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

<TitledPanel title="Órdenes de compra" detail="{orders.orders.length} abiertas" class="w-full">
	<OwnOrders
		orders={orders.orders}
		empty="No tenés ninguna orden de compra puesta. Se pone desde el mercado."
	/>
</TitledPanel>

{#if orders.otherCount > 0}
	<!--
		El número del otro lado, para no tener que ir a mirar si hay trabajo allá.
	-->
	<div class="flex w-full items-center gap-3 border-l-[3px] border-l-border bg-surface px-4 py-3">
		<Icon name="handshake" weight="duotone" size="1rem" class="shrink-0 text-accent" />
		<span class="text-1 text-text-muted">
			Tenés además {orders.otherCount}
			{orders.otherCount === 1 ? 'orden de venta' : 'órdenes de venta'} publicadas.
		</span>
	</div>
{/if}
