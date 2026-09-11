<!--
	Pantalla Billetera: el saldo y el libro que lo explica.

	El saldo solo no dice nada. Lo que hace auditable a una economía es poder
	seguir cada movimiento hasta el hecho que lo causó, y por eso cada asiento
	muestra **el saldo con el que quedó**: leyendo esa columna de arriba a abajo se
	reconstruye la historia sin tener que sumar.

	Es la misma idea que la bitácora, aplicada a la plata. Y va a importar cada vez
	más: cuando los precios los muevan los jugadores, esta pantalla es donde se ve
	si un viaje valió la pena.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let billetera = $derived(data.billetera);

	/** La fecha de un asiento, en la hora del jugador y no en la del servidor. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head><title>Billetera · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Billetera</Eyebrow>
	<DisplayTitle>{billetera.balance}</DisplayTitle>
</div>

{#if billetera.entries.length === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>Todavía no movió plata</CardTitle>
			<BodyText>
				Acá va a quedar cada cobro y cada pago, con el saldo que dejó. Todo movimiento de valor deja
				asiento: es lo único que permite auditar la economía el día que algo no cierre.
			</BodyText>
		</div>
	</Panel>
{:else}
	<TitledPanel
		title="Movimientos"
		detail={billetera.total === 1 ? '1 asiento' : `${billetera.total} asientos`}
		class="w-full"
	>
		<div class="flex w-full flex-col">
			{#each billetera.entries as asiento (asiento.id)}
				<div
					class="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-soft
						px-[0.6rem] py-[0.7rem] last:border-b-0"
				>
					<Icon
						name={asiento.icon}
						weight="duotone"
						size="0.95rem"
						class={asiento.incoming ? 'text-data' : 'text-accent'}
					/>

					<span class="flex min-w-[9rem] flex-[1_1_12rem] flex-col items-start gap-[0.15rem]">
						<span
							class="font-display text-[0.8rem] font-bold tracking-display text-text-strong uppercase"
						>
							{asiento.kindLabel}
						</span>
						<span class="font-mono text-[0.62rem] text-text-muted">
							{fecha(asiento.at)}{asiento.place ? ` · ${asiento.place}` : ''}
						</span>
					</span>

					{#if asiento.memo}
						<span class="min-w-0 flex-[2_1_10rem] text-1 text-text-body">{asiento.memo}</span>
					{/if}

					<div class="grow"></div>

					<!--
						El importe y el saldo van juntos. El signo va escrito y no sólo
						pintado: si entró o salió plata también tiene que leerse sin color.
					-->
					<span class="flex shrink-0 flex-col items-end gap-[0.15rem]">
						<span
							class="font-mono text-[0.88rem] {asiento.incoming
								? 'text-data'
								: 'text-accent-bright'}"
						>
							{asiento.amount}
						</span>
						<span class="flex items-baseline gap-2">
							<Label>Saldo</Label>
							<span class="font-mono text-[0.68rem] text-text-muted">{asiento.balanceAfter}</span>
						</span>
					</span>
				</div>
			{/each}
		</div>
	</TitledPanel>
{/if}
