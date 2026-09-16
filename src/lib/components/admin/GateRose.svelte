<!--
	La roseta de un sistema: por qué lados se sale.

	Ocho puestos repartidos cada 45°, con los ocupados encendidos. Se lee de un
	vistazo cuántas salidas tiene el sistema y hacia dónde, que es la pregunta con
	la que uno mira un sistema mientras arma la galaxia. **Y la que todavía no
	lleva a ninguna parte se marca distinto**, porque es trabajo a medio hacer y un
	universo sano no tiene ninguna.

	Existe para el mapa que viene: cuando la galaxia se dibuje como en X4 —cada
	sistema una casilla y sus salidas apuntando hacia afuera—, este mismo rumbo va
	a decidir por qué borde sale cada línea. Dibujarla ahora es la forma de que el
	dato se elija mirándolo y no a ciegas.

	Se dibuja a mano, con cajas y un círculo: el alto sale de `aspect-ratio` y
	nunca de un valor fijo, o el círculo se vuelve una elipse al achicarse.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { FilaPuerta } from '$lib/tipos';

	interface Props {
		bearings: readonly { value: string; label: string; angle: number; taken: boolean }[];
		gates: readonly FilaPuerta[];
		/** El rumbo señalado, si hay uno elegido en el formulario de al lado. */
		highlight?: string;
	}

	let { bearings, gates, highlight = '' }: Props = $props();

	/** Las puertas por rumbo, para saber cuál está suelta. */
	let porRumbo = $derived(new Map(gates.map((una) => [una.bearing, una])));

	/** Dónde cae un puesto, en porcentaje del cuadrado y con el norte arriba. */
	function posicion(angle: number): { left: string; top: string } {
		const radianes = ((angle - 90) * Math.PI) / 180;
		return {
			left: `${50 + Math.cos(radianes) * 38}%`,
			top: `${50 + Math.sin(radianes) * 38}%`
		};
	}
</script>

<!--
	Mide lo suyo y no el cien por ciento del padre. Con `w-full` dentro de un
	contenedor que se encoge al contenido, el ancho se define en círculo: el padre
	espera al hijo y el hijo al padre, la roseta queda en cero y los ocho puestos
	—que son absolutos— se amontonan en el origen. Se ve como un ícono suelto y
	desalineado, que es exactamente lo que pasaba.
-->
<div class="relative aspect-square w-[13rem] max-w-full">
	<!-- El aro, que es el borde del sistema. -->
	<div class="absolute inset-[12%] rounded-full border border-dashed border-border-soft"></div>

	<!-- La estrella en el centro: desde acá se sale. -->
	<div class="absolute inset-0 flex items-center justify-center">
		<Icon name="sun" weight="duotone" size="1.4rem" class="text-accent-dim" />
	</div>

	{#each bearings as puesto (puesto.value)}
		{@const donde = posicion(puesto.angle)}
		{@const puerta = porRumbo.get(puesto.value)}
		{@const suelta = puerta !== undefined && !puerta.destination}
		<span
			title={puerta
				? puerta.destination
					? `${puesto.label} · ${puerta.destinationSystem}`
					: `${puesto.label} · sin conectar`
				: `${puesto.label} · libre`}
			style="left: {donde.left}; top: {donde.top}"
			class="absolute flex h-[1.7rem] w-[1.7rem] -translate-x-1/2 -translate-y-1/2 items-center
				justify-center border transition-[background-color,border-color]
				{puesto.value === highlight
				? 'border-accent-bright bg-accent text-on-accent shadow-glow'
				: suelta
					? 'border-warning bg-warning-wash text-warning'
					: puesto.taken
						? 'border-accent bg-surface-strong text-accent-bright'
						: 'border-dashed border-dead-dash bg-well text-text-muted'}"
		>
			{#if puesto.taken}
				<Icon name="arrow-circle-right" weight="fill" size="0.85rem" />
			{:else}
				<span class="font-display text-[0.55rem] font-bold tracking-label uppercase">
					{puesto.value}
				</span>
			{/if}
		</span>
	{/each}
</div>
