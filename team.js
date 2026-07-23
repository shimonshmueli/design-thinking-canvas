// Team roster + cloud connection. Global, mounted on every page.
// Requires store.js (state, persist, PHASES), sync.js (syncConnected/syncCreateProject/
// syncJoinByCode/currentIdentity/etc.), and lang.js (t).
// Include on every page; wires any element with id="open-team" or class="open-team".
//
// Starting or joining a team here creates/attaches a real cloud project (see sync.js) — from
// that point on, every device that joins with the same code stays in sync via polling. Local
// solo projects (no team) are completely unaffected by this file.

(function () {
  function buildModal() {
    if (document.getElementById("team-modal")) return;

    const overlay = document.createElement("div");
    overlay.id = "team-modal";
    overlay.className = "settings-overlay";
    overlay.hidden = true;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeTeam();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) closeTeam();
    });
  }

  function render() {
    const overlay = document.getElementById("team-modal");
    if (!overlay) return;
    overlay.innerHTML = syncConnected() ? renderTeamPanel() : renderSoloPanel();
    wireHandlers(overlay);
  }

  function myIdentityFromSettings() {
    const cfg = typeof loadLLMConfig === "function" ? loadLLMConfig() : {};
    return { name: (cfg.name || "").trim(), about: (cfg.about || "").trim() };
  }

  function renderSoloPanel() {
    const { name, about } = myIdentityFromSettings();
    const head = `
        <div class="settings-head">
          <h2>${t("team.title")}</h2>
          <button type="button" class="btn btn-ghost" id="team-close" aria-label="${t("team.close")}">✕</button>
        </div>`;

    // Your identity in a team comes from Settings (name + "about yourself"). Require a name
    // before a team can be created or joined — no separate name entry here.
    if (!name) {
      return `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("team.title")}">
        ${head}
        <p class="workspace-hint">${t("team.soloHint")}</p>
        <div class="team-settings-required">
          <p>${t("team.settingsRequired")}</p>
          <button type="button" class="btn btn-add" id="team-open-settings">${t("team.openSettings")}</button>
        </div>
      </div>`;
    }

    const identityLine = `
        <p class="team-identity-line">${t("team.joinAs")}
          <strong${about ? ` title="${escapeHtml(about)}"` : ""}>${escapeHtml(name)}</strong>
          — <a href="#" id="team-edit-identity">${t("team.editInSettings")}</a>
        </p>`;

    return `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("team.title")}">
        ${head}
        <p class="workspace-hint">${t("team.soloHint")}</p>
        ${identityLine}

        <h3 class="settings-subhead">${t("team.createLabel")}</h3>
        <div class="settings-actions">
          <button type="button" class="btn btn-add" id="team-create-btn">${t("team.createButton")}</button>
          <span class="assist-status" id="team-create-status"></span>
        </div>

        <h3 class="settings-subhead">${t("team.joinHeading")}</h3>
        <label class="settings-field">${t("team.joinCodeLabel")}
          <input id="team-join-code" type="text" maxlength="6" placeholder="ABC123" autocomplete="off" style="text-transform:uppercase">
        </label>
        <div class="settings-actions">
          <button type="button" class="btn" id="team-join-btn">${t("team.joinButton")}</button>
          <span class="assist-status" id="team-join-status"></span>
        </div>
      </div>
    `;
  }

  function renderTeamPanel() {
    const me = currentIdentity(state);
    const leaderView = me && me.role === "leader";
    const project = loadSyncProject();
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
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("team.title")}">
        <div class="settings-head">
          <h2>${t("team.title")}</h2>
          <button type="button" class="btn btn-ghost" id="team-close" aria-label="${t("team.close")}">✕</button>
        </div>

        <p class="workspace-hint">${t("team.youAre")} <strong>${me ? escapeHtml(me.name) : "?"}</strong> (${me && me.role === "leader" ? t("team.roleLeader") : t("team.roleMember")})</p>

        <div class="team-join-code-box">
          <span class="team-join-code-info">${t("team.joinCodeShareLabel")} <strong class="team-join-code">${escapeHtml(project.joinCode)}</strong></span>
          <button type="button" class="btn btn-ghost team-copy-btn" id="team-copy-code">${t("team.copyCode")}</button>
        </div>

        <h3 class="settings-subhead">${t("team.rosterHeading")}</h3>
        <ul class="team-roster">${roster}</ul>

        <h3 class="settings-subhead">${t("team.approvalRuleLabel")}</h3>
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
      </div>
    `;
  }

  function wireHandlers(overlay) {
    overlay.querySelector("#team-close")?.addEventListener("click", closeTeam);

    overlay.querySelector("#team-copy-code")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const code = loadSyncProject()?.joinCode || "";
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
      } catch (err) {
        btn.textContent = t("team.copyFailed");
      }
      setTimeout(() => {
        btn.textContent = original;
      }, 1600);
    });

    // Open Settings from the "set your name first" prompt or the "edit in Settings" link.
    overlay.querySelector("#team-open-settings")?.addEventListener("click", () => {
      if (typeof openSettings === "function") openSettings();
    });
    overlay.querySelector("#team-edit-identity")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof openSettings === "function") openSettings();
    });

    overlay.querySelector("#team-create-btn")?.addEventListener("click", async () => {
      const statusEl = overlay.querySelector("#team-create-status");
      const name = myIdentityFromSettings().name;
      if (!name) {
        if (typeof openSettings === "function") openSettings();
        return;
      }
      statusEl.textContent = t("team.working");
      statusEl.classList.remove("assist-error");
      try {
        await syncCreateProject(name);
        render();
        notifyChanged();
      } catch (err) {
        statusEl.classList.add("assist-error");
        statusEl.textContent = err.message;
      }
    });

    overlay.querySelector("#team-join-btn")?.addEventListener("click", async () => {
      const codeInput = overlay.querySelector("#team-join-code");
      const statusEl = overlay.querySelector("#team-join-status");
      const code = codeInput.value.trim();
      const name = myIdentityFromSettings().name;
      if (!name) {
        if (typeof openSettings === "function") openSettings();
        return;
      }
      if (!code) {
        codeInput.focus();
        return;
      }
      statusEl.textContent = t("team.working");
      statusEl.classList.remove("assist-error");

      const hadLocalWork = PHASES.some((p) => (state.cards[p] || []).length > 0);
      const localSnapshot = hadLocalWork ? JSON.parse(JSON.stringify(state.cards)) : null;

      try {
        await syncJoinByCode(code, name);
        if (localSnapshot && confirm(t("team.importPrompt"))) {
          const project = loadSyncProject();
          const creds = loadSyncCreds(project.projectId);
          for (const phase of PHASES) {
            for (const card of localSnapshot[phase] || []) {
              await apiFetch(`/api/projects/${project.projectId}/entries`, {
                method: "POST",
                body: JSON.stringify({ phase, memberId: creds.memberId, secret: creds.secret, text: card.text }),
              }).catch(() => {});
            }
          }
          await pullState();
        }
        render();
        notifyChanged();
      } catch (err) {
        statusEl.classList.add("assist-error");
        statusEl.textContent = err.message;
      }
    });

    overlay.querySelectorAll('input[name="team-rule"]').forEach((radio) => {
      radio.addEventListener("change", async () => {
        if (!radio.checked) return;
        try {
          await syncSetApprovalRule(radio.value);
          render();
        } catch (err) {
          alert(err.message);
          render();
        }
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function notifyChanged() {
    document.dispatchEvent(new CustomEvent("dtc-team-changed"));
    updateButtons();
  }

  window.openTeamPanel = function () {
    buildModal();
    render();
    document.getElementById("team-modal").hidden = false;
  };

  function closeTeam() {
    const overlay = document.getElementById("team-modal");
    if (overlay) overlay.hidden = true;
  }

  function teamButtons() {
    return document.querySelectorAll("#open-team, .open-team");
  }

  function updateButtons() {
    const label = syncConnected()
      ? (() => {
          const me = currentIdentity(state);
          return `${t("team.headerLabelTeam")}${me ? " · " + me.name : ""}`;
        })()
      : t("team.headerLabelSolo");
    teamButtons().forEach((b) => (b.textContent = label));
  }

  teamButtons().forEach((b) => b.addEventListener("click", window.openTeamPanel));
  updateButtons();
  window.updateTeamButtons = updateButtons;
  document.addEventListener("dtc-team-changed", updateButtons);
  // If the person edits their name/about in Settings while the team panel is open, reflect it.
  document.addEventListener("dtc-settings-changed", () => {
    const overlay = document.getElementById("team-modal");
    if (overlay && !overlay.hidden) render();
  });
})();
