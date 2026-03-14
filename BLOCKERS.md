# BLOCKERS LOG — Buzan Mind Mapping Software v1

### Sprint 21: Production Deployment — No Hosting Credentials
**Error:** Cannot complete live deployment to Vercel, Fly.io, Supabase, or Upstash without API tokens and account credentials. Cannot run AT Suite against a production URL that does not exist. Cannot verify Sentry receives errors without a real DSN.
**Attempts:**
1. Attempted `gh issue list` — failed: "no git remotes found". No GitHub remote to push to or configure secrets on.
2. Cannot authenticate to Vercel CLI without VERCEL_TOKEN — no account credentials available to agent.
3. Cannot authenticate to Fly.io without FLY_API_TOKEN — no account credentials available to agent.
**Status:** SKIPPED
**Suggested resolution:** (1) Create a Vercel account, import the repo, set env vars (VITE_SENTRY_DSN, VITE_API_URL). vercel.json is already in src/apps/web/. (2) Create a Fly.io account, run `flyctl launch` from src/Bmm.Api/ — fly.toml and Dockerfile are ready. Set secrets: DATABASE_URL, JWT_SECRET, SENTRY_DSN, FRONTEND_URL. (3) Create a Supabase or Railway PostgreSQL instance; set DATABASE_URL and USE_INMEMORY_DB=false. (4) Create a Sentry project; set SENTRY_DSN (backend) and VITE_SENTRY_DSN (frontend). (5) Push repo to GitHub; add secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, FLY_API_TOKEN, VITE_SENTRY_DSN, VITE_API_URL, PRODUCTION_URL. The deploy.yml GitHub Actions workflow will then handle all future deploys on push to main. (6) After deployment, run `npx playwright test --grep "@smoke"` with PLAYWRIGHT_BASE_URL set to the production URL.

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


### Sprint 23: AT-PWA-041 Background Sync API (app closed)
**Error:** Cannot automate Background Sync API testing when the application has no open browser windows. Playwright requires an active browser context.
**Attempts:**
1. Considered using Playwright's `browser.close()` then relying on SW background sync — not possible as Playwright context must be active.
2. Considered mocking the BackgroundSync registration — would not test real SW behavior.
3. Considered using a headless Chrome DevTools Protocol approach — too complex and fragile.
**Status:** SKIPPED (manual verification)
**Suggested resolution:** Human tester should: (1) Open the app, make offline edits, (2) Close all browser windows, (3) Restore network, (4) Reopen app, (5) Verify edits were synced.

### Sprint 23: AT-PWA-042 Storage quota warning simulation
**Error:** DevTools quota simulation (navigator.storage.estimate with forced quota limit) not available via Playwright API.
**Attempts:**
1. Attempted `page.evaluateOnNewDocument` to override navigator.storage — Chrome security prevents override.
2. Attempted CDP `setStorageQuota` — not available in standard Playwright.
3. Attempted manual quota exhaustion — would fill actual disk, impractical in CI.
**Status:** SKIPPED (best-effort implementation only)
**Suggested resolution:** Human tester can use Chrome DevTools → Application → Storage → simulate quota in DevTools.
