// Este archivo configura el entorno de prueba para Storybook con Vitest
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender los matchers de Vitest con los de Testing Library
expect.extend(matchers);

// Limpiar después de cada prueba
afterEach(() => {
  cleanup();
});
