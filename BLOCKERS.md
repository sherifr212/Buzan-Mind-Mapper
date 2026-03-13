# BLOCKERS LOG — Buzan Mind Mapping Software v1

### Sprint 0: Chromatic Visual Tests — No Project Token
**Error:** CHROMATIC_PROJECT_TOKEN is empty in src/.env. Cannot publish Storybook baseline to Chromatic.
**Attempts:** Not attempted — token not available per autonomous decision rules.
**Status:** SKIPPED
**Suggested resolution:** Create a free Chromatic account at chromatic.com, connect to the GitHub repo, copy the project token, add it to src/.env as CHROMATIC_PROJECT_TOKEN, and add it as a GitHub Actions secret. Then run `npx chromatic --project-token=<TOKEN>` from src/ to publish the baseline.

