// Shared canvas state for all pages (dashboard, stage pages, tool worksheets).
// Load this before app.js / stage.js / tool.js.

const STORAGE_KEY = "design-thinking-canvas-v2";
const LEGACY_KEY = "design-thinking-canvas-v1";

const PHASES = ["discover", "define", "ideate", "make", "evaluate", "develop", "reflect"];

const BRIEF_FIELDS = [
  ["problem", "Problem statement"],
  ["users", "Users & stakeholders"],
  ["needs", "Needs, wants, aspirations"],
  ["pov", "Solution point-of-view (approach)"],
  ["objectives", "Objectives & constraints"],
  ["success", "Success criteria"],
];

const BRIEF_KEYS = BRIEF_FIELDS.map(([k]) => k);

function emptyState() {
  return {
    title: "Untitled Project",
    challenge: "",
    foundations: { challenge: "", themes: "" },
    brief: Object.fromEntries(BRIEF_KEYS.map((k) => [k, ""])),
    cards: Object.fromEntries(PHASES.map((p) => [p, []])),
    // Per-tool worksheets: { [slug]: { phase, title, cards: [{id,text,created}] } }
    tools: {},
  };
}

function normalizeState(parsed) {
  const base = emptyState();
  base.title = typeof parsed.title === "string" ? parsed.title : base.title;
  base.challenge = typeof parsed.challenge === "string" ? parsed.challenge : "";
  base.foundations.challenge = typeof parsed.foundations?.challenge === "string" ? parsed.foundations.challenge : "";
  base.foundations.themes = typeof parsed.foundations?.themes === "string" ? parsed.foundations.themes : "";
  BRIEF_KEYS.forEach((k) => {
    if (typeof parsed.brief?.[k] === "string") base.brief[k] = parsed.brief[k];
  });
  PHASES.forEach((p) => {
    if (Array.isArray(parsed.cards?.[p])) base.cards[p] = parsed.cards[p];
  });
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

/** Tool worksheets belonging to a phase that have at least one entry. */
function toolsForPhase(state, phase) {
  return Object.entries(state.tools)
    .filter(([, t]) => t.phase === phase && t.cards.length > 0)
    .map(([slug, t]) => ({ slug, ...t }));
}
