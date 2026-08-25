import { expect, test } from "@playwright/test";

const guidePath = "/pt-br/guia";

test.describe("Caderno UI package integration", () => {
  test("renders an accessible chart in the real guide overview", async ({
    page,
  }) => {
    await page.goto(guidePath);

    const chart = page.locator("cad-chart");
    await chart.waitFor();
    await page.evaluate(() => customElements.whenDefined("cad-chart"));

    await expect(
      chart.getByRole("table", { name: "Capítulos por volume" }),
    ).toBeAttached();
    await expect(chart.locator("svg")).toBeVisible();
    await expect(chart.locator("cad-chart-item")).not.toHaveCount(0);
  });

  test("uses Caderno primitives through real volume and chapter screens", async ({
    page,
  }) => {
    await page.goto(guidePath);
    const volumeHref = await page
      .locator("[data-preparation-volume-list] > a")
      .first()
      .getAttribute("href");
    expect(volumeHref).toBeTruthy();

    await page.goto(volumeHref!);
    await page.evaluate(() => customElements.whenDefined("cad-breadcrumb"));
    await expect(page.locator("cad-breadcrumb")).toBeVisible();

    const chapterHref = await page
      .locator("[data-preparation-chapter-list] ol a")
      .first()
      .getAttribute("href");
    expect(chapterHref).toBeTruthy();

    await page.goto(chapterHref!);
    await Promise.all([
      page.evaluate(() => customElements.whenDefined("cad-bookmark")),
      page.evaluate(() => customElements.whenDefined("cad-card")),
      page.evaluate(() => customElements.whenDefined("cad-divider")),
      page.evaluate(() => customElements.whenDefined("cad-sticker")),
    ]);

    await expect(page.locator("cad-breadcrumb")).toBeVisible();
    await expect(page.locator("cad-bookmark")).toBeVisible();
    await expect(page.locator("cad-divider").first()).toBeVisible();
    await expect(page.locator("cad-sticker").first()).toBeVisible();
    await expect(page.locator("cad-card").first()).toBeVisible();
  });

  test("persists a chapter bookmark with the SeniorPath storage namespace", async ({
    page,
  }) => {
    await page.goto(guidePath);
    const volumeHref = await page
      .locator("[data-preparation-volume-list] > a")
      .first()
      .getAttribute("href");
    await page.goto(volumeHref!);
    const chapterHref = await page
      .locator("[data-preparation-chapter-list] ol a")
      .first()
      .getAttribute("href");
    await page.goto(chapterHref!);
    await page.evaluate(() => customElements.whenDefined("cad-bookmark"));

    const bookmark = page.locator("cad-bookmark");
    const bookmarkId = await bookmark.getAttribute("bookmark-id");
    expect(bookmarkId).toBeTruthy();
    const storageKey = `seniorpath:notebook-bookmark:${bookmarkId}`;
    const button = bookmark.getByRole("button");

    await page.evaluate((key) => localStorage.removeItem(key), storageKey);
    await page.reload();
    await page.evaluate(() => customElements.whenDefined("cad-bookmark"));
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey))
      .toBe("true");
  });

  test("does not expose a second component laboratory", async ({ request }) => {
    for (const path of [
      "/pt-br/laboratorio/caderno-ui",
      "/pt-br/laboratorio/tokens",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    }
  });
});

test.describe("Caderno UI progressive enhancement", () => {
  test.use({ javaScriptEnabled: false });

  test("keeps chart data and navigation readable without JavaScript", async ({
    page,
  }) => {
    await page.goto(guidePath);

    const chartItems = page.locator("cad-chart cad-chart-item");
    await expect(chartItems).not.toHaveCount(0);
    await expect(chartItems.first()).toContainText("Volume");
    await expect(
      page.locator("[data-preparation-volume-list] a").first(),
    ).toBeVisible();
  });
});
