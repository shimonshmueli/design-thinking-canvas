// Language switch: English / Simplified Chinese.
// Load this FIRST on every page, before any other script.
// Static elements use data-i18n="key" (textContent) or data-i18n-placeholder="key".
// Dynamic JS-built UI should call t("key") directly when constructing HTML.

const LANG_KEY = "dtc-lang";

function getLang() {
  try {
    return localStorage.getItem(LANG_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function setLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang === "zh" ? "zh" : "en");
  } catch { /* ignore */ }
  location.reload();
}

/** Translate a dictionary key to the current language. Falls back to English, then the key itself. */
function t(key) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[getLang()] || entry.en || key;
}

/** Suffix for LLM system/user prompts so the model responds in the current UI language. */
function aiLangInstruction() {
  return getLang() === "zh" ? "\n\nRespond in Simplified Chinese (请用简体中文作答)." : "";
}

/** Sentence appended to copied prompts (glossary) asking for a Chinese answer. */
function aiLangSuffixForCopy() {
  return getLang() === "zh" ? " 请用简体中文回答。" : "";
}

function applyStaticTranslations() {
  document.documentElement.setAttribute("data-lang", getLang());
  document.documentElement.lang = getLang() === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[key]) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (I18N[key]) el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (I18N[key]) el.placeholder = t(key);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (I18N[key]) el.title = t(key);
  });
}

function buildLangSwitch() {
  const lang = getLang();
  const el = document.createElement("span");
  el.className = "lang-switch";
  el.innerHTML =
    `<button type="button" data-lang="en" class="${lang === "en" ? "lang-active" : ""}">EN</button>` +
    `<button type="button" data-lang="zh" class="${lang === "zh" ? "lang-active" : ""}">中文</button>`;
  el.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
  return el;
}

function mountLangSwitch() {
  document.querySelectorAll(".lang-switch-mount").forEach((mount) => {
    mount.replaceWith(buildLangSwitch());
  });
}

// ---------------------------------------------------------------------
// UI string dictionary (chrome shared across pages; JS files call t()).
// Stage/tool/glossary content dictionaries are defined in their own files
// (generated pages carry inline data-i18n text; glossary.js carries zh
// fields directly on each entry).
// ---------------------------------------------------------------------

const I18N = {
  // Header / nav
  "nav.canvas": { en: "◉ Canvas", zh: "◉ 画布" },
  "nav.report": { en: "▤ Report", zh: "▤ 报告" },
  "nav.stage.discover": { en: "Discover", zh: "探索" },
  "nav.stage.define": { en: "Define", zh: "定义" },
  "nav.stage.ideate": { en: "Ideate", zh: "构思" },
  "nav.stage.make": { en: "Make", zh: "制作" },
  "nav.stage.evaluate": { en: "Evaluate", zh: "评估" },
  "nav.stage.develop": { en: "Develop", zh: "开发" },
  "nav.stage.reflect": { en: "Reflect", zh: "反思" },
  "crumb.canvas": { en: "Canvas", zh: "画布" },
  "crumb.report": { en: "Project Report", zh: "项目报告" },

  "header.settings": { en: "⚙ Settings", zh: "⚙ 设置" },
  "header.export": { en: "Export", zh: "导出" },
  "header.export.title": { en: "Save canvas as a .json file", zh: "将画布保存为 .json 文件" },
  "header.import": { en: "Import", zh: "导入" },
  "header.import.title": { en: "Load a previously exported .json file", zh: "加载之前导出的 .json 文件" },
  "header.clear": { en: "Clear", zh: "清空" },
  "header.clear.title": { en: "Delete every card", zh: "删除所有卡片" },
  "app.subtitle": {
    en: "Double Diamond & Design Thinking Methods — Discover → Define → Ideate → Make → Evaluate → Develop → Reflect & Improve",
    zh: "双钻石模型与设计思维方法 — 探索 → 定义 → 构思 → 制作 → 评估 → 开发 → 反思与改进",
  },
  "footer.tagline": { en: "Double Diamond tutorial", zh: "双钻石模型教程" },
  "footer.tagline.link": { en: "Design Thinking Canvas", zh: "设计思维画布" },
  "footer.copyright": { en: "© Shimon Shmueli", zh: "© Shimon Shmueli" },
  "save.status.ok": { en: "Saved locally in this browser", zh: "已保存在本浏览器中" },
  "save.status.fail": { en: "Couldn't save — storage may be full", zh: "保存失败 — 存储空间可能已满" },

  // Challenge panel
  "challenge.sectionLabel": { en: "Challenge — the starting point (C)", zh: "挑战 — 起点（C）" },
  "challenge.caption": {
    en: "State the challenge you're taking on — the territory the whole process explores. You must write it yourself. The AI can only help rephrase what you wrote to remove ambiguity; it will not invent or expand your challenge.",
    zh: "写下你要承接的挑战——整个流程要探索的领域。你必须自己撰写。AI 只能帮你改写措辞以消除歧义，不会替你构思或扩展挑战内容。",
  },
  "challenge.placeholder": {
    en: "e.g. Help elderly patients who manage multiple prescriptions at home avoid medication errors",
    zh: "例如：帮助在家中管理多种处方药的老年患者避免用药错误",
  },
  "challenge.rephrase": { en: "✦ Rephrase for clarity", zh: "✦ 改写以更清晰" },
  "challenge.rephrasing": { en: "Rephrasing…", zh: "改写中…" },
  "challenge.contacting": { en: "Contacting your LLM…", zh: "正在联系你的 LLM…" },
  "challenge.empty": {
    en: "Write your challenge first — the AI can only rephrase what you wrote, not invent it.",
    zh: "请先写下你的挑战 — AI 只能改写你写的内容，不能替你构思。",
  },
  "challenge.noKey": { en: "No API key configured — add one in Settings.", zh: "尚未配置 API 密钥 — 请在设置中添加。" },
  "challenge.pick": {
    en: "Pick a rephrasing if one says it better — or keep your own wording.",
    zh: "如果某个改写版本表达更清楚，可以选用它 — 或保留你自己的措辞。",
  },
  "challenge.use": { en: "Use", zh: "采用" },
  "challenge.dismiss": { en: "Dismiss", zh: "忽略" },
  "challenge.updated": { en: "Updated.", zh: "已更新。" },
  "challenge.networkErr": {
    en: "The request never reached the provider. If you opened this page as a local file, serve the folder instead (run `python3 -m http.server` in it, then open http://localhost:8000) — some browsers block API calls from file:// pages.",
    zh: "请求未能到达服务提供方。如果你是直接打开本地文件查看此页面，请改为通过服务器访问（在该文件夹中运行 `python3 -m http.server`，然后打开 http://localhost:8000）——部分浏览器会阻止从 file:// 页面发起的 API 调用。",
  },

  // Challenge selection worksheet
  "selection.sectionLabel": { en: "Challenge selection worksheet", zh: "挑战筛选工作表" },
  "selection.intro": {
    en: "Do the fit assessment for real, then decide: accept, scope down, or reject.",
    zh: "认真完成契合度评估，然后决定：接受、缩小范围，或拒绝。",
  },
  "selection.background.label": { en: "Team / personal background", zh: "团队 / 个人背景" },
  "selection.background.placeholder": {
    en: "Who is doing this? Skills, domain knowledge, networks, resources, constraints — the honest picture the fit assessment should be measured against.",
    zh: "由谁来做这件事？技能、领域知识、人脉资源、可用资源与限制——契合度评估应该基于这份真实情况来衡量。",
  },
  "selection.values.label": { en: "Fit with our values", zh: "与我们价值观的契合度" },
  "selection.values.placeholder": {
    en: "Which of our values does this challenge serve or violate?",
    zh: "这项挑战符合还是违背了我们的哪些价值观？",
  },
  "selection.objectives.label": { en: "Fit with our objectives", zh: "与我们目标的契合度" },
  "selection.objectives.placeholder": { en: "Which objectives does solving it advance?", zh: "解决它能推进哪些目标？" },
  "selection.role.label": { en: "Fit with our role & capabilities", zh: "与我们角色和能力的契合度" },
  "selection.role.placeholder": {
    en: "Why is this credibly ours? What can we actually bring?",
    zh: "为什么这确实是我们该做的？我们实际能带来什么？",
  },
  "selection.swot.heading": { en: "SWOT — about this challenge specifically", zh: "SWOT 分析 — 针对这项挑战本身" },
  "selection.strengths.label": { en: "Strengths (internal)", zh: "优势（内部）" },
  "selection.strengths.placeholder": { en: "What do we have that matters for this challenge?", zh: "我们拥有哪些对这项挑战有用的资源？" },
  "selection.weaknesses.label": { en: "Weaknesses (internal)", zh: "劣势（内部）" },
  "selection.weaknesses.placeholder": { en: "What do we lack that this challenge demands?", zh: "这项挑战所需、但我们缺乏的是什么？" },
  "selection.opportunities.label": { en: "Opportunities (external)", zh: "机会（外部）" },
  "selection.opportunities.placeholder": {
    en: "What external conditions make this worth pursuing now?",
    zh: "有哪些外部条件让现在值得推进这件事？",
  },
  "selection.threats.label": { en: "Threats (external)", zh: "威胁（外部）" },
  "selection.threats.placeholder": { en: "What outside forces could sink it?", zh: "哪些外部因素可能使其失败？" },
  "selection.facilitate.heading": { en: "Facilitation — before you decide", zh: "引导讨论 — 在你做决定之前" },
  "selection.facilitate.caption": {
    en: "The AI reads everything above and asks a few questions back. It gives no suggestions and no opinions — the questions are only there to make the team think, or rethink.",
    zh: "AI 会阅读以上所有内容，并向团队反问几个问题。它不提供建议也不表达意见——这些问题只是为了促使团队思考，或重新思考。",
  },
  "selection.facilitate.button": { en: "✦ Ask us facilitator questions", zh: "✦ 让 AI 提出引导性问题" },
  "selection.facilitate.reading": { en: "Reading your worksheet…", zh: "正在阅读你的工作表…" },
  "selection.facilitate.guardEmpty": {
    en: "Fill in the challenge and at least part of the worksheet first — the facilitator can only ask about what you wrote.",
    zh: "请先填写挑战陈述及部分工作表内容 — 引导者只能针对你写的内容提问。",
  },
  "selection.facilitate.done": {
    en: "Discuss as a team, capture your thinking in the reflections box — then decide.",
    zh: "请团队一起讨论，把想法记录在反思栏中 — 然后再做决定。",
  },
  "selection.reflections.label": { en: "Team reflections", zh: "团队反思" },
  "selection.reflections.hint": {
    en: "(your answers and rethinking, in your own words)",
    zh: "（用你自己的话记录你们的回答与重新思考）",
  },
  "selection.reflections.placeholder": {
    en: "What the questions surfaced — doubts confirmed or dismissed, scope adjusted, gaps to fill…",
    zh: "这些问题引发了哪些思考——确认或打消了哪些疑虑、调整了哪些范围、还有哪些空白需要补上……",
  },
  "selection.decision.label": { en: "Decision", zh: "决定" },
  "selection.decision.undecided": { en: "Undecided…", zh: "尚未决定…" },
  "selection.decision.accept": { en: "Accept the challenge as stated", zh: "按原样接受该挑战" },
  "selection.decision.subset": { en: "Accept a subset — scope it down", zh: "接受其中一部分 — 缩小范围" },
  "selection.decision.reject": { en: "Reject the challenge", zh: "拒绝该挑战" },
  "selection.scoped.label": { en: "Scoped-down challenge", zh: "缩小范围后的挑战" },
  "selection.scoped.hint": { en: "(if accepting a subset)", zh: "（若接受部分挑战时填写）" },
  "selection.scoped.placeholder": {
    en: "e.g. World hunger → reduce food insecurity among seniors in our county",
    zh: "例如：全球饥饿问题 → 减少本县老年人的食物不安全状况",
  },

  // Foundations
  "foundations.sectionLabel": { en: "Foundations", zh: "基础" },
  "foundations.criteria.heading": { en: "Challenge selection criteria", zh: "挑战筛选标准" },
  "foundations.criteria.scoping": {
    en: "Accepting a challenge is not all-or-nothing. You may reject it, or a-priori accept a subset of it: few teams can solve world hunger, but a team that knows its internal and external strengths can deliberately reduce the challenge to something digestible — tackle local hunger, say — before the process begins. Use the worksheet below to make that call explicit.",
    zh: "接受一项挑战并非全有或全无。你可以拒绝它，也可以事先只接受其中一部分：能解决全球饥饿问题的团队少之又少，但了解自身内外部优势的团队，可以在流程开始前就有意识地把挑战缩小到可消化的程度——比如专注于本地饥饿问题。用下面的工作表把这个决定明确写下来。",
  },
  "foundations.challenge.placeholder": { en: "Notes on why this challenge was selected…", zh: "记录选择这项挑战的原因…" },
  "foundations.themes.heading": { en: "Themes / product category", zh: "主题 / 产品类别" },
  "foundations.themes.caption": { en: "The territory this challenge sits in.", zh: "这项挑战所处的领域。" },
  "foundations.themes.placeholder": {
    en: "e.g. home energy, elder care, onboarding…",
    zh: "例如：家庭能源、老年照护、新用户引导……",
  },
  "foundations.thinking.heading": { en: "Thinking modes", zh: "思维模式" },
  "foundations.thinking.divergent": {
    en: "Analysis, exploring, generating, collecting, imagining, expanding scope, discovering, splitting",
    zh: "分析、探索、生成、收集、想象、扩大范围、发现、拆解",
  },
  "foundations.thinking.convergent": {
    en: "Synthesis, reduction (filtering out), evaluation (addition), combinations/merging, abstractions, sensemaking, clustering, categorizing",
    zh: "综合、简化（筛除）、评估（补充）、组合/合并、抽象、理解意义、聚类、分类",
  },
  "foundations.thinking.note": {
    en: "Note: this mapping follows the systems-engineering tradition, where analysis decomposes (expands) and synthesis combines (reduces). Much of the design literature uses the terms the other way around — see the ⓘ entries above.",
    zh: "说明：此处的划分遵循系统工程传统，即分析是分解（扩展），综合是组合（收敛）。许多设计文献中这两个词的用法正好相反 — 详见上方 ⓘ 词条说明。",
  },
  "foundations.feeder.heading": { en: "Topics that feed the process", zh: "为流程提供支撑的主题" },
  "foundations.feeder.1": { en: "Problem solving", zh: "问题解决" },
  "foundations.feeder.2": { en: "new and useful", zh: "新颖且有用" },
  "foundations.feeder.3": { en: "new and brought to market (deployed)", zh: "新颖且已投入市场（已落地）" },
  "foundations.feeder.4": {
    en: "Discipline-based thinking: medical, engineering, manufacturing, business…",
    zh: "各学科思维方式：医学、工程、制造、商业……",
  },
  "foundations.feeder.5": {
    en: "structure, behaviors, requirements, complexity, holism, emergence, boundaries, feedback…",
    zh: "结构、行为、需求、复杂性、整体性、涌现、边界、反馈……",
  },

  // Flow guide
  "flow.diamond.discover": { en: "Discover", zh: "探索" },
  "flow.diamond.define": { en: "Define", zh: "定义" },
  "flow.diamond.ideate": { en: "Ideate", zh: "构思" },
  "flow.diamond.make": { en: "Make", zh: "制作" },
  "flow.srDesc": {
    en: "The Double Diamond process: a Challenge (C) enters the first diamond, which diverges through Discover and converges through Define into a Problem Definition (PD). The second diamond diverges through Ideate and converges through Make into a Solution Concept (SC), which is then Evaluated, passed through the Develop gate (desirability, feasibility, viability), and followed by Reflect & Improve.",
    zh: "双钻石流程：一项挑战（C）进入第一个钻石，先经过探索发散，再经过定义收敛，形成问题定义（PD）。第二个钻石先经过构思发散，再经过制作收敛，形成解决方案概念（SC），随后进入评估阶段，通过开发关卡（合意性、可行性、可行性）检验，最后进行反思与改进。",
  },
  "flow.band1": { en: "Phase 1 — problem space: exploring & defining", zh: "阶段一 — 问题空间：探索与定义" },
  "flow.band2": { en: "Phase 2 — solution space: exploring & making", zh: "阶段二 — 解决方案空间：探索与制作" },
  "flow.chip.evaluate": { en: "Evaluate", zh: "评估" },
  "flow.chip.develop": { en: "Develop (viability · feasibility · desirability)", zh: "开发（商业可行性 · 技术可行性 · 合意性）" },
  "flow.chip.reflect": { en: "Reflect & Improve", zh: "反思与改进" },
  "flow.mapNote.summary": {
    en: "How this maps to the standard four-phase Double Diamond",
    zh: "这与标准四阶段双钻石模型的对应关系",
  },
  "flow.mapNote.body": {
    en: "The Design Council's canonical model (2004) has four phases: Discover, Define, Develop, Deliver. This canvas keeps Discover and Define unchanged, then expands the second diamond for finer scaffolding: Ideate + Make correspond to the canonical Develop (generating and realizing solutions), and Evaluate + Develop correspond to the canonical Deliver (testing, the build decision, and launch). Reflect & Improve is an added meta-phase drawn from reflective-practice tradition. If you encounter the four-phase model elsewhere — you will — this is the translation.",
    zh: "英国设计委员会 2004 年的经典模型有四个阶段：探索、定义、开发、交付。本画布保留了「探索」与「定义」不变，并将第二个钻石拆分得更细：「构思 + 制作」对应经典模型中的「开发」（生成并实现方案），「评估 + 开发」对应经典模型中的「交付」（测试、是否投产的决定、上线）。「反思与改进」是从反思性实践传统中新增的元阶段。如果你在别处遇到四阶段模型——你一定会遇到——这就是两者的对应关系。",
  },

  // Board / dashboard
  "board.sectionLabel": { en: "Canvas", zh: "画布" },
  "board.note": {
    en: "These columns are summaries. The actual work — cards, worksheets, AI assist — happens on each stage's own page: open a workspace to begin.",
    zh: "以下各列只是摘要。实际的工作——卡片、工作表、AI 协助——都在各阶段自己的页面上进行：打开工作区即可开始。",
  },
  "board.noCards": { en: "No cards yet", zh: "暂无卡片" },
  "board.card": { en: "card", zh: "张卡片" },
  "board.cards": { en: "cards", zh: "张卡片" },
  "board.openWorkspace": { en: "Open workspace →", zh: "打开工作区 →" },
  "board.briefStatus": { en: "Brief", zh: "简报" },
  "board.sections": { en: "sections", zh: "个部分" },
  "board.toolEntry": { en: "tool worksheet entry", zh: "条工具条目" },
  "board.toolEntries": { en: "tool worksheet entries", zh: "条工具条目" },
  "report.cta.compile": { en: "compile it into a report.", zh: "将其汇编成报告。" },
  "report.cta.button": { en: "▤ Generate report", zh: "▤ 生成报告" },
  "report.cta.cards": { en: "cards", zh: "张卡片" },
  "report.cta.card": { en: "card", zh: "张卡片" },
  "report.cta.and": { en: "and", zh: "和" },
  "report.cta.entry": { en: "tool entry", zh: "条工具条目" },
  "report.cta.entries": { en: "tool entries", zh: "条工具条目" },
  "report.cta.across": { en: "across", zh: "分布在" },
  "report.cta.stage": { en: "stage", zh: "个阶段" },
  "report.cta.stages": { en: "stages", zh: "个阶段" },
  "report.cta.project": { en: "Your project has", zh: "你的项目已有" },

  // Stage titles / hints (used by app.js PHASE_CONFIG)
  "phase.discover.title": { en: "Discover", zh: "探索" },
  "phase.discover.hint": {
    en: "Research & empathy. Explore the problem — talk to users, gather observations, question assumptions.",
    zh: "研究与共情。探索问题——与用户交流、收集观察、质疑假设。",
  },
  "phase.define.title": { en: "Define", zh: "定义" },
  "phase.define.hint": {
    en: "Sensemaking & gaining insights. Synthesize findings into a sharp problem definition.",
    zh: "理解意义并获得洞察。将发现综合为清晰的问题定义。",
  },
  "phase.ideate.title": { en: "Ideate", zh: "构思" },
  "phase.ideate.hint": { en: "Creating potential solutions. Generate concepts broadly — go wide again.", zh: "创造潜在解决方案。广泛生成概念——再次发散。" },
  "phase.make.title": { en: "Make", zh: "制作" },
  "phase.make.hint": { en: "Realization and representation. Narrow to the concepts worth building.", zh: "落实与呈现。收敛到值得实现的概念。" },
  "phase.evaluate.title": { en: "Evaluate", zh: "评估" },
  "phase.evaluate.hint": { en: "Test the solution concept with users, customers, and experts.", zh: "与用户、客户和专家一起测试解决方案概念。" },
  "phase.develop.title": { en: "Develop", zh: "开发" },
  "phase.develop.hint": {
    en: "Weigh viability, feasibility, and desirability before committing to build.",
    zh: "在投入开发前权衡可行性、可行性与合意性。",
  },
  "phase.reflect.title": { en: "Reflect & Improve", zh: "反思与改进" },
  "phase.reflect.hint": {
    en: "Reflective practitioner, team, and organization — improve the process and the next release.",
    zh: "反思型实践者、团队与组织——改进流程与下一版发布。",
  },
  "mode.divergent": { en: "Divergent", zh: "发散" },
  "mode.convergent": { en: "Convergent", zh: "收敛" },
  "mode.testing": { en: "Testing", zh: "测试" },
  "mode.gate": { en: "Gate check", zh: "关卡检查" },
  "mode.meta": { en: "Meta", zh: "元阶段" },

  // Summary strip
  "summary.approach.label": { en: "Approach", zh: "方法" },
  "summary.approach.text": {
    en: "zooming-in-out, optimizing/satisficing/maximizing (rarely), reflective, empathic, human-centric, experiential, calculated risk, balanced, embodiment, exploratory, strategic, what-if, proactive…",
    zh: "放大缩小视角、优化/满意化/最大化（较少见）、反思性、共情、以人为本、体验式、有计算的风险、平衡、具身化、探索性、战略性、假设性、主动……",
  },
  "summary.attitudes.label": { en: "Attitudes / mindsets", zh: "态度 / 心态" },
  "summary.attitudes.text": {
    en: "optimism, tackle hard/wicked problems, collaboration, failure allowed (reflected on and corrected), playful, intra/entrepreneurial, creative confidence, bias to action, rethink (and possibly break) rules…",
    zh: "乐观、敢于挑战棘手/复杂问题、协作、允许失败（并加以反思纠正）、玩乐精神、内部创业/创业精神、创造自信、行动导向、重新思考（并可能打破）规则……",
  },
  "summary.thinking.label": { en: "Thinking", zh: "思维方式" },
  "summary.thinking.text": { en: "systems, holistic, divergent/convergent, cross-disciplinary", zh: "系统性、整体性、发散/收敛、跨学科" },

  // Settings modal
  "settings.title": { en: "Settings", zh: "设置" },
  "settings.name.label": { en: "Your name", zh: "你的姓名" },
  "settings.about.label": { en: "About yourself", zh: "关于你自己" },
  "settings.about.hint": { en: "(free form — used to personalize copied LLM prompts)", zh: "（自由填写 — 用于个性化你复制的 LLM 提示词）" },
  "settings.about.placeholder": {
    en: "e.g. Industrial design undergrad, comfortable with sketching, new to business strategy; learning design thinking for a product course.",
    zh: "例如：工业设计本科生，擅长草图绘制，对商业战略较陌生；正在为一门产品课程学习设计思维。",
  },
  "settings.ai.heading": { en: "AI assistant — bring your own key", zh: "AI 助手 — 使用你自己的密钥" },
  "settings.provider.label": { en: "Provider", zh: "服务提供方" },
  "settings.model.label": { en: "Model", zh: "模型" },
  "settings.model.hint": { en: "(optional — leave blank for the default; type to search)", zh: "（可选 — 留空则使用默认模型；输入以搜索）" },
  "settings.key.label": { en: "API key", zh: "API 密钥" },
  "settings.note": {
    en: "Your name and key are stored only in this browser (localStorage). The key is sent only to the provider you select, directly from your browser. Don't enter your key on a shared or public computer.",
    zh: "你的姓名和密钥仅保存在本浏览器（localStorage）中。密钥只会从你的浏览器直接发送给你所选择的服务提供方。请勿在共享或公共电脑上输入密钥。",
  },
  "settings.save": { en: "Save", zh: "保存" },
  "settings.saved": { en: "Saved.", zh: "已保存。" },
  "settings.close": { en: "Close", zh: "关闭" },

  // Glossary modal chrome
  "glossary.copyExplanation": { en: "Copy explanation", zh: "复制说明" },
  "glossary.copyPrompt": { en: "Copy LLM prompt", zh: "复制 LLM 提示词" },
  "glossary.copied": { en: "Copied ✓", zh: "已复制 ✓" },
  "glossary.refsLabel": { en: "References", zh: "参考资料" },
  "glossary.promptNoteWith": {
    en: "\"Copy LLM prompt\" gives you a ready-made prompt to paste into your LLM for a deeper explanation, personalized from the About yourself notes in your Settings.",
    zh: "「复制 LLM 提示词」会为你生成一段现成的提示词，粘贴到你的 LLM 中即可获得更深入的讲解，并会根据你在设置中填写的「关于你自己」信息进行个性化调整。",
  },
  "glossary.promptNoteWithout": {
    en: "\"Copy LLM prompt\" gives you a ready-made prompt to paste into your LLM for a deeper explanation — fill in \"About yourself\" in Settings to personalize it.",
    zh: "「复制 LLM 提示词」会为你生成一段现成的提示词，粘贴到你的 LLM 中即可获得更深入的讲解 — 在设置中填写「关于你自己」即可个性化该提示词。",
  },

  // Card / workspace generic
  "workspace.sectionLabel": { en: "Workspace", zh: "工作区" },
  "workspace.hint": {
    en: "Do the actual work of this stage here. Cards are saved in your browser and summarized on the main canvas page.",
    zh: "在此完成本阶段的实际工作。卡片会保存在你的浏览器中，并在主画布页面上以摘要形式呈现。",
  },
  "workspace.addCard": { en: "+ Add card", zh: "+ 添加卡片" },
  "workspace.noCards": { en: "No cards yet — add your first above.", zh: "暂无卡片 — 请在上方添加第一张。" },
  "workspace.delete": { en: "Delete", zh: "删除" },
  "workspace.sendToStage": { en: "→ Send to stage", zh: "→ 发送到阶段" },
  "workspace.sent": { en: "Sent ✓", zh: "已发送 ✓" },

  "assist.heading": { en: "✦ AI assist", zh: "✦ AI 协助" },
  "assist.suggestCards": { en: "Suggest cards for this stage", zh: "为本阶段建议卡片" },
  "assist.suggestEntries": { en: "Suggest entries for this tool", zh: "为该工具建议条目" },
  "assist.noKey": { en: "No API key yet — set your name, provider, and key in ", zh: "尚未配置 API 密钥 — 请在" },
  "assist.noKeyLink": { en: "Settings on the Canvas page", zh: "画布页面的设置" },
  "assist.aboutNudge": { en: "Tip: add your name and a line about yourself in ", zh: "提示：在" },
  "assist.aboutNudgeLink": { en: "Settings", zh: "设置" },
  "assist.aboutNudgeSuffix": { en: " to personalize AI help.", zh: "中填写姓名与自我介绍，以获得更个性化的 AI 协助。" },
  "assist.contacting": { en: "Contacting your LLM…", zh: "正在联系你的 LLM…" },
  "assist.reviewCards": {
    en: "Review the suggestions — add the ones you agree with. Verify anything factual.",
    zh: "请审阅这些建议 — 添加你认同的内容，并核实其中的事实性信息。",
  },
  "assist.reviewEntries": {
    en: "Review the suggestions — add what's useful, then verify it. The LLM may be wrong or outdated.",
    zh: "请审阅这些建议 — 添加有用的内容并加以核实。LLM 的回答可能有误或已过时。",
  },
  "assist.add": { en: "Add", zh: "添加" },
  "assist.addAll": { en: "Add all", zh: "全部添加" },
  "assist.dismiss": { en: "Dismiss", zh: "忽略" },
  "assist.added": { en: "Added.", zh: "已添加。" },
  "assist.gateBlocked": {
    en: "The AI won't help in the solution space until the first diamond is closed — write your ",
    zh: "在完成第一个钻石之前，AI 不会在解决方案空间提供协助 — 请先撰写",
  },
  "assist.gateBlockedStage": { en: "Problem Definition on the Define page", zh: "「定义」页面上的问题定义" },
  "assist.gateBlockedSuffix": { en: " first. You can still add cards manually.", zh: "。你仍可以手动添加卡片。" },
  "assist.gateBlockedSuffixTool": { en: " first. You can still add entries manually.", zh: "。你仍可以手动添加条目。" },
  "assist.networkErr": {
    en: "The request never reached the provider. If you opened this page as a local file, serve the folder instead (python3 -m http.server) — some browsers block API calls from file:// pages.",
    zh: "请求未能到达服务提供方。如果你是直接打开本地文件查看此页面，请改为通过服务器访问（python3 -m http.server）— 部分浏览器会阻止从 file:// 页面发起的 API 调用。",
  },
  "assist.modelLabel": { en: "Model used for suggestions", zh: "用于生成建议的模型" },
  "assist.customModel": { en: "Custom model…", zh: "自定义模型…" },
  "assist.customModelPrompt": { en: "Model identifier (as your provider expects it):", zh: "模型标识符（按照服务提供方要求的格式）：" },

  // Brief editor / display
  "brief.heading": { en: "Problem Definition (Brief)", zh: "问题定义（简报）" },
  "brief.editorHint": {
    en: "The exit artifact of the first diamond. Everything in the second diamond (Ideate, Make, Evaluate, Develop) is framed by what you write here. Synthesize it from your Discover and Define cards — or let your LLM draft it, then correct it.",
    zh: "这是第一个钻石的产出成果。第二个钻石（构思、制作、评估、开发）中的一切都以你在此写下的内容为框架。请从你的探索与定义卡片中综合提炼——或先让 LLM 起草，再自行修正。",
  },
  "brief.draftButton": { en: "✦ Draft brief with AI", zh: "✦ 用 AI 起草简报" },
  "brief.drafting": { en: "Drafting…", zh: "起草中…" },
  "brief.filled": { en: "Filled", zh: "已填写" },
  "brief.filledEmptyFields": {
    en: "empty field(s). This is a draft — verify and rewrite it in your own words.",
    zh: "个空白字段。这只是草稿 — 请核实并用你自己的话重新撰写。",
  },
  "brief.allFilled": {
    en: "All fields already have content — clear a field first if you want a fresh draft for it.",
    zh: "所有字段均已有内容 — 如需重新生成某个字段的草稿，请先清空该字段。",
  },
  "brief.displayHint": {
    en: "Work in this stage is framed by the brief. ",
    zh: "本阶段的工作以该简报为框架。",
  },
  "brief.editLink": { en: "Edit it on the Define page →", zh: "在「定义」页面编辑 →" },
  "brief.noBrief": {
    en: "No brief yet. The second diamond needs one — every idea, prototype, and test should trace back to it. ",
    zh: "尚无简报。第二个钻石需要它——每一个想法、原型和测试都应能追溯回它。",
  },
  "brief.writeLink": { en: "Write the brief on the Define page →", zh: "在「定义」页面撰写简报 →" },
  "brief.problem": { en: "Problem statement", zh: "问题陈述" },
  "brief.users": { en: "Users & stakeholders", zh: "用户与利益相关者" },
  "brief.needs": { en: "Needs, wants, aspirations", zh: "需求、诉求与愿景" },
  "brief.pov": { en: "Solution point-of-view (approach)", zh: "解决方案视角（切入方式）" },
  "brief.hmw": { en: "How might we…? (HMW)", zh: "我们该如何……？（HMW）" },
  "brief.objectives": { en: "Objectives & constraints", zh: "目标与限制条件" },
  "brief.success": { en: "Success criteria", zh: "成功标准" },

  // Evaluation plan
  "evalplan.heading": { en: "Evaluation plan", zh: "评估计划" },
  "evalplan.hint": {
    en: "Evaluation is measurement, not opinion. Tie each success criterion from your brief to a specific method, a metric with a threshold, and — once you've run it — the actual result. Unmeasured rows show up as gaps in your report.",
    zh: "评估是测量，而非主观意见。请将简报中的每一条成功标准与具体的方法、带阈值的指标关联起来，并在测试完成后填入实际结果。未测量的行会在报告中被标记为缺口。",
  },
  "evalplan.draft": { en: "✦ Draft plan from my brief", zh: "✦ 根据我的简报起草计划" },
  "evalplan.addRow": { en: "+ Add row", zh: "+ 添加一行" },
  "evalplan.drafting": { en: "Drafting plan rows…", zh: "正在起草计划条目…" },
  "evalplan.needsBrief": { en: "A plan needs criteria to measure — ", zh: "计划需要有可衡量的标准 — 请先" },
  "evalplan.needsBriefLink": { en: "write your brief first", zh: "撰写你的简报" },
  "evalplan.noKey": { en: "No API key — add one in ", zh: "尚未配置 API 密钥 — 请在" },
  "evalplan.noKeyLink": { en: "Settings on the Canvas page", zh: "画布页面的设置" },
  "evalplan.done": {
    en: "Draft rows added — refine the metrics, then run the tests and record results.",
    zh: "已添加草稿条目 — 请细化指标，然后进行测试并记录结果。",
  },
  "evalplan.empty": { en: "No plan rows yet — draft from your brief or add one manually.", zh: "暂无计划条目 — 可根据简报起草，或手动添加一行。" },
  "evalplan.colCriterion": { en: "Success criterion", zh: "成功标准" },
  "evalplan.colMethod": { en: "Method", zh: "方法" },
  "evalplan.colMetric": { en: "Metric / threshold", zh: "指标 / 阈值" },
  "evalplan.colResult": { en: "Result", zh: "结果" },
  "evalplan.criterionPlaceholder": { en: "e.g. Users complete a refill unaided", zh: "例如：用户能独立完成续药操作" },
  "evalplan.metricPlaceholder": { en: "e.g. ≥ 80% success across 5 users", zh: "例如：5 名用户中成功率 ≥ 80%" },
  "evalplan.resultPlaceholder": { en: "measured outcome (leave empty until run)", zh: "实际测得的结果（测试完成前留空）" },
  "evalplan.chooseMethod": { en: "Choose method…", zh: "选择方法…" },
  "evalplan.methodGuide": { en: "method guide →", zh: "方法指南 →" },
  "evalplan.deleteRow": { en: "Delete row", zh: "删除该行" },

  // Challenge display (stage pages)
  "challenge.display.heading": { en: "The Challenge", zh: "挑战陈述" },
  "challenge.display.scoped": { en: " (scoped down)", zh: "（已缩小范围）" },
  "challenge.display.original": { en: "Original: ", zh: "原始陈述：" },
  "challenge.display.editLink": { en: "Edit it on the Canvas page →", zh: "在画布页面编辑 →" },
  "challenge.display.none": {
    en: "No challenge defined yet. The whole process starts from it — ",
    zh: "尚未定义挑战。整个流程都以它为起点 — 请",
  },
  "challenge.display.setLink": { en: "state your challenge on the Canvas page →", zh: "在画布页面写下你的挑战 →" },

  // Tool worksheets summary on stage pages
  "toolws.heading": { en: "From tool worksheets", zh: "来自工具工作表" },
  "toolws.hint": {
    en: "Data captured at the tool level feeds this stage (and its AI context).",
    zh: "在工具层面记录的数据会汇入本阶段（并纳入其 AI 上下文）。",
  },
  "toolws.entry": { en: "entry", zh: "条条目" },
  "toolws.entries": { en: "entries", zh: "条条目" },

  // Tool page worksheet chrome
  "toolpage.worksheet.heading": { en: "Worksheet", zh: "工作表" },
  "toolpage.addEntry": { en: "+ Add entry", zh: "+ 添加条目" },
  "toolpage.entryPlaceholder": { en: "Add a finding, data point, or question to pursue…", zh: "添加一个发现、数据点，或待探究的问题……" },
  "toolpage.noEntries": { en: "No entries yet — capture your first finding above.", zh: "暂无条目 — 请在上方记录你的第一个发现。" },

  // Report page
  "report.title": { en: "Project Report", zh: "项目报告" },
  "report.tagline": {
    en: "One well-formatted Markdown document summarizing your whole project — challenge, process, results, and reflections — with Mermaid charts.",
    zh: "一份格式规范的 Markdown 文档，汇总你整个项目——挑战、流程、结果与反思——并附带 Mermaid 图表。",
  },
  "report.intro": {
    en: "The report compiles everything you've captured: the challenge and foundations, the Problem Definition (brief), every stage's cards, and every tool worksheet. With an API key configured, your LLM writes a polished narrative around your data (it is instructed to use only your content and to flag gaps, not fill them). Without a key, you get a clean data-only report.",
    zh: "该报告会汇编你所记录的一切：挑战与基础信息、问题定义（简报）、各阶段的卡片，以及各工具的工作表。如果配置了 API 密钥，你的 LLM 会围绕你的数据撰写一段精炼的叙述文字（系统会指示它只使用你的实际内容，并标记缺口而非自行填补）。如果没有密钥，你将获得一份简洁的纯数据报告。",
  },
  "report.aiButton": { en: "✦ Generate report (AI narrative)", zh: "✦ 生成报告（AI 叙述版）" },
  "report.dataButton": { en: "Generate data-only report", zh: "生成纯数据报告" },
  "report.download": { en: "Download .md", zh: "下载 .md" },
  "report.copy": { en: "Copy", zh: "复制" },
  "report.printNote": {
    en: "Mermaid charts render on GitHub, GitLab, Obsidian, VS Code (with the Mermaid extension), and most modern Markdown viewers. Review the report before sharing — especially any AI-written narrative.",
    zh: "Mermaid 图表可在 GitHub、GitLab、Obsidian、VS Code（安装 Mermaid 插件后）及大多数现代 Markdown 阅读器中正常渲染。分享前请先审阅报告内容——尤其是 AI 撰写的叙述部分。",
  },
  "report.dataGenerated": { en: "Data-only report generated.", zh: "已生成纯数据报告。" },
  "report.aiGenerated": { en: "AI-narrative report generated — review it before sharing.", zh: "已生成 AI 叙述版报告 — 分享前请先审阅。" },
  "report.compiling": {
    en: "Compiling your data and writing the report — this can take up to a minute…",
    zh: "正在汇编数据并撰写报告 — 这可能需要长达一分钟……",
  },
  "report.noKey": { en: "No API key configured — add one in ", zh: "尚未配置 API 密钥 — 请在" },
  "report.noKeyLink": { en: "Settings on the Canvas page", zh: "画布页面的设置" },
  "report.noKeySuffix": { en: ", or use the data-only report.", zh: "中添加，或使用纯数据报告。" },
  "report.copiedNote": { en: "Copied ✓", zh: "已复制 ✓" },
  "report.stillDataOnly": { en: "You can still use the data-only report.", zh: "你仍然可以使用纯数据报告。" },
  "report.md.pieTitle": { en: "Captured items per stage", zh: "各阶段已记录条目数" },

  // ---- HTML fragments (contain inline <a>/<strong>/<em> — use data-i18n-html) ----
  "challenge.caption.html": {
    en: 'State the challenge you\'re taking on — the territory the whole process explores. <strong>You must write it yourself.</strong> The AI can only help rephrase what you wrote to remove ambiguity; it will not invent or expand your challenge.',
    zh: '写下你要承接的挑战——整个流程要探索的领域。<strong>你必须自己撰写。</strong>AI 只能帮你改写措辞以消除歧义，不会替你构思或扩展挑战内容。',
  },
  "selection.values.field": {
    en: 'Fit with our <a href="#" class="term" data-term="values">values</a>',
    zh: '与我们<a href="#" class="term" data-term="values">价值观</a>的契合度',
  },
  "selection.objectives.field": {
    en: 'Fit with our <a href="#" class="term" data-term="objectives">objectives</a>',
    zh: '与我们<a href="#" class="term" data-term="objectives">目标</a>的契合度',
  },
  "selection.role.field": {
    en: 'Fit with our <a href="#" class="term" data-term="role">role</a> &amp; capabilities',
    zh: '与我们<a href="#" class="term" data-term="role">角色</a>及能力的契合度',
  },
  "selection.swot.heading.html": {
    en: '<a href="#" class="term" data-term="swot">SWOT</a> — about this challenge specifically',
    zh: '<a href="#" class="term" data-term="swot">SWOT</a> 分析 — 针对这项挑战本身',
  },
  "foundations.criteria.li.values": {
    en: 'Fit with our <a href="#" class="term" data-term="values">values</a> — would we stand behind the outcome?',
    zh: '与我们<a href="#" class="term" data-term="values">价值观</a>的契合度 — 我们是否会认同这个结果？',
  },
  "foundations.criteria.li.objectives": {
    en: 'Fit with our <a href="#" class="term" data-term="objectives">objectives</a> — does solving this advance what we\'re trying to achieve?',
    zh: '与我们<a href="#" class="term" data-term="objectives">目标</a>的契合度 — 解决它是否有助于我们实现目标？',
  },
  "foundations.criteria.li.role": {
    en: 'Fit with our <a href="#" class="term" data-term="role">role</a> and capabilities — is this credibly ours to solve?',
    zh: '与我们<a href="#" class="term" data-term="role">角色</a>及能力的契合度 — 这确实是我们该解决的问题吗？',
  },
  "foundations.criteria.li.swot": {
    en: 'Business / strategic fit — is there a viable position here? (<a href="#" class="term" data-term="swot">SWOT</a>)',
    zh: '商业 / 战略契合度 — 这里是否存在可行的定位？（<a href="#" class="term" data-term="swot">SWOT</a>）',
  },
  "foundations.criteria.scoping.html": {
    en: 'Accepting a challenge is not all-or-nothing. You may <strong>reject</strong> it, or <strong>a-priori accept a subset</strong> of it: few teams can solve world hunger, but a team that knows its internal and external strengths can deliberately reduce the challenge to something digestible — tackle <em>local</em> hunger, say — before the process begins. Use the worksheet below to make that call explicit.',
    zh: '接受一项挑战并非全有或全无。你可以<strong>拒绝</strong>它，也可以<strong>事先只接受其中一部分</strong>：能解决全球饥饿问题的团队少之又少，但了解自身内外部优势的团队，可以在流程开始前就有意识地把挑战缩小到可消化的程度——比如专注于<em>本地</em>饥饿问题。用下面的工作表把这个决定明确写下来。',
  },
  "foundations.themes.term": {
    en: '<a href="#" class="term" data-term="themes">Themes / product category</a>',
    zh: '<a href="#" class="term" data-term="themes">主题 / 产品类别</a>',
  },
  "foundations.thinking.note.html": {
    en: 'Note: this mapping follows the systems-engineering tradition, where <em>analysis</em> decomposes (expands) and <em>synthesis</em> combines (reduces). Much of the design literature uses the terms the other way around — see the ⓘ entries above.',
    zh: '说明：此处的划分遵循系统工程传统，即<em>分析</em>是分解（扩展），<em>综合</em>是组合（收敛）。许多设计文献中这两个词的用法正好相反 — 详见上方 ⓘ 词条说明。',
  },
  "foundations.feeder.li.problemsolving": { en: "Problem solving", zh: "问题解决" },
  "foundations.feeder.li.creativity": {
    en: '<a href="#" class="term" data-term="creativity">Creativity</a>: new and useful',
    zh: '<a href="#" class="term" data-term="creativity">创造力</a>：新颖且有用',
  },
  "foundations.feeder.li.innovation": {
    en: '<a href="#" class="term" data-term="innovation">Innovation</a>: new and brought to market (deployed)',
    zh: '<a href="#" class="term" data-term="innovation">创新</a>：新颖且已投入市场（已落地）',
  },
  "foundations.feeder.li.discipline": {
    en: "Discipline-based thinking: medical, engineering, manufacturing, business…",
    zh: "各学科思维方式：医学、工程、制造、商业……",
  },
  "foundations.feeder.li.systems": {
    en: '<a href="#" class="term" data-term="systems-thinking">Systems thinking</a>: structure, behaviors, requirements, complexity, holism, emergence, boundaries, feedback…',
    zh: '<a href="#" class="term" data-term="systems-thinking">系统思维</a>：结构、行为、需求、复杂性、整体性、涌现、边界、反馈……',
  },
  "foundations.feeder.li.computational": {
    en: '<a href="#" class="term" data-term="computational-thinking">Computational thinking</a>',
    zh: '<a href="#" class="term" data-term="computational-thinking">计算思维</a>',
  },
  "foundations.feeder.li.strategic": {
    en: '<a href="#" class="term" data-term="strategic-thinking">Strategic thinking</a>',
    zh: '<a href="#" class="term" data-term="strategic-thinking">战略思维</a>',
  },
  "foundations.feeder.li.intrapreneurship": {
    en: '<a href="#" class="term" data-term="intrapreneurship">Intra/entrepreneurship</a>',
    zh: '<a href="#" class="term" data-term="intrapreneurship">内部创业 / 创业精神</a>',
  },
  "flow.mapNote.body.html": {
    en: 'The Design Council\'s canonical model (2004) has four phases: <strong>Discover, Define, Develop, Deliver</strong>. This canvas keeps Discover and Define unchanged, then expands the second diamond for finer scaffolding: <strong>Ideate + Make</strong> correspond to the canonical <em>Develop</em> (generating and realizing solutions), and <strong>Evaluate + Develop</strong> correspond to the canonical <em>Deliver</em> (testing, the build decision, and launch). <strong>Reflect &amp; Improve</strong> is an added meta-phase drawn from reflective-practice tradition. If you encounter the four-phase model elsewhere — you will — this is the translation.',
    zh: '英国设计委员会 2004 年的经典模型有四个阶段：<strong>探索、定义、开发、交付</strong>。本画布保留了「探索」与「定义」不变，并将第二个钻石拆分得更细：<strong>构思 + 制作</strong>对应经典模型中的<em>开发</em>（生成并实现方案），<strong>评估 + 开发</strong>对应经典模型中的<em>交付</em>（测试、是否投产的决定、上线）。<strong>反思与改进</strong>是从反思性实践传统中新增的元阶段。如果你在别处遇到四阶段模型——你一定会遇到——这就是两者的对应关系。',
  },
  "selection.reflections.field": {
    en: 'Team reflections <span class="settings-opt">(your answers and rethinking, in your own words)</span>',
    zh: '团队反思 <span class="settings-opt">（用你自己的话记录你们的回答与重新思考）</span>',
  },
  "selection.scoped.field": {
    en: 'Scoped-down challenge <span class="settings-opt">(if accepting a subset)</span>',
    zh: '缩小范围后的挑战 <span class="settings-opt">（若接受部分挑战时填写）</span>',
  },
  "flow.chip.develop.html": {
    en: 'Develop <em>(viability · feasibility · desirability)</em>',
    zh: '开发 <em>（商业可行性 · 技术可行性 · 合意性）</em>',
  },

  // Generated stage/tool page chrome
  "stage.comesIn": { en: "Comes in", zh: "输入" },
  "stage.goesOut": { en: "Goes out", zh: "输出" },
  "stage.toolsHeading": { en: "Tools & methods for this stage", zh: "本阶段的工具与方法" },
  "stage.focusHeading": { en: "Focus areas", zh: "关注重点" },
  "tool.whatHeading": { en: "What it is", zh: "这是什么" },
  "tool.howHeading": { en: "How to use it", zh: "如何使用" },
  "tool.watchHeading": { en: "Watch out for", zh: "需要注意" },
  "placeholder.discover": { en: "Add an observation or insight…", zh: "添加一条观察或洞察……" },
  "placeholder.define": { en: "Add a synthesized insight or theme…", zh: "添加一条综合得出的洞察或主题……" },
  "placeholder.ideate": { en: "Add an idea or concept…", zh: "添加一个想法或概念……" },
  "placeholder.make": { en: "Add a concept to prototype…", zh: "添加一个待原型化的概念……" },
  "placeholder.evaluate": { en: "Add a test result or finding…", zh: "添加一条测试结果或发现……" },
  "placeholder.develop": { en: "Add a viability/feasibility/desirability note…", zh: "添加一条关于可行性/合意性的笔记……" },
  "placeholder.reflect": { en: "Add a retro note or improvement…", zh: "添加一条复盘笔记或改进项……" },

  // Confirm / alert dialogs
  "confirm.clearAll": {
    en: "Delete all {n} card(s) from every stage? This can't be undone.",
    zh: "确定要删除所有阶段中的全部 {n} 张卡片吗？此操作无法撤销。",
  },
  "confirm.importNewer": {
    en: "This export was made by a newer version of the canvas — some data may not import. Continue?",
    zh: "这份导出文件来自更新版本的画布 — 部分数据可能无法导入。是否继续？",
  },
  "alert.importInvalid": { en: "That file doesn't look like a valid canvas export.", zh: "该文件似乎不是有效的画布导出文件。" },

  // Report document scaffold (buildDataReport)
  "report.md.generated": { en: "Generated", zh: "生成于" },
  "report.md.process": { en: "Double Diamond process", zh: "双钻石流程" },
  "report.md.challengeHeading": { en: "Challenge", zh: "挑战" },
  "report.md.noChallenge": { en: "No challenge statement recorded.", zh: "尚未记录挑战陈述。" },
  "report.md.scopedTo": { en: "Scoped down to (the operative challenge):", zh: "缩小范围后的挑战（实际执行的挑战）：" },
  "report.md.decisionRejected": { en: "Decision: the challenge was assessed and rejected.", zh: "决定：该挑战经评估后被拒绝。" },
  "report.md.decisionAccepted": { en: "Decision: accepted as stated.", zh: "决定：按原样接受。" },
  "report.md.theme": { en: "Theme / product category:", zh: "主题 / 产品类别：" },
  "report.md.selectionNotes": { en: "Challenge selection notes:", zh: "挑战筛选备注：" },
  "report.md.selectionHeading": { en: "Challenge selection worksheet", zh: "挑战筛选工作表" },
  "report.md.processOverview": { en: "Process overview", zh: "流程概览" },
  "report.md.briefHeading": { en: "Problem Definition (Brief)", zh: "问题定义（简报）" },
  "report.md.noBrief": { en: "No brief recorded — the first diamond has not been closed.", zh: "尚未记录简报 — 第一个钻石尚未完成。" },
  "report.md.noCards": { en: "No cards recorded for this stage.", zh: "本阶段尚未记录卡片。" },
  "report.md.toolWorksheet": { en: "Tool worksheet:", zh: "工具工作表：" },
  "report.md.evalPlan": { en: "Evaluation plan", zh: "评估计划" },
  "report.md.notMeasured": { en: "not yet measured", zh: "尚未测量" },
  "report.md.pendingRows": { en: "of", zh: "共" },
  "report.md.pendingRowsSuffix": {
    en: "plan row(s) have no measured result yet — open gaps.",
    zh: "行计划尚无测量结果 — 属于待补充的缺口。",
  },
  "report.md.summary": {
    en: "{cards} stage cards and {tools} tool worksheet entries captured across the process.",
    zh: "本流程中共记录了 {cards} 张阶段卡片和 {tools} 条工具工作表条目。",
  },
};

// Run immediately: this script tag is placed after the static body content,
// so the DOM (including data-i18n attributes) already exists.
applyStaticTranslations();
mountLangSwitch();
