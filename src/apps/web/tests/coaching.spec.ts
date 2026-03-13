import { test, expect } from '@playwright/test';

// ─── Sprint 8 E2E Coaching Tests ──────────────────────────────────────────────
// AT-LE-004: Dimension coaching appears after 30 seconds
// AT-LE-052: Arrow coaching fires at 10+ branches with zero arrows
// AT-LE-022: Colour inheritance cannot be manually broken on sub-branches
// AT-LE-081: BOI Wizard is triggered on new map creation
// AT-LE-082: Flat map warning fires when all branches are at depth 0

const FLAT_MAP_URL = '/map/test-fixture-flat';
const SIMPLE_MAP_URL = '/map/test-fixture-simple';
const MANY_BRANCHES_URL = '/map/test-fixture-many-branches';
const NEW_MAP_URL = '/map/new';

async function openMap(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);
}

async function getBranchCount(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.locator('[data-testid="branch-count"]').textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

async function selectBranchByLabel(page: import('@playwright/test').Page, label: string) {
  const node = page
    .locator('[data-testid^="branch-label-"]')
    .filter({ hasText: new RegExp(label, 'i') })
    .first();
  await node.click({ force: true });
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="selected-branch-id"]');
      return !!(el && el.textContent && el.textContent.trim().length > 0);
    },
    { timeout: 5000 }
  );
  await page.waitForTimeout(200);
}

// ─── AT-LE-004: Dimension coaching appears after 30 seconds ──────────────────

test('AT-LE-004: Dimension coaching fires after 30s when central image has no dimension', async ({
  page,
}) => {
  // Install fake clock before navigation so timers are fake from the start
  await page.clock.install();
  await openMap(page, FLAT_MAP_URL);

  // Advance clock by 31 seconds — triggers LE-004 dimension coaching timer
  await page.clock.fastForward(31_000);
  await page.waitForTimeout(500);

  // Coach tip should appear
  const msg = page.locator('[data-testid="coach-toast-message-LE-004"]');
  await expect(msg).toBeVisible({ timeout: 5000 });
  await expect(msg).toContainText(
    'Adding dimension (shadow or depth) to your central image makes it stand out'
  );

  // "Add dimension" shortcut button must be present
  const addBtn = page.locator('[data-testid="add-dimension-btn"]');
  await expect(addBtn).toBeVisible();

  // Dismissing the tip does not block editing
  await addBtn.click();
  await page.waitForTimeout(300);
  await expect(msg).not.toBeVisible();

  // Canvas is still interactive (branch count still readable)
  const count = await getBranchCount(page);
  expect(count).toBeGreaterThanOrEqual(0);
});

// ─── AT-LE-052: Arrow coaching fires at 10+ branches with zero arrows ─────────

test('AT-LE-052: Arrow coaching fires when 10th branch is added and no arrows exist', async ({
  page,
}) => {
  // Many-branches fixture has 8 branches, 0 arrows
  await openMap(page, MANY_BRANCHES_URL);

  const before = await getBranchCount(page);
  expect(before).toBe(8);

  // Add 2 more branches to reach 10
  for (let i = 0; i < 2; i++) {
    await page.click('[data-testid="add-blank-line-btn"]', { force: true });
    await page.waitForTimeout(200);
  }

  // Wait for count to reach 10
  await page.waitForFunction(
    (min) => {
      const el = document.querySelector('[data-testid="branch-count"]');
      if (!el) return false;
      const match = el.textContent?.match(/\d+/);
      return match ? parseInt(match[0], 10) >= min : false;
    },
    10,
    { timeout: 5000 }
  );

  // Arrow coaching tip should appear
  const msg = page.locator('[data-testid="coach-toast-message-LE-052"]');
  await expect(msg).toBeVisible({ timeout: 5000 });
  await expect(msg).toContainText('Buzan uses arrows to reveal hidden connections');

  // Link to Draw Arrow tool must be present
  const drawArrowLink = page.locator('[data-testid="draw-arrow-link"]');
  await expect(drawArrowLink).toBeVisible();
});

// ─── AT-LE-022: Colour inheritance cannot be manually broken ─────────────────

test('AT-LE-022: Colour inheritance tooltip appears when attempting to change sub-branch colour', async ({
  page,
}) => {
  await openMap(page, SIMPLE_MAP_URL);
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });

  // Select a sub-branch (depth > 0) — "Design" is depth 1 under Innovation (b1)
  await selectBranchByLabel(page, 'Design');

  // Color button should be visible (branch is selected)
  const colorBtn = page.locator('[data-testid="branch-color-btn"]');
  await expect(colorBtn).toBeVisible({ timeout: 5000 });

  // Click color button
  await colorBtn.click();
  await page.waitForTimeout(300);

  // Tooltip should appear explaining the inheritance rule
  const tooltip = page.locator('[data-testid="color-inherit-tooltip"]');
  await expect(tooltip).toBeVisible({ timeout: 5000 });
  await expect(tooltip).toContainText(
    'Sub-branches inherit their BOI colour. Use Personal Style Mode to override.'
  );
});

// ─── AT-LE-081: BOI Wizard is triggered on new map creation ──────────────────

test('AT-LE-081: BOI Wizard appears on new map creation with 7 questions', async ({ page }) => {
  await page.goto(NEW_MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');

  // BOI Wizard should appear within 2 seconds
  const wizard = page.locator('[data-testid="boi-wizard"]');
  await expect(wizard).toBeVisible({ timeout: 2000 });

  // All 7 BOI questions must be present
  for (let i = 1; i <= 7; i++) {
    const question = page.locator(`[data-testid="boi-question-${i}"]`);
    await expect(question).toBeVisible({ timeout: 3000 });
  }

  // Fill in 2 BOI keywords
  await page.locator('[data-testid="boi-question-1"]').fill('Leadership');
  await page.locator('[data-testid="boi-question-2"]').fill('Strategy');

  // Click "Start mapping"
  await page.click('[data-testid="start-mapping-btn"]');
  await page.waitForTimeout(500);

  // Wizard should be dismissed
  await expect(wizard).not.toBeVisible();

  // Branches should be populated on canvas
  const count = await getBranchCount(page);
  expect(count).toBeGreaterThanOrEqual(2);

  // Branch labels should be visible
  const leadership = page.locator('[data-testid^="branch-label-"]').filter({ hasText: /leadership/i });
  await expect(leadership).toHaveCount(1, { timeout: 5000 });
});

// ─── AT-LE-082: Flat map warning fires after 3 minutes ───────────────────────

test('AT-LE-082: Flat map warning fires when all branches are at depth 0 after 3 minutes', async ({
  page,
}) => {
  test.setTimeout(30_000);

  // Install fake clock before navigation
  await page.clock.install();
  await openMap(page, FLAT_MAP_URL);

  // Flat map fixture has 5 BOIs all at depth 0
  const count = await getBranchCount(page);
  expect(count).toBe(5);

  // Advance clock by 3 minutes + 1 second
  await page.clock.fastForward(181_000);
  await page.waitForTimeout(500);

  // Warning toast for LE-082 should appear
  const warnMsg = page.locator('[data-testid="warn-toast-message-LE-082"]');
  await expect(warnMsg).toBeVisible({ timeout: 5000 });
  await expect(warnMsg).toContainText('Buzan recommends using hierarchy');
  await expect(warnMsg).toContainText('A hierarchical structure is far more memorable than a flat list');
});
