<!--
	El sello de un nombre, dibujado.

	Es la cara de una corporación y, mientras no haya foto, la de un piloto. El
	plano —colores, celdas, formas— lo calcula `$lib/identicon.ts`; acá sólo se
	dibuja, que es la división que deja probar la simetría sin montar nada.

	**Dos familias, dos siluetas.** La corporación es un panal hexagonal con marco
	de seis lados; el piloto, un disco de casillas cuadradas. El componente no
	decide cuál: lo dice el plano, y agregar una familia nueva no lo toca más que
	para enseñarle una figura más.

	**SVG hecho a mano, sin librería**, como toda figura del juego: son polígonos y
	líneas, que es exactamente lo que SVG hace bien, y escala sin perder filo desde
	el ícono de veinte píxeles hasta la ficha grande. Ver CLAUDE.md §2.

	El orden de dibujo es la profundidad: el plato, los radios, el anillo interior,
	las celdas y por último el corazón, que es lo que el ojo busca primero.
-->
<script lang="ts">
	import { hexCorners } from '$lib/game/galaxy';
	import {
		INTERIOR,
		LIENZO,
		MARCO,
		MEDIO,
		sealFor,
		type Familia,
		type Sello
	} from '$lib/identicon';

	interface Props {
		/** De qué nombre sale el emblema. */
		name: string;
		/**
		 * Qué clase de cosa es.
		 *
		 * Decide la silueta entera, no un detalle: una corporación y un piloto no se
		 * confunden ni de reojo, y ése es el punto.
		 */
		family?: Familia;
		/**
		 * Cuánto mide, como medida de CSS.
		 *
		 * Cuadrado siempre: el alto sale del ancho, así que nunca se deforma.
		 */
		size?: string;
		/** Qué lee un lector de pantalla. Por omisión, el nombre. */
		title?: string;
		class?: string;
	}

	let {
		name,
		family = 'corporacion',
		size = '3rem',
		title = '',
		class: extra = ''
	}: Props = $props();

	let sello: Sello = $derived(sealFor(name, family));

	/** Los seis vértices de un hexágono, listos para un `polygon`. */
	function puntos(cx: number, cy: number, radio: number): string {
		return hexCorners({ x: cx, y: cy }, radio)
			.map((punto) => `${punto.x.toFixed(2)},${punto.y.toFixed(2)}`)
			.join(' ');
	}

	/** Un cuadrado centrado, que es la casilla del disco. */
	function cuadrado(cx: number, cy: number, medio: number): string {
		const izq = (cx - medio).toFixed(2);
		const der = (cx + medio).toFixed(2);
		const arr = (cy - medio).toFixed(2);
		const aba = (cy + medio).toFixed(2);
		return `${izq},${arr} ${der},${arr} ${der},${aba} ${izq},${aba}`;
	}

	/**
	 * Las escuadras de visor: dos trazos cortos sobre las aristas de cada vértice.
	 *
	 * Van **hacia adentro y no hacia afuera**. Afuera sobresalían del lienzo —el
	 * marco ya llega al borde— y el navegador las recortaba justo en los dos
	 * vértices horizontales, que es donde más se notaba.
	 *
	 * El disco no las lleva: un círculo no tiene esquinas, y lo que le corresponde
	 * son las marcas de su propio borde.
	 */
	let escuadras = $derived.by(() => {
		if (sello.ring !== 'hexagono') return [];
		const vertices = hexCorners({ x: MEDIO, y: MEDIO }, MARCO);
		const largo = 0.28;
		return vertices.flatMap((punto, i) =>
			[vertices[(i + 1) % 6], vertices[(i + 5) % 6]].map((vecino) => ({
				x1: punto.x,
				y1: punto.y,
				x2: punto.x + (vecino.x - punto.x) * largo,
				y2: punto.y + (vecino.y - punto.y) * largo
			}))
		);
	});

	/**
	 * Las marcas del disco: doce trazos sobre el borde, como una brújula.
	 *
	 * Es lo que hace que el círculo se lea como un instrumento y no como una ficha
	 * de juego de mesa. Una de cada tres va más larga y más clara, que es lo que le
	 * da los cuatro puntos cardinales sin dibujarlos.
	 */
	const MARCAS_DISCO = 12;
	let marcasDisco = $derived.by(() => {
		if (sello.ring !== 'disco') return [];
		return Array.from({ length: MARCAS_DISCO }, (_, i) => {
			const angulo = (Math.PI * 2 * i) / MARCAS_DISCO;
			const largo = i % 3 === 0 ? 7 : 3.5;
			return {
				x1: MEDIO + Math.cos(angulo) * MARCO,
				y1: MEDIO + Math.sin(angulo) * MARCO,
				x2: MEDIO + Math.cos(angulo) * (MARCO - largo),
				y2: MEDIO + Math.sin(angulo) * (MARCO - largo),
				fuerte: i % 3 === 0
			};
		});
	});

	/** Los radios, del centro a cada punta del anillo interior. */
	let radios = $derived(hexCorners({ x: MEDIO, y: MEDIO }, INTERIOR));
</script>

<svg
	viewBox="0 0 {LIENZO} {LIENZO}"
	width={size}
	height={size}
	class="block shrink-0 {extra}"
	role="img"
	aria-label={title || name}
>
	<title>{title || name}</title>

	<!--
		El plato: el contorno, relleno casi negro para que el emblema se despegue del
		panel que tenga atrás, y girado o no según el sello.
	-->
	<g transform="rotate({sello.tilt} {MEDIO} {MEDIO})">
		{#if sello.ring === 'hexagono'}
			<polygon
				points={puntos(MEDIO, MEDIO, MARCO)}
				fill="var(--color-background)"
				stroke={sello.edge}
				stroke-width="1.6"
			/>
		{:else}
			<circle
				cx={MEDIO}
				cy={MEDIO}
				r={MARCO}
				fill="var(--color-background)"
				stroke={sello.edge}
				stroke-width="1.6"
			/>
		{/if}

		{#each escuadras as marca, i (i)}
			<line
				x1={marca.x1}
				y1={marca.y1}
				x2={marca.x2}
				y2={marca.y2}
				stroke={sello.bright}
				stroke-width="2.6"
				stroke-linecap="square"
			/>
		{/each}

		{#each marcasDisco as marca, i (i)}
			<line
				x1={marca.x1}
				y1={marca.y1}
				x2={marca.x2}
				y2={marca.y2}
				stroke={marca.fuerte ? sello.bright : sello.edge}
				stroke-width={marca.fuerte ? 2.4 : 1.4}
			/>
		{/each}
	</g>

	{#if sello.spokes}
		{#each radios as punto, i (i)}
			<line
				x1={MEDIO}
				y1={MEDIO}
				x2={punto.x}
				y2={punto.y}
				stroke={sello.dim}
				stroke-width="1"
				opacity="0.7"
			/>
		{/each}
	{/if}

	{#if sello.innerRing}
		{#if sello.ring === 'hexagono'}
			<polygon
				points={puntos(MEDIO, MEDIO, INTERIOR)}
				fill="none"
				stroke={sello.dim}
				stroke-width="1"
				stroke-dasharray="4 3"
			/>
		{:else}
			<circle
				cx={MEDIO}
				cy={MEDIO}
				r={INTERIOR}
				fill="none"
				stroke={sello.dim}
				stroke-width="1"
				stroke-dasharray="4 3"
			/>
		{/if}
	{/if}

	<!--
		Las celdas. Cada una ya viene con su reflejo puesto desde el plano, así que
		acá no hay nada que espejar: se dibuja la lista y sale simétrico.
	-->
	{#each sello.cells as celda, i (i)}
		{@const figura =
			sello.cellShape === 'hexagono'
				? puntos(celda.cx, celda.cy, sello.cellSize * 0.86)
				: cuadrado(celda.cx, celda.cy, sello.cellSize * 0.88)}

		{#if celda.glyph === 'lleno'}
			<polygon points={figura} fill={sello.ink} />
		{:else if celda.glyph === 'hueco'}
			<polygon points={figura} fill="none" stroke={sello.ink} stroke-width="1.6" />
		{:else}
			<polygon points={figura} fill={sello.ink} />
			<circle cx={celda.cx} cy={celda.cy} r={sello.cellSize * 0.3} fill="var(--color-background)" />
		{/if}
	{/each}

	<!-- El corazón: la única celda que nunca falta, y la que más cambia de una a otra. -->
	{#if sello.core === 'hexagono'}
		<polygon points={puntos(MEDIO, MEDIO, sello.cellSize * 0.8)} fill={sello.bright} />
	{:else if sello.core === 'anillo'}
		<polygon
			points={puntos(MEDIO, MEDIO, sello.cellSize * 0.9)}
			fill="none"
			stroke={sello.bright}
			stroke-width="2.4"
		/>
		<circle cx={MEDIO} cy={MEDIO} r={sello.cellSize * 0.26} fill={sello.bright} />
	{:else if sello.core === 'rombo'}
		<polygon
			points="{MEDIO},{MEDIO - sello.cellSize} {MEDIO + sello.cellSize},{MEDIO} {MEDIO},{MEDIO +
				sello.cellSize} {MEDIO - sello.cellSize},{MEDIO}"
			fill={sello.bright}
		/>
	{:else if sello.core === 'triangulo'}
		<polygon
			points="{MEDIO},{MEDIO - sello.cellSize} {MEDIO + sello.cellSize * 0.87},{MEDIO +
				sello.cellSize * 0.5} {MEDIO - sello.cellSize * 0.87},{MEDIO + sello.cellSize * 0.5}"
			fill={sello.bright}
		/>
	{:else if sello.core === 'disco'}
		<circle cx={MEDIO} cy={MEDIO} r={sello.cellSize * 0.95} fill={sello.bright} />
		<circle cx={MEDIO} cy={MEDIO} r={sello.cellSize * 0.42} fill="var(--color-background)" />
	{:else if sello.core === 'cruz'}
		<rect
			x={MEDIO - sello.cellSize}
			y={MEDIO - sello.cellSize * 0.28}
			width={sello.cellSize * 2}
			height={sello.cellSize * 0.56}
			fill={sello.bright}
		/>
		<rect
			x={MEDIO - sello.cellSize * 0.28}
			y={MEDIO - sello.cellSize}
			width={sello.cellSize * 0.56}
			height={sello.cellSize * 2}
			fill={sello.bright}
		/>
	{:else}
		<rect
			x={MEDIO - sello.cellSize}
			y={MEDIO - sello.cellSize * 0.34}
			width={sello.cellSize * 2}
			height={sello.cellSize * 0.68}
			fill={sello.bright}
		/>
	{/if}
</svg>
