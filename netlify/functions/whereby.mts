// Netlify serverless function (Functions v2) that stands in for the Vite dev
// proxy in production. It forwards `/api/whereby/*` to the Whereby REST API with
// the secret key attached server-side, so the browser never sees the key and
// CORS is a non-issue (this runs on the server, not in the page).
//
// Set WHEREBY_API_KEY in Netlify → Site settings → Environment variables.

export const config = { path: "/api/whereby/*" };

export default async (req: Request): Promise<Response> => {
  const apiKey = process.env.WHEREBY_API_KEY;
  if (!apiKey) {
    return json(500, { error: "WHEREBY_API_KEY is not configured on the server." });
  }

  const url = new URL(req.url);
  const upstreamPath = url.pathname.replace(/^\/api\/whereby/, "");
  const target = `https://api.whereby.dev${upstreamPath}${url.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
};

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
