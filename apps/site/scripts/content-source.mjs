import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SECTION_MANIFEST_FILE = "collections.manifest.json";
const SYNC_TARGETS = [
  "articles",
  "concepts",
  "glossary",
  "challenges",
  "preparation",
  "roadmaps",
];
const SUPPORTED_PAGE_TYPES = [
  "articles",
  "tracks",
  "topics",
  "concepts",
  "glossary",
  "challenges",
  "preparation",
];
const TARGET_BY_PAGE_TYPE = {
  articles: "articles",
  challenges: "challenges",
  concepts: "concepts",
  glossary: "glossary",
  preparation: "preparation",
  tracks: "roadmaps",
};

export { SECTION_MANIFEST_FILE, SYNC_TARGETS };

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = path.resolve(siteRoot, "..", "..");
const localConfigPath = path.join(repoRoot, ".local", "content-source.json");
const starterContentRoot = path.join(repoRoot, "examples", "starter-content");
const legacyLocalFallbackContentRoot = path.join(siteRoot, "src", "content");
const syncedContentRoot = process.env.SITE_SYNCED_CONTENT_DIR?.trim()
  ? path.resolve(process.env.SITE_SYNCED_CONTENT_DIR)
  : path.join(siteRoot, ".content");

function normalizePath(value) {
  if (!value) {
    return null;
  }

  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
}

function getLocalizedText(value) {
  return value && typeof value === "object" ? value : null;
}

function assertSectionManifest(manifest) {
  if (
    !manifest ||
    typeof manifest !== "object" ||
    !Array.isArray(manifest.sections)
  ) {
    throw new Error("Invalid section manifest: `sections` must be an array.");
  }

  const seenPageTypes = new Set();
  const seenSectionIds = new Set();
  const seenRoutes = {
    en: new Set(),
    "pt-br": new Set(),
  };

  for (const section of manifest.sections) {
    if (!section?.id || typeof section.id !== "string") {
      throw new Error(
        "Invalid section manifest: each section must define `id`.",
      );
    }

    if (seenSectionIds.has(section.id)) {
      throw new Error(
        `Invalid section manifest: duplicate section id (${section.id}).`,
      );
    }

    seenSectionIds.add(section.id);

    if (!section?.pageType || typeof section.pageType !== "string") {
      throw new Error(
        `Invalid section manifest: section ${section.id} must define \`pageType\`.`,
      );
    }

    if (!SUPPORTED_PAGE_TYPES.includes(section.pageType)) {
      throw new Error(
        `Invalid section manifest: section ${section.id} uses unsupported pageType (${section.pageType}).`,
      );
    }

    if (seenPageTypes.has(section.pageType)) {
      throw new Error(
        `Invalid section manifest: duplicate pageType (${section.pageType}). The shell supports a single section per pageType.`,
      );
    }

    seenPageTypes.add(section.pageType);

    if (
      !getLocalizedText(section.routes)?.en ||
      !getLocalizedText(section.routes)?.["pt-br"]
    ) {
      throw new Error(
        `Invalid section manifest: section ${section.id} must define EN and PT-BR routes.`,
      );
    }

    if (
      !getLocalizedText(section.labels)?.en ||
      !getLocalizedText(section.labels)?.["pt-br"]
    ) {
      throw new Error(
        `Invalid section manifest: section ${section.id} must define EN and PT-BR labels.`,
      );
    }

    for (const locale of ["en", "pt-br"]) {
      const route = section.routes[locale];

      if (seenRoutes[locale].has(route)) {
        throw new Error(
          `Invalid section manifest: duplicate route in ${locale} (${route}).`,
        );
      }

      seenRoutes[locale].add(route);
    }
  }

  return manifest;
}

export async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readContentSourceConfig() {
  try {
    const content = await readFile(localConfigPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

export async function writeContentSourceConfig(config) {
  await mkdir(path.dirname(localConfigPath), { recursive: true });
  await writeFile(
    localConfigPath,
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8",
  );
}

export function getSyncedContentRoot() {
  return syncedContentRoot;
}

export function getStarterContentRoot() {
  return starterContentRoot;
}

export function getSyncedCollectionDir(collection) {
  return path.join(syncedContentRoot, collection);
}

export function getSyncedSectionManifestPath() {
  return path.join(syncedContentRoot, "sections.manifest.mjs");
}

export async function resolveContentRoot({
  requireConfigured = false,
  requireExternal = false,
} = {}) {
  const config = await readContentSourceConfig();
  const configuredContentRoot = normalizePath(
    process.env.SITE_CONTENT_DIR ?? config.contentRoot,
  );

  if (configuredContentRoot) {
    if (
      requireExternal &&
      path.resolve(configuredContentRoot) === path.resolve(starterContentRoot)
    ) {
      return null;
    }

    return configuredContentRoot;
  }

  if (!requireExternal && (await pathExists(starterContentRoot))) {
    return starterContentRoot;
  }

  if (
    !requireConfigured &&
    !requireExternal &&
    (await pathExists(legacyLocalFallbackContentRoot))
  ) {
    return legacyLocalFallbackContentRoot;
  }

  return null;
}

export async function readSectionManifest(options = {}) {
  const contentRoot = await resolveContentRoot(options);

  if (!contentRoot) {
    return null;
  }

  const manifestPath = path.join(contentRoot, SECTION_MANIFEST_FILE);
  const content = await readFile(manifestPath, "utf8");

  return {
    contentRoot,
    manifest: assertSectionManifest(JSON.parse(content)),
    manifestPath,
  };
}

export function getSectionTargetCollection(section) {
  return TARGET_BY_PAGE_TYPE[section.pageType] ?? null;
}

export async function resolveCollectionSources(options = {}) {
  const resolvedManifest = await readSectionManifest(options);

  if (!resolvedManifest) {
    return {
      contentRoot: null,
      entries: [],
      manifest: null,
      manifestPath: null,
    };
  }

  const { contentRoot, manifest, manifestPath } = resolvedManifest;
  const entries = manifest.sections.flatMap((section) => {
    const targetCollection = getSectionTargetCollection(section);

    if (!targetCollection || !section.sourceDir) {
      return [];
    }

    return [
      {
        collection: targetCollection,
        sectionId: section.id,
        sourceDir: path.join(contentRoot, section.sourceDir),
        targetDir: getSyncedCollectionDir(targetCollection),
      },
    ];
  });

  return {
    contentRoot,
    entries,
    manifest,
    manifestPath,
  };
}
