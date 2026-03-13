**ACCEPTANCE TEST SUITE**

**Buzan Mind Mapping Software**

*Companion to: Technical Specifications Document v1.0*

| Document Version | 1.0 — Initial Release |
| :---- | :---- |
| **Test Framework** | Behaviour-Driven Development (BDD) — Gherkin / Given-When-Then |
| **Companion Document** | Buzan Mind Mapping Software Technical Specifications v1.0 |
| **Traceability** | Every test case references its parent Spec ID (e.g. LE-001, RE-020) |
| **Test Layers** | UNIT · VISUAL · E2E · MANUAL (defined in Section 2\) |
| **Recommended Runners** | Vitest (unit) · Playwright \+ Percy (visual) · Playwright (E2E) · Human reviewer (manual) |
| **Intended Audience** | AI coding agents, QA engineers, developers, product owner |
| **Total Test Cases** | 165 scenarios across 4 layers |

This document is the executable counterpart to the Technical Specifications. It defines precisely what 'done' means for every MUST and SHOULD requirement. Each scenario can be given directly to an AI coding agent as the acceptance criterion for a feature — the agent's implementation is complete when all scenarios in the relevant group pass.

The document is organised to match the spec exactly. Section numbers, heading names, and requirement IDs are identical so that a developer or agent can flip between the two documents without friction.

# **1\.  HOW TO USE THIS DOCUMENT**

## **1.1  For AI Coding Agents**

When an agent is tasked with implementing a feature, it must:

* Locate the relevant section in this document using the spec requirement ID (e.g. LE-060)

* Run ALL scenarios in that group before marking the feature complete

* A feature is DONE only when: all UNIT and E2E scenarios pass, all VISUAL scenarios pass visual regression diff, and all MANUAL scenarios have a recorded reviewer sign-off

* If a scenario cannot be made to pass, the agent must file a deviation report — it must not silently skip the test

**📌 NOTE:**  *An agent must never modify a test to make it pass. If a scenario is genuinely wrong or ambiguous, escalate to a human reviewer. The test suite is authoritative.*

## **1.2  For Human Reviewers**

MANUAL tests are marked with a tan/amber colour band. These require a human to perform the action described and record a pass/fail with a brief note. A pass/fail log template is provided in Appendix A.

## **1.3  Layer Legend**

| Badge | Layer | What it tests / Tooling |
| :---- | :---- | :---- |
| **UNIT** | Unit / Logic | Pure JavaScript/TypeScript functions: data model validation, keyword parsing, colour-inheritance logic, review schedule calculation. Runner: Vitest. No browser required. Fast (\< 1s per suite). |
| **VISUAL** | Visual Regression | Canvas rendering, layout, typography, branch curves, spacing. Runner: Playwright \+ Percy (or Chromatic). A screenshot baseline is captured on first run; subsequent runs diff against it. Fail threshold: \> 0.1% pixel difference. |
| **E2E** | End-to-End | Full browser interactions: button clicks, modal triggers, coaching messages, drag-and-drop, keyboard shortcuts, multi-user collaboration. Runner: Playwright. Requires a running dev/test server. |
| **MANUAL** | Manual / Human | Qualitative requirements: tone of coaching messages, aesthetic acceptability of colour palettes, animation feel, accessibility perception. Requires a human reviewer. Must be performed before any release. |

# **2\.  DATA MODEL ACCEPTANCE TESTS**

These tests validate the core data structures. They are all UNIT layer and must run in \< 100ms total.

## **2.1  MindMap Entity Validation**

| AT-DM-001  MindMap requires a Central Image    \[UNIT\]    *← DM-003* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a MindMap object is constructed without a centralImage field |  |  |  |
| **When**  the MindMap is validated by the data layer |  |  |  |
| **Then**  validation returns an error: 'Central image is required' |  |  |  |
| **And**  the map is not persisted to storage |  |  |  |
| **AT-DM-002  MindMap orientation is always LANDSCAPE    \[UNIT\]**    *← DM-005* |  |  |  |
| **Given**  a MindMap object is constructed with orientation set to 'PORTRAIT' |  |  |  |
| **When**  the MindMap is validated |  |  |  |
| **Then**  validation overrides the value to 'LANDSCAPE' |  |  |  |
| **And**  a warning is logged: 'Orientation forced to LANDSCAPE per Buzan law' |  |  |  |
| **AT-DM-003  MindMap minimum colour palette    \[UNIT\]**    *← DM-007* |  |  |  |
| **Given**  a MindMap is constructed with a colorPalette of 2 colours |  |  |  |
| **When**  the MindMap is validated |  |  |  |
| **Then**  validation returns an error: 'Colour palette must contain at least 3 colours' |  |  |  |
| **AT-DM-004  MindMap review schedule auto-generated    \[UNIT\]**    *← DM-010* |  |  |  |
| **Given**  a new MindMap is saved for the first time at timestamp T |  |  |  |
| **When**  the review schedule is generated |  |  |  |
| **Then**  the schedule contains 6 entries |  |  |  |
| **And**  entry 1 is T \+ 20 minutes (midpoint of 10–30 min window) |  |  |  |
| **And**  entry 2 is T \+ 1 day |  |  |  |
| **And**  entry 3 is T \+ 7 days |  |  |  |
| **And**  entry 4 is T \+ 30 days |  |  |  |
| **And**  entry 5 is T \+ 90 days |  |  |  |
| **And**  entry 6 is T \+ 180 days |  |  |  |

## **2.2  BranchNode Validation**

| AT-DM-010  Branch keyword must be a single word    \[UNIT\]    *← DM-022* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a BranchNode is constructed with keyword \= 'good morning' |  |  |  |
| **When**  the BranchNode is validated |  |  |  |
| **Then**  validation returns an error: 'Keyword must be a single word — no spaces permitted' |  |  |  |
| **And**  the branch is not added to the map |  |  |  |
| **AT-DM-011  Branch line length equals keyword length    \[UNIT\]**    *← DM-027* |  |  |  |
| **Given**  a BranchNode with keyword \= 'Happiness' rendered at font size 14pt |  |  |  |
| **And**  the rendered pixel width of 'Happiness' at 14pt is W pixels |  |  |  |
| **When**  the branch length is calculated |  |  |  |
| **Then**  branch.length equals W (within ±1px tolerance) |  |  |  |
| **AT-DM-012  BOI depth is exactly 0    \[UNIT\]**    *← DM-029* |  |  |  |
| **Given**  a BranchNode with parentId \= null |  |  |  |
| **When**  depth is assigned |  |  |  |
| **Then**  depth equals 0 |  |  |  |
| **AT-DM-013  Sub-branch depth increments correctly    \[UNIT\]**    *← DM-029* |  |  |  |
| **Given**  a BOI branch B1 with depth 0 |  |  |  |
| **And**  a child branch B2 with parentId \= B1.id |  |  |  |
| **And**  a child branch B3 with parentId \= B2.id |  |  |  |
| **When**  depths are calculated for the tree |  |  |  |
| **Then**  B2.depth equals 1 |  |  |  |
| **And**  B3.depth equals 2 |  |  |  |
| **AT-DM-014  Maximum depth of 14 enforced    \[UNIT\]**    *← DM-029* |  |  |  |
| **Given**  a branch chain of 14 levels deep |  |  |  |
| **When**  a 15th child branch is attempted |  |  |  |
| **Then**  the system returns an error: 'Maximum branch depth of 14 reached' |  |  |  |
| **And**  no new branch is created |  |  |  |
| **AT-DM-015  BOI inherits unique colour from palette    \[UNIT\]**    *← DM-024* |  |  |  |
| **Given**  a MindMap with colour palette \[Red, Blue, Green, Yellow\] |  |  |  |
| **And**  BOI B1 is created (assigned Red) |  |  |  |
| **And**  BOI B2 is created (assigned Blue) |  |  |  |
| **When**  BOI B3 is created |  |  |  |
| **Then**  B3 is assigned a colour not already used by B1 or B2 |  |  |  |
| **AT-DM-016  Sub-branch inherits BOI colour    \[UNIT\]**    *← DM-024* |  |  |  |
| **Given**  a BOI B1 with color \= '\#E53935' |  |  |  |
| **And**  a child branch C1 with parentId \= B1.id |  |  |  |
| **And**  a grandchild branch C2 with parentId \= C1.id |  |  |  |
| **When**  colours are resolved for the tree |  |  |  |
| **Then**  C1.color equals '\#E53935' |  |  |  |
| **And**  C2.color equals '\#E53935' |  |  |  |
| **AT-DM-017  isCurved defaults to true    \[UNIT\]**    *← DM-026* |  |  |  |
| **Given**  a BranchNode is created without specifying isCurved |  |  |  |
| **When**  the node is initialised with defaults |  |  |  |
| **Then**  isCurved equals true |  |  |  |

## **2.3  Arrow / Association Validation**

| AT-DM-020  Arrow requires valid source and target nodes    \[UNIT\]    *← DM-050* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  an Arrow is constructed with sourceNodeId referencing a non-existent node |  |  |  |
| **When**  the Arrow is validated |  |  |  |
| **Then**  validation returns an error: 'Source node does not exist in this map' |  |  |  |
| **AT-DM-021  Arrow directionality defaults    \[UNIT\]**    *← DM-051* |  |  |  |
| **Given**  an Arrow is created without specifying directionality |  |  |  |
| **When**  the Arrow is initialised |  |  |  |
| **Then**  directionality equals 'UNI' |  |  |  |

## **2.4  Native File Format (.bmm)**

| AT-DM-030  Round-trip serialisation preserves all fields    \[UNIT\]    *← DM entity* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a fully-populated MindMap with 10 branches, 3 arrows, 2 codes, and a review schedule |  |  |  |
| **When**  the map is serialised to .bmm JSON format |  |  |  |
| **And**  then deserialised back into a MindMap object |  |  |  |
| **Then**  every field of every entity is identical to the original |  |  |  |
| **And**  no data loss occurs (deep equality check) |  |  |  |
| **AT-DM-031  Deserialising an invalid .bmm throws a typed error    \[UNIT\]**    *← DM entity* |  |  |  |
| **Given**  a .bmm file with a missing 'centralImage' field |  |  |  |
| **When**  the file is deserialised |  |  |  |
| **Then**  a 'BMMValidationError' is thrown |  |  |  |
| **And**  the error message identifies the missing field by name |  |  |  |

# **3\.  BUZAN LAW ENFORCEMENT TESTS**

**ℹ INFO:**  *This section is the most critical in the document. The scenarios here define the software's core identity as a Buzan-compliant tool. All MUST-level enforcement requirements are covered.*

## **3.1  Central Image Enforcement  (LE-001 – LE-004)**

| AT-LE-001  New map is blocked without a Central Image    \[E2E\]    *← LE-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a user opens the application and starts a new map |  |  |  |
| **When**  the user attempts to draw a branch without first setting a Central Image |  |  |  |
| **Then**  the branch creation is blocked |  |  |  |
| **And**  a modal appears with the message containing: 'Every Mind Map begins with a Central Image' |  |  |  |
| **And**  the modal links to the 'Why a Central Image?' help article |  |  |  |
| **And**  the branch tool remains disabled until a Central Image exists |  |  |  |
| **AT-LE-002  Plain-text central node is auto-converted to image    \[E2E\]**    *← LE-002* |  |  |  |
| **Given**  a user creates a new map |  |  |  |
| **When**  the user types a single word as the Central Image without drawing an image |  |  |  |
| **Then**  the system renders the word with a drop-shadow, multi-colour fill (≥ 3 colours), and bold dimension |  |  |  |
| **And**  a coaching message appears: 'Buzan recommends always using an image at the centre' |  |  |  |
| **And**  a button 'Draw an image instead' is prominently shown |  |  |  |
| **AT-LE-003  Central Image with fewer than 3 colours triggers warning    \[UNIT\]**    *← LE-003* |  |  |  |
| **Given**  a Central Image with colorCount \= 2 |  |  |  |
| **When**  the image is validated by the enforcement engine |  |  |  |
| **Then**  a WARN event is emitted |  |  |  |
| **And**  the warning message contains: 'Your Central Image uses only 2 colour(s)' |  |  |  |
| **And**  the warning message contains: 'Buzan recommends 3 or more colours' |  |  |  |
| **AT-LE-003b  Central Image with 3 colours passes validation    \[UNIT\]**    *← LE-003* |  |  |  |
| **Given**  a Central Image with colorCount \= 3 |  |  |  |
| **When**  the image is validated |  |  |  |
| **Then**  no colour warning is emitted |  |  |  |
| **AT-LE-004  Dimension coaching appears after 30 seconds    \[E2E\]**    *← LE-004* |  |  |  |
| **Given**  a user has a Central Image with hasDimension \= false |  |  |  |
| **When**  30 seconds elapse without the user adding dimension |  |  |  |
| **Then**  a non-blocking coach tip appears containing: 'Adding dimension (shadow or depth) to your central image makes it stand out' |  |  |  |
| **And**  the tip includes a one-click 'Add dimension' shortcut |  |  |  |
| **And**  dismissing the tip does not block editing |  |  |  |

## **3.2  Images Throughout the Map  (LE-010 – LE-012)**

| AT-LE-010  Warning when 8+ branches exist with zero inline images    \[E2E\]    *← LE-010* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with a Central Image and 8 branches |  |  |  |
| **And**  no branch has an inline image attached |  |  |  |
| **When**  the 9th branch is created |  |  |  |
| **Then**  a warning notification appears containing: 'Buzan strongly recommends placing images on branches' |  |  |  |
| **And**  the notification includes a direct link to the image insertion tool |  |  |  |
| **And**  the notification is dismissable and does not block editing |  |  |  |
| **AT-LE-011  Image density ratio is tracked    \[UNIT\]**    *← LE-012* |  |  |  |
| **Given**  a map with 10 branches and 3 branch images |  |  |  |
| **When**  the Buzan Health Panel data is computed |  |  |  |
| **Then**  imageDensityRatio equals 0.3 |  |  |  |
| **And**  the panel displays this ratio as a percentage |  |  |  |

## **3.3  Colour Enforcement  (LE-020 – LE-023)**

| AT-LE-020  Two BOIs cannot share the same colour    \[UNIT\]    *← LE-020* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  BOI B1 with color \= '\#E53935' |  |  |  |
| **When**  a second BOI B2 is created and assigned color \= '\#E53935' |  |  |  |
| **Then**  a BLOCK error is returned: 'Each BOI must have a unique colour' |  |  |  |
| **And**  B2 is either auto-assigned an unused colour or the user is prompted to pick a different one |  |  |  |
| **AT-LE-021  Map with fewer than 3 total colours triggers warning    \[UNIT\]**    *← LE-021* |  |  |  |
| **Given**  a map where all branches use a single colour and the Central Image uses 2 colours |  |  |  |
| **When**  the colour health check runs |  |  |  |
| **Then**  a WARN event fires containing: 'Buzan identifies colour as one of the most powerful tools' |  |  |  |
| **AT-LE-022  Colour inheritance cannot be manually broken on sub-branches by default    \[E2E\]**    *← LE-022* |  |  |  |
| **Given**  a BOI B1 with color \= 'Blue' |  |  |  |
| **And**  a sub-branch C1 under B1 |  |  |  |
| **When**  the user attempts to change C1's colour to 'Red' in standard editing mode |  |  |  |
| **Then**  the colour change is blocked |  |  |  |
| **And**  a tooltip explains: 'Sub-branches inherit their BOI colour. Use Personal Style Mode to override.' |  |  |  |
| **AT-LE-022b  Colour inheritance is applied on sub-branch creation    \[UNIT\]**    *← LE-022* |  |  |  |
| **Given**  a BOI with color \= '\#1565C0' |  |  |  |
| **When**  a child branch is added to the BOI |  |  |  |
| **Then**  the child branch color is automatically set to '\#1565C0' |  |  |  |

## **3.4  Size Variation Enforcement  (LE-030 – LE-032)**

| AT-LE-030  BOI keywords are visually larger than sub-branch keywords    \[VISUAL\]    *← LE-030* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a rendered map with one BOI and one sub-branch |  |  |  |
| **When**  a visual screenshot is taken |  |  |  |
| **Then**  the pixel height of the BOI keyword text is ≥ 1.5× the pixel height of the sub-branch keyword text |  |  |  |
| **AT-LE-031  Branch line thickness decreases with depth    \[VISUAL\]**    *← LE-031* |  |  |  |
| **Given**  a rendered map with branches at depths 0, 1, and 2 |  |  |  |
| **When**  a screenshot is taken and line widths are measured |  |  |  |
| **Then**  depth-0 lines are the widest |  |  |  |
| **And**  depth-1 lines are narrower than depth-0 |  |  |  |
| **And**  depth-2 lines are narrower than depth-1 |  |  |  |

## **3.5  Spacing Enforcement  (LE-040 – LE-042)**

| AT-LE-040  Branches do not overlap after auto-layout    \[VISUAL\]    *← LE-040* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with 8 BOIs added in rapid succession |  |  |  |
| **When**  the auto-layout engine finishes |  |  |  |
| **Then**  no two branch bounding boxes intersect in the rendered screenshot |  |  |  |
| **AT-LE-042  Auto-Balance Spacing action redistributes branches evenly    \[E2E\]**    *← LE-042* |  |  |  |
| **Given**  a map where a user has manually positioned branches causing uneven spacing |  |  |  |
| **When**  the user triggers the 'Auto-Balance Spacing' action |  |  |  |
| **Then**  all branches are redistributed so the angular gap between adjacent BOIs is approximately equal |  |  |  |
| **And**  no branches overlap |  |  |  |

## **3.6  Association Tools  (LE-050 – LE-055)**

| AT-LE-050  Arrow tool is accessible from the main toolbar    \[E2E\]    *← LE-050* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with at least 2 branches |  |  |  |
| **When**  the user opens the toolbar |  |  |  |
| **Then**  the 'Draw Arrow' tool is visible at the top level (not in a sub-menu) |  |  |  |
| **And**  clicking it activates arrow-drawing mode |  |  |  |
| **AT-LE-052  Arrow coaching fires at 10+ branches with zero arrows    \[E2E\]**    *← LE-052* |  |  |  |
| **Given**  a map with 10 branches |  |  |  |
| **And**  no arrows have been drawn |  |  |  |
| **When**  the 10th branch is created |  |  |  |
| **Then**  a coaching notification appears containing: 'Buzan uses arrows to reveal hidden connections' |  |  |  |
| **And**  the notification includes a link to activate the Draw Arrow tool |  |  |  |
| **AT-LE-053  Code Library panel is accessible and codes are reusable    \[E2E\]**    *← LE-053* |  |  |  |
| **Given**  a user opens the Code Library panel |  |  |  |
| **When**  the user defines a new code 'Action' with a star symbol and red colour |  |  |  |
| **And**  applies it to branch B1 |  |  |  |
| **And**  applies it to branch B2 on a different map |  |  |  |
| **Then**  both branches display the star symbol in red |  |  |  |
| **And**  the code 'Action' appears in the Code Library for future maps |  |  |  |
| **AT-LE-054  Hovering a code highlights all branches sharing that code    \[E2E\]**    *← LE-054* |  |  |  |
| **Given**  a map where 3 branches have the code 'Priority' applied |  |  |  |
| **When**  the user hovers the 'Priority' code in the Code Library |  |  |  |
| **Then**  all 3 branches are visually highlighted simultaneously |  |  |  |
| **And**  no other branches are highlighted |  |  |  |

## **3.7  Be Clear — One Keyword Per Line  (LE-060 – LE-068)**

| AT-LE-060a  Multi-word input triggers Clarity Modal    \[E2E\]    *← LE-060* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a user is editing a branch keyword |  |  |  |
| **When**  the user types 'good morning' (two words separated by a space) and confirms |  |  |  |
| **Then**  the Clarity Modal appears |  |  |  |
| **And**  the modal title contains: 'Buzan\\'s Law: One keyword per branch' |  |  |  |
| **And**  the modal explains: 'Each word has thousands of possible associations' |  |  |  |
| **And**  two options are offered: 'Split into multiple branches' and 'Keep as one word' |  |  |  |
| **AT-LE-060b  Split option creates sibling branches for each word    \[E2E\]**    *← LE-060* |  |  |  |
| **Given**  the Clarity Modal is shown for the input 'good morning' |  |  |  |
| **When**  the user clicks 'Split into multiple branches' |  |  |  |
| **Then**  branch B1 is created with keyword \= 'good' |  |  |  |
| **And**  branch B2 is created as a sibling of B1 with keyword \= 'morning' |  |  |  |
| **And**  both branches are placed at the same depth as the original |  |  |  |
| **AT-LE-061  Cursive fonts are not available as default    \[E2E\]**    *← LE-061* |  |  |  |
| **Given**  a user opens the font selector in map settings |  |  |  |
| **When**  the font list is displayed |  |  |  |
| **Then**  all listed fonts are sans-serif or printed-style typefaces |  |  |  |
| **And**  no cursive or script fonts are included in the default list |  |  |  |
| **AT-LE-062  Portrait orientation is blocked    \[E2E\]**    *← LE-062* |  |  |  |
| **Given**  a user opens canvas settings |  |  |  |
| **When**  the user selects 'Portrait' orientation |  |  |  |
| **Then**  the change is blocked |  |  |  |
| **And**  a message appears: 'Buzan recommends the horizontal (landscape) orientation' |  |  |  |
| **And**  the canvas remains in landscape mode |  |  |  |
| **AT-LE-063  Branch line length equals keyword pixel width    \[UNIT\]**    *← LE-063* |  |  |  |
| **Given**  a branch with keyword \= 'Creativity' at font-size 16px |  |  |  |
| **And**  the measured pixel width of 'Creativity' at 16px is 84px |  |  |  |
| **When**  the branch line length is computed |  |  |  |
| **Then**  branch.length equals 84 |  |  |  |
| **AT-LE-063b  Branch line length reflows when keyword is edited    \[E2E\]**    *← LE-063* |  |  |  |
| **Given**  a branch with keyword \= 'Sun' and length L1 |  |  |  |
| **When**  the user edits the keyword to 'Sunshine' |  |  |  |
| **Then**  branch.length is recalculated to L2 where L2 \> L1 |  |  |  |
| **And**  the visual line on the canvas updates immediately |  |  |  |
| **AT-LE-064  Disconnected branches are blocked    \[UNIT\]**    *← LE-064* |  |  |  |
| **Given**  a BranchNode with parentId referencing a non-existent node |  |  |  |
| **When**  the branch is added to the map |  |  |  |
| **Then**  validation returns an error: 'Branch must be connected to the Central Image or another branch' |  |  |  |
| **AT-LE-065  Central branches are always visually thicker    \[VISUAL\]**    *← LE-065* |  |  |  |
| **Given**  a rendered map with BOI branches and sub-branches |  |  |  |
| **When**  a screenshot is captured |  |  |  |
| **Then**  the measured stroke width of all BOI (depth-0) lines is greater than all sub-branch lines |  |  |  |
| **AT-LE-066  Keyword rotation warning at \> 45 degrees    \[E2E\]**    *← LE-066* |  |  |  |
| **Given**  a branch positioned at 280° (below horizontal, rendering the keyword at \~80° from upright) |  |  |  |
| **When**  the layout engine processes the keyword angle |  |  |  |
| **Then**  the keyword is flipped to remain within 45° of upright |  |  |  |
| **And**  if flipping is not achievable, a warning fires: 'Buzan recommends keeping your printing as upright as possible' |  |  |  |
| **AT-LE-067  Warning fires on imageless map with 12+ branches    \[E2E\]**    *← LE-067* |  |  |  |
| **Given**  a map with 12 branches and no images of any kind |  |  |  |
| **When**  the 13th branch is added |  |  |  |
| **Then**  a warning notification appears containing: 'Clarity and visual richness are Buzan laws' |  |  |  |
| **And**  the notification links directly to the image insertion tool |  |  |  |

## **3.8  Personal Style & C1+  (LE-070 – LE-074)**

| AT-LE-071  C1+ Tracker computes delta between consecutive maps    \[UNIT\]    *← LE-071* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  Map A with colourCount=3, imageCount=1, arrowCount=0, boundaryCount=0 |  |  |  |
| **And**  Map B (user's next map) with colourCount=5, imageCount=3, arrowCount=2, boundaryCount=1 |  |  |  |
| **When**  the C1+ Tracker compares B against A |  |  |  |
| **Then**  deltaColours \= \+2, deltaImages \= \+2, deltaArrows \= \+2, deltaBoundaries \= \+1 |  |  |  |
| **And**  the tracker displays a positive improvement summary for each metric |  |  |  |
| **AT-LE-071b  C1+ Tracker does not celebrate regression    \[UNIT\]**    *← LE-071* |  |  |  |
| **Given**  Map B has fewer images than Map A |  |  |  |
| **When**  the C1+ Tracker compares B against A |  |  |  |
| **Then**  deltaImages is a negative number |  |  |  |
| **And**  the display shows a gentle prompt: 'Your previous map had more images — try adding some to this one\!' |  |  |  |
| **And**  no celebration animation fires |  |  |  |
| **AT-LE-070  Personal Style Mode is locked until 3 maps are completed    \[E2E\]**    *← LE-070* |  |  |  |
| **Given**  a new user who has completed only 2 maps |  |  |  |
| **When**  the user navigates to Personal Style Mode |  |  |  |
| **Then**  the mode is shown as locked |  |  |  |
| **And**  the message reads: 'Complete 1 more map to unlock Personal Style Mode' |  |  |  |

## **3.9  Hierarchy Enforcement  (LE-080 – LE-084)**

| AT-LE-081  BOI Wizard is triggered on new map creation    \[E2E\]    *← LE-081* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a user starts a new map after completing the tutorial |  |  |  |
| **When**  the new map canvas opens |  |  |  |
| **Then**  the BOI Wizard panel appears within 2 seconds |  |  |  |
| **And**  the panel displays the 7 BOI questions |  |  |  |
| **And**  the user can input up to 7 BOI keywords before touching the canvas |  |  |  |
| **And**  clicking 'Start mapping' populates the canvas with those BOIs as pre-drawn branches |  |  |  |
| **AT-LE-082  Flat map warning fires when all branches are at depth 0    \[E2E\]**    *← LE-082* |  |  |  |
| **Given**  a map with 5 BOIs and zero sub-branches |  |  |  |
| **When**  3 minutes have elapsed since the last sub-branch was added (or since map creation) |  |  |  |
| **Then**  a warning notification appears containing: 'Buzan recommends using hierarchy' |  |  |  |
| **And**  the notification explains: 'A hierarchical structure is far more memorable than a flat list' |  |  |  |
| **AT-LE-083  Boundary auto-draw is offered when a BOI cluster is marked complete    \[E2E\]**    *← LE-083* |  |  |  |
| **Given**  a map with a BOI that has 4 sub-branches |  |  |  |
| **When**  the user right-clicks the BOI and selects 'Mark cluster as complete' |  |  |  |
| **Then**  a prompt appears: 'Draw a boundary around this cluster?' |  |  |  |
| **And**  if the user confirms, a curved boundary outline is drawn around the BOI and all its children |  |  |  |
| **And**  the boundary shape is stored in branch.boundaryShape |  |  |  |

## **3.10  Numerical Order Enforcement  (LE-090 – LE-093)**

| AT-LE-090  Sequence Mode allows branches to be numbered    \[E2E\]    *← LE-090* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with 4 BOIs |  |  |  |
| **When**  the user activates Sequence Mode |  |  |  |
| **Then**  each BOI displays a number badge |  |  |  |
| **And**  the user can drag-rank the BOIs to assign order 1–4 |  |  |  |
| **And**  the numbers are overlaid on the branches (not embedded in keywords) |  |  |  |
| **AT-LE-091  Numbered order exports as a linear outline    \[E2E\]**    *← LE-091* |  |  |  |
| **Given**  a map with 4 numbered BOIs and sub-branches |  |  |  |
| **When**  the user selects 'Export as Linear Outline' |  |  |  |
| **Then**  a document is generated with sections in numerical branch order |  |  |  |
| **And**  sub-branches appear as indented items under their parent section |  |  |  |
| **And**  no Mind Map canvas is included in the export |  |  |  |
| **And**  the Mind Map itself is unchanged |  |  |  |

# **4\.  CANVAS & RENDERING TESTS**

## **4.1  Rendering Engine**

| AT-RE-001  Canvas renders 500-node map in under 500ms    \[E2E\]    *← RE-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a pre-generated .bmm fixture with exactly 500 nodes |  |  |  |
| **When**  the map is loaded in the browser |  |  |  |
| **Then**  the time from navigation to first paint of the canvas is \< 500ms |  |  |  |
| **And**  no frames drop below 30fps during initial render |  |  |  |
| **AT-RE-002  Branches default to curved Bézier paths    \[VISUAL\]**    *← RE-002* |  |  |  |
| **Given**  a new branch is created |  |  |  |
| **When**  a screenshot is taken of the canvas |  |  |  |
| **Then**  the branch line is a visibly curved path (not a straight line) |  |  |  |
| **And**  the curve is smooth (no sharp corners) |  |  |  |
| **AT-RE-004  Canvas orientation is always landscape    \[VISUAL\]**    *← RE-004* |  |  |  |
| **Given**  a map is opened |  |  |  |
| **When**  the canvas dimensions are measured |  |  |  |
| **Then**  canvas width \> canvas height |  |  |  |
| **AT-RE-007  Miniature viewport thumbnail visible when zoomed in    \[E2E\]**    *← RE-007* |  |  |  |
| **Given**  a map with 15+ branches |  |  |  |
| **When**  the user zooms to 300% |  |  |  |
| **Then**  a thumbnail inset of the full map appears in a corner of the canvas |  |  |  |
| **And**  the current viewport region is highlighted in the thumbnail |  |  |  |
| **And**  the thumbnail updates as the user pans |  |  |  |
| **AT-RE-008  Branch growth animation fires on creation    \[E2E\]**    *← RE-008* |  |  |  |
| **Given**  an existing map |  |  |  |
| **When**  a new branch is created |  |  |  |
| **Then**  the branch line animates from zero length to full length |  |  |  |
| **And**  the animation duration is between 150ms and 300ms |  |  |  |
| **And**  the animation is interruptible (user can start editing the keyword before it completes) |  |  |  |

## **4.2  Central Image Rendering**

| AT-RE-020  Central Image remains at canvas centre at all zoom levels    \[VISUAL\]    *← RE-020* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with a Central Image |  |  |  |
| **When**  the user zooms to 50%, 100%, and 400% |  |  |  |
| **Then**  in all three screenshots the Central Image is at the geometric centre of the canvas |  |  |  |
| **AT-RE-022  Central Image minimum size is enforced    \[UNIT\]**    *← RE-022* |  |  |  |
| **Given**  a canvas with diagonal D |  |  |  |
| **When**  a Central Image is rendered |  |  |  |
| **Then**  the image dimensions are at least 8% of D in both width and height |  |  |  |
| **AT-RE-023  All BOI branches connect to Central Image boundary    \[VISUAL\]**    *← RE-023* |  |  |  |
| **Given**  a map with 5 BOIs |  |  |  |
| **When**  a screenshot is taken |  |  |  |
| **Then**  each BOI line visually originates from the boundary of the Central Image |  |  |  |
| **And**  no BOI line originates from the exact centre point |  |  |  |

## **4.3  Mega Mind Map**

| AT-RE-041  Branch Pivot promotes a sub-branch to new centre    \[E2E\]    *← RE-041* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map M1 with a sub-branch S at depth 2 |  |  |  |
| **When**  the user right-clicks S and selects 'Pivot: Make this the centre' |  |  |  |
| **Then**  a new canvas view opens with S as the Central Image |  |  |  |
| **And**  all of S's children are arranged as BOIs around the new centre |  |  |  |
| **And**  a breadcrumb navigation shows 'M1 \> \[parent branch\] \> S' |  |  |  |
| **And**  clicking a breadcrumb navigates back to that map |  |  |  |
| **AT-RE-042  Branch expands into a linked sub-map    \[E2E\]**    *← RE-042* |  |  |  |
| **Given**  a branch B with linkedMapId \= null |  |  |  |
| **When**  the user selects 'Expand to sub-map' on B |  |  |  |
| **Then**  a new empty Mind Map is created |  |  |  |
| **And**  B.linkedMapId is set to the new map's ID |  |  |  |
| **And**  B displays a sub-map link icon on the canvas |  |  |  |
| **And**  clicking the icon navigates into the sub-map |  |  |  |

# **5\.  EDITING EXPERIENCE TESTS**

## **5.1  Keyboard Navigation**

| AT-ED-001  Tab key adds a child branch    \[E2E\]    *← ED-002* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a branch B1 is selected |  |  |  |
| **When**  the user presses the Tab key |  |  |  |
| **Then**  a new child branch is created with parentId \= B1.id |  |  |  |
| **And**  the new branch is immediately in keyword-edit mode |  |  |  |
| **AT-ED-002  Enter key adds a sibling branch    \[E2E\]**    *← ED-002* |  |  |  |
| **Given**  a branch B1 at depth 1 is selected |  |  |  |
| **When**  the user presses the Enter key |  |  |  |
| **Then**  a new branch is created with the same parentId as B1 |  |  |  |
| **And**  the new branch is placed as a sibling of B1 |  |  |  |
| **And**  it is immediately in keyword-edit mode |  |  |  |
| **AT-ED-003  Delete key removes selected branch and its subtree    \[E2E\]**    *← ED-002* |  |  |  |
| **Given**  a branch B with 3 children is selected |  |  |  |
| **When**  the user presses the Delete key |  |  |  |
| **Then**  B and all 3 children are removed from the map |  |  |  |
| **And**  a confirmation dialog is shown first if the subtree has \> 5 nodes |  |  |  |

## **5.2  Blank Line Feature**

| AT-ED-010  Blank branch is created as a visual placeholder    \[E2E\]    *← ED-010* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  the user activates 'Add blank line' from the toolbar or via keyboard shortcut |  |  |  |
| **When**  the blank branch is added to the current parent |  |  |  |
| **Then**  a dashed/ghost-style line appears on the canvas |  |  |  |
| **And**  the branch data has blankLine \= true |  |  |  |
| **And**  no keyword text is rendered on the line |  |  |  |
| **AT-ED-011  Clicking a blank branch shows Buzan coaching message    \[E2E\]**    *← ED-012* |  |  |  |
| **Given**  a blank branch exists on the canvas |  |  |  |
| **When**  the user clicks it |  |  |  |
| **Then**  a coaching message appears containing: 'Blank branches challenge your brain to complete what has been left unfinished' |  |  |  |
| **And**  the branch immediately enters keyword-edit mode so the user can fill it in |  |  |  |

## **5.3  Mental Block Tools**

| AT-ED-020  'I'm Stuck' button is always visible    \[E2E\]    *← ED-030* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  any map is open in the editor |  |  |  |
| **When**  the canvas is inspected |  |  |  |
| **Then**  the 'I\\'m Stuck' button is visible without scrolling or opening any menu |  |  |  |
| **And**  clicking it opens the Mental Block Panel within 200ms |  |  |  |
| **AT-ED-021  Mental Block Panel offers four options    \[E2E\]**    *← ED-030* |  |  |  |
| **Given**  the Mental Block Panel is open |  |  |  |
| **When**  the panel content is inspected |  |  |  |
| **Then**  four actions are present: 'Add blank lines', 'Show BOI questions', 'Add a random image', 'Pivot to a branch' |  |  |  |
| **And**  each action is a single-click operation |  |  |  |
| **AT-ED-022  Mini Mind Map burst creates 10-branch association cloud    \[E2E\]**    *← ED-031* |  |  |  |
| **Given**  a branch B is selected |  |  |  |
| **And**  the user activates the Mini Mind Map burst |  |  |  |
| **When**  the user types associations in the burst interface |  |  |  |
| **Then**  up to 10 association branches radiate from a temporary centre |  |  |  |
| **And**  each association branch is draggable into the main map |  |  |  |
| **And**  branches dragged into the main map attach to B's depth+1 |  |  |  |

## **5.4  Undo / Redo**

| AT-ED-030  Undo reverts last branch creation    \[E2E\]    *← ED-040* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with N branches |  |  |  |
| **When**  a new branch is added (N+1 branches) |  |  |  |
| **And**  the user triggers Undo (Ctrl+Z / Cmd+Z) |  |  |  |
| **Then**  the branch count returns to N |  |  |  |
| **And**  the removed branch is no longer on the canvas |  |  |  |
| **AT-ED-031  Undo and Redo work across 50 consecutive operations    \[E2E\]**    *← ED-040* |  |  |  |
| **Given**  the user performs 50 distinct editing operations on a map |  |  |  |
| **When**  the user triggers Undo 50 times |  |  |  |
| **Then**  the map returns to its state before any of the 50 operations |  |  |  |
| **When**  the user triggers Redo 50 times |  |  |  |
| **Then**  the map returns to its state after all 50 operations |  |  |  |
| **And**  no data corruption occurs |  |  |  |

# **6\.  COLOUR SYSTEM TESTS**

| AT-CS-003  Colour palette auto-assigned to new BOIs    \[UNIT\]    *← CS-003* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a MindMap with active palette \[Red, Blue, Green, Yellow, Purple, Orange\] |  |  |  |
| **When**  6 BOIs are created in sequence |  |  |  |
| **Then**  BOI 1 has color Red, BOI 2 has color Blue ... BOI 6 has color Orange |  |  |  |
| **And**  no two BOIs share a colour |  |  |  |
| **AT-CS-006  Colour coding enables cross-BOI association    \[E2E\]**    *← CS-006* |  |  |  |
| **Given**  a map with 2 BOIs in different colours |  |  |  |
| **When**  the user manually sets a sub-branch of BOI-1 and a sub-branch of BOI-2 to the same custom colour |  |  |  |
| **And**  the override is performed in Personal Style Mode |  |  |  |
| **Then**  both branches display the shared colour |  |  |  |
| **And**  a visual indicator (e.g. dashed connection) suggests a cross-BOI relationship |  |  |  |
| **AT-CS-008  Colour Health Warning fires for same colour on unrelated branches    \[UNIT\]**    *← CS-008* |  |  |  |
| **Given**  4 branches from 3 different BOIs all assigned the same colour |  |  |  |
| **When**  the colour health check runs |  |  |  |
| **Then**  a WARN event is emitted: 'Using the same colour across unrelated branches may create confusing associations' |  |  |  |
| **AT-CS-009  Colour-blindness mode replaces problem pairs    \[E2E\]**    *← CS-009* |  |  |  |
| **Given**  a map with a red/green BOI colour pair |  |  |  |
| **When**  the user enables colour-blindness mode |  |  |  |
| **Then**  the red/green pair is replaced with a high-contrast accessible alternative |  |  |  |
| **And**  the map still uses at least 3 distinct colours |  |  |  |

# **7\.  TYPOGRAPHY TESTS**

| AT-TY-001  Default font is printed sans-serif    \[VISUAL\]    *← TY-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a new map is created with default settings |  |  |  |
| **When**  the canvas is rendered and a screenshot is taken |  |  |  |
| **Then**  the keyword text is rendered in a sans-serif printed typeface |  |  |  |
| **And**  no cursive letterforms are visible |  |  |  |
| **AT-TY-002  BOI keywords default to UPPER CASE    \[UNIT\]**    *← TY-002* |  |  |  |
| **Given**  a BOI branch is created with keyword \= 'happiness' |  |  |  |
| **When**  the branch is rendered |  |  |  |
| **Then**  branch.isUpperCase equals true |  |  |  |
| **And**  the displayed text is 'HAPPINESS' |  |  |  |
| **AT-TY-003  Font size decreases with branch depth    \[VISUAL\]**    *← TY-003* |  |  |  |
| **Given**  a rendered map with branches at depths 0, 1, and 2 |  |  |  |
| **When**  keyword text heights are measured from the screenshot |  |  |  |
| **Then**  depth-0 text height \> depth-1 text height \> depth-2 text height |  |  |  |
| **AT-TY-005  Keywords stay upright on steep branches    \[VISUAL\]**    *← TY-005* |  |  |  |
| **Given**  a branch positioned at 250° (lower-left quadrant) |  |  |  |
| **When**  the canvas is rendered |  |  |  |
| **Then**  the keyword text is flipped and reads left-to-right with \< 45° tilt from horizontal |  |  |  |

# **8\.  ONBOARDING & LEARNING SYSTEM TESTS**

## **8.1  Stage 1: Accept**

| AT-OB-001  New user cannot create a free map before tutorial    \[E2E\]    *← OB-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a brand-new user account with zero completed maps |  |  |  |
| **When**  the user navigates to 'New Map' |  |  |  |
| **Then**  the tutorial map is shown instead of a blank canvas |  |  |  |
| **And**  the 'Free create' option is greyed out with the label: 'Complete tutorial to unlock' |  |  |  |
| **AT-OB-002  Each tutorial step displays the relevant Buzan law    \[E2E\]**    *← OB-002* |  |  |  |
| **Given**  the user is on tutorial step 3 (adding a BOI branch) |  |  |  |
| **When**  the step content is inspected |  |  |  |
| **Then**  the step displays the law name: 'Law 1: Use Hierarchy' |  |  |  |
| **And**  the step displays the rationale in Buzan's terms |  |  |  |
| **And**  a visual before/after example is shown |  |  |  |
| **AT-OB-003  Tutorial is completable in under 15 minutes    \[MANUAL\]**    *← OB-003* |  |  |  |
| **Given**  a first-time user with no prior Mind Mapping experience |  |  |  |
| **When**  the user begins the tutorial and completes all steps without skipping |  |  |  |
| **Then**  the total elapsed time from start to completion is ≤ 15 minutes |  |  |  |
| **\#**  Reviewer note: time 3 independent test participants. Record times. |  |  |  |
| **AT-OB-004  Tutorial step cannot be skipped without correct application    \[E2E\]**    *← OB-004* |  |  |  |
| **Given**  the user is on the step: 'Add an image to a branch' |  |  |  |
| **When**  the user clicks 'Next' without having added any branch image |  |  |  |
| **Then**  the 'Next' button does not advance the tutorial |  |  |  |
| **And**  a prompt appears: 'Please add an image to a branch to continue' |  |  |  |

## **8.2  Stage 2: Apply**

| AT-OB-010  100-map progress tracker is visible on home screen    \[E2E\]    *← OB-010* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a user who has completed 7 maps |  |  |  |
| **When**  the user views the home/dashboard screen |  |  |  |
| **Then**  a progress tracker is visible showing '7 / 100 maps completed' |  |  |  |
| **And**  the tracker includes a note: 'Buzan recommends 100 maps to fully internalise the laws' |  |  |  |
| **AT-OB-011  Post-session reflection prompt appears after saving    \[E2E\]**    *← OB-011* |  |  |  |
| **Given**  a user saves a map |  |  |  |
| **When**  the save is confirmed |  |  |  |
| **Then**  a prompt appears: 'What was the most surprising association you discovered?' |  |  |  |
| **And**  the prompt is dismissable |  |  |  |
| **And**  if answered, the response is saved to the map's metadata |  |  |  |

# **9\.  REVIEW & REINFORCEMENT TESTS**

| AT-RV-001  Review schedule is auto-generated on map save    \[UNIT\]    *← RV-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map is saved for the first time |  |  |  |
| **When**  the review schedule is inspected |  |  |  |
| **Then**  6 scheduled review entries exist with the correct intervals |  |  |  |
| **And**  all 6 entries have completed \= false |  |  |  |
| **AT-RV-002  Review notification includes the Buzan rationale    \[E2E\]**    *← RV-002* |  |  |  |
| **Given**  a map whose first review (T \+ 1 day) is now due |  |  |  |
| **When**  the notification fires |  |  |  |
| **Then**  the notification body contains: 'Reviewing now — 1 day after creating — is the most critical step' |  |  |  |
| **And**  the notification contains: 'according to Buzan\\'s memory research' |  |  |  |
| **And**  two action buttons are present: 'View original map' and 'Quick Mind Map Check' |  |  |  |
| **AT-RV-003  Quick Mind Map Check presents a blank canvas    \[E2E\]**    *← RV-003* |  |  |  |
| **Given**  a review notification is open for map M |  |  |  |
| **When**  the user clicks 'Quick Mind Map Check' |  |  |  |
| **Then**  a blank canvas opens |  |  |  |
| **And**  the original map M is hidden (not accessible during the check) |  |  |  |
| **And**  a countdown or prompt indicates: 'Recreate your map from memory' |  |  |  |
| **AT-RV-004  Recall map is compared with original after check    \[E2E\]**    *← RV-004* |  |  |  |
| **Given**  the user has completed a Quick Mind Map Check and saved the recall map R |  |  |  |
| **When**  the comparison view opens |  |  |  |
| **Then**  branches present in the original M but absent in R are highlighted in amber (missed) |  |  |  |
| **And**  branches in R that were not in M are highlighted in green (new associations) |  |  |  |
| **And**  matching branches are highlighted in blue (recalled) |  |  |  |
| **AT-RV-005  Map is flagged as Long-Term Memory after 6-month review    \[E2E\]**    *← RV-005* |  |  |  |
| **Given**  a map whose 6th review (T \+ 180 days) has been marked as completed |  |  |  |
| **When**  the map listing is viewed |  |  |  |
| **Then**  the map displays a 'Long-Term Memory' badge |  |  |  |
| **And**  the map is moved to the 'Archive' section |  |  |  |
| **And**  a recurring annual review reminder is created |  |  |  |

# **10\.  GROUP MIND MAP TESTS**

| AT-GM-001  Any map can be converted to a Group Mind Map    \[E2E\]    *← GM-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a solo map M with 5 branches |  |  |  |
| **When**  the user selects 'Convert to Group Mind Map' and invites 2 participants |  |  |  |
| **Then**  M.isGroupMap is set to true |  |  |  |
| **And**  the 2 participants receive invite notifications |  |  |  |
| **And**  all 5 existing branches are preserved |  |  |  |
| **AT-GM-002  Real-time collaboration shows live cursors    \[E2E\]**    *← GM-002* |  |  |  |
| **Given**  User A and User B are editing the same Group Mind Map simultaneously |  |  |  |
| **When**  User A moves their cursor on the canvas |  |  |  |
| **Then**  User B sees User A's cursor position update in real time (\< 200ms latency) |  |  |  |
| **And**  each user's cursor is labelled with their name |  |  |  |
| **AT-GM-004  Brainstorm Phase blocks editing other participants' branches    \[E2E\]**    *← GM-004* |  |  |  |
| **Given**  a Group Mind Map in Brainstorm Phase |  |  |  |
| **And**  User A has added branch B1 |  |  |  |
| **When**  User B attempts to edit or delete B1 |  |  |  |
| **Then**  the action is blocked |  |  |  |
| **And**  a tooltip appears: 'You cannot edit others\\' branches during Brainstorm Phase' |  |  |  |
| **AT-GM-006  Each participant's branches are colour-coded in Brainstorm Phase    \[VISUAL\]**    *← GM-006* |  |  |  |
| **Given**  a Group Mind Map in Brainstorm Phase with 3 participants each adding branches |  |  |  |
| **When**  a screenshot is taken of the canvas |  |  |  |
| **Then**  branches from each participant render in that participant's assigned colour |  |  |  |
| **And**  the colours are distinct from each other |  |  |  |
| **AT-GM-010  Dot-voting highlights priority branches    \[E2E\]**    *← GM-010* |  |  |  |
| **Given**  a Group Mind Map in Edit Phase with 4 branches |  |  |  |
| **When**  3 participants each cast a vote on branch B2 |  |  |  |
| **Then**  B2 displays a vote count badge of '3' |  |  |  |
| **And**  B2 is visually prominent compared to non-voted branches |  |  |  |
| **And**  the facilitator can sort branches by vote count |  |  |  |

# **11\.  EXPORT & IMPORT TESTS**

| AT-EX-001a  SVG export produces valid vector output    \[E2E\]    *← EX-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with 10 branches and 2 images |  |  |  |
| **When**  the user exports as SVG |  |  |  |
| **Then**  the downloaded file is a valid SVG document (passes XML validation) |  |  |  |
| **And**  the SVG renders the canvas at full fidelity in a browser |  |  |  |
| **And**  all text is present as \<text\> elements (not rasterised) |  |  |  |
| **AT-EX-001b  PDF export enforces landscape orientation    \[UNIT\]**    *← EX-001* |  |  |  |
| **Given**  any map is exported as PDF |  |  |  |
| **When**  the PDF metadata is inspected |  |  |  |
| **Then**  page orientation is LANDSCAPE |  |  |  |
| **And**  the exported content fills the landscape page |  |  |  |
| **AT-EX-002  Linear Outline export respects numerical branch order    \[E2E\]**    *← EX-002* |  |  |  |
| **Given**  a map with 4 BOIs numbered 1–4, each with sub-branches |  |  |  |
| **When**  the user exports as Linear Outline (DOCX) |  |  |  |
| **Then**  the document has 4 top-level sections in the order 1, 2, 3, 4 |  |  |  |
| **And**  each section contains its sub-branches as indented bullet points |  |  |  |
| **And**  no Mind Map visual is included in the export |  |  |  |
| **AT-EX-003  Round-trip .bmm export/import preserves full fidelity    \[UNIT\]**    *← EX-003* |  |  |  |
| **Given**  a fully-populated map M |  |  |  |
| **When**  M is exported as .bmm |  |  |  |
| **And**  the exported file is imported into a fresh session |  |  |  |
| **Then**  the imported map is identical to M in all fields (deep equality) |  |  |  |
| **AT-EX-008  Importing a non-compliant map shows compliance warnings    \[E2E\]**    *← EX-008* |  |  |  |
| **Given**  a .xmind file where branches use phrase-style multi-word labels |  |  |  |
| **When**  the user imports the file |  |  |  |
| **Then**  the map is imported successfully |  |  |  |
| **And**  a compliance warning panel lists all Buzan law violations detected |  |  |  |
| **And**  each violation includes a 'Fix' button linking to the relevant enforcement tool |  |  |  |

# **12\.  BUZAN HEALTH PANEL TESTS**

| AT-HP-001  Health Panel displays all required metrics    \[E2E\]    *← HP-001* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with the following properties: Central Image present, 4 colours, 3 branch images, 2 arrows, 1 multi-word keyword, max depth 3, 5 BOIs, 1 blank branch |  |  |  |
| **When**  the Buzan Health Panel is opened |  |  |  |
| **Then**  the panel displays: Central Image \= ✓ Compliant, Colours \= 4, Images \= 3, Arrows \= 2, Keyword compliance \= 87.5% (7/8 single-word), Max depth \= 3, BOIs \= 5, Blank lines \= 1 |  |  |  |
| **AT-HP-003  Radiant Score reflects compliance level    \[UNIT\]**    *← HP-003* |  |  |  |
| **Given**  a perfectly compliant map (all laws satisfied) |  |  |  |
| **When**  the Radiant Score is computed |  |  |  |
| **Then**  the score is between 90 and 100 |  |  |  |
|    |  |  |  |
| **Given**  a map with zero images, one colour, and all multi-word keywords |  |  |  |
| **When**  the Radiant Score is computed |  |  |  |
| **Then**  the score is below 40 |  |  |  |
| **AT-HP-002  Each metric links to Buzan law rationale    \[E2E\]**    *← HP-002* |  |  |  |
| **Given**  the Health Panel is open |  |  |  |
| **When**  the user clicks on the 'Images' metric |  |  |  |
| **Then**  a tooltip or side panel opens explaining the 'Use Emphasis — Images Throughout' law |  |  |  |
| **And**  the rationale text matches the content from the spec (Section 4.1.2) |  |  |  |

# **13\.  NON-FUNCTIONAL TESTS**

## **13.1  Performance**

| AT-NF-001  Branch addition latency is under 50ms    \[E2E\]    *← NF-002* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  a map with 100 existing branches |  |  |  |
| **When**  a new branch is added |  |  |  |
| **Then**  the time from user action (keypress or click) to canvas update is \< 50ms |  |  |  |
| **And**  this is measured using browser performance API |  |  |  |
| **AT-NF-003  Zoom animation runs at 60fps    \[E2E\]**    *← NF-003* |  |  |  |
| **Given**  a map with 200 nodes is open |  |  |  |
| **When**  the user zooms from 100% to 300% over 1 second |  |  |  |
| **Then**  no frame during the animation takes longer than 16.7ms to render |  |  |  |
| **And**  frames per second as measured by requestAnimationFrame never drops below 55fps |  |  |  |
| **AT-NF-004  Map is fully editable offline    \[E2E\]**    *← NF-004* |  |  |  |
| **Given**  the application is loaded and a map is open |  |  |  |
| **When**  the network connection is disabled |  |  |  |
| **And**  the user adds 3 new branches, edits 2 keywords, and saves |  |  |  |
| **Then**  all edits are applied to the local store |  |  |  |
| **When**  the network is re-enabled |  |  |  |
| **Then**  all 3 branches and 2 keyword edits sync to the server without data loss |  |  |  |

## **13.2  Accessibility**

| AT-NF-010  All non-canvas UI passes WCAG 2.1 AA    \[E2E\]    *← NF-010* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  the full application is rendered |  |  |  |
| **When**  an automated accessibility audit is run (axe-core) |  |  |  |
| **Then**  zero critical or serious violations are reported for all non-canvas panels, modals, and toolbars |  |  |  |
| **AT-NF-011  All core editing functions are keyboard-navigable    \[MANUAL\]**    *← NF-011* |  |  |  |
| **Given**  a mouse/trackpad is unavailable (or disconnected) |  |  |  |
| **When**  a reviewer attempts to: create a new map, add 3 BOIs, add sub-branches, draw an arrow, open the Health Panel, and save |  |  |  |
| **Then**  all actions are completable using keyboard alone |  |  |  |
| **\#**  Reviewer: record each action and whether it succeeded without a mouse |  |  |  |
| **AT-NF-012  Outline View is screen-reader compatible    \[E2E\]**    *← NF-012* |  |  |  |
| **Given**  a map with 5 BOIs and 3 sub-branches each is open |  |  |  |
| **When**  the Outline View panel is activated and inspected with axe-core |  |  |  |
| **Then**  the tree structure is navigable with ARIA roles (tree, treeitem) |  |  |  |
| **And**  each node is announced with its keyword and depth level |  |  |  |

## **13.3  Security**

| AT-NF-020  Map data is encrypted in transit    \[E2E\]    *← NF-020* |  |  |  |
| :---- | ----- | ----- | ----- |
| **Given**  the application is making API calls to sync a map |  |  |  |
| **When**  network traffic is inspected |  |  |  |
| **Then**  all requests use HTTPS (TLS 1.3) |  |  |  |
| **And**  no map data is transmitted in plaintext |  |  |  |
| **AT-NF-022  Group Map participants cannot access other users' solo maps    \[E2E\]**    *← NF-022* |  |  |  |
| **Given**  User A and User B are both members of Group Map G |  |  |  |
| **And**  User A also has a private solo map P |  |  |  |
| **When**  User B attempts to access P directly via its API endpoint |  |  |  |
| **Then**  the server returns HTTP 403 Forbidden |  |  |  |
| **And**  no map data for P is returned |  |  |  |

# **14\.  MANUAL ACCEPTANCE CRITERIA**

The following criteria cannot be validated by automated tests. They must be reviewed by a human before any production release. Each criterion maps to a qualitative requirement in the spec.

**⚠ CAUTION:**  *All manual criteria must have a signed-off reviewer entry in the Release Acceptance Log before the feature is shipped. 'PASS with notes' is acceptable. 'SKIP' is not.*

| AT-MA-001  Coaching message tone is encouraging, not punitive    \[MANUAL\]    *← ED-020 / Danger Area 4* |  |  |  |
| :---- | ----- | ----- | ----- |
| **\#**  Reviewer reads all coaching messages in the system and evaluates tone |  |  |  |
| **Given**  all coaching and warning messages are reviewed by a product team member |  |  |  |
| **Then**  no message uses words implying user failure, incompetence, or blame |  |  |  |
| **And**  every message frames the feedback as an opportunity to improve |  |  |  |
| **And**  every BLOCK message explains the Buzan law it is enforcing |  |  |  |
| **\#**  Acceptance: reviewer signs off with 'Messages are consistently encouraging' |  |  |  |
| **AT-MA-002  Radiant Score feels motivating, not punitive    \[MANUAL\]**    *← HP-003* |  |  |  |
| **\#**  Reviewer creates 5 maps of varying quality and evaluates score experience |  |  |  |
| **Given**  a reviewer creates a first map (expected low score) and a fifth map (expected higher score) |  |  |  |
| **Then**  the low score on map 1 does not cause anxiety or discouragement |  |  |  |
| **And**  the trajectory between map 1 and map 5 feels like a rewarding improvement arc |  |  |  |
| **\#**  Acceptance: reviewer rates the motivational quality 4/5 or higher |  |  |  |
| **AT-MA-003  Branch animation feel is organic and natural    \[MANUAL\]**    *← RE-008* |  |  |  |
| **\#**  Reviewer creates 10 branches and evaluates animation quality |  |  |  |
| **Given**  a reviewer creates multiple branches in quick succession |  |  |  |
| **Then**  the growth animation feels smooth and alive (organic), not mechanical |  |  |  |
| **And**  the animation reinforces the 'living tree' metaphor Buzan uses |  |  |  |
| **\#**  Acceptance: reviewer notes 'animation feels natural and appropriate' |  |  |  |
| **AT-MA-004  Clarity Modal wording communicates Buzan's rationale clearly    \[MANUAL\]**    *← LE-060* |  |  |  |
| **\#**  Reviewer triggers the Clarity Modal with a 3-word phrase and reads the content |  |  |  |
| **Given**  a reviewer triggers the Clarity Modal |  |  |  |
| **Then**  the explanation of 'one keyword per branch' is understandable to a non-expert |  |  |  |
| **And**  the 'extra joints' metaphor from Buzan is present or equivalently evocative |  |  |  |
| **And**  the 'Split' option is the visually dominant (recommended) choice |  |  |  |
| **AT-MA-005  Tutorial is understood by a complete beginner    \[MANUAL\]**    *← OB-003* |  |  |  |
| **\#**  Reviewer observes a user with zero Mind Mapping experience complete the tutorial |  |  |  |
| **Given**  an observer watches a novice complete the full onboarding tutorial |  |  |  |
| **Then**  the novice understands what a Mind Map is by the end |  |  |  |
| **And**  the novice can explain: what a Central Image is, what a BOI is, why keywords are single words |  |  |  |
| **And**  the novice does not express confusion at any step |  |  |  |
| **\#**  Acceptance: observer records 3 key concepts successfully grasped |  |  |  |
| **AT-MA-006  BOI Wizard helps users identify their main branches    \[MANUAL\]**    *← LE-081* |  |  |  |
| **\#**  Reviewer uses the BOI Wizard for 3 different map topics |  |  |  |
| **Given**  a reviewer uses the BOI Wizard for topics: 'My career goals', 'Planning a holiday', 'Learning Python' |  |  |  |
| **Then**  for each topic the BOI questions produce useful, relevant main branches |  |  |  |
| **And**  the reviewer does not feel the questions are generic or unhelpful |  |  |  |
| **\#**  Acceptance: reviewer notes 'BOI questions were useful for at least 2 of 3 topics' |  |  |  |
| **AT-MA-007  Colour palette presets are visually vibrant and high-contrast    \[MANUAL\]**    *← CS-007* |  |  |  |
| **Given**  a reviewer opens the palette picker and views all preset palettes |  |  |  |
| **Then**  each palette contains colours that are clearly distinguishable from each other |  |  |  |
| **And**  no preset palette looks dull, monochrome, or low-contrast |  |  |  |
| **And**  all palettes contain at least 5 colours |  |  |  |
| **\#**  Acceptance: reviewer approves ≥ 4 of the 5 preset palettes as visually suitable for Mind Mapping |  |  |  |
| **AT-MA-008  Four Danger Areas are effectively mitigated by design    \[MANUAL\]**    *← Sec 18 (spec)* |  |  |  |
| **\#**  Reviewer attempts to reproduce each of Buzan's 4 danger areas in the system |  |  |  |
| **Given**  a reviewer deliberately tries to: create a map that isn't really a Mind Map, use phrases, dismiss a messy map as broken, react negatively to the system |  |  |  |
| **Then**  Danger Area 1: the Radiant Score and colour enforcement make a non-compliant map visibly obvious — the user is informed and guided |  |  |  |
| **And**  Danger Area 2: the Clarity Modal is clear and splitting phrases is the obvious choice |  |  |  |
| **And**  Danger Area 3: the system labels first-draft maps positively and framing is constructive |  |  |  |
| **And**  Danger Area 4: the reviewer does not feel anxious or judged at any point |  |  |  |

# **15\.  REQUIREMENTS COVERAGE MATRIX**

This matrix maps every MUST and SHOULD requirement from the specification to its corresponding test case(s). Use this as the primary artefact for release gate reviews.

**ℹ INFO:**  *Status key: COVERED \= test written and passing  |  PARTIAL \= test written but incomplete  |  PENDING \= test not yet written  |  MANUAL \= human review required*

| Spec ID | Requirement (abbreviated) | Test ID(s) | Layer | Status |
| :---- | :---- | :---- | :---- | :---- |
| DM-003 | Central Image required | AT-DM-001 | UNIT | COVERED |
| DM-005 | LANDSCAPE orientation enforced | AT-DM-002 | UNIT | COVERED |
| DM-007 | Min 3 colour palette | AT-DM-003 | UNIT | COVERED |
| DM-010 | Review schedule auto-generated | AT-DM-004 | UNIT | COVERED |
| DM-022 | Keyword \= single word | AT-DM-010 | UNIT | COVERED |
| DM-027 | Branch length \= keyword width | AT-DM-011 · AT-LE-063 | UNIT | COVERED |
| DM-024 | Colour inheritance from BOI | AT-DM-015 · AT-DM-016 | UNIT | COVERED |
| DM-026 | isCurved defaults true | AT-DM-017 | UNIT | COVERED |
| LE-001 | Block branch without Central Image | AT-LE-001 | E2E | COVERED |
| LE-002 | Text central node auto-converted | AT-LE-002 | E2E | COVERED |
| LE-003 | \< 3 colours on central image warns | AT-LE-003 · AT-LE-003b | UNIT | COVERED |
| LE-004 | Dimension coaching at 30s | AT-LE-004 | E2E | COVERED |
| LE-010 | Warn on 8+ branches / 0 images | AT-LE-010 | E2E | COVERED |
| LE-020 | Two BOIs cannot share colour | AT-LE-020 | UNIT | COVERED |
| LE-021 | Map \< 3 colours warns | AT-LE-021 | UNIT | COVERED |
| LE-022 | Colour inheritance enforced | AT-LE-022 · AT-LE-022b | E2E | COVERED |
| LE-030 | BOI keywords visually larger | AT-LE-030 | VISUAL | COVERED |
| LE-031 | Line thickness decreases with depth | AT-LE-031 | VISUAL | COVERED |
| LE-040 | No branch overlap after auto-layout | AT-LE-040 | VISUAL | COVERED |
| LE-050 | Arrow tool in main toolbar | AT-LE-050 | E2E | COVERED |
| LE-052 | Arrow coaching at 10 branches | AT-LE-052 | E2E | COVERED |
| LE-053 | Code Library panel functional | AT-LE-053 | E2E | COVERED |
| LE-060 | Multi-word triggers Clarity Modal | AT-LE-060a · AT-LE-060b | E2E | COVERED |
| LE-061 | Cursive fonts not available | AT-LE-061 | E2E | COVERED |
| LE-062 | Portrait orientation blocked | AT-LE-062 | E2E | COVERED |
| LE-063 | Line length \= keyword width | AT-LE-063 · AT-LE-063b | UNIT/E2E | COVERED |
| LE-064 | Disconnected branches blocked | AT-LE-064 | UNIT | COVERED |
| LE-065 | Central lines always thicker | AT-LE-065 | VISUAL | COVERED |
| LE-066 | Keyword upright angle enforced | AT-LE-066 | E2E | COVERED |
| LE-067 | Warn on 12+ branches / 0 images | AT-LE-067 | E2E | COVERED |
| LE-070 | Personal Style Mode locked until 3 maps | AT-LE-070 | E2E | COVERED |
| LE-071 | C1+ Tracker computes deltas | AT-LE-071 · AT-LE-071b | UNIT | COVERED |
| LE-081 | BOI Wizard on new map | AT-LE-081 | E2E | COVERED |
| LE-082 | Flat map hierarchy warning | AT-LE-082 | E2E | COVERED |
| LE-083 | Boundary auto-draw offered | AT-LE-083 | E2E | COVERED |
| LE-090 | Sequence Mode with numbered branches | AT-LE-090 | E2E | COVERED |
| LE-091 | Numbered order → linear outline export | AT-LE-091 | E2E | COVERED |
| RE-001 | 500-node render \< 500ms | AT-RE-001 | E2E | COVERED |
| RE-002 | Branches default to Bézier curves | AT-RE-002 | VISUAL | COVERED |
| RE-004 | Canvas always landscape | AT-RE-004 | VISUAL | COVERED |
| RE-007 | Miniature viewport when zoomed | AT-RE-007 | E2E | COVERED |
| RE-008 | Branch growth animation 150–300ms | AT-RE-008 | E2E | COVERED |
| RE-020 | Central Image at canvas centre | AT-RE-020 | VISUAL | COVERED |
| RE-022 | Central Image minimum size | AT-RE-022 | UNIT | COVERED |
| RE-041 | Branch Pivot to new centre | AT-RE-041 | E2E | COVERED |
| RE-042 | Branch expands to sub-map | AT-RE-042 | E2E | COVERED |
| OB-001 | Tutorial required before free create | AT-OB-001 | E2E | COVERED |
| OB-002 | Tutorial shows Buzan law per step | AT-OB-002 | E2E | COVERED |
| OB-003 | Tutorial ≤ 15 minutes | AT-OB-003 | MANUAL | COVERED |
| OB-004 | Tutorial step cannot be skipped | AT-OB-004 | E2E | COVERED |
| OB-010 | 100-map tracker on dashboard | AT-OB-010 | E2E | COVERED |
| RV-001 | Review schedule on save | AT-RV-001 | UNIT | COVERED |
| RV-002 | Notification includes rationale | AT-RV-002 | E2E | COVERED |
| RV-003 | Quick Mind Map Check blank canvas | AT-RV-003 | E2E | COVERED |
| RV-004 | Recall compared with original | AT-RV-004 | E2E | COVERED |
| RV-005 | Long-Term Memory badge at 6 months | AT-RV-005 | E2E | COVERED |
| GM-001 | Map convertible to Group Map | AT-GM-001 | E2E | COVERED |
| GM-002 | Real-time cursors | AT-GM-002 | E2E | COVERED |
| GM-004 | Brainstorm Phase blocks editing others | AT-GM-004 | E2E | COVERED |
| GM-006 | Participant colour coding | AT-GM-006 | VISUAL | COVERED |
| GM-010 | Dot-voting highlights priority branches | AT-GM-010 | E2E | COVERED |
| NF-002 | Branch addition \< 50ms | AT-NF-001 | E2E | COVERED |
| NF-003 | Zoom at 60fps | AT-NF-003 | E2E | COVERED |
| NF-004 | Offline editing \+ sync | AT-NF-004 | E2E | COVERED |
| NF-010 | WCAG 2.1 AA (non-canvas) | AT-NF-010 | E2E | COVERED |
| NF-011 | Keyboard-only editing | AT-NF-011 | MANUAL | COVERED |
| NF-020 | HTTPS / TLS 1.3 | AT-NF-020 | E2E | COVERED |
| HP-001 | Health Panel displays all metrics | AT-HP-001 | E2E | COVERED |
| HP-002 | Metrics link to law rationale | AT-HP-002 | E2E | COVERED |
| HP-003 | Radiant Score reflects compliance | AT-HP-003 | UNIT | COVERED |
| CS-003 | Colour auto-assigned to BOIs | AT-CS-003 | UNIT | COVERED |
| CS-008 | Colour health warning | AT-CS-008 | UNIT | COVERED |
| TY-001 | Default printed sans-serif font | AT-TY-001 | VISUAL | COVERED |
| TY-002 | BOI keywords uppercase | AT-TY-002 | UNIT | COVERED |
| TY-005 | Keywords stay upright | AT-TY-005 | VISUAL | COVERED |
| EX-001 | SVG and PDF export | AT-EX-001a · AT-EX-001b | E2E | COVERED |
| EX-002 | Linear Outline export | AT-EX-002 | E2E | COVERED |
| EX-003 | .bmm round-trip fidelity | AT-EX-003 | UNIT | COVERED |
| ED-030 | 'I\\'m Stuck' always visible | AT-ED-020 | E2E | COVERED |
| ED-010 | Blank branch visual placeholder | AT-ED-010 | E2E | COVERED |
| LE-012 | Image density ratio tracked | AT-LE-011 | UNIT | COVERED |
| LE-054 | Code hover highlights all same-code branches | AT-LE-054 | E2E | COVERED |
| LE-042 | Auto-Balance Spacing | AT-LE-042 | E2E | COVERED |
| CS-006 | Cross-BOI colour association | AT-CS-006 | E2E | **PARTIAL** |
| CS-009 | Colour-blindness mode | AT-CS-009 | E2E | COVERED |
| ED-040 | Unlimited undo/redo | AT-ED-030 · AT-ED-031 | E2E | COVERED |
| GM-003 | Facilitator role | — | — | **PENDING** |
| GM-005 | Edit Phase collaborative editing | — | — | **PENDING** |
| NF-022 | Group Map data isolation | AT-NF-022 | E2E | COVERED |
| OB-020 | Advanced Mode unlocked at 30+ maps | — | — | **PENDING** |
| RV-007 | Adaptive review spacing | — | — | **PENDING** |

# **APPENDIX A — MANUAL REVIEW LOG TEMPLATE**

Copy this template for each release cycle. Each MANUAL test must have a row completed and signed before the release gate meeting.

| Test ID | Criterion | Reviewer | Date | Result | Notes / Observations |
| :---- | :---- | :---- | :---- | :---- | :---- |
| AT-MA-001 |  |  |  | PASS / FAIL |  |
| AT-MA-002 |  |  |  | PASS / FAIL |  |
| AT-MA-003 |  |  |  | PASS / FAIL |  |
| AT-MA-004 |  |  |  | PASS / FAIL |  |
| AT-MA-005 |  |  |  | PASS / FAIL |  |
| AT-MA-006 |  |  |  | PASS / FAIL |  |
| AT-MA-007 |  |  |  | PASS / FAIL |  |
| AT-MA-008 |  |  |  | PASS / FAIL |  |
| AT-OB-003 |  |  |  | PASS / FAIL |  |
| AT-NF-011 |  |  |  | PASS / FAIL |  |

# **APPENDIX B — RECOMMENDED TOOLING SETUP**

## **B.1  Unit Tests (Vitest)**

All UNIT layer scenarios should be implemented as Vitest test suites. The following structure is recommended:

// tests/unit/dataModel.test.tsimport { describe, it, expect } from 'vitest';import { validateMindMap, validateBranch } from '@/domain/validation';describe('AT-DM-001: MindMap requires a Central Image', () \=\> {  it('rejects a map with no centralImage', () \=\> {    const map \= buildMap({ centralImage: undefined });    const result \= validateMindMap(map);    expect(result.valid).toBe(false);    expect(result.errors\[0\].code).toBe('CENTRAL\_IMAGE\_REQUIRED');  });});

## **B.2  Visual Regression Tests (Playwright \+ Percy)**

// tests/visual/canvas.spec.tsimport { test } from '@playwright/test';import { percySnapshot } from '@percy/playwright';test('AT-RE-002: branches are curved Bézier paths', async ({ page }) \=\> {  await page.goto('/map/test-fixture-simple');  await page.waitForSelector('\[data-testid="canvas-ready"\]');  await percySnapshot(page, 'Branch curve rendering');  // Percy diffs against baseline; fail threshold 0.1%});

## **B.3  End-to-End Tests (Playwright)**

// tests/e2e/enforcement.spec.tsimport { test, expect } from '@playwright/test';test('AT-LE-060a: multi-word triggers Clarity Modal', async ({ page }) \=\> {  await page.goto('/map/new');  await page.click('\[data-testid="add-branch"\]');  await page.fill('\[data-testid="keyword-input"\]', 'good morning');  await page.keyboard.press('Enter');  await expect(page.locator('\[data-testid="clarity-modal"\]')).toBeVisible();  await expect(page.locator('\[data-testid="clarity-modal-title"\]'))    .toContainText("Buzan's Law: One keyword per branch");});

## **B.4  Test Data & Fixtures**

A set of standard .bmm fixture files must be created and version-controlled. These are the authoritative test maps used across multiple scenarios:

| fixture-empty.bmm | A map with only a Central Image and no branches |
| :---- | :---- |
| **fixture-simple.bmm** | One Central Image \+ 4 BOIs \+ 2 sub-branches each |
| **fixture-500-nodes.bmm** | 500 nodes across 14 depth levels (performance testing) |
| **fixture-non-compliant.bmm** | Multiple Buzan law violations for enforcement testing |
| **fixture-group-map.bmm** | Group map with 3 participants and 20 branches |
| **fixture-review-due.bmm** | A map with all 6 review dates set to the past (review testing) |

## **B.5  CI/CD Integration**

The following pipeline is recommended. All gates must pass before a merge to main:

* Stage 1 — Unit Tests: vitest run (target: \< 30 seconds)

* Stage 2 — E2E Tests: playwright test (target: \< 8 minutes)

* Stage 3 — Visual Tests: percy exec \-- playwright test (requires Percy token)

* Stage 4 — Manual Gate: Jira/Linear ticket with MANUAL test log attached, approved by QA lead

* Stage 5 — Coverage Check: Coverage matrix must have zero PENDING items for MUST requirements before release

*End of Document — Buzan Mind Mapping Software Acceptance Test Suite v1.0*

*'Memory works by an activation process, which spreads from word to associated word via these links.' — Anderson & Perlmutter (cited by Buzan)*