import { defineConfig } from '@playwright/test';
import { E2E_DATABASE } from './e2e/preparar';

export default defineConfig({
	// La base la rehace `npm run test:e2e` antes de llegar acá: el servidor la abre
	// al arrancar y la deja tomada, así que no se puede borrar desde adentro.
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		// La suya, no la de desarrollo.
		env: { DATABASE_URL: E2E_DATABASE }
	},
	testMatch: '**/*.e2e.{ts,js}'
});
