import { test, expect } from "../playwright-fixture";

/**
 * Regression test: clicking a page in grid view should navigate
 * the canvas to that exact page — every time, not just the first.
 */
test.describe("Ebook grid view navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ebook-creator/new?tab=design");
    // Wait for the canvas editor to be ready
    await page.waitForSelector('[data-page-id]', { timeout: 15000 });
  });

  /**
   * Helper: open grid view via the LayoutGrid icon button in the
   * right-hand Pages panel footer (the small grid icon next to ≫).
   */
  async function openGridView(page: import("@playwright/test").Page) {
    // The grid view button is in the PageSettingsPanel footer — the LayoutGrid icon
    const gridBtn = page.locator('button:has(svg.lucide-layout-grid)').last();
    await gridBtn.click();
    // Grid view renders page thumbnails wrapped in flex containers
    await page.waitForSelector('.flex.flex-wrap.content-start', { timeout: 5000 });
  }

  /**
   * Helper: click the Nth grid thumbnail (0-indexed) and wait for
   * the canvas to appear with that page visible.
   */
  async function clickGridThumbnail(page: import("@playwright/test").Page, index: number) {
    // Each grid page card lives inside a .flex.items-start wrapper
    const thumbnails = page.locator('.flex.flex-wrap.content-start > .flex.items-start');
    const card = thumbnails.nth(index).locator('.cursor-pointer').first();
    await card.click();
    // After click, grid view should close and canvas should re-appear
    await page.waitForSelector('[data-page-id]', { timeout: 5000 });
  }

  /**
   * Helper: read which page is currently scrolled into view by
   * finding the page element closest to the top of the scroll container.
   */
  async function getVisiblePageId(page: import("@playwright/test").Page): Promise<string | null> {
    return page.evaluate(() => {
      const container = document.querySelector('.flex-1.overflow-auto.no-scrollbar.py-8');
      if (!container) return null;
      const pages = container.querySelectorAll('[data-page-id]');
      let bestId: string | null = null;
      let bestDist = Infinity;
      const containerTop = container.getBoundingClientRect().top;
      pages.forEach(el => {
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = el.getAttribute('data-page-id');
        }
      });
      return bestId;
    });
  }

  /**
   * Helper: collect all page IDs in document order.
   */
  async function getAllPageIds(page: import("@playwright/test").Page): Promise<string[]> {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-page-id]')).map(el => el.getAttribute('data-page-id')!)
    );
  }

  test("first grid click navigates to the selected page", async ({ page }) => {
    const allIds = await getAllPageIds(page);
    expect(allIds.length).toBeGreaterThanOrEqual(4);

    // Pick a page that isn't the first one (e.g. index 3)
    const targetIndex = 3;
    const targetId = allIds[targetIndex];

    await openGridView(page);
    await clickGridThumbnail(page, targetIndex);

    // Allow scroll to settle
    await page.waitForTimeout(600);
    const visibleId = await getVisiblePageId(page);
    expect(visibleId).toBe(targetId);
  });

  test("repeated grid clicks always land on the correct page", async ({ page }) => {
    const allIds = await getAllPageIds(page);
    expect(allIds.length).toBeGreaterThanOrEqual(6);

    // Sequence: pick 3 different pages, open grid → click → verify, repeat
    const targets = [
      { index: 5, id: allIds[5] },
      { index: 1, id: allIds[1] },
      { index: allIds.length - 1, id: allIds[allIds.length - 1] },
    ];

    for (const { index, id } of targets) {
      await openGridView(page);
      await clickGridThumbnail(page, index);
      await page.waitForTimeout(800);

      const visibleId = await getVisiblePageId(page);
      expect(visibleId, `Expected page ${id} (index ${index}) to be visible`).toBe(id);
    }
  });

  test("grid click does not show a blank or broken page", async ({ page }) => {
    const allIds = await getAllPageIds(page);
    const targetIndex = Math.min(4, allIds.length - 1);

    await openGridView(page);
    await clickGridThumbnail(page, targetIndex);
    await page.waitForTimeout(600);

    // The visible page should have child elements (not empty)
    const visibleId = await getVisiblePageId(page);
    expect(visibleId).toBeTruthy();

    const hasContent = await page.evaluate((pid) => {
      const el = document.querySelector(`[data-page-id="${pid}"]`);
      return el ? el.children.length > 0 : false;
    }, visibleId);
    expect(hasContent, "Navigated page should not be empty").toBe(true);
  });
});