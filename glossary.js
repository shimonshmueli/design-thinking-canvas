// Glossary: explainer modals for terms that need clarification.
// Any element with data-term="<id>" opens the modal for that term.
// Each modal offers "Copy explanation" and "Copy LLM prompt" buttons.

const GLOSSARY = {
  values: {
    title: "Values (organizational)",
    body: [
      "The principles an organization (or you, on a personal project) refuses to trade away: what it stands for, how it treats people, what kind of work it will and won't do. In challenge selection, the question is fit: a challenge that conflicts with your values will produce a solution you can't stand behind, no matter how attractive the market is.",
      "Practically: write down 3–5 values that are real (they've cost you something before, or would), then check the candidate challenge against each.",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  objectives: {
    title: "Objectives",
    body: [
      "What the organization is concretely trying to achieve in the relevant horizon — growth targets, mission outcomes, capability building, market position. A challenge 'fits our objectives' when solving it advances one of them; otherwise even a well-executed project is a detour.",
      "Objectives differ from values (which constrain how you act) and from success criteria (which measure one specific project). State them as outcomes, ideally measurable, not activities.",
    ],
    refs: [["MIT Sloan — goal setting overview (SMART goals)", "https://mitsloan.mit.edu/ideas-made-to-matter/how-to-set-goals"]],
  },
  role: {
    title: "Role (organizational)",
    body: [
      "The part your organization credibly plays in its ecosystem: what others rely on it for, where it has permission and capability to act. A hospital, a device maker, and an insurer could all tackle 'medication errors' — but each has a different role, so the right challenge framing differs for each.",
      "Ask: given who we are and what we're trusted with, is this our problem to solve? Would our involvement be credible to users and stakeholders?",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  swot: {
    title: "SWOT analysis",
    body: [
      "A strategy tool that maps internal Strengths and Weaknesses against external Opportunities and Threats. In challenge selection, run SWOT about the candidate challenge specifically: do our strengths matter for this problem? Do our weaknesses block it? Is there a real external opportunity, and what threatens it?",
      "The classic failure mode is generic entries ('strength: our team') that could apply to anything. Every entry should be specific enough to change a decision.",
    ],
    refs: [
      ["Wikipedia — SWOT analysis", "https://en.wikipedia.org/wiki/SWOT_analysis"],
      ["Investopedia — SWOT", "https://www.investopedia.com/terms/s/swot.asp"],
    ],
  },
  themes: {
    title: "Themes / product category",
    body: [
      "The broad territory the challenge sits in — e.g., home energy, elder care, personal finance, onboarding. Naming the theme early anchors research (what domain to study, which users to reach) without committing to a specific problem or solution yet.",
      "A theme is wider than a challenge: 'elder care' is a theme; 'help elderly patients managing multiple prescriptions avoid medication errors' is a challenge inside it.",
    ],
    refs: [["Design Council — The Double Diamond", "https://www.designcouncil.org.uk/resources/the-double-diamond/"]],
  },
  divergent: {
    title: "Divergent thinking",
    body: [
      "Thinking that expands the option space: generating many possibilities, exploring, collecting, imagining, deferring judgment. The first half of each diamond (Discover, Ideate) is divergent — the goal is breadth and surprise, not correctness.",
      "The term comes from J.P. Guilford's research on creativity (1950s), contrasting divergent production (many answers) with convergent production (one right answer).",
    ],
    refs: [
      ["Wikipedia — Divergent thinking", "https://en.wikipedia.org/wiki/Divergent_thinking"],
      ["IxDF — Divergent thinking", "https://www.interaction-design.org/literature/topics/divergent-thinking"],
    ],
  },
  convergent: {
    title: "Convergent thinking",
    body: [
      "Thinking that narrows toward decisions: synthesizing, filtering, clustering, merging, abstracting, choosing. The second half of each diamond (Define, Make) is convergent — the goal is a committed, well-argued selection: a problem definition, then a solution concept.",
      "Good convergence is criteria-driven (traceable to needs and objectives), not just picking the favorite in the room.",
    ],
    refs: [["Wikipedia — Convergent thinking", "https://en.wikipedia.org/wiki/Convergent_thinking"]],
  },
  "systems-thinking": {
    title: "Systems thinking",
    body: [
      "Analyzing problems as systems: structures, behaviors, feedback loops, emergence, boundaries — rather than isolated events. In design work it prevents 'fixing' one part of an experience while breaking another, and reveals leverage points where a small change shifts the whole system.",
      "Donella Meadows' 'Thinking in Systems' is the classic accessible introduction.",
    ],
    refs: [
      ["Donella Meadows Project — systems thinking resources", "https://donellameadows.org/systems-thinking-resources/"],
      ["Wikipedia — Systems thinking", "https://en.wikipedia.org/wiki/Systems_thinking"],
    ],
  },
  "computational-thinking": {
    title: "Computational thinking",
    body: [
      "Solving problems using concepts from computer science: decomposition (splitting a problem into parts), pattern recognition, abstraction, and algorithm design. In design thinking it sharpens problem decomposition in Discover/Define and makes solution concepts precise in Make.",
      "The term was popularized by Jeannette Wing (2006), who argued it's a universal skill, not just for programmers.",
    ],
    refs: [
      ["Wing (2006), 'Computational Thinking', CACM", "https://www.cs.cmu.edu/~15110-s13/Wing06-ct.pdf"],
      ["Wikipedia — Computational thinking", "https://en.wikipedia.org/wiki/Computational_thinking"],
    ],
  },
  "strategic-thinking": {
    title: "Strategic thinking",
    body: [
      "Reasoning about where to play and how to win over time: which problems are worth solving given the competitive landscape, what position a solution creates, and what future you're betting on. It feeds challenge selection (is this worth our while?) and the Develop gate (does the business model close?).",
    ],
    refs: [["Wikipedia — Strategic thinking", "https://en.wikipedia.org/wiki/Strategic_thinking"]],
  },
  intrapreneurship: {
    title: "Intra/entrepreneurship",
    body: [
      "Entrepreneurship is building a new venture; intrapreneurship (Gifford Pinchot's term) is acting entrepreneurially inside an existing organization — championing an idea, assembling resources, taking calculated risks without owning the company. Design thinking projects usually need one of these mindsets to survive contact with the organization.",
    ],
    refs: [
      ["Wikipedia — Intrapreneurship", "https://en.wikipedia.org/wiki/Intrapreneurship"],
      ["Investopedia — Intrapreneurship", "https://www.investopedia.com/terms/i/intrapreneurship.asp"],
    ],
  },
  creativity: {
    title: "Creativity",
    body: [
      "In the research literature: producing ideas that are both novel and useful. Novel alone is randomness; useful alone is routine. Design thinking's divergent stages are structured machinery for reaching novelty; its convergent stages test usefulness.",
    ],
    refs: [["Wikipedia — Creativity", "https://en.wikipedia.org/wiki/Creativity"]],
  },
  innovation: {
    title: "Innovation",
    body: [
      "Creativity deployed: something new that is actually brought to market or into use. An idea that never ships is an invention at best. The second diamond plus the Develop gate exist precisely to carry creative concepts across the gap into deployed innovation.",
    ],
    refs: [["Wikipedia — Innovation", "https://en.wikipedia.org/wiki/Innovation"]],
  },
  "problem-statement": {
    title: "Problem statement",
    body: [
      "A concise statement of the need to be addressed — who has the problem, what the problem is, and why it matters — deliberately free of any particular solution. 'Nurses lose track of medication changes during shift handoffs' is a problem; 'we need a handoff app' is a solution wearing a problem costume.",
      "It anchors the brief: every idea in the second diamond should trace back to it.",
    ],
    refs: [["IxDF — Define stage and problem statements", "https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-and-interpret-the-results"]],
  },
  stakeholders: {
    title: "Users & stakeholders",
    body: [
      "Users experience the problem and the solution directly; stakeholders influence or are affected by it (buyers, operators, regulators, family members, management). They overlap but are not the same — and their needs can conflict, which is itself a design finding worth writing down.",
      "In the brief, name the groups specifically and mark whose needs drive the design vs. whose act as constraints.",
    ],
    refs: [["Wikipedia — Stakeholder", "https://en.wikipedia.org/wiki/Stakeholder_(corporate)"]],
  },
  needs: {
    title: "Needs, wants, aspirations",
    body: [
      "Three depths of user motivation: needs are functional necessities (often unstated — users work around them), wants are conscious desires they'll tell you about, aspirations are who they're trying to become. Great solutions usually serve a real need while speaking to an aspiration.",
      "Research methods in Discover (interviews, observation, journeys) exist to surface the unstated needs interviews alone miss.",
    ],
    refs: [["IDEO Design Kit — methods for understanding people", "https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit"]],
  },
  pov: {
    title: "Solution point-of-view (approach)",
    body: [
      "A committed stance on how you'll approach the problem — the angle of attack — without specifying the solution itself. Stanford d.school formalizes it as: [user] needs [need] because [insight]. It frames the solution space: wide enough for many ideas, narrow enough to aim.",
      "Example: 'We believe overwhelmed caregivers need medication management woven into routines they already have, because new standalone routines fail within weeks.'",
    ],
    refs: [["IxDF — Point of view in design thinking", "https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-and-interpret-the-results"]],
  },
  "success-criteria": {
    title: "Success criteria",
    body: [
      "The observable, ideally measurable conditions under which the project counts as having worked — defined before solutions exist, so evaluation later is honest. Examples: '80% of test users complete a refill unaided', 'medication errors in the pilot ward drop 30% in 3 months'.",
      "They power the Evaluate stage: tests are designed against them, and results are reported against them.",
    ],
    refs: [["Nielsen Norman Group — UX metrics and success measures", "https://www.nngroup.com/articles/"]],
  },
  "three-lenses": {
    title: "Desirability · Feasibility · Viability",
    body: [
      "IDEO's three lenses of innovation, used at the Develop gate. Desirability: do people demonstrably want it (human lens)? Feasibility: can we actually build and operate it (technical lens)? Viability: does it sustain itself as a business (economic lens)? A concept worth building sits at the intersection of all three.",
      "Each lens should be answered with evidence (from Evaluate, prototyping, and business analysis), not enthusiasm.",
    ],
    refs: [["IDEO — Design Thinking FAQ", "https://designthinking.ideo.com/"]],
  },
};

/* ---------------- modal ---------------- */

function glossaryChallenge() {
  try {
    const s = JSON.parse(localStorage.getItem("design-thinking-canvas-v2"));
    return (s && typeof s.challenge === "string" && s.challenge.trim()) || "";
  } catch {
    return "";
  }
}

function glossaryPrompt(entry) {
  const challenge = glossaryChallenge();
  return (
    "I'm a student working through a design thinking project using the Double Diamond process " +
    "(Discover, Define, Ideate, Make, Evaluate, Develop, Reflect)." +
    (challenge ? ` My challenge is: "${challenge}".` : "") +
    ` Explain "${entry.title}" in this context: what it is, why it matters in the Double Diamond process, ` +
    "how I would apply it to my project step by step, common pitfalls, and one concrete worked example. " +
    "End with 2–3 reputable sources I can read to go deeper. Where you are uncertain, say so explicitly."
  );
}

function glossaryPlainText(entry) {
  const refs = entry.refs.map(([label, url]) => `- ${label}: ${url}`).join("\n");
  return `${entry.title}\n\n${entry.body.join("\n\n")}\n\nReferences:\n${refs}`;
}

async function glossaryCopy(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const original = btn.textContent;
  btn.textContent = "Copied ✓";
  setTimeout(() => (btn.textContent = original), 1500);
}

function openGlossary(termId) {
  const entry = GLOSSARY[termId];
  if (!entry) return;

  let overlay = document.getElementById("glossary-modal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "glossary-modal";
    overlay.className = "settings-overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.hidden = true;
    });
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="settings-panel glossary-panel" role="dialog" aria-modal="true" aria-label="${entry.title}">
      <div class="settings-head">
        <h2>${entry.title}</h2>
        <button type="button" class="btn btn-ghost" id="glossary-close" aria-label="Close">✕</button>
      </div>
      ${entry.body.map((p) => `<p class="glossary-body">${p}</p>`).join("")}
      <p class="glossary-refs-label">References</p>
      <ul class="glossary-refs">
        ${entry.refs.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`).join("")}
      </ul>
      <div class="settings-actions">
        <button type="button" class="btn" id="glossary-copy-text">Copy explanation</button>
        <button type="button" class="btn" id="glossary-copy-prompt">Copy LLM prompt</button>
      </div>
      <p class="llm-note">"Copy LLM prompt" gives you a ready-made prompt${glossaryChallenge() ? " (including your challenge)" : ""} to paste into your LLM for a deeper, project-specific explanation.</p>
    </div>
  `;

  overlay.querySelector("#glossary-close").addEventListener("click", () => (overlay.hidden = true));
  overlay.querySelector("#glossary-copy-text").addEventListener("click", (e) => glossaryCopy(glossaryPlainText(entry), e.target));
  overlay.querySelector("#glossary-copy-prompt").addEventListener("click", (e) => glossaryCopy(glossaryPrompt(entry), e.target));

  overlay.hidden = false;
}

// Event delegation: any element with data-term opens its glossary entry.
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-term]");
  if (!el) return;
  e.preventDefault();
  openGlossary(el.dataset.term);
});
