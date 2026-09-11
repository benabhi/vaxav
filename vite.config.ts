import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Runas en todo el proyecto, salvo las dependencias. Se puede sacar en Svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Un solo proceso Node sirve la aplicación y la base SQLite que tiene al lado.
			adapter: adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			// Los componentes se prueban en un navegador de verdad: lo que se verifica
			// de una interfaz es lo que dibuja, y eso no se puede simular.
			{
				extends: './vite.config.ts',
				test: {
					name: 'interfaz',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			// Las reglas del juego y la capa de datos no necesitan navegador: son
			// funciones puras y consultas, y corren en Node en una fracción del tiempo.
			{
				extends: './vite.config.ts',
				test: {
					name: 'servidor',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
