<!--
	Un evento en su forma corta: la frase, quién y cuándo.

	Es la que va en el resumen de la portada y en cualquier ficha que quiera
	asomar lo último que pasó con algo. El registro entero **no** la usa: ahí lo
	que se hace es recorrer columnas —quién, cuándo, de qué tipo— y para eso está
	la tabla.

	El peso del evento se lee en el borde izquierdo antes que en el texto, que es
	lo que permite encontrar una baja de cuenta en una lista de altas sin leerlas.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import { TONE_COLOR, TONE_EDGE } from './tonos';
	import type { FilaEvento } from '$lib/tipos';

	interface Props {
		event: FilaEvento;
	}

	let { event }: Props = $props();

	/** La fecha en la hora de quien mira, en 24 horas como el reloj del HUD. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}
</script>

<div
	class="flex w-full items-start gap-[0.6rem] border-l-[2px] py-[0.4rem] pl-[0.6rem]
		{TONE_EDGE[event.tone]}"
>
	<Icon
		name={event.icon}
		weight="duotone"
		size="0.95rem"
		class="mt-[0.1rem] shrink-0 {TONE_COLOR[event.tone]}"
	/>
	<div class="flex min-w-0 grow flex-col gap-[0.15rem]">
		<span class="text-1 text-text-body">{event.text}</span>
		<span class="font-mono text-[0.65rem] text-text-muted">
			{fecha(event.at)} · {event.actor || 'el sistema'}
		</span>
	</div>
</div>
