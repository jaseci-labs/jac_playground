import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',

  server: {
    host: "::",
    port: 8000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },

    // Explicit middleware ensures full coverage:
    configureMiddleware: (server: any) => {
      server.middlewares.use((req: any, res: any, next: any) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
      });
    },

  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),

    {
      name: 'custom-cors-headers',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          next();
        });
      },
    },


  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ['**/*.wasm']
}));
