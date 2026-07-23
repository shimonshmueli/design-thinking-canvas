// Teams & Canvases section, rendered inside the unified Settings modal (see settings.js).
// A user can hold several canvases — one per team they're on, plus solo ones — switch between
// them, create teams, join teams (each join spins up a new canvas), and leave teams.
//
// Requires store.js (canvas index + state), sync.js (syncConnected/syncCreateProject/
// syncJoinByCode/syncLeaveTeam/currentIdentity/loadSyncProject/loadSyncCreds), llm.js
// (loadLLMConfig), and lang.js (t). Loaded on every page, after sync.js.

(function () {
  function reloadApp() {
    try {
      location.reload();
    } catch {
      /* jsdom / non-browser: no-op */
    }
  }

  function myIdentityFromSettings() {
    const cfg = typeof loadLLMConfig === "function" ? loadLLMConfig() : {};
    return { name: (cfg.name || "").trim(), about: (cfg.about || "").trim() };
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : s;
    return div.innerHTML;
  }

  function notifyChanged() {
    document.dispatchEvent(new CustomEvent("dtc-team-changed"));
  }

  /* ---------------- canvas list ---------------- */

  function canvasListHTML() {
    const canvases = typeof listCanvases === "function" ? listCanvases() : [];
    const activeId = typeof activeCanvasId === "function" ? activeCanvasId() : null;
    const rows = canvases
      .map((c) => {
        const isActive = c.id === activeId;
        const kind = c.projectId ? t("team.canvasTeam") : t("team.canvasSolo");
        const kindClass = c.projectId ? "team" : "solo";
        const title = (c.title || "").trim() || t("titlegate.placeholder") || "Untitled";
        return `
        <li class="canvas-row${isActive ? " is-active" : ""}">
          <span class="canvas-kind ${kindClass}">${kind}</span>
          <span class="canvas-title">${escapeHtml(title)}</span>
          ${
            isActive
              ? `<span class="canvas-current">● ${t("team.canvasCurrent")}</span>`
              : `<button type="button" class="btn btn-ghost canvas-open" data-id="${c.id}">${t("team.canvasOpen")}</button>
                 <button type="button" class="btn btn-ghost canvas-delete" data-id="${c.id}" title="${t("team.canvasDelete")}" aria-label="${t("team.canvasDelete")}">✕</button>`
          }
        </li>`;
      })
      .join("");

    return `
      <h3 class="settings-group-title">${t("team.canvasesHeading")}</h3>
      <ul class="canvas-list">${rows}</ul>
      <div class="settings-actions">
        <button type="button" class="btn" id="canvas-new">${t("team.newCanvas")}</button>
      </div>`;
  }

  /* ---------------- solo (current canvas not on a team) ---------------- */

  function renderSoloPanel() {
    const { name, about } = myIdentityFromSettings();

    if (!name) {
      return `
        <h3 class="settings-group-title">${t("team.title")}</h3>
        <div class="team-settings-required">
          <p>${t("team.settingsRequired")}</p>
          <button type="button" class="btn btn-add" id="team-open-settings">${t("team.openSettings")}</button>
        </div>`;
    }

    const identityLine = `
      <p class="team-identity-line">${t("team.joinAs")}
        <strong${about ? ` title="${escapeHtml(about)}"` : ""}>${escapeHtml(name)}</strong>
        — <a href="#" id="team-edit-identity">${t("team.editInSettings")}</a>
      </p>`;

    return `
      <h3 class="settings-group-title">${t("team.title")}</h3>
      <p class="workspace-hint">${t("team.soloHint")}</p>
      ${identityLine}

      <h4 class="settings-subhead">${t("team.createLabel")}</h4>
      <p class="settings-opt">${t("team.createOnThisCanvas")}</p>
      <div class="settings-actions">
        <button type="button" class="btn btn-add" id="team-create-btn">${t("team.createButton")}</button>
        <span class="assist-status" id="team-create-status"></span>
      </div>

      <h4 class="settings-subhead">${t("team.joinHeading")}</h4>
      <label class="settings-field">${t("team.joinCodeLabel")}
        <input id="team-join-code" type="text" maxlength="6" placeholder="ABC123" autocomplete="off" style="text-transform:uppercase">
      </label>
      <div class="settings-actions">
        <button type="button" class="btn" id="team-join-btn">${t("team.joinButton")}</button>
        <span class="assist-status" id="team-join-status"></span>
      </div>`;
  }

  /* ---------------- team (current canvas connected to a cloud project) ---------------- */

  function renderTeamPanel() {
    const me = currentIdentity(state);
    const leaderView = me && me.role === "leader";
    const project = loadSyncProject() || {};
    const rule = state.team?.settings?.approvalRule || "leader";

    const roster = (state.team?.members || [])
      .map((m) => {
        const about = (m.about || "").trim();
        return `
        <li class="team-member-row">
          <span class="team-member-name${about ? " has-about" : ""}"${about ? ` title="${escapeHtml(about)}"` : ""}>${escapeHtml(m.name)}</span>
          <span class="team-role-badge ${m.role}">${m.role === "leader" ? t("team.roleLeader") : t("team.roleMember")}</span>
        </li>`;
      })
      .join("");

    return `
      <h3 class="settings-group-title">${t("team.title")}</h3>
      <p class="workspace-hint">${t("team.youAre")} <strong>${me ? escapeHtml(me.name) : "?"}</strong> (${me && me.role === "leader" ? t("team.roleLeader") : t("team.roleMember")})</p>

      <div class="team-join-code-box">
        <span class="team-join-code-info">${t("team.joinCodeShareLabel")} <strong class="team-join-code">${escapeHtml(project.joinCode || "")}</strong></span>
        <button type="button" class="btn btn-ghost team-copy-btn" id="team-copy-code">${t("team.copyCode")}</button>
      </div>

      <h4 class="settings-subhead">${t("team.rosterHeading")}</h4>
      <ul class="team-roster">${roster}</ul>

      <h4 class="settings-subhead">${t("team.approvalRuleLabel")}</h4>
      <label class="settings-field settings-radio">
        <input type="radio" name="team-rule" value="leader" ${rule === "leader" ? "checked" : ""} ${leaderView ? "" : "disabled"}>
        ${t("team.approvalRuleLeader")}
      </label>
      <label class="settings-field settings-radio">
        <input type="radio" name="team-rule" value="consensus" ${rule === "consensus" ? "checked" : ""} ${leaderView ? "" : "disabled"}>
        ${t("team.approvalRuleConsensus")}
      </label>
      ${leaderView ? "" : `<p class="settings-opt">${t("team.leaderOnlyHint")}</p>`}

      <p class="settings-opt">${t("team.syncingHint")}</p>

      <div class="settings-actions team-leave-row">
        <button type="button" class="btn btn-danger" id="team-leave-btn">${t("team.leaveButton")}</button>
        <span class="assist-status" id="team-leave-status"></span>
      </div>`;
  }

  /* ---------------- render + wire into a host container ---------------- */

  function renderInto(container) {
    if (!container) return;
    const connected = typeof syncConnected === "function" && syncConnected();
    container.innerHTML =
      `<div class="settings-group">${canvasListHTML()}</div>` +
      `<div class="settings-group">${connected ? renderTeamPanel() : renderSoloPanel()}</div>`;
    wireHandlers(container);
  }

  function wireHandlers(root) {
    // Canvas switch / delete / new
    root.querySelectorAll(".canvas-open").forEach((b) =>
      b.addEventListener("click", () => {
        if (typeof setActiveCanvas === "function" && setActiveCanvas(b.dataset.id)) reloadApp();
      })
    );
    root.querySelectorAll(".canvas-delete").forEach((b) =>
      b.addEventListener("click", () => {
        if (confirm(t("team.deleteCanvasConfirm")) && typeof deleteCanvas === "function") {
          deleteCanvas(b.dataset.id);
          renderInto(root);
          notifyChanged();
        }
      })
    );
    root.querySelector("#canvas-new")?.addEventListener("click", () => {
      if (typeof createCanvas === "function") {
        createCanvas(t("titlegate.placeholder") ? DEFAULT_TITLE : DEFAULT_TITLE);
        reloadApp();
      }
    });

    // Open Settings from prompts / edit-identity link
    root.querySelector("#team-open-settings")?.addEventListener("click", () => {
      if (typeof openSettings === "function") openSettings("identity");
    });
    root.querySelector("#team-edit-identity")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof openSettings === "function") openSettings("identity");
    });

    // Copy join code
    root.querySelector("#team-copy-code")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const code = (loadSyncProject() && loadSyncProject().joinCode) || "";
      const original = btn.textContent;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code);
        } else {
          const ta = document.createElement("textarea");
          ta.value = code;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        btn.textContent = t("team.copied");
      } catch {
        btn.textContent = t("team.copyFailed");
      }
      setTimeout(() => (btn.textContent = original), 1600);
    });

    // Create a team on the current canvas
    root.querySelector("#team-create-btn")?.addEventListener("click", async () => {
      const statusEl = root.querySelector("#team-create-status");
      const name = myIdentityFromSettings().name;
      if (!name) {
        if (typeof openSettings === "function") openSettings("identity");
        return;
      }
      statusEl.textContent = t("team.working");
      statusEl.classList.remove("assist-error");
      try {
        await syncCreateProject(name);
        notifyChanged();
        reloadApp();
      } catch (err) {
        statusEl.classList.add("assist-error");
        statusEl.textContent = err.message;
      }
    });

    // Join a team (spins up a new canvas)
    root.querySelector("#team-join-btn")?.addEventListener("click", async () => {
      const codeInput = root.querySelector("#team-join-code");
      const statusEl = root.querySelector("#team-join-status");
      const code = codeInput.value.trim();
      const name = myIdentityFromSettings().name;
      if (!name) {
        if (typeof openSettings === "function") openSettings("identity");
        return;
      }
      if (!code) {
        codeInput.focus();
        return;
      }
      statusEl.textContent = t("team.working");
      statusEl.classList.remove("assist-error");
      try {
        await syncJoinByCode(code, name);
        notifyChanged();
        reloadApp();
      } catch (err) {
        statusEl.classList.add("assist-error");
        statusEl.textContent = err.message;
      }
    });

    // Approval rule (leader only)
    root.querySelectorAll('input[name="team-rule"]').forEach((radio) => {
      radio.addEventListener("change", async () => {
        if (!radio.checked) return;
        try {
          await syncSetApprovalRule(radio.value);
          renderInto(root);
        } catch (err) {
          alert(err.message);
          renderInto(root);
        }
      });
    });

    // Leave team
    root.querySelector("#team-leave-btn")?.addEventListener("click", async () => {
      const statusEl = root.querySelector("#team-leave-status");
      if (!confirm(t("team.leaveConfirm"))) return;
      statusEl.textContent = t("team.working");
      statusEl.classList.remove("assist-error");
      try {
        await syncLeaveTeam();
        notifyChanged();
        reloadApp();
      } catch (err) {
        statusEl.classList.add("assist-error");
        statusEl.textContent = err.message;
      }
    });
  }

  // Public: settings.js calls this to fill the "Teams & Canvases" tab.
  window.renderTeamSection = renderInto;

  // Back-compat: anything that used to open the team modal now opens the unified Settings modal
  // on the Teams tab.
  window.openTeamPanel = function () {
    if (typeof openSettings === "function") openSettings("teams");
  };

  // Keep the open Teams tab fresh when team state changes (e.g. a poll pulled a new roster).
  document.addEventListener("dtc-team-changed", () => {
    const pane = document.querySelector('.settings-tabpane[data-pane="teams"]');
    const host = document.getElementById("team-section");
    if (pane && !pane.hidden && host) renderInto(host);
  });
})();
