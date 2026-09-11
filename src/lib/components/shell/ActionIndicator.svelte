<!--
	El indicador de acción: la parte de la barra de estado que siempre se ve.

	Es lo único que le dice al jugador **qué está pasando ahora mismo**, y en un
	juego que se juega de a ratos eso es media interfaz: se entra, se mira la barra
	de arriba, y ya se sabe si hay algo en marcha o si toca dar una orden.

	Por eso dice las cuatro cosas y no menos: **qué** se está haciendo, **de dónde
	a dónde**, **cuánto va** y **cuánto falta**. Una barra sola es bonita y no
	informa; un porcentaje solo no dice qué se está haciendo.

	Sólo monitorea — nunca dispara nada. Dar órdenes es cosa de las pantallas.

	**El reloj es del navegador.** El servidor manda el instante en que la orden
	arrancó y cuánto dura, y acá se cuenta: es decorativo, la verdad es el instante
	guardado. Al llegar a cero se recarga la página para que el servidor aplique lo
	que venció.
-->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Icon from '../Icon.svelte';
	import ChargeBar from '../meters/ChargeBar.svelte';
	import { remainingLabel } from '$lib/format';
	import type { AccionEnCurso } from '$lib/tipos';

	interface Props {
		action: AccionEnCurso | null;
	}

	let { action }: Props = $props();

	/** El reloj local. Avanza una vez por segundo mientras haya algo que contar. */
	let ahora = $state(Date.now());

	$effect(() => {
		if (!action) return;
		const reloj = setInterval(() => (ahora = Date.now()), 1000);
		return () => clearInterval(reloj);
	});

	let transcurrido = $derived(action ? (ahora - action.startedAt) / 1000 : 0);
	let duracion = $derived(action ? Math.max(1, action.durationSeconds) : 1);
	let percent = $derived(Math.max(0, Math.min(100, Math.trunc((transcurrido / duracion) * 100))));
	let restante = $derived(Math.max(0, duracion - transcurrido));

	/**
	 * Al vencer, se le pide al servidor que resuelva. Una sola vez: sin la
	 * bandera, cada segundo dispararía otra recarga.
	 */
	let pedido = $state(false);
	$effect(() => {
		if (action && restante <= 0 && !pedido) {
			pedido = true;
			invalidateAll();
		}
	});
</script>

{#if action}
	<div class="flex w-full max-w-[30rem] min-w-[11rem] items-center gap-[0.6rem]">
		<!--
			El ícono es lo que hace que se distinga una orden de otra de un vistazo,
			cuando existan minar, refinar y las demás.
		-->
		<Icon name={action.icon} weight="fill" size="1rem" class="text-accent" />
		<div class="flex w-full min-w-0 flex-col gap-1">
			<div class="flex w-full min-w-0 items-center gap-[0.6rem]">
				<span
					class="font-display text-[0.76rem] font-bold tracking-display whitespace-nowrap text-text-strong uppercase"
				>
					{action.label}
				</span>

				<!--
					De dónde a dónde, con la flecha en el medio. Se esconde en pantallas
					angostas: el destino ya está en el rótulo, y en un teléfono el origen es
					lo primero que sobra.
				-->
				<div class="hidden items-center gap-[0.3rem] sm:flex">
					<span
						class="font-display text-[0.66rem] tracking-display whitespace-nowrap text-text-muted uppercase"
					>
						{action.origin}
					</span>
					<Icon name="caret-right" weight="bold" size="0.6rem" class="text-accent-dim" />
					<span
						class="font-display text-[0.66rem] tracking-display whitespace-nowrap text-accent-bright uppercase"
					>
						{action.destination}
					</span>
				</div>

				<div class="grow"></div>
				<span class="shrink-0 font-mono text-[0.76rem] whitespace-nowrap text-text-muted">
					{percent} %
				</span>
				<span class="shrink-0 font-mono text-[0.76rem] whitespace-nowrap text-accent-bright">
					{remainingLabel(restante)}
				</span>
			</div>
			<ChargeBar {percent} />
		</div>
	</div>
{:else}
	<span
		class="font-display text-[0.72rem] tracking-label whitespace-nowrap text-text-muted uppercase"
	>
		Sin órdenes. Elegí algo para hacer.
	</span>
{/if}
