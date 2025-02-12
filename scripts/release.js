// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import pico from 'picocolors'
import semver from 'semver'
import enquirer from 'enquirer'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { exec } from './utils.js'
import { parseArgs } from 'node:util'

/**
 * @typedef {{
 *   name: string
 *   version: string
 *   dependencies?: { [dependenciesPackageName: string]: string }
 *   peerDependencies?: { [peerDependenciesPackageName: string]: string }
 * }} Package
 */

let versionUpdated = false

const { prompt } = enquirer
const currentVersion = createRequire(import.meta.url)('../package.json').version
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    preid: {
      type: 'string',
    },
    dry: {
      type: 'boolean',
    },
    tag: {
      type: 'string',
    },
    skipBuild: {
      type: 'boolean',
    },
    skipTests: {
      type: 'boolean',
    },
    skipGit: {
      type: 'boolean',
    },
    skipPrompts: {
      type: 'boolean',
    },
  },
})

const preId = args.preid || semver.prerelease(currentVersion)?.[0]
const isDryRun = args.dry
/** @type {boolean | undefined} */
let skipTests = args.skipTests
const skipBuild = args.skipBuild
const skipPrompts = args.skipPrompts
const skipGit = args.skipGit

const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(p => {
    const pkgRoot = path.resolve(__dirname, '../packages', p)
    if (fs.statSync(pkgRoot).isDirectory()) {
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve(pkgRoot, 'package.json'), 'utf-8'),
      )
      return !pkg.private
    }
  })

const keepThePackageName = (/** @type {string} */ pkgName) => pkgName

/** @type {string[]} */
const skippedPackages = []

/** @type {ReadonlyArray<import('semver').ReleaseType>} */
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId
    ? /** @type {const} */ (['prepatch', 'preminor', 'premajor', 'prerelease'])
    : []),
]

const inc = (/** @type {import('semver').ReleaseType} */ i) =>
  semver.inc(currentVersion, i, typeof preId === 'string' ? preId : undefined)
const run = async (
  /** @type {string} */ bin,
  /** @type {ReadonlyArray<string>} */ args,
  /** @type {import('node:child_process').SpawnOptions} */ opts = {},
) => exec(bin, args, { stdio: 'inherit', ...opts })
const dryRun = async (
  /** @type {string} */ bin,
  /** @type {ReadonlyArray<string>} */ args,
  /** @type {import('node:child_process').SpawnOptions} */ opts = {},
) => console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const getPkgRoot = (/** @type {string} */ pkg) =>
  path.resolve(__dirname, '../packages/' + pkg)
const step = (/** @type {string} */ msg) => console.log(pico.cyan(msg))

async function main() {
  if (!(await isInSyncWithRemote())) {
    return
  } else {
    console.log(`${pico.green(`✓`)} commit is up-to-date with remote.\n`)
  }

  let targetVersion = positionals[0]

  if (!targetVersion) {
    // no explicit version, offer suggestions
    /** @type {{ release: string }} */
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements
        .map(i => `${i} (${inc(i)})`)
        .concat(['custom']),
    })

    if (release === 'custom') {
      /** @type {{ version: string }} */
      const result = await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      })
      targetVersion = result.version
    } else {
      targetVersion = release.match(/\((.*)\)/)?.[1] ?? ''
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  if (skipPrompts) {
    step(`Releasing v${targetVersion}...`)
  } else {
    /** @type {{ yes: boolean }} */
    const { yes: confirmRelease } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: `Releasing v${targetVersion}. Confirm?`,
    })

    if (!confirmRelease) {
      return
    }
  }

  if (!skipTests) {
    step('Checking CI status for HEAD...')
    let isCIPassed = await getCIResult()
    skipTests ||= isCIPassed

    if (isCIPassed && !skipPrompts) {
      /** @type {{ yes: boolean }} */
      const { yes: promptSkipTests } = await prompt({
        type: 'confirm',
        name: 'yes',
        message: `CI for this commit passed. Skip local tests?`,
      })

      skipTests = promptSkipTests
    }
  }

  if (!skipTests) {
    step('\nRunning tests...')
    if (!isDryRun) {
      await run('pnpm', ['run', 'test', '--run'])
    } else {
      console.log(`Skipped (dry run)`)
    }
  } else {
    step('Tests skipped.')
  }

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...')
  updateVersions(targetVersion, keepThePackageName)
  versionUpdated = true

  // build all packages with types
  step('\nBuilding all packages...')
  if (!skipBuild && !isDryRun) {
    await run('pnpm', ['run', 'build', '--withTypes'])
  } else {
    console.log(`(skipped)`)
  }

  // generate changelog
  step('\nGenerating changelog...')
  await run(`pnpm`, ['run', 'changelog'])

  if (!skipPrompts) {
    /** @type {{ yes: boolean }} */
    const { yes: changelogOk } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: `Changelog generated. Does it look good?`,
    })

    if (!changelogOk) {
      return
    }
  }

  step('\nUpdating lockfile...')
  await run(`pnpm`, ['install', '--prefer-offline'])

  if (!skipGit) {
    const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
    if (stdout) {
      step('\nCommitting changes...')
      await runIfNotDry('git', ['add', '-A'])
      await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`])
    } else {
      console.log('No changes to commit.')
    }
  }

  // publish packages
  step('\nPublishing packages...')

  const additionalPublishFlags = []
  if (isDryRun) {
    additionalPublishFlags.push('--dry-run')
  }
  if (isDryRun || skipGit) {
    additionalPublishFlags.push('--no-git-checks')
  }
  // bypass the pnpm --publish-branch restriction which isn't too useful to us
  // otherwise it leads to a prompt and blocks the release script
  const branch = await getBranch()
  if (branch !== 'main') {
    additionalPublishFlags.push('--publish-branch', branch)
  }

  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion, additionalPublishFlags)
  }

  // push to GitHub
  if (!skipGit) {
    step('\nPushing to GitHub...')
    await runIfNotDry('git', ['tag', `v${targetVersion}`])
    await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
    await runIfNotDry('git', ['push'])
  }

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }

  if (skippedPackages.length) {
    console.log(
      pico.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join('\n- ')}`,
      ),
    )
  }
  console.log()
}

async function getCIResult() {
  try {
    const sha = await getSha()
    const res = await fetch(
      `https://api.github.com/repos/vuejs/core/actions/runs?head_sha=${sha}` +
        `&status=success&exclude_pull_requests=true`,
    )
    /** @type {{ workflow_runs: ({ name: string, conclusion: string })[] }} */
    const data = await res.json()
    return data.workflow_runs.some(({ name, conclusion }) => {
      return name === 'ci' && conclusion === 'success'
    })
  } catch {
    console.error('Failed to get CI status for current commit.')
    return false
  }
}

async function isInSyncWithRemote() {
  try {
    const branch = await getBranch()
    const res = await fetch(
      `https://api.github.com/repos/BitterGardenia/mapkit/commits/${branch}?per_page=1`,
    )
    const data = await res.json()
    if (data.sha === (await getSha())) {
      return true
    } else {
      /** @type {{ yes: boolean }} */
      const { yes } = await prompt({
        type: 'confirm',
        name: 'yes',
        message: pico.red(
          `Local HEAD is not up-to-date with remote. Are you sure you want to continue?`,
        ),
      })
      return yes
    }
  } catch {
    console.error(
      pico.red('Failed to check whether local HEAD is up-to-date with remote.'),
    )
    return false
  }
}

async function getSha() {
  return (await exec('git', ['rev-parse', 'HEAD'])).stdout
}

async function getBranch() {
  return (await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout
}

/**
 * @param {string} version
 * @param {(pkgName: string) => string} getNewPackageName
 */
function updateVersions(version, getNewPackageName = keepThePackageName) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version, getNewPackageName)
  // 2. update all packages
  packages.forEach(p =>
    updatePackage(getPkgRoot(p), version, getNewPackageName),
  )
}

/**
 * @param {string} pkgRoot
 * @param {string} version
 * @param {(pkgName: string) => string} getNewPackageName
 */
function updatePackage(pkgRoot, version, getNewPackageName) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  /** @type {Package} */
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.name = getNewPackageName(pkg.name)
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

/**
 * @param {string} pkgName
 * @param {string} version
 * @param {ReadonlyArray<string>} additionalFlags
 */
async function publishPackage(pkgName, version, additionalFlags) {
  if (skippedPackages.includes(pkgName)) {
    return
  }

  let releaseTag = null
  if (args.tag) {
    releaseTag = args.tag
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha'
  } else if (version.includes('beta')) {
    releaseTag = 'beta'
  } else if (version.includes('rc')) {
    releaseTag = 'rc'
  }

  step(`Publishing ${pkgName}...`)
  try {
    // Don't change the package manager here as we rely on pnpm to handle
    // workspace:* deps
    await run(
      'pnpm',
      [
        'publish',
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public',
        ...additionalFlags,
      ],
      {
        cwd: getPkgRoot(pkgName),
        stdio: 'pipe',
      },
    )
    console.log(pico.green(`Successfully published ${pkgName}@${version}`))
  } catch (/** @type {any} */ e) {
    if (e.stderr.match(/previously published/)) {
      console.log(pico.red(`Skipping already published: ${pkgName}`))
    } else {
      throw e
    }
  }
}

main().catch(err => {
  if (versionUpdated) {
    // revert to current version on failed releases
    updateVersions(currentVersion)
  }
  console.error(err)
  process.exit(1)
})
