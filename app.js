// Design Thinking Canvas — main page (overview / dashboard).
// The actual work happens on the stage pages (stages/*.html, via stage.js)
// and tool worksheets (tools/*.html, via tool.js). Requires store.js.

const PHASE_CONFIG = [
  { id: "discover", num: 1, mode: "Divergent", title: "Discover",
    hint: "Research & empathy. Explore the problem — talk to users, gather observations, question assumptions.",
    page: "stages/discover.html" },
  { id: "define", num: 2, mode: "Convergent", title: "Define",
    hint: "Sensemaking & gaining insights. Synthesize findings into a sharp problem definition.",
    page: "stages/define.html" },
  { id: "ideate", num: 3, mode: "Divergent", title: "Ideate",
    hint: "Creating potential solutions. Generate concepts broadly — go wide again.",
    page: "stages/ideate.html" },
  { id: "make", num: 4, mode: "Convergent", title: "Make",
    hint: "Realization and representation. Narrow to the concepts worth building.",
    page: "stages/make.html" },
  { id: "evaluate", num: 5, mode: "Testing", title: "Evaluate",
    hint: "Test the solution concept with users, customers, and experts.",
    page: "stages/evaluate.html" },
  { id: "develop", num: 6, mode: "Gate check", title: "Develop",
    hint: "Weigh viability, feasibility, and desirability before committing to build.",
    page: "stages/develop.html" },
  { id: "reflect", num: 7, mode: "Meta", title: "Reflect & Improve",
    hint: "Reflective practitioner, team, and organization — improve the process and the next release.",
    page: "stages/reflect.html" },
];

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
    if (confirm(`Delete all ${total} card(s) from every stage? This can't be undone.`)) {
      PHASES.forEach((p) => (state.cards[p] = []));
      persist();
      renderAll();
    }
  });

  document.getElementById("export-json").addEventListener("click", exportJSON);

  const importInput = document.getElementById("import-file");
  document.getElementById("import-json").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", importJSON);

  // Refresh summaries when returning from a stage page (including bfcache restores).
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) refreshFromStorage();
  });
  window.addEventListener("focus", refreshFromStorage);
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
    statusEl.textContent = "Fill in the challenge and at least part of the worksheet first — the facilitator can only ask about what you wrote.";
    return;
  }
  if (!llmConfigured()) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML = 'No API key configured — add one in <a href="#" onclick="openSettings();return false;">Settings</a>.';
    return;
  }

  const btn = document.getElementById("facilitate-btn");
  btn.disabled = true;
  statusEl.textContent = "Reading your worksheet…";
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
      "team itself wrote, and are answerable only by the team.";
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
    statusEl.textContent = "Discuss as a team, capture your thinking in the reflections box — then decide.";
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent =
      err instanceof TypeError
        ? "The request never reached the provider. If you opened this page as a local file, serve the folder (python3 -m http.server)."
        : err.message;
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
    statusEl.textContent = "Write your challenge first — the AI can only rephrase what you wrote, not invent it.";
    return;
  }
  if (!llmConfigured()) {
    statusEl.innerHTML = 'No API key configured — add one in <a href="#" onclick="openSettings();return false;">Settings</a>.';
    return;
  }

  const btn = document.getElementById("challenge-rephrase");
  btn.disabled = true;
  btn.textContent = "Rephrasing…";
  statusEl.textContent = "Contacting your LLM…";
  statusEl.classList.remove("assist-error");
  try {
    const system =
      "You help a design thinking student sharpen the wording of THEIR challenge statement. " +
      "Strict rules: you only rephrase what the student wrote — remove ambiguity, vague terms, and hidden solutions. " +
      "You must NOT add new scope, new ideas, new user groups, or any content not already in their statement. " +
      "You must NOT propose a different challenge. Preserve the student's intent exactly.";
    const user =
      `The student's challenge statement:\n"${current}"\n\n` +
      `Offer 2–3 rephrasings that state the same challenge less ambiguously ` +
      `(e.g., clarify who it concerns and what outcome matters, remove baked-in solutions, cut vague words). ` +
      `Same scope, same intent — only clearer wording. Respond with ONLY a JSON array of strings.`;

    const text = await llmComplete(system, user);
    const options = llmExtractJSON(text);
    if (!Array.isArray(options) || options.length === 0) throw new Error("Unexpected response format.");

    statusEl.textContent = "Pick a rephrasing if one says it better — or keep your own wording.";
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
      use.textContent = "Use";
      use.addEventListener("click", () => {
        challengeStatement.value = opt;
        state.challenge = opt;
        persist();
        suggestionsEl.innerHTML = "";
        statusEl.textContent = "Updated.";
      });
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "btn btn-ghost";
      dismiss.textContent = "Dismiss";
      dismiss.addEventListener("click", () => row.remove());
      actions.appendChild(use);
      actions.appendChild(dismiss);
      row.appendChild(p);
      row.appendChild(actions);
      suggestionsEl.appendChild(row);
    });
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent =
      err instanceof TypeError
        ? "The request never reached the provider. If you opened this page as a local file, serve the folder instead " +
          "(run `python3 -m http.server` in it, then open http://localhost:8000) — some browsers block API calls from file:// pages."
        : err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "✦ Rephrase for clarity";
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
        <span class="phase-tag">${phase.num} · ${phase.mode}</span>
        <h2><a class="column-title-link" href="${phase.page}">${phase.title}</a></h2>
        <p class="phase-hint">${phase.hint}</p>
      </div>
      <div class="summary-body" data-phase="${phase.id}"></div>
      <a class="btn btn-add stage-open" href="${phase.page}">Open workspace →</a>
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
      `Your project has ${cards} card${cards === 1 ? "" : "s"}` +
      (entries ? ` and ${entries} tool entr${entries === 1 ? "y" : "ies"}` : "") +
      ` across ${stagesWithData} stage${stagesWithData === 1 ? "" : "s"} — compile it into a report.`;
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
  count.textContent = cards.length === 0 ? "No cards yet" : `${cards.length} card${cards.length === 1 ? "" : "s"}`;
  body.appendChild(count);

  const toolEntries = toolsForPhase(state, phase).reduce((n, t) => n + t.cards.length, 0);
  if (toolEntries > 0) {
    const toolLine = document.createElement("p");
    toolLine.className = "summary-more";
    toolLine.textContent = `${toolEntries} tool worksheet entr${toolEntries === 1 ? "y" : "ies"}`;
    body.appendChild(toolLine);
  }

  if (phase === "define") {
    const done = BRIEF_KEYS.filter((k) => state.brief[k].trim()).length;
    const briefLine = document.createElement("p");
    briefLine.className = done === BRIEF_KEYS.length ? "summary-count" : "summary-more";
    briefLine.textContent = `Brief: ${done}/${BRIEF_KEYS.length} sections`;
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

function persist() {
  if (persistState(state)) {
    flashSaveStatus("Saved locally in this browser");
  } else {
    flashSaveStatus("Couldn't save — storage may be full", true);
  }
}

function flashSaveStatus(msg, isError = false) {
  saveStatus.textContent = msg;
  saveStatus.style.color = isError ? "#b3261e" : "";
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
        if (!confirm("This export was made by a newer version of the canvas — some data may not import. Continue?")) {
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
      alert("That file doesn't look like a valid canvas export.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
