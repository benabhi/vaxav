<!--
	El mapa de la galaxia: los sistemas en su casilla y las puertas entre ellos.

	**Es la figura de la pantalla del universo**, y la única herramienta que
	contesta preguntas de conjunto: dónde quedó el agujero, qué ramal no llega a
	ninguna parte, qué puerta se plantó y nadie terminó de conectar, qué paso está
	cerrado. La tabla de abajo contesta las de detalle; ninguna reemplaza a la otra.

	**Lienzo pelado, sin biblioteca.** El estilo del juego son líneas, puntos y
	texto, que es lo que Canvas 2D hace bien; arrastrar y acercar son una matriz de
	transformación, y una biblioteca traería su propio modelo de eventos para
	resolver algo que entra en cincuenta líneas. El día que la galaxia tenga diez
	mil sistemas, la capa de dibujo ya está aislada y se cambia sin tocar el resto.

	**No hay bucle de cuadros.** Se redibuja cuando algo cambia y nada más. Vaxav
	es un juego de esperar y esta pestaña va a quedar abierta horas: un `rAF`
	permanente sería una pantalla que consume batería para no mostrar nada nuevo.

	Los colores salen de las variables del tema y no de literales, así que el mapa
	sigue a la paleta sin que haya que acordarse de él.
-->
<script lang="ts">
	import { hexCorners, hexToPixel, BEARING_VECTORS, type Hex } from '$lib/game/galaxy';
	import { fit, pan, toScreen, toWorld, zoomAt, type Camara, type Punto } from '$lib/camera';
	import type { GateBearing } from '$lib/game/universe';
	import type { MapaGalaxia, NodoGalaxia } from '$lib/tipos';

	interface Props {
		map: MapaGalaxia;
		/** El código del sistema elegido, que la pantalla comparte con la tabla. */
		selected?: string;
		/** Qué sistemas pasan el filtro. Vacío quiere decir «todos». */
		visible?: ReadonlySet<string>;
		/** Con qué color pintar cada sistema, según el filtro activo. */
		paint?: (node: NodoGalaxia) => string;
		onSelect?: (code: string) => void;
	}

	let { map, selected = '', visible = new Set<string>(), paint, onSelect }: Props = $props();

	/** El radio de una casilla en el plano. Todo lo demás se mide contra esto. */
	const HEX = 52;
	/** Debajo de este acercamiento no se escriben los nombres: serían manchas. */
	const LABEL_FROM = 0.55;
	/**
	 * A qué distancia queda la cámara al centrar en un sistema.
	 *
	 * Bastante más cerca que el encuadre general: quien aprieta la mira no quiere
	 * ver dónde cae el sistema en la galaxia entera —eso ya lo veía— sino mirarlo
	 * de cerca, con sus vecinos y sus salidas legibles alrededor.
	 */
	const CERCA = 1.8;

	let lienzo = $state<HTMLCanvasElement>();
	let caja = $state<HTMLDivElement>();
	let viewport = $state<Punto>({ x: 0, y: 0 });
	let camara = $state<Camara>({ center: { x: 0, y: 0 }, scale: 1 });
	let encuadrado = $state(false);
	let hover = $state('');

	/** Dónde cae cada sistema en el plano, una sola vez por carga. */
	let puntos = $derived(
		new Map(map.systems.map((nodo) => [nodo.code, hexToPixel(nodo.hex as Hex, HEX)]))
	);

	/** Si el filtro deja ver este sistema. Sin filtro, todos. */
	function seVe(code: string): boolean {
		return visible.size === 0 || visible.has(code);
	}

	/** Lee un color del tema. El mapa no inventa paleta. */
	function token(name: string): string {
		if (!lienzo) return '#ff7a1a';
		return getComputedStyle(lienzo).getPropertyValue(name).trim() || '#ff7a1a';
	}

	function dibujar() {
		const canvas = lienzo;
		if (!canvas || viewport.x === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// El lienzo se dimensiona en píxeles reales del dispositivo y se escala: sin
		// esto, en una pantalla densa las líneas de un píxel salen borrosas.
		const dpr = window.devicePixelRatio || 1;
		canvas.width = viewport.x * dpr;
		canvas.height = viewport.y * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, viewport.x, viewport.y);

		const accent = token('--color-accent');
		const accentDim = token('--color-accent-dim');
		const data = token('--color-data');
		const warning = token('--color-warning');
		const danger = token('--color-danger');
		const muted = token('--color-text-muted');
		const strong = token('--color-text-strong');

		// --- Las puertas primero: las casillas se dibujan encima ------------------
		for (const enlace of map.links) {
			const desde = puntos.get(enlace.from);
			const hasta = puntos.get(enlace.to);
			if (!desde || !hasta) continue;

			const apagado = !seVe(enlace.from) && !seVe(enlace.to);
			const a = toScreen(desde, camara, viewport);
			const b = toScreen(hasta, camara, viewport);

			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			// **El atajo se dibuja punteado.** No es un error: es un pasaje que se
			// saltea el camino largo, y verlo distinto es toda la gracia de marcarlo.
			ctx.setLineDash(enlace.shortcut ? [6, 5] : []);
			ctx.strokeStyle = apagado
				? muted
				: enlace.closed
					? danger
					: enlace.shortcut
						? data
						: accentDim;
			ctx.globalAlpha = apagado ? 0.25 : enlace.closed ? 0.55 : 1;
			ctx.lineWidth = enlace.shortcut ? 1 : 1.5;
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.globalAlpha = 1;

			// **La barra del paso cerrado.** Una línea más fina o más apagada no
			// alcanza: cerrado no es «menos importante», es «no se cruza», y eso se
			// lee mejor con un tajo cruzado al medio que con un matiz de color.
			if (enlace.closed && !apagado) {
				const medio = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
				const largo = Math.hypot(b.x - a.x, b.y - a.y) || 1;
				const nx = -((b.y - a.y) / largo);
				const ny = (b.x - a.x) / largo;
				const brazo = Math.max(5, 9 * camara.scale);

				ctx.beginPath();
				ctx.moveTo(medio.x - nx * brazo, medio.y - ny * brazo);
				ctx.lineTo(medio.x + nx * brazo, medio.y + ny * brazo);
				ctx.strokeStyle = danger;
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		}

		// --- Los sistemas ---------------------------------------------------------
		for (const nodo of map.systems) {
			const punto = puntos.get(nodo.code);
			if (!punto) continue;

			const donde = toScreen(punto, camara, viewport);
			const radio = Math.max(2.5, HEX * camara.scale * 0.1);
			const apagado = !seVe(nodo.code);
			const elegido = nodo.code === selected;
			const senalado = nodo.code === hover;

			// El muñón: una puerta plantada que no lleva a ninguna parte. Sale del
			// hexágono hacia su rumbo, y es lo que hace visible el trabajo a medio
			// hacer que el contador de arriba cuenta sin decir dónde.
			for (const rumbo of nodo.looseBearings) {
				const paso = BEARING_VECTORS[rumbo as GateBearing];
				if (!paso) continue;
				const vecino = hexToPixel(
					{ x: nodo.hex.x + paso.x, y: nodo.hex.y + paso.y, z: nodo.hex.z + paso.z },
					HEX
				);
				const fin = toScreen(vecino, camara, viewport);
				ctx.beginPath();
				ctx.moveTo(donde.x, donde.y);
				ctx.lineTo(donde.x + (fin.x - donde.x) * 0.38, donde.y + (fin.y - donde.y) * 0.38);
				ctx.strokeStyle = warning;
				ctx.globalAlpha = apagado ? 0.2 : 0.8;
				ctx.lineWidth = 1.5;
				ctx.stroke();
				ctx.globalAlpha = 1;
			}

			// La casilla, apenas insinuada: dice que la galaxia es una grilla sin
			// competir con el punto, que es lo que se lee.
			const vertices = hexCorners(donde, HEX * camara.scale * 0.92);
			ctx.beginPath();
			vertices.forEach((v, i) => (i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)));
			ctx.closePath();
			ctx.strokeStyle = accentDim;
			ctx.globalAlpha = apagado ? 0.05 : 0.16;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.globalAlpha = 1;

			// El punto del sistema. El color lo decide el filtro activo; sin filtro,
			// el naranja del HUD.
			ctx.beginPath();
			ctx.arc(donde.x, donde.y, radio, 0, Math.PI * 2);
			ctx.fillStyle = paint ? paint(nodo) : accent;
			ctx.globalAlpha = apagado ? 0.18 : 1;
			ctx.fill();
			ctx.globalAlpha = 1;

			// **El ramal suelto va anillado en rojo.** Tiene casilla pero no tiene
			// lugar: no llega caminando hasta la semilla, y su posición no significa
			// nada hasta que alguien lo enganche.
			if (nodo.adrift && !apagado) {
				ctx.beginPath();
				ctx.arc(donde.x, donde.y, radio + 4, 0, Math.PI * 2);
				ctx.strokeStyle = danger;
				ctx.lineWidth = 1.5;
				ctx.stroke();
			}

			if (elegido || senalado) {
				ctx.beginPath();
				ctx.arc(donde.x, donde.y, radio + (elegido ? 7 : 5), 0, Math.PI * 2);
				ctx.strokeStyle = elegido ? strong : accent;
				ctx.lineWidth = elegido ? 2 : 1;
				ctx.stroke();
			}

			// El nombre, sólo de cerca: de lejos serían manchas superpuestas y el mapa
			// dejaría de leerse justo cuando se lo mira para ver la forma del conjunto.
			if (camara.scale >= LABEL_FROM && !apagado) {
				ctx.font = '600 11px ui-monospace, monospace';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillStyle = elegido ? strong : muted;
				ctx.fillText(nodo.name.toUpperCase(), donde.x, donde.y + radio + 7);
			}
		}
	}

	/** Qué sistema cae bajo un punto de la pantalla, o vacío. */
	function sistemaEn(pantalla: Punto): string {
		const mundo = toWorld(pantalla, camara, viewport);
		// El alcance se mide en el plano y no en píxeles, así que el blanco es el
		// mismo esté donde esté el zoom: a lo lejos los puntos son chicos pero la
		// casilla que ocupan sigue siendo una casilla.
		const alcance = (HEX * 0.5) ** 2;

		for (const nodo of map.systems) {
			if (!seVe(nodo.code)) continue;
			const punto = puntos.get(nodo.code);
			if (!punto) continue;
			const dx = punto.x - mundo.x;
			const dy = punto.y - mundo.y;
			if (dx * dx + dy * dy <= alcance) return nodo.code;
		}
		return '';
	}

	// --- Arrastrar --------------------------------------------------------------
	let arrastrando = $state(false);
	let movido = $state(false);
	let ultimo: Punto = { x: 0, y: 0 };

	function relativo(evento: MouseEvent): Punto {
		const rect = lienzo?.getBoundingClientRect();
		return { x: evento.clientX - (rect?.left ?? 0), y: evento.clientY - (rect?.top ?? 0) };
	}

	function alBajar(evento: MouseEvent) {
		arrastrando = true;
		movido = false;
		ultimo = { x: evento.clientX, y: evento.clientY };
	}

	function alMover(evento: MouseEvent) {
		if (!arrastrando) {
			const bajo = sistemaEn(relativo(evento));
			if (bajo !== hover) hover = bajo;
			return;
		}
		const dx = evento.clientX - ultimo.x;
		const dy = evento.clientY - ultimo.y;
		// Un temblor de dos píxeles no es un arrastre: sin este umbral, elegir un
		// sistema con la mano poco firme no selecciona nada.
		if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movido = true;
		ultimo = { x: evento.clientX, y: evento.clientY };
		camara = pan(camara, dx, dy);
	}

	function alSoltar(evento: MouseEvent) {
		if (arrastrando && !movido) {
			const bajo = sistemaEn(relativo(evento));
			if (bajo) onSelect?.(bajo);
		}
		arrastrando = false;
	}

	function alRodar(evento: WheelEvent) {
		evento.preventDefault();
		camara = zoomAt(camara, relativo(evento), evento.deltaY < 0 ? 1.12 : 1 / 1.12, viewport);
	}

	/** Vuelve a encuadrar todo lo que hay. La usa el botón de la pantalla. */
	export function encuadrar() {
		camara = fit([...puntos.values()], viewport);
	}

	/**
	 * Lleva la cámara a un sistema, sin cambiar el acercamiento si ya es útil.
	 *
	 * Es lo que hace que la tabla y el mapa sean dos vistas de lo mismo en vez de
	 * dos pantallas que no se hablan: se busca un sistema en la lista, que es donde
	 * se busca bien, y el mapa va a mostrarlo en su lugar del conjunto.
	 *
	 * **Acerca, pero nunca aleja.** Quien aprieta la mira quiere ver el sistema de
	 * cerca; si ya estaba más cerca todavía, quedarse donde estaba es lo correcto:
	 * mover la cámara es ayudar, sacarle el encuadre a quien lo eligió es
	 * arrebatarle el control.
	 */
	export function centrar(code: string) {
		const punto = puntos.get(code);
		if (!punto) return;
		camara = { center: punto, scale: Math.max(camara.scale, CERCA) };
	}

	$effect(() => {
		if (!caja) return;
		const observador = new ResizeObserver(([entrada]) => {
			viewport = { x: entrada.contentRect.width, y: entrada.contentRect.height };
		});
		observador.observe(caja);
		return () => observador.disconnect();
	});

	// El primer encuadre, cuando ya se sabe cuánto mide el lienzo. **Una sola vez**:
	// re-encuadrar en cada cambio le sacaría el mapa de las manos al que lo movió.
	$effect(() => {
		if (encuadrado || viewport.x === 0 || puntos.size === 0) return;
		camara = fit([...puntos.values()], viewport);
		encuadrado = true;
	});

	// El dibujo depende de todo esto y de nada más. Leerlos acá es lo que hace que
	// se redibuje solo cuando alguno cambia, sin bucle de cuadros.
	$effect(() => {
		void [camara, viewport, selected, hover, visible, map, paint];
		dibujar();
	});
</script>

<div
	bind:this={caja}
	class="relative h-full min-h-[18rem] w-full overflow-hidden border border-border-soft bg-well
		{arrastrando ? 'cursor-grabbing' : hover ? 'cursor-pointer' : 'cursor-grab'}"
>
	<!--
		El lienzo no lleva rol ni foco: lo que se recorre con el teclado es la tabla
		de abajo, que muestra lo mismo. Un mapa que se camina a ciegas con las flechas
		no ayuda a nadie; una tabla ordenable, sí.
	-->
	<canvas
		bind:this={lienzo}
		class="block"
		style="width: {viewport.x}px; height: {viewport.y}px"
		onmousedown={alBajar}
		onmousemove={alMover}
		onmouseup={alSoltar}
		onmouseleave={() => {
			arrastrando = false;
			hover = '';
		}}
		onwheel={alRodar}
	></canvas>
</div>
