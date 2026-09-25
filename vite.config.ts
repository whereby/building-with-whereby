import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load every env var in .env (not just VITE_-prefixed ones). The Whereby API
  // key is deliberately NOT exposed to the client — it stays in the dev server.
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.WHEREBY_API_KEY;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Honor a harness/CI-assigned port when present.
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
      // Local-dev equivalent of the Netlify function: proxy Whereby REST API
      // calls through the dev server so the secret key never touches the browser
      // and CORS is a non-issue (server-to-server). The client calls same-origin
      // `/api/whereby/...`; we strip that prefix and attach the auth header here.
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
