import { expect, test } from "@playwright/test";

const guidePath = "/pt-br/guia";

test.describe("Caderno UI package integration", () => {
  test("uses the published white theme even when the system prefers dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const response = await page.goto(guidePath);
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const tokens = await page.locator("html").evaluate((root) => {
      const style = getComputedStyle(root);
      const read = (name: string) => style.getPropertyValue(name).trim();
      return {
        background: read("--cad-bg"),
        siteBackground: read("--site-bg"),
        link: read("--cad-link"),
        siteLink: read("--site-link-hover"),
        scrollbarSize: read("--cad-scrollbar-size"),
      };
    });

    expect(tokens.background).toBe("#fff");
    expect(tokens.siteBackground).toBe(tokens.background);
    expect(tokens.link).toBe("#005bac");
    expect(tokens.siteLink).toBe(tokens.link);
    expect(tokens.scrollbarSize).toBe("10px");
  });

  test("keeps aggregate charts out of the guide overview", async ({ page }) => {
    await page.goto(guidePath);
    await expect(page.locator("cad-chart")).toHaveCount(0);
    await expect(page.getByText("Capítulos por volume")).toHaveCount(0);
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
    expect(volumeHref).toContain("/volumes/caderno-ui");

    await page.goto(volumeHref!, { waitUntil: "networkidle" });
    await page.evaluate(() => customElements.whenDefined("cad-breadcrumb"));
    await expect(page.locator("cad-breadcrumb")).toBeVisible();

    const chapterHref = await page
      .locator("[data-preparation-chapter-list] ol a")
      .first()
      .getAttribute("href");
    expect(chapterHref).toBeTruthy();
    expect(chapterHref).toContain("/guia/caderno-fundamentos");

    await page.goto(chapterHref!, { waitUntil: "networkidle" });
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
    await expect(page.locator("cad-card").first()).not.toHaveAttribute("folded");
    await expect(page.locator("cad-step[tone]")).toHaveCount(0);
    await expect(page.locator('cad-step [slot="title"]').first()).toHaveText("Contrato");
    const method = page.locator("cad-steps").first();
    await expect.poll(() => method.evaluate((element) => {
      const edge = element.getBoundingClientRect().right;
      return [...element.querySelectorAll("cad-step")].every(
        (step) => step.getBoundingClientRect().right <= edge + 1,
      );
    })).toBe(true);
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

  test("keeps guide navigation readable without JavaScript", async ({
    page,
  }) => {
    await page.goto(guidePath);

    await expect(page.locator("cad-chart")).toHaveCount(0);
    await expect(
      page.locator("[data-preparation-volume-list] a").first(),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
});
