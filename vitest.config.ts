import { defineConfig } from 'vitest/config';

// Pure domain/unit tests: no Workers runtime required.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
