import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://52.79.113.104:8443",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
