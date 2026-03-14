import { test, expect } from '@playwright/test';

const TEST_MAP_ID = 'review-test-map-001';
const TEST_TITLE = 'My Test Map';

// ─── AT-RV-002: Review notification includes Buzan rationale ──────────────────

test('AT-RV-002: Review notification shows Buzan rationale and two action buttons', async ({
  page,
}) => {
  // Navigate to review dashboard with a test map that has a due review
  await page.goto(
    `/reviews?testMapId=${TEST_MAP_ID}&testTitle=${encodeURIComponent(TEST_TITLE)}&forceDue=1`,
  );

  // Notification panel should auto-open
  await expect(page.locator('[data-testid="review-notification-panel"]')).toBeVisible({
    timeout: 3000,
  });

  // Rationale text should include the critical Buzan phrases
  const rationale = page.locator('[data-testid="review-rationale"]').first();
  await expect(rationale).toBeVisible();
  const text = await rationale.textContent();
  expect(text).toContain('is the most critical step');
  expect(text).toContain("according to Buzan's memory research");

  // Two action buttons
  await expect(page.locator('[data-testid="btn-view-original"]').first()).toBeVisible();
  await expect(page.locator('[data-testid="btn-quick-check"]').first()).toBeVisible();
});

// ─── AT-RV-003: Quick Mind Map Check opens blank canvas ───────────────────────

test('AT-RV-003: Quick Mind Map Check presents a blank canvas with recall prompt', async ({
  page,
}) => {
  // Set up a due review
  await page.goto(
    `/reviews?testMapId=${TEST_MAP_ID}&testTitle=${encodeURIComponent(TEST_TITLE)}&forceDue=1`,
  );

  await expect(page.locator('[data-testid="review-notification-panel"]')).toBeVisible({
    timeout: 3000,
  });

  // Click Quick Mind Map Check
  await page.locator('[data-testid="btn-quick-check"]').first().click();

  // Should navigate to the check page
  await page.waitForURL(`**/review/check/${TEST_MAP_ID}`, { timeout: 5000 });

  // Blank canvas with recall prompt
  const header = page.locator('[data-testid="recall-prompt"]');
  await expect(header).toBeVisible({ timeout: 3000 });
  const headerText = await header.textContent();
  expect(headerText).toContain('Recreate your map from memory');

  // Canvas is present (blank)
  await expect(page.locator('[data-testid="canvas-ready"]')).toBeVisible({ timeout: 5000 });

  // Original map is NOT visible (no link/access to original during check)
  // The header says original is hidden
  const subtext = page.locator('[data-testid="quick-check-header"]');
  const subtextContent = await subtext.textContent();
  expect(subtextContent).toContain('Original map is hidden during this check');
});

// ─── AT-RV-004: Recall map is compared with original after check ──────────────

test('AT-RV-004: Comparison view shows missed/new/recalled colour-coded branches', async ({
  page,
}) => {
  // Navigate directly to check page (blank canvas)
  await page.goto(`/review/check/${TEST_MAP_ID}`);
  await expect(page.locator('[data-testid="canvas-ready"]')).toBeVisible({ timeout: 5000 });

  // Save recall (no branches → shows empty diff)
  await page.locator('[data-testid="save-recall-btn"]').click();
  await page.waitForTimeout(500);

  // Comparison view appears
  await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible({ timeout: 3000 });

  // Colour-coded summary panels present
  // Blue = recalled, amber = missed, green = new
  const compView = page.locator('[data-testid="comparison-view"]');
  await expect(compView).toBeVisible();

  // Verify the view has the correct colour panels (stats summary always shown)
  const viewText = await compView.textContent();
  expect(viewText).toContain('Recalled (blue)');
  expect(viewText).toContain('Missed (amber)');
  expect(viewText).toContain('New (green)');

  // Close button should work
  await expect(page.locator('[data-testid="comparison-close-btn"]')).toBeVisible();
});

// ─── AT-RV-005: Long-Term Memory badge after 6th review ─────────────────────

test('AT-RV-005: Map shows Long-Term Memory badge and is in Archive after 6 reviews', async ({
  page,
}) => {
  const ltmMapId = 'review-ltm-test-002';

  // Navigate with forceComplete=1 to simulate all 6 reviews done
  await page.goto(
    `/reviews?testMapId=${ltmMapId}&testTitle=LTM+Test+Map&forceComplete=1`,
  );

  // Long-Term Memory badge should appear in Archive section
  const ltmBadge = page.locator(`[data-testid="ltm-badge-${ltmMapId}"]`);
  await expect(ltmBadge).toBeVisible({ timeout: 3000 });
  const badgeText = await ltmBadge.textContent();
  expect(badgeText).toContain('Long-Term Memory');

  // The map should be in the Archive section
  const archiveSection = page.locator('[data-testid="archive-section"]');
  await expect(archiveSection).toBeVisible();
  const archivedMap = page.locator(`[data-testid="archived-map-${ltmMapId}"]`);
  await expect(archivedMap).toBeVisible();

  // Annual review reminder text visible
  const archiveText = await archiveSection.textContent();
  expect(archiveText).toContain('Annual review');
});
