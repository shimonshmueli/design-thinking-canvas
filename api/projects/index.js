"use strict";
const { withHandler } = require("../_util.js");
const logic = require("../../lib/logic.js");

module.exports = withHandler(async (req, res, pool, body) => {
  if (req.method === "POST") {
    const { title } = body;
    const result = await logic.createProject(pool, { title });
    res.status(201).json(result);
    return;
  }
  if (req.method === "GET") {
    const code = (req.query.code || "").toString();
    if (!code) {
      res.status(400).json({ error: "?code= is required" });
      return;
    }
    const project = await logic.getProjectByJoinCode(pool, code);
    res.status(200).json({ projectId: project.id });
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
});
