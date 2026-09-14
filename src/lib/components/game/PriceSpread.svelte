<!--
	La horquilla: la figura propia de la pantalla del mercado.

	Contesta de un vistazo la única pregunta que importa parado en un mostrador:
	**cuánto se queda la estación**. En el centro está el precio de referencia del
	ítem; a la izquierda lo que la estación paga, a la derecha lo que cobra. La
	distancia entre las dos puntas *es* su ganancia, y esa distancia se ve antes de
	leer un número.

	**Informa por su forma**, que es lo que la separa de un adorno: una horquilla
	ancha es un mostrador caro, una angosta es uno donde conviene operar. Un piloto
	con Regateo al 5 parado en la estación de su rubro ve una figura visiblemente
	más cerrada que el mismo piloto recién salido del astillero, sin comparar
	cifras.

	Y dice **por qué** es así: debajo va el desglose, que es lo que convierte la
	figura en algo que enseña. "13 %" no se aprende; "20 de base, −3 por casa
	comercial, −4 por Regateo" sí.

	Se dibuja a mano en SVG de trazo fino, como el árbol del sistema y el hexágono
	del piloto: nada de librerías de gráficos, que traen su propio aspecto.
-->
<script lang="ts">
	import Label from '../typography/Label.svelte';
	import type { Horquilla } from '$lib/tipos';

	interface Props {
		spread: Horquilla;
		/** Sobre qué se está aplicando: «Mineral», «Módulos». */
		subject: string;
		/** El piso, para dibujar hasta dónde se puede llegar a angostar. */
		floorPercent: number;
	}

	let { spread, subject, floorPercent }: Props = $props();

	/** El lienzo. El alto sale del `viewBox` y nunca de un valor fijo. */
	const ANCHO = 620;
	const ALTO = 132;
	/** Dónde cae la referencia y cuánto mide un brazo a fondo. */
	const CENTRO = ANCHO / 2;
	const BRAZO = 232;
	const EJE = 78;

	/**
	 * A cuántos puntos de horquilla corresponde el brazo entero.
	 *
	 * Se toma el margen base y no el del momento: con una escala que se ajustara
	 * al valor actual, **la figura se vería igual siempre** —las puntas siempre en
	 * el borde— y dejaría de decir nada. Contra una escala fija, angostar la
	 * horquilla se ve como lo que es: las puntas acercándose al centro.
	 */
	let escala = $derived(Math.max(spread.base, spread.percent));

	let brazo = $derived(escala > 0 ? (spread.percent / escala) * BRAZO : 0);
	let piso = $derived(escala > 0 ? (floorPercent / escala) * BRAZO : 0);

	/** Las marcas de la escala, una cada cinco puntos. */
	let marcas = $derived.by(() => {
		const paso = 5;
		const puntos: number[] = [];
		for (let punto = paso; punto <= escala; punto += paso) puntos.push(punto);
		return puntos.map((punto) => ({ punto, ancho: (punto / escala) * BRAZO }));
	});
</script>

<div class="flex w-full flex-col items-start gap-3">
	<div class="flex w-full flex-wrap items-baseline gap-2">
		<Label>La horquilla</Label>
		<span class="font-display text-[0.7rem] tracking-label text-accent-dim uppercase">
			· {subject}
		</span>
		<div class="grow"></div>
		<span class="font-mono text-[0.82rem] text-data">{spread.percent} %</span>
	</div>

	<svg
		viewBox="0 0 {ANCHO} {ALTO}"
		class="w-full"
		style="aspect-ratio: {ANCHO} / {ALTO}"
		role="img"
		aria-label="La estación se queda con el {spread.percent} por ciento"
	>
		<!-- El riel de fondo: hasta dónde llegaría la horquilla sin ninguna mejora. -->
		<line
			x1={CENTRO - BRAZO}
			y1={EJE}
			x2={CENTRO + BRAZO}
			y2={EJE}
			stroke="var(--color-dead-rail)"
			stroke-width="1"
		/>

		{#each marcas as marca (marca.punto)}
			{#each [-1, 1] as lado (lado)}
				<line
					x1={CENTRO + lado * marca.ancho}
					y1={EJE - 4}
					x2={CENTRO + lado * marca.ancho}
					y2={EJE + 4}
					stroke="var(--color-dead-dash)"
					stroke-width="1"
				/>
			{/each}
		{/each}

		<!--
			Lo que se lleva la estación, de cada lado. Es la única superficie llena de
			la figura: lo que se mira primero tiene que ser lo que se pierde.
		-->
		<rect
			x={CENTRO - brazo}
			y={EJE - 13}
			width={brazo}
			height="26"
			fill="var(--color-surface-strong)"
		/>
		<rect x={CENTRO} y={EJE - 13} width={brazo} height="26" fill="var(--color-surface-strong)" />

		<!-- El tramo que ya no se puede angostar: la parte que siempre se queda ella. -->
		<rect
			x={CENTRO - piso}
			y={EJE - 13}
			width={piso * 2}
			height="26"
			fill="var(--color-dead-edge)"
		/>

		<!-- Los dos brazos, del centro hacia afuera. -->
		<line
			x1={CENTRO - brazo}
			y1={EJE}
			x2={CENTRO + brazo}
			y2={EJE}
			stroke="var(--color-accent)"
			stroke-width="1"
		/>

		<!-- Las puntas. Esquinas rectas: es un instrumento, no un gráfico. -->
		{#each [-1, 1] as lado (lado)}
			<line
				x1={CENTRO + lado * brazo}
				y1={EJE - 18}
				x2={CENTRO + lado * brazo}
				y2={EJE + 18}
				stroke="var(--color-accent-bright)"
				stroke-width="2"
			/>
		{/each}

		<!-- La referencia: el precio del que parte todo. -->
		<line
			x1={CENTRO}
			y1={EJE - 26}
			x2={CENTRO}
			y2={EJE + 26}
			stroke="var(--color-data)"
			stroke-width="1"
			stroke-dasharray="3 3"
		/>

		<text
			x={CENTRO}
			y={EJE - 34}
			text-anchor="middle"
			class="fill-[var(--color-data)] font-display text-[13px] tracking-[0.12em] uppercase"
		>
			Referencia
		</text>

		<text
			x={CENTRO - brazo}
			y={EJE + 38}
			text-anchor="middle"
			class="fill-[var(--color-accent-bright)] font-display text-[13px] tracking-[0.12em] uppercase"
		>
			Te pagan
		</text>
		<text
			x={CENTRO - brazo}
			y={EJE + 54}
			text-anchor="middle"
			class="fill-[var(--color-text-muted)] font-mono text-[12px]"
		>
			−{spread.percent} %
		</text>

		<text
			x={CENTRO + brazo}
			y={EJE + 38}
			text-anchor="middle"
			class="fill-[var(--color-accent-bright)] font-display text-[13px] tracking-[0.12em] uppercase"
		>
			Te cobran
		</text>
		<text
			x={CENTRO + brazo}
			y={EJE + 54}
			text-anchor="middle"
			class="fill-[var(--color-text-muted)] font-mono text-[12px]"
		>
			+{spread.percent} %
		</text>
	</svg>

	<!--
		El desglose. Es lo que convierte la figura en algo que enseña: sin esto, el
		jugador ve que la horquilla se movió pero no sabe qué la movió, y por lo
		tanto no sabe qué hacer para moverla más.
	-->
	<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem]">
		<span class="text-text-muted">{spread.base} base</span>
		{#if spread.corporationEdge > 0}
			<span class="text-data">−{spread.corporationEdge} por el rubro</span>
		{/if}
		{#if spread.haggling > 0}
			<span class="text-data">−{spread.haggling} por Regateo</span>
		{:else}
			<span class="text-text-muted">Regateo no entrenado</span>
		{/if}
		<div class="grow"></div>
		{#if spread.atFloor}
			<span class="text-accent-bright">Al piso del {floorPercent} %</span>
		{/if}
	</div>
</div>
