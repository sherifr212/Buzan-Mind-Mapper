import { test, expect } from '@playwright/test';

test('app loads without crashing', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Radiant Mind/);
  await expect(page.getByRole('heading', { name: /Radiant Mind/i })).toBeVisible();
});
