import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { syncConfiguredContent } from './sync-content.mjs'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = path.resolve(siteRoot, '..', '..')
const { collections, syncedContentRoot } = await syncConfiguredContent()
const generatedTsconfigPath = path.join(syncedContentRoot, 'tsconfig.site-check.json')

await writeFile(
  generatedTsconfigPath,
  `${JSON.stringify(
    {
      extends: path.join(siteRoot, 'tsconfig.json'),
      compilerOptions: {
        paths: {
          '@/*': [path.join(siteRoot, 'src', '*')],
          '@content/*': [path.join(syncedContentRoot, '*')],
          '@template/content': [
            path.join(repoRoot, 'packages', 'content', 'src', 'index.ts'),
          ],
        },
      },
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`[content] Synced collections: ${collections.join(', ')}`)

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const child = spawn(
  command,
  ['exec', 'astro', 'check', '--tsconfig', generatedTsconfigPath],
  {
    cwd: siteRoot,
    env: process.env,
    stdio: 'inherit',
  },
)

child.on('close', (code) => {
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
