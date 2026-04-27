/**
 * @typedef {Object} Env
 * @property {D1Database} DB - D1 database binding
 */

const ALLOWED_ORIGINS = [
  "https://kreed.top",
  "https://www.kreed.top",
  "http://localhost:8788",
  "http://localhost:3000",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {Request} request
 * @returns {Record<string, string>}
 */
function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * @param {unknown} data
 * @param {number} status
 * @param {Record<string, string>} headers
 * @returns {Response}
 */
function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // POST /api/waitlist - join waitlist
    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.email || typeof body.email !== "string") {
          return jsonResponse({ error: "Email is required" }, 400, cors);
        }

        const email = body.email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(email)) {
          return jsonResponse({ error: "Invalid email format" }, 400, cors);
        }

        if (email.length > 254) {
          return jsonResponse({ error: "Email is too long" }, 400, cors);
        }

        // Check for duplicate
        const existing = await env.DB.prepare(
          "SELECT id FROM waitlist WHERE email = ?"
        ).bind(email).first();

        if (existing) {
          return jsonResponse(
            { message: "You are already on the waitlist!", already_registered: true },
            200,
            cors
          );
        }

        // Insert new entry
        await env.DB.prepare(
          "INSERT INTO waitlist (email, source) VALUES (?, ?)"
        ).bind(email, "website").run();

        return jsonResponse(
          {
            message: "Welcome aboard! You are on the waitlist.",
            success: true,
          },
          201,
          cors
        );
      } catch (err) {
        // Handle D1 UNIQUE constraint violation as fallback
        if (err instanceof Error && err.message.includes("UNIQUE constraint")) {
          return jsonResponse(
            { message: "You are already on the waitlist!", already_registered: true },
            200,
            cors
          );
        }
        return jsonResponse({ error: "Internal server error" }, 500, cors);
      }
    }

    // GET /api/waitlist/count - public count endpoint
    if (url.pathname === "/api/waitlist/count" && request.method === "GET") {
      try {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM waitlist"
        ).first();

        return jsonResponse(
          { count: result?.count ?? 0 },
          200,
          cors
        );
      } catch {
        return jsonResponse({ count: 0 }, 200, cors);
      }
    }

    // Health check
    if (url.pathname === "/health") {
      return jsonResponse({ status: "ok" }, 200, cors);
    }

    return jsonResponse({ error: "Not found" }, 404, cors);
  },
};
