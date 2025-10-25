import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend local primero
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Local backend not available, trying Vercel backend...', err.message);
            // Fallback a Vercel si el backend local no está disponible
            proxy.target = 'https://datapray-4pjz6ix0v-portunos-projects.vercel.app';
            proxy.secure = true;
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Sending Request to:', proxy.target, req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ["@grpc/grpc-js", "@google-cloud/datastore", "@google-cloud/aiplatform"],
  },
  build: {
    rollupOptions: {
      external: ["@grpc/grpc-js"],
    },
  },
}));
