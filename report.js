// Project report generator: compiles the full canvas state into one Markdown
// document with Mermaid charts. With an LLM key configured, the LLM writes the
// narrative (under the covers) around the user's data; otherwise a clean
// data-only report is produced. Requires store.js and llm.js.

function STAGE_TITLES_MAP() {
  return {
    discover: t("phase.discover.title"), define: t("phase.define.title"), ideate: t("phase.ideate.title"),
    make: t("phase.make.title"), evaluate: t("phase.evaluate.title"), develop: t("phase.develop.title"),
    reflect: t("phase.reflect.title"),
  };
}
const STAGE_TITLES = STAGE_TITLES_MAP();

const STAGE_ROLES_EN = {
  discover: "divergent · problem space — research & empathy",
  define: "convergent · problem space — sensemaking & problem definition",
  ideate: "divergent · solution space — creating potential solutions",
  make: "convergent · solution space — realization & representation",
  evaluate: "testing with users, customers, experts",
  develop: "gate check — viability, feasibility, desirability",
  reflect: "meta — improve the process and the next release",
};
const STAGE_ROLES_ZH = {
  discover: "发散 · 问题空间 — 调研与共情",
  define: "收敛 · 问题空间 — 理解意义与问题定义",
  ideate: "发散 · 解决方案空间 — 创造潜在解决方案",
  make: "收敛 · 解决方案空间 — 落实与呈现",
  evaluate: "与用户、客户、专家一起测试",
  develop: "关卡检查 — 商业可行性、技术可行性、合意性",
  reflect: "元阶段 — 改进流程与下一版发布",
};
const STAGE_ROLES = (typeof getLang === "function" && getLang() === "zh") ? STAGE_ROLES_ZH : STAGE_ROLES_EN;

let state = loadState();

// A real project title is required — set it on the Canvas page first.
if (needsProjectTitle(state)) location.replace("index.html");

const statusEl = document.getElementById("report-status");
const outputBox = document.getElementById("report-output");
const textEl = document.getElementById("report-text");
const noteEl = document.getElementById("report-note");

document.getElementById("report-ai").addEventListener("click", generateWithAI);
document.getElementById("report-data").addEventListener("click", () => {
  state = loadState();
  showReport(buildDataReport(), t("report.dataGenerated"));
});
document.getElementById("report-download").addEventListener("click", download);
document.getElementById("report-copy").addEventListener("click", copyReport);

/* ---------------- mermaid ---------------- */

function counts(phase) {
  const cards = state.cards[phase].length;
  const tools = toolsForPhase(state, phase).reduce((n, tl) => n + tl.cards.length, 0);
  return { cards, tools };
}

function mermaidFlow() {
  const label = (p) => {
    const { cards, tools } = counts(p);
    const bits = [`${STAGE_TITLES[p]}`, `${cards} ${cards === 1 ? t("board.card") : t("board.cards")}`];
    if (tools) bits.push(`${tools} ${tools === 1 ? t("toolws.entry") : t("toolws.entries")}`);
    return bits.join("<br/>");
  };
  return [
    "```mermaid",
    "flowchart LR",
    `  C((C)) --> n1["${label("discover")}"]`,
    `  n1 --> n2["${label("define")}"]`,
    "  n2 --> PD((PD))",
    `  PD --> n3["${label("ideate")}"]`,
    `  n3 --> n4["${label("make")}"]`,
    "  n4 --> SC((SC))",
    `  SC --> n5["${label("evaluate")}"]`,
    `  n5 --> n6["${label("develop")}"]`,
    `  n6 --> n7["${label("reflect")}"]`,
    "```",
  ].join("\n");
}

function mermaidPie() {
  const rows = PHASES.map((p) => [STAGE_TITLES[p], counts(p).cards + counts(p).tools]).filter(([, n]) => n > 0);
  if (rows.length < 2) return "";
  return ["```mermaid", `pie showData title ${t("report.md.pieTitle")}`, ...rows.map(([label, n]) => `  "${label}" : ${n}`), "```"].join("\n");
}

/* ---------------- data report ---------------- */

function buildDataReport() {
  const md = [];
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const author = llmUserName();

  md.push(`# ${state.title} — Design Thinking Project Report`);
  md.push(`*${t("report.md.generated")} ${today}${author ? ` · ${author}` : ""} · ${t("report.md.process")}*`);

  md.push(`\n## ${t("report.md.challengeHeading")}`);
  md.push(state.challenge.trim() ? `> ${state.challenge.trim()}` : `_${t("report.md.noChallenge")}_`);
  if (state.selection.decision === "subset" && state.selection.scoped.trim()) {
    md.push(`\n**${t("report.md.scopedTo")}**\n\n> ${state.selection.scoped.trim()}`);
  } else if (state.selection.decision === "reject") {
    md.push(`\n**${t("report.md.decisionRejected")}**`);
  } else if (state.selection.decision === "accept") {
    md.push(`\n**${t("report.md.decisionAccepted")}**`);
  }
  if (state.foundations.themes.trim()) md.push(`\n**${t("report.md.theme")}** ${state.foundations.themes.trim()}`);
  if (state.foundations.challenge.trim()) md.push(`\n**${t("report.md.selectionNotes")}** ${state.foundations.challenge.trim()}`);

  const sel = state.selection;
  const selKeys = ["background", "values", "objectives", "role", "strengths", "weaknesses", "opportunities", "threats", "reflections"];
  const selFilled = selKeys.filter((k) => sel[k].trim());
  if (selFilled.length) {
    md.push(`\n### ${t("report.md.selectionHeading")}`);
    const labels = {
      background: t("selection.background.label"),
      values: t("selection.values.label"), objectives: t("selection.objectives.label"), role: t("selection.role.label"),
      strengths: t("selection.strengths.label"), weaknesses: t("selection.weaknesses.label"),
      opportunities: t("selection.opportunities.label"), threats: t("selection.threats.label"),
      reflections: t("selection.reflections.label"),
    };
    selFilled.forEach((k) => md.push(`\n**${labels[k]}:** ${sel[k].trim()}`));
  }

  md.push(`\n## ${t("report.md.processOverview")}`);
  md.push(mermaidFlow());
  const pie = mermaidPie();
  if (pie) md.push("\n" + pie);

  md.push(`\n## ${t("report.md.briefHeading")}`);
  const filled = BRIEF_FIELDS.filter(([k]) => state.brief[k].trim());
  if (filled.length === 0) {
    md.push(`_${t("report.md.noBrief")}_`);
  } else {
    filled.forEach(([k, label]) => {
      md.push(`\n**${label}**\n\n${state.brief[k].trim()}`);
    });
  }

  PHASES.forEach((p) => {
    md.push(`\n## ${STAGE_TITLES[p]}`);
    md.push(`*${STAGE_ROLES[p]}*`);
    const cards = state.cards[p];
    if (cards.length === 0) {
      md.push(`\n_${t("report.md.noCards")}_`);
    } else {
      md.push("");
      cards.forEach((c) => md.push(`- ${c.text.replace(/\n+/g, " ")}`));
    }
    toolsForPhase(state, p).forEach((tl) => {
      md.push(`\n### ${t("report.md.toolWorksheet")} ${tl.title}`);
      tl.cards.forEach((c) => md.push(`- ${c.text.replace(/\n+/g, " ")}`));
    });
    if (p === "evaluate" && state.evalPlan.length > 0) {
      md.push(`\n### ${t("report.md.evalPlan")}`);
      md.push("");
      md.push(`| ${t("evalplan.colCriterion")} | ${t("evalplan.colMethod")} | ${t("evalplan.colMetric")} | ${t("evalplan.colResult")} |`);
      md.push("| --- | --- | --- | --- |");
      const cell = (s) => (s || "").replace(/\n+/g, " ").replace(/\|/g, "\\|") || "—";
      state.evalPlan.forEach((r) => {
        md.push(`| ${cell(r.criterion)} | ${cell(r.method)} | ${cell(r.metric)} | ${r.result.trim() ? cell(r.result) : `— *(${t("report.md.notMeasured")})*`} |`);
      });
      const pending = state.evalPlan.filter((r) => !r.result.trim()).length;
      if (pending) md.push(`\n_${pending} ${t("report.md.pendingRows")} ${state.evalPlan.length} ${t("report.md.pendingRowsSuffix")}_`);
    }
  });

  const totalCards = PHASES.reduce((n, p) => n + state.cards[p].length, 0);
  const totalTools = PHASES.reduce((n, p) => n + counts(p).tools, 0);
  md.push(`\n---\n`);
  md.push(`*${t("report.md.summary").replace("{cards}", totalCards).replace("{tools}", totalTools)}*`);

  return md.join("\n");
}

/* ---------------- AI narrative ---------------- */

async function generateWithAI() {
  state = loadState();
  if (!llmConfigured()) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML = `${t("report.noKey")}<a href="index.html#settings">${t("report.noKeyLink")}</a>${t("report.noKeySuffix")}`;
    return;
  }

  const btn = document.getElementById("report-ai");
  btn.disabled = true;
  statusEl.classList.remove("assist-error");
  statusEl.textContent = t("report.compiling");

  try {
    const dataMd = buildDataReport();
    const system =
      "You are a precise technical writer and design thinking coach producing a final project report. " +
      "You synthesize the author's own material into clear narrative. You never invent facts, findings, users, " +
      "or results that are not in the data; where a section is empty or thin you say so plainly and note it as a gap." + aiLangInstruction();
    const user =
      "Below is the complete raw data of a Double Diamond design thinking project, as draft markdown:\n\n" +
      "<data>\n" + dataMd + "\n</data>\n\n" +
      "Rewrite this into one polished, well-formatted Markdown report. Requirements:\n" +
      "- Begin with the same title, then an **Executive summary** (5–8 sentences) synthesizing challenge → problem → " +
      "solution direction → evidence → current status.\n" +
      "- Keep all of the author's actual content, reorganized into readable narrative and bullets; quote the challenge verbatim.\n" +
      "- Include the mermaid code blocks from the data VERBATIM in a 'Process overview' section — do not modify them.\n" +
      "- One section per stage (Discover, Define, Ideate, Make, Evaluate, Develop, Reflect & Improve): synthesize the " +
      "cards and tool worksheet entries into findings, not raw lists (small lists may stay bullets). Empty stages: one " +
      "honest sentence noting the gap.\n" +
      "- Include the Problem Definition (Brief) as its own section.\n" +
      "- Add: **Key insights** (drawn only from the data), **Open questions & gaps**, and **Suggested next steps**.\n" +
      "- End with a horizontal rule and the line: *This report was drafted with LLM assistance from the author's " +
      "canvas data and should be reviewed by the author.*\n" +
      "Respond with ONLY the Markdown document.";

    const text = await llmComplete(system, user);
    const cleaned = text.replace(/^```(?:markdown)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    if (!cleaned.startsWith("#")) throw new Error("The LLM response didn't look like a Markdown document — try again or use the data-only report.");
    showReport(cleaned, t("report.aiGenerated"));
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent = (err instanceof TypeError ? t("assist.networkErr") + " " : err.message + " ") + t("report.stillDataOnly");
  } finally {
    btn.disabled = false;
  }
}

/* ---------------- output ---------------- */

function showReport(md, note) {
  textEl.value = md;
  outputBox.hidden = false;
  statusEl.textContent = "";
  statusEl.classList.remove("assist-error");
  noteEl.textContent = note;
  textEl.style.height = "auto";
  textEl.style.height = Math.min(textEl.scrollHeight + 4, 700) + "px";
}

function download() {
  const safeName =
    (state.title || "project").trim().replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() || "project";
  const blob = new Blob([textEl.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-report.md`;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyReport() {
  try {
    await navigator.clipboard.writeText(textEl.value);
    noteEl.textContent = t("report.copiedNote");
  } catch {
    textEl.select();
    document.execCommand("copy");
    noteEl.textContent = t("report.copiedNote");
  }
}
