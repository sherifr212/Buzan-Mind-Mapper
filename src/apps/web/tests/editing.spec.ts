import { test, expect } from '@playwright/test';

// ─── Sprint 6 E2E Editing Tests ───────────────────────────────────────────────
// AT-ED-001: Tab key adds child branch
// AT-ED-002: Enter key adds sibling branch
// AT-ED-003: Delete key removes selected branch and subtree
// AT-ED-010: Blank branch is created with blankLine=true
// AT-ED-011: Clicking blank branch shows Buzan coaching message
// AT-ED-030: Undo reverts last branch creation
// AT-ED-031: Undo and Redo work across 50 consecutive operations

const MAP_URL = '/map/test-fixture-simple';

async function openMap(page: import('@playwright/test').Page) {
  await page.goto(MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForSelector('[data-testid^="branch-label-"]', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function getBranchCount(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.locator('[data-testid="branch-count"]').textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/** Click a branch node and wait for the store's selectedBranchId to populate. */
async function selectBranchByLabel(page: import('@playwright/test').Page, label: string) {
  const node = page.locator('[data-testid^="branch-label-"]').filter({ hasText: new RegExp(label, 'i') }).first();
  await node.click({ force: true });
  // Wait for the hidden selected-branch-id span to be populated
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="selected-branch-id"]');
      return !!(el && el.textContent && el.textContent.trim().length > 0);
    },
    { timeout: 5000 }
  );
  await page.waitForTimeout(200);
}

// ─── AT-ED-001: Tab adds child branch ─────────────────────────────────────────

test('AT-ED-001: Tab key adds a child branch', async ({ page }) => {
  await openMap(page);
  const before = await getBranchCount(page);

  await selectBranchByLabel(page, 'INNOVATION');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  const after = await getBranchCount(page);
  expect(after).toBe(before + 1);

  // New branch should be in edit mode (input visible)
  const input = page.locator('[data-testid^="branch-input-"]');
  await expect(input).toBeVisible({ timeout: 5000 });
});

// ─── AT-ED-002: Enter adds sibling branch ─────────────────────────────────────

test('AT-ED-002: Enter key adds a sibling branch', async ({ page }) => {
  await openMap(page);
  const before = await getBranchCount(page);

  await selectBranchByLabel(page, 'STRATEGY');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const after = await getBranchCount(page);
  expect(after).toBe(before + 1);

  const input = page.locator('[data-testid^="branch-input-"]');
  await expect(input).toBeVisible({ timeout: 5000 });
});

// ─── AT-ED-003: Delete removes selected branch and subtree ────────────────────

test('AT-ED-003: Delete key removes selected branch and its subtree', async ({ page }) => {
  await openMap(page);

  // INNOVATION has 2 children (subtree = 3 nodes total, ≤5 so no confirm)
  await selectBranchByLabel(page, 'INNOVATION');
  const before = await getBranchCount(page);

  await page.keyboard.press('Delete');
  await page.waitForTimeout(500);

  const after = await getBranchCount(page);
  expect(after).toBe(before - 3);

  const innovationNodes = page.locator('[data-testid^="branch-label-"]').filter({ hasText: /INNOVATION/i });
  await expect(innovationNodes).toHaveCount(0);
});

// ─── AT-ED-010: Blank branch is created as a visual placeholder ───────────────

test('AT-ED-010: Blank branch is created with blankLine=true (dashed style)', async ({ page }) => {
  await openMap(page);
  const before = await getBranchCount(page);

  await page.click('[data-testid="add-blank-line-btn"]');
  await page.waitForTimeout(500);

  const after = await getBranchCount(page);
  expect(after).toBe(before + 1);

  const blankBranch = page.locator('[data-testid^="blank-branch-"]');
  await expect(blankBranch).toBeVisible({ timeout: 5000 });
});

// ─── AT-ED-011: Clicking blank branch shows coaching message ──────────────────

test('AT-ED-011: Clicking a blank branch shows Buzan coaching message', async ({ page }) => {
  await openMap(page);

  await page.click('[data-testid="add-blank-line-btn"]');
  await page.waitForTimeout(500);

  const blankBranch = page.locator('[data-testid^="blank-branch-"]').first();
  await blankBranch.click({ force: true });
  await page.waitForTimeout(300);

  const coaching = page.locator('[data-testid="blank-branch-coaching"]');
  await expect(coaching).toBeVisible({ timeout: 5000 });
  await expect(coaching).toContainText(
    'Blank branches challenge your brain to complete what has been left unfinished'
  );
});

// ─── AT-ED-030: Undo reverts last branch creation ─────────────────────────────

test('AT-ED-030: Undo reverts last branch creation', async ({ page }) => {
  await openMap(page);
  const before = await getBranchCount(page);

  await page.click('[data-testid="add-blank-line-btn"]');
  await page.waitForTimeout(500);

  const afterAdd = await getBranchCount(page);
  expect(afterAdd).toBe(before + 1);

  await page.click('[data-testid="undo-btn"]');
  await page.waitForTimeout(500);

  const afterUndo = await getBranchCount(page);
  expect(afterUndo).toBe(before);
});

// ─── AT-ED-031: Undo and Redo across 50 operations ────────────────────────────

test('AT-ED-031: Undo and Redo work across 50 consecutive operations', async ({ page }) => {
  test.setTimeout(120_000);
  await openMap(page);
  const initial = await getBranchCount(page);

  for (let i = 0; i < 50; i++) {
    await page.click('[data-testid="add-blank-line-btn"]');
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);

  const afterAdd = await getBranchCount(page);
  expect(afterAdd).toBe(initial + 50);

  for (let i = 0; i < 50; i++) {
    await page.click('[data-testid="undo-btn"]');
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(500);

  const afterUndo = await getBranchCount(page);
  expect(afterUndo).toBe(initial);

  for (let i = 0; i < 50; i++) {
    await page.click('[data-testid="redo-btn"]');
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(500);

  const afterRedo = await getBranchCount(page);
  expect(afterRedo).toBe(initial + 50);
});
