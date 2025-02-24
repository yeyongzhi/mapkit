# Git 提交信息规范

> 该规范来源于 [Angular 提交规范](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

## 总结

提交信息必须符合以下正则表达式：

```regexp
/^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/
```

## 示例

出现在 “Features”（功能）部分，compiler（编译器）子部分：

```plaintext
feat(compiler): add 'comments' option
```

出现在 “Bug Fixes”（Bug 修复）部分，v-model 子部分，并链接到问题 #28：

```plaintext
fix(v-model): handle events on blur

close #28
```

出现在 “Performance Improvements”（性能改进）部分，且在 “Breaking Changes”（破坏性变更）部分中有破坏性变更说明：

```plaintext
perf(core): improve vdom diffing by removing 'foo' option

BREAKING CHANGE: The 'foo' option has been removed.
```

以下提交和提交 667ecc1 如果在同一个版本中，不会出现在变更日志中。如果不在同一个版本中，回退的提交会出现在 “Reverts”（回退）部分。

```plaintext
revert: feat(compiler): add 'comments' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### 完整的提交信息格式

一个提交信息由 **头部**、**主体** 和 **尾部** 组成。头部包含 **类型**、**范围** 和 **主题**：

```plaintext
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

**头部** 是必填项，**范围** 是可选项。

### 回退提交

如果提交是回退了之前的某个提交，应该以 `revert`: 开头，后面跟着被回退提交的头部。在主体部分，应该写上：`This reverts commit <hash>.`，其中 `<hash>` 是被回退提交的 SHA。

### 类型

如果前缀是 `feat（新特性`）、`fix（修复）`或 `perf（性能优化）`，它将出现在变更日志中。然而，如果提交中包含 [BREAKING CHANGE](#尾部)，该提交将始终出现在变更日志中。

其他前缀可以根据你的需求来选择。建议的前缀有 `docs（文档）`、`chore（杂务）`、`style（样式`）、`refactor（重构）`和 `test（测试）`，用于与变更日志无关的任务。

### 范围

范围可以是任何指定提交修改位置的内容。例如：`core（核心）`、`compiler（编译器`）等。

### 主题

主题部分包含对变更的简洁描述：

- 使用祈使语气的现在时：比如 “change”（修改），而不是 “changed”（已修改）或 “changes”（变化）。
- 第一个字母不要大写。
- 结尾不加句号（.）。

### 主体

与 **主题** 部分一样，使用祈使语气的现在时：例如 “change” 而不是 “changed” 或 “changes”。
主体部分应该包括该变更的动机，并与之前的行为做对比。

### 尾部

尾部应该包含有关 **破坏性变更** 的信息，并且是引用 GitHub 问题的地方，表明该提交 **关闭** 了某个问题。

**破坏性变更** 应该以 BREAKING CHANGE: 开头，后跟一个空格或两个换行符。其余的提交信息则用于描述具体的内容。
