import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const origin = new URL(env.VITE_API_ORIGIN || 'https://api.lnurepo.info');
  if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password
      || !['http:', 'https:'].includes(origin.protocol) || (command === 'build' && origin.protocol !== 'https:')) {
    throw new Error('Invalid API origin');
  }
  return {
    plugins: [react(), tailwindcss(), {
      name: 'production-csp',
      transformIndexHtml(html) {
        // Vite injects scripts/styles in development; the restrictive CSP is for compiled assets.
        if (command !== 'build') return html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
        return html.replaceAll('https://api.lnurepo.info', origin.origin);
      },
    }],
    build: { sourcemap: false },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.js'] },
  };
});
