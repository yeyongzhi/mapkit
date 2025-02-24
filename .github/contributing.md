# 贡献指南

欢迎贡献代码、报告问题或提出功能请求。为了确保每个贡献都能高效、顺利地进行，请遵循以下贡献流程。

## 参与流程

### 提交问题

如果你发现一个 bug、需要某个新特性，或者有任何问题，请在提交前先查阅现有的 [问题](https://github.com/BitterGardenia/mapkit/issues) 列表，确保你的问题没有被提及过。这样可以避免重复提交。

- **Bug 报告**：请提供详细的重现步骤、操作系统、浏览器版本和任何相关的日志或错误信息。
- **功能请求**：请明确描述你希望添加的功能以及它的潜在好处。

### 接受哪些类型的 Pull Request？

- 修复已明确识别的错误。“已明确识别的错误”是指该错误可以从相关未解决的问题中正确重现，或包含在 PR 本身中。避免提交声称修复了某些问题但没有充分解释修复内容的 PR。

- 新功能解决了一个解释清楚且广泛适用的用例。“广泛适用”意味着新功能应该为大多数用户群提供非同小可的改进。

  - 功能实现还应考虑增加的复杂性与获得的好处之间的权衡。例如，如果一个小功能需要在整个代码库中进行重大更改，那么它可能不值得，或者应该重新考虑这种方法。

- 杂务：拼写错误、注释改进、构建配置、CI 配置等。对于拼写错误和注释更改，尝试将多个更改合并为一个 PR。

- 需要注意的是，我们不鼓励贡献者提交过于风格化的代码重构。只有当代码重构能够提高性能，或者能够充分解释为什么它能够客观地提高代码质量（例如，使相关功能的实现更容易）时，我们才会接受代码重构。

### Pull Request 检查列表

- 如果添加新功能：

  - 添加附带的测试用例。
  - 提供添加此功能的令人信服的理由。理想情况下，您应该先打开建议问题并获得批准，然后再进行处理。

- 如果修复错误：

  - 如果你正在解决一个特殊问题，将(fix #xxxx[,#xxxx])添加到你的 PR 标题中（#xxxx 是问题 ID）以获得更好的发布日志，例如 update entities encoding/decoding (fix #3899)。
  - 在 PR 中提供 bug 的详细描述。最好有现场演示。
  - 在处理 PR 时可以有多个小的提交 - GitHub 可以在合并之前自动压缩它们。

- 确保测试通过！

- 提交消息必须遵循[提交消息约定](./commit-convention.md)，以便自动生成变更日志。提交消息在提交之前会自动验证（通过 simple-git-hooks 调用 Git Hooks）。

- 只要安装了 dev 依赖项，就无需担心代码风格 - 修改的文件在提交时会自动使用 Prettier 格式化（通过 simple-git-hooks 调用 Git Hooks ）。

### Git 钩子

该项目使用[simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)在每次提交时强制执行以下内容：

- 对整个项目进行类型检查
- 使用 Prettier 自动格式化已更改的文件
- 验证提交消息格式（逻辑`scripts/verify-commit.js`）

### 开发设置

指定的最低 Node.js 版本`package.json/engines/node`，使用`pnpm`管理依赖。

```bash
pnpm i
```

### 脚本

`[pnpm build](#pnpm-build)`
`[pnpm build-dts](#pnpm-build-dts)`
`[pnpm test](#pnpm-test)`

#### `pnpm build`

该`build`脚本构建所有公共包（`package.json`中没有`private: true`的包）。

可以使用模糊匹配来指定要构建的包：

```bash
# 仅构建 runtime-core 包
pnpm build -f runtime-core

# 构建所有包
pnpm build

# 同时构建类型文件
pnpm build -t
```

请注意`pnpm build`用于`rollup-plugin-esbuild`转译 typescript 并且**不执行类型检查**。要对整个代码库运行类型检查，请运行`pnpm check`。每次提交时也会自动运行类型检查。

#### 构建格式

默认情况下，每个包将按照`package.json`中`buildOptions.formats`字段指定的多种分发格式构建。支持以下格式：

- **`es`**
- **`cjs`**
- **`umd`**

### pnpm build-dts

此命令会为所有包构建类型声明。首先在`temp`目录中生成`.d.ts`原始文件，然后使用`rollup-plugin-dts`将类型`.d.ts`汇总到每个包的单个文件中。

### pnpm test

参考[vitest](https://vitest.dev/)
