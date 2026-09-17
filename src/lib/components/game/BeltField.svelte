<!--
	El campo de rocas, mirado desde la nave.

	**Es la figura de la pantalla de Ubicación cuando estás en un cinturón.** La
	lista de abajo dice qué tiene cada piedra; esto dice **cómo es el campo**, que
	es otra pregunta y la que uno se hace al llegar: si vale la pena quedarse.

	Informa por su forma en tres cosas, y las tres se leen sin leer una cifra:

	- **Cuántas hay.** Ocho bultos o dos, y se nota entrando.
	- **Qué queda en cada una.** El tamaño sale de lo que le sobra: una roca
	  exprimida es un guijarro al lado de una entera, así que un campo trabajado se
	  ve trabajado.
	- **Cuánto conocés.** Lo identificado va encendido y con su silueta; lo que no,
	  es un contorno apagado. **Se ve el bulto y nada más**, que es exactamente lo
	  que el juego dice de una roca sin lectura, y es lo que le da trabajo al
	  escáner.

	Cada roca tiene **su propia silueta**, sacada de su número: un cinturón donde
	todas las piedras son el mismo círculo no se parece a un cinturón. No es azar
	de dibujo —el mismo número da siempre la misma piedra—, así que la roca que
	mirabas sigue estando donde estaba después de escanearla.

	Va en banda a todo el ancho, que es la excepción declarada de las figuras: un
	cinturón **es** una franja, y el ancho es la parte del campo que se ve. Igual
	que la banda del viaje.
-->
<script lang="ts">
	import type { Roca } from '$lib/tipos';

	interface Props {
		asteroids: readonly Roca[];
	}

	let { asteroids }: Props = $props();

	/** El radio de la roca más grande y el de la más exprimida. */
	const RADIO_MAX = 17;
	const RADIO_MIN = 5;
	/** Cuántos lados tiene una piedra. Pocos: de cerca son cantos, no una pelota. */
	const LADOS = 7;

	/**
	 * Un número estable entre 0 y 1, sacado del identificador de la roca.
	 *
	 * **Hace falta que sea estable y no al azar.** Con `Math.random()` las piedras
	 * saltarían de lugar en cada redibujado —y la pantalla se redibuja cada vez que
	 * se escanea una—, así que la roca que estabas mirando dejaría de ser la que
	 * estás mirando. Es el mismo criterio que el sello de un piloto: el dibujo sale
	 * del dato y por lo tanto es siempre el mismo.
	 */
	function dado(id: number, vuelta: number): number {
		const x = Math.sin(id * 12.9898 + vuelta * 78.233) * 43758.5453;
		return x - Math.floor(x);
	}

	/** La silueta de una roca: un polígono de lados desparejos. */
	function silueta(id: number, radio: number): string {
		return Array.from({ length: LADOS }, (_, i) => {
			// Cada canto se corre un poco hacia adentro o hacia afuera, y el ángulo
			// también: sin las dos cosas salen siete heptágonos iguales y girados.
			const angulo = ((i + dado(id, i) * 0.55) / LADOS) * Math.PI * 2;
			const largo = radio * (0.62 + dado(id, i + 20) * 0.38);
			return `${(Math.cos(angulo) * largo).toFixed(1)},${(Math.sin(angulo) * largo).toFixed(1)}`;
		}).join(' ');
	}

	/**
	 * Dónde cae cada roca y de qué tamaño.
	 *
	 * Repartidas a lo ancho por su posición en la lista —que ya viene ordenada, así
	 * que las grandes quedan agrupadas y el campo no se ve al azar— y corridas
	 * arriba y abajo por su propio número.
	 */
	let piedras = $derived(
		asteroids.map((roca, i) => {
			const paso = 100 / (asteroids.length + 1);
			// **`share` viene en por ciento**, no en fracción: es el mismo número que
			// come la barra de la lista. Sin dividirlo, el polígono salía siete veces
			// más grande que su lienzo y el recorte lo dejaba cuadrado.
			//
			// Y sin lectura no se sabe cuánto tiene, así que se dibuja entera: suponerla
			// vacía sería contar algo que el piloto no sabe.
			const cuanto = roca.identified && roca.share > 0 ? roca.share / 100 : 1;
			return {
				id: roca.id,
				x: paso * (i + 1) + (dado(roca.id, 1) - 0.5) * paso * 0.5,
				y: 28 + dado(roca.id, 2) * 44,
				radio: RADIO_MIN + (RADIO_MAX - RADIO_MIN) * Math.sqrt(cuanto),
				identificada: roca.identified,
				vieja: roca.stale
			};
		})
	);
</script>

<div class="relative h-[7.5rem] w-full overflow-hidden">
	<!--
		Sin rol ni texto: la lista de abajo dice el nombre, lo que queda y lo que
		vale de cada una, que es la regla de toda figura del juego.
	-->
	<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full">
		<!--
			La franja del cinturón, apenas insinuada y estirada con la caja: es fondo,
			y una línea de fondo puede deformarse. Las piedras no, y por eso van en su
			propio lienzo cuadrado más abajo.
		-->
		<line
			x1="0"
			y1="38"
			x2="100"
			y2="46"
			stroke="var(--color-accent-dim)"
			stroke-width="0.35"
			stroke-dasharray="3 2"
			opacity="0.5"
		/>
		<line
			x1="0"
			y1="66"
			x2="100"
			y2="58"
			stroke="var(--color-accent-dim)"
			stroke-width="0.35"
			stroke-dasharray="3 2"
			opacity="0.5"
		/>
	</svg>

	{#each piedras as piedra (piedra.id)}
		<!--
			Cada piedra en su propio SVG chico y cuadrado, plantado con `left`/`top`.
			Dibujarlas en el lienzo estirado de arriba las volvería elipses al
			achicarse la pantalla, que es justo lo que la regla de las figuras prohíbe.
		-->
		<span
			class="absolute -translate-x-1/2 -translate-y-1/2"
			style="left: {piedra.x}%; top: {piedra.y}%"
		>
			<svg viewBox="-20 -20 40 40" width="46" height="46" aria-hidden="true">
				<polygon
					points={silueta(piedra.id, piedra.radio)}
					fill={piedra.identificada ? 'var(--color-surface-strong)' : 'var(--color-dead)'}
					stroke={piedra.identificada ? 'var(--color-accent)' : 'var(--color-dead-dash)'}
					stroke-width={piedra.identificada ? 1.4 : 1}
					stroke-dasharray={piedra.vieja ? '2 1.5' : 'none'}
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	{/each}

	{#if piedras.length === 0}
		<div class="flex h-full w-full items-center justify-center">
			<span class="font-display text-1 tracking-label text-text-muted uppercase">
				Campo pelado
			</span>
		</div>
	{/if}
</div>
