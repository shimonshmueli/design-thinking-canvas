"use strict";
const { withHandler } = require("../../_util.js");
const logic = require("../../../lib/logic.js");

module.exports = withHandler(async (req, res, pool, body) => {
  const { id } = req.query;
  if (req.method === "POST") {
    // Creating and joining are the same operation server-side: the first member of a
    // project becomes its leader, everyone after joins as a member.
    const { name, about } = body;
    const result = await logic.createOrJoinTeam(pool, id, name, about);
    res.status(201).json(result);
    return;
  }
  if (req.method === "PATCH") {
    const { memberId, secret, approvalRule } = body;
    await logic.setApprovalRule(pool, id, memberId, secret, approvalRule);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
});
