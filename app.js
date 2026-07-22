// Design Thinking Canvas — main page (overview / dashboard).
// The actual work happens on the stage pages (stages/*.html, via stage.js)
// and tool worksheets (tools/*.html, via tool.js). Requires store.js.

function PHASE_CONFIG_LIST() {
  return [
    { id: "discover", num: 1, modeKey: "mode.divergent", titleKey: "phase.discover.title", hintKey: "phase.discover.hint", page: "stages/discover.html" },
    { id: "define", num: 2, modeKey: "mode.convergent", titleKey: "phase.define.title", hintKey: "phase.define.hint", page: "stages/define.html" },
    { id: "ideate", num: 3, modeKey: "mode.divergent", titleKey: "phase.ideate.title", hintKey: "phase.ideate.hint", page: "stages/ideate.html" },
    { id: "make", num: 4, modeKey: "mode.convergent", titleKey: "phase.make.title", hintKey: "phase.make.hint", page: "stages/make.html" },
    { id: "evaluate", num: 5, modeKey: "mode.testing", titleKey: "phase.evaluate.title", hintKey: "phase.evaluate.hint", page: "stages/evaluate.html" },
    { id: "develop", num: 6, modeKey: "mode.gate", titleKey: "phase.develop.title", hintKey: "phase.develop.hint", page: "stages/develop.html" },
    { id: "reflect", num: 7, modeKey: "mode.meta", titleKey: "phase.reflect.title", hintKey: "phase.reflect.hint", page: "stages/reflect.html" },
  ];
}
const PHASE_CONFIG = PHASE_CONFIG_LIST();

const PREVIEW_COUNT = 3;

let state = loadState();

const titleInput = document.getElementById("project-title");
const saveStatus = document.getElementById("save-status");
const board = document.getElementById("board");
const challengeInput = document.getElementById("foundation-challenge");
const themesInput = document.getElementById("foundation-themes");
const challengeStatement = document.getElementById("challenge-statement");

init();

function init() {
  titleInput.value = state.title;
  challengeInput.value = state.foundations.challenge;
  themesInput.value = state.foundations.themes;
  challengeStatement.value = state.challenge;

  buildBoard();
  renderAll();
  initTitleGate();

  challengeStatement.addEventListener("input", () => {
    state.challenge = challengeStatement.value;
    persist();
  });

  document.getElementById("challenge-rephrase").addEventListener("click", rephraseChallenge);

  document.getElementById("facilitate-btn").addEventListener("click", facilitateSelection);

  // Challenge selection worksheet fields (ids sel-<key> map to state.selection keys).
  Object.keys(state.selection).forEach((k) => {
    const el = document.getElementById(`sel-${k}`);
    if (!el) return;
    el.value = state.selection[k];
    el.addEventListener("input", () => {
      state.selection[k] = el.value;
      persist();
    });
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        state.selection[k] = el.value;
        persist();
      });
    }
  });

  titleInput.addEventListener("input", () => {
    state.title = titleInput.value;
    persist();
  });

  challengeInput.addEventListener("input", () => {
    state.foundations.challenge = challengeInput.value;
    persist();
  });

  themesInput.addEventListener("input", () => {
    state.foundations.themes = themesInput.value;
    persist();
  });

  document.getElementById("clear-canvas").addEventListener("click", () => {
    const total = PHASES.reduce((n, p) => n + state.cards[p].length, 0);
    if (total === 0) return;
    if (confirm(t("confirm.clearAll").replace("{n}", total))) {
      PHASES.forEach((p) => (state.cards[p] = []));
      persist();
      renderAll();
    }
  });

  document.getElementById("export-json").addEventListener("click", exportJSON);

  const importInput = document.getElementById("import-file");
  document.getElementById("import-json").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", importJSON);

  initIntroCard();
  initSelectionCollapse();
  initDataMenu();
  updateSaveStatusMode();
  document.addEventListener("dtc-team-changed", updateSaveStatusMode);

  // Refresh summaries when returning from a stage page (including bfcache restores).
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) refreshFromStorage();
  });
  window.addEventListener("focus", refreshFromStorage);
}

/** Blocking gate: a real project title is required before the canvas is usable.
 *  The modal has no close button and no backdrop/Escape dismissal — it only
 *  hides once a non-empty, non-default title is saved. */
function initTitleGate() {
  if (!needsProjectTitle(state)) return;

  const modal = document.getElementById("title-gate-modal");
  const input = document.getElementById("title-gate-input");
  const error = document.getElementById("title-gate-error");
  const save = document.getElementById("title-gate-save");

  modal.hidden = false;
  input.value = state.title === DEFAULT_TITLE ? "" : state.title;
  input.focus();

  function trySave() {
    const val = input.value.trim();
    if (!val || val === DEFAULT_TITLE) {
      error.hidden = false;
      input.focus();
      return;
    }
    state.title = val;
    titleInput.value = val;
    persist();
    modal.hidden = true;
  }

  save.addEventListener("click", trySave);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); trySave(); }
  });
  input.addEventListener("input", () => { error.hidden = true; });
}

function refreshFromStorage() {
  state = loadState();
  titleInput.value = state.title;
  challengeInput.value = state.foundations.challenge;
  themesInput.value = state.foundations.themes;
  challengeStatement.value = state.challenge;
  Object.keys(state.selection).forEach((k) => {
    const el = document.getElementById(`sel-${k}`);
    if (el) el.value = state.selection[k];
  });
  renderAll();
}

/** Facilitation only: the LLM reads the worksheet and asks questions back.
 *  It must not suggest, recommend, or evaluate — the thinking stays with the team. */
async function facilitateSelection() {
  const statusEl = document.getElementById("facilitate-status");
  const listEl = document.getElementById("facilitate-questions");
  listEl.innerHTML = "";
  statusEl.classList.remove("assist-error");

  const sel = state.selection;
  const anyInput = state.challenge.trim() || sel.background.trim() ||
    ["values", "objectives", "role", "strengths", "weaknesses", "opportunities", "threats"].some((k) => sel[k].trim());
  if (!anyInput) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = t("selection.facilitate.guardEmpty");
    return;
  }
  if (!llmConfigured()) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML = `${t("challenge.noKey")} <a href="#" onclick="openSettings();return false;">${t("header.settings")}</a>`;
    return;
  }

  const btn = document.getElementById("facilitate-btn");
  btn.disabled = true;
  statusEl.textContent = t("selection.facilitate.reading");
  try {
    const labels = {
      background: "Team/personal background", values: "Fit with values", objectives: "Fit with objectives",
      role: "Fit with role & capabilities", strengths: "SWOT Strengths", weaknesses: "SWOT Weaknesses",
      opportunities: "SWOT Opportunities", threats: "SWOT Threats", reflections: "Team reflections so far",
    };
    const lines = [`Challenge (user-authored): ${state.challenge.trim() || "(not written yet)"}`];
    Object.entries(labels).forEach(([k, label]) => {
      if (sel[k].trim()) lines.push(`${label}: ${sel[k].trim()}`);
    });

    const system =
      "You are a strictly neutral design-thinking facilitator helping a team decide whether to accept, scope down, " +
      "or reject a challenge. HARD RULES: you only ask questions. You never give suggestions, advice, opinions, " +
      "evaluations, or answers — not even disguised as questions ('have you considered X?' embeds a suggestion; " +
      "don't do that). Good facilitator questions point at tensions, gaps, and unexamined assumptions in what the " +
      "team itself wrote, and are answerable only by the team." + aiLangInstruction();
    const user =
      lines.join("\n") +
      "\n\nAsk the team 3–5 short questions that could make them think or rethink before deciding. " +
      "Each question must be grounded in something specific they wrote (or conspicuously didn't write). " +
      "No advice, no options, no evaluations — questions only. Respond with ONLY a JSON array of strings.";

    const text = await llmComplete(system, user);
    const questions = llmExtractJSON(text);
    if (!Array.isArray(questions) || questions.length === 0) throw new Error("Unexpected response format.");

    questions.map(String).forEach((q) => {
      const li = document.createElement("li");
      li.textContent = q;
      listEl.appendChild(li);
    });
    statusEl.textContent = t("selection.facilitate.done");
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = err instanceof TypeError ? t("challenge.networkErr") : err.message;
  } finally {
    btn.disabled = false;
  }
}

/** LLM assistance for the challenge is rephrasing ONLY — the user must author it. */
async function rephraseChallenge() {
  const statusEl = document.getElementById("challenge-status");
  const suggestionsEl = document.getElementById("challenge-suggestions");
  suggestionsEl.innerHTML = "";

  const current = challengeStatement.value.trim();
  if (!current) {
    statusEl.textContent = t("challenge.empty");
    return;
  }
  if (!llmConfigured()) {
    statusEl.innerHTML = `${t("challenge.noKey")} <a href="#" onclick="openSettings();return false;">${t("header.settings")}</a>`;
    return;
  }

  const btn = document.getElementById("challenge-rephrase");
  btn.disabled = true;
  btn.textContent = t("challenge.rephrasing");
  statusEl.textContent = t("challenge.contacting");
  statusEl.classList.remove("assist-error");
  try {
    const system =
      "You help a design thinking student sharpen the wording of THEIR challenge statement. " +
      "Strict rules: you only rephrase what the student wrote — remove ambiguity, vague terms, and hidden solutions. " +
      "You must NOT add new scope, new ideas, new user groups, or any content not already in their statement. " +
      "You must NOT propose a different challenge. Preserve the student's intent exactly." + aiLangInstruction();
    const user =
      `The student's challenge statement:\n"${current}"\n\n` +
      `Offer 2–3 rephrasings that state the same challenge less ambiguously ` +
      `(e.g., clarify who it concerns and what outcome matters, remove baked-in solutions, cut vague words). ` +
      `Same scope, same intent — only clearer wording. Respond with ONLY a JSON array of strings.`;

    const text = await llmComplete(system, user);
    const options = llmExtractJSON(text);
    if (!Array.isArray(options) || options.length === 0) throw new Error("Unexpected response format.");

    statusEl.textContent = t("challenge.pick");
    options.map(String).forEach((opt) => {
      const row = document.createElement("div");
      row.className = "suggestion";
      const p = document.createElement("p");
      p.textContent = opt;
      const actions = document.createElement("div");
      actions.className = "suggestion-actions";
      const use = document.createElement("button");
      use.type = "button";
      use.className = "btn btn-add";
      use.textContent = t("challenge.use");
      use.addEventListener("click", () => {
        challengeStatement.value = opt;
        state.challenge = opt;
        persist();
        suggestionsEl.innerHTML = "";
        statusEl.textContent = t("challenge.updated");
      });
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "btn btn-ghost";
      dismiss.textContent = t("challenge.dismiss");
      dismiss.addEventListener("click", () => row.remove());
      actions.appendChild(use);
      actions.appendChild(dismiss);
      row.appendChild(p);
      row.appendChild(actions);
      suggestionsEl.appendChild(row);
    });
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = err instanceof TypeError ? t("challenge.networkErr") : err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = t("challenge.rephrase");
  }
}

/** Build the 7 read-only summary columns. Work happens on the stage pages. */
function buildBoard() {
  board.innerHTML = "";
  PHASE_CONFIG.forEach((phase) => {
    const section = document.createElement("section");
    section.className = "column column-summary";
    section.dataset.phase = phase.id;
    section.innerHTML = `
      <div class="column-head">
        <span class="phase-tag">${phase.num} · ${t(phase.modeKey)}</span>
        <h2><a class="column-title-link" href="${phase.page}">${t(phase.titleKey)}</a></h2>
        <p class="phase-hint">${t(phase.hintKey)}</p>
      </div>
      <div class="summary-body" data-phase="${phase.id}"></div>
      <a class="btn btn-add stage-open" href="${phase.page}">${t("board.openWorkspace")}</a>
    `;
    board.appendChild(section);
  });
}

function renderAll() {
  PHASES.forEach(renderSummary);
  renderReportCTA();
}

function renderReportCTA() {
  const cta = document.getElementById("report-cta");
  if (!cta) return;
  const cards = PHASES.reduce((n, p) => n + state.cards[p].length, 0);
  const entries = PHASES.reduce((n, p) => n + toolsForPhase(state, p).reduce((m, t) => m + t.cards.length, 0), 0);
  const stagesWithData = PHASES.filter((p) => state.cards[p].length || toolsForPhase(state, p).length).length;
  if (cards + entries >= 5) {
    document.getElementById("report-cta-text").textContent =
      `${t("report.cta.project")} ${cards} ${cards === 1 ? t("report.cta.card") : t("report.cta.cards")}` +
      (entries ? ` ${t("report.cta.and")} ${entries} ${entries === 1 ? t("report.cta.entry") : t("report.cta.entries")}` : "") +
      ` ${t("report.cta.across")} ${stagesWithData} ${stagesWithData === 1 ? t("report.cta.stage") : t("report.cta.stages")} — ${t("report.cta.compile")}`;
    cta.hidden = false;
  } else {
    cta.hidden = true;
  }
}

function renderSummary(phase) {
  const body = document.querySelector(`.summary-body[data-phase="${phase}"]`);
  body.innerHTML = "";

  const cards = state.cards[phase];
  const count = document.createElement("p");
  count.className = "summary-count";
  count.textContent = cards.length === 0 ? t("board.noCards") : `${cards.length} ${cards.length === 1 ? t("board.card") : t("board.cards")}`;
  body.appendChild(count);

  const toolEntries = toolsForPhase(state, phase).reduce((n, tl) => n + tl.cards.length, 0);
  if (toolEntries > 0) {
    const toolLine = document.createElement("p");
    toolLine.className = "summary-more";
    toolLine.textContent = `${toolEntries} ${toolEntries === 1 ? t("board.toolEntry") : t("board.toolEntries")}`;
    body.appendChild(toolLine);
  }

  if (phase === "define") {
    const done = BRIEF_KEYS.filter((k) => state.brief[k].trim()).length;
    const briefLine = document.createElement("p");
    briefLine.className = done === BRIEF_KEYS.length ? "summary-count" : "summary-more";
    briefLine.textContent = `${t("board.briefStatus")}: ${done}/${BRIEF_KEYS.length} ${t("board.sections")}`;
    body.appendChild(briefLine);
  }

  cards.slice(-PREVIEW_COUNT).reverse().forEach((card) => {
    const p = document.createElement("p");
    p.className = "summary-card";
    p.textContent = card.text.length > 90 ? card.text.slice(0, 90) + "…" : card.text;
    body.appendChild(p);
  });

  if (cards.length > PREVIEW_COUNT) {
    const more = document.createElement("p");
    more.className = "summary-more";
    more.textContent = `+ ${cards.length - PREVIEW_COUNT} more`;
    body.appendChild(more);
  }
}

function cloudConnected() {
  return typeof syncConnected === "function" && syncConnected();
}

function persist() {
  if (persistState(state)) {
    flashSaveStatus(cloudConnected() ? t("save.status.synced") : t("save.status.ok"));
  } else {
    flashSaveStatus(t("save.status.fail"), true);
  }
}

/** Set the idle save-status label to reflect whether we're cloud-synced or local-only
 *  (called on load and whenever team connection changes). */
function updateSaveStatusMode() {
  flashSaveStatus(cloudConnected() ? t("save.status.synced") : t("save.status.ok"));
}

function flashSaveStatus(msg, isError = false) {
  saveStatus.textContent = msg;
  saveStatus.style.color = isError ? "#b3261e" : "";
}

/* ---------------- onboarding / UX preferences ---------------- */

const INTRO_DISMISS_KEY = "dtc-intro-dismissed";
const SELECTION_OPEN_KEY = "dtc-selection-open";

/** First-load welcome card: 3-step how-it-works, a team nudge, and an AI-is-optional note.
 *  Dismissed permanently once the user clicks "Got it". */
function initIntroCard() {
  const card = document.getElementById("intro-card");
  if (!card) return;
  let dismissed = false;
  try {
    dismissed = localStorage.getItem(INTRO_DISMISS_KEY) === "1";
  } catch {}
  if (!dismissed) card.hidden = false;

  document.getElementById("intro-dismiss")?.addEventListener("click", () => {
    card.hidden = true;
    try {
      localStorage.setItem(INTRO_DISMISS_KEY, "1");
    } catch {}
  });
  document.getElementById("intro-team-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof openTeamPanel === "function") openTeamPanel();
  });
  document.getElementById("intro-ai-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof openSettings === "function") openSettings();
  });
}

/** The heavy Challenge Selection Worksheet is collapsible; remember the user's choice. */
function initSelectionCollapse() {
  const d = document.getElementById("selection-collapse");
  if (!d) return;
  try {
    if (localStorage.getItem(SELECTION_OPEN_KEY) === "0") d.open = false;
  } catch {}
  d.addEventListener("toggle", () => {
    try {
      localStorage.setItem(SELECTION_OPEN_KEY, d.open ? "1" : "0");
    } catch {}
  });
}

/** Header "Data ▾" dropdown (Export / Import / Clear): close on outside click or after use. */
function initDataMenu() {
  const menu = document.getElementById("data-menu");
  if (!menu) return;
  document.addEventListener("click", (e) => {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
  menu.querySelectorAll(".header-menu-list button").forEach((b) =>
    b.addEventListener("click", () => (menu.open = false))
  );
}

function exportJSON() {
  // Complete canvas export: all project state plus user settings — except the API key.
  const cfg = loadLLMConfig();
  const payload = {
    _format: "design-thinking-canvas-export-v1",
    schemaVersion: 2,
    exported: new Date().toISOString(),
    ...state,
    settings: {
      name: cfg.name || "",
      about: cfg.about || "",
      provider: cfg.provider || "",
      model: cfg.model || "",
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (state.title || "canvas").trim().replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-") || "canvas";
  a.href = url;
  a.download = `${safeName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > 2) {
        if (!confirm(t("confirm.importNewer"))) {
          e.target.value = "";
          return;
        }
      }
      state = normalizeState(parsed);
      // Restore user settings if present in the export — never touches the stored API key.
      if (parsed.settings && typeof parsed.settings === "object") {
        const cfg = loadLLMConfig();
        ["name", "about", "provider", "model"].forEach((k) => {
          if (typeof parsed.settings[k] === "string") cfg[k] = parsed.settings[k];
        });
        saveLLMConfig(cfg);
        if (window.updateSettingsButtons) window.updateSettingsButtons();
      }
      persist();
      refreshFromStorage();
    } catch (err) {
      alert(t("alert.importInvalid"));
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
