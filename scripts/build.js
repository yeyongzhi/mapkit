// @ts-check
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import path from 'node:path'

import { build, defineConfig, mergeConfig } from 'vite'
import pico from 'picocolors'

import { default as buildTargets } from './targets.js'
import { exec } from './utils.js'
import baseConfig from '../vitest.config.js'

const { values } = parseArgs({
  allowPositionals: true,
  options: {
    withTypes: {
      type: 'boolean',
      short: 't',
    },
    filter: {
      type: 'string',
      short: 'f',
    },
  },
})

const { withTypes: buildTypes, filter } = values

run()

async function run() {
  let targets = buildTargets
  if (filter) {
    const filters = filter.split(',')
    targets = buildTargets.filter(t => filters.includes(t))
  }

  // Build all targets for development
  console.log(
    pico.bgBlue(
      pico.black(`Building targets in ${pico.bgGreen('development')} mode...`),
    ),
  )
  await Promise.all(targets.map(e => createInlineConfig(e, false)).map(build))

  // Build all targets for production
  console.log(
    pico.bgBlue(
      pico.black(`Building targets in ${pico.bgRed('production')} mode...`),
    ),
  )
  await Promise.all(targets.map(e => createInlineConfig(e, true)).map(build))

  // Build dts
  if (buildTypes) {
    console.log(pico.bgBlue(pico.black(`Building dts files...`)))
    await exec(
      'pnpm',
      [
        'run',
        'build-dts',
        ...(targets.length
          ? ['--environment', `TARGETS:${targets.join(',')}`]
          : []),
      ],
      {
        stdio: 'inherit',
      },
    )
  }
}

/**
 * @param {string} target
 * @param {boolean} [prod=false]
 * @returns {import("vite").InlineConfig}
 */
function createInlineConfig(target, prod = false) {
  const pkgDir = path.resolve(`packages/${target}`)

  const { buildOptions } = JSON.parse(
    readFileSync(`${pkgDir}/package.json`, 'utf-8'),
  )

  const entry = path.resolve(pkgDir, 'src/index.ts')
  const outDir = path.resolve(pkgDir, 'dist')

  return mergeConfig(
    baseConfig,
    defineConfig({
      define: {
        __DEV__: !prod,
      },
      build: {
        target: 'modules',
        minify: prod ? 'esbuild' : false,
        emptyOutDir: false,
        lib: {
          entry,
          name: buildOptions.name,
          formats: buildOptions.formats,
          fileName: format =>
            prod ? `${target}.${format}.prod.js` : `${target}.${format}.js`,
        },
        outDir,
      },
    }),
  )
}
