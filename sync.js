// Cloud sync: connects the local team data model (store.js) to the real backend (/api/*,
// see the vercel-app deployment). Everything here is additive and opt-in — when no project
// is connected, every function below is a no-op and the app behaves exactly as the pure
// local/solo prototype always did.
//
// Design: local-first + poll-merge. Local mutations still happen immediately (via store.js,
// unchanged) for a responsive UI; sync.js fires the same change at the server in the
// background, and a periodic pull replaces state.cards/team/phaseStatus/consolidations with
// the server's authoritative copy so every device converges within one poll interval.
//
// Requires store.js (state, persist, PHASES) to already be loaded and initialized — load this
// AFTER app.js/stage.js/tool.js/report.js, and BEFORE team.js (which calls into this).

const SYNC_POLL_MS = 4000;

let suppressPush = false;
let pushTimer = null;
let pollTimer = null;

/* ---------------- connection state ----------------
 * The cloud link lives on the ACTIVE canvas's metadata (store.js), so a user can have several
 * canvases — some solo, some tied to different teams — and "connected" always means "the canvas
 * I'm currently looking at is a team canvas". */

function loadSyncProject() {
  const meta = typeof getActiveCanvasMeta === "function" ? getActiveCanvasMeta() : null;
  if (meta && meta.projectId) return { projectId: meta.projectId, joinCode: meta.joinCode || null };
  return null;
}

function saveSyncProject(info) {
  if (typeof updateCanvasMeta !== "function" || typeof activeCanvasId !== "function") return;
  updateCanvasMeta(activeCanvasId(), { projectId: info.projectId, joinCode: info.joinCode || null });
}

function clearSyncProject() {
  if (typeof updateCanvasMeta !== "function" || typeof activeCanvasId !== "function") return;
  updateCanvasMeta(activeCanvasId(), { projectId: null, joinCode: null, role: null });
}

function syncConnected() {
  const p = loadSyncProject();
  return !!(p && p.projectId);
}

function credsKey(projectId) {
  return `dtc-sync-creds-${projectId}`;
}

function loadSyncCreds(projectId) {
  try {
    return JSON.parse(localStorage.getItem(credsKey(projectId)));
  } catch {
    return null;
  }
}

function saveSyncCreds(projectId, creds) {
  localStorage.setItem(credsKey(projectId), JSON.stringify(creds));
}

/** "Who am I" for the connected cloud project, in the same {id,name,role} shape store.js's
 *  activeMember() uses — stage.js/tool.js call this instead of activeMember() so the same
 *  rendering code works whether the project is local-only or cloud-connected. */
function currentIdentity(st) {
  if (syncConnected()) {
    const p = loadSyncProject();
    const creds = loadSyncCreds(p.projectId);
    return creds ? { id: creds.memberId, name: creds.name, role: creds.role } : null;
  }
  return typeof activeMember === "function" ? activeMember(st) : null;
}

/* ---------------- HTTP ---------------- */

async function apiFetch(path, opts) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts && opts.headers) },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const err = new Error((body && body.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

/* ---------------- creating / joining a cloud project ---------------- */

/** Turn the current (possibly solo) project into a cloud project: creates it on the server,
 *  makes `name` its leader, uploads the current scalar fields, and imports any existing local
 *  cards as this leader's own attributed entries (nothing is silently merged from anyone
 *  else — there isn't anyone else yet). Returns { projectId, joinCode }. */
async function syncCreateProject(name) {
  const about = typeof loadLLMConfig === "function" ? (loadLLMConfig().about || "").trim() : "";
  const created = await apiFetch("/api/projects", { method: "POST", body: JSON.stringify({ title: state.title }) });
  saveSyncProject({ projectId: created.projectId, joinCode: created.joinCode });

  const team = await apiFetch(`/api/projects/${created.projectId}/team`, {
    method: "POST",
    body: JSON.stringify({ name, about }),
  });
  saveSyncCreds(created.projectId, { memberId: team.member.id, secret: team.secret, name: team.member.name, role: team.member.role });
  if (typeof updateCanvasMeta === "function") updateCanvasMeta(activeCanvasId(), { role: team.member.role });

  await apiFetch(`/api/projects/${created.projectId}`, {
    method: "PATCH",
    body: JSON.stringify({
      challenge: state.challenge,
      foundations: state.foundations,
      selection: state.selection,
      brief: state.brief,
      evalPlan: state.evalPlan,
    }),
  });

  await importLocalCardsAsEntries(created.projectId, team.member.id, team.secret);
  await pullState();
  restartSyncPolling();
  return { projectId: created.projectId, joinCode: created.joinCode };
}

/** Join an existing cloud project by its 6-character code. This always spins up a NEW canvas
 *  for that team and switches to it — the canvas you were on stays exactly as it was, so being
 *  on several teams means having several independent canvases. */
async function syncJoinByCode(code, name) {
  const about = typeof loadLLMConfig === "function" ? (loadLLMConfig().about || "").trim() : "";
  const lookup = await apiFetch(`/api/projects?code=${encodeURIComponent(code)}`, { method: "GET" });

  // Fresh canvas for this team; createCanvas() also makes it the active one.
  const canvasId = typeof createCanvas === "function" ? createCanvas(DEFAULT_TITLE) : null;
  if (typeof loadState === "function") state = loadState(); // reset in-memory state to the empty new canvas
  saveSyncProject({ projectId: lookup.projectId, joinCode: code.toUpperCase() });

  const team = await apiFetch(`/api/projects/${lookup.projectId}/team`, {
    method: "POST",
    body: JSON.stringify({ name, about }),
  });
  saveSyncCreds(lookup.projectId, { memberId: team.member.id, secret: team.secret, name: team.member.name, role: team.member.role });
  if (canvasId && typeof updateCanvasMeta === "function") updateCanvasMeta(canvasId, { role: team.member.role });

  await pullState();
  restartSyncPolling();
  return { projectId: lookup.projectId, member: team.member, canvasId };
}

/** Leave the current team: remove yourself from the server roster, then turn this canvas into
 *  a solo one that keeps only the entries YOU authored (per the user's chosen behavior). */
async function syncLeaveTeam() {
  const p = loadSyncProject();
  if (!p) return;
  const creds = loadSyncCreds(p.projectId);
  const myId = creds ? creds.memberId : null;

  if (creds) {
    // Best-effort: even if the server call fails (already removed, offline), still detach locally.
    await apiFetch(`/api/projects/${p.projectId}/team`, {
      method: "DELETE",
      body: JSON.stringify({ memberId: creds.memberId, secret: creds.secret }),
    }).catch((err) => console.warn("Leave-team server call failed; detaching locally anyway:", err.message));
  }

  suppressPush = true;
  try {
    PHASES.forEach((ph) => {
      state.cards[ph] = (state.cards[ph] || []).filter((c) => c.authorId && c.authorId === myId);
    });
    Object.keys(state.tools || {}).forEach((slug) => {
      state.tools[slug].cards = (state.tools[slug].cards || []).filter((c) => c.authorId && c.authorId === myId);
    });
    state.team = null;
    state.phaseStatus = {};
    state.consolidations = {};
    clearSyncProject(); // detaches the active canvas from the cloud -> solo
    persist();
  } finally {
    suppressPush = false;
  }
  stopSyncPolling();
}

/** Upload every existing local card/tool-entry as an attributed entry — used right after
 *  creating a cloud project, and optionally offered to someone joining one. */
async function importLocalCardsAsEntries(projectId, memberId, secret) {
  for (const phase of PHASES) {
    for (const card of state.cards[phase] || []) {
      await apiFetch(`/api/projects/${projectId}/entries`, {
        method: "POST",
        body: JSON.stringify({ phase, memberId, secret, text: card.text }),
      }).catch(() => {});
    }
  }
  for (const [slug, tool] of Object.entries(state.tools || {})) {
    for (const card of tool.cards || []) {
      await apiFetch(`/api/projects/${projectId}/entries`, {
        method: "POST",
        body: JSON.stringify({ phase: tool.phase, toolSlug: slug, memberId, secret, text: card.text }),
      }).catch(() => {});
    }
  }
}

/* ---------------- pulling + merging server state ---------------- */

function mapConsolidation(row) {
  return {
    id: row.id,
    status: row.status,
    text: row.text,
    sourceCardIds: row.source_entry_ids || [],
    createdBy: row.created_by,
    approvals: row.approvals || [],
    created: row.created_at,
  };
}

function mergeServerState(server) {
  state.title = server.title;
  state.challenge = server.challenge;
  state.foundations = server.foundations;
  state.selection = server.selection;
  state.brief = server.brief;
  state.evalPlan = server.evalPlan;
  state.cards = server.cards;

  Object.entries(server.tools || {}).forEach(([slug, tool]) => {
    if (!state.tools[slug]) state.tools[slug] = { phase: tool.phase, title: slug, cards: [] };
    state.tools[slug].cards = tool.cards;
  });

  state.team = { id: server.id, name: "", members: server.team.members, settings: server.team.settings };

  PHASES.forEach((p) => {
    state.phaseStatus[p] = server.phaseStatus[p] || { status: "collecting", readiness: {} };
    state.consolidations[p] = (server.consolidations[p] || []).map(mapConsolidation);
  });

  suppressPush = true;
  persist();
  suppressPush = false;
}

async function pullState() {
  if (!syncConnected()) return null;
  const p = loadSyncProject();
  const server = await apiFetch(`/api/projects/${p.projectId}`, { method: "GET" });
  mergeServerState(server);
  return server;
}

function dispatchChanged() {
  document.dispatchEvent(new CustomEvent("dtc-team-changed"));
}

/* ---------------- pushing scalar-field edits ---------------- */

/** Hooked from store.js's persistState() — every local save funnels through here. Debounced
 *  so fast typing doesn't fire a request per keystroke. */
function onStateSaved() {
  if (suppressPush || !syncConnected()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const p = loadSyncProject();
    try {
      await apiFetch(`/api/projects/${p.projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: state.title,
          challenge: state.challenge,
          foundations: state.foundations,
          selection: state.selection,
          brief: state.brief,
          evalPlan: state.evalPlan,
        }),
      });
    } catch (err) {
      console.warn("Cloud sync push failed (will retry on the next edit or poll):", err.message);
    }
  }, 800);
}

/* ---------------- team + entry actions ---------------- */

async function syncSetApprovalRule(rule) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/team`, {
    method: "PATCH",
    body: JSON.stringify({ memberId: creds.memberId, secret: creds.secret, approvalRule: rule }),
  });
  await pullState();
  dispatchChanged();
}

async function syncAddEntry(phase, toolSlug, text) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/entries`, {
    method: "POST",
    body: JSON.stringify({ phase, toolSlug: toolSlug || undefined, memberId: creds.memberId, secret: creds.secret, text }),
  });
  await pullState();
  dispatchChanged();
}

/** Server re-enforces author-only edit rights regardless of what the client thinks —
 *  see lib/logic.js's updateEntry. */
async function syncUpdateEntry(entryId, text) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/entries`, {
    method: "PATCH",
    body: JSON.stringify({ entryId, memberId: creds.memberId, secret: creds.secret, text }),
  });
  await pullState();
  dispatchChanged();
}

/** Server re-enforces author-or-leader delete rights regardless of what the client thinks —
 *  see lib/logic.js's deleteEntry. */
async function syncDeleteEntry(entryId) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/entries`, {
    method: "DELETE",
    body: JSON.stringify({ entryId, memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

async function syncSetReady(phase, ready) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/phase`, {
    method: "POST",
    body: JSON.stringify({ phase, action: "ready", ready, memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

async function syncConsolidate(phase, text, sourceEntryIds) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/phase`, {
    method: "POST",
    body: JSON.stringify({ phase, action: "consolidate", text, sourceEntryIds, memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

async function syncApprove(consolidationId) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/consolidations/${consolidationId}`, {
    method: "POST",
    body: JSON.stringify({ projectId: p.projectId, action: "approve", memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

async function syncReject(consolidationId) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/consolidations/${consolidationId}`, {
    method: "POST",
    body: JSON.stringify({ projectId: p.projectId, action: "reject", memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

async function syncReopen(phase) {
  const p = loadSyncProject();
  const creds = loadSyncCreds(p.projectId);
  await apiFetch(`/api/projects/${p.projectId}/phase`, {
    method: "POST",
    body: JSON.stringify({ phase, action: "reopen", memberId: creds.memberId, secret: creds.secret }),
  });
  await pullState();
  dispatchChanged();
}

/* ---------------- polling ---------------- */

function startSyncPolling() {
  if (pollTimer || !syncConnected()) return;
  pollTimer = setInterval(() => {
    if (!syncConnected()) return; // active canvas switched to a solo one — idle until reconnected
    pullState().then(dispatchChanged).catch((err) => console.warn("Cloud sync pull failed:", err.message));
  }, SYNC_POLL_MS);
}

function stopSyncPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/** Restart polling against whatever the active canvas is now (used after create/join/switch). */
function restartSyncPolling() {
  stopSyncPolling();
  startSyncPolling();
}

if (typeof state !== "undefined" && syncConnected()) {
  pullState().then(dispatchChanged).catch((err) => console.warn("Initial cloud sync failed:", err.message));
  startSyncPolling();
}
