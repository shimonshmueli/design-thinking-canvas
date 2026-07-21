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
