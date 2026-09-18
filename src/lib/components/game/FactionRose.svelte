<!--
	La rosa de banderas: cuánto te conoce cada facción del sector.

	**Es la figura de la pantalla de Reputación del piloto.** La pregunta que esa
	pantalla contesta es «quién me conoce, y cuánto», y la respuesta no es un
	número: es una **forma**. Un piloto que trabajó siempre para el Dominio tiene
	un brazo largo y dos muñones; uno que anduvo repartido tiene tres medianos.
	Esas dos vidas se leen de un vistazo y no se leen en una lista de tres cifras.

	Informa por su forma en tres cosas:

	- **Con quién estás parado.** El largo de cada brazo es lo que esa bandera
	  piensa de vos, y el color es el suyo, el mismo que lleva en todo el juego.
	- **Qué escalón alcanzaste con cada una.** Los anillos no están repartidos
	  parejo: caen donde caen los escalones de verdad —diez, veinticinco,
	  cincuenta, ochenta—, así que se ve de una que el último tramo es el más
	  largo de todos, que es lo que hay que entender antes de empezar a subir.
	- **Si estás comprometido o suelto.** Un brazo largo con dos cortos es una
	  lealtad; tres iguales es un oportunista.

	**Arranca vacía y no es un defecto.** Con todo en cero quedan los ejes, los
	anillos y un punto en el medio, que es exactamente lo que pasa: no te conoce
	nadie todavía. Es la misma decisión que la escalera de la corporación —lo que
	se ve es el camino que el jugador tiene por delante— y la que el juego ya tomó
	para los agentes.

	**Sin rótulos.** Nombrar tres banderas sobre el dibujo obliga a acomodar
	palabras largas en las esquinas y a pelearlas con el borde; el color alcanza
	porque el color de una facción es suyo en todo el juego, y la lista de al lado
	dice los nombres y las cifras exactas. Es la misma decisión que el aro de la
	puerta.

	El alto sale de `aspect-ratio`: acá todo son círculos, y un círculo dentro de
	un rectángulo se vuelve una elipse.
-->
<script lang="ts">
	import type { FilaPanorama } from '$lib/tipos';

	interface Props {
		factions: readonly FilaPanorama[];
	}

	let { factions }: Props = $props();

	/** Hasta dónde llega un brazo con la reputación al tope. */
	const RADIO = 82;
	/**
	 * Y desde dónde arranca.
	 *
	 * No desde el centro: un brazo en cero tiene que verse como un brazo en cero y
	 * no desaparecer, o la rosa de un piloto nuevo no se distingue de una rosa rota.
	 */
	const RADIO_CERO = 12;

	/**
	 * Dónde caen los anillos, en la escala de cien.
	 *
	 * **Son los escalones de verdad**, no un reparto parejo. Es lo que hace que el
	 * dibujo diga que de Aliado a Leal hay más camino que de Desconocido a
	 * Conocido, que es el dato que ninguna cifra suelta transmite.
	 */
	const ANILLOS = [10, 25, 50, 80];

	function punto(grados: number, radio: number): { x: number; y: number } {
		const radianes = ((grados - 90) * Math.PI) / 180;
		return { x: 100 + Math.cos(radianes) * radio, y: 100 + Math.sin(radianes) * radio };
	}

	/** El ángulo de cada bandera: repartidas parejo y con la primera arriba. */
	let brazos = $derived(
		factions.map((bandera, i) => {
			const angulo = (i * 360) / Math.max(1, factions.length);
			const largo = RADIO_CERO + ((RADIO - RADIO_CERO) * bandera.percent) / 100;
			return {
				bandera,
				eje: punto(angulo, RADIO),
				punta: punto(angulo, largo)
			};
		})
	);
</script>

<div class="relative aspect-square w-[16rem] max-w-full">
	<!--
		Sin rol ni texto: la lista de al lado dice el nombre, el escalón y la cifra
		de cada bandera, que es la regla de toda figura del juego.
	-->
	<svg viewBox="0 0 200 200" class="h-full w-full" aria-hidden="true">
		<!-- Los anillos de los escalones, donde caen de verdad. -->
		{#each ANILLOS as escalon (escalon)}
			<circle
				cx="100"
				cy="100"
				r={RADIO_CERO + ((RADIO - RADIO_CERO) * escalon) / 100}
				fill="none"
				stroke="var(--color-accent-dim)"
				stroke-width="0.6"
				stroke-dasharray="3 3"
				opacity="0.3"
			/>
		{/each}

		<!-- El anillo del tope, entero: es el techo y no un escalón más. -->
		<circle
			cx="100"
			cy="100"
			r={RADIO}
			fill="none"
			stroke="var(--color-accent-dim)"
			stroke-width="0.8"
			opacity="0.5"
		/>

		{#each brazos as brazo (brazo.bandera.code)}
			<!-- El eje entero, apagado: dice hasta dónde se podría llegar. -->
			<line
				x1="100"
				y1="100"
				x2={brazo.eje.x}
				y2={brazo.eje.y}
				stroke="var(--color-accent-dim)"
				stroke-width="0.5"
				opacity="0.3"
			/>

			<!-- Y encima el brazo, en el color de su bandera. -->
			<line
				x1="100"
				y1="100"
				x2={brazo.punta.x}
				y2={brazo.punta.y}
				stroke={brazo.bandera.color}
				stroke-width="2.4"
				stroke-linecap="round"
				opacity={brazo.bandera.percent > 0 ? 0.95 : 0.45}
			/>

			<circle
				cx={brazo.punta.x}
				cy={brazo.punta.y}
				r="4"
				fill="var(--color-background)"
				stroke={brazo.bandera.color}
				stroke-width="2"
				opacity={brazo.bandera.percent > 0 ? 1 : 0.45}
			/>
		{/each}

		<!-- Vos, en el medio. -->
		<circle cx="100" cy="100" r="3" fill="var(--color-accent)" />
	</svg>
</div>
