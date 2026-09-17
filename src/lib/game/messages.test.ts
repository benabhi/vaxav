/** Los límites de un mensaje: qué se puede escribir y qué se recorta. */

import { describe, expect, it } from 'vitest';
import { BODY_MAX, SUBJECT_MAX, messageProblem, trimBody, trimSubject } from './messages';

describe('qué se puede mandar', () => {
	it('sin cuerpo no hay mensaje, con o sin asunto', () => {
		// Un mensaje vacío sólo le enciende el aviso al otro para que abra una hoja
		// en blanco.
		expect(messageProblem('Hola', '')).not.toBe('');
		expect(messageProblem('Hola', '   \n  ')).not.toBe('');
		expect(messageProblem('', 'Algo que decir')).toBe('');
	});

	it('el asunto puede ir vacío y el cuerpo no', () => {
		// La bandeja lo muestra como «Sin asunto», que sigue siendo un mensaje.
		expect(messageProblem('', 'Che.')).toBe('');
	});

	it('pone techo a los dos', () => {
		expect(messageProblem('a'.repeat(SUBJECT_MAX + 1), 'Cuerpo.')).not.toBe('');
		expect(messageProblem('Asunto', 'a'.repeat(BODY_MAX + 1))).not.toBe('');
	});
});

describe('cómo se guarda', () => {
	it('recorta los espacios de las puntas y respeta el techo', () => {
		expect(trimSubject('  Carga  ')).toBe('Carga');
		expect(trimBody('  Hola\n\nChau  ')).toBe('Hola\n\nChau');
		expect(trimSubject('a'.repeat(SUBJECT_MAX + 50))).toHaveLength(SUBJECT_MAX);
		expect(trimBody('a'.repeat(BODY_MAX + 50))).toHaveLength(BODY_MAX);
	});

	it('deja los renglones de adentro como los escribieron', () => {
		// La pantalla los dibuja con `whitespace-pre-wrap`: un mensaje con párrafos
		// tiene que leerse como lo escribieron y no como un bloque corrido.
		expect(trimBody('Uno\n\nDos\nTres')).toBe('Uno\n\nDos\nTres');
	});
});
