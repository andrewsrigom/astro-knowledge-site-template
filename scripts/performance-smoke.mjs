import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const distRoot = path.join(repoRoot, "apps/site/dist");
const astroRoot = path.join(distRoot, "_astro");
const pagefindRoot = path.join(distRoot, "pagefind");

const budgets = {
  astro: {
    largestAsyncChunkBytes: 750_000,
    pageCssBytes: 150_000,
    pageJsBytes: 750_000,
  },
  html: {
    brotliBytes: 18_000,
    gzipBytes: 28_000,
    rawBytes: 260_000,
  },
  pagefind: {
    highlightJsBytes: 50_000,
    pagefindJsBytes: 40_000,
    pagefindUiJsBytes: 90_000,
    wasmBytes: 70_000,
  },
};

async function walkFiles(rootPath, predicate, files = []) {
  let entries;

  try {
    entries = await readdir(rootPath, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return files;
    }

    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      await walkFiles(fullPath, predicate, files);
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function listSizedFiles(rootPath, extension) {
  const files = await walkFiles(rootPath, (fullPath) =>
    fullPath.endsWith(extension),
  );

  return Promise.all(
    files.map(async (fullPath) => ({
      fullPath,
      relativePath: path.relative(distRoot, fullPath).replace(/\\/g, "/"),
      size: (await stat(fullPath)).size,
    })),
  );
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(1)} KiB`;
}

function assertWithinBudget(label, actual, budgetValue, failures) {
  if (actual <= budgetValue) {
    return;
  }

  failures.push(
    `${label} exceeded budget: ${formatBytes(actual)} > ${formatBytes(budgetValue)}`,
  );
}

async function resolveFirstMatch(rootPath, matcher) {
  const files = await walkFiles(rootPath, matcher);
  const sortedFiles = files
    .map((fullPath) => path.relative(distRoot, fullPath).replace(/\\/g, "/"))
    .sort((left, right) => left.localeCompare(right));

  return sortedFiles[0] ?? null;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function collectHtmlAssetPaths(contents, extension) {
  const matches = contents.matchAll(
    new RegExp(`/_astro/[A-Za-z0-9_@./-]+\\.${extension}`, "g"),
  );

  return new Set([...matches].map((match) => match[0].slice(1)));
}

const staticJsDependencyCache = new Map();

async function collectStaticJsDependencies(relativePath, visiting = new Set()) {
  if (staticJsDependencyCache.has(relativePath)) {
    return staticJsDependencyCache.get(relativePath);
  }

  if (visiting.has(relativePath)) {
    return new Set();
  }

  visiting.add(relativePath);

  const fullPath = path.join(distRoot, relativePath);
  const contents = await readFile(fullPath, "utf8");
  const dependencies = new Set([relativePath]);
  const importPattern = /(?:from\s*|import\s*)["'](\.\/[^"']+\.js)["']/g;

  for (const match of contents.matchAll(importPattern)) {
    const dependencyPath = path
      .normalize(path.join(path.dirname(relativePath), match[1]))
      .replace(/\\/g, "/");

    for (const nestedPath of await collectStaticJsDependencies(
      dependencyPath,
      visiting,
    )) {
      dependencies.add(nestedPath);
    }
  }

  visiting.delete(relativePath);
  staticJsDependencyCache.set(relativePath, dependencies);

  return dependencies;
}

async function collectPageAssetUsage() {
  const htmlFiles = await walkFiles(distRoot, (fullPath) =>
    fullPath.endsWith(".html"),
  );
  const sizedAssets = new Map();

  for (const file of [...jsFiles, ...cssFiles]) {
    sizedAssets.set(file.relativePath, file.size);
  }

  const pages = [];

  for (const fullPath of htmlFiles) {
    const contents = await readFile(fullPath, "utf8");
    const relativePath = path.relative(distRoot, fullPath).replace(/\\/g, "/");
    const cssPaths = collectHtmlAssetPaths(contents, "css");
    const directJsPaths = collectHtmlAssetPaths(contents, "js");
    const jsPaths = new Set();

    for (const jsPath of directJsPaths) {
      for (const dependencyPath of await collectStaticJsDependencies(jsPath)) {
        jsPaths.add(dependencyPath);
      }
    }

    pages.push({
      cssBytes: [...cssPaths].reduce(
        (sum, assetPath) => sum + (sizedAssets.get(assetPath) ?? 0),
        0,
      ),
      jsBytes: [...jsPaths].reduce(
        (sum, assetPath) => sum + (sizedAssets.get(assetPath) ?? 0),
        0,
      ),
      relativePath,
    });
  }

  return pages;
}

async function collectCriticalHtmlPages() {
  const candidates = [
    "index.html",
    "articles/index.html",
    "tracks/index.html",
    "challenges/index.html",
    "pt-br/index.html",
  ];
  const detailCandidates = [
    await resolveFirstMatch(
      path.join(distRoot, "articles"),
      (fullPath) =>
        fullPath.endsWith("/index.html") &&
        /articles\/.+\/.+\/index\.html$/.test(fullPath.replace(/\\/g, "/")),
    ),
    await resolveFirstMatch(
      path.join(distRoot, "tracks"),
      (fullPath) =>
        fullPath.endsWith("/index.html") &&
        /tracks\/.+\/index\.html$/.test(fullPath.replace(/\\/g, "/")),
    ),
    await resolveFirstMatch(
      path.join(distRoot, "challenges"),
      (fullPath) =>
        fullPath.endsWith("/index.html") &&
        /challenges\/.+\/index\.html$/.test(fullPath.replace(/\\/g, "/")),
    ),
  ];

  const uniqueCandidates = [
    ...new Set([...candidates, ...detailCandidates.filter(Boolean)]),
  ];
  const resolvedCandidates = [];

  for (const relativePath of uniqueCandidates) {
    if (await pathExists(path.join(distRoot, relativePath))) {
      resolvedCandidates.push(relativePath);
    }
  }

  return resolvedCandidates;
}

const jsFiles = await listSizedFiles(astroRoot, ".js");
const cssFiles = await listSizedFiles(astroRoot, ".css");
const failures = [];

const totalJsBytes = jsFiles.reduce((sum, file) => sum + file.size, 0);
const totalCssBytes = cssFiles.reduce((sum, file) => sum + file.size, 0);
const largestJsFile = jsFiles.reduce(
  (largest, file) => (file.size > largest.size ? file : largest),
  jsFiles[0],
);
const largestCssFile = cssFiles.reduce(
  (largest, file) => (file.size > largest.size ? file : largest),
  cssFiles[0],
);
const pageAssetUsage = await collectPageAssetUsage();
const largestJsPage = pageAssetUsage.reduce(
  (largest, page) => (page.jsBytes > largest.jsBytes ? page : largest),
  pageAssetUsage[0],
);
const largestCssPage = pageAssetUsage.reduce(
  (largest, page) => (page.cssBytes > largest.cssBytes ? page : largest),
  pageAssetUsage[0],
);

if (largestJsPage) {
  assertWithinBudget(
    `Largest page JS (${largestJsPage.relativePath})`,
    largestJsPage.jsBytes,
    budgets.astro.pageJsBytes,
    failures,
  );
}

if (largestCssPage) {
  assertWithinBudget(
    `Largest page CSS (${largestCssPage.relativePath})`,
    largestCssPage.cssBytes,
    budgets.astro.pageCssBytes,
    failures,
  );
}

if (largestJsFile) {
  assertWithinBudget(
    `Largest async JS chunk (${largestJsFile.relativePath})`,
    largestJsFile.size,
    budgets.astro.largestAsyncChunkBytes,
    failures,
  );
}

for (const [relativePath, budgetValue] of [
  ["pagefind/pagefind.js", budgets.pagefind.pagefindJsBytes],
  ["pagefind/pagefind-ui.js", budgets.pagefind.pagefindUiJsBytes],
  ["pagefind/pagefind-highlight.js", budgets.pagefind.highlightJsBytes],
]) {
  const fullPath = path.join(distRoot, relativePath);
  const size = (await stat(fullPath)).size;
  assertWithinBudget(`${relativePath}`, size, budgetValue, failures);
}

const pagefindRuntimeFiles = await listSizedFiles(pagefindRoot, ".pagefind");

for (const wasmFile of pagefindRuntimeFiles.filter((file) =>
  /\/?wasm\..+\.pagefind$/.test(file.relativePath),
)) {
  assertWithinBudget(
    `${wasmFile.relativePath}`,
    wasmFile.size,
    budgets.pagefind.wasmBytes,
    failures,
  );
}

for (const relativePath of await collectCriticalHtmlPages()) {
  const fullPath = path.join(distRoot, relativePath);
  const contents = await readFile(fullPath);

  assertWithinBudget(
    `${relativePath} raw HTML`,
    contents.length,
    budgets.html.rawBytes,
    failures,
  );
  assertWithinBudget(
    `${relativePath} gzip HTML`,
    gzipSync(contents).length,
    budgets.html.gzipBytes,
    failures,
  );
  assertWithinBudget(
    `${relativePath} brotli HTML`,
    brotliCompressSync(contents).length,
    budgets.html.brotliBytes,
    failures,
  );
}

console.log(
  `[perf-smoke] emitted JS: ${formatBytes(totalJsBytes)} across ${jsFiles.length} code-split files`,
);
console.log(
  `[perf-smoke] emitted CSS: ${formatBytes(totalCssBytes)} across ${cssFiles.length} route files`,
);

if (largestJsPage) {
  console.log(
    `[perf-smoke] largest page JS: ${largestJsPage.relativePath} (${formatBytes(largestJsPage.jsBytes)})`,
  );
}

if (largestCssPage) {
  console.log(
    `[perf-smoke] largest page CSS: ${largestCssPage.relativePath} (${formatBytes(largestCssPage.cssBytes)})`,
  );
}

if (largestJsFile) {
  console.log(
    `[perf-smoke] largest async JS chunk: ${largestJsFile.relativePath} (${formatBytes(largestJsFile.size)})`,
  );
}

if (failures.length > 0) {
  throw new Error(
    `Performance smoke failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
}

console.log("[perf-smoke] budgets are within range");
