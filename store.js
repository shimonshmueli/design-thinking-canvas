// Shared canvas state for all pages (dashboard, stage pages, tool worksheets).
// Load this before app.js / stage.js / tool.js.

const STORAGE_KEY = "design-thinking-canvas-v2";
const LEGACY_KEY = "design-thinking-canvas-v1";

const PHASES = ["discover", "define", "ideate", "make", "evaluate", "develop", "reflect"];

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
    title: "Untitled Project",
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cards) return normalizeState(parsed);
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (parsedLegacy && parsedLegacy.cards) return migrateLegacyState(parsedLegacy);
    }
  } catch (err) {
    console.warn("Could not read saved canvas, starting fresh.", err);
  }
  return emptyState();
}

/** Persist. Returns true on success. */
function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn("Couldn't save canvas state.", err);
    return false;
  }
}

function newCard(text) {
  return { id: crypto.randomUUID(), text, created: new Date().toISOString() };
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
