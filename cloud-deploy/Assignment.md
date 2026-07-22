# Assignment: Build a Double Diamond Tutorial with an LLM Co-Pilot

**Format:** Individual
**Duration:** 1–2 weeks
**Deliverable:** A working, self-contained website (plain HTML/CSS/JS) that teaches the Double Diamond / design thinking framework to someone who has never seen it — built through a documented collaboration with an LLM of your choice.

---

## 1. Overview

You've seen the Double Diamond model in class, in a form richer than the version most people encounter online: not just four boxes, but explicit stages (Discover, Define, Ideate, Make, Evaluate, Develop, Reflect & Improve), the handoff points between them, the tools proper to each stage, and the mindsets that hold the whole thing together.

Your job is to turn that understanding into a **tutorial you build for someone else** — using an LLM as your research and build partner, the way you'd use one on a real project. You are not just summarizing a diagram. You're doing original synthesis: researching the framework more deeply than what was shown in class, verifying what your LLM tells you against real sources, and explaining it clearly enough that a stranger could learn it from your page alone.

This assignment has two intertwined goals: understand the Double Diamond deeply enough to teach it, and get real practice directing, questioning, and fact-checking an LLM on a substantive piece of work — a skill you'll use constantly outside this course.

## 2. Learning objectives

By the end of this assignment you should be able to:

- Explain every stage of the Double Diamond (including the extended version — Ideate/Make/Evaluate/Develop/Reflect, not just the canonical four) and why each one is divergent, convergent, or a gate check.
- Correctly describe at least 4–5 tools or methods per stage (e.g., personas, SWOT, brainstorming, Pugh matrix, MVP) and when each is used.
- Identify where an LLM's explanation of a design method was vague, wrong, or subtly conflated with something else — and correct it using a primary source.
- Structure a technical topic for a novice audience: sequencing, examples, visuals, and self-checks that actually teach, not just display information.
- Ship a working static website with no build tools, from a blank folder to something that opens correctly in a browser.

## 3. Background

The canonical Double Diamond — Discover, Define, Develop, Deliver — comes from the UK Design Council, first published in 2004 and updated in 2019 as part of their broader "Framework for Innovation" [Design Council](https://www.designcouncil.org.uk/resources/the-double-diamond/). It's one of the most widely referenced design process models in the world, and also one of the most widely oversimplified — most web summaries stop at four labeled boxes and a one-line description each.

The version discussed in class extends this in ways drawn from design engineering and design methods scholarship more broadly: splitting the second diamond into Ideate/Make, adding an explicit Evaluate step and a viability/feasibility/desirability gate (Develop), naming the handoff artifacts between phases (a **Challenge**, a **Problem Definition**, a **Solution Concept**), and surrounding the whole process with foundational thinking-mode vocabulary (divergent vs. convergent) and cross-cutting attitudes. Your tutorial should represent this fuller picture, not the four-box simplification — while being honest with your reader about which parts are the well-established core model and which are extensions.

## 4. The task

Using an LLM as a thinking and research partner, produce a multi-section tutorial website that teaches:

1. **The core framework** — what the Double Diamond is, why it's shaped like two diamonds, and the divergent/convergent logic that drives it.
2. **Each stage in the extended model** — Discover, Define, Ideate, Make, Evaluate, Develop, Reflect & Improve — what happens in each, in your own words, with a concrete example (real or invented) at each stage.
3. **The handoff points** — the idea that a Challenge becomes a Problem Definition becomes a Solution Concept, and why naming these transitions matters.
4. **Tools & methods per stage** — at least 4–5 correctly explained per stage (not just listed). Pick from the reference diagram or find others through your research — either way, verify what each one actually is and how it's used.
5. **The Problem Definition brief and Solution Concept checklist** — what belongs in each, and why they matter as concrete artifacts, not abstractions.
6. **Foundations** — challenge-selection thinking (does this problem fit our values/objectives/capabilities?), a divergent-vs-convergent thinking-modes glossary, and a brief note on the other disciplines that feed design thinking (systems thinking, strategic thinking, computational thinking, discipline-specific reasoning from fields like engineering or business, etc.).
7. **Cross-cutting mindsets** — the attitudes (bias to action, tolerance for failure, human-centeredness, etc.) that make the process work, and why a process diagram alone doesn't guarantee good design work.
8. **A glossary** of key terms, and a **further reading / sources** section citing where you verified your content.

Your tutorial should include at least one element that goes beyond static text — an interactive diagram, a short self-check quiz, a worked example the reader can step through, or something equivalent. It has to actually teach, not just present.

## 5. Working with your LLM

Use any LLM you want — ChatGPT, Claude, Gemini, or something else. Use it the way you'd use it on real work: to research the framework, explain methods you don't know yet, draft explanations, and help you build the site.

LLMs are unreliable narrators of exactly this kind of content — they routinely blur similar-sounding methods, invent plausible-but-wrong tool names, or state a "standard" definition that's actually one of several competing ones. Part of this assignment is catching that. For every substantive claim in your tutorial (what a tool is, when it's used, who originated a concept), verify it against at least one source that isn't the LLM itself before it goes on your page.

**You must submit a process log** alongside your tutorial (300–500 words, plus supporting excerpts) covering:

- Key prompts you used and what you were trying to get out of the LLM at each stage.
- At least 2–3 concrete instances where the LLM's output was wrong, vague, outdated, or conflated two things — what you caught, how you verified it, and what you corrected it to.
- A short reflection: what worked well about collaborating with an LLM on this, what didn't, and what you'd do differently next time.

## 6. Constraints

- **Tech stack:** plain HTML/CSS/JS, no build tools or frameworks. It must open directly in a browser from a local folder — no server, no `npm install`.
- **Originality:** don't paste raw LLM output onto the page. Everything should be synthesized and rewritten in your own explanatory voice, and fact-checked as described above.
- **No verbatim reuse** of the class reference diagram's exact wording — use it as a map of what to cover, not text to copy.
- **Cite your sources** in a visible section on the page itself, not just in your process log.

## 7. Suggested (not graded) workflow

You don't have to follow a rigid stage-by-stage process to complete this, but it's worth noticing that "research a topic, define what your audience needs, generate content ideas, build, and test with a reader" is itself a pass through the Double Diamond. A reasonable way to spend two weeks:

- **Days 1–2:** Research the framework and its tools with your LLM; verify against primary sources; decide your tutorial's scope and audience.
- **Days 3–4:** Outline the site's structure and content for every section in §4.
- **Days 5–9:** Build — write content, build the interactive element, style the page.
- **Days 10–11:** Test it on a friend or classmate who doesn't know the model yet; fix what confused them.
- **Days 12–14:** Polish, write your process log, submit.

## 8. Deliverables

1. A folder containing your working site (`index.html`, `style.css`, any JS/assets) — must run by opening `index.html` directly.
2. `process-log.md` (or `.pdf`) — your LLM collaboration log and reflection, per §5.
3. A one-line note on which LLM(s) you used.

## 9. Submission

Zip the folder (site + process log) and submit per your instructor's usual method, or share a link to a hosted version (GitHub Pages, Netlify, etc.) plus the process log. An EPAN address will be provided by the instructor.

## 10. Starting points

- [Design Council — The Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/) and [Framework for Innovation](https://www.designcouncil.org.uk/resources/framework-for-innovation/) — the canonical four-stage model and its origin.
- [Design Council — History of the Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/history-of-the-double-diamond/) — how the model has evolved since 2004.
- [IDEO Design Kit](https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit) — a field guide of human-centered design methods (mindsets, methods, tools) useful for the tools/methods sections.
- The reference diagram covered in class — shown on page 36 of the *Intro To Design Thinking* PDF presentation provided by the instructor. It's your map of what to include, not a source to cite as-is.

Sources:
- [Design Council — The Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/)
- [Design Council — Framework for Innovation](https://www.designcouncil.org.uk/resources/framework-for-innovation/)
- [Design Council — History of the Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/history-of-the-double-diamond/)
- [IDEO — Design Kit: The Human-Centered Design Toolkit](https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit)
