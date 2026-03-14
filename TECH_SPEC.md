**TECHNICAL SPECIFICATIONS DOCUMENT**

**Buzan Mind Mapping Software**

*Embodying, Enforcing, and Teaching Tony Buzan's Principles of Radiant Thinking*

| Document Version | 1.0 — Initial Release |
| :---- | :---- |
| **Prepared For** | Software Development Team |
| **Conceptual Basis** | The Mind Map Book — Tony Buzan with Barry Buzan (Dutton, 1994\) |
| **Document Status** | Specification — Not for Implementation Without Review |
| **Target Platforms** | Web (Primary), Desktop (Electron), Mobile (iOS / Android) |
| **Compliance Framework** | Buzan Mind Map Laws (Technique \+ Layout) \+ Recommendations |

This document provides the complete functional, technical, and experiential specifications required to build a software application that faithfully embodies Tony Buzan's Mind Mapping methodology. Every design and engineering decision described herein is grounded directly in Buzan's documented laws, recommendations, and rationale. The system is designed not only to allow users to create Mind Maps, but to actively teach, encourage, and enforce correct Buzan technique throughout the user experience.

# **1\.  INTRODUCTION & PURPOSE**

## **1.1  Product Vision**

This software is not a generic diagramming tool with an optional radial layout. It is a dedicated Mind Mapping environment that treats Tony Buzan's laws as first-class constraints — enforcing them where necessary, nudging users toward them wherever possible, and always teaching the rationale behind each law so users internalise Buzan's methodology rather than merely comply with it.

The system should be conceived as a digital companion to The Mind Map Book: a tool that a complete beginner can open with zero prior knowledge and, through guided interaction, emerge from as a proficient Radiant Thinker. Equally, it must be powerful enough to satisfy advanced practitioners who need features such as Mega Mind Maps, Group Mind Maps, and review scheduling.

## **1.2  Scope of This Document**

This specification covers:

* The core canvas and rendering engine

* The data model for nodes, branches, and maps

* Buzan Law Enforcement and the Coaching System

* Color, image, and typography management

* Hierarchy, numerical ordering, and BOI (Basic Ordering Ideas) tooling

* The learning and onboarding subsystem

* Collaboration / Group Mind Map features

* The review and reinforcement (spaced repetition) system

* Export, import, and integration

* Accessibility and internationalization

* Non-functional requirements (performance, security, scalability)

Implementation choices (frameworks, languages, cloud providers) are intentionally left to the development team unless a requirement directly constrains them.

## **1.3  Foundational Reference**

All behavioural requirements in this document trace back to one or more of the following sources within The Mind Map Book:

* The Laws of Technique: Use Emphasis · Use Association · Be Clear · Develop a Personal Style

* The Laws of Layout: Use Hierarchy · Use Numerical Order

* The Recommendations: Break Mental Blocks · Reinforce · Prepare

* The rationale chapters for each law (Chapters 10–11)

* Application chapters: Creative Thinking, Group Mind Maps, Memory, Problem-Solving, Computer Mind Mapping (Chapters 16–17, 24, 28\)

*📌  Wherever a requirement uses the phrase 'Buzan-compliant', it means the behaviour satisfies at least one named law or recommendation from the sources above.*

# **2\.  CORE CONCEPTS & TERMINOLOGY**

All internal naming conventions, user-facing labels, and help text must use Buzan's own vocabulary consistently. The table below is authoritative.

| Term | Definition (Buzan-authoritative) |
| :---- | :---- |
| **Central Image** | The visual element placed at the exact centre of every Mind Map. Must be an image, not a word. Uses at minimum 3 colours and incorporates dimension. This is the mandatory anchor of all Radiant Thinking. |
| **Branch** | A curved, organic line radiating from the Central Image or from a parent node. Central branches are thicker; branches grow thinner as they extend outward. Branch length equals the length of the keyword placed on it. |
| **Basic Ordering Idea (BOI)** | The primary level of branches directly attached to the Central Image. These are the most powerful keywords — equivalent to chapter headings. Each BOI inherits a unique colour that propagates to all its sub-branches. |
| **Keyword** | The single word printed on a branch. Buzan mandates one keyword per branch line. Printed (not cursive) characters. Upper and lower case used to signal relative importance. |
| **Sub-branch** | Any branch attached to a BOI or to another sub-branch. Inherits the colour of its parent BOI. Thinner than its parent branch. |
| **Radiant Structure** | The overall topology: everything radiating outward from a centre in all directions simultaneously, like neuronal dendrites or the branches of a tree. |
| **Association** | The cognitive connection between any two nodes. Represented by arrows, codes, or colours. The fundamental mechanism of memory and creativity according to Buzan. |
| **Code** | A symbol, shape, colour tag, tick, cross, or icon applied to a branch or node to enable instant cross-map connections and category identification. |
| **Boundary** | A curved outline that 'embraces' a completed BOI branch cluster. Creates a memorable shape that aids recall and chunk-based memorisation. |
| **BOI Question Set** | The prompts used to surface BOIs: What knowledge is required? What are the chapter headings? Why / What / Where / Who / How / Which / When? |
| **C1+ Rule** | Buzan's personal development principle: every Mind Map should be slightly more colourful, more three-dimensional, more image-rich, more associatively logical, and/or more beautiful than the previous one. |
| **Mega Mind Map** | A Mind Map of great scale and depth (Buzan notes up to 14 hierarchical levels) managed through zoom, branch-as-new-centre pivot, and linked sub-maps. |
| **Group Mind Map** | A Mind Map collaboratively constructed by two or more individuals, used to generate consensus, pool thinking, and reach collective decisions. |
| **Review Schedule** | Buzan's empirically derived intervals for reinforcing a Mind Map in long-term memory: 10–30 min · 1 day · 1 week · 1 month · 3 months · 6 months after creation. |
| **Synaesthesia** | The deliberate engagement of multiple senses (sight, hearing, smell, taste, touch, kinaesthesia) within images and keywords to maximise memorability. |

# **3\.  DATA MODEL**

## **3.1  MindMap Entity**

Each Mind Map is a persistent entity with the following top-level fields:

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **DM-001** | **MUST** | id: UUID — globally unique identifier |
| **DM-002** | **MUST** | title: String — human-readable map name (separate from the Central Image) |
| **DM-003** | **MUST** | centralImage: ImageNode — the mandatory central visual anchor |
| **DM-004** | **MUST** | bois: Array\<BranchNode\> — the top-level BOI branches (typically 4–7) |
| **DM-005** | **MUST** | orientation: Enum {LANDSCAPE} — maps are always landscape; the system must enforce this |
| **DM-006** | **MUST** | canvasSize: { width: Float, height: Float } — logical canvas dimensions in points |
| **DM-007** | **MUST** | colorPalette: Array\<HexColor\> — the active color set for this map (min 3 colours) |
| **DM-008** | **MUST** | numericalOrder: Array\<BranchRef\> — optional ordered list of branch references for sequencing |
| **DM-009** | **MUST** | createdAt / updatedAt: ISO8601 timestamps |
| **DM-010** | **SHOULD** | reviewSchedule: ReviewScheduleEntity — spaced-repetition reminders linked to this map |
| **DM-011** | **SHOULD** | tags: Array\<String\> — user-defined classification tags |
| **DM-012** | **SHOULD** | isGroupMap: Boolean — flags the map as a collaborative Group Mind Map |
| **DM-013** | **MAY** | linkedMaps: Array\<MapRef\> — references to sub-maps (for Mega Mind Map branch expansion) |

## **3.2  BranchNode Entity**

A BranchNode represents any branch at any depth — BOI, sub-branch, or deeper level. The same schema is used at all levels; hierarchy is determined by the parent reference.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **DM-020** | **MUST** | id: UUID |
| **DM-021** | **MUST** | parentId: UUID | null — null for BOI (directly attached to Central Image) |
| **DM-022** | **MUST** | keyword: String — exactly ONE word; validation enforces this |
| **DM-023** | **MUST** | isUpperCase: Boolean — BOIs and emphasis nodes are printed in capitals |
| **DM-024** | **MUST** | color: HexColor — inherited from the BOI ancestor; overridable only in Personal Style mode |
| **DM-025** | **MUST** | lineThickness: Float — decreases with depth; BOIs have max thickness |
| **DM-026** | **MUST** | isCurved: Boolean — branches must default to curved/organic; straight lines disallowed as default |
| **DM-027** | **MUST** | length: Float — must equal the rendered pixel width of the keyword text |
| **DM-028** | **MUST** | angle: Float (radians) — angular position on the canvas |
| **DM-029** | **MUST** | depth: Integer — 0 \= BOI, 1 \= sub-branch, etc. Maximum supported depth: 14 |
| **DM-030** | **SHOULD** | image: ImageAsset | null — optional image attached to this branch |
| **DM-031** | **SHOULD** | hasBoundary: Boolean — whether a boundary outline is drawn around this branch cluster |
| **DM-032** | **SHOULD** | boundaryShape: SVGPath | null — custom boundary shape data |
| **DM-033** | **SHOULD** | numericalOrder: Integer | null — for sequencing output |
| **DM-034** | **SHOULD** | codes: Array\<CodeSymbol\> — ticks, crosses, stars, custom shapes, etc. |
| **DM-035** | **MAY** | linkedMapId: UUID | null — expands this branch into a full sub-map (Mega Mind Map) |
| **DM-036** | **MAY** | blankLine: Boolean — an intentional empty placeholder branch to prompt associations |

## **3.3  ImageNode / ImageAsset**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **DM-040** | **MUST** | Central Image must support: minimum 3 fill colours, 2.5D dimension rendering (shadow/depth), user-drawn or library-sourced images |
| **DM-041** | **MUST** | Inline branch images: any raster or vector asset, resizeable, positioned on or adjacent to a branch |
| **DM-042** | **MUST** | User-drawn images: the system must provide a drawing tool (pen, brush, shapes) for freehand creation, honouring Buzan's principle that skill improves with practice |
| **DM-043** | **SHOULD** | Image library: curated set of common Buzan-recommended image archetypes (sun, brain, rocket, plant, etc.) |
| **DM-044** | **SHOULD** | Dimension indicator: a toggle that adds automatic drop-shadow or 3D-extrusion effect to any image, satisfying Buzan's 'Use dimension' law |

## **3.4  Arrow / Association Entity**

Arrows explicitly encode cross-branch associations — one of Buzan's named association tools.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **DM-050** | **MUST** | sourceNodeId / targetNodeId: UUID — connects any two nodes anywhere in the map |
| **DM-051** | **MUST** | directionality: Enum {UNI, MULTI, BIDIRECTIONAL} — Buzan notes arrows 'can be uni-directional, multi-headed' |
| **DM-052** | **MUST** | arrowStyle: { size, form, dimension } — must support at least 3 visual variants |
| **DM-053** | **SHOULD** | label: String | null — optional keyword label on the arrow |
| **DM-054** | **SHOULD** | color: HexColor — should default to a neutral or the source-node colour |

## **3.5  CodeSymbol Entity**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **DM-060** | **MUST** | symbol: String | SVGIcon — ticks, crosses, circles, triangles, underlines, or custom user-defined shapes |
| **DM-061** | **MUST** | color: HexColor — codes can have independent colours |
| **DM-062** | **SHOULD** | globalCodeLibrary: allows users to define named codes reused across maps (e.g. 'Action Item', 'Priority', 'Person') |

# **4\.  BUZAN LAW ENFORCEMENT SYSTEM**

The enforcement system is the most critical differentiator of this product. It must be deeply integrated into the editing experience — not a post-hoc linter. The system operates on three levels:

* BLOCK: prevents an action that would produce an inherently invalid Mind Map

* WARN: flags a deviation with a contextual explanation of the relevant Buzan law and why it matters

* COACH: proactively suggests improvements based on the C1+ rule and the law rationale

*📌  Tone of all enforcement messages must be encouraging, not punitive. Buzan emphasises positive mental attitude and commitment to the map. Error messages must explain WHY the law exists (the rationale) alongside the correction.*

## **4.1  Law 1 — Use Emphasis**

### **4.1.1  Central Image**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-001** | **MUST** | BLOCK creation of any map without a Central Image. The onboarding flow must begin with a prompt to create the Central Image before any branches can be drawn. |
| **LE-002** | **MUST** | BLOCK placement of a plain text node (word-only) as the Central Image without first converting it to a visual image. If the user insists on a word, the system must apply automatic dimension (drop-shadow \+ multiple colours) and display the coaching message: 'Buzan recommends always using an image at the centre. An image focuses the eye, triggers associations, and is far more memorable than a word. We have applied dimension and colour to help — but consider drawing an image instead\!' |
| **LE-003** | **MUST** | WARN if the Central Image uses fewer than 3 distinct colours. Message: 'Your Central Image uses only {n} colour(s). Buzan recommends 3 or more colours to stimulate memory and creativity and escape monotone monotony.' |
| **LE-004** | **SHOULD** | COACH the user to add dimension to the Central Image if none is present after 30 seconds of editing. Message: 'Tip: Adding dimension (shadow or depth) to your central image makes it stand out — and whatever stands out is more easily remembered.' |

### **4.1.2  Images Throughout the Map**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-010** | **MUST** | WARN if a map has more than 8 branches and zero inline images (excluding the Central Image). Message: 'Your map is growing — great\! Buzan strongly recommends placing images on branches, not just the centre. Images trigger associations and multiply your intellectual power. Try adding one now.' |
| **LE-011** | **SHOULD** | COACH the addition of dimension to branch images if none are three-dimensional after 5 new branches. |
| **LE-012** | **SHOULD** | Track an 'image density ratio' (images / branches) and display it in an optional Buzan Health Panel. |

### **4.1.3  Colour Usage**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-020** | **MUST** | BLOCK assigning the same colour to two adjacent BOIs. Each BOI must have a unique colour. WARN message explains: 'Buzan assigns distinct colours to each main branch so your brain can instantly distinguish categories and their sub-branches, accelerating both creativity and recall.' |
| **LE-021** | **MUST** | WARN if the entire map uses fewer than 3 distinct colours. Message: 'Buzan identifies colour as one of the most powerful tools for memory and creativity. A monochrome map is visually boring and actively impedes recall.' |
| **LE-022** | **MUST** | Automatically inherit BOI colour to all child branches of that BOI. This is a core structural rule, not optional. |
| **LE-023** | **SHOULD** | Provide a colour-blindness accessibility mode that pairs each colour with a distinct texture or pattern, maintaining Buzan's colour-differentiation intent for all users. |

### **4.1.4  Size Variation**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-030** | **MUST** | BOI keywords must render visibly larger than sub-branch keywords. Default size ratio: BOI keyword ≥ 1.5× sub-branch. The system must enforce this visually even if the user does not manually set sizes. |
| **LE-031** | **MUST** | Branch line thickness must decrease proportionally with depth. BOI branches are the thickest. The system must auto-calculate thickness from depth and disallow equal-thickness branches across all levels. |
| **LE-032** | **SHOULD** | Provide a keyboard shortcut to manually increase keyword size on any node, with a note that size signals importance in Buzan's hierarchy. |

### **4.1.5  Spacing**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-040** | **MUST** | Branches must not visually overlap when auto-laid out. The layout engine must apply Buzan's 'organised spacing' — each branch and its cluster has breathing room. |
| **LE-041** | **SHOULD** | Display a spacing health indicator if two branches are within a defined minimum distance threshold. |
| **LE-042** | **SHOULD** | Provide an 'Auto-Balance Spacing' action that redistributes branches evenly while maintaining their angular relationships. |

## **4.2  Law 2 — Use Association**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-050** | **MUST** | The system must provide a first-class 'Draw Arrow' tool for creating cross-branch associations. It must be prominently accessible (not buried in a sub-menu). |
| **LE-051** | **MUST** | Arrows must support: uni-directional, bidirectional, and multi-headed variants. |
| **LE-052** | **MUST** | COACH the user to add arrows if 10 or more branches exist and zero arrows have been drawn. Message: 'Did you know? Buzan uses arrows to reveal hidden connections across different branches of a Mind Map. Look for links between your ideas — connecting them supercharges both memory and creativity.' |
| **LE-053** | **MUST** | Provide a Code Library panel where users can define reusable codes (symbols \+ colours). Codes must be placeable on any node or branch. |
| **LE-054** | **SHOULD** | Highlight all branches sharing the same code when the user hovers a code in the Code Library (global association visualisation). |
| **LE-055** | **SHOULD** | Support 'Synaesthesia Tags' — optional multi-sensory labels (sight, sound, smell, taste, touch, kinaesthesia) attachable to any branch or image, following Buzan's rationale that sensory memory greatly enhances recall. |

## **4.3  Law 3 — Be Clear**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-060** | **MUST** | BLOCK entry of more than one word as a branch keyword. If the user types a phrase (space-separated words), the system must trigger the Clarity Modal: 'Buzan's Law: One keyword per branch. Each word has thousands of associations. Placing one per line gives each idea room to radiate freely — just like giving a limb extra joints. Would you like to: \[Split into multiple branches\] or \[Keep as one word\]?' Splitting must automatically create sibling branches for each word. |
| **LE-061** | **MUST** | BLOCK cursive/handwriting fonts as the default keyword font. Printed (sans-serif) fonts only. Rationale tooltip: 'Printed letters have a more defined shape and are easier for the mind to photograph and recall.' |
| **LE-062** | **MUST** | Enforce landscape orientation. If the user attempts to switch to portrait, BLOCK with: 'Buzan recommends the horizontal (landscape) orientation — it gives more freedom and space, and a horizontal Mind Map is easier to read.' |
| **LE-063** | **MUST** | Branch line length must automatically equal the rendered pixel width of its keyword. This must be recalculated on every keyword edit. |
| **LE-064** | **MUST** | Branch lines must connect to other branch lines (parent–child relationship) — no floating disconnected branches. |
| **LE-065** | **MUST** | Central branches must be visually thicker than all other branches. This must be enforced programmatically. |
| **LE-066** | **MUST** | Keyword printing must remain as upright as possible. For branches that sweep below the horizontal axis, keywords must be flipped/rotated to maintain legibility. WARN if any keyword is rendered at an angle exceeding 45° from upright: 'Buzan recommends keeping your printing as upright as possible for easier reading.' |
| **LE-067** | **MUST** | WARN if a map has no images and more than 12 branches. Clarity and visual richness are both laws. |
| **LE-068** | **SHOULD** | Provide a 'Clarity Score' in the Buzan Health Panel — a 0–100 metric that tracks compliance with the Be Clear law group. |

## **4.4  Law 4 — Develop a Personal Style**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-070** | **MUST** | After a user completes their first 3 maps, unlock 'Personal Style Mode', which allows controlled overrides of colour assignments while maintaining the spirit of the laws. |
| **LE-071** | **MUST** | Implement the C1+ Tracker: after each saved map, display a comparison with the user's previous map on colour count, image count, arrow count, boundary count, and keyword diversity. Celebrate improvements. |
| **LE-072** | **SHOULD** | Provide an 'Inspiration Gallery' of canonical Buzan-style example maps (cleared for use) that users can browse to develop their visual vocabulary. |
| **LE-073** | **SHOULD** | Track a 'Style Progress' score across a user's lifetime maps and display it on a personal dashboard. |
| **LE-074** | **MAY** | Allow users to publish their best maps to a community gallery with opt-in sharing. |

## **4.5  Layout Law 1 — Use Hierarchy**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-080** | **MUST** | BOI branches must be visually and structurally distinguished from sub-branches at all times (thickness, font size, colour saturation). |
| **LE-081** | **MUST** | Provide a 'Find BOIs' wizard: when the user creates a new map, prompt with the BOI Question Set ('What knowledge is required?', 'What would the chapter headings be?', 'Why / What / Where / Who / How / Which / When?') to help them identify their primary branches before they start. |
| **LE-082** | **MUST** | WARN if all branches are at the same depth (flat structure with no sub-branches). Message: 'Buzan recommends using hierarchy. A hierarchical structure is far more memorable than a flat list — it mirrors how your brain naturally categorises information.' |
| **LE-083** | **MUST** | Support branch boundaries — when the user marks a BOI cluster as 'complete', offer to auto-draw a boundary outline around it. Explain: 'Boundaries create unique shapes that your brain uses as visual chunks — dramatically improving recall.' |
| **LE-084** | **SHOULD** | Provide a 'BOI Strength Meter' per branch showing how many levels of hierarchy it supports. |

## **4.6  Layout Law 2 — Use Numerical Order**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **LE-090** | **MUST** | Provide a first-class 'Sequence Mode' where branches can be drag-ranked or numbered. Numbers are overlaid on branches, not embedded in keywords. |
| **LE-091** | **MUST** | The numerical order must be storable and presentable as a separate linear outline (export feature) without altering the Mind Map itself. |
| **LE-092** | **SHOULD** | Allow alphabetical ordering as an alternative to numerical, per Buzan's own suggestion. |
| **LE-093** | **SHOULD** | Sequence Mode must support assigning time or weight to each numbered branch for presentation or speech planning. |

# **5\.  CANVAS & RENDERING ENGINE**

## **5.1  Rendering Architecture**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **RE-001** | **MUST** | The canvas must be implemented using a vector-based renderer (SVG or WebGL/Canvas 2D) capable of smooth zoom from 10% to 400% without loss of quality. |
| **RE-002** | **MUST** | All branch lines must be rendered as cubic Bézier curves by default (organic, not straight). A straight-line option must exist but must not be the default. |
| **RE-003** | **MUST** | The rendering engine must support: curved branch lines, variable line thickness, keyword labels on lines, inline images, arrow overlays, boundary outlines, and code symbols simultaneously. |
| **RE-004** | **MUST** | Landscape canvas is the only valid orientation. The canvas must default to a 16:9 or wider aspect ratio. |
| **RE-005** | **MUST** | Auto-layout engine: when a new branch is added, the engine must automatically distribute branches radially to avoid overlap while respecting existing manual positions. |
| **RE-006** | **MUST** | The layout engine must support Buzan's 'organised spacing' — consistent spacing between branch clusters. |
| **RE-007** | **MUST** | Zoom with 'map-in-map' miniature viewport: when zoomed into a Mega Mind Map, a small inset thumbnail always shows the full map with the current viewport highlighted. |
| **RE-008** | **SHOULD** | Animate branch growth on creation — branches should organically 'grow' from the parent in 150–300ms to reinforce the organic, living-tree metaphor Buzan uses throughout the book. |
| **RE-009** | **SHOULD** | Support 14 hierarchical depth levels without performance degradation on a map with 500+ nodes. |
| **RE-010** | **SHOULD** | Dark mode canvas: optional dark background for reduced eye strain in extended sessions. |

## **5.2  Central Image Rendering**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **RE-020** | **MUST** | The Central Image occupies the geometric centre of the canvas at all zoom levels. |
| **RE-021** | **MUST** | The Central Image renderer must support: raster images, SVG vectors, user-drawn freehand artwork, and text-converted-to-image (with dimension applied). |
| **RE-022** | **MUST** | The system must enforce a minimum Central Image size relative to the canvas (no smaller than 8% of canvas diagonal). |
| **RE-023** | **MUST** | All BOI branches must visually connect to the boundary of the Central Image, not to a fixed centre point. |
| **RE-024** | **SHOULD** | Central Image supports a drop-shadow and/or extrusion layer toggle to implement Buzan's 'dimension' requirement. |

## **5.3  Branch Physics & Line Rules**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **RE-030** | **MUST** | Line thickness scale: BOI lines \= 4–6pt; Depth-1 sub-branches \= 2–3pt; Depth-2+ \= 0.5–1.5pt (exact values configurable in system settings but ratios enforced). |
| **RE-031** | **MUST** | Branch line length must equal the keyword text width (measured in pixels at the current zoom level) and must reflow dynamically when the keyword is edited. |
| **RE-032** | **MUST** | Sub-branches must connect to the parent branch at a natural junction point, not at the parent's keyword. |
| **RE-033** | **SHOULD** | Support 'organic' branch shapes: slight natural variation in curve paths (like hand-drawn branches) configurable as a global style setting. |

## **5.4  Mega Mind Map Features**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **RE-040** | **MUST** | Zoom facility: any area of the map can be enlarged with a lossless zoom. 'Zoom within zoom' (zoom into an already-zoomed area) must be supported. |
| **RE-041** | **MUST** | Branch Pivot: any branch or sub-branch can be promoted to become a new Central Image, with all other map elements arranged relative to the new centre. The original map is preserved and accessible. |
| **RE-042** | **MUST** | Branch-as-Sub-Map: any branch can be expanded into a full new Mind Map (sub-map), linked to the original. The link is shown visually on the parent map as a special icon on the branch. |
| **RE-043** | **SHOULD** | Sub-maps are accessible via click-through on the link icon, with navigation breadcrumbs showing the map hierarchy. |

# **6\.  EDITING EXPERIENCE**

## **6.1  Input Methods**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **ED-001** | **MUST** | Mouse / trackpad: click-to-add-branch, drag-to-reposition, scroll-to-zoom, double-click-to-edit-keyword. |
| **ED-002** | **MUST** | Keyboard: Tab to add a child branch, Enter to add a sibling branch, Delete/Backspace to remove a branch, Escape to cancel editing. |
| **ED-003** | **MUST** | Touch / stylus: pinch-to-zoom, tap-to-select, tap-and-hold for contextual menu, drag-to-reposition. |
| **ED-004** | **SHOULD** | Pen/stylus pressure sensitivity: thicker strokes for branch lines when drawn with greater pressure. |
| **ED-005** | **SHOULD** | Voice input: speech-to-keyword with one-word enforcement (multi-word input triggers the Clarity Modal). |

## **6.2  Blank Line Feature**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **ED-010** | **MUST** | Implement Buzan's 'Add Blank Line' as a first-class action. A blank branch is a visual placeholder that challenges the brain to fill in an association. |
| **ED-011** | **MUST** | Blank lines must be visually distinct (dashed or ghost-style) so the user knows they are intentional placeholders. |
| **ED-012** | **MUST** | When the user clicks a blank branch, the system surfaces the coaching message: 'Buzan's Technique: Blank branches challenge your brain to complete what has been left unfinished, tapping into your infinite associative power. What comes to mind?' |

## **6.3  Contextual Coaching Panels**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **ED-020** | **MUST** | A non-blocking coaching sidebar (collapsible) shows real-time tips relevant to the user's current action. Tips are keyed to specific Buzan laws and rationale. |
| **ED-021** | **MUST** | Coaching messages must never be modal interruptions during creative flow (exception: first-time actions that introduce a new law). |
| **ED-022** | **MUST** | Each coaching message must include a one-click 'Learn why' link that opens a concise explanation of the relevant Buzan law with a visual example. |
| **ED-023** | **SHOULD** | Coaching messages graduate over time: beginners see fuller explanations; experienced users (post-50 maps) see terse reminders only. |
| **ED-024** | **SHOULD** | 'Ask Buzan' quick-help button: a chatbot-style assistant that answers questions about Mind Mapping technique using Buzan's own principles as the knowledge base. |

## **6.4  Mental Block Tools**

Buzan identifies mental blocks as a normal and temporary state. The system must treat them as a UX scenario, not an error.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **ED-030** | **MUST** | 'I'm Stuck' button: prominently accessible at all times. Triggers the Mental Block Panel, which offers: (1) Add blank lines, (2) Surface the BOI Question Set, (3) Add a random image to the map, (4) Pivot to a branch as new centre (for fresh perspective). |
| **ED-031** | **MUST** | Mini-Mind Map burst: the user can quickly create a temporary 10-branch free-association cloud from any stuck node. Associations can then be dragged into the main map. |
| **ED-032** | **SHOULD** | 'Random Stimulus' generator: produces a random word or image (the classic Buzan creativity technique) alongside the stuck branch to trigger new associations. |

## **6.5  Undo / Redo & History**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **ED-040** | **MUST** | Unlimited undo/redo within a session. |
| **ED-041** | **MUST** | Version history: named snapshots of a map state (e.g., 'After brainstorm', 'Final review'). |
| **ED-042** | **SHOULD** | Visual diff between two versions of the same map. |

# **7\.  COLOUR SYSTEM**

Colour in Buzan's methodology is not aesthetic decoration — it is a cognitive tool for memory, creativity, and association. The colour system must encode this purpose at every level.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **CS-001** | **MUST** | Each Mind Map has an active colour palette of at least 3, and typically 6–12, distinct colours. |
| **CS-002** | **MUST** | The palette must be assigned so that each BOI receives a unique colour. The system auto-assigns on BOI creation if no manual colour is chosen. |
| **CS-003** | **MUST** | BOI colour propagates automatically to all descendant sub-branches. This creates the visual 'family' structure Buzan describes. |
| **CS-004** | **MUST** | The Central Image must use at least 3 colours. This is enforced (see LE-003). |
| **CS-005** | **MUST** | Provide a colour picker that surfaces: preset Buzan-recommended palettes (vibrant, high-contrast), a full HSL picker, and recently used colours. |
| **CS-006** | **MUST** | Support colour coding for cross-map associations: assigning the same colour to nodes in different BOIs explicitly signals a relationship. |
| **CS-007** | **SHOULD** | Buzan Palette presets: 5–8 curated palettes designed to maximise contrast and memorability, named after Buzan's principles (e.g., 'Radiant', 'Cortical', 'Synaesthesia'). |
| **CS-008** | **SHOULD** | Colour Health Warning: if more than 3 branches share the same colour without being in the same BOI family, WARN: 'Colour should encode relationships. Using the same colour across unrelated branches may create confusing associations.' |
| **CS-009** | **SHOULD** | Colour-blindness accessibility mode: auto-replaces problematic colour combinations with accessible alternatives while maintaining the multi-colour requirement. |
| **CS-010** | **MAY** | AI-assisted colour suggestion: based on the map topic and existing colours, suggest additional palette colours that maximise visual contrast. |

# **8\.  TYPOGRAPHY & KEYWORD SYSTEM**

Buzan's keyword rules are precise and each has a cognitive rationale. The typography system must enforce these rules while remaining visually appealing.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **TY-001** | **MUST** | Default font must be a clear, printed (non-cursive) sans-serif typeface. Rationale: 'Printed letters have a more defined shape and are therefore easier for the mind to photograph.' |
| **TY-002** | **MUST** | Keywords at BOI level must default to UPPER CASE. Sub-branch keywords default to Title Case or lower case. This signals hierarchy through typography. |
| **TY-003** | **MUST** | Font size must decrease with branch depth. Auto-sizing must be the default; manual overrides permitted. |
| **TY-004** | **MUST** | No multi-word keyword is valid. If a user types two words separated by a space and confirms, the Clarity Modal fires (see LE-060). |
| **TY-005** | **MUST** | Keyword text must always render as upright as possible, even on steeply angled branches. Branches below the horizontal must flip the keyword to maintain readability. |
| **TY-006** | **MUST** | Font rendering must remain crisp at all zoom levels (vector text, not rasterised). |
| **TY-007** | **SHOULD** | Provide 3–5 Buzan-approved font choices. All must be printed, readable, and non-decorative. |
| **TY-008** | **SHOULD** | 'Power Word' highlighting: allow users to mark a keyword as a BOI-level power word, which renders it in a larger, bolded style to indicate its status as a high-level category. |
| **TY-009** | **SHOULD** | Keyword suggestions: as the user types, offer synonym suggestions that may be stronger BOIs (drawing on a thesaurus and BOI question patterns). |

# **9\.  HIERARCHY & BOI (BASIC ORDERING IDEAS) SYSTEM**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **HI-001** | **MUST** | BOI Wizard: triggered on new map creation and accessible any time. Presents the 7 BOI questions and allows the user to draft their main branches before touching the canvas. |
| **HI-002** | **MUST** | The system must visually distinguish depth levels consistently: BOI (depth 0), primary sub-branches (depth 1), secondary (depth 2), etc., through line thickness, font size, and optional colour saturation gradient. |
| **HI-003** | **MUST** | Provide a 'Hierarchy Outline View' panel: a collapsible tree outline of the map that mirrors the hierarchy without the visual canvas. Edits in the outline view reflect in the canvas and vice versa. |
| **HI-004** | **MUST** | Warn if a map has BOIs but no sub-branches after 5 minutes of editing. Message: 'Your BOIs are defined — now let ideas radiate from them\! Buzan finds that once a hierarchy is in place, ideas flow naturally at speed.' |
| **HI-005** | **SHOULD** | 'Promote' and 'Demote' branch actions: promote a sub-branch to BOI status (inheriting its own colour), or demote a BOI to a sub-branch under another BOI. |
| **HI-006** | **SHOULD** | Chunking visualisation: show how many nodes are grouped under each BOI (chunk size). Buzan notes that chunking enables short-term memory to hold far more information. |
| **HI-007** | **MAY** | Auto-suggest BOI groupings: if the user has a flat map of 10+ keywords, the system can suggest candidate groupings based on semantic similarity. |

# **10\.  ONBOARDING & LEARNING SYSTEM**

Buzan's three-stage learning model — Accept · Apply · Adapt — must be directly reflected in the onboarding and progression system.

## **10.1  Stage 1: Accept (Guided First Maps)**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **OB-001** | **MUST** | New users must complete a guided tutorial map before accessing free creation. The tutorial teaches: Central Image, BOIs, keywords, colour, images, arrows, and boundaries — in that order. |
| **OB-002** | **MUST** | Each tutorial step must display the specific Buzan law it is teaching, the rationale in Buzan's own terms, and a visual before/after example. |
| **OB-003** | **MUST** | Tutorial maps must be completable in under 15 minutes. |
| **OB-004** | **MUST** | Users must not be able to proceed to the next tutorial step until they have correctly applied the current law. |
| **OB-005** | **SHOULD** | Provide 3 tutorial themes (personal, academic, professional) so users immediately connect Mind Mapping to their own context. |

## **10.2  Stage 2: Apply (Structured Practice)**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **OB-010** | **MUST** | After completing the tutorial, the system sets a goal: 'Buzan recommends creating a minimum of 100 Mind Maps while applying the laws. Your progress: 0/100.' This tracker is visible on the home screen. |
| **OB-011** | **MUST** | Each map creation session includes a pre-session intention prompt ('What will you Mind Map today?') and a post-session reflection ('What was the most surprising association you discovered?'). |
| **OB-012** | **SHOULD** | The system offers 10 structured practice challenges (e.g., 'Create a Mind Map with at least 6 BOIs and 3 images per branch', 'Create a Mind Map using all 7 BOI questions') that guide users through the full law set. |
| **OB-013** | **SHOULD** | Law Reference Cards: always-accessible reference panel showing all Buzan laws and recommendations in a quick-scan format. |

## **10.3  Stage 3: Adapt (Advanced Personalisation)**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **OB-020** | **MUST** | After 30+ maps, unlock 'Advanced Mode' which provides: the C1+ tracker, personal style controls, community gallery, and experimental features. |
| **OB-021** | **SHOULD** | Provide a 'Law Mastery' dashboard showing which laws the user consistently applies and which they neglect. |
| **OB-022** | **SHOULD** | Allow the user to share their 'signature' Mind Map style (palette, font, branch shape preferences) as a reusable theme. |

# **11\.  REVIEW & REINFORCEMENT SYSTEM**

Buzan's memory research is explicit: review at specific intervals converts short-term learning into long-term memory. This system is a core feature, not an optional add-on.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **RV-001** | **MUST** | Every saved Mind Map automatically generates a review schedule with 6 reminders: 10–30 minutes after creation · 1 day · 1 week · 1 month · 3 months · 6 months. |
| **RV-002** | **MUST** | Review notifications must be configurable (push, email, in-app) and must explain WHY reviewing at that interval matters: 'Reviewing now — 1 day after creating — is the most critical step for consolidating this map into long-term memory, according to Buzan's memory research.' |
| **RV-003** | **MUST** | At each review, the user is offered two options: (a) View the original map, or (b) Quick Mind Map Check — create a fresh recall map from memory, then compare with the original. |
| **RV-004** | **MUST** | Quick Mind Map Check: the user creates a new map from memory (blank canvas). After saving, the system overlays it with the original, highlighting missing branches and new ones added from memory. |
| **RV-005** | **SHOULD** | After the 6-month review, the map is flagged as 'Long-Term Memory' and moves to an archive, with an annual optional review. |
| **RV-006** | **SHOULD** | Review Dashboard: shows all maps due for review, overdue reviews, and a memory health score across all maps. |
| **RV-007** | **MAY** | Adaptive review spacing: if a user consistently recalls a map accurately in Quick Mind Map Checks, space out the remaining reviews. If recall is poor, add an intermediate review. |

# **12\.  GROUP MIND MAP SYSTEM**

Buzan dedicates a full chapter to Group Mind Maps, describing their use for meetings, brainstorming, and building a 'Meta-Mind' — a shared group intelligence greater than the sum of individual minds.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **GM-001** | **MUST** | Any map can be converted to a Group Mind Map, enabling simultaneous multi-user editing. |
| **GM-002** | **MUST** | Real-time collaborative editing: all participants see live cursors, branch additions, and keyword edits. |
| **GM-003** | **MUST** | A 'Facilitator' role: one participant controls which phase the session is in (Brainstorm Phase vs. Edit Phase). This maps directly to Buzan's note that computer Mind Mapping 'provides an excellent separation of the creative and editing parts of the process'. |
| **GM-004** | **MUST** | Brainstorm Phase: all participants can add branches freely. No editing, deleting, or moving of other participants' branches during this phase. This mirrors Buzan's 'do not discuss associations while doing the exercise' principle. |
| **GM-005** | **MUST** | Edit Phase: the facilitator opens collaborative editing — branches can be reorganised, merged, pruned, and promoted to BOIs by group vote. |
| **GM-006** | **MUST** | Each participant's contributions are colour-coded by their assigned participant colour during Brainstorm Phase. The map retains attribution information. |
| **GM-007** | **MUST** | The large-display mode: a presentation view of the Group Mind Map optimised for a shared screen (projector or large monitor) with simplified controls and high-contrast rendering. |
| **GM-008** | **MUST** | Group map outputs: participants can each receive a copy of the final map and, optionally, a linear outline (numerically ordered export) for action-item tracking. |
| **GM-009** | **SHOULD** | Remote participation: group maps accessible via web link, no installation required for guest participants. |
| **GM-010** | **SHOULD** | Voting/dot-voting on branches: participants can 'upvote' branches to signal priority, supporting the group decision-making process Buzan describes. |
| **GM-011** | **SHOULD** | Group map templates for specific contexts: Meeting Agenda, Creative Brainstorm, Problem-Solving (with pre-populated BOI suggestions per context). |
| **GM-012** | **MAY** | Async Group Mind Map: participants contribute branches asynchronously over a set period, then the facilitator schedules an Edit Phase session. |

# **13\.  BUILT-IN APPLICATION TEMPLATES**

Buzan documents many specific use cases. The software must ship with pre-configured templates that set up the canvas with appropriate BOI suggestions for each context.

| Template | Pre-set BOI Suggestions | Buzan Chapter Reference |
| :---- | :---- | :---- |
| **Note-Taking (Study)** | *Topic · Evidence · Questions · Key Terms · Examples · Connections* | Chapter 14 — Organising Other People's Ideas |
| **Creative Brainstorm** | *Free Association (no preset BOIs — blank template) · Random Stimulus* | Chapters 6, 7, 16 |
| **Problem-Solving** | *Problem · Causes · Solutions · Resources · Obstacles · Actions* | Chapter 19 — Problem-Solving |
| **Self-Analysis** | *Strengths · Weaknesses · Opportunities · Goals · Fears · Values* | Chapter 18 — Self-Analysis |
| **Meeting Agenda** | *Purpose · Decisions · Actions · People · Information · Timing* | Chapter 25 — Meetings |
| **Presentation Planning** | *Objective · Opening · Key Points · Evidence · Close · Q\&A* | Chapter 26 — Presentations |
| **Essay / Report** | *Introduction · Arguments · Counter-Arguments · Evidence · Conclusion* | Chapter 22 — Thinking |
| **Memory Task** | *Topic · Associations · Images · Stories · Hooks · Review* | Chapter 15 — Memory |
| **Teaching / Lesson** | *Learning Goal · Concepts · Examples · Activities · Assessment* | Chapter 23 — Teaching |
| **Mind Map Diary** | *Events · Feelings · Insights · People · Actions · Gratitude* | Chapter 20 — Mind Map Diary |
| **Decision Making** | *Options · Criteria · Pros · Cons · Gut Feeling · Choice* | Chapter 12 — Making Choices |
| **Group Brainstorm** | *Blank (Group Mode) — participants self-organise BOIs* | Chapter 17 — Group Mind Map |

# **14\.  EXPORT & IMPORT**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **EX-001** | **MUST** | Export as: SVG (lossless vector), PNG (configurable resolution), PDF (printable, landscape enforced) |
| **EX-002** | **MUST** | Export as Linear Outline: converts the numbered branch order into a structured text document (DOCX or Markdown) for speeches, essays, and reports — directly reflecting Buzan's use of numerical order. |
| **EX-003** | **MUST** | Export as: native format (.bmm — Buzan Mind Map, proprietary JSON schema documented in this spec) |
| **EX-004** | **SHOULD** | Export as: OPML (for outline interoperability with other tools) |
| **EX-005** | **SHOULD** | Export individual branch clusters as standalone sub-maps (for Mega Mind Map printing) |
| **EX-006** | **SHOULD** | Print mode: multi-page print with automatic map tiling for large Mega Mind Maps |
| **EX-007** | **SHOULD** | Import from: OPML, plain text outline (tab-indented), Markdown headings (converts hierarchy to branches) |
| **EX-008** | **MAY** | Import from: major competing mind-mapping formats (.mm, .xmind) with a compliance warning if imported maps violate Buzan laws |
| **EX-009** | **MAY** | PowerPoint/Keynote export: each BOI branch becomes a slide, with the Mind Map thumbnail on a summary slide |

# **15\.  BUZAN HEALTH PANEL**

The Buzan Health Panel is a persistent, collapsible sidebar providing real-time compliance analytics for the active map. It must be informative, non-intrusive, and educational.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **HP-001** | **MUST** | Display the following metrics: Central Image (present / compliant), Colour count (total distinct colours used), Image count (branch images), Arrow count, Keyword compliance (% single-word keywords), Hierarchy depth (max depth), BOI count, Blank line count |
| **HP-002** | **MUST** | Each metric must link to the relevant Buzan law and its rationale when clicked. |
| **HP-003** | **MUST** | A composite 'Radiant Score' (0–100) reflecting overall law compliance, weighted by law importance. Display as a visual indicator (e.g., a radial meter styled after the Mind Map topology). |
| **HP-004** | **SHOULD** | C1+ delta display: compare the current map's scores against the user's previous map and show directional improvement arrows. |
| **HP-005** | **SHOULD** | Quick fix buttons: for each failing metric, a one-click 'Fix' that opens the relevant tool (e.g., 'Add colour' opens the colour picker, 'Add image' opens the image panel). |
| **HP-006** | **SHOULD** | Law compliance history chart: shows the user's Radiant Score trend across their last 20 maps. |

# **16\.  WORKSPACE & ENVIRONMENT FEATURES**

Buzan dedicates specific recommendations to the physical and mental environment for Mind Mapping. Where software can replicate or reinforce these conditions, it should.

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **WS-001** | **SHOULD** | Focus Mode: hides all UI chrome except the canvas and the essential toolbar. Full-screen, distraction-free. Buzan's recommendation: 'Create pleasing surroundings.' |
| **WS-002** | **SHOULD** | Ambient sound integration: optional background soundscapes (nature sounds, ambient music, silence). Buzan: 'Play appropriate music, or work in silence if you prefer.' |
| **WS-003** | **SHOULD** | Positive mental attitude prompt: before each session, an optional brief affirmation or intention-setting moment. Buzan: 'A positive mental attitude unblocks the mind.' |
| **WS-004** | **SHOULD** | Session timer: an optional Pomodoro-style focus timer, with a reminder to review the map 10–30 minutes after the session ends (first review interval). |
| **WS-005** | **MAY** | Ambient colour: the application's chrome and background colour subtly adapts to the map's primary palette for visual coherence. |

# **17\.  NON-FUNCTIONAL REQUIREMENTS**

## **17.1  Performance**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **NF-001** | **MUST** | Canvas render time for a 500-node map: \< 500ms on initial load on a mid-range device. |
| **NF-002** | **MUST** | Branch addition latency: \< 50ms from user action to canvas update. |
| **NF-003** | **MUST** | Smooth zoom animation: 60fps at all zoom levels on target devices. |
| **NF-004** | **MUST** | Offline capability: maps must be fully editable without an internet connection. Sync on reconnect. |
| **NF-005** | **SHOULD** | Large map performance: 1,000+ nodes with no perceptible lag on desktop hardware. |

## **17.2  Accessibility**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **NF-010** | **MUST** | WCAG 2.1 AA compliance for all non-canvas UI elements. |
| **NF-011** | **MUST** | Keyboard-only navigation of all core editing functions. |
| **NF-012** | **MUST** | Screen reader support for the Outline View (which mirrors the canvas in accessible tree format). |
| **NF-013** | **MUST** | Colour-blindness mode (see CS-009). |
| **NF-014** | **SHOULD** | High-contrast mode for canvas rendering. |
| **NF-015** | **SHOULD** | Adjustable font sizes for keywords independent of zoom level. |

## **17.3  Security & Privacy**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **NF-020** | **MUST** | All map data encrypted at rest and in transit (AES-256 / TLS 1.3). |
| **NF-021** | **MUST** | User-generated content (maps, images) must not be used for any purpose other than serving that user, without explicit consent. |
| **NF-022** | **MUST** | Group Mind Map data must be scoped so only invited participants can access map content. |
| **NF-023** | **SHOULD** | On-premise / self-hosted deployment option for enterprise customers. |

## **17.4  Internationalisation**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **NF-030** | **MUST** | Full Unicode support for keywords in all scripts. |
| **NF-031** | **MUST** | RTL (right-to-left) canvas layout support for Arabic, Hebrew, and other RTL languages. |
| **NF-032** | **SHOULD** | Localised UI in at least: English, Spanish, French, German, Japanese, Mandarin Chinese, Arabic. |
| **NF-033** | **SHOULD** | Localised law rationale texts (coaching messages translated with cultural adaptation). |

## **17.5  Platform Targets**

| Web (Primary) | Modern browsers (Chrome, Firefox, Safari, Edge) — latest 2 major versions |
| :---- | :---- |
| **Desktop** | Electron-wrapped web app for macOS, Windows, Linux |
| **iOS** | Native SwiftUI shell with embedded web canvas OR React Native |
| **Android** | Native Kotlin shell with embedded web canvas OR React Native |
| **Minimum Web Canvas** | Chrome 90+, WebGL 1.0 or Canvas 2D fallback |

# **18\.  THE FOUR DANGER AREAS — DESIGN GUARD RAILS**

Buzan explicitly identifies four common failure modes in Mind Mapping. The software must be designed to prevent all four by design:

### **Danger Area 1: Maps That Aren't Really Mind Maps**

A map that looks like a Mind Map but lacks hierarchy, emphasis, and association quickly degrades into random, monotonous structure. Guard rails: the Buzan Health Panel Radiant Score, the hierarchy depth warning (LE-082), and the colour propagation enforcement (LE-022) collectively prevent this failure mode.

### **Danger Area 2: The Idea That Phrases Are More Meaningful**

Users instinctively believe that phrases convey more meaning than single keywords. The Clarity Modal (LE-060) must not merely block phrases — it must explain why single keywords are more powerful: 'Each word has thousands of possible associations. By keeping words separate, you give each one room to radiate its own network of ideas — like giving a limb extra joints.' The option to split phrases into branches must be the clearly recommended action.

### **Danger Area 3: The Idea That a Messy Mind Map Is No Good**

Buzan is explicit: a 'messy' first draft Mind Map is often a sign of rich thinking, not of failure. The system must reinforce this through: a 'First Draft' label applied automatically to new maps, positive framing of imperfect maps in all coaching messages, and a 'Refine' phase prompt (not an error) when the map is reopened for review.

*📌  All error messages and coaching messages in the system must follow this framing rule: they must never imply the user has done something wrong. They must always frame the coaching as an opportunity to improve.*

### **Danger Area 4: A Negative Emotional Reaction to Any Mind Map**

The system must never produce anxiety, shame, or discouragement. Compliance indicators must be framed as growth opportunities. The Radiant Score must be designed to start high and grow, not to penalise. When a user's map has many compliance issues, the system must lead with what is working, then gently introduce one improvement at a time.

# **19\.  NATIVE FILE FORMAT SPECIFICATION (.bmm)**

The Buzan Mind Map native format (.bmm) is a JSON document. The following schema is the canonical definition:

{  "format": "bmm",  "version": "1.0",  "id": "\<UUID\>",  "title": "\<String\>",  "createdAt": "\<ISO8601\>",  "updatedAt": "\<ISO8601\>",  "canvas": {    "width": \<Float\>,    "height": \<Float\>,    "orientation": "LANDSCAPE"  },  "colorPalette": \["\<HexColor\>", ...\],  "centralImage": {    "id": "\<UUID\>",    "type": "raster|svg|drawn|text-image",    "src": "\<DataURI or URL\>",    "colors": \["\<HexColor\>", ...\],  // min 3 required    "hasDimension": \<Boolean\>,    "position": { "x": \<Float\>, "y": \<Float\> },    "size": { "width": \<Float\>, "height": \<Float\> }  },  "branches": \[    {      "id": "\<UUID\>",      "parentId": "\<UUID | null\>",      "keyword": "\<String\>",            // one word only      "isUpperCase": \<Boolean\>,      "color": "\<HexColor\>",      "lineThickness": \<Float\>,      "isCurved": \<Boolean\>,      "length": \<Float\>,      "angle": \<Float\>,      "depth": \<Integer\>,      "image": { ... } | null,      "hasBoundary": \<Boolean\>,      "codes": \[ { "symbol": "\<String\>", "color": "\<HexColor\>" } \],      "blankLine": \<Boolean\>,      "numericalOrder": \<Integer | null\>,      "linkedMapId": "\<UUID | null\>"    }  \],  "arrows": \[    {      "id": "\<UUID\>",      "sourceNodeId": "\<UUID\>",      "targetNodeId": "\<UUID\>",      "directionality": "UNI|BIDIRECTIONAL|MULTI",      "arrowStyle": { "size": \<Int\>, "form": "\<String\>", "dimension": \<Boolean\> },      "label": "\<String | null\>",      "color": "\<HexColor\>"    }  \],  "reviewSchedule": {    "intervals": \[\<minutes\>, \<minutes\>, ...\],    "completed": \[\<Boolean\>, ...\],    "nextReviewAt": "\<ISO8601\>"  },  "isGroupMap": \<Boolean\>,  "participants": \[ { "id": "\<UUID\>", "color": "\<HexColor\>", "name": "\<String\>" } \],  "linkedMaps": \[ { "mapId": "\<UUID\>", "branchId": "\<UUID\>" } \]}

# **20\.  OPEN QUESTIONS FOR THE DEVELOPMENT TEAM**

The following items require decisions from the development team, product owner, or business stakeholders before implementation:

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **OQ-001** | **—** | AI-generated Central Images: should the system include an AI image generation tool for users who lack confidence in their drawing ability? Buzan strongly encourages hand-drawn images, but access barriers may deter new users. Recommended approach: offer AI generation as a starting point with strong coaching to personalise and redraw. |
| **OQ-002** | **—** | Monetisation and feature gating: which features are in a free tier vs. paid? Recommended: the core law-enforcement and onboarding system must be free to fulfil the educational mission. Group Maps, Mega Mind Maps, and advanced review scheduling are candidates for paid tiers. |
| **OQ-003** | **—** | Proprietary vs. open file format: should the .bmm format be openly documented and supported by third-party tools? An open format increases adoption; a proprietary format increases lock-in. Decision required. |
| **OQ-004** | **—** | The 'Ask Buzan' AI assistant (ED-024): this feature uses Buzan's published principles as a knowledge base. Legal review is required regarding trademark use and the scope of the Buzan Organisation's licensing requirements. |
| **OQ-005** | **—** | Synaesthesia tags (LE-055): these are a novel UX concept not common in existing tools. User research is recommended before full build to validate the interaction model. |
| **OQ-006** | **—** | Handwriting recognition: should the mobile app support handwritten keywords that are then OCR-converted to printed text? This would preserve the physical drawing experience Buzan values while maintaining the printed-text law. |

# **21\.  QUICK REFERENCE: ALL BUZAN LAWS & RECOMMENDATIONS**

This section is intended to be shared with all team members as a single-page reference. Every requirement in this document traces back to one or more of these principles.

## **Laws of Technique**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **L-T1** | **LAW** | USE EMPHASIS — Always use a Central Image · Images throughout · 3+ colours on Central Image · Dimension · Synaesthesia · Size variation · Organised spacing · Appropriate spacing |
| **L-T2** | **LAW** | USE ASSOCIATION — Arrows for connections · Colours as codes · Codes and symbols |
| **L-T3** | **LAW** | BE CLEAR — One keyword per line · Print all words · Print on lines · Line length \= word length · Connect lines to lines · Central lines thicker · Boundaries embrace branches · Images as clear as possible · Landscape orientation · Upright printing |
| **L-T4** | **LAW** | DEVELOP A PERSONAL STYLE — C1+ rule (each map slightly better than the last in colour, dimension, imagery, logic, beauty) |

## **Laws of Layout**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **L-L1** | **LAW** | USE HIERARCHY — Basic Ordering Ideas (BOIs) as the primary branch level · Hierarchical structure throughout |
| **L-L2** | **LAW** | USE NUMERICAL ORDER — Number branches to create a sequential output for speeches, essays, and examinations |

## **Recommendations**

| ID | Priority | Requirement |
| :---- | :---- | :---- |
| **R-1** | **REC** | BREAK MENTAL BLOCKS — Add blank lines · Ask questions (BOI Question Set) · Add images · Maintain awareness of infinite associational capacity |
| **R-2** | **REC** | REINFORCE — Review your Mind Maps on Buzan's schedule · Do Quick Mind Map Checks (recall from memory, then compare) |
| **R-3** | **REC** | PREPARE (Mental) — Positive mental attitude · Copy images around you · Commit to your map · Commit to the absurd · Make your map as beautiful as possible |
| **R-4** | **REC** | PREPARE (Materials) — Best quality paper, pens, and tools available |
| **R-5** | **REC** | PREPARE (Environment) — Moderate temperature · Natural light · Fresh air · Good posture furniture · Pleasing surroundings · Appropriate music or silence |

*End of Document — Buzan Mind Mapping Software Technical Specifications v1.0*

*'The number of associations you have already made, your potential to radiate new patterns and connections, is currently beyond calculation.' — Tony Buzan*

# TECH SPEC ADDENDUM — PWA & Offline Support
# Insert this section into TECH_SPEC.md after the existing architecture section.

---

## Section: Progressive Web App & Offline-First Architecture

### Overview

The application must function as a fully installable Progressive Web App with comprehensive
offline support. A user must be able to create, read, update, and delete mind maps with zero
network connectivity and have all changes synchronised automatically and silently when
connectivity is restored. Offline capability is not a degraded mode — it is a first-class
supported state at all times.

---

### PWA Manifest & Installability

The Web App Manifest must be generated by `vite-plugin-pwa` and meet all Chrome, Firefox,
and Safari installability criteria.

**Required manifest fields:**

| Field | Value |
|---|---|
| `name` | Radiant Mind |
| `short_name` | Radiant |
| `display` | `standalone` |
| `orientation` | `any` |
| `theme_color` | Primary brand colour (design token `--color-brand-primary`) |
| `background_color` | Surface colour (design token `--color-surface`) |
| `start_url` | `/` |
| `scope` | `/` |
| `id` | `/` |
| `categories` | `["productivity", "utilities"]` |
| `description` | Full descriptive string |

**Required icon set** (all PNG, maskable variants required for Android):

| Size | Purpose |
|---|---|
| 72×72 | any |
| 96×96 | any |
| 128×128 | any |
| 144×144 | any |
| 152×152 | any (iOS) |
| 180×180 | any (iOS) |
| 192×192 | any + maskable |
| 256×256 | any |
| 384×384 | any |
| 512×512 | any + maskable |

**iOS-specific meta tags** (in `index.html`):
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Radiant">
<link rel="apple-touch-icon" href="/icons/icon-180x180.png">
<link rel="apple-touch-startup-image" href="/splash/splash-2048x2732.png">
```

**Install prompt handling:**
The app must capture the `beforeinstallprompt` event, suppress the browser default prompt,
and present a custom in-app install banner in the bottom-right corner. The banner must be:
- Dismissible (persists dismissal in `localStorage` for 30 days)
- Re-triggerable via Settings → Install App
- Absent on iOS (where `beforeinstallprompt` does not fire; show manual instructions instead)

---

### Service Worker Architecture

The Service Worker is managed by `vite-plugin-pwa` using Workbox. It must be registered
with `type: 'module'` and use the `injectManifest` strategy so custom routing logic can
be written alongside Workbox-generated precache manifests.

**Cache strategy matrix:**

| Asset type | Strategy | Cache name | Max entries | Max age |
|---|---|---|---|---|
| App shell (HTML, JS bundles, CSS) | CacheFirst with precache | `app-shell-v{version}` | unlimited | forever (versioned) |
| Static assets (fonts, icons, images) | CacheFirst | `static-assets-v1` | 100 | 365 days |
| API responses — map list | NetworkFirst | `api-maps-v1` | 50 | 1 day |
| API responses — single map | StaleWhileRevalidate | `api-map-detail-v1` | 200 | 7 days |
| API responses — user profile | NetworkFirst | `api-user-v1` | 5 | 1 hour |
| Avatars / user media | CacheFirst | `user-media-v1` | 100 | 30 days |
| Navigation requests (SPA routes) | NetworkFirst with offline fallback | `navigation-v1` | — | — |

**Offline fallback:** All navigation requests that fail network must return `/offline.html`,
a fully styled standalone page that shows the offline indicator and a link to cached maps.

**Cache versioning:** On Service Worker update, old caches must be purged during the
`activate` event. The version string must match the application `package.json` version.

**Background sync:** The Service Worker must register a Background Sync tag `bmm-sync-queue`
that triggers the sync flush function (see Offline Data Layer below) when connectivity
returns, even if the main application window is closed.

**Push notifications:** Out of scope for v1 but the Service Worker must include a stubbed
`push` event listener with a log message so the scaffold exists for v2.

---

### Offline Data Layer

#### Technology stack

| Component | Library |
|---|---|
| Local document store | Dexie.js (IndexedDB wrapper) |
| Real-time CRDT sync | Yjs |
| Yjs IndexedDB provider | `y-indexeddb` |
| Yjs server sync provider | `y-websocket` (via existing SignalR hub or dedicated WS endpoint) |
| Network status | `navigator.onLine` + `online`/`offline` events + periodic HEAD ping |

#### IndexedDB schema (via Dexie)

```typescript
// @bmm/data-model/src/db.ts
export class BmmDatabase extends Dexie {
  maps!:       Dexie.Table<LocalMap,       string>; // keyed by mapId
  syncQueue!:  Dexie.Table<SyncQueueItem,  string>; // keyed by itemId
  snapshots!:  Dexie.Table<YjsSnapshot,    string>; // keyed by mapId
  settings!:   Dexie.Table<LocalSetting,   string>; // keyed by key

  constructor() {
    super('bmm-v1');
    this.version(1).stores({
      maps:      '&id, ownerId, updatedAt, syncStatus',
      syncQueue: '&id, mapId, operation, createdAt, attempts',
      snapshots: '&mapId, snapshotTime',
      settings:  '&key',
    });
  }
}
```

**`LocalMap`** mirrors the server `Map` model with two extra fields:
- `syncStatus: 'synced' | 'pending' | 'conflict'`
- `localVersion: number` (incremented on every local mutation)

**`SyncQueueItem`** records every mutation that has not yet been acknowledged by the server:
- `operation: 'create' | 'update' | 'delete'`
- `payload: object` (the mutation delta)
- `attempts: number` (incremented on each failed sync attempt; abandoned after 10)
- `createdAt: Date`

#### Conflict resolution — CRDT via Yjs

Every mind map document is represented as a `Y.Doc`. The document structure:
```
Y.Doc
  └── Y.Map('meta')        — title, theme, settings
  └── Y.Map('nodes')       — keyed by nodeId → Y.Map of node properties
  └── Y.Map('edges')       — keyed by edgeId → Y.Map of edge properties
  └── Y.Array('history')   — append-only audit log
```

Yjs CRDTs guarantee that any two clients that have seen the same set of operations will
converge to the same document state regardless of the order in which they applied those
operations. This means offline edits and server edits always merge automatically with no
data loss and no user prompt required.

**Yjs provider strategy:**
- **Online:** `WebsocketProvider` connected to the ASP.NET backend's `/hubs/map-sync` endpoint
- **Offline / disconnected:** `IndexeddbPersistence` provides local durability
- Both providers are active simultaneously when online; `IndexeddbPersistence` is the source
  of truth when offline

**Sync flush sequence (on reconnect):**
1. `WebsocketProvider` reconnects and exchanges awareness states
2. Yjs automatically merges the server document with the local document via CRDT
3. The merged state is written back to IndexedDB by `IndexeddbPersistence`
4. The `syncQueue` for this map is cleared
5. `LocalMap.syncStatus` is set to `'synced'`

#### Offline map access

All maps the user has previously opened must be available offline. The offline access
strategy:

1. On first load of any map, the full Yjs document is persisted to IndexedDB via
   `IndexeddbPersistence`
2. A background cache-warming job runs at login and after each map list load, pre-fetching
   the top 20 most recently accessed maps into IndexedDB and the `api-map-detail-v1` cache
3. New maps created offline are assigned a client-generated UUID and pushed to the sync
   queue with `operation: 'create'`
4. Maps deleted offline are pushed to the sync queue with `operation: 'delete'`; the local
   record is soft-deleted (flagged `deleted: true`) and hidden from the UI immediately

---

### Network Status Management

A singleton `NetworkStatusService` must be implemented in `@bmm/data-model`:

```typescript
export type NetworkStatus = 'online' | 'offline' | 'degraded';

interface NetworkStatusService {
  readonly status: NetworkStatus;
  readonly isOnline: boolean;
  subscribe(callback: (status: NetworkStatus) => void): () => void;
}
```

**Detection strategy:**
1. `navigator.onLine` provides the baseline
2. A periodic HEAD request to `/api/health` every 30 seconds confirms true connectivity
   (a device can report `navigator.onLine = true` while behind a captive portal)
3. If the HEAD request fails 3 consecutive times, status is set to `'offline'` regardless
   of `navigator.onLine`
4. Status returns to `'online'` after the first successful HEAD response

**Degraded mode:** If API calls fail but static assets load, status is `'degraded'`.
The UI shows a yellow indicator ("Limited connectivity") instead of the full offline banner.

---

### Offline UI Requirements

**Network status indicator:**
- Persistent pill in the top navigation bar
- `'online'`: hidden (no indicator when fully connected)
- `'degraded'`: yellow pill with text "Limited connectivity"
- `'offline'`: red pill with text "Offline — changes saved locally"
- All state transitions must be animated (fade in/out, 300ms)

**Pending changes indicator:**
- Shown in the map editor toolbar when `syncQueue.count > 0` for the current map
- Text: "N unsaved changes" with a cloud-with-arrow icon
- On reconnect, animates to "Syncing..." then disappears on completion

**Offline map list:**
- The map list page must render fully from IndexedDB cache when offline
- Maps with `syncStatus: 'pending'` show a clock badge
- A filter chip "Offline available" filters to maps cached in IndexedDB

**Install banner:**
- Bottom-right toast-style banner: "Install Radiant for full offline access"
- Primary CTA: "Install" (triggers deferred `beforeinstallprompt.prompt()`)
- Secondary: "Not now" (dismisses for 30 days)
- On iOS: "Add to Home Screen" with Safari instructions modal

---

### Lighthouse & Performance Requirements

The PWA must score at or above the following thresholds on a Lighthouse audit run against
the production build in Chrome headless:

| Category | Minimum score |
|---|---|
| Performance | 90 |
| Accessibility | 95 |
| Best Practices | 95 |
| SEO | 90 |
| PWA | 100 |

All PWA checklist items must pass:
- `[✓]` Registers a service worker
- `[✓]` Responds with 200 when offline
- `[✓]` Has a `<meta name="viewport">` tag
- `[✓]` Contains a web app manifest
- `[✓]` Icons are at least 192×192px
- `[✓]` Has a maskable icon
- `[✓]` Sets a theme colour for the address bar
- `[✓]` Content is sized correctly for the viewport
- `[✓]` Has a `<meta name="description">`
- `[✓]` Page has sufficient colour contrast

