<!--
	Los cuatro presupuestos de la nave, en una banda.

	Va **arriba de las ranuras y siempre a la vista**, y ahí está el micro-juego que
	hace buena a esta pantalla: los presupuestos están apretados a propósito, así
	que la barra crece **mientras mirás la ranura que estás llenando** y un cinco
	por ciento más de grilla es lo que hace entrar el módulo mejor. Metido en una
	tabla al costado, ese apriete no se siente.

	Los nombres son los de EVE —grilla, CPU, capacitor, calibración— porque el
	público que más rápido va a entender esta pantalla es el que ya jugó ese juego,
	y hacerlo tropezar con sinónimos no lo hace más nuestro, lo hace más lento.

	La calibración se dibuja apagada mientras no haya refuerzos que montar: un
	presupuesto que nada puede gastar todavía no compite por la atención, pero se
	deja a la vista porque es el único que **no se recupera**.
-->
<script lang="ts">
	interface Barra {
		readonly label: string;
		/** Lo que se lee a la derecha: `41 / 50 MW`, `estable`. */
		readonly value: string;
		/** De cero a cien. */
		readonly percent: number;
		/** Un color CSS del sistema, no una clase de Tailwind. */
		readonly color: string;
		readonly over?: boolean;
	}

	interface Props {
		bars: readonly Barra[];
	}

	let { bars }: Props = $props();
</script>

<div
	class="grid w-full [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))] gap-x-5 gap-y-[0.55rem]"
>
	{#each bars as bar (bar.label)}
		<div class="flex min-w-0 flex-col gap-[0.25rem]">
			<div class="flex items-baseline justify-between gap-2">
				<span
					class="font-display text-[0.6rem] font-semibold tracking-label whitespace-nowrap
						text-text-muted uppercase"
				>
					{bar.label}
				</span>
				<span
					class="font-mono text-[0.68rem] whitespace-nowrap"
					style="color: {bar.over ? 'var(--color-danger)' : bar.color}"
				>
					{bar.value}
				</span>
			</div>
			<!--
				El riel siempre entero y la barra encima: sin el riel, una barra corta y
				una barra larga se ven como dos cosas distintas en vez de como dos
				estados de la misma.
			-->
			<div class="h-[3px] w-full bg-dead-rail">
				<div
					class="h-[3px] transition-[width]"
					style="width: {Math.min(100, Math.max(0, bar.percent))}%;
						background: {bar.over ? 'var(--color-danger)' : bar.color}"
				></div>
			</div>
		</div>
	{/each}
</div>
