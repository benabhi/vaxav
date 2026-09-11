/**
 * El humo: que todas las rutas existan y que el Neocom no lleve a ningún lado
 * muerto.
 *
 * No comprueba qué dibuja cada pantalla —para eso están los tests de unidad y la
 * comparación contra el original— sino lo que ninguno de esos puede ver: que la
 * aplicación entera se levanta, que cada ruta declarada tiene su página y que
 * los enlaces del marco llevan a alguna parte.
 *
 * Es el que atrapa la clase de error que no rompe nada hasta que alguien hace
 * clic: una pestaña declarada en el árbol de navegación y sin archivo de ruta.
 */

import { expect, test, type Page } from '@playwright/test';
import { PILOTO } from './preparar';
import { TABS } from '../src/lib/navigation';
import { INDEX_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from '../src/lib/routes';

const PUBLICAS = [INDEX_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE];
const DEL_JUEGO = TABS.map((tab) => tab.route);

/** Entra con el piloto del humo y deja la sesión abierta en esa pestaña. */
async function entrar(page: Page): Promise<void> {
	await page.goto(LOGIN_ROUTE);
	await page.getByLabel('Distintivo').fill(PILOTO.callsign);
	await page.getByLabel('Contraseña').fill(PILOTO.password);
	await page.getByRole('button', { name: 'Entrar' }).click();
	await page.waitForURL('**/piloto');
}

test.describe('las rutas públicas', () => {
	for (const ruta of PUBLICAS) {
		test(`${ruta} responde`, async ({ page }) => {
			const respuesta = await page.goto(ruta);
			expect(respuesta?.status()).toBe(200);
			await expect(page).toHaveTitle(/Vaxav/);
		});
	}
});

test.describe('las rutas del juego', () => {
	test('sin sesión mandan a entrar, y no a un error', async ({ page }) => {
		const respuesta = await page.goto(DEL_JUEGO[0]);
		expect(respuesta?.status()).toBe(200);
		expect(new URL(page.url()).pathname).toBe(LOGIN_ROUTE);
	});

	test('con sesión, las 20 existen y ninguna es un 404', async ({ page }) => {
		await entrar(page);

		for (const ruta of DEL_JUEGO) {
			const respuesta = await page.goto(ruta);
			expect(respuesta?.status(), `${ruta} tendría que responder 200`).toBe(200);
			// El marco del juego se dibuja en toda pantalla de adentro: si está, la
			// ruta existe de verdad y no cayó en la página de error.
			await expect(page.getByRole('navigation'), `${ruta} no dibujó el Neocom`).toBeVisible();
			await expect(page).toHaveTitle(/Vaxav/);
		}
	});
});

test('ninguna entrada del Neocom lleva a un 404', async ({ page }) => {
	await entrar(page);

	const enlaces = await page
		.getByRole('navigation')
		.getByRole('link')
		.evaluateAll((nodos) => nodos.map((nodo) => (nodo as HTMLAnchorElement).pathname));

	expect(enlaces.length, 'el Neocom tendría que tener enlaces').toBeGreaterThan(0);

	for (const ruta of new Set(enlaces)) {
		const respuesta = await page.goto(ruta);
		expect(respuesta?.status(), `${ruta} está en el Neocom y no responde`).toBe(200);
	}
});
