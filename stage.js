// Stage-page workspace: cards, AI assist, and the Problem Definition (Brief).
// Requires store.js (shared state) and llm.js.

// Glossary term for each brief field's ⓘ link (see glossary.js).
const BRIEF_TERMS = {
  problem: "problem-statement",
  users: "stakeholders",
  needs: "needs",
  pov: "pov",
  hmw: "hmw",
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

// A real project title is required — set it on the Canvas page first.
if (needsProjectTitle(state)) {
  location.replace("../index.html");
} else {
  initAssist();
  initToolWorksheets();
  initTeamPhasePanel();
  if (["discover", "define"].includes(phase)) initChallengeDisplay();
  if (phase === "define") initBriefEditor();
  if (["ideate", "make", "evaluate", "develop"].includes(phase)) initBriefDisplay();
  if (phase === "evaluate") initEvalPlan();
  renderList();
}

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

// The team roster / active-identity switcher lives in team.js's global modal;
// when it changes, refresh both the card list (author tags) and this phase's panel.
document.addEventListener("dtc-team-changed", () => {
  renderList();
  renderTeamPhasePanel();
});

/* ---------------- state ---------------- */

function persist() {
  persistState(state);
}

/* ---------------- cards ---------------- */

function addCard(text) {
  const me = isTeamProject(state) ? activeMember(state) : null;
  state.cards[phase].push(newCard(text, me));
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
    hint.textContent = t("workspace.noCards");
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

  if (isTeamProject(state) && card.authorName) {
    const author = document.createElement("span");
    author.className = "card-author";
    author.textContent = card.authorName;
    meta.appendChild(author);
  }

  const date = document.createElement("span");
  date.className = "card-date";
  date.textContent = new Date(card.created).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const del = document.createElement("button");
  del.className = "card-delete";
  del.type = "button";
  del.textContent = t("workspace.delete");
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
      <h3>${t("assist.heading")}</h3>
      <select class="assist-model" id="assist-model" title="${t("assist.modelLabel")}"></select>
    </div>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="assist-suggest">${t("assist.suggestCards")}</button>
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
      `<option value="__custom">${t("assist.customModel")}</option>`;
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

/** Surface this stage's tool worksheets that have captured data. */
function initToolWorksheets() {
  const withData = toolsForPhase(state, phase);
  if (withData.length === 0) return;
  const box = document.createElement("div");
  box.className = "tool-worksheets";
  box.innerHTML =
    `<h3>${t("toolws.heading")}</h3>` +
    `<p class="workspace-hint">${t("toolws.hint")}</p>` +
    `<ul>` +
    withData
      .map(
        (tl) =>
          `<li><a href="../tools/${tl.slug}.html">${tl.title}</a> — ${tl.cards.length} ${tl.cards.length === 1 ? t("toolws.entry") : t("toolws.entries")}</li>`
      )
      .join("") +
    `</ul>`;
  workspace.insertBefore(box, form);
}

/* ---------------- Team: readiness + gated AI consolidation ----------------
 * Only rendered when the project has a team (team.js's roster modal creates
 * one). Individual cards above are never edited by teammates — this panel
 * only ever *adds* a new, clearly-attributed "Team (consolidated)" card, and
 * only once the team's chosen approval rule is satisfied. The LLM proposes;
 * it never finalizes anything on its own. */

function initTeamPhasePanel() {
  if (!isTeamProject(state)) return;
  const panel = document.createElement("section");
  panel.className = "team-phase-panel";
  panel.id = "team-phase-panel";
  workspace.insertBefore(panel, form);
  renderTeamPhasePanel();
}

function renderTeamPhasePanel() {
  const panel = document.getElementById("team-phase-panel");
  if (!panel || !isTeamProject(state)) return;

  const me = activeMember(state);
  const ps = ensurePhaseStatus(state, phase);
  const drafts = ensureConsolidations(state, phase);
  const pendingDraft = drafts.find((d) => d.status === "draft");

  const statusLabel = { collecting: t("team.status.collecting"), consolidating: t("team.status.consolidating"), locked: t("team.status.locked") }[ps.status];

  const readinessRows = state.team.members
    .map((m) => {
      const ready = isReady(state, phase, m.id);
      const mine = me && me.id === m.id;
      return `
        <li class="team-ready-row">
          <label>
            <input type="checkbox" class="team-ready-check" data-id="${m.id}" ${ready ? "checked" : ""} ${mine ? "" : "disabled"}>
            ${m.name}${mine ? " " + t("team.readyYou") : ""}
          </label>
        </li>`;
    })
    .join("");

  let actionHtml = "";
  if (!me) {
    actionHtml = `<p class="assist-status">${t("team.pickIdentity")}<a href="#" id="team-pick-identity-link">${t("team.pickIdentityLink")}</a></p>`;
  } else if (pendingDraft) {
    const approved = pendingDraft.approvals.length;
    const needed = state.team.settings.approvalRule === "leader" ? 1 : state.team.members.length;
    const iApproved = pendingDraft.approvals.includes(me.id);
    const canIApprove = canApprove(state, me.id) && !iApproved;
    actionHtml = `
      <div class="team-draft">
        <h4>${t("team.draftHeading")}</h4>
        <p class="team-draft-text"></p>
        <p class="workspace-hint">${t("team.draftApprovals")} ${approved}/${needed}</p>
        <div class="settings-actions">
          <button type="button" class="btn btn-add" id="team-approve-btn" ${canIApprove ? "" : "disabled"}>${t("team.approveButton")}</button>
          <button type="button" class="btn btn-ghost" id="team-reject-btn">${t("team.rejectButton")}</button>
        </div>
      </div>`;
  } else if (ps.status === "locked") {
    actionHtml = `<div class="settings-actions">
      ${isLeader(state, me.id) ? `<button type="button" class="btn btn-ghost" id="team-reopen-btn">${t("team.reopenButton")}</button>` : ""}
    </div>`;
  } else {
    const allowed = canConsolidate(state, phase, me.id);
    actionHtml = `
      <div class="settings-actions">
        <button type="button" class="btn btn-add" id="team-consolidate-btn" ${allowed ? "" : "disabled"}>${t("team.consolidateButton")}</button>
        <span class="assist-status" id="team-consolidate-status"></span>
      </div>
      ${allowed ? "" : `<p class="settings-opt">${state.team.settings.approvalRule === "leader" ? t("team.needsLeader") : t("team.needsConsensus")}</p>`}`;
  }

  panel.innerHTML = `
    <h3>${t("team.phaseHeading")} <span class="team-status-badge team-status-${ps.status}">${statusLabel}</span></h3>
    <ul class="team-ready-list">${readinessRows}</ul>
    ${actionHtml}
  `;
  if (pendingDraft) panel.querySelector(".team-draft-text").textContent = pendingDraft.text;

  panel.querySelectorAll(".team-ready-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      setReady(state, phase, cb.dataset.id, cb.checked);
      persist();
      renderTeamPhasePanel();
    });
  });
  panel.querySelector("#team-pick-identity-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof openTeamPanel === "function") openTeamPanel();
  });
  panel.querySelector("#team-consolidate-btn")?.addEventListener("click", () => consolidatePhase());
  panel.querySelector("#team-approve-btn")?.addEventListener("click", () => {
    approveConsolidationDraft(state, phase, pendingDraft.id, me.id);
    persist();
    renderList();
    renderTeamPhasePanel();
  });
  panel.querySelector("#team-reject-btn")?.addEventListener("click", () => {
    rejectConsolidationDraft(state, phase, pendingDraft.id);
    persist();
    renderTeamPhasePanel();
  });
  panel.querySelector("#team-reopen-btn")?.addEventListener("click", () => {
    reopenPhase(state, phase);
    persist();
    renderTeamPhasePanel();
  });
}

async function consolidatePhase() {
  const statusEl = document.getElementById("team-consolidate-status");
  const me = activeMember(state);
  if (!me || !canConsolidate(state, phase, me.id)) return;
  if (!llmConfigured()) {
    statusEl.innerHTML = `${t("assist.noKey")}<a href="../index.html#settings">${t("assist.noKeyLink")}</a>.`;
    return;
  }
  statusEl.textContent = t("assist.contacting");
  try {
    const cards = state.cards[phase];
    const attributed = cards.map((c) => `- (${c.authorName || t("team.unattributed")}): ${c.text}`).join("\n") || t("team.noCardsYet");
    const system =
      "You are a design thinking facilitator. A team submitted individual contributions for one stage; you draft a " +
      "single consolidated team summary from them for the team to review and approve. Preserve genuinely distinct " +
      "ideas; if contributors disagree, say so explicitly rather than flattening it into vague consensus. " +
      "You are proposing a draft — the team decides whether to accept it, not you." + aiLangInstruction();
    const user =
      `${projectContext()}\n\n` +
      `Individual entries submitted for the ${phase} stage:\n${attributed}\n\n` +
      `Write one consolidated summary (a short paragraph or a few bullet-style sentences) synthesizing these into ` +
      `the team's shared position for this stage. Respond with ONLY the summary text, no preamble.`;

    const text = await llmComplete(system, user);
    addConsolidationDraft(state, phase, text.trim(), cards.map((c) => c.id), me.id);
    persist();
    renderTeamPhasePanel();
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = err instanceof TypeError ? t("assist.networkErr") : err.message;
  }
}

/** Show the user-authored challenge on the problem-space pages. */
function initChallengeDisplay() {
  const section = document.createElement("section");
  section.className = "challenge-display";
  if (state.challenge.trim()) {
    const scoped = operativeChallenge(state) !== state.challenge.trim();
    section.innerHTML = `
      <h2>${t("challenge.display.heading")}${scoped ? t("challenge.display.scoped") : ""}</h2>
      <blockquote></blockquote>
      ${scoped ? `<p class="workspace-hint">${t("challenge.display.original")}<em class="orig-challenge"></em></p>` : ""}
      <p class="workspace-hint"><a href="../index.html">${t("challenge.display.editLink")}</a></p>
    `;
    section.querySelector("blockquote").textContent = `“${operativeChallenge(state)}”`;
    if (scoped) section.querySelector(".orig-challenge").textContent = state.challenge.trim();
  } else {
    section.innerHTML = `
      <h2>${t("challenge.display.heading")}</h2>
      <p class="workspace-hint">${t("challenge.display.none")}
      <a href="../index.html">${t("challenge.display.setLink")}</a></p>
    `;
  }
  workspace.insertAdjacentElement("beforebegin", section);
}

function projectContext() {
  const lines = [`Project: ${state.title}`];
  const name = llmUserName();
  if (name) lines.push(`Student: ${name}`);
  if (state.challenge.trim()) lines.push(`Challenge (user-authored): ${state.challenge.trim()}`);
  if (operativeChallenge(state) !== state.challenge.trim()) {
    lines.push(`Scoped-down challenge (the operative one): ${operativeChallenge(state)}`);
  }
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
  // Soft gate: the second diamond's AI assistance requires a brief, so that
  // divergence is anchored to a defined problem (manual cards are always allowed).
  if (["ideate", "make", "evaluate", "develop"].includes(phase) && !briefStarted(state)) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML =
      `${t("assist.gateBlocked")}<a href="define.html#brief">${t("assist.gateBlockedStage")}</a>${t("assist.gateBlockedSuffix")}`;
    return;
  }
  statusEl.textContent = t("assist.contacting");
  statusEl.classList.remove("assist-error");
  suggestionsEl.innerHTML = "";
  try {
    const system =
      "You are a design thinking coach helping a student work through the Double Diamond process " +
      "(Discover, Define, Ideate, Make, Evaluate, Develop, Reflect). You help them fill their canvas " +
      "with concise, concrete, stage-appropriate cards. You ask good questions and avoid generic filler." + aiLangInstruction();
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

    statusEl.textContent = t("assist.reviewCards");
    renderSuggestions(suggestionsEl, items.map(String), statusEl);
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = err instanceof TypeError ? t("assist.networkErr") : err.message;
  }
}

function renderSuggestions(container, items, statusEl) {
  container.innerHTML = "";

  const addAll = document.createElement("button");
  addAll.type = "button";
  addAll.className = "btn btn-ghost suggestion-add-all";
  addAll.textContent = t("assist.addAll");
  addAll.addEventListener("click", () => {
    container.querySelectorAll(".suggestion").forEach((s) => {
      addCard(s.dataset.text);
    });
    container.innerHTML = "";
    statusEl.textContent = t("assist.added");
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
    add.textContent = t("assist.add");
    add.addEventListener("click", () => {
      addCard(text);
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

  container.appendChild(addAll);
}

/* ---------------- Brief: editor on Define ---------------- */

function initBriefEditor() {
  const section = document.createElement("section");
  section.className = "brief brief-editor";
  section.id = "brief";
  section.innerHTML = `
    <h2>${t("brief.heading")}</h2>
    <p class="workspace-hint">${t("brief.editorHint")}</p>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="brief-draft">${t("brief.draftButton")}</button>
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
  statusEl.textContent = t("brief.drafting");
  try {
    const system =
      "You are a design thinking coach. You help a student synthesize their Discover and Define work " +
      "into a Problem Definition (design brief) that frames the solution space without prescribing a solution. " +
      "Be specific and grounded in the student's own material; where material is missing, write a pointed placeholder question." + aiLangInstruction();
    const user =
      `${projectContext()}\n\n` +
      `Draft a Problem Definition (Brief) from this material. Respond with ONLY a JSON object with these keys:\n` +
      `"problem" (a needs-based problem statement, not a feature), "users" (users and stakeholders), ` +
      `"needs" (their needs, wants, aspirations), "pov" (the solution point-of-view / approach), ` +
      `"hmw" (a single 'How might we…?' question derived from the point-of-view — narrow enough to anchor ideas, open enough to allow many), ` +
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
      ? `${t("brief.filled")} ${filled} ${t("brief.filledEmptyFields")}`
      : t("brief.allFilled");
  } catch (err) {
    statusEl.textContent = err.message;
  }
}

/* ---------------- Evaluation plan (Evaluate page) ---------------- */

// Method options with a link to the relevant tool guide.
const EVAL_METHODS = [
  ["User / customer testing", "user-testing"],
  ["Heuristic evaluation (Nielsen's 10)", "expert-panels"],
  ["Cognitive walkthrough", "expert-panels"],
  ["Expert panel review", "expert-panels"],
  ["UX / CX measurement", "ux-cx"],
  ["Interaction & error-recovery audit", "error-recovery"],
  ["Stress / quality testing", "stress-tests"],
  ["A/B comparison", "testing-methods"],
  ["Other", "testing-methods"],
];

function initEvalPlan() {
  const section = document.createElement("section");
  section.className = "brief eval-plan";
  section.id = "eval-plan";
  section.innerHTML = `
    <h2>${t("evalplan.heading")}</h2>
    <p class="workspace-hint">${t("evalplan.hint")}</p>
    <div class="assist-actions">
      <button type="button" class="btn btn-add" id="eval-draft">${t("evalplan.draft")}</button>
      <button type="button" class="btn" id="eval-add-row">${t("evalplan.addRow")}</button>
      <span class="assist-status" id="eval-status"></span>
    </div>
    <div id="eval-rows"></div>
  `;
  workspace.insertAdjacentElement("beforebegin", section);

  section.querySelector("#eval-add-row").addEventListener("click", () => {
    state.evalPlan.push({ id: crypto.randomUUID(), criterion: "", method: "", metric: "", result: "" });
    persist();
    renderEvalRows();
  });
  section.querySelector("#eval-draft").addEventListener("click", draftEvalPlan);

  renderEvalRows();
}

function renderEvalRows() {
  const container = document.getElementById("eval-rows");
  container.innerHTML = "";
  if (state.evalPlan.length === 0) {
    container.innerHTML = `<p class="empty-hint">${t("evalplan.empty")}</p>`;
    return;
  }

  const head = document.createElement("div");
  head.className = "eval-row eval-head";
  head.innerHTML = `<span>${t("evalplan.colCriterion")}</span><span>${t("evalplan.colMethod")}</span><span>${t("evalplan.colMetric")}</span><span>${t("evalplan.colResult")}</span><span></span>`;
  container.appendChild(head);

  state.evalPlan.forEach((row) => {
    const el = document.createElement("div");
    el.className = "eval-row";

    const criterion = document.createElement("textarea");
    criterion.rows = 2;
    criterion.placeholder = t("evalplan.criterionPlaceholder");
    criterion.value = row.criterion;
    criterion.addEventListener("input", () => { row.criterion = criterion.value; persist(); });

    const methodWrap = document.createElement("div");
    methodWrap.className = "eval-method";
    const method = document.createElement("select");
    method.innerHTML =
      `<option value="">${t("evalplan.chooseMethod")}</option>` +
      EVAL_METHODS.map(([m]) => `<option value="${m}" ${row.method === m ? "selected" : ""}>${m}</option>`).join("");
    if (row.method && !EVAL_METHODS.some(([m]) => m === row.method)) {
      method.insertAdjacentHTML("beforeend", `<option value="${row.method}" selected>${row.method}</option>`);
    }
    const guide = document.createElement("a");
    guide.className = "eval-guide";
    guide.target = "_self";
    const setGuide = () => {
      const hit = EVAL_METHODS.find(([m]) => m === method.value);
      if (hit) { guide.href = `../tools/${hit[1]}.html`; guide.textContent = t("evalplan.methodGuide"); guide.hidden = false; }
      else guide.hidden = true;
    };
    method.addEventListener("change", () => { row.method = method.value; persist(); setGuide(); });
    setGuide();
    methodWrap.appendChild(method);
    methodWrap.appendChild(guide);

    const metric = document.createElement("textarea");
    metric.rows = 2;
    metric.placeholder = t("evalplan.metricPlaceholder");
    metric.value = row.metric;
    metric.addEventListener("input", () => { row.metric = metric.value; persist(); });

    const result = document.createElement("textarea");
    result.rows = 2;
    result.placeholder = t("evalplan.resultPlaceholder");
    result.value = row.result;
    result.addEventListener("input", () => { row.result = result.value; persist(); });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "card-delete";
    del.textContent = "✕";
    del.title = t("evalplan.deleteRow");
    del.addEventListener("click", () => {
      state.evalPlan = state.evalPlan.filter((r) => r.id !== row.id);
      persist();
      renderEvalRows();
    });

    el.appendChild(criterion);
    el.appendChild(methodWrap);
    el.appendChild(metric);
    el.appendChild(result);
    el.appendChild(del);
    container.appendChild(el);
  });
}

async function draftEvalPlan() {
  const statusEl = document.getElementById("eval-status");
  if (!briefStarted(state)) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML = `${t("evalplan.needsBrief")}<a href="define.html#brief">${t("evalplan.needsBriefLink")}</a>.`;
    return;
  }
  if (!llmConfigured()) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML = `${t("evalplan.noKey")}<a href="../index.html#settings">${t("evalplan.noKeyLink")}</a>.`;
    return;
  }
  statusEl.classList.remove("assist-error");
  statusEl.textContent = t("evalplan.drafting");
  try {
    const system =
      "You are a design evaluation specialist. You turn a project's success criteria into a rigorous, measurable " +
      "evaluation plan. You only use the project's own criteria and content; you never invent results." + aiLangInstruction();
    const user =
      `${projectContext()}\n\n` +
      `Available methods (use these exact names): ${EVAL_METHODS.map(([m]) => m).join("; ")}.\n\n` +
      `Existing plan rows (do not duplicate): ${state.evalPlan.map((r) => r.criterion).filter(Boolean).join(" | ") || "none"}.\n\n` +
      `Propose evaluation plan rows covering the brief's success criteria (and any other measurable claims in the data). ` +
      `Respond with ONLY a JSON array of objects with keys "criterion" (one testable criterion), ` +
      `"method" (one of the exact method names), "metric" (a concrete metric with a threshold). Leave results out.`;

    const text = await llmComplete(system, user);
    const rows = llmExtractJSON(text);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Unexpected response format.");
    rows.forEach((r) => {
      if (r && (r.criterion || r.metric)) {
        state.evalPlan.push({
          id: crypto.randomUUID(),
          criterion: String(r.criterion || ""),
          method: String(r.method || ""),
          metric: String(r.metric || ""),
          result: "",
        });
      }
    });
    persist();
    renderEvalRows();
    statusEl.textContent = t("evalplan.done");
  } catch (err) {
    statusEl.classList.add("assist-error");
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
      <h2>${t("brief.heading")}</h2>
      <p class="workspace-hint">${t("brief.noBrief")}<a href="define.html#brief">${t("brief.writeLink")}</a></p>
    `;
  } else {
    const hmw = phase === "ideate" && state.brief.hmw.trim();
    section.innerHTML = `
      <h2>${t("brief.heading")}</h2>
      ${hmw ? '<blockquote class="hmw-headline"></blockquote>' : ""}
      <p class="workspace-hint">${t("brief.displayHint")}<a href="define.html#brief">${t("brief.editLink")}</a></p>
      <dl class="brief-read">
        ${filled.map(([k, label]) => `<div><dt>${label}</dt><dd></dd></div>`).join("")}
      </dl>
    `;
    if (hmw) section.querySelector(".hmw-headline").textContent = state.brief.hmw.trim();
    const dds = section.querySelectorAll("dd");
    filled.forEach(([k], i) => (dds[i].textContent = state.brief[k]));
  }

  workspace.insertAdjacentElement("beforebegin", section);
}
