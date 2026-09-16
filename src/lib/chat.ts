/**
 * El chat: qué salas hay y qué se lee en cada una.
 *
 * **Esto es una maqueta.** Las líneas y la gente conectada son inventadas y
 * viven acá como constantes. Sirve para ver la ventana funcionando —abrirla,
 * cambiar de sala, leer— y para decidir su forma antes de que exista lo difícil.
 *
 * Lo difícil es que el chat es **lo único del juego que ocurre en tiempo real**:
 * todo lo demás tarda horas. Cuando se implemente de verdad no va a vivir en la
 * pantalla, por lo que explica docs/systems/ARCHITECTURE.md; el componente se
 * queda entonces sólo con lo que la ventana necesita recordar —si está abierta y
 * en qué sala—, que es justamente lo que hoy tiene.
 *
 * Dos salas fijas: **global** y la del **sistema** donde está el piloto.
 */

export const GLOBAL_ROOM = 'global';
export const SYSTEM_ROOM = 'system';

export type ChatRoom = typeof GLOBAL_ROOM | typeof SYSTEM_ROOM;

/** Una línea del chat, lista para dibujar. */
export interface ChatLine {
	readonly author: string;
	readonly time: string;
	readonly text: string;
}

/** Alguien conectado a la sala. */
export interface ChatMember {
	readonly callsign: string;
	readonly detail: string;
}

// --- Maqueta -----------------------------------------------------------------
//
// Contenido inventado, y a propósito con la forma que va a tener el de verdad:
// nombres cortos, horas en UTC y frases de gente que está haciendo otra cosa
// mientras escribe. Sirve para ver si la ventana aguanta el texto real.

const GLOBAL_LINES: readonly ChatLine[] = [
	{ author: 'Tova Reik', time: '09:12', text: 'Alguien vio pasar un carguero por los anillos?' },
	{ author: 'Bram Ossuk', time: '09:14', text: 'Dos. Iban al Franco, no preguntes de quién.' },
	{ author: 'Kessa', time: '09:15', text: 'Se paga bien el hierro hoy en Puerto Ánfora?' },
	{
		author: 'Tova Reik',
		time: '09:16',
		text: 'Pagaba. Vino uno con la bodega llena y lo hundió.'
	},
	{ author: 'Idra Nolm', time: '09:21', text: 'La Extractora compra igual. Precio de ayer.' },
	{ author: 'Kessa', time: '09:22', text: 'Voy para allá entonces.' }
];

const SYSTEM_LINES: readonly ChatLine[] = [
	{ author: 'Mira Ossen', time: '09:03', text: 'Turno de la mañana en el Cinturón, hay lugar.' },
	{
		author: 'Pell Auren',
		time: '09:08',
		text: 'Necesito dos bodegas al puerto antes de las 14.'
	},
	{
		author: 'Renna Bosc',
		time: '09:19',
		text: 'Patrulla saliendo. No se acerquen al borde hoy.'
	},
	{ author: 'Pell Auren', time: '09:20', text: 'Recibido.' }
];

const GLOBAL_MEMBERS: readonly ChatMember[] = [
	{ callsign: 'Tova Reik', detail: 'Concordia' },
	{ callsign: 'Bram Ossuk', detail: 'Sin bandera' },
	{ callsign: 'Kessa', detail: 'Dominio' },
	{ callsign: 'Idra Nolm', detail: 'Concordia' },
	{ callsign: 'Yuli Trant', detail: 'Pacto' },
	{ callsign: 'Oren Casteig', detail: 'Dominio' },
	{ callsign: 'La Chueca', detail: 'Sin bandera' }
];

const SYSTEM_MEMBERS: readonly ChatMember[] = [
	{ callsign: 'Mira Ossen', detail: 'Pacto' },
	{ callsign: 'Pell Auren', detail: 'Concordia' },
	{ callsign: 'Renna Bosc', detail: 'Dominio' }
];

/** Las líneas de la sala que se está mirando. */
export function chatLines(room: ChatRoom): readonly ChatLine[] {
	return room === SYSTEM_ROOM ? SYSTEM_LINES : GLOBAL_LINES;
}

/** Quiénes están conectados a esa sala. */
export function chatMembers(room: ChatRoom): readonly ChatMember[] {
	return room === SYSTEM_ROOM ? SYSTEM_MEMBERS : GLOBAL_MEMBERS;
}
