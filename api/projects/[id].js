"use strict";
const { withHandler } = require("../_util.js");
const logic = require("../../lib/logic.js");

module.exports = withHandler(async (req, res, pool, body) => {
  const { id } = req.query;
  if (req.method === "GET") {
    const state = await logic.getProjectState(pool, id);
    res.status(200).json(state);
    return;
  }
  if (req.method === "PATCH") {
    await logic.updateProjectFields(pool, id, body);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
});
