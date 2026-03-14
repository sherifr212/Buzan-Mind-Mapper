# BLOCKERS LOG — Buzan Mind Mapping Software v1

### Sprint 20: Manual Acceptance Tests — Require Human Participants
**Error:** AT-MA-001 through AT-MA-008, AT-OB-003, AT-NF-011 are manual tests requiring human participants (novice users, timing observers, non-expert colleagues). An autonomous agent cannot execute them. Additionally, no GitHub remote is configured so no bug issues can be filed or retrieved.
**Attempts:**
1. Checked GitHub Issues via `gh issue list` — failed: "no git remotes found"
2. Cannot observe novice users completing tutorial (AT-MA-005, AT-OB-003) — requires real human participants
3. Cannot evaluate subjective quality of coaching tone, animation feel, or colour vibrancy without a human reviewer
**Status:** SKIPPED
**Suggested resolution:** Product owner should manually work through AT Suite Section 14 and Appendix A. For each test: (1) AT-MA-001 — review all coaching messages in src/apps/web/src/ for tone; (2) AT-MA-002 — open 5 maps and evaluate Radiant Score display; (3) AT-MA-003 — observe branch animations for organic feel; (4) AT-MA-004 — test Clarity Modal wording with a colleague; (5) AT-MA-005 — observe a novice user on /tutorial route; (6) AT-MA-006 — use BOI Wizard for 3 topics; (7) AT-MA-007 — review colour palette presets in ThemePanel; (8) AT-MA-008 — attempt to reproduce Buzan Danger Areas (lists, pictures only, disconnected, plain prose); (9) AT-OB-003 — time 3 participants on tutorial (must be ≤15 min); (10) AT-NF-011 — complete all editing tasks without a mouse. File any P0/P1 bugs found as GitHub Issues, then re-run the agent to fix them.

### Sprint 0: Chromatic Visual Tests — No Project Token
**Error:** CHROMATIC_PROJECT_TOKEN is empty in src/.env. Cannot publish Storybook baseline to Chromatic.
**Attempts:** Not attempted — token not available per autonomous decision rules.
**Status:** SKIPPED
**Suggested resolution:** Create a free Chromatic account at chromatic.com, connect to the GitHub repo, copy the project token, add it to src/.env as CHROMATIC_PROJECT_TOKEN, and add it as a GitHub Actions secret. Then run `npx chromatic --project-token=<TOKEN>` from src/ to publish the baseline.

