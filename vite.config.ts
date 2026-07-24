import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves project sites from a subpath (e.g. /my-repo/), not the
// domain root. The deploy workflow provides that subpath via GITHUB_PAGES_BASE;
// locally we fall back to "/".
const base = process.env.GITHUB_PAGES_BASE || "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    // Honor a harness/CI-assigned port when present.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
