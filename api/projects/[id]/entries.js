"use strict";
const { withHandler } = require("../../_util.js");
const logic = require("../../../lib/logic.js");

module.exports = withHandler(async (req, res, pool, body) => {
  const { id } = req.query;
  if (req.method === "POST") {
    const { phase, toolSlug, memberId, secret, text } = body;
    const entry = await logic.addEntry(pool, id, { phase, toolSlug, memberId, secret, text });
    res.status(201).json(entry);
    return;
  }
  if (req.method === "PATCH") {
    const { entryId, memberId, secret, text } = body;
    const entry = await logic.updateEntry(pool, id, entryId, { memberId, secret, text });
    res.status(200).json(entry);
    return;
  }
  if (req.method === "DELETE") {
    const { entryId, memberId, secret } = body;
    await logic.deleteEntry(pool, id, entryId, { memberId, secret });
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
});
