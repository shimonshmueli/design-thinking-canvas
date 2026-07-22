// Shared Postgres connection pool + one-time schema bootstrap.
// Filename starts with "_" so Vercel excludes it from routing.
"use strict";

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

let pool;
let migrated;

function connectionString() {
  // Neon (via `vercel install neon`) sets POSTGRES_URL. Some integrations use DATABASE_URL instead.
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
}

function getPool() {
  if (!pool) {
    const cs = connectionString();
    if (!cs) {
      throw Object.assign(
        new Error(
          "No database connected yet. Run `vercel link` then `vercel install neon` from your project folder, then reload."
        ),
        { status: 503 }
      );
    }
    pool = new Pool({ connectionString: cs, ssl: cs.includes("localhost") ? false : { rejectUnauthorized: false } });
  }
  return pool;
}

/** Runs schema.sql once per cold start (every statement is idempotent, so repeats are harmless
 *  across multiple serverless instances — no separate migration step required from the user). */
async function ensureSchema() {
  if (!migrated) {
    const p = getPool();
    const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
    migrated = p.query(sql).catch((err) => {
      migrated = null; // allow retry on the next request if this failed
      throw err;
    });
  }
  await migrated;
  return getPool();
}

module.exports = { getPool, ensureSchema };
