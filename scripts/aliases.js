import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resolveEntryForPkg = (/** @type {string} */ p) =>
  path.resolve(
    fileURLToPath(import.meta.url),
    `../../packages/${p}/src/index.ts`,
  )

const dirs = readdirSync(new URL('../packages', import.meta.url))

/** @type {Record<string, string>} */
const entries = {}

for (const dir of dirs) {
  const key = `@mapkit/${dir}`
  if (
    !(key in entries) &&
    statSync(new URL(`../packages/${dir}`, import.meta.url)).isDirectory()
  ) {
    entries[key] = resolveEntryForPkg(dir)
  }
}

export { entries }
