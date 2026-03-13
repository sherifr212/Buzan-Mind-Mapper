import { test, expect } from '@playwright/test';

// ─── Sprint 13 E2E Onboarding Tests ──────────────────────────────────────────
// AT-OB-001: /map/new without tutorial complete → locked state + tutorial shown
// AT-OB-002: /tutorial → advance to step 3 (hierarchy) → law name, rationale, before/after visible
// AT-OB-004: /tutorial?step=4 (add-image step) → click Next without action → blocked message
// AT-OB-010: /?maps=7 → map-progress-tracker visible with '7 / 100' and Buzan recommends text
// AT-OB-011: /map/test-fixture-simple → save → reflection-prompt appears → dismiss closes it

// ─── AT-OB-001 ────────────────────────────────────────────────────────────────

test('AT-OB-001: /map/new without tutorial → locked state and tutorial visible', async ({
  page,
  context,
}) => {
  // Clear localStorage to ensure tutorialComplete = false
  await context.clearCookies();
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/map/new');
  await page.waitForTimeout(500);

  // The locked button should be visible with correct text
  const lockedBtn = page.locator('[data-testid="free-create-locked"]');
  await expect(lockedBtn).toBeVisible({ timeout: 5000 });
  await expect(lockedBtn).toContainText('Complete tutorial to unlock');

  // The tutorial flow should also be visible
  const tutorialFlow = page.locator('[data-testid="tutorial-flow"]');
  await expect(tutorialFlow).toBeVisible({ timeout: 5000 });
});

// ─── AT-OB-002 ────────────────────────────────────────────────────────────────

test('AT-OB-002: /tutorial → advance to step 3 → hierarchy law visible', async ({ page }) => {
  await page.goto('/tutorial');
  await page.waitForTimeout(300);

  // Should start at step 0 (Introduction / welcome)
  const tutorialFlow = page.locator('[data-testid="tutorial-flow"]');
  await expect(tutorialFlow).toBeVisible({ timeout: 5000 });

  // Click Next to go to step 1
  await page.locator('[data-testid="tutorial-next-btn"]').click();
  await page.waitForTimeout(200);

  // Click Next to go to step 2 (hierarchy — 'Law 1: Use Hierarchy')
  await page.locator('[data-testid="tutorial-next-btn"]').click();
  await page.waitForTimeout(200);

  // Check the law name contains 'Law 1: Use Hierarchy'
  const lawName = page.locator('[data-testid="tutorial-law-name"]');
  await expect(lawName).toContainText('Law 1: Use Hierarchy', { timeout: 3000 });

  // Rationale should be visible
  const rationale = page.locator('[data-testid="tutorial-rationale"]');
  await expect(rationale).toBeVisible({ timeout: 3000 });

  // Before/after panel should be visible (hierarchy step has beforeAfter=true)
  const beforeAfter = page.locator('[data-testid="tutorial-before-after"]');
  await expect(beforeAfter).toBeVisible({ timeout: 3000 });
});

// ─── AT-OB-004 ────────────────────────────────────────────────────────────────

test('AT-OB-004: /tutorial?step=4 (add-image step) → Next without image → blocked', async ({
  page,
}) => {
  // Navigate directly to the add-image step (index 4)
  await page.goto('/tutorial?step=4');
  await page.waitForTimeout(300);

  const tutorialFlow = page.locator('[data-testid="tutorial-flow"]');
  await expect(tutorialFlow).toBeVisible({ timeout: 5000 });

  // Verify we're on the correct step
  const lawName = page.locator('[data-testid="tutorial-law-name"]');
  await expect(lawName).toContainText('Law 3: Use Images', { timeout: 3000 });

  // Click Next without adding an image
  await page.locator('[data-testid="tutorial-next-btn"]').click();
  await page.waitForTimeout(200);

  // Block message should appear
  const blocked = page.locator('[data-testid="tutorial-step-blocked"]');
  await expect(blocked).toBeVisible({ timeout: 3000 });
  await expect(blocked).toContainText('Please add an image to a branch to continue');
});

// ─── AT-OB-010 ────────────────────────────────────────────────────────────────

test('AT-OB-010: /?maps=7 → map-progress-tracker shows 7 / 100 and Buzan text', async ({
  page,
}) => {
  await page.goto('/?maps=7');
  await page.waitForTimeout(300);

  const tracker = page.locator('[data-testid="map-progress-tracker"]');
  await expect(tracker).toBeVisible({ timeout: 5000 });

  // Should contain '7 / 100'
  await expect(tracker).toContainText('7 / 100');

  // Should contain Buzan recommends text
  await expect(tracker).toContainText('Buzan recommends');
});

// ─── AT-OB-011 ────────────────────────────────────────────────────────────────

test('AT-OB-011: /map/test-fixture-simple → save → reflection prompt → dismiss', async ({
  page,
}) => {
  await page.goto('/map/test-fixture-simple');
  await page.waitForSelector('[data-testid="canvas-ready"]', { timeout: 15000 });
  await page.waitForTimeout(500);

  // Save button should be visible in toolbar
  const saveBtn = page.locator('[data-testid="save-map-btn"]');
  await expect(saveBtn).toBeVisible({ timeout: 5000 });

  // Click save
  await saveBtn.click();
  await page.waitForTimeout(300);

  // Reflection prompt should appear
  const reflectionPrompt = page.locator('[data-testid="reflection-prompt"]');
  await expect(reflectionPrompt).toBeVisible({ timeout: 3000 });

  // Should mention 'most surprising association'
  await expect(reflectionPrompt).toContainText('most surprising association');

  // Click dismiss
  const dismissBtn = page.locator('[data-testid="reflection-dismiss"]');
  await expect(dismissBtn).toBeVisible({ timeout: 3000 });
  await dismissBtn.click();
  await page.waitForTimeout(200);

  // Reflection prompt should be gone
  await expect(reflectionPrompt).not.toBeVisible();
});
