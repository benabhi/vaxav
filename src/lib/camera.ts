/**
 * La cámara de un lienzo que se arrastra y se acerca.
 *
 * Vive fuera del componente porque **es la parte del mapa que es fácil equivocar
 * y difícil de ver equivocada**: un acercamiento que no respeta el punto donde
 * está el mouse se siente resbaladizo sin que nadie sepa decir por qué, y un
 * encuadre mal calculado deja medio universo fuera de la pantalla. Acá se puede
 * probar sin abrir un navegador.
 *
 * Es de presentación pura: no sabe qué dibuja, sólo convierte entre el plano
 * donde viven las cosas y los píxeles de la pantalla.
 */

/** Un punto, en cualquiera de los dos planos. */
export interface Punto {
	readonly x: number;
	readonly y: number;
}

/**
 * Dónde está mirando el lienzo.
 *
 * `center` es el punto del plano que queda en el medio de la pantalla, y `scale`
 * cuántos píxeles mide una unidad del plano. Guardar el centro y no la esquina
 * hace que acercarse no mueva lo que se está mirando, que es lo que uno espera.
 */
export interface Camara {
	readonly center: Punto;
	readonly scale: number;
}

/** Hasta dónde se puede acercar y alejar. */
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 6;

/** Deja una escala dentro de lo permitido. */
export function clampScale(scale: number): number {
	return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Del plano a la pantalla. */
export function toScreen(punto: Punto, camara: Camara, viewport: Punto): Punto {
	return {
		x: (punto.x - camara.center.x) * camara.scale + viewport.x / 2,
		y: (punto.y - camara.center.y) * camara.scale + viewport.y / 2
	};
}

/** De la pantalla al plano. */
export function toWorld(punto: Punto, camara: Camara, viewport: Punto): Punto {
	return {
		x: (punto.x - viewport.x / 2) / camara.scale + camara.center.x,
		y: (punto.y - viewport.y / 2) / camara.scale + camara.center.y
	};
}

/**
 * Acerca o aleja **sin mover el punto de la pantalla donde está el mouse**.
 *
 * Es la diferencia entre un mapa que se siente sólido y uno resbaladizo. Sin
 * esto, acercarse tira todo hacia el centro y hay que volver a buscar lo que uno
 * estaba mirando; con esto, el sistema que está bajo el cursor se queda quieto y
 * el resto crece a su alrededor.
 *
 * La cuenta es directa: se mira qué punto del plano está bajo el cursor antes de
 * cambiar la escala, y se corre el centro lo justo para que después siga estando
 * ahí.
 */
export function zoomAt(camara: Camara, pantalla: Punto, factor: number, viewport: Punto): Camara {
	const escala = clampScale(camara.scale * factor);
	if (escala === camara.scale) return camara;

	const antes = toWorld(pantalla, camara, viewport);
	const despues = toWorld(pantalla, { center: camara.center, scale: escala }, viewport);

	return {
		scale: escala,
		center: {
			x: camara.center.x + (antes.x - despues.x),
			y: camara.center.y + (antes.y - despues.y)
		}
	};
}

/** Corre la cámara por un arrastre, en píxeles de pantalla. */
export function pan(camara: Camara, dx: number, dy: number): Camara {
	return {
		scale: camara.scale,
		center: { x: camara.center.x - dx / camara.scale, y: camara.center.y - dy / camara.scale }
	};
}

/**
 * La cámara que hace entrar todo, con un margen.
 *
 * **Encuadrar sólo aleja, nunca acerca.** Con tres sistemas, la cuenta pura daría
 * el acercamiento máximo y los dibujaría del tamaño de un plato: entra todo, sí,
 * pero se pierde la escala a la que las cosas se leen. Por eso el tope es uno, y
 * una galaxia chica se ve chica en el medio de la pantalla, que es lo correcto.
 *
 * Con un solo punto —o con todos encimados— tampoco hay ancho del que sacar una
 * escala, y se cae en el mismo uno.
 */
export function fit(puntos: readonly Punto[], viewport: Punto, margin = 60): Camara {
	if (puntos.length === 0) return { center: { x: 0, y: 0 }, scale: 1 };

	const xs = puntos.map((uno) => uno.x);
	const ys = puntos.map((uno) => uno.y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	const ancho = maxX - minX;
	const alto = maxY - minY;
	const util = { x: Math.max(1, viewport.x - margin * 2), y: Math.max(1, viewport.y - margin * 2) };

	const escala = ancho > 0 || alto > 0 ? Math.min(util.x / (ancho || 1), util.y / (alto || 1)) : 1;

	return {
		center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
		scale: clampScale(Math.min(1, escala))
	};
}
