// Shared canvas state for all pages (dashboard, stage pages, tool worksheets).
// Load this before app.js / stage.js / tool.js.

const STORAGE_KEY = "design-thinking-canvas-v2"; // legacy single-canvas key (migrated on first load)
const LEGACY_KEY = "design-thinking-canvas-v1";
const DEFAULT_TITLE = "Untitled Project";

// Multi-canvas layout: a user can hold several independent canvases (one per team they're on,
// plus any solo ones). An index lists them; each canvas's full state lives under its own key.
const CANVAS_INDEX_KEY = "dtc-canvas-index";
const ACTIVE_CANVAS_KEY = "dtc-active-canvas";
const CANVAS_PREFIX = "dtc-canvas-";

const PHASES = ["discover", "define", "ideate", "make", "evaluate", "develop", "reflect"];

/** True when the project still needs a real, user-chosen title — used to gate the
 *  dashboard (blocking modal) and every other page (redirect back to the dashboard). */
function needsProjectTitle(state) {
  const title = ((state && state.title) || "").trim();
  return !title || title === DEFAULT_TITLE;
}

const BRIEF_FIELDS = [
  ["problem", typeof t === "function" ? t("brief.problem") : "Problem statement"],
  ["users", typeof t === "function" ? t("brief.users") : "Users & stakeholders"],
  ["needs", typeof t === "function" ? t("brief.needs") : "Needs, wants, aspirations"],
  ["pov", typeof t === "function" ? t("brief.pov") : "Solution point-of-view (approach)"],
  ["hmw", typeof t === "function" ? t("brief.hmw") : "How might we…? (HMW)"],
  ["objectives", typeof t === "function" ? t("brief.objectives") : "Objectives & constraints"],
  ["success", typeof t === "function" ? t("brief.success") : "Success criteria"],
];

const BRIEF_KEYS = BRIEF_FIELDS.map(([k]) => k);

function emptyState() {
  return {
    title: DEFAULT_TITLE,
    challenge: "",
    foundations: { challenge: "", themes: "" },
    // Challenge selection worksheet: fit assessment, SWOT, and the accept/scope/reject decision.
    selection: {
      background: "",
      values: "", objectives: "", role: "",
      strengths: "", weaknesses: "", opportunities: "", threats: "",
      reflections: "",
      decision: "", scoped: "",
    },
    brief: Object.fromEntries(BRIEF_KEYS.map((k) => [k, ""])),
    cards: Object.fromEntries(PHASES.map((p) => [p, []])),
    // Per-tool worksheets: { [slug]: { phase, title, cards: [{id,text,created}] } }
    tools: {},
    // Evaluation plan: rows tying brief criteria to methods and measured results.
    evalPlan: [],
    // Team collaboration (all optional — null/empty means a solo project, unchanged behavior).
    team: null, // { id, name, members: [{id,name,role}], settings: { approvalRule } }
    phaseStatus: {}, // { [phase]: { status: "collecting"|"consolidating"|"locked", readiness: {memberId:true} } }
    consolidations: {}, // { [phase]: [{id,status,text,sourceCardIds,createdBy,approvals,created}] }
  };
}

function normalizeState(parsed) {
  const base = emptyState();
  base.title = typeof parsed.title === "string" ? parsed.title : base.title;
  base.challenge = typeof parsed.challenge === "string" ? parsed.challenge : "";
  base.foundations.challenge = typeof parsed.foundations?.challenge === "string" ? parsed.foundations.challenge : "";
  base.foundations.themes = typeof parsed.foundations?.themes === "string" ? parsed.foundations.themes : "";
  Object.keys(base.selection).forEach((k) => {
    if (typeof parsed.selection?.[k] === "string") base.selection[k] = parsed.selection[k];
  });
  BRIEF_KEYS.forEach((k) => {
    if (typeof parsed.brief?.[k] === "string") base.brief[k] = parsed.brief[k];
  });
  PHASES.forEach((p) => {
    if (Array.isArray(parsed.cards?.[p])) base.cards[p] = parsed.cards[p];
  });
  if (Array.isArray(parsed.evalPlan)) {
    base.evalPlan = parsed.evalPlan
      .filter((r) => r && typeof r === "object")
      .map((r) => ({
        id: String(r.id || crypto.randomUUID()),
        criterion: String(r.criterion || ""),
        method: String(r.method || ""),
        metric: String(r.metric || ""),
        result: String(r.result || ""),
      }));
  }
  if (parsed.tools && typeof parsed.tools === "object") {
    Object.entries(parsed.tools).forEach(([slug, t]) => {
      if (t && PHASES.includes(t.phase) && Array.isArray(t.cards)) {
        base.tools[slug] = { phase: t.phase, title: String(t.title || slug), cards: t.cards };
      }
    });
  }
  if (parsed.team && typeof parsed.team === "object" && Array.isArray(parsed.team.members)) {
    base.team = {
      id: String(parsed.team.id || crypto.randomUUID()),
      name: String(parsed.team.name || ""),
      members: parsed.team.members
        .filter((m) => m && typeof m === "object")
        .map((m) => ({
          id: String(m.id || crypto.randomUUID()),
          name: String(m.name || ""),
          about: String(m.about || ""),
          role: m.role === "leader" ? "leader" : "member",
        })),
      settings: { approvalRule: parsed.team.settings?.approvalRule === "consensus" ? "consensus" : "leader" },
    };
  }
  if (parsed.phaseStatus && typeof parsed.phaseStatus === "object") {
    PHASES.forEach((p) => {
      const ps = parsed.phaseStatus[p];
      if (ps && typeof ps === "object") {
        base.phaseStatus[p] = {
          status: ["collecting", "consolidating", "locked"].includes(ps.status) ? ps.status : "collecting",
          readiness: ps.readiness && typeof ps.readiness === "object" ? { ...ps.readiness } : {},
        };
      }
    });
  }
  if (parsed.consolidations && typeof parsed.consolidations === "object") {
    PHASES.forEach((p) => {
      if (Array.isArray(parsed.consolidations[p])) {
        base.consolidations[p] = parsed.consolidations[p]
          .filter((d) => d && typeof d === "object")
          .map((d) => ({
            id: String(d.id || crypto.randomUUID()),
            status: ["draft", "approved", "rejected"].includes(d.status) ? d.status : "draft",
            text: String(d.text || ""),
            sourceCardIds: Array.isArray(d.sourceCardIds) ? d.sourceCardIds : [],
            createdBy: String(d.createdBy || ""),
            approvals: Array.isArray(d.approvals) ? d.approvals : [],
            created: String(d.created || new Date().toISOString()),
          }));
      }
    });
  }
  return base;
}

function migrateLegacyState(legacy) {
  const base = emptyState();
  base.title = typeof legacy.title === "string" ? legacy.title : base.title;
  base.cards.discover = Array.isArray(legacy.cards?.discover) ? legacy.cards.discover : [];
  base.cards.define = Array.isArray(legacy.cards?.define) ? legacy.cards.define : [];
  base.cards.ideate = Array.isArray(legacy.cards?.develop) ? legacy.cards.develop : [];
  base.cards.evaluate = Array.isArray(legacy.cards?.deliver) ? legacy.cards.deliver : [];
  return base;
}

/* ---------------- multi-canvas index ---------------- */

function _readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function loadCanvasIndex() {
  const arr = _readJSON(CANVAS_INDEX_KEY, []);
  return Array.isArray(arr) ? arr : [];
}

function saveCanvasIndex(arr) {
  try {
    localStorage.setItem(CANVAS_INDEX_KEY, JSON.stringify(arr));
  } catch {}
}

function canvasStateKey(id) {
  return CANVAS_PREFIX + id;
}

/** One-time migration from the old single-canvas layout (STORAGE_KEY / legacy, plus the old
 *  global `dtc-sync-project` cloud link) into the multi-canvas index. Idempotent: once an
 *  index exists it does nothing. */
function ensureCanvasMigrated() {
  if (loadCanvasIndex().length > 0) return;

  let seed = null;
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && parsed.cards) seed = normalizeState(parsed);
    }
    if (!seed) {
      const rawV1 = localStorage.getItem(LEGACY_KEY);
      if (rawV1) {
        const parsedV1 = JSON.parse(rawV1);
        if (parsedV1 && parsedV1.cards) seed = migrateLegacyState(parsedV1);
      }
    }
  } catch {}

  const id = crypto.randomUUID();
  const meta = { id, title: (seed && seed.title) || DEFAULT_TITLE, projectId: null, joinCode: null, role: null };

  // Carry over an existing cloud link from the old single global sync-project key.
  try {
    const oldLink = JSON.parse(localStorage.getItem("dtc-sync-project") || "null");
    if (oldLink && oldLink.projectId) {
      meta.projectId = oldLink.projectId;
      meta.joinCode = oldLink.joinCode || null;
      const creds = JSON.parse(localStorage.getItem(`dtc-sync-creds-${oldLink.projectId}`) || "null");
      if (creds && creds.role) meta.role = creds.role;
    }
  } catch {}

  saveCanvasIndex([meta]);
  try {
    localStorage.setItem(ACTIVE_CANVAS_KEY, id);
    if (seed) localStorage.setItem(canvasStateKey(id), JSON.stringify(seed));
  } catch {}
}

function listCanvases() {
  ensureCanvasMigrated();
  return loadCanvasIndex();
}

function getCanvasMeta(id) {
  return loadCanvasIndex().find((c) => c.id === id) || null;
}

function activeCanvasId() {
  ensureCanvasMigrated();
  let id = null;
  try {
    id = localStorage.getItem(ACTIVE_CANVAS_KEY);
  } catch {}
  const index = loadCanvasIndex();
  if (id && index.some((c) => c.id === id)) return id;
  if (index.length) {
    try {
      localStorage.setItem(ACTIVE_CANVAS_KEY, index[0].id);
    } catch {}
    return index[0].id;
  }
  return createCanvas(DEFAULT_TITLE); // no canvases at all — make one
}

function getActiveCanvasMeta() {
  return getCanvasMeta(activeCanvasId());
}

function updateCanvasMeta(id, patch) {
  const index = loadCanvasIndex();
  const i = index.findIndex((c) => c.id === id);
  if (i === -1) return;
  index[i] = { ...index[i], ...patch };
  saveCanvasIndex(index);
}

function setActiveCanvas(id) {
  if (!loadCanvasIndex().some((c) => c.id === id)) return false;
  try {
    localStorage.setItem(ACTIVE_CANVAS_KEY, id);
  } catch {}
  return true;
}

/** Create a new solo, empty canvas and make it active. Returns its id. */
function createCanvas(title) {
  const id = crypto.randomUUID();
  const index = loadCanvasIndex();
  index.push({ id, title: title || DEFAULT_TITLE, projectId: null, joinCode: null, role: null });
  saveCanvasIndex(index);
  const st = emptyState();
  st.title = title || DEFAULT_TITLE;
  try {
    localStorage.setItem(canvasStateKey(id), JSON.stringify(st));
    localStorage.setItem(ACTIVE_CANVAS_KEY, id);
  } catch {}
  return id;
}

function deleteCanvas(id) {
  const index = loadCanvasIndex().filter((c) => c.id !== id);
  saveCanvasIndex(index);
  try {
    localStorage.removeItem(canvasStateKey(id));
  } catch {}
  let active = null;
  try {
    active = localStorage.getItem(ACTIVE_CANVAS_KEY);
  } catch {}
  if (active === id) {
    if (index.length) {
      try {
        localStorage.setItem(ACTIVE_CANVAS_KEY, index[0].id);
      } catch {}
    } else {
      createCanvas(DEFAULT_TITLE);
    }
  }
}

/* ---------------- load / persist (active canvas) ---------------- */

function loadState() {
  ensureCanvasMigrated();
  const id = activeCanvasId();
  try {
    const raw = localStorage.getItem(canvasStateKey(id));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cards) return normalizeState(parsed);
    }
  } catch (err) {
    console.warn("Could not read saved canvas, starting fresh.", err);
  }
  const empty = emptyState();
  const meta = getCanvasMeta(id);
  if (meta && meta.title) empty.title = meta.title;
  return empty;
}

/** Persist the active canvas. Returns true on success. */
function persistState(state) {
  try {
    const id = activeCanvasId();
    localStorage.setItem(canvasStateKey(id), JSON.stringify(state));
    updateCanvasMeta(id, { title: state.title || DEFAULT_TITLE });
    // Every save funnels through here, so this is the one place sync.js needs to hook to
    // push scalar-field edits (title, brief, etc.) up to a connected cloud project. No-ops
    // when sync.js isn't loaded or no project is connected — solo/local-only is unaffected.
    if (typeof onStateSaved === "function") onStateSaved(state);
    return true;
  } catch (err) {
    console.warn("Couldn't save canvas state.", err);
    return false;
  }
}

function newCard(text, author) {
  const card = { id: crypto.randomUUID(), text, created: new Date().toISOString() };
  if (author && author.id) {
    card.authorId = author.id;
    card.authorName = author.name || "";
  }
  return card;
}

/* ================= Team collaboration =================
 * A project is either solo (state.team === null, today's behavior, unchanged)
 * or team-owned. Team mode adds: a roster with a leader and an approval rule,
 * per-phase readiness tracking, and gated AI-consolidation drafts that only
 * become canonical once approved per the team's chosen rule. The LLM never
 * decides on its own — every consolidation is a draft until a human (or the
 * whole team) approves it.
 * ========================================================= */

const ACTIVE_MEMBER_KEY = "dtc-active-member";

/** True once a team has been created for this project. */
function isTeamProject(state) {
  return !!(state.team && Array.isArray(state.team.members) && state.team.members.length);
}

/** Create a team, making the given name its first member and leader. */
function createTeam(state, name) {
  const member = { id: crypto.randomUUID(), name: name.trim(), role: "leader" };
  state.team = {
    id: crypto.randomUUID(),
    name: "",
    members: [member],
    settings: { approvalRule: "leader" }, // "leader" | "consensus" — set by the team, applies to both closing a phase and approving a consolidation draft.
  };
  setActiveMember(member.id);
  return member;
}

function addTeamMember(state, name) {
  const member = { id: crypto.randomUUID(), name: name.trim(), role: "member" };
  state.team.members.push(member);
  return member;
}

function removeTeamMember(state, memberId) {
  if (!state.team) return;
  state.team.members = state.team.members.filter((m) => m.id !== memberId);
}

function setApprovalRule(state, rule) {
  if (!state.team) return;
  state.team.settings.approvalRule = rule === "consensus" ? "consensus" : "leader";
}

function teamMember(state, memberId) {
  return (state.team?.members || []).find((m) => m.id === memberId) || null;
}

function isLeader(state, memberId) {
  const m = teamMember(state, memberId);
  return !!m && m.role === "leader";
}

/** Who is "acting" in this browser right now. Stored separately from project
 *  state since it's a per-browser identity, not shared project data — this is
 *  the seam where a real login would slot in later without changing anything
 *  else in this file. */
function loadActiveMemberId() {
  try {
    return localStorage.getItem(ACTIVE_MEMBER_KEY) || null;
  } catch {
    return null;
  }
}

function setActiveMember(memberId) {
  try {
    localStorage.setItem(ACTIVE_MEMBER_KEY, memberId || "");
  } catch {
    /* ignore */
  }
}

/** The active member, validated against the current team's roster (falls
 *  back to null if the stored id no longer belongs to this team). */
function activeMember(state) {
  if (!isTeamProject(state)) return null;
  const id = loadActiveMemberId();
  return id ? teamMember(state, id) : null;
}

/** Can `identity` delete this entry (stage card or tool-worksheet entry)? The author always
 *  can; the team leader can delete anyone's; an unattributed entry (no author on record —
 *  e.g. from before teams existed) can be deleted by any recognized member. Solo projects
 *  (identity === null, no team context) are unrestricted, matching existing behavior. */
function canDeleteEntry(card, identity) {
  if (!identity) return true;
  if (!card.authorId) return true;
  return card.authorId === identity.id || identity.role === "leader";
}

/* ---- Per-phase status: readiness + consolidation drafts ---- */

function ensurePhaseStatus(state, phase) {
  if (!state.phaseStatus) state.phaseStatus = {};
  if (!state.phaseStatus[phase]) {
    state.phaseStatus[phase] = { status: "collecting", readiness: {} };
  }
  return state.phaseStatus[phase];
}

function setReady(state, phase, memberId, ready) {
  const ps = ensurePhaseStatus(state, phase);
  if (ready) ps.readiness[memberId] = true;
  else delete ps.readiness[memberId];
}

function isReady(state, phase, memberId) {
  return !!ensurePhaseStatus(state, phase).readiness[memberId];
}

function allReady(state, phase) {
  if (!isTeamProject(state)) return false;
  return state.team.members.every((m) => isReady(state, phase, m.id));
}

/** Can this member trigger consolidation for this phase, per the team's rule? */
function canConsolidate(state, phase, memberId) {
  if (!isTeamProject(state)) return false;
  const rule = state.team.settings.approvalRule;
  if (rule === "leader") return isLeader(state, memberId);
  return allReady(state, phase); // consensus: anyone can trigger once everyone's marked ready
}

/** Can this member approve a pending draft, per the team's rule? */
function canApprove(state, memberId) {
  if (!isTeamProject(state)) return false;
  const rule = state.team.settings.approvalRule;
  return rule === "leader" ? isLeader(state, memberId) : true; // consensus: everyone must individually approve
}

function ensureConsolidations(state, phase) {
  if (!state.consolidations) state.consolidations = {};
  if (!state.consolidations[phase]) state.consolidations[phase] = [];
  return state.consolidations[phase];
}

function addConsolidationDraft(state, phase, text, sourceCardIds, createdBy) {
  const draft = {
    id: crypto.randomUUID(),
    status: "draft",
    text,
    sourceCardIds,
    createdBy,
    approvals: [],
    created: new Date().toISOString(),
  };
  ensureConsolidations(state, phase).push(draft);
  ensurePhaseStatus(state, phase).status = "consolidating";
  return draft;
}

/** Record one member's approval; once the team's rule is satisfied, the draft
 *  becomes an approved, attributed "Team (consolidated)" card and the phase
 *  is marked locked. Returns true if this approval finalized the draft. */
function approveConsolidationDraft(state, phase, draftId, memberId) {
  const draft = ensureConsolidations(state, phase).find((d) => d.id === draftId);
  if (!draft || draft.status !== "draft") return false;
  if (!draft.approvals.includes(memberId)) draft.approvals.push(memberId);

  const rule = state.team.settings.approvalRule;
  const satisfied =
    rule === "leader" ? draft.approvals.some((id) => isLeader(state, id)) : state.team.members.every((m) => draft.approvals.includes(m.id));
  if (!satisfied) return false;

  draft.status = "approved";
  const author = { id: draft.createdBy, name: "Team (consolidated)" };
  state.cards[phase].push(newCard(draft.text, author));
  ensurePhaseStatus(state, phase).status = "locked";
  return true;
}

function rejectConsolidationDraft(state, phase, draftId) {
  const list = ensureConsolidations(state, phase);
  const draft = list.find((d) => d.id === draftId);
  if (draft) draft.status = "rejected";
  ensurePhaseStatus(state, phase).status = "collecting";
}

/** Reopen a locked/consolidating phase back to collecting (leader-only action in the UI). */
function reopenPhase(state, phase) {
  ensurePhaseStatus(state, phase).status = "collecting";
}

/** The operative challenge: the scoped-down subset when one was chosen, else the original. */
function operativeChallenge(state) {
  if (state.selection.decision === "subset" && state.selection.scoped.trim()) return state.selection.scoped.trim();
  return state.challenge.trim();
}

/** True once any brief field has content — the first diamond has begun closing. */
function briefStarted(state) {
  return BRIEF_KEYS.some((k) => state.brief[k].trim());
}

/** Tool worksheets belonging to a phase that have at least one entry. */
function toolsForPhase(state, phase) {
  return Object.entries(state.tools)
    .filter(([, t]) => t.phase === phase && t.cards.length > 0)
    .map(([slug, t]) => ({ slug, ...t }));
}
