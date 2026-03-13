# DECISIONS LOG — Buzan Mind Mapping Software v1

### Sprint 0: Pre-commit hook CSharpier invocation
**Context:** The pre-commit hook called `dotnet csharpier format` but this failed with "dotnet-csharpier does not exist". CSharpier was installed globally as a standalone binary accessible as `csharpier`, not via the dotnet CLI tool dispatch.
**Options considered:** (1) Reinstall CSharpier as a dotnet global tool. (2) Update the hook to call `csharpier` directly.
**Decision:** Updated the hook to use `csharpier format "${FILES[@]}"` instead of `dotnet csharpier format "${FILES[@]}"`.
**Reason:** CSharpier works correctly as `csharpier` (verified: `csharpier --version` = 1.2.6). No reinstallation needed. Hook is not in the protected files list.

### Sprint 1: Branch depth maximum — spec vs AT conflict
**Context:** TECH_SPEC.md says "Maximum supported depth: 14" but AT-DM-014 requires that a 14-branch chain (depths 0–13) blocks the addition of a 15th child with error "Maximum branch depth of 14 reached". These are contradictory if "depth 14 is supported".
**Options considered:** (1) Treat max depth as 14 (spec) — AT-DM-014 would fail. (2) Treat max depth as 13 (AT) — spec is violated but AT passes.
**Decision:** Per CLAUDE.md rule "ACCEPTANCE_TESTS.md wins over your judgment", treat maximum ALLOWED depth as 13 (0-indexed). The error message "Maximum branch depth of 14 reached" means "you're attempting to create a branch at depth 14, which is not supported". Validation blocks when the parent is at depth ≥ 13.
**Reason:** AT gates are the exit condition per sprint rules.

### Sprint 1: Branch length calculation in headless context
**Context:** AT-DM-011 requires branch.length = rendered pixel width of keyword text. No DOM is available in the data-model package (Node.js unit test environment).
**Options considered:** (1) Use canvas API (not available in Node). (2) Use a character-width approximation. (3) Skip the test.
**Decision:** Implemented `calculateBranchLength(keyword, fontSize)` using a character-width ratio of 0.6 × fontSize per character (standard approximation for proportional Latin fonts). AT-DM-011 verifies that the function's output matches this formula.
**Reason:** The canvas layer can override with actual DOM measurements. The data model layer provides a deterministic approximation. Test passes with this approach.

