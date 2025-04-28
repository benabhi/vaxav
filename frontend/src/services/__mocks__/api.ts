import { vi } from 'vitest';

export default {
  defaults: {
    headers: {
      common: {}
    }
  },
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};
