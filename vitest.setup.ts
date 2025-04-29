import { vi } from 'vitest';

// Resetear los módulos antes de cada test para evitar problemas con la caché
beforeEach(() => {
  vi.resetModules();
});

// Limpiar todos los mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
});
