<!--
	El hexágono de habilidades: la forma del piloto, y la de su próximo paso.

	Es **la figura propia de la pantalla de Piloto**, como el anillo lo es de Nave
	y el árbol de Sistema. Las tres responden igual: dicen algo por su forma antes
	de que se lea una palabra. Acá la silueta del polígono *es* el piloto —una
	punta hacia Extracción es un minero, un hexágono parejo es alguien que todavía
	no se decidió—, y eso no se puede leer en una lista de números.

	Seis ramas, seis vértices. No es una casualidad aprovechada: el árbol de
	habilidades tiene seis familias y por eso la figura cierra.

	**Van dos figuras, no una**, y ahí está lo que la hace distinta de un gráfico
	de radar cualquiera. La naranja llena es lo ya invertido: quién es el piloto
	hoy. La cian punteada es lo que tiene en los pozos sin gastar: en qué se puede
	convertir mañana. Que se dibujen encima una de la otra es el punto —la
	distancia entre las dos líneas **es** la decisión pendiente, y en una tabla de
	números esa distancia hay que calcularla a mano.

	Las dos se miden contra el mismo techo. Con una escala por figura, un pozo de
	cuarenta se dibujaría tan grande como una rama de cuatro mil y la comparación
	mentiría.

	Se dibuja con líneas de un píxel, como el árbol del sistema, y no con un
	gráfico de librería: el lenguaje del juego son trazos finos, y una librería
	traería sus propias decisiones visuales.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { RamaXp } from '$lib/tipos';

	/**
	 * Qué capas se dibujan.
	 *
	 * Las dos juntas son la vista completa, y es la que va cuando hay lugar para
	 * mirarla: la distancia entre las líneas **es** la decisión pendiente. Pero en
	 * la credencial, chica y al lado de otros datos, dos figuras encimadas piden
	 * una leyenda y un segundo de lectura para contestar algo que ahí no se
	 * preguntó: ahí alcanza con quién es el piloto hoy.
	 */
	export type CapasHexagono = 'invested' | 'pool' | 'both';

	interface Props {
		families: readonly RamaXp[];
		layers?: CapasHexagono;
	}

	let { families, layers = 'both' }: Props = $props();

	let muestraInvertido = $derived(layers !== 'pool');
	let muestraPozo = $derived(layers !== 'invested');

	/** Radio del hexágono, en porcentaje del lado del cuadro. */
	const RADIO = 32;
	/** Dónde caen los rótulos: afuera del polígono, sin tocarlo. */
	const RADIO_ROTULO = 44;
	/**
	 * El piso de un vértice. En cero el polígono colapsa en un punto y deja de
	 * leerse como figura, así que lo que no tiene nada igual se asoma del centro.
	 */
	const PISO = 0.06;

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

	/** El polígono que dibuja una de las dos métricas de cada rama. */
	function figura(valor: (rama: RamaXp) => number): string {
		return families
			.map((rama, i) => punto(i, families.length, Math.max(PISO, valor(rama) / 100)))
			.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`)
			.join(' ');
	}

	let vertices = $derived(families.map((_, i) => punto(i, families.length, 1)));

	/** Lo ya invertido: la forma que el piloto tiene hoy. */
	let forma = $derived(figura((rama) => rama.share));
	/** Lo que espera en los pozos: la forma que podría tener. */
	let potencial = $derived(figura((rama) => rama.poolShare));

	/**
	 * Sin nada guardado no se dibuja la segunda figura: un hexágono mínimo pegado
	 * al centro no informa de nada y ensucia la lectura del primero.
	 */
	let hayPozo = $derived(families.some((rama) => rama.pool > 0));

	/** Dónde va el rótulo de cada rama, en porcentaje del cuadro. */
	let rotulos = $derived(
		families.map((rama, i) => {
			const { x, y } = punto(i, families.length, 1, RADIO_ROTULO);
			return { rama, left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%` };
		})
	);
</script>

<div class="flex w-full flex-col items-center gap-2">
	<!--
		El alto no se fija: sale de `aspect-ratio`, que es lo único que mantiene
		cuadrado el dibujo cuando la columna se angosta. Con alto fijo, un hexágono
		dentro de un rectángulo se vuelve otra cosa.
	-->
	<div class="relative aspect-square w-[min(20rem,100%)]">
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

			<!--
				El pozo va primero, debajo: es la promesa, y lo que el piloto ya es tiene
				que quedar por encima. Punteado y sin relleno para que se lea como algo
				que todavía no pasó.
			-->
			{#if hayPozo && muestraPozo}
				<polygon
					points={potencial}
					fill="rgb(93 214 255 / 0.08)"
					stroke="var(--color-data)"
					stroke-width="0.55"
					stroke-dasharray="2 1.5"
					stroke-linejoin="round"
				/>
			{/if}

			<!-- La forma del piloto: lo invertido, sólido y encendido. -->
			{#if muestraInvertido}
				<polygon
					points={forma}
					fill="rgb(255 122 26 / 0.16)"
					stroke="var(--color-accent)"
					stroke-width="0.7"
					stroke-linejoin="round"
					style="filter: drop-shadow(0 0 5px rgb(255 122 26 / 0.35))"
				/>
			{/if}

			<!--
				Un nodo por vértice: marca dónde llega cada rama.

				Los trazos y los nodos son **finos a propósito**: la figura se dibuja
				sobre la grilla del hexágono, y engrosándolos tapan justamente lo que les
				da escala. Un instrumento de cabina se lee por dónde cae la línea, no por
				lo gruesa que es.
			-->
			{#if muestraInvertido}
				{#each families as rama, i (rama.family)}
					{@const p = punto(i, families.length, Math.max(PISO, rama.share / 100))}
					<circle
						cx={p.x.toFixed(2)}
						cy={p.y.toFixed(2)}
						r="0.9"
						fill={rama.xp > 0 ? 'var(--color-accent-bright)' : 'var(--color-text-muted)'}
					/>
				{/each}
			{/if}

			<!-- Y uno hueco donde llegaría si se gastara el pozo. -->
			{#each families as rama, i (rama.family)}
				{#if rama.pool > 0 && muestraPozo}
					{@const p = punto(i, families.length, Math.max(PISO, rama.poolShare / 100))}
					<circle
						cx={p.x.toFixed(2)}
						cy={p.y.toFixed(2)}
						r="1"
						fill="var(--color-surface)"
						stroke="var(--color-data)"
						stroke-width="0.5"
					/>
				{/if}
			{/each}
		</svg>

		<!--
			Los rótulos van en HTML y no en el SVG: a esta escala el texto de un SVG
			queda de un píxel y medio, y además así usan la misma tipografía y el mismo
			interletrado que el resto del HUD.
		-->
		{#each rotulos as { rama, left, top } (rama.family)}
			<!-- Encendida según la capa que se está mirando, no siempre por lo invertido. -->
			{@const encendida = muestraInvertido ? rama.xp > 0 : rama.pool > 0}
			<span
				style="left: {left}; top: {top}"
				class="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col
					items-center gap-[0.1rem]"
			>
				<Icon
					name={rama.icon}
					weight={encendida ? 'fill' : 'thin'}
					size="0.7rem"
					class={encendida ? 'text-accent' : 'text-text-muted'}
				/>
				{#if muestraInvertido}
					<span
						class="font-mono text-[0.6rem] leading-none
							{rama.xp > 0 ? 'text-accent-bright' : 'text-text-muted'}"
					>
						{rama.xp}
					</span>
				{/if}
				<!-- El pozo sólo aparece si hay algo: un "+0" en seis vértices es ruido. -->
				{#if rama.pool > 0 && muestraPozo}
					<span class="font-mono text-[0.58rem] leading-none text-data">+{rama.pool}</span>
				{/if}
			</span>
		{/each}
	</div>

	<!--
		La leyenda. Dos figuras encimadas necesitan que se diga cuál es cuál una vez;
		sin esto, el punteado cian es un adorno.

		**Se muestra sólo la de la capa dibujada, pero el renglón queda siempre.**
		Sacarla entera al quedar una sola capa hacía que el dibujo saltara al
		cambiar de vista, y con el interruptor al lado la leyenda sigue teniendo qué
		decir: cuál de las dos estás mirando.
	-->
	<div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
		{#if muestraInvertido}
			<span class="flex items-center gap-[0.4rem]">
				<span class="h-0 w-[0.9rem] border-t-2 border-accent"></span>
				<span class="font-display text-[0.6rem] tracking-label text-text-muted uppercase">
					Invertido
				</span>
			</span>
		{/if}
		{#if muestraPozo}
			<span class="flex items-center gap-[0.4rem]">
				<span class="h-0 w-[0.9rem] border-t-2 border-dashed border-data"></span>
				<span class="font-display text-[0.6rem] tracking-label text-text-muted uppercase">
					En el pozo
				</span>
			</span>
		{/if}
	</div>
</div>
