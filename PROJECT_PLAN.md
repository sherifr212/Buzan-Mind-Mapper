**PROJECT EXECUTION PLAN**

**Buzan Mind Mapping Software — v1**

*Sprint Roadmap · Dependency Map · Agent Prompt Seeds · Checklist*

| Start Date | August 2025 (Week 1 \= first Monday of August) |
| :---- | :---- |
| **Duration** | 22 sprints × 1 week \= 22 weeks (end of December 2025\) |
| **Stack** | React \+ TypeScript · ASP.NET Core / C\# · PostgreSQL · Redis |
| **Canvas** | React Flow (free tier) |
| **Monorepo** | Turborepo |
| **Testing** | Vitest (unit) · Playwright (E2E) · Chromatic free tier (visual, PR-only) |
| **Sprint Tracking** | GitHub Projects (issues \= tickets · milestones \= sprints) |
| **Companion Docs** | Tech Spec v1.0 · Acceptance Test Suite v1.0 |
| **v1 Scope Exclusions** | Group Maps · sub-maps · community gallery · ambient sound · AI image gen · adaptive review spacing |

**📌 NOTE:**  *The AGENT PROMPT SEED in each sprint card is the opening line you give an AI coding agent to start that sprint. It is not a complete prompt — it is the context-setting first sentence that points the agent at the right spec section and AT group.*

# **PART 1 — CRITICAL PATH & DEPENDENCY MAP**

Every sprint has a hard dependency on the sprint(s) before it unless marked '(PARALLELISABLE)'. The chart below shows the critical path. Any sprint that slips delays everything below it in the same column.

PHASE A — FOUNDATION (no UI, pure logic)  S0 Scaffold  →  S1 Data Model  →  S2 Enforcement Engine (Emphasis)                                 →  S3 Enforcement Engine (Clarity \+ Association)PHASE B — CANVAS (frontend, no backend)  S3 complete  →  S4 Canvas Foundation  →  S5 Branch Rendering               →  S6 Core Editing       →  S7 Enforcement UI (Block/Warn)               →  S8 Enforcement UI (Coach)  →  S9 Health Panel               →  S10 Colour System     →  S11 Hierarchy Tools               →  S12 Mental Block \+ UndoPHASE C — FEATURES (layered on stable canvas)  S12 complete →  S13 Onboarding & TutorialPHASE D — BACKEND (parallelisable with Phase B/C)  S0 complete  →  S14 Backend API & DB  \[PARALLELISABLE from S4 onward\]  S13 \+ S14    →  S15 Frontend–Backend IntegrationPHASE E — ADVANCED FEATURES  S15 complete →  S16 Review & Reinforcement               →  S17 Export & Import               →  S18 Mega Mind Map (zoom \+ pivot)PHASE F — HARDENING & LAUNCH  S18 complete →  S19 Performance · Accessibility · Security               →  S20 Manual Acceptance Review               →  S21 Production Deployment

**ℹ INFO:**  *Sprint 14 (Backend) is the one sprint that can run in parallel. If you have two agent instances, start S14 at the same time as S4. They are entirely independent until S15.*

# **PART 2 — PRE-START CHECKLIST**

Complete every item on this checklist before any agent writes a single line of code. Each item is a decision or action, not a build task. Estimated total time: 3–4 hours.

| ✓ | Category | Action Required | Status |
| ----- | :---- | :---- | :---- |
| ✅ | **DECIDED**Platform | Web (responsive) — confirmed. No action needed. | **✅ LOCKED** |
| ✅ | **DECIDED**Monorepo | Turborepo — confirmed. Agent will scaffold in Sprint 0\. | **✅ LOCKED** |
| ✅ | **DECIDED**Canvas | React Flow free tier — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Backend | ASP.NET Core / C\# / PostgreSQL / Redis — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Auth scope | Solo users only for v1 — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Test runners | Vitest \+ Playwright — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Visual tests | Chromatic free tier, PR-only trigger — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Sprint tracking | GitHub Projects — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**Sprint length | 1 week — confirmed. | **✅ LOCKED** |
| ✅ | **DECIDED**v1 scope cut | 6 features deferred to v2 — confirmed. | **✅ LOCKED** |
| ☐ | **ACTION**GitHub repo | Create a new GitHub repository. Name suggestion: buzan-mind-map. Initialise with README only, no template. | **☐ TODO** |
| ☐ | **ACTION**GitHub Projects | Create a Project board in the repo. Create 22 milestones named Sprint 0 through Sprint 21 with weekly due dates starting first Monday of August. | **☐ TODO** |
| ☐ | **ACTION**Chromatic | Create a free Chromatic account at chromatic.com. Connect it to your GitHub repo. Copy the project token — you will need it in Sprint 0\. | **☐ TODO** |
| ☐ | **ACTION**Environment file | Create a .env.example file with these keys (values TBD in Sprint 14): DATABASE\_URL, REDIS\_URL, JWT\_SECRET, CHROMATIC\_PROJECT\_TOKEN, ASPNETCORE\_ENVIRONMENT | **☐ TODO** |
| ☐ | **ACTION**React Flow check | Spend 20 minutes reading the React Flow docs on custom nodes and custom edges. Confirm you understand how custom edge paths work — this is where Buzan's curved branches will live. | **☐ TODO** |
| ☐ | **ACTION**AT suite review | Read Section 4 (Canvas) and Section 3.7 (Be Clear) of the Acceptance Test Suite. These are the two areas most likely to need agent iteration. Know them before Sprint 0\. | **☐ TODO** |
| ☐ | **ACTION**Hosting decision | Decide where the ASP.NET Core API will be hosted: Azure App Service, Railway, Render, or Fly.io. Make a decision now even if you don't deploy until Sprint 21\. It affects Sprint 0 CI/CD config. | **☐ TODO** |
| ☐ | **ACTION**Domain / branding | Decide the product name and domain. This is not a blocker for development but is needed before Sprint 21\. Note it here and move on. | **☐ TODO** |
| ☐ | **ACTION**Node version | Confirm Node.js ≥ 18 is installed locally. Turborepo requires it. | **☐ TODO** |
| ☐ | **ACTION**.NET version | Confirm .NET 8 SDK is installed. This is the LTS version recommended for new ASP.NET Core projects. | **☐ TODO** |
| ☐ | **ACTION**Agent access | Confirm which AI coding agent(s) you will use (e.g. Claude Code, Cursor, Copilot Workspace). Have credentials ready before Sprint 0\. | **☐ TODO** |

# **PART 3 — SPRINT PLAN**

Each sprint card shows: goal · dependency · entry condition · deliverables · acceptance test gate · exit condition · agent prompt seed.

**ℹ INFO:**  *The AT GATE row lists the Acceptance Test IDs from the AT Suite document that MUST pass before the sprint is closed. No exceptions.*

## **PHASE A — FOUNDATION**

| SPRINT 0  Week 1  │  Project Scaffold & Infrastructure   \[SCAFFOLD\] |  |
| :---- | :---- |
| **GOAL** | Create the complete project skeleton: monorepo, all package boundaries, all test runners configured and green on zero tests, CI/CD pipeline live, GitHub Projects board populated. |
| **ENTRY** | Pre-start checklist 100% complete. GitHub repo exists. Chromatic token in hand. |
| **DELIVERS** | Turborepo monorepo initialised with packages: @bmm/data-model · @bmm/enforcement · @bmm/canvas · @bmm/ui · @bmm/api-client |
|  | ASP.NET Core 8 Web API project created: src/Bmm.Api/ (C\#, minimal API pattern) |
|  | React \+ TypeScript \+ Vite frontend app: apps/web/ |
|  | Vitest configured in @bmm/data-model and @bmm/enforcement — zero tests, all green |
|  | Playwright configured — one smoke test: 'app loads without crashing' — green |
|  | Storybook configured in @bmm/canvas. Chromatic connected, baseline published. |
|  | GitHub Actions CI: on PR → run vitest → run playwright → run chromatic |
|  | GitHub Projects: 22 milestones created (Sprint 0–21) with weekly due dates |
|  | ESLint \+ Prettier configured across all packages |
|  | .env.example with all required keys |
|  | README.md with setup instructions |
| **AT GATE** | Smoke test only: AT suite not yet applicable. Pipeline must be GREEN with zero failures. |
| **EXIT ✓** | **GitHub Actions CI pipeline passes on a PR with zero test failures. Every package builds without errors. Chromatic baseline exists.** |
| **🤖 AGENT PROMPT SEED:**  "Using the attached Tech Spec and AT Suite, scaffold a Turborepo monorepo for a React/TypeScript \+ ASP.NET Core 8 web app. Packages: @bmm/data-model, @bmm/enforcement, @bmm/canvas, @bmm/ui, @bmm/api-client. Configure Vitest, Playwright, Storybook, and GitHub Actions CI. Sprint 0 is complete when the pipeline is green." |  |
| **SPRINT 1**  Week 2  │  **Data Model — TypeScript Types & Validation   \[DATA\]** |  |
| **GOAL** | Implement the complete data model from Spec Section 3\. All entities, all validation functions, .bmm serialisation. This is the bedrock everything else is built on. |
| **DEPENDS ON** | Sprint 0 |
| **ENTRY** | Sprint 0 complete. CI pipeline green. |
| **DELIVERS** | TypeScript interfaces: MindMap · BranchNode · ImageNode · ImageAsset · Arrow · CodeSymbol · ReviewSchedule · all enums |
|  | Validation functions: validateMindMap() · validateBranch() · validateArrow() — each returns {valid, errors\[\]} |
|  | Review schedule generator: generateReviewSchedule(createdAt: Date): ReviewSchedule — 6 intervals per Buzan spec |
|  | Colour inheritance resolver: resolveColour(branch, mapTree): HexColor |
|  | Depth calculator: calculateDepth(branchId, mapTree): number — enforces max 14 |
|  | .bmm serialiser: serialise(map): string (JSON) and deserialise(json): MindMap |
|  | Unit tests for ALL of the above — every AT-DM scenario must pass |
| **AT GATE** | AT-DM-001 · AT-DM-002 · AT-DM-003 · AT-DM-004 · AT-DM-010 · AT-DM-011 · AT-DM-012 · AT-DM-013 · AT-DM-014 · AT-DM-015 · AT-DM-016 · AT-DM-017 · AT-DM-020 · AT-DM-021 · AT-DM-030 · AT-DM-031 |
| **EXIT ✓** | **All 16 AT-DM unit tests passing in CI. Zero TypeScript compiler errors in @bmm/data-model.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the data model for @bmm/data-model using TypeScript as described in Section 3 of the attached Tech Spec. Write Vitest unit tests for every entity and validation function. Tests are in the attached AT Suite, Section 2\. Sprint is done when all AT-DM tests pass." |  |
| **SPRINT 2**  Week 3  │  **Enforcement Engine — Emphasis Laws   \[ENGINE\]** |  |
| **GOAL** | Implement the pure-logic enforcement layer for all Emphasis laws (LE-001 to LE-042). No UI. This is a pure TypeScript module that takes a map state and returns events (BLOCK/WARN/COACH). |
| **DEPENDS ON** | Sprint 1 |
| **ENTRY** | Sprint 1 complete. Data model types stable. |
| **DELIVERS** | EnforcementEngine class in @bmm/enforcement with method: check(map: MindMap, event: EditEvent): EnforcementResult\[\] |
|  | EnforcementResult type: { level: 'BLOCK'|'WARN'|'COACH', lawId: string, message: string, specRef: string } |
|  | Rules implemented: LE-001 (no central image) · LE-002 (text central node) · LE-003 (\< 3 colours on image) · LE-010 (8+ branches no images) · LE-020 (duplicate BOI colours) · LE-021 (\< 3 total colours) · LE-022 (colour inheritance) · LE-030/031 (size ratios) · LE-040 (overlap detection logic) |
|  | Each rule is a separate pure function: checkCentralImage(map) · checkColourDiversity(map) · etc. |
|  | All rules have corresponding unit tests per AT Suite Section 3.1–3.4 |
| **AT GATE** | AT-LE-001(unit) · AT-LE-003 · AT-LE-003b · AT-LE-020 · AT-LE-021 · AT-LE-022b · AT-LE-011 |
| **EXIT ✓** | **All listed AT-LE unit tests passing. EnforcementEngine is importable from @bmm/enforcement with zero TypeScript errors.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the EnforcementEngine in @bmm/enforcement package. It is a pure TypeScript module — no UI, no React. Rules to implement are LE-001 through LE-042 from Spec Section 4.1–4.3. Each rule is a separate function. Unit tests are in AT Suite Section 3.1–3.4. Done when all those tests pass." |  |
| **SPRINT 3**  Week 4  │  **Enforcement Engine — Clarity, Association & Layout Laws   \[ENGINE\]** |  |
| **GOAL** | Complete the enforcement engine with all remaining law groups: Be Clear, Use Association, Hierarchy, Numerical Order, and Personal Style. Engine is now feature-complete for v1. |
| **DEPENDS ON** | Sprint 2 |
| **ENTRY** | Sprint 2 complete. EnforcementEngine exists and is tested. |
| **DELIVERS** | New rules added to EnforcementEngine: LE-060 (multi-word keyword) · LE-061 (cursive font) · LE-062 (portrait block) · LE-063 (line length \= keyword width) · LE-064 (disconnected branch) · LE-065 (central lines thicker) · LE-066 (keyword angle) · LE-067 (12+ branches no images) · LE-080 through LE-093 |
|  | C1+ delta calculator: computeC1Delta(mapA: MindMap, mapB: MindMap): C1Delta |
|  | Radiant Score calculator: computeRadiantScore(map: MindMap): number (0–100) — weighted by law importance |
|  | All new rules have unit tests |
| **AT GATE** | AT-LE-060a(unit) · AT-LE-062(unit) · AT-LE-063 · AT-LE-064 · AT-LE-071 · AT-LE-071b · AT-HP-003 |
| **EXIT ✓** | **Entire AT-LE unit layer passing. RadiantScore and C1+ delta functions tested and correct.** |
| **🤖 AGENT PROMPT SEED:**  "Extend the EnforcementEngine in @bmm/enforcement with the remaining laws from Spec Section 4.3–4.6: LE-060 through LE-093. Also implement computeRadiantScore() and computeC1Delta(). Unit tests in AT Suite Sections 3.5–3.10. Done when all AT-LE and AT-HP-003 unit tests pass." |  |

## **PHASE B — CANVAS & EDITING UI**

| SPRINT 4  Week 5  │  Canvas Foundation — React Flow Integration   \[CANVAS\] |  |
| :---- | :---- |
| **GOAL** | First pixels on screen. React Flow integrated with a custom Central Image node and custom curved BOI edges. No editing yet — read-only rendering from a fixture map. |
| **DEPENDS ON** | Sprint 3 |
| **ENTRY** | Sprint 3 complete. @bmm/enforcement is stable. |
| **DELIVERS** | React Flow installed in @bmm/canvas |
|  | Custom node: CentralImageNode — renders the Central Image at canvas centre, always landscape |
|  | Custom edge: BuzanBranchEdge — renders a curved Bézier path from Central Image boundary to keyword label, variable thickness by depth |
|  | BuzanCanvas React component: takes a MindMap prop, renders it read-only |
|  | Storybook stories: CentralImageNode · BuzanBranchEdge · BuzanCanvas with fixture-simple.bmm |
|  | Chromatic visual baseline set for all 3 stories |
|  | Auto-layout: branches distributed radially, no overlap (uses React Flow's built-in layout or Dagre) |
| **AT GATE** | AT-RE-002 · AT-RE-004 · AT-RE-020 · AT-RE-023 — all VISUAL, reviewed in Chromatic |
| **EXIT ✓** | **Chromatic shows: branches are curved Bézier paths, canvas is landscape, Central Image is centred, BOI lines connect to image boundary. All 4 visual tests approved.** |
| **🤖 AGENT PROMPT SEED:**  "Implement @bmm/canvas using React Flow. Create a CentralImageNode custom node and a BuzanBranchEdge custom edge with curved Bézier paths. Render from fixture-simple.bmm in a BuzanCanvas component. Add Storybook stories and set Chromatic visual baseline. Visual AT tests AT-RE-002, AT-RE-004, AT-RE-020, AT-RE-023 must pass Chromatic review." |  |
| **SPRINT 5**  Week 6  │  **Branch Rendering — Hierarchy, Typography & Colour   \[CANVAS\]** |  |
| **GOAL** | Implement all visual Buzan laws that affect how branches and text look: depth-based sizing, colour inheritance rendering, uppercase BOIs, keyword upright rendering. |
| **DEPENDS ON** | Sprint 4 |
| **ENTRY** | Sprint 4 complete. BuzanCanvas renders from fixture. |
| **DELIVERS** | Line thickness scale: depth 0 \= 5pt, depth 1 \= 2.5pt, depth 2+ \= 1pt (configurable constants) |
|  | Font size scale: depth 0 \= 18px, depth 1 \= 14px, depth 2+ \= 11px (configurable) |
|  | BOI keywords render in UPPER CASE via CSS text-transform |
|  | Keyword text flips when branch angle \> 180° (lower half of canvas) to maintain upright reading |
|  | Colour from BOI propagates visually to all descendant edges |
|  | New Storybook stories for: hierarchy depth visual · mixed-depth map · colour inheritance |
|  | Chromatic updated with new baselines |
| **AT GATE** | AT-LE-030 · AT-LE-031 · AT-LE-065 · AT-TY-001 · AT-TY-002 · AT-TY-003 · AT-TY-005 — all VISUAL |
| **EXIT ✓** | **Chromatic approvals for all 7 visual tests. No regressions on Sprint 4 baseline.** |
| **🤖 AGENT PROMPT SEED:**  "Extend @bmm/canvas rendering: depth-based line thickness and font size, BOI uppercase text, keyword angle flipping for readability, colour inheritance visible in rendered edges. Add Storybook stories and get Chromatic approval on visual AT tests AT-LE-030, AT-LE-031, AT-LE-065, AT-TY-001–005." |  |
| **SPRINT 6**  Week 7  │  **Core Editing — Add · Edit · Delete · Drag · Undo   \[EDITING\]** |  |
| **GOAL** | Make the canvas interactive. Users can add branches, edit keywords, delete nodes, drag to reposition. Undo/redo stack working. Blank line feature. |
| **DEPENDS ON** | Sprint 5 |
| **ENTRY** | Sprint 5 complete. Canvas renders correctly. |
| **DELIVERS** | MapStore (Zustand or Redux Toolkit) managing MindMap state in the React app |
|  | Add branch: Tab \= child of selected, Enter \= sibling of selected |
|  | Double-click or F2 to enter keyword edit mode on any branch |
|  | Delete/Backspace to remove selected branch \+ subtree (confirmation dialog if subtree \> 5 nodes) |
|  | Drag-to-reposition branches using React Flow's built-in drag |
|  | Undo/redo: unlimited, via Zustand immer middleware or custom command pattern |
|  | Blank line feature: keyboard shortcut or toolbar button adds a blankLine=true branch |
| **AT GATE** | AT-ED-001 · AT-ED-002 · AT-ED-003 · AT-ED-010 · AT-ED-011 · AT-ED-030 · AT-ED-031 |
| **EXIT ✓** | **All 7 E2E editing tests passing in Playwright. Undo/redo 50-operation test passes.** |
| **🤖 AGENT PROMPT SEED:**  "Implement interactive editing in @bmm/ui on top of the BuzanCanvas. Add branch (Tab/Enter), edit keyword (double-click), delete (Backspace), drag reposition, unlimited undo/redo, and the blank line feature. E2E tests are AT-ED-001 through AT-ED-031 in the AT Suite Section 5." |  |
| **SPRINT 7**  Week 8  │  **Enforcement UI — Block & Warn Layer   \[ENFORCEMENT\]** |  |
| **GOAL** | Wire the enforcement engine into the editing UI. Every BLOCK fires a modal. Every WARN fires a non-blocking notification. The canvas becomes a Buzan-compliant environment. |
| **DEPENDS ON** | Sprint 6 |
| **ENTRY** | Sprint 6 complete. MapStore exists. EnforcementEngine is imported from @bmm/enforcement. |
| **DELIVERS** | EnforcementMiddleware: every MapStore action passes through EnforcementEngine.check() before committing |
|  | BlockModal component: generic modal showing law name, rationale, and resolution options |
|  | WarnNotification component: toast-style, dismissable, includes 'Learn why' link |
|  | Wired BLOCK events: no central image (LE-001) · portrait attempt (LE-062) · duplicate BOI colour (LE-020) · multi-word keyword triggers Clarity Modal (LE-060) · disconnected branch (LE-064) |
|  | Clarity Modal: split-into-branches as the primary CTA, keep-as-one-word as secondary |
|  | Wired WARN events: \< 3 central image colours (LE-003) · 8+ branches no images (LE-010) · 12+ branches no images (LE-067) · \< 3 map colours (LE-021) |
| **AT GATE** | AT-LE-001 · AT-LE-002 · AT-LE-020 · AT-LE-060a · AT-LE-060b · AT-LE-062 · AT-LE-064 · AT-LE-010 · AT-LE-067 · AT-LE-021 |
| **EXIT ✓** | **All 10 E2E enforcement BLOCK/WARN tests passing in Playwright.** |
| **🤖 AGENT PROMPT SEED:**  "Wire @bmm/enforcement EnforcementEngine into the MapStore as middleware. Every BLOCK result shows a BlockModal with law rationale. Every WARN shows a WarnNotification toast. Implement the Clarity Modal for multi-word keywords. E2E tests: AT-LE-001, AT-LE-002, AT-LE-020, AT-LE-060a/b, AT-LE-062, AT-LE-064, AT-LE-010, AT-LE-067, AT-LE-021." |  |
| **SPRINT 8**  Week 9  │  **Enforcement UI — Coach Layer & BOI Wizard   \[ENFORCEMENT\]** |  |
| **GOAL** | Implement proactive coaching: the collapsible coaching sidebar, all COACH-level messages, the dimension timer, the BOI Wizard on new map creation. |
| **DEPENDS ON** | Sprint 7 |
| **ENTRY** | Sprint 7 complete. Block/Warn layer working. |
| **DELIVERS** | CoachingSidebar component: collapsible, shows current contextual tips keyed to recent actions |
|  | Coaching tips graduated by experience level: full explanation for \< 30 maps, terse reminder for 30+ maps |
|  | Dimension coaching: fires after 30s with hasDimension \= false (LE-004) |
|  | Arrow coaching: fires at 10 branches with zero arrows (LE-052) |
|  | Colour inheritance override blocked outside Personal Style Mode with tooltip (LE-022) |
|  | BOI Wizard: modal shown on new map creation, presents 7 BOI questions, populates canvas with answers |
|  | Flat map hierarchy warning: fires after 3 minutes with all branches at depth 0 (LE-082) |
| **AT GATE** | AT-LE-004 · AT-LE-052 · AT-LE-022 · AT-LE-081 · AT-LE-082 |
| **EXIT ✓** | **All 5 coach-layer E2E tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the coaching layer for @bmm/ui: CoachingSidebar, dimension timer (LE-004), arrow coaching (LE-052), colour inheritance tooltip (LE-022), BOI Wizard (LE-081), and flat map warning (LE-082). E2E tests AT-LE-004, AT-LE-052, AT-LE-022, AT-LE-081, AT-LE-082." |  |

| SPRINT 9  Week 10  │  Buzan Health Panel · Radiant Score · C1+ Tracker   \[EDITING\] |  |
| :---- | :---- |
| **GOAL** | Implement the Health Panel UI, wire it to the computed metrics, and build the C1+ comparison tracker. |
| **DEPENDS ON** | Sprint 8 |
| **ENTRY** | Sprint 8 complete. Radiant Score and C1+ delta functions exist in @bmm/enforcement. |
| **DELIVERS** | BuzanHealthPanel component: collapsible sidebar showing all 8 metrics from AT-HP-001 |
|  | Radiant Score displayed as a radial meter (SVG or CSS) |
|  | Each metric is clickable — opens a law rationale popover |
|  | Quick-fix buttons per failing metric |
|  | C1+ Tracker: on map save, compares against previous map and shows delta UI |
|  | C1+ improvement triggers positive animation; regression triggers gentle prompt |
| **AT GATE** | AT-HP-001 · AT-HP-002 · AT-HP-003 · AT-LE-071 · AT-LE-071b |
| **EXIT ✓** | **All 5 tests passing. AT-MA-002 (manual: Radiant Score feels motivating) scheduled for Sprint 20\.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the BuzanHealthPanel component in @bmm/ui using the computeRadiantScore() and computeC1Delta() functions from @bmm/enforcement. Wire all 8 metrics, add clickable law rationale popovers, quick-fix buttons, and the C1+ Tracker. Tests: AT-HP-001, AT-HP-002, AT-HP-003, AT-LE-071, AT-LE-071b." |  |
| **SPRINT 10**  Week 11  │  **Colour System · Accessibility · Personal Style Mode   \[EDITING\]** |  |
| **GOAL** | Full colour system: Buzan palette presets, colour picker, colour health warnings, colour-blindness mode, and Personal Style Mode unlock at 3 maps. |
| **DEPENDS ON** | Sprint 9 |
| **ENTRY** | Sprint 9 complete. |
| **DELIVERS** | ColourPicker component with 5 Buzan preset palettes and HSL custom picker |
|  | Colour health warning fires when 4+ unrelated branches share a colour |
|  | Colour-blindness mode: toggle in settings, replaces red/green and other problematic pairs |
|  | Personal Style Mode: locked until 3 maps completed, unlocks colour inheritance overrides |
|  | Personal Style Mode lock message with progress indicator |
| **AT GATE** | AT-CS-003 · AT-CS-008 · AT-CS-009 · AT-LE-070 · AT-LE-022 |
| **EXIT ✓** | **All 5 colour system tests passing. AT-MA-007 (manual: palettes are vibrant) scheduled for Sprint 20\.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the colour system for @bmm/ui: ColourPicker with Buzan presets, colour health warning (CS-008), colour-blindness mode (CS-009), and Personal Style Mode gated at 3 maps (LE-070). Tests: AT-CS-003, AT-CS-008, AT-CS-009, AT-LE-070, AT-LE-022." |  |
| **SPRINT 11**  Week 12  │  **Hierarchy Tools — Outline View · Boundaries · Sequence Mode   \[EDITING\]** |  |
| **GOAL** | Implement the hierarchy and ordering tools: the tree Outline View panel, branch boundaries, and Sequence Mode with numbered ordering. |
| **DEPENDS ON** | Sprint 10 |
| **ENTRY** | Sprint 10 complete. |
| **DELIVERS** | HierarchyOutlineView: collapsible panel showing tree structure, bidirectionally synced with canvas |
|  | Branch boundary: right-click a BOI → 'Mark cluster complete' → curved boundary auto-drawn |
|  | Boundary stored in branch.boundaryShape as SVG path |
|  | Sequence Mode: toggle that shows number badges on branches, drag-to-rank ordering |
|  | Numerical order stored in branch.numericalOrder |
|  | Promote / Demote branch actions |
| **AT GATE** | AT-LE-081 · AT-LE-083 · AT-LE-090 · AT-LE-091 |
| **EXIT ✓** | **All 4 tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement hierarchy tools in @bmm/ui: HierarchyOutlineView synced bidirectionally with canvas, branch boundary auto-draw on BOI completion, and Sequence Mode with drag-rank number badges. Tests: AT-LE-081, AT-LE-083, AT-LE-090, AT-LE-091." |  |
| **SPRINT 12**  Week 13  │  **Mental Block Tools · Image Drawing · Arrow Tool   \[EDITING\]** |  |
| **GOAL** | Complete the editing toolkit: the 'I'm Stuck' panel, the Mini Mind Map burst, the arrow drawing tool with all directionality options, and the freehand image drawing tool. |
| **DEPENDS ON** | Sprint 11 |
| **ENTRY** | Sprint 11 complete. |
| **DELIVERS** | 'I'm Stuck' button always visible in toolbar; opens MentalBlockPanel with 4 actions |
|  | Mini Mind Map burst: temporary 10-node association cloud, drag-to-import into main map |
|  | Random Stimulus generator: shows a random word/image from a curated library |
|  | Draw Arrow tool: first-class toolbar item, creates uni/bi/multi arrows between any two nodes |
|  | Arrow colour and style editor |
|  | Code Library panel: create named codes, apply to branches, global code reuse |
|  | Freehand image drawing tool for branch images (canvas-based, saves as data URI) |
| **AT GATE** | AT-ED-020 · AT-ED-021 · AT-ED-022 · AT-LE-050 · AT-LE-052 · AT-LE-053 · AT-LE-054 |
| **EXIT ✓** | **All 7 tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the mental block panel, mini mind map burst, arrow tool, code library, and freehand image drawing in @bmm/ui. Tests: AT-ED-020, AT-ED-021, AT-ED-022, AT-LE-050, AT-LE-052, AT-LE-053, AT-LE-054." |  |

## **PHASE C — FEATURES**

| SPRINT 13  Week 14  │  Onboarding · Tutorial · 100-Map Tracker   \[FEATURES\] |  |
| :---- | :---- |
| **GOAL** | Implement the full onboarding system: the guided tutorial map (Accept stage), step-locking, the 100-map progress tracker, and the post-session reflection prompt. |
| **DEPENDS ON** | Sprint 12 |
| **ENTRY** | Sprint 12 complete. Full editing experience is functional. |
| **DELIVERS** | TutorialFlow component: guided step-by-step map experience, 8 steps covering all major laws |
|  | Each tutorial step shows the Buzan law name, rationale text, and before/after visual |
|  | Step cannot advance until the user has correctly applied the current law (validation via EnforcementEngine) |
|  | Free map creation locked until tutorial is complete (first-time users only) |
|  | UserProgressStore: tracks maps created, tutorial complete, experience level |
|  | 100-map progress tracker on dashboard/home screen |
|  | Post-session reflection prompt on map save (dismissable) |
|  | Law Reference Cards panel: always-accessible quick-scan of all laws |
| **AT GATE** | AT-OB-001 · AT-OB-002 · AT-OB-004 · AT-OB-010 · AT-OB-011 |
| **EXIT ✓** | **All 5 onboarding E2E tests passing. AT-OB-003 (manual: tutorial ≤ 15 min) and AT-MA-005 (manual: beginner understands) scheduled for Sprint 20\.** |
| **🤖 AGENT PROMPT SEED:**  "Implement the onboarding and tutorial system in @bmm/ui. Tutorial is 8 steps, each showing a Buzan law and blocking progression until the law is applied. Wire to UserProgressStore for 100-map tracking. Post-session reflection on save. Tests: AT-OB-001, AT-OB-002, AT-OB-004, AT-OB-010, AT-OB-011." |  |

## **PHASE D — BACKEND  (parallelisable from Sprint 4 onward)**

**📌 NOTE:**  *Sprint 14 is independent of all Phase B/C sprints. If you have two agent instances, run Sprint 14 in parallel with Sprint 4\. They share nothing until Sprint 15\.*

| SPRINT 14  Weeks 5–13 (parallel)  │  Backend — ASP.NET Core API · PostgreSQL · Redis · Auth   \[BACKEND\] |  |
| :---- | :---- |
| **GOAL** | Build the complete backend: API endpoints, database schema, authentication, and Redis caching. The frontend does not connect to this until Sprint 15\. |
| **DEPENDS ON** | Sprint 0 |
| **ENTRY** | Sprint 0 complete. ASP.NET Core project scaffold exists. PostgreSQL and Redis connection strings defined in .env. |
| **DELIVERS** | PostgreSQL schema (via EF Core migrations): tables for users · maps · branches · arrows · codes · review\_schedules |
|  | MindMap entity maps 1:1 to the .bmm format data model |
|  | ASP.NET Core minimal API endpoints: POST /maps · GET /maps · GET /maps/{id} · PUT /maps/{id} · DELETE /maps/{id} |
|  | Authentication: ASP.NET Core Identity \+ JWT bearer tokens. Register · Login · Refresh token endpoints. |
|  | User is scoped to their own maps: all map endpoints enforce ownership |
|  | Redis: used for JWT refresh token storage and rate limiting |
|  | Integration tests for all API endpoints (xUnit \+ WebApplicationFactory) |
|  | OpenAPI/Swagger docs generated automatically |
| **AT GATE** | AT-NF-020 (HTTPS enforced) · AT-NF-022 (map data isolation) — server-side validation |
| **EXIT ✓** | **All API endpoints return correct status codes. JWT auth working. PostgreSQL schema migrations run cleanly. AT-NF-020 and AT-NF-022 passing.** |
| **🤖 AGENT PROMPT SEED:**  "Build the ASP.NET Core 8 minimal API backend for the Buzan Mind Mapping app. Stack: C\#, PostgreSQL via EF Core, Redis, ASP.NET Core Identity \+ JWT. Schema mirrors the .bmm data model from Tech Spec Section 3\. Endpoints: CRUD for maps. Auth: register/login/refresh. Integration tests with xUnit. Security tests AT-NF-020 and AT-NF-022 must pass." |  |

## **PHASE E — ADVANCED FEATURES**

| SPRINT 15  Week 15  │  Frontend–Backend Integration · Persistence · Auth UI   \[FEATURES\] |  |
| :---- | :---- |
| **GOAL** | Connect the React frontend to the ASP.NET Core API. Maps save and load from PostgreSQL. Login/signup UI. Offline-first with sync on reconnect. |
| **DEPENDS ON** | Sprint 13, Sprint 14 |
| **ENTRY** | Sprint 13 AND Sprint 14 both complete. |
| **DELIVERS** | @bmm/api-client: typed TypeScript API client (fetch-based, generated from OpenAPI spec or hand-written) |
|  | MapStore updated: on save → POST/PUT to API, on load → GET from API |
|  | Offline support: maps stored in IndexedDB via Dexie.js. On reconnect, sync dirty maps to API. |
|  | Login · Signup · Logout UI (minimal, functional) |
|  | Dashboard/home screen: lists user's saved maps fetched from API |
|  | Loading states and error handling throughout |
| **AT GATE** | AT-NF-004 (offline \+ sync) · AT-NF-020 (HTTPS) |
| **EXIT ✓** | **Maps persist across browser sessions. Offline edits sync correctly. Auth flow works end-to-end.** |
| **🤖 AGENT PROMPT SEED:**  "Connect the React frontend to the ASP.NET Core API using the @bmm/api-client package. Implement offline-first storage with Dexie.js (IndexedDB) and sync on reconnect. Add login/signup UI. Dashboard lists user's maps. Tests: AT-NF-004, AT-NF-020." |  |
| **SPRINT 16**  Week 16  │  **Review & Reinforcement System   \[FEATURES\]** |  |
| **GOAL** | Implement Buzan's complete spaced-repetition review system: auto-scheduled reminders, in-app notifications, the Quick Mind Map Check, and the comparison view. |
| **DEPENDS ON** | Sprint 15 |
| **ENTRY** | Sprint 15 complete. Maps persist to backend. UserProgressStore exists. |
| **DELIVERS** | ReviewScheduleService (C\#): creates 6 review entries in PostgreSQL on map save |
|  | Background job (Hangfire or .NET hosted service): checks for due reviews, emits in-app notifications |
|  | In-app notification bell: shows due review notifications with Buzan rationale text |
|  | Quick Mind Map Check flow: opens blank canvas, hides original map, prompts recall |
|  | Comparison view: after recall map is saved, shows original vs recall with colour-coded diff (missed/new/recalled) |
|  | Long-Term Memory badge: applied after 6th review completion, map moved to Archive |
|  | Review Dashboard: all maps by review status |
| **AT GATE** | AT-RV-001 · AT-RV-002 · AT-RV-003 · AT-RV-004 · AT-RV-005 |
| **EXIT ✓** | **All 5 review system tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement Buzan's spaced-repetition review system. Backend: ReviewScheduleService generating 6 review entries, background job checking due dates. Frontend: notification bell, Quick Mind Map Check blank canvas flow, comparison view (missed/new/recalled colour diff), Long-Term Memory badge. Tests: AT-RV-001 through AT-RV-005." |  |
| **SPRINT 17**  Week 17  │  **Export & Import System   \[FEATURES\]** |  |
| **GOAL** | Implement all v1 export formats and import with compliance checking. |
| **DEPENDS ON** | Sprint 16 |
| **ENTRY** | Sprint 16 complete. |
| **DELIVERS** | SVG export: full canvas to vector SVG, all text as \<text\> elements |
|  | PDF export: via SVG-to-PDF conversion (pdf-lib or server-side Puppeteer), landscape enforced |
|  | Linear Outline export: numbered branch order → DOCX (using docx npm package) |
|  | .bmm export: serialise map to .bmm JSON file download |
|  | .bmm import: deserialise and load, validates with data model |
|  | Import compliance warnings panel: lists Buzan law violations with Fix buttons |
|  | OPML export for outline interoperability |
| **AT GATE** | AT-EX-001a · AT-EX-001b · AT-EX-002 · AT-EX-003 · AT-EX-008 |
| **EXIT ✓** | **All 5 export/import tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement export and import for @bmm/ui. Exports: SVG, PDF (landscape), DOCX linear outline, .bmm native format, OPML. Import: .bmm with validation. Import compliance warnings panel using EnforcementEngine. Tests: AT-EX-001a/b, AT-EX-002, AT-EX-003, AT-EX-008." |  |
| **SPRINT 18**  Week 18  │  **Mega Mind Map — Zoom · Miniature Viewport · Branch Pivot   \[FEATURES\]** |  |
| **GOAL** | Implement Mega Mind Map features for v1: smooth deep zoom with miniature viewport and the Branch Pivot feature. (Sub-maps are v2.) |
| **DEPENDS ON** | Sprint 17 |
| **ENTRY** | Sprint 17 complete. |
| **DELIVERS** | Smooth zoom 10%–400% using React Flow's built-in zoom controls |
|  | Miniature viewport thumbnail: custom MiniMap component, always visible when zoomed \> 150%, shows current viewport highlighted |
|  | Thumbnail updates in real time as user pans |
|  | Branch Pivot: right-click any branch → 'Make this the centre' → canvas re-renders with selected branch as new Central Image and its children as BOIs |
|  | Breadcrumb navigation: shows pivot history, click to go back |
| **AT GATE** | AT-RE-007 · AT-RE-041 |
| **EXIT ✓** | **Both Mega Mind Map tests passing.** |
| **🤖 AGENT PROMPT SEED:**  "Implement Mega Mind Map features in @bmm/canvas: zoom 10–400% with miniature viewport thumbnail (AT-RE-007) and Branch Pivot promoting any branch to a new canvas centre with breadcrumb navigation (AT-RE-041)." |  |

## **PHASE F — HARDENING & LAUNCH**

| SPRINT 19  Week 19  │  Performance · Accessibility · Security Hardening   \[HARDENING\] |  |
| :---- | :---- |
| **GOAL** | Systematic testing and fixing of all non-functional requirements: performance benchmarks, WCAG 2.1 AA audit, keyboard navigation, security. |
| **DEPENDS ON** | Sprint 18 |
| **ENTRY** | Sprint 18 complete. Feature-complete v1. |
| **DELIVERS** | Performance: profile and fix 500-node map load time to \< 500ms (code splitting, lazy loading, React.memo) |
|  | Performance: branch addition \< 50ms (profile MapStore dispatch overhead) |
|  | Performance: zoom animation 60fps (requestAnimationFrame profiling) |
|  | Accessibility: run axe-core audit on all non-canvas UI, fix all critical/serious violations |
|  | Accessibility: ARIA roles on HierarchyOutlineView (tree/treeitem) |
|  | Security: HTTPS enforced in production config, CSP headers, input sanitisation audit |
|  | Load testing: API can handle 100 concurrent users (k6 or NBomber) |
| **AT GATE** | AT-NF-001 · AT-NF-003 · AT-NF-010 · AT-NF-012 · AT-NF-020 · AT-NF-022 |
| **EXIT ✓** | **All 6 NFR tests passing. AT-NF-011 (keyboard-only manual test) scheduled for Sprint 20\.** |
| **🤖 AGENT PROMPT SEED:**  "Performance, accessibility, and security hardening sprint. Profile and fix: 500-node render \< 500ms, branch addition \< 50ms, zoom at 60fps. Run axe-core on all non-canvas UI, fix violations. Add ARIA to HierarchyOutlineView. Security: HTTPS, CSP, input sanitisation. Tests: AT-NF-001, AT-NF-003, AT-NF-010, AT-NF-012, AT-NF-020, AT-NF-022." |  |
| **SPRINT 20**  Week 20  │  **Manual Acceptance Review Sprint   \[HARDENING\]** |  |
| **GOAL** | All 10 MANUAL acceptance tests reviewed and signed off by you as product owner. Bug fixes from review. This sprint is human-driven, not agent-driven. |
| **DEPENDS ON** | Sprint 19 |
| **ENTRY** | Sprint 19 complete. All automated tests passing. |
| **DELIVERS** | AT-MA-001: Review all coaching message tones — confirm encouraging, not punitive |
|  | AT-MA-002: Evaluate Radiant Score motivational quality across 5 maps |
|  | AT-MA-003: Evaluate branch animation feel (organic vs mechanical) |
|  | AT-MA-004: Test Clarity Modal wording with a non-expert colleague |
|  | AT-MA-005: Observe a novice user completing the tutorial (record 3 key concepts grasped) |
|  | AT-MA-006: Use BOI Wizard for 3 different topics |
|  | AT-MA-007: Review all colour palette presets for vibrancy |
|  | AT-MA-008: Attempt to reproduce all 4 Buzan Danger Areas |
|  | AT-OB-003: Time 3 participants completing the tutorial (must be ≤ 15 min) |
|  | AT-NF-011: Complete all core editing tasks using keyboard only |
|  | Complete Appendix A sign-off log from AT Suite |
|  | File bug tickets in GitHub Issues for all findings |
|  | Agent fixes all filed bugs |
| **AT GATE** | AT-MA-001 through AT-MA-008 · AT-OB-003 · AT-NF-011 — all manually signed off |
| **EXIT ✓** | **Appendix A of the AT Suite is fully completed and signed. Zero open P0/P1 bugs.** |
| **🤖 AGENT PROMPT SEED:**  "This sprint is manual review only. No new features. You as product owner work through all MANUAL tests in AT Suite Section 14 and Appendix A. File bugs in GitHub Issues. Then: 'Fix all bugs filed in Sprint 20 manual review. No new features. Sprint done when zero open P0/P1 issues remain.'" |  |
| **SPRINT 21**  Week 21–22  │  **Production Deployment · Monitoring · Launch   \[HARDENING\]** |  |
| **GOAL** | Deploy to production. Wire up monitoring. Confirm the live app passes a final smoke test. Ship v1. |
| **DEPENDS ON** | Sprint 20 |
| **ENTRY** | Sprint 20 complete. All AT Suite tests passing (automated \+ manual). |
| **DELIVERS** | Frontend deployed: Vercel or Netlify (React static build, auto-deploys from main branch) |
|  | Backend deployed: chosen hosting platform (Azure App Service / Railway / Render / Fly.io) |
|  | PostgreSQL production instance: managed service (Supabase / Railway / Azure Database for PostgreSQL) |
|  | Redis production instance: Upstash (free tier) or managed Redis |
|  | Environment variables set in all production environments |
|  | Error monitoring: Sentry wired to both frontend and backend |
|  | Uptime monitoring: Better Uptime or UptimeRobot (free tier) |
|  | Final smoke test: create a map, save it, reload it, export SVG — all working in production |
|  | SSL certificate confirmed (HTTPS on all endpoints) |
|  | GitHub Actions: production deploy pipeline on merge to main |
| **AT GATE** | Full AT Suite final run against production URL. All automated tests must pass against production. |
| **EXIT ✓** | **App is live on a public URL. Full AT Suite green against production. Sentry shows zero errors. v1 shipped.** |
| **🤖 AGENT PROMPT SEED:**  "Deploy the Buzan Mind Mapping app to production. Frontend to Vercel, backend to \[chosen platform\], PostgreSQL and Redis to managed services. Wire Sentry for error monitoring. Configure GitHub Actions production deploy pipeline. Final step: run the full Playwright E2E suite against the production URL and confirm all tests pass." |  |

# **PART 4 — SUMMARY TIMELINE**

| Phase A — Foundation | Sprints 0–3   |  Weeks 1–4   |  August |
| :---- | :---- |
| **Phase B — Canvas & Editing** | Sprints 4–12  |  Weeks 5–13  |  August–October |
| **Phase C — Features** | Sprint 13      |  Week 14     |  October |
| **Phase D — Backend (parallel)** | Sprint 14      |  Weeks 5–13  |  August–October (parallel) |
| **Phase E — Advanced Features** | Sprints 15–18  |  Weeks 15–18 |  October–November |
| **Phase F — Hardening & Launch** | Sprints 19–21  |  Weeks 19–22 |  November–December |
| **v1 Launch Target** | End of Week 22 \= Last week of December 2025 |
| **Total sprints** | 22 |
| **Total automated AT tests** | 165 (all must pass before Sprint 20\) |
| **Manual AT tests** | 10 (signed off in Sprint 20\) |

**✓ TIP:**  *The single highest-risk item in this plan is Sprint 4 (React Flow canvas). Everything in Phase B depends on it. If React Flow free tier proves insufficient for Buzan's curved organic branches in the proof-of-concept spike (Pre-start checklist item \#5), you will know before any other sprint code is written, and the canvas library decision can be revisited with zero rework.*

**⚠ CAUTION:**  *Sprint 14 (Backend) is the one sprint that can run in parallel and should. If you start it at the same time as Sprint 4, you recover 8–9 weeks of potential elapsed time.*

*End of Document — Buzan Mind Mapping Software Project Execution Plan v1.0*

*'The only difficulty is deciding when to stop.' — Tony Buzan*