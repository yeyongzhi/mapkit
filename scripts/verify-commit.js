// @ts-check
import pico from 'picocolors'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const msgPath = path.resolve('.git/COMMIT_EDITMSG')
const msg = readFileSync(msgPath, 'utf-8').trim()

/**
 * feat：新功能
 * fix：修复问题
 * docs：文档变更
 * dx：开发体验改进
 * style：代码格式（不影响代码运行的变动）
 * refactor：重构（既不是新增功能也不是修复 bug 的代码变动）
 * perf：性能优化
 * test：添加测试
 * workflow：工作流相关变动
 * build：构建系统或外部依赖的变动
 * ci：持续集成相关变动
 * chore：其他不修改 src 或测试文件的变动
 * types：类型定义文件的变动
 * wip：进行中的工作
 * release：发布新版本
 */

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red(`invalid commit message format.`)}\n\n` +
      pico.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`,
      ) +
      `    ${pico.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${pico.green(`fix(v-model): handle events on blur (close #28)`)}\n\n` +
      pico.red(`  See .github/commit-convention.md for more details.\n`),
  )
  process.exit(1)
}
