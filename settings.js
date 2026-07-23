// Unified Settings modal: two tabs — "Identity & AI" (your name, about, LLM provider/model/key)
// and "Teams & Canvases" (switch canvases, create/join/leave teams, Export/Import). The team
// tab's contents are rendered by team.js via window.renderTeamSection.
// Requires llm.js, store.js; team.js (optional — the Teams tab is hidden if it isn't loaded).
// Include on every page that has team/canvas features; wires id="open-settings"/.open-settings.

(function () {
  const hasTeams = () => typeof window.renderTeamSection === "function";

  function buildModal() {
    if (document.getElementById("settings-modal")) return;

    const overlay = document.createElement("div");
    overlay.id = "settings-modal";
    overlay.className = "settings-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("settings.title")}">
        <div class="settings-head">
          <h2>${t("settings.title")}</h2>
          <button type="button" class="btn btn-ghost" id="settings-close" aria-label="${t("settings.close")}">✕</button>
        </div>

        <div class="settings-tabs" role="tablist">
          <button type="button" class="settings-tab is-active" data-tab="identity">${t("settings.tab.identity")}</button>
          ${hasTeams() ? `<button type="button" class="settings-tab" data-tab="teams">${t("settings.tab.teams")}</button>` : ""}
        </div>

        <div class="settings-tabpane" data-pane="identity">
          <label class="settings-field">${t("settings.name.label")}
            <input id="set-name" type="text" placeholder="e.g. Dana" autocomplete="name">
          </label>

          <label class="settings-field">${t("settings.about.label")} <span class="settings-opt">${t("settings.about.hint")}</span>
            <textarea id="set-about" rows="3" placeholder="${t("settings.about.placeholder")}"></textarea>
          </label>

          <h3 class="settings-subhead">${t("settings.ai.heading")}</h3>

          <label class="settings-field">${t("settings.provider.label")}
            <select id="set-provider">
              ${Object.entries(LLM_PROVIDERS)
                .map(([id, p]) => `<option value="${id}">${p.label}</option>`)
                .join("")}
            </select>
          </label>

          <label class="settings-field">${t("settings.model.label")} <span class="settings-opt">${t("settings.model.hint")}</span>
            <input id="set-model" type="text" list="set-model-list" autocomplete="off">
            <datalist id="set-model-list"></datalist>
          </label>

          <label class="settings-field">${t("settings.key.label")}
            <input id="set-key" type="password" autocomplete="off">
          </label>

          <p class="llm-note">${t("settings.note")}</p>

          <div class="settings-actions">
            <button type="button" class="btn btn-add" id="settings-save">${t("settings.save")}</button>
            <span class="assist-status" id="settings-status"></span>
          </div>
        </div>

        ${
          hasTeams()
            ? `<div class="settings-tabpane" data-pane="teams" hidden>
                 <div id="team-section"></div>
                 <h3 class="settings-subhead">${t("settings.data.heading")}</h3>
                 <div class="settings-actions">
                   <button type="button" class="btn" id="export-json">${t("header.export")}</button>
                   <button type="button" class="btn" id="import-json">${t("header.import")}</button>
                   <input id="import-file" type="file" accept="application/json" hidden>
                   <span class="assist-status" id="data-status"></span>
                 </div>
                 <p class="settings-opt">${t("settings.data.note")}</p>
               </div>`
            : ""
        }
      </div>
    `;
    document.body.appendChild(overlay);

    const providerSel = overlay.querySelector("#set-provider");
    const modelInput = overlay.querySelector("#set-model");
    const keyInput = overlay.querySelector("#set-key");

    providerSel.addEventListener("change", () => {
      const p = LLM_PROVIDERS[providerSel.value];
      modelInput.placeholder = p.defaultModel;
      keyInput.placeholder = p.keyHint;
      fillModelList(providerSel.value);
    });

    overlay.querySelector("#settings-close").addEventListener("click", closeSettings);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeSettings();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeSettings();
    });

    overlay.querySelectorAll(".settings-tab").forEach((tab) =>
      tab.addEventListener("click", () => selectTab(tab.dataset.tab))
    );

    overlay.querySelector("#settings-save").addEventListener("click", () => {
      const cfg = loadLLMConfig();
      cfg.name = overlay.querySelector("#set-name").value.trim();
      cfg.about = overlay.querySelector("#set-about").value.trim();
      cfg.provider = providerSel.value;
      cfg.model = modelInput.value.trim();
      cfg.key = keyInput.value.trim();
      saveLLMConfig(cfg);
      overlay.querySelector("#settings-status").textContent = t("settings.saved");
      updateButtons();
      document.dispatchEvent(new CustomEvent("dtc-settings-changed"));
    });

    overlay.querySelector("#export-json")?.addEventListener("click", exportCurrentCanvas);
    const importInput = overlay.querySelector("#import-file");
    overlay.querySelector("#import-json")?.addEventListener("click", () => importInput.click());
    importInput?.addEventListener("change", importCanvasFile);
  }

  function selectTab(name) {
    const overlay = document.getElementById("settings-modal");
    if (!overlay) return;
    overlay.querySelectorAll(".settings-tab").forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
    overlay.querySelectorAll(".settings-tabpane").forEach((p) => (p.hidden = p.dataset.pane !== name));
    if (name === "teams" && hasTeams()) {
      const host = overlay.querySelector("#team-section");
      window.renderTeamSection(host);
    }
  }

  /** Populate the model datalist: static list per provider; full live catalog for OpenRouter. */
  function fillModelList(providerId) {
    const datalist = document.getElementById("set-model-list");
    if (!datalist) return;
    const setOptions = (models) => {
      datalist.innerHTML = models.map((m) => `<option value="${m}"></option>`).join("");
    };
    setOptions(LLM_PROVIDERS[providerId]?.models || []);
    if (providerId === "openrouter") {
      llmOpenRouterModels()
        .then(setOptions)
        .catch(() => {});
    }
  }

  function fillModal() {
    const cfg = loadLLMConfig();
    const overlay = document.getElementById("settings-modal");
    overlay.querySelector("#set-name").value = cfg.name || "";
    overlay.querySelector("#set-about").value = cfg.about || "";
    const providerSel = overlay.querySelector("#set-provider");
    providerSel.value = cfg.provider || "anthropic";
    const p = LLM_PROVIDERS[providerSel.value];
    const modelInput = overlay.querySelector("#set-model");
    modelInput.value = cfg.model || "";
    modelInput.placeholder = p.defaultModel;
    const keyInput = overlay.querySelector("#set-key");
    keyInput.value = cfg.key || "";
    keyInput.placeholder = p.keyHint;
    overlay.querySelector("#settings-status").textContent = "";
    fillModelList(providerSel.value);
  }

  /* ---------------- Export / Import (active canvas) ---------------- */

  function exportCurrentCanvas() {
    const st = loadState();
    const cfg = loadLLMConfig();
    const payload = {
      _format: "design-thinking-canvas-export-v1",
      schemaVersion: 2,
      exported: new Date().toISOString(),
      ...st,
      settings: { name: cfg.name || "", about: cfg.about || "", provider: cfg.provider || "", model: cfg.model || "" },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = (st.title || "canvas").trim().replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-") || "canvas";
    a.href = url;
    a.download = `${safe}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Import always lands in a NEW canvas so it never clobbers what you're working on. */
  function importCanvasFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const status = document.getElementById("data-status");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > 2 && !confirm(t("confirm.importNewer"))) {
          e.target.value = "";
          return;
        }
        const st = normalizeState(parsed);
        const id = createCanvas(st.title);
        localStorage.setItem(canvasStateKey(id), JSON.stringify(st));
        setActiveCanvas(id);
        if (parsed.settings && typeof parsed.settings === "object") {
          const cfg = loadLLMConfig();
          ["name", "about", "provider", "model"].forEach((k) => {
            if (typeof parsed.settings[k] === "string") cfg[k] = parsed.settings[k];
          });
          saveLLMConfig(cfg);
        }
        try {
          location.reload();
        } catch {}
      } catch {
        if (status) status.textContent = t("alert.importInvalid");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  window.openSettings = function (tab) {
    buildModal();
    fillModal();
    selectTab(tab === "teams" && hasTeams() ? "teams" : "identity");
    document.getElementById("settings-modal").hidden = false;
  };

  function closeSettings() {
    const overlay = document.getElementById("settings-modal");
    if (overlay) overlay.hidden = true;
  }

  function settingsButtons() {
    return document.querySelectorAll("#open-settings, .open-settings");
  }

  function updateButtons() {
    const cfg = loadLLMConfig();
    const label = cfg.name ? `⚙ ${cfg.name}` : t("header.settings");
    settingsButtons().forEach((b) => (b.textContent = label));
  }

  settingsButtons().forEach((b) => b.addEventListener("click", () => window.openSettings()));
  updateButtons();
  window.updateSettingsButtons = updateButtons;
  document.addEventListener("dtc-team-changed", updateButtons);

  // Deep link: other pages link to index.html#settings when no key is configured.
  if (location.hash === "#settings") window.openSettings();
})();
