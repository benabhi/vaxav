<!--
	El vecindario de un cuerpo: alrededor de qué da vueltas, y qué le da vueltas.

	**Es la figura de la pantalla de Ubicación cuando estás en un planeta, una luna
	o una estrella.** Eran los tres que no tenían nada: una puerta tiene su aro, un
	cinturón su campo y una estación su mosaico, pero un planeta no tiene verbos.
	Lo único que tiene para decir de sí mismo es **el lugar que ocupa**, y dicho con
	palabras son tres renglones iguales a los de cualquier otro cuerpo —«orbita a
	Ánfora, a 842 ud»—. Dibujado, un planeta interior con tres lunas no se parece
	en nada a una luna pelada del borde.

	Informa por su forma en cuatro cosas:

	- **De quién colgás.** El centro es tu padre: la estrella si sos un planeta, el
	  planeta si sos una luna.
	- **Qué tan afuera estás.** Tu anillo, entre todos los que hay. El segundo de
	  siete y el último de dos son dos dibujos distintos.
	- **Quiénes son tus vecinos**, y de qué clase: cada uno con el ícono de lo que
	  es, así se ve de una que ese sistema tiene tres puertas y un cinturón.
	- **Qué te cuelga a vos.** Las lunas y las estaciones que te dan vueltas, en su
	  propio anillo chiquito alrededor tuyo.

	**Una sola figura para los tres casos**, porque son el mismo mirado desde otra
	altura. Y parado en una estrella el centro sos vos: no hay caso especial que
	escribir, sale de que una estrella no tiene padre.

	**Y gira.** No es adorno: los de afuera tardan más, con el mismo exponente que
	la tercera ley de Kepler, así que la velocidad **también dice** qué tan lejos
	está cada uno. Un sistema quieto es un diagrama; uno que se mueve despacio es
	un lugar. Despacio en serio —la vuelta más corta ronda el minuto— porque esta
	pantalla queda abierta mientras se espera, y algo que se mueve rápido al lado
	de un texto es algo que no deja leer.

	Va todo en cajas y no adentro del lienzo porque los íconos son HTML: el que da
	la vuelta es un envoltorio del tamaño de la caja, y el ícono, colgado adentro,
	viaja con él. Gira al revés sobre sí mismo para no salir dado vuelta.

	El alto sale de `aspect-ratio` y nunca de un valor fijo: acá todo son círculos,
	y un círculo dentro de un rectángulo se vuelve una elipse.

	**El ancho sí es suyo y no del padre**, y no es un capricho: adentro no hay nada
	en el flujo —el lienzo y los cuerpos van absolutos—, así que un `w-full` en una
	columna que mide lo que miden sus hijos define el ancho en círculo y la figura
	sale de cero. Es la misma trampa que dejaba a las ventanas grandes del tamaño
	de una ranura. Mide lo suyo y se achica con `max-w-full`.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { CuerpoVecino, Orbita } from '$lib/tipos';

	interface Props {
		orbit: Orbita;
	}

	let { orbit }: Props = $props();

	/** El anillo más pegado al centro y el más lejano. */
	const RADIO_CERCA = 34;
	const RADIO_LEJOS = 84;
	/**
	 * Y el anillo chiquito de lo que te cuelga, **en rem y no en unidades del
	 * lienzo**: cuelga de una caja de HTML y no del SVG, así que crece con la
	 * escala del HUD como el resto de la interfaz.
	 */
	const RADIO_SATELITE = 1.1;

	/**
	 * El ángulo de cada vecino, repartido con el paso áureo.
	 *
	 * **No es decorativo.** Con un reparto parejo —trescientos sesenta sobre la
	 * cantidad— los cuerpos de anillos vecinos caen alineados en el mismo radio y
	 * el dibujo se lee como una regla graduada en vez de como un sistema. El paso
	 * áureo es el reparto que nunca vuelve a repetir un ángulo, así que los puntos
	 * quedan desparramados sin que dos se tapen.
	 */
	const PASO_AUREO = 137.508;

	/** Cuánto tarda en dar la vuelta el más pegado al centro, en segundos. */
	const VUELTA_ADENTRO = 70;
	/**
	 * Y cuánto más tarda el de afuera, por cada vez que se aleja.
	 *
	 * Es el exponente de la tercera ley de Kepler: el período al cuadrado va como
	 * el radio al cubo, o sea que el período va como el radio a la una y media. No
	 * está para que el juego sea una simulación —no lo es— sino porque la cuenta
	 * real reparte las velocidades mejor que cualquier número elegido a ojo: de
	 * cerca se nota el movimiento y de lejos apenas se arrastra, que es justo lo
	 * que uno espera ver.
	 */
	const EXPONENTE_KEPLER = 1.5;

	function punto(grados: number, radio: number): { x: number; y: number } {
		const radianes = ((grados - 90) * Math.PI) / 180;
		return { x: 100 + Math.cos(radianes) * radio, y: 100 + Math.sin(radianes) * radio };
	}

	/** Dónde cae cada cuerpo del anillo, en qué órbita y a qué velocidad. */
	let vecinos = $derived(
		orbit.ring.map((cuerpo, i) => {
			// Con un solo vecino no hay reparto que hacer: va en el anillo de adentro,
			// que si no la cuenta divide por cero y el punto se va del lienzo.
			const paso =
				orbit.ring.length > 1 ? (RADIO_LEJOS - RADIO_CERCA) / (orbit.ring.length - 1) : 0;
			const radio = RADIO_CERCA + paso * i;
			return {
				cuerpo,
				radio,
				donde: punto(i * PASO_AUREO, radio),
				vuelta: VUELTA_ADENTRO * (radio / RADIO_CERCA) ** EXPONENTE_KEPLER
			};
		})
	);

	/**
	 * Dónde cae cada satélite, alrededor tuyo.
	 *
	 * **Viajan con vos y no dan su propia vuelta.** Anidar una rotación adentro de
	 * otra se dibuja bien pero se lee mal: dos giros encimados a escalas muy
	 * distintas convierten el rincón en un remolino, y lo que hay que ver ahí es
	 * cuántos te cuelgan, no a qué velocidad.
	 */
	let satelites = $derived(
		orbit.satellites.map((cuerpo, i) => {
			const angulo = ((i * 360) / Math.max(1, orbit.satellites.length) - 90) * (Math.PI / 180);
			return {
				cuerpo,
				dx: Math.cos(angulo) * RADIO_SATELITE,
				dy: Math.sin(angulo) * RADIO_SATELITE
			};
		})
	);

	/** Dónde plantar algo, en porcentaje de la caja. */
	function sitio(p: { x: number; y: number }): string {
		return `left: ${p.x / 2}%; top: ${p.y / 2}%`;
	}

	/** Cómo se nombra a alguien del vecindario al señalarlo. */
	function nombre(cuerpo: CuerpoVecino): string {
		return cuerpo.here ? `${cuerpo.name} · acá estás` : cuerpo.name;
	}
</script>

<div class="relative aspect-square w-[19rem] max-w-full">
	<!--
		Las órbitas y el centro, quietos: son el plano sobre el que pasa todo lo
		demás. Sin rol ni texto, porque la lista de al lado dice lo mismo con
		palabras, que es la regla de toda figura del juego.
	-->
	<svg viewBox="0 0 200 200" class="absolute inset-0 h-full w-full" aria-hidden="true">
		{#each vecinos as vecino (vecino.cuerpo.name)}
			<circle
				cx="100"
				cy="100"
				r={vecino.radio}
				fill="none"
				stroke={vecino.cuerpo.here ? 'var(--color-accent)' : 'var(--color-accent-dim)'}
				stroke-width={vecino.cuerpo.here ? 0.9 : 0.6}
				stroke-dasharray="3 3"
				opacity={vecino.cuerpo.here ? 0.85 : 0.35}
			/>
		{/each}

		<circle cx="100" cy="100" r="11" fill="var(--color-surface-strong)" />
		<circle
			cx="100"
			cy="100"
			r="11"
			fill="none"
			stroke={orbit.centerIsHere ? 'var(--color-accent-bright)' : 'var(--color-accent)'}
			stroke-width="1.2"
		/>
	</svg>

	<!-- Lo que está en el centro. -->
	<span
		class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center
			{orbit.centerIsHere ? 'text-accent-bright' : 'text-accent'}"
		style="left: 50%; top: 50%"
		title={orbit.center}
	>
		<Icon name={orbit.centerIcon} weight="duotone" size="1.05rem" />
	</span>

	{#each vecinos as vecino (vecino.cuerpo.name)}
		<!--
			El envoltorio que da la vuelta. Mide toda la caja y gira sobre su centro,
			así que lo que cuelgue adentro describe la órbita sin que haya que
			calcularle la posición cuadro a cuadro.
		-->
		<div
			class="gira pointer-events-none absolute inset-0"
			style="animation-duration: {vecino.vuelta.toFixed(1)}s"
		>
			<span
				class="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center
					justify-center"
				style={sitio(vecino.donde)}
				title={nombre(vecino.cuerpo)}
			>
				<!-- Al revés y a la misma velocidad: el cuerpo viaja, pero no tumbea. -->
				<span
					class="derecho flex items-center justify-center"
					style="animation-duration: {vecino.vuelta.toFixed(1)}s"
				>
					<span
						class="flex items-center justify-center rounded-full
							{vecino.cuerpo.here
							? 'h-[1.35rem] w-[1.35rem] border-2 border-accent-bright bg-background text-accent-bright'
							: 'text-accent-dim'}"
					>
						<Icon
							name={vecino.cuerpo.icon}
							weight={vecino.cuerpo.here ? 'fill' : 'bold'}
							size={vecino.cuerpo.here ? '0.7rem' : '0.62rem'}
						/>
					</span>

					<!--
						Lo que te cuelga, prendido de tu propio punto. Va adentro del
						enderezado para que no se desparrame al girar el envoltorio.
					-->
					{#if vecino.cuerpo.here && satelites.length > 0}
						<span
							class="absolute top-1/2 left-1/2 h-[2.2rem] w-[2.2rem] -translate-x-1/2 -translate-y-1/2
								rounded-full border border-border-soft"
						></span>
						{#each satelites as satelite (satelite.cuerpo.name)}
							<span
								class="absolute top-1/2 left-1/2 h-[0.32rem] w-[0.32rem] rounded-full bg-text-muted"
								style="transform: translate(calc(-50% + {satelite.dx}rem), calc(-50% + {satelite.dy}rem))"
								title={satelite.cuerpo.name}
							></span>
						{/each}
					{/if}
				</span>
			</span>
		</div>
	{/each}
</div>

<style>
	/*
	 * La vuelta, y la vuelta al revés.
	 *
	 * Dos animaciones y no una con signo porque cada una la usa un elemento
	 * distinto: el envoltorio del tamaño de la caja lleva el cuerpo por su órbita,
	 * y el de adentro lo endereza para que no salga dado vuelta. Las dos con la
	 * misma duración, que es lo que hace que se cancelen.
	 *
	 * `linear` e `infinite`: una órbita no acelera ni termina.
	 */
	@keyframes vaxav-orbita {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes vaxav-orbita-inversa {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(-360deg);
		}
	}

	.gira {
		animation: vaxav-orbita linear infinite;
	}

	.derecho {
		animation: vaxav-orbita-inversa linear infinite;
	}

	/* Quien pidió que nada se mueva, ve el sistema quieto. */
	@media (prefers-reduced-motion: reduce) {
		.gira,
		.derecho {
			animation: none;
		}
	}
</style>
