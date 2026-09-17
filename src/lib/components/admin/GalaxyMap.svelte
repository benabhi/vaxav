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
	import { hexCorners, hexToPixel, neighbourOf, BEARING_VECTORS, type Hex } from '$lib/game/galaxy';
	import { fit, pan, toScreen, toWorld, zoomAt, type Camara, type Punto } from '$lib/camera';
	import type { GateBearing } from '$lib/game/universe';
	import Icon from '../Icon.svelte';
	import type { MapaGalaxia, NodoGalaxia } from '$lib/tipos';

	interface Props {
		map: MapaGalaxia;
		/** El código del sistema elegido, que la pantalla comparte con la tabla. */
		selected?: string;
		/** Qué sistemas pasan el filtro. Vacío quiere decir «todos». */
		visible?: ReadonlySet<string>;
		/** Con qué color pintar cada sistema, según el filtro activo. */
		paint?: (node: NodoGalaxia) => string;
		/**
		 * El territorio al que pertenece cada sistema, si hay que dibujarlo.
		 *
		 * `key` agrupa las casillas —dos con la misma clave son del mismo
		 * territorio—, `color` dice de qué color y `label` cómo se llama. Sale como un
		 * objeto y no como tres props sueltas porque las tres van juntas o no va
		 * ninguna: dibujar un borde sin saber qué separa no significa nada.
		 */
		territory?: {
			key: (node: NodoGalaxia) => string;
			color: (node: NodoGalaxia) => string;
			label: (node: NodoGalaxia) => string;
		};
		onSelect?: (code: string) => void;
		/**
		 * Si está a pantalla casi completa, y cómo pedir el cambio.
		 *
		 * El botón vive **adentro del mapa** porque es del mapa: cualquier pantalla
		 * que lo use lo tiene sin hacer nada. Quién decide qué significa estar
		 * agrandado —dónde va la ficha, qué se esconde alrededor— es de la pantalla,
		 * y por eso el estado viaja para afuera en vez de quedarse acá.
		 */
		expanded?: boolean;
		onToggleExpand?: () => void;
		/**
		 * Dónde está mirando, y si ya se encuadró una vez.
		 *
		 * **Van afuera para que el mapa pueda cambiar de lugar sin perder la vista.**
		 * Agrandarlo lo saca del panel y lo pone en una capa propia, y eso lo vuelve a
		 * montar: con la cámara adentro, cada vez que se agranda o se achica volverías
		 * al encuadre inicial en vez de seguir mirando lo que estabas mirando.
		 *
		 * Son opcionales: una pantalla que dibuje el mapa en un solo lugar no necesita
		 * saber nada de esto.
		 */
		camera?: Camara | null;
		fitted?: boolean;
	}

	let {
		map,
		selected = '',
		visible = new Set<string>(),
		paint,
		territory,
		expanded = false,
		onToggleExpand,
		camera = $bindable(null),
		fitted = $bindable(false),
		onSelect
	}: Props = $props();

	/** El radio de una casilla en el plano. Todo lo demás se mide contra esto. */
	const HEX = 52;
	/** Debajo de este acercamiento no se escriben los nombres: serían manchas. */
	const LABEL_FROM = 0.55;
	/**
	 * Y por encima de éste se deja de escribir el nombre del territorio.
	 *
	 * Los dos rótulos se turnan: de lejos se lee **dónde estoy en la galaxia** —el
	 * nombre de la región, grande y tenue sobre su mancha— y de cerca **qué sistema
	 * es cada punto**. Mostrar los dos a la vez es el camino más corto a un mapa
	 * ilegible.
	 */
	const TERRITORY_LABEL_UNTIL = 0.75;
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
	/**
	 * La cámara propia, para cuando nadie la sostiene desde afuera.
	 *
	 * El componente escribe siempre en `camera`, que es `$bindable`: si la pantalla
	 * lo ató a su propio estado, la vista sobrevive a que el mapa se mude; si no, el
	 * valor vive acá y se pierde al desmontarse, que es lo correcto para un mapa que
	 * se dibuja en un solo lugar.
	 */
	let camara = $derived(camera ?? { center: { x: 0, y: 0 }, scale: 1 });

	/** Mueve la cámara, viva donde viva. */
	function mover(nueva: Camara) {
		camera = nueva;
	}
	let hover = $state('');

	/** Dónde cae cada sistema en el plano, una sola vez por carga. */
	let puntos = $derived(
		new Map(map.systems.map((nodo) => [nodo.code, hexToPixel(nodo.hex as Hex, HEX)]))
	);

	/** Si el filtro deja ver este sistema. Sin filtro, todos. */
	function seVe(code: string): boolean {
		return visible.size === 0 || visible.has(code);
	}

	/** Si hay un recorte puesto que deje afuera a alguien. */
	let filtrando = $derived(visible.size > 0 && visible.size < map.systems.length);

	/**
	 * Los rumbos en el orden de los vértices del hexágono.
	 *
	 * `hexCorners` arranca a la derecha y gira como el reloj, así que el lado que va
	 * del vértice `i-1` al `i` separa de la vecina del rumbo que está en esta lista
	 * en la posición `i`. Escrito acá para no tener que deducirlo cada vez que
	 * alguien lea el dibujo de las fronteras.
	 */
	const LADOS: GateBearing[] = ['ne', 'n', 'nw', 'sw', 's', 'se'];

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

		// --- Los territorios, debajo de todo ------------------------------------
		//
		// **Relleno muy tenue y borde sólo en la frontera.** Dibujar el contorno de
		// cada casilla convierte el mapa en un panal y se pierde la forma del
		// territorio, que es justo lo que se vino a ver. Un lado se dibuja cuando la
		// casilla vecina es de otro dueño, que es la definición de frontera.
		if (territory) {
			// Objeto y no `Map`: se arma y se tira dentro del mismo dibujo, no es
			// estado reactivo.
			const dueno: Record<string, string> = {};
			for (const nodo of map.systems) {
				dueno[`${nodo.hex.x},${nodo.hex.y},${nodo.hex.z}`] = territory.key(nodo);
			}

			for (const nodo of map.systems) {
				const punto = puntos.get(nodo.code);
				if (!punto) continue;
				const donde = toScreen(punto, camara, viewport);
				const color = territory.color(nodo);
				const mio = territory.key(nodo);
				const vertices = hexCorners(donde, HEX * camara.scale);

				ctx.beginPath();
				vertices.forEach((v, i) => (i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)));
				ctx.closePath();
				ctx.fillStyle = color;
				ctx.globalAlpha = seVe(nodo.code) ? 0.13 : 0.04;
				ctx.fill();
				ctx.globalAlpha = 1;

				// Los seis lados, uno por uno. El lado `i` del hexágono de tapa plana
				// separa de la vecina que está en el rumbo `i`, y el orden de
				// `GATE_BEARINGS` es el mismo que el de los vértices: los dos arrancan
				// arriba y giran como el reloj.
				for (let i = 0; i < 6; i++) {
					const vecina = neighbourOf(nodo.hex as Hex, LADOS[i]);
					const suyo = dueno[`${vecina.x},${vecina.y},${vecina.z}`];
					if (suyo === mio) continue;

					const a = vertices[(i + 5) % 6];
					const b = vertices[i];
					ctx.beginPath();
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
					ctx.strokeStyle = color;
					ctx.globalAlpha = seVe(nodo.code) ? 0.75 : 0.2;
					ctx.lineWidth = 1.5;
					ctx.stroke();
					ctx.globalAlpha = 1;
				}
			}

			// El nombre del territorio, en su centro, y **sólo de lejos**: es el rótulo
			// que contesta «dónde estoy en la galaxia», que es la pregunta que uno se
			// hace cuando no distingue los sistemas.
			if (camara.scale <= TERRITORY_LABEL_UNTIL) {
				const centros: Record<
					string,
					{ x: number; y: number; n: number; color: string; label: string }
				> = {};
				for (const nodo of map.systems) {
					const punto = puntos.get(nodo.code);
					if (!punto || !seVe(nodo.code)) continue;
					const clave = territory.key(nodo);
					const junta = (centros[clave] ??= {
						x: 0,
						y: 0,
						n: 0,
						color: territory.color(nodo),
						label: territory.label(nodo)
					});
					junta.x += punto.x;
					junta.y += punto.y;
					junta.n++;
				}

				// **El que choca no se dibuja.** Dos territorios cuyos centros caen cerca
				// —y con seis en un racimo pasa— apilan sus nombres uno encima del otro y
				// no se lee ninguno de los dos. Se dibujan de mayor a menor, así que el
				// que se queda afuera es siempre el más chico, que es el que menos falta
				// hace nombrar.
				ctx.font = '700 13px ui-monospace, monospace';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				const puestos: { x: number; y: number; ancho: number }[] = [];
				for (const junta of Object.values(centros).sort((a, b) => b.n - a.n)) {
					if (!junta.label) continue;
					const donde = toScreen({ x: junta.x / junta.n, y: junta.y / junta.n }, camara, viewport);
					const texto = junta.label.toUpperCase();
					const ancho = ctx.measureText(texto).width;

					const choca = puestos.some(
						(otro) =>
							Math.abs(otro.x - donde.x) < (otro.ancho + ancho) / 2 + 8 &&
							Math.abs(otro.y - donde.y) < 16
					);
					if (choca) continue;

					ctx.fillStyle = junta.color;
					ctx.globalAlpha = 0.65;
					ctx.fillText(texto, donde.x, donde.y);
					ctx.globalAlpha = 1;
					puestos.push({ x: donde.x, y: donde.y, ancho });
				}
			}
		}

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

			// La casilla propia. Apenas insinuada de costumbre —dice que la galaxia es
			// una grilla sin competir con el punto—, pero **marcada cuando hay un filtro
			// puesto**: desvanecer lo que no coincide dice cuál sobra y no cuál importa,
			// y los que quedan siguen siendo puntos chiquitos en un campo vacío.
			//
			// **Con territorios encendidos no se dibuja.** El relleno ya dice de quién es
			// la casilla, y el hexágono apagado encima le agrega textura de panal justo
			// a lo que se quiere leer como un continente: así el único contorno que
			// queda es el que rodea la región entera.
			const conTerritorio = Boolean(territory) && Boolean(territory?.key(nodo));
			if (!conTerritorio || (filtrando && !apagado)) {
				const vertices = hexCorners(donde, HEX * camara.scale * 0.92);
				ctx.beginPath();
				vertices.forEach((v, i) => (i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)));
				ctx.closePath();
				if (filtrando && !apagado) {
					ctx.fillStyle = paint ? paint(nodo) : accent;
					ctx.globalAlpha = 0.14;
					ctx.fill();
				}
				ctx.strokeStyle = filtrando && !apagado ? (paint ? paint(nodo) : accent) : accentDim;
				ctx.globalAlpha = apagado ? 0.05 : filtrando ? 0.8 : 0.16;
				ctx.lineWidth = filtrando && !apagado ? 1.5 : 1;
				ctx.stroke();
				ctx.globalAlpha = 1;
			}

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
		mover(pan(camara, dx, dy));
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
		mover(zoomAt(camara, relativo(evento), evento.deltaY < 0 ? 1.12 : 1 / 1.12, viewport));
	}

	/** Vuelve a encuadrar todo lo que hay. La usa el botón de la pantalla. */
	export function encuadrar() {
		mover(fit([...puntos.values()], viewport));
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
		mover({ center: punto, scale: Math.max(camara.scale, CERCA) });
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
		if (fitted || viewport.x === 0 || puntos.size === 0) return;
		mover(fit([...puntos.values()], viewport));
		fitted = true;
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
	<!--
		Los controles del mapa, flotando en su esquina. Van encima del lienzo y no en
		una barra al lado porque son del mapa: agrandado no hay barra al lado, y un
		control que desaparece justo cuando hace más falta no es un control.
	-->
	<div class="absolute top-2 right-2 z-10 flex items-center gap-1">
		<button
			type="button"
			class="flex cursor-pointer items-center gap-1 border border-border-soft bg-well px-[0.45rem]
				py-[0.25rem] font-display text-[0.62rem] tracking-label text-text-muted uppercase
				transition-colors hover:border-accent hover:text-accent-bright"
			title={expanded ? 'Volver al tamaño normal' : 'Agrandar el mapa'}
			onclick={onToggleExpand}
		>
			<Icon name={expanded ? 'x' : 'arrows-out'} weight="bold" size="0.7rem" />
			{expanded ? 'Cerrar' : 'Agrandar'}
		</button>
	</div>

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
