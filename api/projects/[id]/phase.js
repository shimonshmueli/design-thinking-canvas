"use strict";
const { withHandler } = require("../../_util.js");
const logic = require("../../../lib/logic.js");

// One endpoint for all per-phase team actions, distinguished by body.action — keeps the
// route tree flat. Body always includes { phase, memberId, secret, ... }.
module.exports = withHandler(async (req, res, pool, body) => {
  const { id } = req.query;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { phase, action, memberId, secret } = body;

  if (action === "ready") {
    await logic.setReady(pool, id, phase, memberId, secret, body.ready !== false);
    res.status(200).json({ ok: true });
    return;
  }
  if (action === "consolidate") {
    const draft = await logic.createConsolidationDraft(pool, id, {
      phase,
      memberId,
      secret,
      text: body.text,
      sourceEntryIds: body.sourceEntryIds,
    });
    res.status(201).json(draft);
    return;
  }
  if (action === "reopen") {
    await logic.reopenPhase(pool, id, phase, { memberId, secret });
    res.status(200).json({ ok: true });
    return;
  }
  res.status(400).json({ error: `Unknown action: ${action}` });
});
