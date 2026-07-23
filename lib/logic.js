// Business logic for the team-collaboration backend.
// Every function takes `pool` first: an object exposing `pool.query(text, params) -> { rows }`,
// the standard node-postgres interface. This keeps the logic identical whether it runs against
// a real Postgres (production, via the `pg` package) or an in-memory emulator (tests, via pg-mem) —
// see test/logic.test.js.
//
// Design principles carried over from the local prototype (see store.js in the main app):
//   - Entries are append-only and attributed; nobody edits or deletes anyone else's entry.
//   - The LLM never finalizes anything — createConsolidationDraft only ever produces a *draft*.
//   - A draft becomes a real entry only once the project's own approval rule is satisfied
//     (one leader approval, or every member individually approving under consensus).

"use strict";

const crypto = require("crypto");

const PHASES = ["discover", "define", "ideate", "make", "evaluate", "develop", "reflect"];
const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids visual ambiguity when shared aloud/handwritten

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function genSecret() {
  return crypto.randomBytes(24).toString("hex");
}

function genJoinCode() {
  let code = "";
  for (let i = 0; i < 6; i++) code += JOIN_CODE_CHARS[crypto.randomInt(JOIN_CODE_CHARS.length)];
  return code;
}

function assertPhase(phase) {
  if (!PHASES.includes(phase)) throw httpError(400, `Unknown phase: ${phase}`);
}

/* ---------------- projects ---------------- */

async function createProject(pool, { title }) {
  const t = (title || "").trim() || "Untitled Project";
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = genJoinCode();
    try {
      const { rows } = await pool.query(
        `INSERT INTO projects (title, join_code) VALUES ($1, $2) RETURNING id, join_code`,
        [t, joinCode]
      );
      return { projectId: rows[0].id, joinCode: rows[0].join_code };
    } catch (err) {
      if (attempt === 4) throw err; // extremely unlikely: 5 collisions in a row
    }
  }
}

async function getProject(pool, projectId) {
  const { rows } = await pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
  if (!rows[0]) throw httpError(404, "Project not found");
  return rows[0];
}

async function getProjectByJoinCode(pool, joinCode) {
  const { rows } = await pool.query(`SELECT * FROM projects WHERE join_code = $1`, [joinCode.toUpperCase()]);
  if (!rows[0]) throw httpError(404, "No project found for that code");
  return rows[0];
}

const PROJECT_PATCH_FIELDS = {
  title: "title",
  challenge: "challenge",
  foundations: "foundations",
  selection: "selection",
  brief: "brief",
  evalPlan: "eval_plan",
};

/** Whitelisted, last-write-wins patch of the project's shared scalar fields. */
async function updateProjectFields(pool, projectId, patch) {
  const sets = [];
  const params = [projectId];
  Object.entries(patch || {}).forEach(([key, value]) => {
    const col = PROJECT_PATCH_FIELDS[key];
    if (!col) return;
    params.push(typeof value === "object" ? JSON.stringify(value) : value);
    sets.push(`${col} = $${params.length}`);
  });
  if (!sets.length) return;
  await pool.query(`UPDATE projects SET ${sets.join(", ")}, updated_at = now() WHERE id = $1`, params);
}

/* ---------------- members ---------------- */

async function verifyMember(pool, projectId, memberId, secret) {
  if (!memberId || !secret) return null;
  const { rows } = await pool.query(`SELECT * FROM members WHERE id = $1 AND project_id = $2 AND secret = $3`, [
    memberId,
    projectId,
    secret,
  ]);
  return rows[0] || null;
}

async function requireMember(pool, projectId, memberId, secret) {
  const member = await verifyMember(pool, projectId, memberId, secret);
  if (!member) throw httpError(403, "Not a recognized member of this project");
  return member;
}

async function listMembers(pool, projectId) {
  const { rows } = await pool.query(
    `SELECT id, name, about, role FROM members WHERE project_id = $1 ORDER BY created_at`,
    [projectId]
  );
  return rows;
}

/** First member of a project becomes its leader; everyone after joins as a member.
 *  `about` is a short self-description (inherited from the person's Settings) shown to
 *  teammates as a hover hint — optional. */
async function createOrJoinTeam(pool, projectId, name, about) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw httpError(400, "Name is required");
  const aboutTrimmed = (about || "").trim();
  const existing = await listMembers(pool, projectId);
  const role = existing.length === 0 ? "leader" : "member";
  const secret = genSecret();
  const { rows } = await pool.query(
    `INSERT INTO members (project_id, name, about, role, secret) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, about, role`,
    [projectId, trimmed, aboutTrimmed, role, secret]
  );
  return { member: rows[0], secret };
}

async function setApprovalRule(pool, projectId, memberId, secret, rule) {
  const member = await requireMember(pool, projectId, memberId, secret);
  if (member.role !== "leader") throw httpError(403, "Only the team leader can change the approval rule");
  if (!["leader", "consensus"].includes(rule)) throw httpError(400, "Invalid approval rule");
  await pool.query(`UPDATE projects SET approval_rule = $2, updated_at = now() WHERE id = $1`, [projectId, rule]);
}

/* ---------------- entries (stage cards + tool-worksheet entries) ---------------- */

async function addEntry(pool, projectId, { phase, toolSlug, memberId, secret, text }) {
  assertPhase(phase);
  const trimmed = (text || "").trim();
  if (!trimmed) throw httpError(400, "Entry text is required");
  let authorName = "";
  if (memberId) {
    const member = await requireMember(pool, projectId, memberId, secret);
    authorName = member.name;
  }
  const { rows } = await pool.query(
    `INSERT INTO entries (project_id, phase, tool_slug, member_id, author_name, text)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [projectId, phase, toolSlug || null, memberId || null, authorName, trimmed]
  );
  return rows[0];
}

async function updateEntry(pool, projectId, entryId, { memberId, secret, text }) {
  const { rows: existingRows } = await pool.query(`SELECT * FROM entries WHERE id = $1 AND project_id = $2`, [
    entryId,
    projectId,
  ]);
  const entry = existingRows[0];
  if (!entry) throw httpError(404, "Entry not found");
  if (entry.member_id) {
    const member = await requireMember(pool, projectId, memberId, secret);
    if (member.id !== entry.member_id) throw httpError(403, "You can only edit your own entries");
  }
  const trimmed = (text || "").trim();
  if (!trimmed) throw httpError(400, "Entry text is required");
  const { rows } = await pool.query(`UPDATE entries SET text = $3 WHERE id = $1 AND project_id = $2 RETURNING *`, [
    entryId,
    projectId,
    trimmed,
  ]);
  return rows[0];
}

/** Only the entry's author, or the team leader, may delete it. An unattributed entry
 *  (no author on record) may be deleted by any recognized member, but — once the project
 *  has members at all — a valid member credential is still required. */
async function deleteEntry(pool, projectId, entryId, { memberId, secret }) {
  const { rows: existingRows } = await pool.query(`SELECT * FROM entries WHERE id = $1 AND project_id = $2`, [
    entryId,
    projectId,
  ]);
  const entry = existingRows[0];
  if (!entry) throw httpError(404, "Entry not found");

  const members = await listMembers(pool, projectId);
  if (members.length > 0) {
    const member = await requireMember(pool, projectId, memberId, secret);
    if (entry.member_id && member.id !== entry.member_id && member.role !== "leader") {
      throw httpError(403, "You can only delete your own entries (or, as leader, anyone's)");
    }
  }
  await pool.query(`DELETE FROM entries WHERE id = $1 AND project_id = $2`, [entryId, projectId]);
}

/* ---------------- phase status + readiness ---------------- */

async function ensurePhaseStatusRow(pool, projectId, phase) {
  await pool.query(
    `INSERT INTO phase_status (project_id, phase) VALUES ($1, $2)
     ON CONFLICT (project_id, phase) DO NOTHING`,
    [projectId, phase]
  );
}

async function getPhaseStatus(pool, projectId, phase) {
  const { rows } = await pool.query(`SELECT status FROM phase_status WHERE project_id = $1 AND phase = $2`, [
    projectId,
    phase,
  ]);
  return rows[0]?.status || "collecting";
}

async function setPhaseStatus(pool, projectId, phase, status) {
  await ensurePhaseStatusRow(pool, projectId, phase);
  await pool.query(`UPDATE phase_status SET status = $3 WHERE project_id = $1 AND phase = $2`, [
    projectId,
    phase,
    status,
  ]);
}

async function setReady(pool, projectId, phase, memberId, secret, ready) {
  assertPhase(phase);
  const member = await requireMember(pool, projectId, memberId, secret);
  if (ready) {
    await pool.query(
      `INSERT INTO readiness (project_id, phase, member_id, ready) VALUES ($1, $2, $3, true)
       ON CONFLICT (project_id, phase, member_id) DO UPDATE SET ready = true`,
      [projectId, phase, member.id]
    );
  } else {
    await pool.query(`DELETE FROM readiness WHERE project_id = $1 AND phase = $2 AND member_id = $3`, [
      projectId,
      phase,
      member.id,
    ]);
  }
}

async function allReady(pool, projectId, phase) {
  const members = await listMembers(pool, projectId);
  if (!members.length) return false;
  const { rows } = await pool.query(`SELECT member_id FROM readiness WHERE project_id = $1 AND phase = $2 AND ready = true`, [
    projectId,
    phase,
  ]);
  const readySet = new Set(rows.map((r) => r.member_id));
  return members.every((m) => readySet.has(m.id));
}

async function canConsolidate(pool, projectId, phase, member, approvalRule) {
  if (approvalRule === "leader") return member.role === "leader";
  return allReady(pool, projectId, phase);
}

/* ---------------- consolidation drafts ---------------- */

async function createConsolidationDraft(pool, projectId, { phase, memberId, secret, text, sourceEntryIds }) {
  assertPhase(phase);
  const project = await getProject(pool, projectId);
  const member = await requireMember(pool, projectId, memberId, secret);
  const allowed = await canConsolidate(pool, projectId, phase, member, project.approval_rule);
  if (!allowed) throw httpError(403, "Consolidation isn't allowed yet under this team's approval rule");
  const trimmed = (text || "").trim();
  if (!trimmed) throw httpError(400, "Draft text is required");
  const { rows } = await pool.query(
    `INSERT INTO consolidations (project_id, phase, text, source_entry_ids, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [projectId, phase, trimmed, JSON.stringify(sourceEntryIds || []), member.id]
  );
  await setPhaseStatus(pool, projectId, phase, "consolidating");
  return rows[0];
}

async function getConsolidation(pool, projectId, consolidationId) {
  const { rows } = await pool.query(`SELECT * FROM consolidations WHERE id = $1 AND project_id = $2`, [
    consolidationId,
    projectId,
  ]);
  if (!rows[0]) throw httpError(404, "Draft not found");
  return rows[0];
}

/** Record one member's approval. If the team's rule is now satisfied, finalize: insert the
 *  attributed "Team (consolidated)" entry, mark the draft approved, and lock the phase. */
async function approveConsolidation(pool, projectId, consolidationId, { memberId, secret }) {
  const project = await getProject(pool, projectId);
  const member = await requireMember(pool, projectId, memberId, secret);
  const draft = await getConsolidation(pool, projectId, consolidationId);
  if (draft.status !== "draft") return draft;

  const canApprove = project.approval_rule === "leader" ? member.role === "leader" : true;
  if (!canApprove) throw httpError(403, "You can't approve under this team's approval rule");

  const approvals = new Set(draft.approvals || []);
  approvals.add(member.id);
  const approvalsArr = [...approvals];

  const members = await listMembers(pool, projectId);
  const satisfied =
    project.approval_rule === "leader"
      ? approvalsArr.some((id) => members.find((m) => m.id === id && m.role === "leader"))
      : members.every((m) => approvalsArr.includes(m.id));

  if (!satisfied) {
    const { rows } = await pool.query(`UPDATE consolidations SET approvals = $2 WHERE id = $1 RETURNING *`, [
      consolidationId,
      JSON.stringify(approvalsArr),
    ]);
    return rows[0];
  }

  const { rows } = await pool.query(
    `UPDATE consolidations SET approvals = $2, status = 'approved' WHERE id = $1 RETURNING *`,
    [consolidationId, JSON.stringify(approvalsArr)]
  );
  await pool.query(
    `INSERT INTO entries (project_id, phase, member_id, author_name, text) VALUES ($1, $2, $3, $4, $5)`,
    [projectId, draft.phase, draft.created_by, "Team (consolidated)", draft.text]
  );
  await setPhaseStatus(pool, projectId, draft.phase, "locked");
  return rows[0];
}

async function rejectConsolidation(pool, projectId, consolidationId, { memberId, secret }) {
  const project = await getProject(pool, projectId);
  const member = await requireMember(pool, projectId, memberId, secret);
  const draft = await getConsolidation(pool, projectId, consolidationId);
  if (draft.status !== "draft") return draft;

  const canReject = project.approval_rule === "leader" ? member.role === "leader" : true;
  if (!canReject) throw httpError(403, "You can't reject under this team's approval rule");

  const { rows } = await pool.query(`UPDATE consolidations SET status = 'rejected' WHERE id = $1 RETURNING *`, [
    consolidationId,
  ]);
  await setPhaseStatus(pool, projectId, draft.phase, "collecting");
  return rows[0];
}

async function reopenPhase(pool, projectId, phase, { memberId, secret }) {
  assertPhase(phase);
  const member = await requireMember(pool, projectId, memberId, secret);
  if (member.role !== "leader") throw httpError(403, "Only the team leader can reopen a phase");
  await setPhaseStatus(pool, projectId, phase, "collecting");
}

/* ---------------- full aggregated state (for GET /api/projects/:id) ---------------- */

async function getProjectState(pool, projectId) {
  const project = await getProject(pool, projectId);
  const members = await listMembers(pool, projectId);

  const { rows: entryRows } = await pool.query(
    `SELECT id, phase, tool_slug, member_id, author_name, text, created_at FROM entries
     WHERE project_id = $1 ORDER BY created_at`,
    [projectId]
  );

  const cards = Object.fromEntries(PHASES.map((p) => [p, []]));
  const tools = {};
  entryRows.forEach((e) => {
    const card = { id: e.id, text: e.text, created: e.created_at, authorId: e.member_id, authorName: e.author_name };
    if (e.tool_slug) {
      if (!tools[e.tool_slug]) tools[e.tool_slug] = { phase: e.phase, cards: [] };
      tools[e.tool_slug].cards.push(card);
    } else {
      cards[e.phase].push(card);
    }
  });

  const { rows: statusRows } = await pool.query(`SELECT phase, status FROM phase_status WHERE project_id = $1`, [
    projectId,
  ]);
  const phaseStatus = Object.fromEntries(PHASES.map((p) => [p, { status: "collecting", readiness: {} }]));
  statusRows.forEach((r) => (phaseStatus[r.phase].status = r.status));

  const { rows: readyRows } = await pool.query(`SELECT phase, member_id, ready FROM readiness WHERE project_id = $1`, [
    projectId,
  ]);
  readyRows.forEach((r) => {
    if (r.ready) phaseStatus[r.phase].readiness[r.member_id] = true;
  });

  const { rows: consolidationRows } = await pool.query(
    `SELECT * FROM consolidations WHERE project_id = $1 ORDER BY created_at`,
    [projectId]
  );
  const consolidations = Object.fromEntries(PHASES.map((p) => [p, []]));
  consolidationRows.forEach((c) => consolidations[c.phase].push(c));

  return {
    id: project.id,
    joinCode: project.join_code,
    title: project.title,
    challenge: project.challenge,
    foundations: project.foundations,
    selection: project.selection,
    brief: project.brief,
    evalPlan: project.eval_plan,
    team: { members, settings: { approvalRule: project.approval_rule } },
    cards,
    tools,
    phaseStatus,
    consolidations,
    updatedAt: project.updated_at,
  };
}

module.exports = {
  PHASES,
  httpError,
  createProject,
  getProject,
  getProjectByJoinCode,
  updateProjectFields,
  verifyMember,
  requireMember,
  listMembers,
  createOrJoinTeam,
  setApprovalRule,
  addEntry,
  updateEntry,
  deleteEntry,
  setReady,
  allReady,
  canConsolidate,
  createConsolidationDraft,
  getConsolidation,
  approveConsolidation,
  rejectConsolidation,
  reopenPhase,
  getProjectState,
};
