/**
 * El retrato del piloto: qué tamaño tiene, cuánto puede pesar y cómo se recorta.
 *
 * La credencial es la pantalla de identidad del juego, y una credencial sin cara
 * es un formulario. Pero una cara subida por cualquiera trae dos problemas que
 * hay que resolver antes de tocar el disco: **puede pesar cualquier cosa** y
 * **puede tener cualquier forma**.
 *
 * Los dos se resuelven con la misma decisión: **el retrato se normaliza en el
 * navegador antes de subirlo**. Se recorta a la proporción de la credencial, se
 * redibuja al tamaño exacto y se codifica en WebP; lo que llega al servidor ya
 * tiene la forma y el peso que va a tener guardado. Así no hace falta una
 * librería de imágenes del lado del servidor —que en este proyecto sería una
 * dependencia nativa por una sola pantalla— y el jugador no espera a que se
 * suban ocho megas para que el servidor le diga que no.
 *
 * Eso **no reemplaza la validación**: el servidor igual comprueba el tipo, el
 * peso y la firma del archivo, porque el navegador es del jugador y un pedido se
 * puede armar a mano.
 *
 * Reglas puras: acá no hay disco ni red. Corresponde a docs/systems/INTERFACE.md.
 */

/**
 * El tamaño exacto con el que se guarda, en píxeles.
 *
 * Vertical y no cuadrado porque es **una foto de credencial**: la proporción 3:4
 * es la de un carnet, y el hueco de la credencial ocupa el alto entero de su
 * fila. Un retrato cuadrado ahí obligaría a recortar de nuevo al dibujarlo, y
 * recortar dos veces es recortar mal.
 *
 * 480×640 es de sobra para el doble de densidad del hueco más grande en que se
 * dibuja, y sigue siendo un archivo chico en WebP.
 */
export const PORTRAIT_WIDTH = 480;
export const PORTRAIT_HEIGHT = 640;

/** La proporción del hueco, para que la pantalla no la calcule a mano. */
export const PORTRAIT_ASPECT = `${PORTRAIT_WIDTH} / ${PORTRAIT_HEIGHT}`;

/**
 * Cuánto puede pesar lo que llega, en bytes.
 *
 * Medio mega es mucho más de lo que ocupa un WebP de 480×640 —suelen quedar en
 * treinta o cuarenta kilobytes— y el margen está para no rechazar una imagen con
 * mucho grano. Lo que el tope frena de verdad es el pedido armado a mano que
 * intenta dejar cien megas en el disco.
 */
export const PORTRAIT_MAX_BYTES = 512 * 1024;

/** Con qué calidad se codifica. Alta, porque la imagen ya es chica. */
export const PORTRAIT_QUALITY = 0.9;

/** El único formato que se guarda. Uno solo: dos serían dos caminos que probar. */
export const PORTRAIT_TYPE = 'image/webp';

/**
 * Qué formatos se aceptan **de entrada**, para el selector de archivos.
 *
 * Es más amplio que el de salida a propósito: el jugador tiene un JPG de la
 * cámara o un PNG de una captura, y convertirlo es trabajo del navegador, no
 * suyo.
 */
export const PORTRAIT_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

/**
 * Cómo se llama el archivo de un piloto.
 *
 * **El nombre lo ata a la cuenta**, que es lo que hace que subir uno nuevo
 * reemplace al anterior sin dejar basura y que borrar un piloto sea borrar un
 * archivo. Sin extensión variable: el formato es siempre el mismo, así que el
 * nombre es predecible y no hay que preguntarle al disco cuál de las cuatro
 * variantes existe.
 */
export function portraitFileName(pilotId: number): string {
	return `piloto-${pilotId}.webp`;
}

/** Un rectángulo dentro de la imagen original. */
export interface CropBox {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

/**
 * El recorte que hace que la imagen **cubra** el hueco sin deformarse.
 *
 * Es el `object-fit: cover` de CSS hecho a mano, y hay que hacerlo a mano porque
 * lo que se guarda tiene que salir ya recortado: si se guardara entera y se
 * recortara al dibujar, cada pantalla podría recortarla distinto y el retrato
 * sería uno en la credencial y otro en la lista.
 *
 * Se toma el cuadro más grande de la proporción pedida que entre en la imagen, y
 * se lo centra. Centrar y no alinear arriba es lo correcto para una cara: lo que
 * sobra de una foto vertical es tanto el pelo como el mentón.
 */
export function coverBox(
	sourceWidth: number,
	sourceHeight: number,
	boxWidth: number = PORTRAIT_WIDTH,
	boxHeight: number = PORTRAIT_HEIGHT
): CropBox {
	if (sourceWidth <= 0 || sourceHeight <= 0 || boxWidth <= 0 || boxHeight <= 0) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	const objetivo = boxWidth / boxHeight;
	const origen = sourceWidth / sourceHeight;

	// El desplazamiento se trunca y no se redondea. Con un sobrante impar,
	// redondear hacia arriba deja el recorte **un píxel afuera** de la imagen, y un
	// recorte que se sale del original es un borde negro en la foto guardada.
	// Truncar lo mantiene adentro siempre, y medio píxel de descentrado no lo ve
	// nadie.

	// Más ancha que el hueco: sobra a los costados y se recorta el ancho.
	if (origen > objetivo) {
		const ancho = Math.min(sourceWidth, Math.round(sourceHeight * objetivo));
		return {
			x: Math.floor((sourceWidth - ancho) / 2),
			y: 0,
			width: ancho,
			height: sourceHeight
		};
	}

	const alto = Math.min(sourceHeight, Math.round(sourceWidth / objetivo));
	return {
		x: 0,
		y: Math.floor((sourceHeight - alto) / 2),
		width: sourceWidth,
		height: alto
	};
}

/**
 * Si esos bytes son de verdad un WebP.
 *
 * El tipo que declara el pedido lo escribe quien lo manda, así que no es una
 * comprobación: es una declaración. Esto mira los doce primeros bytes, donde un
 * WebP lleva `RIFF` y, cuatro bytes después, `WEBP`. No convierte el archivo en
 * seguro —nadie puede hacer eso mirando una firma— pero descarta lo que ni
 * siquiera intenta parecerlo, que es de lo que se trata guardar sólo imágenes en
 * la carpeta de imágenes.
 */
export function looksLikeWebp(bytes: Uint8Array): boolean {
	if (bytes.length < 12) return false;

	const lee = (desde: number) =>
		String.fromCharCode(bytes[desde], bytes[desde + 1], bytes[desde + 2], bytes[desde + 3]);

	return lee(0) === 'RIFF' && lee(8) === 'WEBP';
}

/**
 * Por qué no se puede guardar ese archivo, o vacío si se puede.
 *
 * Devuelve el motivo y no un booleano por la misma razón que el resto del
 * proyecto: la pantalla tiene que poder **decir qué pasó**, y "no se pudo" no es
 * decir nada.
 */
export function portraitProblem(bytes: Uint8Array, type: string): string {
	if (bytes.length === 0) return 'No llegó ninguna imagen.';
	if (type !== PORTRAIT_TYPE) return 'El retrato tiene que ser un WebP.';
	if (bytes.length > PORTRAIT_MAX_BYTES) {
		return `La imagen pesa más de ${Math.round(PORTRAIT_MAX_BYTES / 1024)} kB.`;
	}
	if (!looksLikeWebp(bytes)) return 'Ese archivo no es una imagen WebP.';
	return '';
}
