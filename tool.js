// Tool-page worksheet: capture data while applying a tool (e.g., Competitive
// Analysis findings), with AI assist. Entries feed the parent stage: they appear
// in the stage's "From tool worksheets" list, are included in the stage's AI
// context, and can be promoted into stage cards.
// Requires store.js and llm.js.

const article = document.querySelector(".doc-article");
const phase = article.dataset.phase;
const slug = article.dataset.tool;
const toolTitle = article.querySelector("h1").textContent.trim();

const form = document.getElementById("card-form");
const list = document.getElementById("card-list");
const workspace = document.getElementById("workspace");

let state = loadState();

// A real project title is required — set it on the Canvas page first.
if (needsProjectTitle(state)) {
  location.replace("../index.html");
} else {
  ensureTool();
  initAssist();
  renderList();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value.trim();
  if (!text) return;
  addEntry(text);
  textarea.value = "";
  textarea.focus();
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    state = loadState();
    ensureTool();
    renderList();
  }
});

function ensureTool() {
  if (!state.tools[slug]) state.tools[slug] = { phase, title: toolTitle, cards: [] };
  state.tools[slug].phase = phase;
  state.tools[slug].title = toolTitle;
}

function entries() {
  return state.tools[slug].cards;
}

function persist() {
  persistState(state);
}

/* ---------------- entries ---------------- */

function addEntry(text) {
  const me = isTeamProject(state) ? activeMember(state) : null;
  entries().push(newCard(text, me));
  persist();
  renderList();
}

function updateEntry(id, text) {
  const card = entries().find((c) => c.id === id);
  if (!card) return;
  card.text = text;
  persist();
}

function deleteEntry(id) {
  state.tools[slug].cards = entries().filter((c) => c.id !== id);
  persist();
  renderList();
}

/** Copy an entry up into the parent stage's cards, tagged with the tool name. */
function promoteEntry(card, btn) {
  state.cards[phase].push(newCard(`[${toolTitle}] ${card.text}`));
  persist();
  btn.textContent = t("workspace.sent");
  btn.disabled = true;
}

function renderList() {
  list.innerHTML = "";
  if (entries().length === 0) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = t("toolpage.noEntries");
    list.appendChild(hint);
    return;
  }
  entries().forEach((card) => list.appendChild(renderEntry(card)));
}

function renderEntry(card) {
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
      deleteEntry(card.id);
      return;
    }
    updateEntry(card.id, text);
  });

  const meta = document.createElement("div");
  meta.className = "card-meta";

  if (isTeamProject(state) && card.authorName) {
    const author = document.createElement("span");
    author.className = "card-author";
    author.textContent = card.authorName;
    meta.appendChild(author);
  }

  const date = document.createElement("span");
  date.className = "card-date";
  date.textContent = new Date(card.created).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const actions = document.createElement("span");
  actions.className = "card-actions";

  const promote = document.createElement("button");
  promote.className = "card-promote";
  promote.type = "button";
  promote.textContent = t("workspace.sendToStage");
  promote.title = `Add this entry as a card in the ${phase} stage`;
  promote.addEventListener("click", () => promoteEntry(card, promote));

  const del = document.createElement("button");
  del.className = "card-delete";
  del.type = "button";
  del.textContent = t("workspace.delete");
  del.addEventListener("click", () => deleteEntry(card.id));

  actions.appendChild(promote);
  actions.appendChild(del);
  meta.appendChild(date);
  meta.appendChild(actions);
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
      <h3>${t("assist.heading")}</h3>
      <select class="assist-model" id="assist-model" title="${t("assist.modelLabel")}"></select>
    </div>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="assist-suggest">${t("assist.suggestEntries")}</button>
      <span class="assist-status" id="assist-status"></span>
    </div>
    <div id="assist-suggestions"></div>
  `;
  workspace.insertBefore(panel, form);

  const statusEl = panel.querySelector("#assist-status");
  initModelSelect(panel.querySelector("#assist-model"));

  if (!llmConfigured()) {
    statusEl.innerHTML = `${t("assist.noKey")}<a href="../index.html#settings">${t("assist.noKeyLink")}</a>.`;
  } else if (!llmUserName() && !(loadLLMConfig().about || "").trim()) {
    statusEl.innerHTML = `${t("assist.aboutNudge")}<a href="../index.html#settings">${t("assist.aboutNudgeLink")}</a>${t("assist.aboutNudgeSuffix")}`;
  }

  panel
    .querySelector("#assist-suggest")
    .addEventListener("click", () => suggest(statusEl, panel.querySelector("#assist-suggestions")));
}

/** Same compact model picker as stage pages. */
function initModelSelect(select) {
  const cfg = loadLLMConfig();
  const provider = LLM_PROVIDERS[cfg.provider] || LLM_PROVIDERS.anthropic;
  const current = cfg.model || provider.defaultModel;

  const populate = (models) => {
    const options = [...models];
    if (!options.includes(current)) options.unshift(current);
    select.innerHTML =
      options.map((m) => `<option value="${m}" ${m === current ? "selected" : ""}>${m}</option>`).join("") +
      `<option value="__custom">${t("assist.customModel")}</option>`;
  };

  populate(provider.models);
  if (cfg.provider === "openrouter") {
    llmOpenRouterModels().then(populate).catch(() => {});
  }

  select.addEventListener("change", () => {
    let model = select.value;
    if (model === "__custom") {
      const entered = prompt(t("assist.customModelPrompt"), current);
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

function toolDescription() {
  // First paragraph after the "What it is" heading on this page.
  const p = article.querySelector("h2 + p");
  return p ? p.textContent.trim() : "";
}

function toolContext() {
  const lines = [`Project: ${state.title}`];
  const name = llmUserName();
  if (name) lines.push(`Student: ${name}`);
  if (state.challenge.trim()) lines.push(`Challenge (user-authored): ${state.challenge.trim()}`);
  if (operativeChallenge(state) !== state.challenge.trim()) {
    lines.push(`Scoped-down challenge (the operative one): ${operativeChallenge(state)}`);
  }
  if (state.foundations.themes) lines.push(`Theme / product category: ${state.foundations.themes}`);

  const briefFilled = BRIEF_FIELDS.filter(([k]) => state.brief[k].trim());
  if (briefFilled.length) {
    lines.push("Problem Definition (Brief):");
    briefFilled.forEach(([k, label]) => lines.push(`- ${label}: ${state.brief[k]}`));
  }

  const stageCards = state.cards[phase];
  if (stageCards.length) {
    lines.push(`Existing ${phase} stage cards:`);
    stageCards.slice(-15).forEach((c) => lines.push(`- ${c.text}`));
  }

  if (entries().length) {
    lines.push(`Existing ${toolTitle} worksheet entries:`);
    entries().slice(-20).forEach((c) => lines.push(`- ${c.text}`));
  }

  return lines.join("\n").slice(0, 7000);
}

async function suggest(statusEl, suggestionsEl) {
  if (["ideate", "make", "evaluate", "develop"].includes(phase) && !briefStarted(state)) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML =
      `${t("assist.gateBlocked")}<a href="../stages/define.html#brief">${t("assist.gateBlockedStage")}</a>${t("assist.gateBlockedSuffixTool")}`;
    return;
  }
  statusEl.textContent = t("assist.contacting");
  statusEl.classList.remove("assist-error");
  suggestionsEl.innerHTML = "";
  try {
    const system =
      "You are a design thinking coach. The student is applying a specific design method to their project " +
      "and capturing findings in a worksheet. Suggest concrete, project-specific worksheet entries — " +
      "real starting points they can verify and refine, or sharp questions the method should answer. No generic advice." + aiLangInstruction();
    const user =
      `${toolContext()}\n\n` +
      `The tool being applied (${phase} stage): ${toolTitle}. ${toolDescription()}\n\n` +
      `Suggest 5 worksheet entries for applying ${toolTitle} to this project. ` +
      `Each entry: 1–2 sentences, concrete and specific (e.g., for a competitive analysis: a named competitor or ` +
      `substitute and what to examine about it; for personas: a candidate persona sketch grounded in the project). ` +
      `If project information is thin, phrase entries as pointed questions to answer. ` +
      `Do not duplicate existing entries. Respond with ONLY a JSON array of 5 strings.`;

    const text = await llmComplete(system, user);
    const items = llmExtractJSON(text);
    if (!Array.isArray(items) || items.length === 0) throw new Error("Unexpected response format.");

    statusEl.textContent = t("assist.reviewEntries");
    renderSuggestions(suggestionsEl, items.map(String), statusEl);
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = err instanceof TypeError ? t("assist.networkErr") : err.message;
  }
}

function renderSuggestions(container, items, statusEl) {
  container.innerHTML = "";

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
    add.textContent = t("assist.add");
    add.addEventListener("click", () => {
      addEntry(text);
      row.remove();
    });

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "btn btn-ghost";
    dismiss.textContent = t("assist.dismiss");
    dismiss.addEventListener("click", () => row.remove());

    actions.appendChild(add);
    actions.appendChild(dismiss);
    row.appendChild(p);
    row.appendChild(actions);
    container.appendChild(row);
  });

  const addAll = document.createElement("button");
  addAll.type = "button";
  addAll.className = "btn btn-ghost suggestion-add-all";
  addAll.textContent = t("assist.addAll");
  addAll.addEventListener("click", () => {
    container.querySelectorAll(".suggestion").forEach((s) => addEntry(s.dataset.text));
    container.innerHTML = "";
    statusEl.textContent = t("assist.added");
  });
  container.appendChild(addAll);
}
