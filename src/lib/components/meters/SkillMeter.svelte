<!--
	El medidor de una habilidad: cinco bloques, uno por nivel.

	Reemplaza a las estrellas, que eran prestadas de otro género. Cinco rectángulos
	con la punta cortada son del mismo idioma que las solapas del alta y la barra
	de carga de una orden, y además **dicen más**: el bloque del nivel en curso se
	llena en proporción a lo que se lleva avanzado, así que el medidor cuenta el
	nivel y el progreso en la misma figura, cosa que cinco estrellas no pueden.

	La punta cortada es lo que le da identidad propia: la barra de acciones es
	recta y ésta va en diagonal, de modo que las dos se distinguen de lejos aunque
	compartan el lenguaje.
-->
<script lang="ts">
	interface Props {
		/** El nivel alcanzado, de 0 a `total`. */
		level: number;
		/** Cuánto lleva del nivel siguiente, de 0 a 100. */
		progress?: number;
		total?: number;
		/** En cian: lo que se acaba de ganar o lo que se puede comprar. */
		highlight?: boolean;
		class?: string;
	}

	let { level, progress = 0, total = 5, highlight = false, class: extra = '' }: Props = $props();
</script>

<div class="flex items-center gap-[0.2rem] {extra}">
	{#each { length: total }, index (index)}
		{@const lleno = level > index}
		{@const enCurso = level === index && progress > 0}
		<span
			class="meter-block relative h-[0.85rem] grow overflow-hidden border
				{lleno
				? highlight
					? 'border-data bg-data'
					: 'border-accent bg-accent'
				: 'border-border-soft bg-surface-strong'}"
		>
			<!--
				El bloque en curso se llena por dentro: es el mismo bloque, a medio
				cargar. Un sexto bloque para el progreso mentiría sobre cuántos niveles
				hay.
			-->
			{#if enCurso}
				<span
					class="absolute inset-y-0 left-0 {highlight ? 'bg-data' : 'bg-accent'} opacity-40"
					style="width: {Math.min(100, Math.max(0, progress))}%"
				></span>
			{/if}
		</span>
	{/each}
</div>

<style>
	/*
	 * La punta cortada. Va del mismo lado en todos los bloques, así que la fila
	 * entera se lee como una flecha que avanza hacia la derecha.
	 */
	.meter-block {
		clip-path: polygon(0 0, 100% 0, calc(100% - 0.25rem) 100%, 0 100%);
	}
</style>
