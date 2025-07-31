import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/server": {
        target: "https://n8nwn765-5000.inc1.devtunnels.ms/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, ""),
      },
    },
  },
});
