# Design Thinking Canvas

An interactive canvas for the Double Diamond design process, modeled on the fuller academic version (not just the four-box summary): **Discover → Define → Ideate → Make → Evaluate → Develop → Reflect & Improve**, plus the foundations and cross-cutting thinking that surround it.

Plain HTML/CSS/JS, no build step, no dependencies.

## Run it

Open `index.html` in a browser. That's it.

## Structure

**Foundations** (top) — editable notes on why this challenge was selected and its theme/product category, plus static reference panels on divergent vs. convergent thinking modes and the disciplines that feed the process (systems thinking, strategic thinking, etc.).

**Flow guide** — a visual of the two diamonds (Discover/Define = problem space, Ideate/Make = solution space) with the C / PD / SC handoff markers (Challenge → Problem Definition → Solution Concept), followed by the linear Evaluate → Develop → Reflect & Improve stages.

**Canvas board (overview)** — seven summary columns, one per stage. The main page is a dashboard: each column shows a card count and the most recent cards, read-only. The actual work happens on the stage pages ("Open workspace →"):

- **Discover** (divergent) — research & empathy
- **Define** (convergent) — sensemaking, plus a Problem Definition (Brief) checklist reference
- **Ideate** (divergent) — generating solution concepts
- **Make** (convergent) — realization, plus a Solution Concept checklist reference
- **Evaluate** — testing with users, customers, and experts
- **Develop** — the viability / feasibility / desirability gate check
- **Reflect & Improve** — practitioner, team, and process retro

**Stage pages** (`stages/*.html`) — one page per stage with the full guide (role in the diamond, inputs/outputs, exit-artifact checklists for Define and Make) and the **workspace** where cards are added, edited, and deleted. Each stage page links onward to its tool/method pages.

**AI assist (bring your own key)** — every stage workspace has an AI assist panel. Enter your own API key (Anthropic, OpenAI, Google Gemini, or OpenRouter — which routes to any model) under Settings; the key is stored only in your browser's localStorage and sent only to the provider you pick. "Suggest cards" sends your project context (title, foundations, brief, existing cards for the stage) to the LLM and returns suggestions you review and add individually — nothing goes on the canvas without your approval.

**Problem Definition (Brief)** — the Define page ends with a six-field brief editor (problem statement, users & stakeholders, needs, point-of-view, objectives & constraints, success criteria). "Draft brief with AI" fills empty fields from your Discover/Define cards. The completed brief is displayed read-only at the top of the Ideate, Make, Evaluate, and Develop workspaces — the second diamond is always framed by it — and the dashboard's Define column shows brief completion (n/6 sections).

**Tool pages** (`tools/*.html`) — 32 reference pages branching from the stage pages, each covering what a tool is, how to use it, and a pitfall to watch for (personas, SWOT, brainstorming, Pugh matrix, MVP, contextual inquiry, heuristic evaluation, and so on).

**Summary strip** (bottom) — the cross-cutting approach, attitudes/mindsets, and thinking style that apply across every stage.

## How it works

- Click into any card to edit it in place; it saves on blur. Clear a card's text and click away to delete it.
- Everything — foundations notes, cards — autosaves to `localStorage` in your browser. Data is per-browser, not synced across devices.
- **Export** downloads the current canvas as a `.json` file. **Import** loads one back in (overwrites the current canvas).
- **Print** opens the browser print dialog, formatted for a printable/PDF handout.
- **Clear** wipes every card (not the foundations notes) after confirmation.
- If you have data saved from the earlier 4-column version of this app, it's migrated automatically into Discover/Define/Ideate/Evaluate on first load.

## Files

- `index.html` — foundations, flow guide, and summary board (dashboard)
- `stages/` — the seven stage guide + workspace pages
- `tools/` — the 32 tool/method reference pages
- `style.css` — layout, phase colors, print styles
- `app.js` — main-page dashboard: summaries, foundations, import/export, legacy migration
- `stage.js` — stage-page workspaces (add/edit/delete cards, shared localStorage state)

Note: state is shared across pages via `localStorage`, which requires the pages to share an origin. This works when served from a web server or opened locally in mainstream browsers; if cards added on stage pages don't appear on the dashboard in your browser, serve the folder (e.g., `python3 -m http.server`) instead of opening files directly.

## Extending it

- Drag-and-drop reordering of cards within/between columns
- Multiple saved canvases (switch between projects) instead of one localStorage slot
- Voting/dot-marking on cards for prioritization
- Real-time collaboration (would need a backend or a sync service)
