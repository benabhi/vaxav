<!--
	El hexágono de habilidades: la forma del piloto.

	Es **la figura propia de la pantalla de Piloto**, como el anillo lo es de Nave
	y el árbol de Sistema. Las tres responden igual: dicen algo por su forma antes
	de que se lea una palabra. Acá la silueta del polígono *es* el piloto —una
	punta hacia Extracción es un minero, un hexágono parejo es alguien que todavía
	no se decidió—, y eso no se puede leer en una lista de números.

	Seis ramas, seis vértices. No es una casualidad aprovechada: el árbol de
	habilidades tiene seis familias y por eso la figura cierra.

	Se dibuja con líneas de un píxel, como el árbol del sistema, y no con un
	gráfico de librería: el lenguaje del juego son trazos finos, y una librería
	traería sus propias decisiones visuales.

	**Con el pozo por familia** (docs/systems/SKILLS.md, decidido y sin
	implementar) esta misma figura pasa a mostrar lo que hay para gastar en cada
	rama. Mismo dibujo, otro significado.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { RamaXp } from '$lib/tipos';

	interface Props {
		families: readonly RamaXp[];
	}

	let { families }: Props = $props();

	/** Radio del hexágono, en porcentaje del lado del cuadro. */
	const RADIO = 34;
	/** Dónde caen los rótulos: afuera del polígono, sin tocarlo. */
	const RADIO_ROTULO = 46;

	/** El punto de un vértice, a la fracción `f` del radio. */
	function punto(indice: number, total: number, f: number, radio = RADIO) {
		// Menos noventa para que el primer vértice caiga arriba: un polígono que
		// arranca de costado se lee torcido, igual que el anillo de la nave.
		const angulo = ((-90 + (indice * 360) / total) * Math.PI) / 180;
		return {
			x: 50 + radio * f * Math.cos(angulo),
			y: 50 + radio * f * Math.sin(angulo)
		};
	}

	/** Los puntos de un polígono completo, listos para el atributo `points`. */
	function anillo(f: number): string {
		return families
			.map((_, i) => punto(i, families.length, f))
			.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
			.join(' ');
	}

	let vertices = $derived(families.map((_, i) => punto(i, families.length, 1)));

	/**
	 * El polígono del piloto. Cada vértice sale a la fracción que esa rama pesa
	 * sobre la más cargada, con un piso: en cero el polígono colapsa en un punto y
	 * deja de leerse como figura.
	 */
	let forma = $derived(
		families
			.map((rama, i) => punto(i, families.length, Math.max(0.06, rama.share / 100)))
			.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
			.join(' ')
	);

	/** Dónde va el rótulo de cada rama, en porcentaje del cuadro. */
	let rotulos = $derived(
		families.map((rama, i) => {
			const { x, y } = punto(i, families.length, 1, RADIO_ROTULO);
			return { rama, left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%` };
		})
	);
</script>

<!--
	El alto no se fija: sale de `aspect-ratio`, que es lo único que mantiene
	cuadrado el dibujo cuando la columna se angosta. Con alto fijo, un hexágono
	dentro de un rectángulo se vuelve otra cosa.
-->
<div class="relative mx-auto aspect-square w-[min(20rem,100%)]">
	<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
		<!-- La grilla: cuatro anillos que dan la escala sin pedir un eje numerado. -->
		{#each [0.25, 0.5, 0.75, 1] as fraccion (fraccion)}
			<polygon
				points={anillo(fraccion)}
				fill="none"
				stroke="var(--color-border-soft)"
				stroke-width="0.4"
			/>
		{/each}

		<!-- Los radios, hasta cada vértice. -->
		{#each vertices as vertice, i (i)}
			<line
				x1="50"
				y1="50"
				x2={vertice.x.toFixed(2)}
				y2={vertice.y.toFixed(2)}
				stroke="var(--color-border-soft)"
				stroke-width="0.4"
			/>
		{/each}

		<!-- La forma del piloto. -->
		<polygon
			points={forma}
			fill="rgb(255 122 26 / 0.16)"
			stroke="var(--color-accent)"
			stroke-width="1"
			stroke-linejoin="round"
			style="filter: drop-shadow(0 0 8px rgb(255 122 26 / 0.45))"
		/>

		<!-- Un nodo por vértice: marca dónde llega cada rama. -->
		{#each families as rama, i (rama.family)}
			{@const p = punto(i, families.length, Math.max(0.06, rama.share / 100))}
			<circle
				cx={p.x.toFixed(2)}
				cy={p.y.toFixed(2)}
				r="1.4"
				fill={rama.xp > 0 ? 'var(--color-accent-bright)' : 'var(--color-text-muted)'}
			/>
		{/each}
	</svg>

	<!--
		Los rótulos van en HTML y no en el SVG: a esta escala el texto de un SVG
		queda de un píxel y medio, y además así usan la misma tipografía y el mismo
		interletrado que el resto del HUD.
	-->
	{#each rotulos as { rama, left, top } (rama.family)}
		<span
			style="left: {left}; top: {top}"
			class="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col
				items-center gap-[0.1rem]"
		>
			<Icon
				name={rama.icon}
				weight={rama.xp > 0 ? 'fill' : 'thin'}
				size="0.7rem"
				class={rama.xp > 0 ? 'text-accent' : 'text-text-muted'}
			/>
			<span
				class="font-mono text-[0.6rem] leading-none {rama.xp > 0 ? 'text-data' : 'text-text-muted'}"
			>
				{rama.xp}
			</span>
		</span>
	{/each}
</div>
