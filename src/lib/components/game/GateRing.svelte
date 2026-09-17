<!--
	La puerta, vista de frente: el aro de salto en el borde de su casilla.

	**Es la figura de la pantalla de Ubicación cuando estás parado en una puerta.**
	Antes una puerta era un panel de texto con cuatro cifras, igual que cualquier
	otro lugar: lo único que la distinguía de una luna era lo que decían las
	palabras. Un sitio al que se viaja tiene que verse distinto de los demás, o el
	juego entero se siente como una sola pantalla con el contenido cambiado.

	Informa por su forma en cuatro cosas, y ninguna es decorativa:

	- **Hacia dónde da.** El rumbo es la identidad de una puerta —la Noreste no es
	  la Sur— y acá es lo primero que se ve: el radio encendido sale por el lado
	  del hexágono que le toca. Seis rumbos, seis dibujos distintos.
	- **Si lleva a alguna parte.** Conectada, la boca es un túnel que se aclara
	  hacia el fondo. Sin conectar, el radio es un **muñón** que se corta antes de
	  llegar al borde y adentro no hay nada, con el mismo ámbar y el mismo gesto
	  que usa el mapa para la deuda de obra.
	- **Si la podés cruzar.** Lo que no está a tu alcance pierde el color, como en
	  todo el resto de la interfaz.
	- **Si el paso está cerrado.** Con un tajo al medio, que es lo mismo que dibuja
	  el mapa: cerrado no es «menos importante», es «no se cruza».

	**La casilla es un hexágono y el aro es un círculo**, y no al revés. El
	hexágono es literal: la galaxia es una grilla de tapa plana y los seis rumbos
	son sus seis lados, así que lo que se ve acá es el mismo reparto que el mapa
	—ver `GateRose`, que contesta la pregunta de al lado: qué salidas tiene un
	sistema, mirado desde afuera—. El círculo se lo gana el aro: es lo único
	redondo de esta pantalla y significa algo, que es la única licencia que el HUD
	se permite.

	**Y no lleva una sola palabra**, ni siquiera el nombre del rumbo. La probamos
	con el rótulo puesto sobre su propio radio y el resultado fue que «Sudoeste»
	tapaba justo el muñón que tenía que dejar ver: la palabra no entra en el
	dibujo sin comerse el dibujo. Va donde corresponde —en la lista de al lado, que
	dice **Rumbo · Noroeste**— y acá queda la forma sola, que es la regla de toda
	figura del juego y de paso la deja pareciendo un instrumento y no un esquema.

	Y es **radial y no lateral** a propósito: la banda del viaje va de izquierda a
	derecha porque un viaje es un trayecto, y acá estás quieto mirando una cosa de
	frente. Dos pantallas del mismo módulo que se dibujan igual son dos pantallas
	que el jugador no distingue.
-->
<script lang="ts">
	import { bearingAngle, GATE_BEARINGS, type GateBearing } from '$lib/game/universe';

	interface Props {
		/** Por qué lado del hexágono se sale. */
		bearing: GateBearing;
		/** El sistema del otro lado, o vacío si todavía no lleva a ninguna parte. */
		destination: string;
		/** Si el paso está cerrado. */
		closed: boolean;
		/** Si esta nave puede cruzarla ahora mismo. */
		reachable: boolean;
	}

	let { bearing, destination, closed, reachable }: Props = $props();

	/** El borde de la casilla, medido a los vértices del hexágono. */
	const RADIO_CELDA = 96;
	/**
	 * Y medido a la mitad de un lado, que es por donde se sale.
	 *
	 * En un hexágono regular la apotema es el radio por el coseno de treinta
	 * grados. Sale de la cuenta y no de un número a ojo porque **el nodo tiene que
	 * caer exactamente sobre la línea**: cuatro píxeles de más lo despegan del
	 * borde y el dibujo pasa a decir algo que no es.
	 */
	const RADIO_BORDE = RADIO_CELDA * Math.cos(Math.PI / 6);
	/** El aro: su cara interna y su cara externa. */
	const RADIO_BOCA = 44;
	const RADIO_ARO = 51;
	/** Hasta dónde llega un muñón: se corta bien antes del borde. */
	const RADIO_MUNON = 74;

	/** Un punto del dibujo, en grados y con el cero a la derecha. */
	function punto(grados: number, radio: number): { x: number; y: number } {
		const radianes = (grados * Math.PI) / 180;
		return { x: 100 + Math.cos(radianes) * radio, y: 100 + Math.sin(radianes) * radio };
	}

	/**
	 * El ángulo de dibujo de un rumbo, con el norte arriba.
	 *
	 * `bearingAngle` cuenta desde el norte como las agujas del reloj y el lienzo
	 * cuenta desde la derecha, así que la vuelta de noventa grados es la que hace
	 * que el norte quede arriba. Es la misma corrección que la roseta del cuartel.
	 */
	function anguloDe(rumbo: GateBearing): number {
		return bearingAngle(rumbo) - 90;
	}

	let celda = $derived(
		Array.from({ length: 6 }, (_, i) => punto(60 * i, RADIO_CELDA))
			.map((v) => `${v.x},${v.y}`)
			.join(' ')
	);

	let conectada = $derived(destination !== '');
	/** Encendida sólo si lleva a alguna parte y además la podés cruzar. */
	let viva = $derived(conectada && reachable && !closed);

	let angulo = $derived(anguloDe(bearing));
	let salida = $derived(punto(angulo, RADIO_ARO));
	let borde = $derived(punto(angulo, conectada ? RADIO_BORDE : RADIO_MUNON));

	/** El color del aro, que es el del estado del paso. */
	let tono = $derived(
		closed
			? 'var(--color-danger)'
			: !conectada
				? 'var(--color-warning)'
				: viva
					? 'var(--color-accent)'
					: 'var(--color-accent-dim)'
	);

	/**
	 * Los anillos del túnel, del más ancho al más angosto.
	 *
	 * Se aclaran hacia adentro: es lo que hace que la boca se lea como un pozo con
	 * luz al fondo y no como un blanco de tiro. Cuatro alcanzan; con más, el centro
	 * se empasta y deja de haber fondo.
	 */
	const TUNEL = [
		{ radio: 36, alfa: 0.16 },
		{ radio: 28, alfa: 0.28 },
		{ radio: 20, alfa: 0.45 },
		{ radio: 12, alfa: 0.7 }
	];
</script>

<div class="relative aspect-square w-[17rem] max-w-full">
	<!--
		Sin rol ni texto: todo lo que dice el dibujo está escrito en las lecturas de
		al lado, que es la regla de toda figura del juego.
	-->
	<svg viewBox="0 0 200 200" class="h-full w-full" aria-hidden="true">
		<!-- La casilla: el hexágono de la grilla, apenas insinuado. -->
		<polygon
			points={celda}
			fill="none"
			stroke="var(--color-accent-dim)"
			stroke-width="1"
			stroke-dasharray="4 3"
			opacity="0.45"
		/>

		<!-- Los otros cinco rumbos, marcados y nada más: existen, pero no son éste. -->
		{#each GATE_BEARINGS.filter((uno) => uno !== bearing) as otro (otro)}
			{@const donde = punto(anguloDe(otro), RADIO_BORDE)}
			<circle cx={donde.x} cy={donde.y} r="2.4" fill="var(--color-accent-dim)" opacity="0.5" />
		{/each}

		<!-- El rumbo de esta puerta: el radio que sale por su lado. -->
		<line
			x1={salida.x}
			y1={salida.y}
			x2={borde.x}
			y2={borde.y}
			stroke={tono}
			stroke-width={conectada ? 2 : 1.6}
			stroke-dasharray={conectada ? 'none' : '4 3'}
			opacity={viva ? 1 : 0.75}
		/>

		<!--
			Y el nodo del otro lado, **sólo si hay otro lado**. Un muñón termina en
			nada, que es justo lo que quiere decir: alguien la plantó y nadie la
			conectó.
		-->
		{#if conectada}
			<circle
				cx={borde.x}
				cy={borde.y}
				r="4.6"
				fill="var(--color-background)"
				stroke={tono}
				stroke-width="2"
			/>
		{/if}

		<!-- El aro: dos caras y seis puntales, que es lo que lo vuelve una obra. -->
		<circle cx="100" cy="100" r={RADIO_ARO} fill="none" stroke={tono} stroke-width="1.6" />
		<circle
			cx="100"
			cy="100"
			r={RADIO_BOCA}
			fill="none"
			stroke={tono}
			stroke-width="1"
			opacity="0.65"
		/>
		{#each [0, 60, 120, 180, 240, 300] as grados (grados)}
			{@const dentro = punto(grados, RADIO_BOCA)}
			<line
				x1={dentro.x}
				y1={dentro.y}
				x2={punto(grados, RADIO_ARO).x}
				y2={punto(grados, RADIO_ARO).y}
				stroke={tono}
				stroke-width="2.6"
			/>
		{/each}

		<!--
			La boca. Conectada es un túnel que se aclara hacia el fondo; sin conectar
			no se dibuja nada, porque del otro lado no hay nada.
		-->
		{#if conectada}
			{#each TUNEL as anillo (anillo.radio)}
				<circle
					cx="100"
					cy="100"
					r={anillo.radio}
					fill="none"
					stroke="var(--color-data)"
					stroke-width="1"
					opacity={viva ? anillo.alfa : anillo.alfa * 0.35}
				/>
			{/each}
			<circle
				cx="100"
				cy="100"
				r="5"
				fill="var(--color-data)"
				opacity={viva ? 0.9 : 0.3}
				class={viva ? 'fondo' : ''}
			/>
		{:else}
			<!-- Sin conectar: la boca vacía, con el aire de un hueco sin terminar. -->
			<circle
				cx="100"
				cy="100"
				r="24"
				fill="none"
				stroke="var(--color-warning)"
				stroke-width="1"
				stroke-dasharray="3 5"
				opacity="0.5"
			/>
		{/if}

		<!--
			El tajo del paso cerrado, cruzado al medio y pasándose del aro. Una línea
			más fina o más apagada no alcanza: cerrado no es un matiz, es un no.
		-->
		{#if closed}
			<line
				x1={punto(-30, RADIO_ARO + 12).x}
				y1={punto(-30, RADIO_ARO + 12).y}
				x2={punto(150, RADIO_ARO + 12).x}
				y2={punto(150, RADIO_ARO + 12).y}
				stroke="var(--color-danger)"
				stroke-width="3"
			/>
		{/if}
	</svg>
</div>

<style>
	/*
	 * El fondo del túnel late, muy despacio.
	 *
	 * Es lo único que se mueve en la pantalla, y late **sólo si la puerta está
	 * viva**: una boca quieta se lee como una foto y una puerta encendida es una
	 * máquina prendida esperando que la cruces. Tres segundos y medio es un
	 * respiro, no un parpadeo: a esta velocidad se nota sin llamar la atención.
	 */
	@keyframes vaxav-boca {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}

	.fondo {
		animation: vaxav-boca 3.5s ease-in-out infinite;
	}

	/* Quien pidió que nada se mueva, no ve moverse nada. */
	@media (prefers-reduced-motion: reduce) {
		.fondo {
			animation: none;
		}
	}
</style>
