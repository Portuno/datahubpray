import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
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
=======
>>>>>>> 5c79fa54d47280cfad079b9a8826cee90df3f243
}));
