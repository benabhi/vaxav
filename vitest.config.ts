import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    cache: false, // Desactivar la caché por defecto
    clearMocks: true, // Limpiar mocks automáticamente
    restoreMocks: true, // Restaurar mocks automáticamente
    mockReset: true, // Resetear mocks automáticamente
    deps: {
      inline: ['vue', '@vue', '@vueuse'], // Incluir dependencias importantes
    },
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
