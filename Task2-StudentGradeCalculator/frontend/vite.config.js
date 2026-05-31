import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file for the current mode so we can read VITE_* vars in config
  const env = loadEnv(mode, process.cwd(), '');

  const devBackend = env.VITE_API_URL || 'http://localhost:8080';

  return {
    plugins: [react()],

    // ── Development proxy ──────────────────────────────────────────────────
    // Forwards /api/* → Spring Boot backend, avoiding CORS issues in dev.
    // In production the frontend is served from a static host and calls the
    // backend directly via the absolute VITE_API_URL.
    server: {
      proxy: {
        '/api': {
          target: devBackend,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path, // keep /api prefix — backend expects it
        },
      },
    },

    // ── Production build optimisations ────────────────────────────────────
    build: {
      // Raise the warning threshold to 600 kB (framer-motion is large)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Vite 8 (Rolldown) requires manualChunks as a function
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
          },
        },
      },
      // Generate source maps for production debugging (can disable if private)
      sourcemap: false,
    },
  };
});
