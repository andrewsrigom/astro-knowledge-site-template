import path from 'node:path'
import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const [contentRootArg, command, ...args] = process.argv.slice(2)

if (!contentRootArg || !command) {
  console.error('Usage: node ./scripts/run-with-content-root.mjs <content-root> <command> [...args]')
  process.exit(1)
}

const contentRoot = path.resolve(repoRoot, contentRootArg)
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'seniorpath-verify-content-'))
const syncedContentRoot = path.join(tempRoot, 'synced-content')

const child = spawn(command, args, {
  cwd: repoRoot,
  env: {
    ...process.env,
    SITE_CONTENT_DIR: contentRoot,
    SITE_SYNCED_CONTENT_DIR: syncedContentRoot,
  },
  stdio: 'inherit',
})

child.on('close', async (code) => {
  await rm(tempRoot, { force: true, recursive: true })
  process.exit(code ?? 1)
})

child.on('error', async (error) => {
  console.error(error)
  await rm(tempRoot, { force: true, recursive: true })
  process.exit(1)
})
