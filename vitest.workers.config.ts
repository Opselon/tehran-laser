import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

// Integration tests run inside workerd with a real local D1 (bindings from wrangler.jsonc).
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        compatibilityFlags: ['nodejs_compat'],
      },
    }),
  ],
  test: {
    include: ['tests/integration/**/*.test.ts'],
  },
});
