// Team roster + "acting as" identity switcher. Global, mounted on every page.
// Requires store.js (state, persist, team helpers) and lang.js (t).
// Include on every page; wires any element with id="open-team" or class="open-team".
//
// This module owns team creation/roster/approval-rule and the local identity
// switch. Per-phase readiness and consolidation live in stage.js, which reads
// the same state.team / activeMember() and listens for "dtc-team-changed" to
// refresh when the roster or acting member changes here.

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
    overlay.innerHTML = isTeamProject(state) ? renderTeamPanel() : renderSoloPanel();
    wireHandlers(overlay);
  }

  function renderSoloPanel() {
    return `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("team.title")}">
        <div class="settings-head">
          <h2>${t("team.title")}</h2>
          <button type="button" class="btn btn-ghost" id="team-close" aria-label="${t("team.close")}">✕</button>
        </div>
        <p class="workspace-hint">${t("team.soloHint")}</p>
        <label class="settings-field">${t("team.createLabel")}
          <input id="team-create-name" type="text" placeholder="${t("team.createPlaceholder")}" autocomplete="name">
        </label>
        <div class="settings-actions">
          <button type="button" class="btn btn-add" id="team-create-btn">${t("team.createButton")}</button>
        </div>
      </div>
    `;
  }

  function renderTeamPanel() {
    const me = activeMember(state);
    const leaderView = me && isLeader(state, me.id);
    const rule = state.team.settings.approvalRule;

    const roster = state.team.members
      .map(
        (m) => `
        <li class="team-member-row">
          <span class="team-member-name">${escapeHtml(m.name)}</span>
          <span class="team-role-badge ${m.role}">${m.role === "leader" ? t("team.roleLeader") : t("team.roleMember")}</span>
          ${leaderView ? `<button type="button" class="card-delete team-remove" data-id="${m.id}" title="${t("team.removeMember")}">✕</button>` : ""}
        </li>`
      )
      .join("");

    return `
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="${t("team.title")}">
        <div class="settings-head">
          <h2>${t("team.title")}</h2>
          <button type="button" class="btn btn-ghost" id="team-close" aria-label="${t("team.close")}">✕</button>
        </div>

        <h3 class="settings-subhead">${t("team.rosterHeading")}</h3>
        <ul class="team-roster">${roster}</ul>

        ${
          leaderView
            ? `
        <div class="team-add-row">
          <input id="team-add-name" type="text" placeholder="${t("team.addMemberPlaceholder")}" autocomplete="off">
          <button type="button" class="btn" id="team-add-btn">${t("team.addMemberButton")}</button>
        </div>`
            : `<p class="settings-opt">${t("team.leaderOnlyHint")}</p>`
        }

        <h3 class="settings-subhead">${t("team.approvalRuleLabel")}</h3>
        <label class="settings-field settings-radio">
          <input type="radio" name="team-rule" value="leader" ${rule === "leader" ? "checked" : ""} ${leaderView ? "" : "disabled"}>
          ${t("team.approvalRuleLeader")}
        </label>
        <label class="settings-field settings-radio">
          <input type="radio" name="team-rule" value="consensus" ${rule === "consensus" ? "checked" : ""} ${leaderView ? "" : "disabled"}>
          ${t("team.approvalRuleConsensus")}
        </label>

        <h3 class="settings-subhead">${t("team.actingAsLabel")}</h3>
        <select id="team-active-select">
          ${state.team.members.map((m) => `<option value="${m.id}" ${me && me.id === m.id ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}
        </select>
        <p class="settings-opt">${t("team.actingAsHint")}</p>
      </div>
    `;
  }

  function wireHandlers(overlay) {
    overlay.querySelector("#team-close")?.addEventListener("click", closeTeam);

    overlay.querySelector("#team-create-btn")?.addEventListener("click", () => {
      const input = overlay.querySelector("#team-create-name");
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      createTeam(state, name);
      persist();
      render();
      notifyChanged();
    });

    overlay.querySelector("#team-add-btn")?.addEventListener("click", () => {
      const input = overlay.querySelector("#team-add-name");
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      addTeamMember(state, name);
      persist();
      render();
      notifyChanged();
    });

    overlay.querySelectorAll(".team-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (isLeader(state, id) && state.team.members.filter((m) => m.role === "leader").length <= 1) {
          alert(t("team.cannotRemoveLastLeader"));
          return;
        }
        removeTeamMember(state, id);
        if (loadActiveMemberId() === id) setActiveMember(state.team.members[0]?.id || null);
        persist();
        render();
        notifyChanged();
      });
    });

    overlay.querySelectorAll('input[name="team-rule"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        setApprovalRule(state, radio.value);
        persist();
        notifyChanged();
      });
    });

    overlay.querySelector("#team-active-select")?.addEventListener("change", (e) => {
      setActiveMember(e.target.value);
      render();
      notifyChanged();
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
    const label = isTeamProject(state)
      ? (() => {
          const me = activeMember(state);
          return `${t("team.headerLabelTeam")}${me ? " · " + me.name : ""}`;
        })()
      : t("team.headerLabelSolo");
    teamButtons().forEach((b) => (b.textContent = label));
  }

  teamButtons().forEach((b) => b.addEventListener("click", window.openTeamPanel));
  updateButtons();
  window.updateTeamButtons = updateButtons;
})();
