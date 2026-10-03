import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// Canonical origin can be provided at build time (SITE_URL=https://example.com).
// At runtime canonical URLs prefer the public `site_url` setting, then SITE_URL,
// then the request origin — see src/lib/seo/canonical.ts.
export default defineConfig({
  site: process.env.SITE_URL,
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  // Sessions are handled by our own D1-backed session store (src/server/auth),
  // so the built-in KV session machinery is disabled entirely.
  session: false,
  integrations: [react()],
  server: { port: 4321, host: false },
  security: { checkOrigin: true },
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
