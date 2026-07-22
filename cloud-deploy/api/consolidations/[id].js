"use strict";
const { withHandler } = require("../_util.js");
const logic = require("../../lib/logic.js");

// body.action = "approve" | "reject". projectId is required in the body since consolidation
// IDs alone don't disambiguate which project's auth rules apply.
module.exports = withHandler(async (req, res, pool, body) => {
  const { id } = req.query;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { projectId, action, memberId, secret } = body;
  if (!projectId) {
    res.status(400).json({ error: "projectId is required" });
    return;
  }
  if (action === "approve") {
    const draft = await logic.approveConsolidation(pool, projectId, id, { memberId, secret });
    res.status(200).json(draft);
    return;
  }
  if (action === "reject") {
    const draft = await logic.rejectConsolidation(pool, projectId, id, { memberId, secret });
    res.status(200).json(draft);
    return;
  }
  res.status(400).json({ error: `Unknown action: ${action}` });
});
