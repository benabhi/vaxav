/**
 * Las reglas de un mensaje privado: qué se puede escribir y qué no.
 *
 * Puras y sin base, como todo lo de `game/`: el servicio las usa para rechazar y
 * la pantalla para avisar antes de mandar, y las dos leen lo mismo. Un límite que
 * sólo conoce el servidor es un formulario que deja escribir mil palabras para
 * después decir que no.
 *
 * Corresponde a `docs/systems/INTERFACE.md`.
 */

/**
 * Cuánto entra en un asunto.
 *
 * Corto a propósito: el asunto es lo que se lee en la lista de la bandeja, y uno
 * que no entra en su renglón se corta con puntos suspensivos y deja de servir
 * para lo único que sirve, que es decidir si abrir el mensaje o no.
 */
export const SUBJECT_MAX = 80;

/**
 * Y cuánto en el cuerpo.
 *
 * Generoso, porque acá sí se viene a escribir: un trato entre corporaciones o el
 * porqué de una guerra no entran en dos renglones. El techo está para que una
 * fila no crezca sin límite, no para apurar al que escribe.
 */
export const BODY_MAX = 4000;

/**
 * Por qué no se puede mandar este mensaje, o cadena vacía si se puede.
 *
 * Devuelve el motivo y no un booleano por lo mismo que el resto del juego: un
 * botón apagado sin explicación es peor que un botón que no está.
 *
 * **El asunto puede ir vacío y el cuerpo no.** Un mensaje sin asunto sigue siendo
 * un mensaje —la bandeja lo muestra como «Sin asunto»— pero uno sin cuerpo no es
 * nada, y mandarlo sólo le enciende el aviso al otro para que abra una hoja en
 * blanco.
 */
export function messageProblem(subject: string, body: string): string {
	if (body.trim() === '') return 'Un mensaje vacío no le dice nada a nadie.';
	if (subject.length > SUBJECT_MAX) return `El asunto no puede pasar de ${SUBJECT_MAX} caracteres.`;
	if (body.length > BODY_MAX) return `El mensaje no puede pasar de ${BODY_MAX} caracteres.`;
	return '';
}

/**
 * El asunto como se guarda: sin espacios de sobra en las puntas.
 *
 * Se recorta acá y no en la pantalla para que el que mande por otro camino
 * —una acción del juego que avise algo, el día que exista— quede igual.
 */
export function trimSubject(subject: string): string {
	return subject.trim().slice(0, SUBJECT_MAX);
}

/** Lo mismo con el cuerpo. */
export function trimBody(body: string): string {
	return body.trim().slice(0, BODY_MAX);
}

/**
 * Cómo se lee un asunto vacío en la bandeja.
 *
 * Una fila sin nada donde va el asunto se lee como un error de dibujado, no como
 * un mensaje sin título.
 */
export const NO_SUBJECT = 'Sin asunto';
