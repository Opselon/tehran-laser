import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

// Integration tests run inside workerd with a real local D1 (bindings from wrangler.jsonc).
export default defineWorkersConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
  },
});
