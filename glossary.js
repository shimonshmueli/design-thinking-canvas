// Glossary: explainer modals for terms that need clarification.
// Any element with data-term="<id>" opens the modal for that term.
// Each modal offers "Copy explanation" and "Copy LLM prompt" buttons.
// Bilingual: each entry carries title/body (EN) and title_zh/body_zh (ZH);
// the active language is picked at render time via getLang() from lang.js.

const GLOSSARY = {
  values: {
    title: "Values (organizational)", title_zh: "价值观（组织层面）",
    body: [
      "The principles an organization (or you, on a personal project) refuses to trade away: what it stands for, how it treats people, what kind of work it will and won't do. In challenge selection, the question is fit: a challenge that conflicts with your values will produce a solution you can't stand behind, no matter how attractive the market is.",
      "Practically: write down 3–5 values that are real (they've cost you something before, or would), then check the candidate challenge against each.",
    ],
    body_zh: [
      "一个组织（或你个人在做一个项目时）绝不愿意拿来交换的原则：它代表什么、如何对待人，以及愿意做和不愿意做哪些工作。在挑战筛选中，关键问题是契合度：一项与你价值观相冲突的挑战，无论市场多么诱人，都会催生出你无法认同的解决方案。",
      "实践建议：写下 3 到 5 条真实存在的价值观（它们曾经、或将会让你付出过代价），然后逐一对照候选挑战进行检验。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  objectives: {
    title: "Objectives", title_zh: "目标",
    body: [
      "What the organization is concretely trying to achieve in the relevant horizon — growth targets, mission outcomes, capability building, market position. A challenge 'fits our objectives' when solving it advances one of them; otherwise even a well-executed project is a detour.",
      "Objectives differ from values (which constrain how you act) and from success criteria (which measure one specific project). State them as outcomes, ideally measurable, not activities.",
    ],
    body_zh: [
      "组织在相关时间范围内具体想要实现的事情——增长目标、使命成果、能力建设、市场地位。当解决某项挑战能推进其中某个目标时，这项挑战就『符合我们的目标』；否则，即便项目执行得再好，也只是一次绕路。",
      "目标不同于价值观（价值观约束你如何行动），也不同于成功标准（成功标准衡量的是某一个具体项目）。应把目标写成结果，最好是可衡量的，而不是活动本身。",
    ],
    refs: [["MIT Sloan — goal setting overview (SMART goals)", "https://mitsloan.mit.edu/ideas-made-to-matter/how-to-set-goals"]],
  },
  role: {
    title: "Role (organizational)", title_zh: "角色（组织层面）",
    body: [
      "The part your organization credibly plays in its ecosystem: what others rely on it for, where it has permission and capability to act. A hospital, a device maker, and an insurer could all tackle 'medication errors' — but each has a different role, so the right challenge framing differs for each.",
      "Ask: given who we are and what we're trusted with, is this our problem to solve? Would our involvement be credible to users and stakeholders?",
    ],
    body_zh: [
      "你的组织在其所处生态系统中可信地扮演的角色：别人依赖它做什么，它在哪些方面拥有行动的许可与能力。医院、设备制造商和保险公司都可能着手解决『用药错误』问题——但各自的角色不同，因此对每一方而言，恰当的挑战框定方式也不同。",
      "问问自己：以我们的身份，以及别人对我们的信任，这真的是我们该解决的问题吗？我们参与其中，对用户和利益相关者而言是否可信？",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  swot: {
    title: "SWOT analysis", title_zh: "SWOT 分析",
    body: [
      "A strategy tool that maps internal Strengths and Weaknesses against external Opportunities and Threats. In challenge selection, run SWOT about the candidate challenge specifically: do our strengths matter for this problem? Do our weaknesses block it? Is there a real external opportunity, and what threatens it?",
      "The classic failure mode is generic entries ('strength: our team') that could apply to anything. Every entry should be specific enough to change a decision.",
    ],
    body_zh: [
      "一种战略工具，将内部的优势与劣势，对照外部的机会与威胁进行梳理。在挑战筛选中，应专门针对候选挑战本身来做 SWOT：我们的优势对这个问题是否重要？我们的劣势是否会阻碍它？是否存在真实的外部机会，又有什么在威胁着它？",
      "最常见的失败模式是写出泛泛而谈的条目（例如『优势：我们的团队』），这种说法放在任何情境下都成立。每一条内容都应该具体到足以影响某个决策。",
    ],
    refs: [
      ["Wikipedia — SWOT analysis", "https://en.wikipedia.org/wiki/SWOT_analysis"],
      ["Investopedia — SWOT", "https://www.investopedia.com/terms/s/swot.asp"],
    ],
  },
  themes: {
    title: "Themes / product category", title_zh: "主题 / 产品类别",
    body: [
      "The broad territory the challenge sits in — e.g., home energy, elder care, personal finance, onboarding. Naming the theme early anchors research (what domain to study, which users to reach) without committing to a specific problem or solution yet.",
      "A theme is wider than a challenge: 'elder care' is a theme; 'help elderly patients managing multiple prescriptions avoid medication errors' is a challenge inside it.",
    ],
    body_zh: [
      "挑战所处的广阔领域——例如家庭能源、老年照护、个人理财、新用户引导。及早为主题命名，可以为研究工作定锚（该研究哪个领域、该接触哪些用户），而无需过早锁定具体的问题或方案。",
      "主题比挑战更宽泛：『老年照护』是一个主题；『帮助管理多种处方药的老年患者避免用药错误』则是这个主题之下的一项具体挑战。",
    ],
    refs: [["Design Council — The Double Diamond", "https://www.designcouncil.org.uk/resources/the-double-diamond/"]],
  },
  divergent: {
    title: "Divergent thinking", title_zh: "发散思维",
    body: [
      "Thinking that expands the option space: generating many possibilities, exploring, collecting, imagining, deferring judgment. The first half of each diamond (Discover, Ideate) is divergent — the goal is breadth and surprise, not correctness.",
      "The term comes from J.P. Guilford's research on creativity (1950s), contrasting divergent production (many answers) with convergent production (one right answer).",
      "A terminology caution: this canvas follows the systems-engineering tradition, which lists <em>analysis</em> (breaking a problem into parts) among divergent moves because decomposition expands what you're looking at. Most design and HCI texts instead treat analysis as convergent (evaluating and filtering) and reserve divergence for generating options. Both readings are coherent — just know which one a given book is using.",
    ],
    body_zh: [
      "扩展选项空间的思维方式：产生大量可能性、探索、收集、想象、暂缓评判。每个钻石的前半部分（探索、构思）都是发散性的——目标是广度与意外发现，而不是正确性。",
      "这个术语源自 J.P. Guilford 在上世纪 50 年代关于创造力的研究，他将发散性产出（多种答案）与收敛性产出（一个正确答案）加以区分。",
      "术语提醒：本画布遵循系统工程传统，把<em>分析</em>（将问题拆解为各个部分）归入发散性动作之列，因为分解会扩展你所审视的对象范围。而大多数设计与人机交互（HCI）文献则相反，把分析视为收敛性动作（评估与筛选），把发散性专门留给『产生选项』。两种理解都是自洽的——只需弄清楚你正在阅读的资料采用的是哪一种。",
    ],
    refs: [
      ["Wikipedia — Divergent thinking", "https://en.wikipedia.org/wiki/Divergent_thinking"],
      ["IxDF — Divergent thinking", "https://www.interaction-design.org/literature/topics/divergent-thinking"],
    ],
  },
  convergent: {
    title: "Convergent thinking", title_zh: "收敛思维",
    body: [
      "Thinking that narrows toward decisions: synthesizing, filtering, clustering, merging, abstracting, choosing. The second half of each diamond (Define, Make) is convergent — the goal is a committed, well-argued selection: a problem definition, then a solution concept.",
      "Good convergence is criteria-driven (traceable to needs and objectives), not just picking the favorite in the room.",
      "A terminology caution: this canvas lists <em>synthesis</em> (combining parts into a whole) among convergent moves, following the systems-engineering tradition — combining reduces many pieces to one. Much of the design literature flips this, calling idea-generation 'synthesis' and treating it as divergent. Both are defensible; check which convention your other sources use.",
    ],
    body_zh: [
      "朝着决策收窄的思维方式：综合、筛选、聚类、合并、抽象、做出选择。每个钻石的后半部分（定义、制作）都是收敛性的——目标是形成一个有充分论证依据、可以承诺执行的选择：先是问题定义，然后是解决方案概念。",
      "良好的收敛应该是以标准为依据的（能够追溯到需求与目标），而不只是选中房间里大家最喜欢的那一个。",
      "术语提醒：本画布遵循系统工程传统，把<em>综合</em>（将各部分组合成一个整体）归入收敛性动作之列——组合会把许多零件简化为一个整体。而许多设计文献的用法正好相反，把『产生想法』称为『综合』，并将其视为发散性动作。两种说法都有道理——请留意你参考的其他资料采用的是哪一种惯例。",
    ],
    refs: [["Wikipedia — Convergent thinking", "https://en.wikipedia.org/wiki/Convergent_thinking"]],
  },
  "systems-thinking": {
    title: "Systems thinking", title_zh: "系统思维",
    body: [
      "Analyzing problems as systems: structures, behaviors, feedback loops, emergence, boundaries — rather than isolated events. In design work it prevents 'fixing' one part of an experience while breaking another, and reveals leverage points where a small change shifts the whole system.",
      "Donella Meadows' 'Thinking in Systems' is the classic accessible introduction.",
    ],
    body_zh: [
      "把问题当作系统来分析：结构、行为、反馈回路、涌现、边界——而不是孤立的事件。在设计工作中，它能防止『修好』体验中的一个部分却弄坏了另一个部分，并能揭示出微小改动就能撬动整个系统的杠杆点。",
      "Donella Meadows 的《系统之美》（Thinking in Systems）是经典且易读的入门读物。",
    ],
    refs: [
      ["Donella Meadows Project — systems thinking resources", "https://donellameadows.org/systems-thinking-resources/"],
      ["Wikipedia — Systems thinking", "https://en.wikipedia.org/wiki/Systems_thinking"],
    ],
  },
  "computational-thinking": {
    title: "Computational thinking", title_zh: "计算思维",
    body: [
      "Solving problems using concepts from computer science: decomposition (splitting a problem into parts), pattern recognition, abstraction, and algorithm design. In design thinking it sharpens problem decomposition in Discover/Define and makes solution concepts precise in Make.",
      "The term was popularized by Jeannette Wing (2006), who argued it's a universal skill, not just for programmers.",
    ],
    body_zh: [
      "运用计算机科学的概念来解决问题：分解（把问题拆分成若干部分）、模式识别、抽象化，以及算法设计。在设计思维中，它能让探索/定义阶段的问题分解更加精细，并让制作阶段的解决方案概念更加精确。",
      "这一术语由 Jeannette Wing 在 2006 年推广开来，她认为这是一项普适性技能，而不仅仅属于程序员。",
    ],
    refs: [
      ["Wing (2006), 'Computational Thinking', CACM", "https://www.cs.cmu.edu/~15110-s13/Wing06-ct.pdf"],
      ["Wikipedia — Computational thinking", "https://en.wikipedia.org/wiki/Computational_thinking"],
    ],
  },
  "strategic-thinking": {
    title: "Strategic thinking", title_zh: "战略思维",
    body: [
      "Reasoning about where to play and how to win over time: which problems are worth solving given the competitive landscape, what position a solution creates, and what future you're betting on. It feeds challenge selection (is this worth our while?) and the Develop gate (does the business model close?).",
    ],
    body_zh: [
      "对『该在哪里竞争、如何长期取胜』进行的推理：在既有的竞争格局下，哪些问题值得解决，一个解决方案会创造出怎样的地位，以及你正在押注怎样的未来。它会影响挑战筛选（这值得我们投入吗？）以及开发关卡（商业模式是否成立？）。",
    ],
    refs: [["Wikipedia — Strategic thinking", "https://en.wikipedia.org/wiki/Strategic_thinking"]],
  },
  intrapreneurship: {
    title: "Intra/entrepreneurship", title_zh: "内部创业/创业精神",
    body: [
      "Entrepreneurship is building a new venture; intrapreneurship (Gifford Pinchot's term) is acting entrepreneurially inside an existing organization — championing an idea, assembling resources, taking calculated risks without owning the company. Design thinking projects usually need one of these mindsets to survive contact with the organization.",
    ],
    body_zh: [
      "创业是创建一家全新的企业；内部创业（Gifford Pinchot 提出的概念）则是在一个既有组织内部以创业者的方式行事——为某个想法摇旗呐喊、调集资源、承担经过计算的风险，但并不拥有这家公司。设计思维项目通常需要具备这两种心态之一，才能在组织内部真正存活下来。",
    ],
    refs: [
      ["Wikipedia — Intrapreneurship", "https://en.wikipedia.org/wiki/Intrapreneurship"],
      ["Investopedia — Intrapreneurship", "https://www.investopedia.com/terms/i/intrapreneurship.asp"],
    ],
  },
  creativity: {
    title: "Creativity", title_zh: "创造力",
    body: [
      "In the research literature: producing ideas that are both novel and useful. Novel alone is randomness; useful alone is routine. Design thinking's divergent stages are structured machinery for reaching novelty; its convergent stages test usefulness.",
    ],
    body_zh: [
      "在研究文献中的定义：产出既新颖又有用的想法。只有新颖而没有用，是随机；只有用而不新颖，是常规。设计思维的发散阶段是达成新颖性的结构化机制；其收敛阶段则用来检验有用性。",
    ],
    refs: [["Wikipedia — Creativity", "https://en.wikipedia.org/wiki/Creativity"]],
  },
  innovation: {
    title: "Innovation", title_zh: "创新",
    body: [
      "Creativity deployed: something new that is actually brought to market or into use. An idea that never ships is an invention at best. The second diamond plus the Develop gate exist precisely to carry creative concepts across the gap into deployed innovation.",
    ],
    body_zh: [
      "被付诸实践的创造力：真正被推向市场或投入使用的新事物。一个从未落地的想法，充其量只是一项发明。第二个钻石加上开发关卡，其存在的意义正是把创造性的概念带过这道鸿沟，变成已落地的创新。",
    ],
    refs: [["Wikipedia — Innovation", "https://en.wikipedia.org/wiki/Innovation"]],
  },
  "c-marker": {
    title: "C — the Challenge", title_zh: "C — 挑战",
    body: [
      "The vetted starting point of the whole process: a broad, user-authored statement of the territory you're taking on, screened against your values, objectives, role, and business fit before any research begins. It enters the first diamond as the input to Discover.",
      "It is deliberately wider than a problem: the first diamond exists to turn this Challenge into a precise Problem Definition.",
    ],
    body_zh: [
      "整个流程经过审核的起点：一份宽泛的、由用户自己撰写的领域陈述，在任何研究开始之前，就已根据你们的价值观、目标、角色定位与商业契合度进行了筛选。它作为「探索」阶段的输入，进入第一个钻石。",
      "它被刻意设计得比『问题』更宽泛：第一个钻石存在的意义，正是把这项挑战转化为一个精确的问题定义。",
    ],
    refs: [["Design Council — The Double Diamond", "https://www.designcouncil.org.uk/resources/the-double-diamond/"]],
  },
  "pd-marker": {
    title: "PD — Problem Definition", title_zh: "PD — 问题定义",
    body: [
      "The exit artifact of the first diamond (the brief): problem statement, users and stakeholders, their needs, the solution point-of-view, a How-Might-We question, objectives and constraints, and success criteria. It closes the problem space and frames everything in the second diamond.",
      "If later work reveals the PD was wrong, the process loops back — that's problem reframing, a feature of the model, not a failure.",
    ],
    body_zh: [
      "第一个钻石的产出成果（简报）：问题陈述、用户与利益相关者、他们的需求、解决方案视角、一个『我们该如何……』（HMW）问题、目标与限制条件，以及成功标准。它标志着问题空间的收尾，并为第二个钻石中的一切工作划定框架。",
      "如果后续工作发现问题定义其实是错的，流程会循环回去——这就是『问题再框定』，它是这个模型的一个特性，而不是失败。",
    ],
    refs: [["IxDF — Define stage", "https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-and-interpret-the-results"]],
  },
  "sc-marker": {
    title: "SC — Solution Concept", title_zh: "SC — 解决方案概念",
    body: [
      "The exit artifact of the second diamond's Make stage: a chosen concept made concrete along four dimensions — structure and morphology, functions/features/behaviors, user interactions, and form/attributes/design language — embodied in testable prototypes.",
      "The SC is what Evaluate tests against the brief's success criteria, and what the Develop gate weighs for desirability, feasibility, and viability.",
    ],
    body_zh: [
      "第二个钻石中「制作」阶段的产出成果：一个在四个维度上具体化的方案——结构与形态、功能/特性/行为、用户交互，以及形态/属性/设计语言——并体现在可供测试的原型中。",
      "SC 正是「评估」阶段用来对照简报成功标准进行测试的对象，也是「开发」关卡用来权衡合意性、技术可行性与商业可行性的对象。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  "problem-statement": {
    title: "Problem statement", title_zh: "问题陈述",
    body: [
      "A concise statement of the need to be addressed — who has the problem, what the problem is, and why it matters — deliberately free of any particular solution. 'Nurses lose track of medication changes during shift handoffs' is a problem; 'we need a handoff app' is a solution wearing a problem costume.",
      "It anchors the brief: every idea in the second diamond should trace back to it.",
    ],
    body_zh: [
      "对需要解决的需求所做的简明陈述——谁遇到了这个问题、问题是什么、为什么它重要——并刻意不涉及任何具体的解决方案。『护士在交班时会遗漏用药变更信息』是一个问题；『我们需要一款交班应用』则是披着问题外衣的解决方案。",
      "它是简报的锚点：第二个钻石中的每一个想法都应该能追溯回它。",
    ],
    refs: [["IxDF — Define stage and problem statements", "https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-and-interpret-the-results"]],
  },
  stakeholders: {
    title: "Users & stakeholders", title_zh: "用户与利益相关者",
    body: [
      "Users experience the problem and the solution directly; stakeholders influence or are affected by it (buyers, operators, regulators, family members, management). They overlap but are not the same — and their needs can conflict, which is itself a design finding worth writing down.",
      "In the brief, name the groups specifically and mark whose needs drive the design vs. whose act as constraints.",
    ],
    body_zh: [
      "用户直接经历问题与解决方案；利益相关者则影响或受其影响（购买者、操作者、监管者、家属、管理层）。二者有重叠但并不相同——他们的需求可能相互冲突，而这种冲突本身就是一项值得记录下来的设计发现。",
      "在简报中，应具体指出各个群体，并标明哪些人的需求驱动设计，哪些人的需求只是约束条件。",
    ],
    refs: [["Wikipedia — Stakeholder", "https://en.wikipedia.org/wiki/Stakeholder_(corporate)"]],
  },
  needs: {
    title: "Needs, wants, aspirations", title_zh: "需求、诉求与愿景",
    body: [
      "Three depths of user motivation: needs are functional necessities (often unstated — users work around them), wants are conscious desires they'll tell you about, aspirations are who they're trying to become. Great solutions usually serve a real need while speaking to an aspiration.",
      "Research methods in Discover (interviews, observation, journeys) exist to surface the unstated needs interviews alone miss.",
    ],
    body_zh: [
      "用户动机的三个层次：需求是功能性的必需品（往往没有被说出口——用户会围绕它变通）；诉求是他们会主动告诉你的、有意识的愿望；愿景则是他们试图成为怎样的人。优秀的解决方案通常既服务于真实的需求，又能呼应某种愿景。",
      "探索阶段的研究方法（访谈、观察、旅程研究）存在的意义，正是为了挖掘出单靠访谈无法发现的、未被言说的需求。",
    ],
    refs: [["IDEO Design Kit — methods for understanding people", "https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit"]],
  },
  pov: {
    title: "Solution point-of-view (approach)", title_zh: "解决方案视角（切入方式）",
    body: [
      "A committed stance on how you'll approach the problem — the angle of attack — without specifying the solution itself. Stanford d.school formalizes it as: [user] needs [need] because [insight]. It frames the solution space: wide enough for many ideas, narrow enough to aim.",
      "Example: 'We believe overwhelmed caregivers need medication management woven into routines they already have, because new standalone routines fail within weeks.'",
    ],
    body_zh: [
      "一种关于『你将如何切入这个问题』的坚定立场——攻克问题的角度——但并不具体指定解决方案本身。斯坦福 d.school 将其形式化为：[用户] 需要 [需求]，因为 [洞察]。它为解决方案空间划定框架：既足够宽，能容纳许多想法，又足够窄，能有的放矢。",
      "示例：『我们认为，不堪重负的照护者需要把用药管理融入他们已有的日常习惯中，因为新增的独立习惯往往在几周内就会失败。』",
    ],
    refs: [["IxDF — Point of view in design thinking", "https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-and-interpret-the-results"]],
  },
  hmw: {
    title: "How Might We…? (HMW)", title_zh: "我们该如何……？（HMW）",
    body: [
      "A short, generative question that turns your problem definition into a launchpad for ideation: 'How might we [help user] [achieve outcome] [in context]?' — e.g., 'How might we help caregivers keep track of regimen changes without adding new routines?' It's the bridge across the vertex of the two diamonds: narrow enough to anchor ideas to a real need, open enough to allow many answers.",
      "Test its calibration: if every idea it invites is the same idea, it's too narrow (a solution in disguise); if it invites ideas for a different problem, it's too broad. The d.school phrasing pattern — [user] needs [need] because [insight] — feeds directly into it.",
    ],
    body_zh: [
      "一个简短的、能催生想法的问题，把你的问题定义转化为构思的起跳板：『我们该如何 [帮助用户] [达成某个结果] [在某种情境下]？』——例如：『我们该如何帮助照护者在不增加新习惯的情况下，跟踪用药方案的变化？』它是横跨两个钻石交汇点的桥梁：既足够窄，能把想法锚定在真实需求上，又足够开放，能容纳多种答案。",
      "检验它的校准是否得当：如果它引出的每个想法都是同一个想法，说明它太窄了（其实是披着问题外衣的解决方案）；如果它引出的想法其实是在回答另一个问题，说明它太宽了。d.school 的句式——[用户] 需要 [需求]，因为 [洞察]——可以直接为它提供素材。",
    ],
    refs: [
      ["IxDF — How Might We questions", "https://www.interaction-design.org/literature/topics/how-might-we"],
      ["IDEO Design Kit — How Might We", "https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit"],
    ],
  },
  "success-criteria": {
    title: "Success criteria", title_zh: "成功标准",
    body: [
      "The observable, ideally measurable conditions under which the project counts as having worked — defined before solutions exist, so evaluation later is honest. Examples: '80% of test users complete a refill unaided', 'medication errors in the pilot ward drop 30% in 3 months'.",
      "They power the Evaluate stage: tests are designed against them, and results are reported against them.",
    ],
    body_zh: [
      "项目被判定为『行之有效』所依据的可观察、最好是可衡量的条件——在解决方案存在之前就先定义好，这样后续的评估才是诚实的。例如：『80% 的测试用户能独立完成续药操作』『试点病区的用药错误在 3 个月内下降 30%』。",
      "它们驱动着评估阶段：测试是依据它们来设计的，结果也是对照它们来汇报的。",
    ],
    refs: [["Nielsen Norman Group — UX metrics and success measures", "https://www.nngroup.com/articles/"]],
  },
  "three-lenses": {
    title: "Desirability · Feasibility · Viability", title_zh: "合意性 · 技术可行性 · 商业可行性",
    body: [
      "IDEO's three lenses of innovation, used at the Develop gate. Desirability: do people demonstrably want it (human lens)? Feasibility: can we actually build and operate it (technical lens)? Viability: does it sustain itself as a business (economic lens)? A concept worth building sits at the intersection of all three.",
      "Each lens should be answered with evidence (from Evaluate, prototyping, and business analysis), not enthusiasm.",
    ],
    body_zh: [
      "IDEO 提出的『创新三透镜』，用于开发关卡。合意性：人们是否确实表现出想要它（人本视角）？技术可行性：我们是否真的能够把它造出来并运营下去（技术视角）？商业可行性：它能否作为一门生意自我维持（经济视角）？一个值得投入开发的概念，恰好处在这三者的交集之中。",
      "每一个透镜都应该用证据（来自评估、原型制作与商业分析）来回答，而不是靠一腔热情。",
    ],
    refs: [["IDEO — Design Thinking FAQ", "https://designthinking.ideo.com/"]],
  },

  // ---- Approach / Attitudes / Thinking chips (dashboard summary strip) ----
  "zoom-in-out": {
    title: "Zooming in/out", title_zh: "放大与缩小视角",
    body: [
      "Moving deliberately between the big-picture system view and granular, ground-level detail — and back — rather than staying fixed at one altitude. In design thinking this shows up constantly: zoom out to see a user's whole journey or a system's structure, zoom in to a single interaction or data point, then out again to check the part still serves the whole.",
    ],
    body_zh: [
      "有意识地在宏观的系统视角与微观的细节层面之间来回切换，而不是固定停留在某一个高度。在设计思维中这种切换随处可见：放大视角看清用户的整段旅程或系统结构，缩小视角聚焦某个具体交互或数据点，然后再放大以确认局部仍然服务于整体。",
    ],
    refs: [["Donella Meadows Project — systems thinking resources", "https://donellameadows.org/systems-thinking-resources/"]],
  },
  satisficing: {
    title: "Optimizing, satisficing, maximizing", title_zh: "优化、满意化、最大化",
    body: [
      "Three different standards for 'good enough': maximizing searches for the single best option, optimizing improves a solution against explicit criteria, and satisficing (Herbert Simon's term) accepts the first option that clears a reasonable threshold — the realistic default under real time and information constraints. Design thinking mostly satisfices deliberately, reserving maximizing for the rare case where the stakes justify the cost of an exhaustive search.",
    ],
    body_zh: [
      "三种不同的『足够好』标准：最大化是寻找单一最优选项，优化是依据明确标准改进方案，满意化（赫伯特·西蒙提出的概念）则是接受第一个达到合理门槛的选项——这是在真实的时间与信息限制下更现实的默认策略。设计思维大多有意选择满意化，只有在赌注足够大、值得付出穷尽搜索的代价时，才会转向最大化。",
    ],
    refs: [["Wikipedia — Satisficing (Herbert Simon)", "https://en.wikipedia.org/wiki/Satisficing"]],
  },
  "reflective-practice": {
    title: "Reflective practice", title_zh: "反思性实践",
    body: [
      "Deliberately thinking about what you're doing while doing it (reflection-in-action) and afterward (reflection-on-action) — examining assumptions, surprises, and results instead of moving on unexamined. Donald Schön's concept of the 'reflective practitioner' underlies this canvas's Reflect & Improve stage: it treats reflection as a professional skill, not an afterthought.",
    ],
    body_zh: [
      "有意识地在行动过程中思考自己在做什么（行动中反思），并在行动之后加以复盘（对行动的反思）——审视假设、意外与结果，而不是不加检视地继续前进。唐纳德·舍恩提出的『反思型实践者』概念，正是本画布『反思与改进』阶段的理论基础：它把反思视为一项专业技能，而不是事后的附加动作。",
    ],
    refs: [["Wikipedia — Donald Schön / The Reflective Practitioner", "https://en.wikipedia.org/wiki/Donald_Sch%C3%B6n"]],
  },
  empathy: {
    title: "Empathy", title_zh: "共情",
    body: [
      "Understanding a user's experience from the inside — their context, constraints, and feelings, not just their stated requests. It's the foundation of Discover: design decisions grounded in genuine empathy address real needs; decisions grounded only in assumptions tend to solve the designer's own imagined problem.",
    ],
    body_zh: [
      "从内部理解用户的体验——他们的情境、限制与感受，而不只是他们明确提出的要求。这是探索阶段的基础：建立在真实共情之上的设计决策能够回应真实需求；仅凭假设做出的决策，往往只是在解决设计者自己想象出来的问题。",
    ],
    refs: [["IDEO Design Kit — Human-Centered Design Toolkit", "https://www.ideo.com/journal/design-kit-the-human-centered-design-toolkit"]],
  },
  "human-centered": {
    title: "Human-centric", title_zh: "以人为本",
    body: [
      "Anchoring the whole process in the needs, capabilities, and context of the people who will use the outcome, rather than starting from technology or organizational convenience. ISO 9241-210 formalizes this as a design approach that involves users throughout, and evaluates solutions against real human use.",
    ],
    body_zh: [
      "把整个流程锚定在最终使用者的需求、能力与所处情境之上，而不是从技术或组织的便利性出发。ISO 9241-210 标准将其形式化为一种在全过程中持续纳入用户参与、并依据真实人类使用情况来评估方案的设计方法。",
    ],
    refs: [["ISO 9241-210:2019 — Human-centred design for interactive systems", "https://www.iso.org/standard/77520.html"]],
  },
  "experiential-learning": {
    title: "Experiential", title_zh: "体验式",
    body: [
      "Learning by doing and reflecting on the doing, rather than by abstract instruction alone. David Kolb's experiential learning cycle — concrete experience, reflective observation, abstract conceptualization, active experimentation — describes why prototyping and testing teach a design team things reading and discussion cannot.",
    ],
    body_zh: [
      "通过实际动手去做、并对所做之事加以反思来学习，而不仅仅依靠抽象的讲授。大卫·科尔布提出的体验式学习循环——具体经验、反思性观察、抽象概念化、主动实验——说明了为什么原型制作与测试能让设计团队学到阅读和讨论无法教给他们的东西。",
    ],
    refs: [["Wikipedia — Experiential learning (David Kolb)", "https://en.wikipedia.org/wiki/Experiential_learning"]],
  },
  "calculated-risk": {
    title: "Calculated risk", title_zh: "有计算的风险",
    body: [
      "Taking on uncertainty deliberately, after weighing the likely upside against the cost of being wrong — the opposite of both recklessness and risk-avoidance. Cheap, fast experiments (prototypes, MVPs) are how design thinking makes risk-taking calculated: they lower the cost of finding out you're wrong.",
    ],
    body_zh: [
      "在权衡可能的收益与出错代价之后，有意识地承担不确定性——这既不同于鲁莽行事，也不同于回避一切风险。低成本、快速的实验（原型、MVP）正是设计思维让『冒险』变得『可计算』的方式：它们降低了发现自己判断错误所需付出的代价。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  "balanced-tradeoffs": {
    title: "Balanced", title_zh: "平衡",
    body: [
      "Holding competing goods in tension deliberately — speed vs. rigor, novelty vs. feasibility, user wants vs. business constraints — rather than resolving every trade-off by defaulting to one side. The Develop gate's desirability/feasibility/viability check is this canvas's most explicit balancing act.",
    ],
    body_zh: [
      "有意识地在相互竞争的价值之间保持张力——速度与严谨、新颖性与可行性、用户诉求与商业限制——而不是每次都默认偏向其中一方来解决权衡问题。本画布中开发关卡的合意性/可行性/商业可行性检验，正是最明显的一次平衡行为。",
    ],
    refs: [["IDEO — Design Thinking FAQ", "https://designthinking.ideo.com/"]],
  },
  embodiment: {
    title: "Embodiment", title_zh: "具身化",
    body: [
      "Understanding and designing interaction as something physically and spatially situated — how a body moves, reaches, holds, and feels — not just an abstract flow of information. Embodied-interaction thinking (Paul Dourish) explains why a sketch, mockup, or physical prototype teaches things a written spec cannot.",
    ],
    body_zh: [
      "把交互理解并设计为一种物理上、空间上真实发生的事情——身体如何移动、伸展、握持与感受——而不仅仅是抽象的信息流。『具身交互』思想（保罗·杜里什提出）解释了为什么一份草图、模型或实体原型能教给我们书面规格说明书做不到的东西。",
    ],
    refs: [["Paul Dourish (2001), Where the Action Is: The Foundations of Embodied Interaction", "https://mitpress.mit.edu/9780262541787/where-the-action-is/"]],
  },
  "exploratory-approach": {
    title: "Exploratory", title_zh: "探索性",
    body: [
      "Treating early-stage work as open-ended investigation rather than execution of a known plan — following leads, tolerating dead ends, and letting findings redirect the work. Discover and Ideate are explicitly exploratory stages; premature convergence there is a common cause of shallow results.",
    ],
    body_zh: [
      "把早期阶段的工作视为一场开放式的探究，而不是执行一份既定计划——跟随线索、容忍走入死胡同，并让发现的结果来重新引导工作方向。探索与构思阶段被明确设计为探索性阶段；过早在这两个阶段收敛，是导致成果浮于表面的常见原因。",
    ],
    refs: [["Design Council — The Double Diamond", "https://www.designcouncil.org.uk/resources/the-double-diamond/"]],
  },
  "what-if-thinking": {
    title: "What-if thinking", title_zh: "假设性思考",
    body: [
      "Deliberately entertaining counterfactuals and future scenarios — 'what if this constraint didn't exist?', 'what if we had to solve this in a day?' — to loosen assumptions before committing to a direction. It underlies back-casting and design heuristics as ideation techniques.",
    ],
    body_zh: [
      "有意识地设想反事实情境与未来场景——『如果这个限制条件不存在会怎样？』『如果我们必须在一天内解决这个问题会怎样？』——以此在确定方向之前松动既有假设。它是反向构思法与设计启发法这类构思技巧背后的思维基础。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  proactive: {
    title: "Proactive", title_zh: "主动",
    body: [
      "Initiating action based on anticipated needs rather than waiting for a problem to force a response — surfacing challenges, testing assumptions, and seeking feedback before being asked. It's the disposition that makes a team choose and scope its own challenges rather than only reacting to assigned ones.",
    ],
    body_zh: [
      "基于预判到的需求主动采取行动，而不是等到问题倒逼才做出回应——在被要求之前就主动发现挑战、检验假设、寻求反馈。正是这种倾向，让一个团队能够主动选择并界定自己的挑战，而不只是被动地应对分配给自己的任务。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  optimism: {
    title: "Optimism", title_zh: "乐观",
    body: [
      "A working belief that problems — even large, messy ones — are addressable, which is a precondition for attempting them at all. Tim Brown, IDEO's CEO, names optimism explicitly as a design thinking mindset: the confidence that at least one of the many possible solutions being explored will make things better.",
    ],
    body_zh: [
      "一种在实践中持有的信念，即认为问题——即便是庞大而混乱的问题——是可以被处理的，这是愿意去尝试解决它的前提条件。IDEO 首席执行官蒂姆·布朗明确将『乐观』列为设计思维的一种心态：相信在众多正在探索的可能方案中，至少有一个能让情况变得更好。",
    ],
    refs: [["Tim Brown (2009), Change by Design", "https://www.ideo.com/journal/change-by-design"]],
  },
  "wicked-problems": {
    title: "Tackle hard / wicked problems", title_zh: "敢于挑战棘手/复杂问题",
    body: [
      "A willingness to take on 'wicked problems' — Rittel and Webber's term for problems that are ill-defined, have no stopping rule, and where every attempted solution changes the problem itself — instead of retreating to well-defined, easily solvable ones. Design thinking's iterative loop-back structure (reframing, refining) exists specifically because wicked problems can't be solved in one clean pass.",
    ],
    body_zh: [
      "愿意去承接『棘手问题』——里特尔与韦伯提出的概念，指那些定义不清、没有明确停止规则、且每一次尝试性的解决方案都会改变问题本身的问题——而不是退回到那些定义清晰、容易解决的问题上。设计思维中反复循环（重新框定、打磨方案）的结构，正是因为棘手问题无法一次性、干净利落地被解决而存在的。",
    ],
    refs: [["Rittel & Webber (1973), 'Dilemmas in a General Theory of Planning'", "https://en.wikipedia.org/wiki/Wicked_problem"]],
  },
  collaboration: {
    title: "Collaboration", title_zh: "协作",
    body: [
      "Working across roles and disciplines as genuine co-creators rather than handing work sequentially from one specialist to the next. Cross-functional collaboration is what lets a team hold user needs, technical feasibility, and business viability in view at the same time instead of optimizing each in isolation.",
    ],
    body_zh: [
      "跨角色、跨学科地作为真正的共创者一起工作，而不是把工作按顺序从一个专才手中交给下一个专才。跨职能协作让团队能够同时兼顾用户需求、技术可行性与商业可行性，而不是各自孤立地优化其中一项。",
    ],
    refs: [["IDEO — Design Thinking FAQ", "https://designthinking.ideo.com/"]],
  },
  "failure-allowed": {
    title: "Failure allowed", title_zh: "允许失败",
    body: [
      "Treating a failed prototype or test as a valid, expected outcome that produces information — provided it is reflected on and corrected — rather than a result to be hidden or avoided. Stanford d.school lists 'embrace experimentation' among its core mindsets precisely because fear of failure suppresses the cheap, early testing that catches bad ideas before they get expensive.",
    ],
    body_zh: [
      "把失败的原型或测试视为一种正常且预期之内、能够产生有价值信息的结果——前提是对其加以反思并加以修正——而不是要隐藏或回避的结果。斯坦福 d.school 将『拥抱实验』列为其核心心态之一，正是因为对失败的恐惧会抑制那些能在代价变高之前及早发现坏想法的、廉价的早期测试。",
    ],
    refs: [["Stanford d.school — Bootcamp Bootleg (mindsets)", "https://dschool.stanford.edu/resources/design-thinking-bootleg"]],
  },
  playful: {
    title: "Playful", title_zh: "玩乐精神",
    body: [
      "Approaching exploration and prototyping with genuine lightness — trying obviously silly ideas, building rough things for fun — because playfulness lowers the fear of judgment that otherwise suppresses divergent thinking. It's a deliberate mindset in brainstorming facilitation, not just a personality trait.",
    ],
    body_zh: [
      "以真正轻松的心态去探索和制作原型——尝试明显有点荒谬的想法、纯粹为了好玩去搭建一些粗糙的东西——因为玩乐精神能降低对被评判的恐惧，而这种恐惧原本会抑制发散性思维。在头脑风暴引导中，这是一种被刻意运用的心态，而不仅仅是某种性格特质。",
    ],
    refs: [["Stanford d.school — Bootcamp Bootleg (mindsets)", "https://dschool.stanford.edu/resources/design-thinking-bootleg"]],
  },
  "creative-confidence": {
    title: "Creative confidence", title_zh: "创造自信",
    body: [
      "The belief — which Tom and David Kelley argue is learnable, not innate — that you are capable of generating and acting on creative ideas. Teams lacking creative confidence self-censor during divergent stages, quietly shrinking the option space before it's ever written down.",
    ],
    body_zh: [
      "一种信念——汤姆·凯利和大卫·凯利认为这是可以后天习得的，而非与生俱来——即相信自己有能力产生创造性想法并据此行动。缺乏创造自信的团队会在发散阶段进行自我审查，在想法还没被写下来之前，就已经在暗中缩小了选项空间。",
    ],
    refs: [["Tom Kelley & David Kelley (2013), Creative Confidence", "https://www.creativeconfidence.com/"]],
  },
  "bias-to-action": {
    title: "Bias to action", title_zh: "行动导向",
    body: [
      "Preferring to build and test a rough version over continuing to plan or discuss in the abstract. Stanford d.school names it directly as a design thinking mindset: a quick prototype in users' hands produces more real information than another round of internal debate.",
    ],
    body_zh: [
      "更倾向于动手制作并测试一个粗糙版本，而不是继续停留在抽象的规划或讨论阶段。斯坦福 d.school 明确将其列为设计思维的一种心态：一个能尽快交到用户手中的原型，比再进行一轮内部讨论能产生更多真实的信息。",
    ],
    refs: [["Stanford d.school — Bootcamp Bootleg (mindsets)", "https://dschool.stanford.edu/resources/design-thinking-bootleg"]],
  },
  "rethink-rules": {
    title: "Rethink (and possibly break) rules", title_zh: "重新思考（并可能打破）规则",
    body: [
      "Treating existing constraints, conventions, and 'the way it's always been done' as hypotheses to test rather than fixed boundaries — while still being accountable for the consequences of breaking them. Many genuinely novel concepts come from questioning a rule everyone else in the room had stopped noticing.",
    ],
    body_zh: [
      "把既有的限制条件、惯例，以及『一直以来都是这么做的』这类默认设定，当作可以检验的假设，而不是不可动摇的边界——同时仍然对打破这些规则所带来的后果负责。许多真正新颖的概念，都源于质疑一条房间里其他人早已习以为常、不再留意的规则。",
    ],
    refs: [["Design Council — Framework for Innovation", "https://www.designcouncil.org.uk/resources/framework-for-innovation/"]],
  },
  holistic: {
    title: "Holistic", title_zh: "整体性",
    body: [
      "Considering a problem or solution as an interconnected whole — how parts affect each other — rather than optimizing individual pieces in isolation and assuming the sum will work. It's the thinking-mode counterpart to zooming out: you can't hold the whole in view without stepping back from the details.",
    ],
    body_zh: [
      "把问题或方案视为一个相互关联的整体来考量——各部分如何彼此影响——而不是孤立地优化各个局部、并想当然地假设整体会自然而然地运作良好。它是『放大缩小视角』在思维模式层面的对应：不从细节中抽身出来，就无法看清整体全貌。",
    ],
    refs: [["Donella Meadows Project — systems thinking resources", "https://donellameadows.org/systems-thinking-resources/"]],
  },
  "cross-disciplinary": {
    title: "Cross-disciplinary", title_zh: "跨学科",
    body: [
      "Drawing on multiple fields — engineering, business, psychology, art — either through a mixed team or 'T-shaped' individuals with depth in one area and working fluency across others. Tim Brown argues design thinking's real innovations usually happen at the intersections between disciplines, not deep within any single one.",
    ],
    body_zh: [
      "综合运用多个领域的知识——工程、商业、心理学、艺术——既可以通过多元背景组成的团队，也可以依靠『T 型人才』（在一个领域有深度、同时对其他领域有较强的通用能力）来实现。蒂姆·布朗认为，设计思维真正的创新往往发生在不同学科的交汇处，而不是深埋在某一个单一学科内部。",
    ],
    refs: [["Tim Brown (2009), Change by Design", "https://www.ideo.com/journal/change-by-design"]],
  },
};

/* ---------------- modal ---------------- */

function glossaryLang() {
  try { return typeof getLang === "function" ? getLang() : "en"; } catch { return "en"; }
}

function glossaryTitle(entry) {
  return glossaryLang() === "zh" ? (entry.title_zh || entry.title) : entry.title;
}

function glossaryBody(entry) {
  return glossaryLang() === "zh" ? (entry.body_zh || entry.body) : entry.body;
}

function glossaryAbout() {
  try {
    const cfg = JSON.parse(localStorage.getItem("dtc-llm-config-v1"));
    return (cfg && typeof cfg.about === "string" && cfg.about.trim()) || "";
  } catch {
    return "";
  }
}

function glossaryPrompt(entry) {
  const about = glossaryAbout();
  const title = glossaryTitle(entry);
  const suffix = typeof aiLangSuffixForCopy === "function" ? aiLangSuffixForCopy() : "";
  return (
    "I'm learning design thinking and the Double Diamond process " +
    "(Discover, Define, Ideate, Make, Evaluate, Develop, Reflect)." +
    (about ? ` About me: ${about}.` : "") +
    ` Explain "${title}" in this context: what it is, why it matters in the Double Diamond process, ` +
    "how I would apply it step by step, common pitfalls, and one concrete worked example" +
    (about ? " suited to my background" : "") + ". " +
    "End with 2–3 reputable sources I can read to go deeper. Where you are uncertain, say so explicitly." +
    suffix
  );
}

function glossaryPlainText(entry) {
  const refs = entry.refs.map(([label, url]) => `- ${label}: ${url}`).join("\n");
  const refsLabel = typeof t === "function" ? t("glossary.refsLabel") : "References";
  return `${glossaryTitle(entry)}\n\n${glossaryBody(entry).join("\n\n")}\n\n${refsLabel}:\n${refs}`;
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
  btn.textContent = typeof t === "function" ? t("glossary.copied") : "Copied ✓";
  setTimeout(() => (btn.textContent = original), 1500);
}

function openGlossary(termId) {
  const entry = GLOSSARY[termId];
  if (!entry) return;
  const title = glossaryTitle(entry);
  const body = glossaryBody(entry);
  const tr = typeof t === "function" ? t : (k) => k;

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
    <div class="settings-panel glossary-panel" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="settings-head">
        <h2>${title}</h2>
        <button type="button" class="btn btn-ghost" id="glossary-close" aria-label="${tr("settings.close")}">✕</button>
      </div>
      ${body.map((p) => `<p class="glossary-body">${p}</p>`).join("")}
      <p class="glossary-refs-label">${tr("glossary.refsLabel")}</p>
      <ul class="glossary-refs">
        ${entry.refs.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`).join("")}
      </ul>
      <div class="settings-actions">
        <button type="button" class="btn" id="glossary-copy-text">${tr("glossary.copyExplanation")}</button>
        <button type="button" class="btn" id="glossary-copy-prompt">${tr("glossary.copyPrompt")}</button>
      </div>
      <p class="llm-note">${glossaryAbout() ? tr("glossary.promptNoteWith") : tr("glossary.promptNoteWithout")}</p>
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
