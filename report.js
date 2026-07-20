// Project report generator: compiles the full canvas state into one Markdown
// document with Mermaid charts. With an LLM key configured, the LLM writes the
// narrative (under the covers) around the user's data; otherwise a clean
// data-only report is produced. Requires store.js and llm.js.

const STAGE_TITLES = {
  discover: "Discover",
  define: "Define",
  ideate: "Ideate",
  make: "Make",
  evaluate: "Evaluate",
  develop: "Develop",
  reflect: "Reflect & Improve",
};

const STAGE_ROLES = {
  discover: "divergent · problem space — research & empathy",
  define: "convergent · problem space — sensemaking & problem definition",
  ideate: "divergent · solution space — creating potential solutions",
  make: "convergent · solution space — realization & representation",
  evaluate: "testing with users, customers, experts",
  develop: "gate check — viability, feasibility, desirability",
  reflect: "meta — improve the process and the next release",
};

let state = loadState();

const statusEl = document.getElementById("report-status");
const outputBox = document.getElementById("report-output");
const textEl = document.getElementById("report-text");
const noteEl = document.getElementById("report-note");

document.getElementById("report-ai").addEventListener("click", generateWithAI);
document.getElementById("report-data").addEventListener("click", () => {
  state = loadState();
  showReport(buildDataReport(), "Data-only report generated.");
});
document.getElementById("report-download").addEventListener("click", download);
document.getElementById("report-copy").addEventListener("click", copyReport);

/* ---------------- mermaid ---------------- */

function counts(phase) {
  const cards = state.cards[phase].length;
  const tools = toolsForPhase(state, phase).reduce((n, t) => n + t.cards.length, 0);
  return { cards, tools };
}

function mermaidFlow() {
  const label = (p) => {
    const { cards, tools } = counts(p);
    const bits = [`${STAGE_TITLES[p]}`, `${cards} card${cards === 1 ? "" : "s"}`];
    if (tools) bits.push(`${tools} tool entr${tools === 1 ? "y" : "ies"}`);
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
  return ["```mermaid", "pie showData title Captured items per stage", ...rows.map(([t, n]) => `  "${t}" : ${n}`), "```"].join("\n");
}

/* ---------------- data report ---------------- */

function buildDataReport() {
  const md = [];
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const author = llmUserName();

  md.push(`# ${state.title} — Design Thinking Project Report`);
  md.push(`*Generated ${today}${author ? ` · ${author}` : ""} · Double Diamond process*`);

  md.push(`\n## Challenge`);
  md.push(state.challenge.trim() ? `> ${state.challenge.trim()}` : "_No challenge statement recorded._");
  if (state.foundations.themes.trim()) md.push(`\n**Theme / product category:** ${state.foundations.themes.trim()}`);
  if (state.foundations.challenge.trim()) md.push(`\n**Challenge selection notes:** ${state.foundations.challenge.trim()}`);

  md.push(`\n## Process overview`);
  md.push(mermaidFlow());
  const pie = mermaidPie();
  if (pie) md.push("\n" + pie);

  md.push(`\n## Problem Definition (Brief)`);
  const filled = BRIEF_FIELDS.filter(([k]) => state.brief[k].trim());
  if (filled.length === 0) {
    md.push("_No brief recorded — the first diamond has not been closed._");
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
      md.push("\n_No cards recorded for this stage._");
    } else {
      md.push("");
      cards.forEach((c) => md.push(`- ${c.text.replace(/\n+/g, " ")}`));
    }
    toolsForPhase(state, p).forEach((t) => {
      md.push(`\n### Tool worksheet: ${t.title}`);
      t.cards.forEach((c) => md.push(`- ${c.text.replace(/\n+/g, " ")}`));
    });
  });

  const totalCards = PHASES.reduce((n, p) => n + state.cards[p].length, 0);
  const totalTools = PHASES.reduce((n, p) => n + counts(p).tools, 0);
  md.push(`\n---\n`);
  md.push(`*${totalCards} stage cards and ${totalTools} tool worksheet entries captured across the process.*`);

  return md.join("\n");
}

/* ---------------- AI narrative ---------------- */

async function generateWithAI() {
  state = loadState();
  if (!llmConfigured()) {
    statusEl.classList.add("assist-error");
    statusEl.innerHTML =
      'No API key configured — add one in <a href="index.html#settings">Settings on the Canvas page</a>, ' +
      "or use the data-only report.";
    return;
  }

  const btn = document.getElementById("report-ai");
  btn.disabled = true;
  statusEl.classList.remove("assist-error");
  statusEl.textContent = "Compiling your data and writing the report — this can take up to a minute…";

  try {
    const dataMd = buildDataReport();
    const system =
      "You are a precise technical writer and design thinking coach producing a final project report. " +
      "You synthesize the author's own material into clear narrative. You never invent facts, findings, users, " +
      "or results that are not in the data; where a section is empty or thin you say so plainly and note it as a gap.";
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
    showReport(cleaned, "AI-narrative report generated — review it before sharing.");
  } catch (err) {
    statusEl.classList.add("assist-error");
    statusEl.textContent =
      (err instanceof TypeError
        ? "The request never reached the provider — if this page was opened as a local file, serve the folder (python3 -m http.server). "
        : err.message + " ") + "You can still use the data-only report.";
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
    noteEl.textContent = "Copied ✓";
  } catch {
    textEl.select();
    document.execCommand("copy");
    noteEl.textContent = "Copied ✓";
  }
}
