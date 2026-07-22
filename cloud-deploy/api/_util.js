// Shared HTTP plumbing for the /api handlers. Filename starts with "_" so Vercel excludes it
// from routing.
"use strict";

const { ensureSchema } = require("./_pool.js");

/** Wraps a handler with CORS, JSON body parsing safety, schema bootstrap, and uniform error
 *  mapping from logic.js's httpError()-style thrown errors to HTTP responses. */
function withHandler(fn) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    try {
      const pool = await ensureSchema();
      let body = req.body;
      if (typeof body === "string" && body) {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      await fn(req, res, pool, body || {});
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(err);
      res.status(status).json({ error: err.message || "Server error" });
    }
  };
}

module.exports = { withHandler };
