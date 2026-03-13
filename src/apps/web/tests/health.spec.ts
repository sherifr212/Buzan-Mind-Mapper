import { test, expect } from '@playwright/test';

// ─── Sprint 9 E2E Health Panel Tests ──────────────────────────────────────────
// AT-HP-001: Health Panel displays all required metrics
// AT-HP-002: Each metric links to Buzan law rationale

const HEALTH_MAP_URL = '/map/test-fixture-health';

async function openHealthMap(page: import('@playwright/test').Page) {
  await page.goto(HEALTH_MAP_URL);
  await page.waitForSelector('[data-testid="canvas-ready"]');
  await page.waitForTimeout(500);
}

async function openHealthPanel(page: import('@playwright/test').Page) {
  const btn = page.locator('[data-testid="health-panel-open-btn"]');
  await btn.click();
  await page.waitForSelector('[data-testid="health-panel"]', { timeout: 3000 });
  await page.waitForTimeout(300);
}

// ─── AT-HP-001: Health Panel displays all required metrics ────────────────────

test('AT-HP-001: Health Panel displays all 8 required metrics with correct values', async ({
  page,
}) => {
  await openHealthMap(page);
  await openHealthPanel(page);

  const panel = page.locator('[data-testid="health-panel"]');
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Central Image = ✓ Compliant
  const ciMetric = page.locator('[data-testid="metric-central-image"]');
  await expect(ciMetric).toBeVisible();
  await expect(ciMetric).toContainText('Compliant');

  // Colours = 4
  const colourMetric = page.locator('[data-testid="metric-colours"]');
  await expect(colourMetric).toBeVisible();
  await expect(colourMetric).toContainText('4');

  // Images = 3
  const imageMetric = page.locator('[data-testid="metric-images"]');
  await expect(imageMetric).toBeVisible();
  await expect(imageMetric).toContainText('3');

  // Arrows = 2
  const arrowMetric = page.locator('[data-testid="metric-arrows"]');
  await expect(arrowMetric).toBeVisible();
  await expect(arrowMetric).toContainText('2');

  // Keyword compliance = 87% (7/8 single-word)
  const kwMetric = page.locator('[data-testid="metric-keyword-compliance"]');
  await expect(kwMetric).toBeVisible();
  await expect(kwMetric).toContainText('87.5%');
  await expect(kwMetric).toContainText('7/8');

  // Max depth = 3
  const depthMetric = page.locator('[data-testid="metric-max-depth"]');
  await expect(depthMetric).toBeVisible();
  await expect(depthMetric).toContainText('3');

  // BOIs = 5
  const boisMetric = page.locator('[data-testid="metric-bois"]');
  await expect(boisMetric).toBeVisible();
  await expect(boisMetric).toContainText('5');

  // Blank lines = 1
  const blankMetric = page.locator('[data-testid="metric-blank-lines"]');
  await expect(blankMetric).toBeVisible();
  await expect(blankMetric).toContainText('1');

  // Radiant Score meter is present
  const score = page.locator('[data-testid="radiant-score"]');
  await expect(score).toBeVisible();
});

// ─── AT-HP-002: Each metric links to Buzan law rationale ─────────────────────

test('AT-HP-002: Clicking Images metric opens rationale popover', async ({ page }) => {
  await openHealthMap(page);
  await openHealthPanel(page);

  // Click the Images metric
  const imageMetric = page.locator('[data-testid="metric-images"]');
  await imageMetric.click();
  await page.waitForTimeout(300);

  // Rationale popover should open
  const popover = page.locator('[data-testid="metric-images-popover"]');
  await expect(popover).toBeVisible({ timeout: 3000 });

  // Should explain the 'Use Emphasis — Images Throughout' law
  await expect(popover).toContainText('Images Throughout');
  await expect(popover).toContainText('Buzan');
});
