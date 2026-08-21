import { fileURLToPath } from 'node:url'

import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { getBuildEnv } from './scripts/build-env.mjs'
import { shouldIncludeInSitemap } from './scripts/sitemap-filter.mjs'
import remarkMermaidDiagrams from './src/lib/remark-mermaid-diagrams.mjs'

const defaultSiteUrl = 'https://example.com'
const localPreviewSiteUrl = 'http://127.0.0.1:4321'
const buildEnv = getBuildEnv()

function normalizeSiteUrl(value, { assumeHttps = false } = {}) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!normalizedValue) {
    return null
  }

  try {
    const resolvedValue =
      assumeHttps && !normalizedValue.startsWith('http://') && !normalizedValue.startsWith('https://')
        ? `https://${normalizedValue}`
        : normalizedValue

    return new URL(resolvedValue).toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

function isProductionBuild(env) {
  if (env.SITE_BUILD_TARGET === 'production') {
    return true
  }

  if (env.VERCEL === '1' && env.VERCEL_ENV === 'production') {
    return true
  }

  if (env.CONTEXT === 'production') {
    return true
  }

  if (env.CF_PAGES === '1') {
    const branch = env.CF_PAGES_BRANCH?.trim()
    const defaultBranch = env.GITHUB_DEFAULT_BRANCH?.trim() || 'main'

    return Boolean(branch && (branch === defaultBranch || branch === 'master'))
  }

  return false
}

function resolvePreviewSiteUrl(env) {
  return (
    normalizeSiteUrl(env.VERCEL_URL, { assumeHttps: true })
    ?? normalizeSiteUrl(env.DEPLOY_PRIME_URL)
    ?? normalizeSiteUrl(env.DEPLOY_URL)
    ?? normalizeSiteUrl(env.CF_PAGES_URL)
  )
}

function resolveSiteUrl(env) {
  if (isProductionBuild(env)) {
    return normalizeSiteUrl(env.PUBLIC_SITE_URL) ?? defaultSiteUrl
  }

  return resolvePreviewSiteUrl(env) ?? localPreviewSiteUrl
}

export default defineConfig({
  integrations: [sitemap({ filter: shouldIncludeInSitemap }), svelte()],
  markdown: {
    remarkPlugins: [remarkMermaidDiagrams],
    shikiConfig: {
      defaultColor: false,
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  output: 'static',
  site: resolveSiteUrl(buildEnv),
  vite: {
    ssr: {
      noExternal: ['bits-ui', /^bits-ui\//],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@content': fileURLToPath(new URL('./.content', import.meta.url)),
        'bits-ui': fileURLToPath(new URL('./node_modules/bits-ui/dist/index.js', import.meta.url)),
      },
    },
    plugins: [tailwindcss()],
  },
})
