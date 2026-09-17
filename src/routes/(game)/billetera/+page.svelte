<!--
	Pantalla Billetera: el saldo, el balance y el libro que los explica.

	El saldo solo no dice nada. Lo que hace auditable a una economía es poder
	seguir cada movimiento hasta el hecho que lo causó, y por eso cada asiento
	muestra **el saldo con el que quedó**: leyendo esa columna de arriba a abajo se
	reconstruye la historia sin tener que sumar.

	Va **en tabla y no en tarjetas apiladas** porque un libro contable es una
	tabla: lo que uno hace acá es recorrer una columna —los egresos, los saldos— y
	con cada renglón dibujado como una ficha suelta esa lectura vertical no existe.
	Ingresos y egresos van en **columnas distintas**: el ojo encuentra en qué se fue
	la plata sin leer signos.

	En pantalla angosta la tabla se desplaza dentro de su contenedor y las columnas
	accesorias —detalle y lugar— se esconden, que es la misma regla que usa el
	mercado. Es la misma idea que la bitácora, aplicada a la plata: cuando los
	precios los muevan los jugadores, esta pantalla es donde se ve si un viaje
	valió la pena.
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
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';

	let { data }: PageProps = $props();

	let billetera = $derived(data.billetera);

	/**
	 * La fecha de un asiento, en la hora del jugador y no en la del servidor.
	 *
	 * En 24 horas y no en «a. m./p. m.»: el juego lleva reloj UTC de 24 en la barra
	 * de estado, y la forma larga se comía la columna de al lado.
	 */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	/** Las columnas del libro. */
	const COLUMNAS: Columna[] = [
		// Los anchos van declarados: las tres columnas de cifras tienen que caer siempre
		// en el mismo lugar para que se las pueda recorrer de un vistazo, y con anchos
		// automáticos se corren según qué diga el renglón más largo.
		{ label: 'Fecha', width: '7.5rem' },
		{ label: 'Concepto', width: '11rem' },
		{ label: 'Detalle', from: 'md' },
		{ label: 'Lugar', width: '9rem', from: 'lg' },
		{ label: 'Ingreso', width: '7rem', class: 'text-right' },
		{ label: 'Egreso', width: '7rem', class: 'text-right' },
		{ label: 'Saldo', width: '7.5rem', class: 'text-right' }
	];
</script>

<svelte:head><title>Billetera · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Billetera</Eyebrow>
	<DisplayTitle>{billetera.balance}</DisplayTitle>
</div>

<!--
	El balance de arriba: dónde estás y cómo llegaste. Dos pilotos con el mismo
	saldo no están en la misma situación si uno movió diez veces más que el otro.
-->
<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Ingresos</Label>
		<span class="flex items-center gap-2">
			<Icon name="caret-up" weight="fill" size="0.7rem" class="text-data" />
			<span class="font-mono text-3 text-data">{billetera.incoming}</span>
		</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Egresos</Label>
		<span class="flex items-center gap-2">
			<Icon name="caret-down" weight="fill" size="0.7rem" class="text-accent-bright" />
			<span class="font-mono text-3 text-accent-bright">{billetera.outgoing}</span>
		</span>
	</div>
	<div class="grow"></div>
	<div class="flex flex-col items-start gap-1">
		<Label>Asientos</Label>
		<span class="font-mono text-3 text-text-body">{billetera.total}</span>
	</div>
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
		detail={billetera.entries.length < billetera.total
			? `los últimos ${billetera.entries.length} de ${billetera.total}`
			: billetera.total === 1
				? '1 asiento'
				: `${billetera.total} asientos`}
		class="w-full"
	>
		<HudTable columns={COLUMNAS} minWidth="38rem">
			{#each billetera.entries as asiento (asiento.id)}
				<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
					<td class="py-[0.45rem] pr-3 font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
						{fecha(asiento.at)}
					</td>
					<td class="py-[0.45rem] pr-3">
						<div class="flex min-w-0 items-center gap-2">
							<Icon
								name={asiento.icon}
								weight="duotone"
								size="0.9rem"
								class="shrink-0 {asiento.incoming ? 'text-data' : 'text-accent'}"
							/>
							<span
								class="truncate font-display text-[0.76rem] font-bold tracking-display
										text-text-strong uppercase"
							>
								{asiento.kindLabel}
							</span>
						</div>
					</td>
					<td class="hidden py-[0.45rem] pr-3 text-1 text-text-body md:table-cell">
						<span class="line-clamp-2">{asiento.memo}</span>
					</td>
					<td
						class="hidden py-[0.45rem] pr-3 text-2 whitespace-nowrap text-text-muted lg:table-cell"
					>
						{asiento.place || '—'}
					</td>

					<!--
							Ingreso y egreso en columnas separadas, y sólo una llena por
							renglón: con un único importe con signo hay que leer el signo de
							cada fila para contestar "¿en qué se me fue la plata?".
						-->
					<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.8rem] text-data">
						{asiento.incoming ? asiento.amount : ''}
					</td>
					<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.8rem] text-accent-bright">
						{asiento.incoming ? '' : asiento.amount}
					</td>
					<td class="py-[0.45rem] text-right font-mono text-[0.8rem] text-text-body">
						{asiento.balanceAfter}
					</td>
				</tr>
			{/each}
		</HudTable>
	</TitledPanel>
{/if}
