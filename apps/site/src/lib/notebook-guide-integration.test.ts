import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const componentSource = (name: string) =>
  readFileSync(new URL(`../components/${name}`, import.meta.url), "utf8");

const notebookSource = (name: string) => componentSource(`ui/notebook/${name}`);

const siteSource = (name: string) =>
  readFileSync(new URL(`../../${name}`, import.meta.url), "utf8");
const require = createRequire(import.meta.url);

describe("guide composition with Caderno UI", () => {
  it("resolves isolated content before the default TypeScript path alias", () => {
    const config = siteSource("astro.config.mjs");
    const tests = siteSource("vitest.config.ts");

    expect(config).toContain("find: '@content', replacement: syncedContentDirectory");
    expect(config).toContain("enforce: 'post'");
    expect(config).toContain("process.env.SITE_SYNCED_CONTENT_DIR");
    expect(tests).toContain("process.env.SITE_SYNCED_CONTENT_DIR");
  });

  it("consumes the library theme and scrollbar without redefining them", () => {
    const layout = siteSource("src/layouts/BaseLayout.astro");
    const styles = siteSource("src/styles/global.css");

    expect(layout).toContain("@caderno-ui/tokens/notebook.css");
    expect(layout).toContain("@caderno-ui/elements/scrollbar.css");
    expect(styles).toContain("--site-base-bg: var(--cad-bg)");
    expect(styles).toContain("--site-base-link: var(--cad-link)");
    expect(styles).not.toMatch(/--cad-[\w-]+\s*:/);
    expect(styles).not.toContain("::-webkit-scrollbar");
    expect(styles).not.toContain("--site-scrollbar-");
  });

  it("adopts flat cards and does not turn decorative step colors into progress", () => {
    const card = notebookSource("NotebookCard.astro");
    const method = notebookSource("NotebookMethodChain.astro");

    expect(card).toContain("cornerFold = false");
    expect(method).not.toMatch(/<CadStep\s[^>]*tone=/);
    expect(method).not.toContain('status="complete"');
    expect(method).not.toContain('status="current"');
  });

  it("uses the canonical method, local index, cards, links and dividers", () => {
    const page = componentSource("PreparationSubjectPage.astro");
    const rail = componentSource("PreparationChapterRail.astro");
    const pager = componentSource("PreparationChapterPager.astro");

    expect(page).toContain("<NotebookMethodChain");
    expect(page).toContain("<NotebookManualProse");
    expect(page).toContain("<NotebookDivider");
    expect(rail).toContain("<NotebookTOC");
    expect(rail).toContain("<NotebookCard");
    expect(rail).toContain("<NotebookLink");
    expect(pager).toContain("<NotebookCard");
    expect(pager).toContain("<NotebookDivider");
    expect(`${page}\n${rail}\n${pager}`).not.toContain("wired-");
  });

  it("renders Markdown through shared editorial contracts", () => {
    const prose = notebookSource("NotebookManualProse.astro");

    expect(prose).toContain("@caderno-ui/elements/prose.css");
    expect(prose).toContain("@caderno-ui/elements/prose");
    expect(prose).toContain("installCadernoProse()");
    expect(prose).not.toContain("@/styles/notebook-");
    expect(prose).not.toContain("classList.add");
    expect(prose).not.toContain("<style>");
  });

  it("keeps product-facing names as thin Caderno UI facades", () => {
    const facades = [
      ["NotebookBookmark.astro", "@caderno-ui/astro/Bookmark.astro"],
      ["NotebookBreadcrumb.astro", "@caderno-ui/astro/Breadcrumb.astro"],
      ["NotebookCard.astro", "@caderno-ui/astro/Card.astro"],
      ["NotebookDivider.astro", "@caderno-ui/astro/Divider.astro"],
      ["NotebookLink.astro", "@caderno-ui/astro/Link.astro"],
      ["NotebookSticker.astro", "@caderno-ui/astro/Sticker.astro"],
    ] as const;

    facades.forEach(([component, cadernoImport]) => {
      const source = notebookSource(component);
      expect(source).toContain(cadernoImport);
      expect(source).not.toContain("<style>");
    });

    const card = notebookSource("NotebookCard.astro");
    expect(card).toContain("@caderno-ui/astro/CardHeader.astro");
    expect(card).toContain("@caderno-ui/astro/CardTitle.astro");
    expect(card).toContain("@caderno-ui/astro/CardContent.astro");
    expect(card).not.toContain("heading={title}");
    expect(card).not.toContain("icon={icon}");
  });

  it("delegates method steps and doodle rendering to Caderno UI", () => {
    const method = notebookSource("NotebookMethodChain.astro");
    const astroIcon = notebookSource("DoodleIcon.astro");
    const svelteIcon = notebookSource("DoodleIcon.svelte");

    expect(method).toContain("@caderno-ui/astro/Steps.astro");
    expect(method).toContain("@caderno-ui/astro/Step.astro");
    expect(method).not.toContain("<style>");
    expect(astroIcon).toContain("@caderno-ui/astro/Icon.astro");
    expect(svelteIcon).toContain("@caderno-ui/elements/icon");
    expect(`${astroIcon}\n${svelteIcon}`).not.toContain("<svg");
  });

  it("keeps decorative charts out of the guide index", () => {
    const page = componentSource("PreparationIndexPage.astro");

    expect(page).not.toContain("@caderno-ui/astro/Chart.astro");
    expect(page).not.toContain("@caderno-ui/astro/ChartItem.astro");
    expect(page).not.toContain("data-preparation-overview");
  });

  it("uses matching syntax colors for the light and dark notebook themes", () => {
    const astroConfig = siteSource("astro.config.mjs");
    const codeStyles = readFileSync(
      require.resolve("@caderno-ui/elements/prose.css"),
      "utf8",
    );

    expect(astroConfig).toContain("light: 'github-light'");
    expect(astroConfig).toContain("dark: 'github-dark'");
    expect(astroConfig).toContain("defaultColor: false");
    expect(codeStyles).toContain("color: var(--shiki-light)");
    expect(codeStyles).toContain("color: var(--shiki-dark)");
  });
});
