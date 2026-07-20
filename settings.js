// Global user settings: name, LLM provider, model, API key.
// Requires llm.js (loadLLMConfig / saveLLMConfig / LLM_PROVIDERS).
// Include on every page; wires any element with id="open-settings" or class="open-settings".

(function () {
  function buildModal() {
    if (document.getElementById("settings-modal")) return;

    const overlay = document.createElement("div");
    overlay.id = "settings-modal";
    overlay.className = "settings-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="Settings">
        <div class="settings-head">
          <h2>Settings</h2>
          <button type="button" class="btn btn-ghost" id="settings-close" aria-label="Close">✕</button>
        </div>

        <label class="settings-field">Your name
          <input id="set-name" type="text" placeholder="e.g. Dana" autocomplete="name">
        </label>

        <h3 class="settings-subhead">AI assistant — bring your own key</h3>

        <label class="settings-field">Provider
          <select id="set-provider">
            ${Object.entries(LLM_PROVIDERS)
              .map(([id, p]) => `<option value="${id}">${p.label}</option>`)
              .join("")}
          </select>
        </label>

        <label class="settings-field">Model <span class="settings-opt">(optional — leave blank for the default; type to search)</span>
          <input id="set-model" type="text" list="set-model-list" autocomplete="off">
          <datalist id="set-model-list"></datalist>
        </label>

        <label class="settings-field">API key
          <input id="set-key" type="password" autocomplete="off">
        </label>

        <p class="llm-note">Your name and key are stored only in this browser (localStorage). The key is sent
        only to the provider you select, directly from your browser. Don't enter your key on a shared or
        public computer.</p>

        <div class="settings-actions">
          <button type="button" class="btn btn-add" id="settings-save">Save</button>
          <span class="assist-status" id="settings-status"></span>
        </div>
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

    overlay.querySelector("#settings-save").addEventListener("click", () => {
      const cfg = loadLLMConfig();
      cfg.name = overlay.querySelector("#set-name").value.trim();
      cfg.provider = providerSel.value;
      cfg.model = modelInput.value.trim();
      cfg.key = keyInput.value.trim();
      saveLLMConfig(cfg);
      overlay.querySelector("#settings-status").textContent = "Saved.";
      updateButtons();
      setTimeout(closeSettings, 500);
    });
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
        .catch(() => { /* offline — keep the short static list */ });
    }
  }

  function fillModal() {
    const cfg = loadLLMConfig();
    const overlay = document.getElementById("settings-modal");
    overlay.querySelector("#set-name").value = cfg.name || "";
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

  window.openSettings = function () {
    buildModal();
    fillModal();
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
    const label = cfg.name ? `⚙ ${cfg.name}` : "⚙ Settings";
    settingsButtons().forEach((b) => (b.textContent = label));
  }

  settingsButtons().forEach((b) => b.addEventListener("click", window.openSettings));
  updateButtons();

  // Deep link: stage pages link to index.html#settings when no key is configured.
  if (location.hash === "#settings") window.openSettings();
})();
