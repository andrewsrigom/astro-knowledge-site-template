import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: 'inherit',
      ...options,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })

    child.on('error', reject)
  })
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'astro-knowledge-content-'))
const scaffoldedContentRoot = path.join(tempRoot, 'sample-content')
const syncedContentRoot = path.join(tempRoot, 'synced-content')

try {
  await run('node', ['./scripts/init-content-repo.mjs', scaffoldedContentRoot])
  await run('node', ['./scripts/init-template.mjs', '--content-root', scaffoldedContentRoot])
  await run('pnpm', ['verify:external'], {
    env: {
      ...process.env,
      SITE_CONTENT_DIR: scaffoldedContentRoot,
      SITE_SYNCED_CONTENT_DIR: syncedContentRoot,
    },
  })
} finally {
  await rm(tempRoot, { force: true, recursive: true })
}
