import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves project sites from a subpath (e.g. /my-repo/), not the
// domain root. The deploy workflow provides that subpath via GITHUB_PAGES_BASE;
// locally we fall back to "/".
const base = process.env.GITHUB_PAGES_BASE || "/";

export default defineConfig(({ mode }) => {
  // Load every env var in .env (not just VITE_-prefixed ones). The Whereby API
  // key is deliberately NOT exposed to the client — it stays in the dev server.
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.WHEREBY_API_KEY;

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      // Honor a harness/CI-assigned port when present.
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
      // Proxy Whereby REST API calls through the dev server so the secret key
      // never touches the browser and CORS is a non-issue (server-to-server).
      // The client calls same-origin `/api/whereby/...`; we strip that prefix
      // and attach the Authorization header here.
      proxy: {
        "/api/whereby": {
          target: "https://api.whereby.dev",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/whereby/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (apiKey) {
                proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
              }
            });
          },
        },
      },
    },
  };
});
