// Stage-page workspace: cards, AI assist, and the Problem Definition (Brief).
// Requires store.js (shared state) and llm.js.

// Glossary term for each brief field's ⓘ link (see glossary.js).
const BRIEF_TERMS = {
  problem: "problem-statement",
  users: "stakeholders",
  needs: "needs",
  pov: "pov",
  objectives: "objectives",
  success: "success-criteria",
};

const STAGE_DESCRIPTIONS = {
  discover: "Discover (divergent, problem space): research & empathy — observations, user insights, contexts, assumptions to question.",
  define: "Define (convergent, problem space): sensemaking — synthesized insights, themes, candidate problem statements.",
  ideate: "Ideate (divergent, solution space): candidate solution ideas and concepts addressing the brief.",
  make: "Make (convergent, solution space): concepts selected to prototype, prototype plans, realization notes.",
  evaluate: "Evaluate: test results, user feedback, expert findings measured against the brief's success criteria.",
  develop: "Develop (gate check): viability, feasibility, and desirability assessments of the evaluated concept.",
  reflect: "Reflect & Improve: retro notes — what to improve in the team, process, methods, and next release.",
};

const phase = document.querySelector(".doc-article").dataset.phase;
const form = document.getElementById("card-form");
const list = document.getElementById("card-list");
const workspace = document.getElementById("workspace");

let state = loadState();

initAssist();
initToolWorksheets();
if (["discover", "define"].includes(phase)) initChallengeDisplay();
if (phase === "define") initBriefEditor();
if (["ideate", "make", "evaluate", "develop"].includes(phase)) initBriefDisplay();
renderList();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value.trim();
  if (!text) return;
  addCard(text);
  textarea.value = "";
  textarea.focus();
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    state = loadState();
    renderList();
  }
});

/* ---------------- state ---------------- */

function persist() {
  persistState(state);
}

/* ---------------- cards ---------------- */

function addCard(text) {
  state.cards[phase].push(newCard(text));
  persist();
  renderList();
}

function updateCard(id, text) {
  const card = state.cards[phase].find((c) => c.id === id);
  if (!card) return;
  card.text = text;
  persist();
}

function deleteCard(id) {
  state.cards[phase] = state.cards[phase].filter((c) => c.id !== id);
  persist();
  renderList();
}

function renderList() {
  list.innerHTML = "";
  const cards = state.cards[phase];
  if (cards.length === 0) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = "No cards yet — add your first above.";
    list.appendChild(hint);
    return;
  }
  cards.forEach((card) => list.appendChild(renderCard(card)));
}

function renderCard(card) {
  const el = document.createElement("div");
  el.className = "card";

  const textarea = document.createElement("textarea");
  textarea.className = "card-edit";
  textarea.value = card.text;
  textarea.rows = Math.max(2, Math.min(8, Math.ceil(card.text.length / 60)));
  textarea.addEventListener("input", () => {
    textarea.rows = Math.max(2, Math.min(8, Math.ceil(textarea.value.length / 60)));
  });
  textarea.addEventListener("blur", () => {
    const text = textarea.value.trim();
    if (!text) {
      deleteCard(card.id);
      return;
    }
    updateCard(card.id, text);
  });

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const date = document.createElement("span");
  date.className = "card-date";
  date.textContent = new Date(card.created).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const del = document.createElement("button");
  del.className = "card-delete";
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteCard(card.id));

  meta.appendChild(date);
  meta.appendChild(del);
  el.appendChild(textarea);
  el.appendChild(meta);
  return el;
}

/* ---------------- AI assist ---------------- */

function initAssist() {
  const panel = document.createElement("div");
  panel.className = "assist";
  panel.innerHTML = `
    <div class="assist-head">
      <h3>✦ AI assist</h3>
      <select class="assist-model" id="assist-model" title="Model used for suggestions"></select>
    </div>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="assist-suggest">Suggest cards for this stage</button>
      <span class="assist-status" id="assist-status"></span>
    </div>
    <div id="assist-suggestions"></div>
  `;
  workspace.insertBefore(panel, form);

  const statusEl = panel.querySelector("#assist-status");
  initModelSelect(panel.querySelector("#assist-model"));

  if (!llmConfigured()) {
    statusEl.innerHTML =
      'No API key yet — set your name, provider, and key in ' +
      '<a href="../index.html#settings">Settings on the Canvas page</a>.';
  }

  panel.querySelector("#assist-suggest").addEventListener("click", () => suggestCards(statusEl, panel.querySelector("#assist-suggestions")));
}

/** Compact model picker: choose among the provider's known models, or a custom one.
 *  For OpenRouter, the full live catalog is fetched so every model is selectable. */
function initModelSelect(select) {
  const cfg = loadLLMConfig();
  const provider = LLM_PROVIDERS[cfg.provider] || LLM_PROVIDERS.anthropic;
  const current = cfg.model || provider.defaultModel;

  const populate = (models) => {
    const options = [...models];
    if (!options.includes(current)) options.unshift(current);
    select.innerHTML =
      options.map((m) => `<option value="${m}" ${m === current ? "selected" : ""}>${m}</option>`).join("") +
      `<option value="__custom">Custom model…</option>`;
  };

  populate(provider.models);

  if (cfg.provider === "openrouter") {
    llmOpenRouterModels()
      .then((ids) => populate(ids))
      .catch(() => { /* offline or blocked — keep the short static list */ });
  }

  select.addEventListener("change", () => {
    let model = select.value;
    if (model === "__custom") {
      const entered = prompt("Model identifier (as your provider expects it):", current);
      if (!entered || !entered.trim()) {
        select.value = current;
        return;
      }
      model = entered.trim();
      const opt = document.createElement("option");
      opt.value = model;
      opt.textContent = model;
      select.insertBefore(opt, select.firstChild);
      select.value = model;
    }
    const c = loadLLMConfig();
    c.model = model;
    saveLLMConfig(c);
  });
}

/** Surface this stage's tool worksheets that have captured data. */
function initToolWorksheets() {
  const withData = toolsForPhase(state, phase);
  if (withData.length === 0) return;
  const box = document.createElement("div");
  box.className = "tool-worksheets";
  box.innerHTML =
    `<h3>From tool worksheets</h3>` +
    `<p class="workspace-hint">Data captured at the tool level feeds this stage (and its AI context).</p>` +
    `<ul>` +
    withData
      .map(
        (t) =>
          `<li><a href="../tools/${t.slug}.html">${t.title}</a> — ${t.cards.length} entr${t.cards.length === 1 ? "y" : "ies"}</li>`
      )
      .join("") +
    `</ul>`;
  workspace.insertBefore(box, form);
}

/** Show the user-authored challenge on the problem-space pages. */
function initChallengeDisplay() {
  const section = document.createElement("section");
  section.className = "challenge-display";
  if (state.challenge.trim()) {
    section.innerHTML = `
      <h2>The Challenge</h2>
      <blockquote></blockquote>
      <p class="workspace-hint"><a href="../index.html">Edit it on the Canvas page →</a></p>
    `;
    section.querySelector("blockquote").textContent = `“${state.challenge.trim()}”`;
  } else {
    section.innerHTML = `
      <h2>The Challenge</h2>
      <p class="workspace-hint">No challenge defined yet. The whole process starts from it —
      <a href="../index.html">state your challenge on the Canvas page →</a></p>
    `;
  }
  workspace.insertAdjacentElement("beforebegin", section);
}

function projectContext() {
  const lines = [`Project: ${state.title}`];
  const name = llmUserName();
  if (name) lines.push(`Student: ${name}`);
  if (state.challenge.trim()) lines.push(`Challenge (user-authored): ${state.challenge.trim()}`);
  if (state.foundations.themes) lines.push(`Theme / product category: ${state.foundations.themes}`);
  if (state.foundations.challenge) lines.push(`Challenge selection notes: ${state.foundations.challenge}`);

  const briefFilled = BRIEF_FIELDS.filter(([k]) => state.brief[k].trim());
  if (briefFilled.length) {
    lines.push("Problem Definition (Brief):");
    briefFilled.forEach(([k, label]) => lines.push(`- ${label}: ${state.brief[k]}`));
  }

  const includePhases = phase === "define" ? ["discover", "define"] : [phase];
  includePhases.forEach((p) => {
    const cards = state.cards[p];
    if (cards.length) {
      lines.push(`Existing ${p} cards:`);
      cards.slice(-30).forEach((c) => lines.push(`- ${c.text}`));
    }
    toolsForPhase(state, p).forEach((t) => {
      lines.push(`${t.title} worksheet entries (${p} stage tool):`);
      t.cards.slice(-12).forEach((c) => lines.push(`- ${c.text}`));
    });
  });

  return lines.join("\n").slice(0, 7000);
}

async function suggestCards(statusEl, suggestionsEl) {
  statusEl.textContent = "Contacting your LLM…";
  statusEl.classList.remove("assist-error");
  suggestionsEl.innerHTML = "";
  try {
    const system =
      "You are a design thinking coach helping a student work through the Double Diamond process " +
      "(Discover, Define, Ideate, Make, Evaluate, Develop, Reflect). You help them fill their canvas " +
      "with concise, concrete, stage-appropriate cards. You ask good questions and avoid generic filler.";
    const user =
      `${projectContext()}\n\n` +
      `Current stage: ${STAGE_DESCRIPTIONS[phase]}\n\n` +
      `Suggest 5 new cards for this stage. Each card should be one concrete, specific item ` +
      `(1–2 sentences) appropriate to this stage — not generic advice, and not duplicates of existing cards. ` +
      `If little project information exists yet, suggest cards phrased as sharp questions the student should answer. ` +
      `Respond with ONLY a JSON array of 5 strings.`;

    const text = await llmComplete(system, user);
    const items = llmExtractJSON(text);
    if (!Array.isArray(items) || items.length === 0) throw new Error("Unexpected response format.");

    statusEl.textContent = "Review the suggestions — add the ones you agree with. Verify anything factual.";
    renderSuggestions(suggestionsEl, items.map(String), statusEl);
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent =
      err instanceof TypeError
        ? "The request never reached the provider. If you opened this page as a local file, serve the folder instead " +
          "(python3 -m http.server) — some browsers block API calls from file:// pages."
        : err.message;
  }
}

function renderSuggestions(container, items, statusEl) {
  container.innerHTML = "";

  const addAll = document.createElement("button");
  addAll.type = "button";
  addAll.className = "btn btn-ghost suggestion-add-all";
  addAll.textContent = "Add all";
  addAll.addEventListener("click", () => {
    container.querySelectorAll(".suggestion").forEach((s) => {
      addCard(s.dataset.text);
    });
    container.innerHTML = "";
    statusEl.textContent = "Added.";
  });

  items.forEach((text) => {
    const row = document.createElement("div");
    row.className = "suggestion";
    row.dataset.text = text;

    const p = document.createElement("p");
    p.textContent = text;

    const actions = document.createElement("div");
    actions.className = "suggestion-actions";

    const add = document.createElement("button");
    add.type = "button";
    add.className = "btn btn-add";
    add.textContent = "Add";
    add.addEventListener("click", () => {
      addCard(text);
      row.remove();
    });

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "btn btn-ghost";
    dismiss.textContent = "Dismiss";
    dismiss.addEventListener("click", () => row.remove());

    actions.appendChild(add);
    actions.appendChild(dismiss);
    row.appendChild(p);
    row.appendChild(actions);
    container.appendChild(row);
  });

  container.appendChild(addAll);
}

/* ---------------- Brief: editor on Define ---------------- */

function initBriefEditor() {
  const section = document.createElement("section");
  section.className = "brief brief-editor";
  section.id = "brief";
  section.innerHTML = `
    <h2>Problem Definition (Brief)</h2>
    <p class="workspace-hint">The exit artifact of the first diamond. Everything in the second diamond
    (Ideate, Make, Evaluate, Develop) is framed by what you write here. Synthesize it from your
    Discover and Define cards — or let your LLM draft it, then correct it.</p>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="brief-draft">✦ Draft brief with AI</button>
      <span class="assist-status" id="brief-status"></span>
    </div>
    <div class="brief-fields">
      ${BRIEF_FIELDS.map(
        ([k, label]) => `
        <label class="brief-field">
          <span>${label} <a href="#" class="term" data-term="${BRIEF_TERMS[k]}" title="What does this mean?"></a></span>
          <textarea data-brief="${k}" placeholder="${label}…"></textarea>
        </label>`
      ).join("")}
    </div>
  `;
  // Place after the workspace: the brief is the culmination of Define.
  workspace.insertAdjacentElement("afterend", section);

  section.querySelectorAll("textarea[data-brief]").forEach((ta) => {
    ta.value = state.brief[ta.dataset.brief];
    ta.addEventListener("input", () => {
      state.brief[ta.dataset.brief] = ta.value;
      persist();
    });
  });

  section.querySelector("#brief-draft").addEventListener("click", () => draftBrief(section));
}

async function draftBrief(section) {
  const statusEl = section.querySelector("#brief-status");
  statusEl.textContent = "Drafting…";
  try {
    const system =
      "You are a design thinking coach. You help a student synthesize their Discover and Define work " +
      "into a Problem Definition (design brief) that frames the solution space without prescribing a solution. " +
      "Be specific and grounded in the student's own material; where material is missing, write a pointed placeholder question.";
    const user =
      `${projectContext()}\n\n` +
      `Draft a Problem Definition (Brief) from this material. Respond with ONLY a JSON object with these keys:\n` +
      `"problem" (a needs-based problem statement, not a feature), "users" (users and stakeholders), ` +
      `"needs" (their needs, wants, aspirations), "pov" (the solution point-of-view / approach), ` +
      `"objectives" (objectives and constraints), "success" (measurable success criteria). ` +
      `Each value is 1–3 sentences of plain text.`;

    const text = await llmComplete(system, user);
    const draft = llmExtractJSON(text);

    let filled = 0;
    section.querySelectorAll("textarea[data-brief]").forEach((ta) => {
      const k = ta.dataset.brief;
      if (typeof draft[k] === "string" && draft[k].trim() && !ta.value.trim()) {
        ta.value = draft[k].trim();
        state.brief[k] = ta.value;
        filled++;
      }
    });
    persist();
    statusEl.textContent = filled
      ? `Filled ${filled} empty field(s). This is a draft — verify and rewrite it in your own words.`
      : "All fields already have content — clear a field first if you want a fresh draft for it.";
  } catch (err) {
    statusEl.textContent = err.message;
  }
}

/* ---------------- Brief: display on second-diamond pages ---------------- */

function initBriefDisplay() {
  const section = document.createElement("section");
  section.className = "brief brief-display";
  const filled = BRIEF_FIELDS.filter(([k]) => state.brief[k].trim());

  if (filled.length === 0) {
    section.innerHTML = `
      <h2>Problem Definition (Brief)</h2>
      <p class="workspace-hint">No brief yet. The second diamond needs one — every idea, prototype, and test
      should trace back to it. <a href="define.html#brief">Write the brief on the Define page →</a></p>
    `;
  } else {
    section.innerHTML = `
      <h2>Problem Definition (Brief)</h2>
      <p class="workspace-hint">Work in this stage is framed by the brief. <a href="define.html#brief">Edit it on the Define page →</a></p>
      <dl class="brief-read">
        ${filled.map(([k, label]) => `<div><dt>${label}</dt><dd></dd></div>`).join("")}
      </dl>
    `;
    const dds = section.querySelectorAll("dd");
    filled.forEach(([k], i) => (dds[i].textContent = state.brief[k]));
  }

  workspace.insertAdjacentElement("beforebegin", section);
}
