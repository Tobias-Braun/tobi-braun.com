---
title: "Claude Code Hooks – Safety Through Invariants"
description: "How Claude Code Hooks enforce critical invariants in autonomous AI development workflows: secret scanners, co-author filters, and the fail-closed principle for safer vibe coding."
category: Technical
date: 2025-09-01
readTime: "11 min"
image: "/articles/claude-code-hooks/claude-code-thumb.png"
lang: en
translationSlug: claude-code-hooks
---

## 1 Introduction

More and more developers are using Claude Code to write production code – not just for prototypes or experiments, but directly in their daily work on real systems. This saves time and makes it possible to tackle complex tasks faster. At the same time, it brings with it an aspect that is easy to overlook: Claude Code works autonomously with real tools. It executes shell commands, creates files, and makes commits – often without you actively confirming each individual step.

That is usually exactly what you want – because who wants to click "Allow" every 10 seconds? – but it also means that mistakes with real consequences can happen. For example, a commit message that lists an AI model as a co-author, which may be undesirable in professional contexts. Or even a commit that accidentally contains an API key.

Claude Code offers **Hooks** – a feature built precisely for these kinds of safeguards – and, to my knowledge, one that is still barely used by most developers.

## 2 Hooks, Tools and Matchers

Before we look at the configuration, let's clarify what hooks actually are and how they are anchored in Claude Code.

To do its work, Claude Code uses so-called **Tools**.
**Tools** are the instruments Claude Code is allowed to use to complete tasks. These include reading (`Read`) and writing (`Write`) files, executing shell commands (`Bash`), or modifying existing code (`Edit`). Each of these actions corresponds to a tool with a defined name.

**Hooks** are executable programs or scripts that Claude Code calls at specific points in the tool lifecycle – similar to Git hooks, but for Claude actions. A hook can inspect, block, or allow a tool execution.

**Matchers** determine which tools a hook is active for. Instead of checking every tool call, hooks can be scoped to specific tools – for example, only to `Bash`.

There are different hook types that fire at different points in time:

- `PreToolUse` – called **before** a tool is executed. Can block the execution.
- `PostToolUse` – called **after** a tool has been executed.
- `Notification` – called when Claude Code sends a notification.
- `Stop` – called when Claude Code finishes its work.

For security checks, `PreToolUse` is the relevant type, as it is the only point where execution can still be prevented.

## 3 Configuration

Hooks are defined in Claude Code's `settings.json`. This configuration file comes in several variants – we'll look at the following two:

**Global configuration** at `~/.claude/settings.json` – applies to all Claude Code sessions, regardless of the project. This is the right place for hooks that should always apply: general security checks, Git safeguards, or cross-team policies.

**Project-specific configuration** in `.claude/settings.json` in the root directory of a project – applies only to that project and should ideally be version-controlled. This is where hooks belong that depend on project-specific tools, such as lint checks with `pnpm`, tests with a particular Java build tool, or formatters that only exist in that repository.

For Claude Code Enterprise customers, there is also configuration at the **organization level**. I'm confident that over time we'll receive corresponding policies there that cleanly restrict tool usage. Since these concepts are still quite new, that's not something you can expect yet. And many people use Claude Code without an Enterprise license, through which such things are, to my knowledge, not available either.

I keep general hooks like the ones described below in the global configuration, since they are relevant for every development session. Project-specific hooks that depend on project-specific commands like `pnpm lint`, `./gradlew check`, or similar, I define at the project level.

A hook is registered in `settings.json` under its respective hook type:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/my-hook.sh",
            "statusMessage": "Checking..."
          }
        ]
      }
    ]
  }
}
```

The `matcher` specifies which tool the hook applies to. In the example, it activates for every `Bash` tool execution. `"type": "command"` defines that the hook should be run as a command (here the shell script `my-hook.sh`).

## 4 Input and Output

Claude Code communicates with hooks via standard I/O. The flow is as follows:

**Input:** Claude Code writes a JSON object to the hook process's `stdin`. It contains information about the upcoming tool execution – for the `Bash` tool, for example, the shell command to be executed:

```json
{
  "tool_input": {
    "command": "git commit -m 'Add feature'"
  }
}
```

**Output:** The hook writes a decision as JSON to `stdout`. The format depends on the hook type. For `PreToolUse`, Claude Code expects the following structure:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", // or "allow"
    "permissionDecisionReason": "Reason for the denial"
  }
}
```

Possible values for `permissionDecision` are `deny` (blocks the execution) and `ask` (prompts the user for confirmation), or simply `allow`. If the hook produces no JSON output and exits with exit code 0, the tool is executed normally.

**Important:** The output format differs by hook type. `PostToolUse` hooks expect a different format than `PreToolUse` hooks. The complete format specifications are documented in the [official Claude Code Hooks reference](https://code.claude.com/docs/en/hooks).

## 5 Exit Codes and Fail-Closed

The exit code of a hook plays a decisive role in how Claude Code behaves:

- **Exit 0** – The hook executed successfully. Claude Code evaluates the JSON from `stdout`.
- **Exit 2** – Hard failure. Claude Code **always** blocks the tool, regardless of the JSON output.
- **Any other exit code** – Behavior is undefined and may result in the tool being executed anyway.

**It is therefore advisable to always exit with code 2 on unexpected errors.** This strategy is called "Fail Closed": if the hook doesn't function correctly, it would rather block too much than too little. This prevents an error in the hook code (e.g., a parse error) from silently bypassing the security check.

```
Exit 0  → Hook successful → evaluate JSON decision
Exit 2  → Unexpected error → always block the tool (Fail Closed)
Other   → Undefined behavior → avoid
```

## 6 Practical Examples

### check-secrets: Preventing Secrets in Commits

The `check-secrets` hook fires on every `git commit` call and scans the staged changes for known secret patterns: API keys, passwords, private keys, AWS access keys, GitHub personal access tokens, or simply high-entropy strings – long character sequences that don't follow any known pattern.

The flow:

1. The hook reads the shell command from the JSON input.
2. If the command does not contain `git commit`, it exits immediately with exit code 0 – no action needed.
3. Otherwise, it calls `git diff --cached` and scans the output line by line against known patterns.
4. If it finds suspicious lines, it writes a `deny` decision with an error message to `stdout`.

The patterns range from generic credential names like `db_password =` or `api_key:` combined with longer character sequences, to patterns for high-entropy strings of at least 32 characters that detect unknown token formats.

The scanner runs against `git diff --cached` – exactly what will go into the next commit. Only added lines (those starting with `+`) are checked, to avoid false positives on deleted or unchanged lines.

How exactly the hook script classifies secrets is of course up to each person – the good news is: if a hook ever fires incorrectly, you can still perform the commit yourself. (That also means secrets inserted by Claude but not committed by Claude won't be caught.) It's up to you individually how you prefer your workflow. What matters is that you have a system for automatically reviewing Claude's work. And Claude hooks are particularly well-suited for this, since they only restrict Claude – not you yourself.

A quick note on git hooks: Good old pre-commit hooks are theoretically also a way to enforce something like this. However, caution is warranted here too. My Claude Code has, for example, already tried to bypass git pre-commit hooks using `git commit --no-verify` after a regular commit failed. You would therefore need to restrict git commands even further to be truly certain that pre-commit hooks are actually executed.

In the image below you can see the hook in action. I slipped a fake secret into Claude Code's work without it noticing (!), and it was about to commit the changes. The hook stopped it, and Claude Code then recognized that it needed to remove the secret. This example nicely illustrates that not only can we reliably stop undesired behavior – we can also activate a self-healing mechanism through the communication between hooks and Claude Code:

![Demo Hook - Interaction with Claude Code](/articles/claude-code-hooks/demo-secret-hook.png)

### check-model-author: Preventing AI as Co-Author

Let's look at another hook example. Claude Code occasionally suggests adding itself as a co-author in commit messages, following the pattern `Co-Authored-By: Claude Sonnet <noreply@anthropic.com>`. In some projects this is undesirable – for instance with clients who don't want to expose AI usage, or in certain open-source contexts.

The `check-model-author` hook prevents this automatically:

1. Here too, the hook first checks whether it's a `git commit` command.
2. The full commit command is checked against two regex patterns:
   - Known AI model names such as `claude`, `sonnet`, `haiku`, `opus`, `gpt`, `gemini`, `llama`, `copilot`
   - Known no-reply addresses of AI services such as `noreply@anthropic.com` or `noreply@openai.com`
3. If one of the patterns matches, the commit is blocked with an explanatory error message.

The pattern is deliberately broad so that future model names (e.g., new Claude versions) are automatically detected without needing to update the hook.

Below you can see the hook in action again. I instructed Claude Code to make a commit and mention itself as the author. The commit fails, and the hook returns a response to Claude Code. Here too, the model is able to adapt to the situation and commits with a changed message:

![Demo Hook - Interaction with Claude Code](/articles/claude-code-hooks/demo-model-hook.png)


### Configuration in the Global settings.json

In my global `~/.claude/settings.json`, both hooks are registered for the `Bash` matcher under `PreToolUse`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/check-secrets.sh",
            "statusMessage": "Scanning staged changes for secrets..."
          },
          {
            "type": "command",
            "command": "~/.claude/hooks/check-model-author.sh",
            "statusMessage": "Checking commit message for AI co-authors..."
          }
        ]
      }
    ]
  }
}
```

Since both hooks only become truly active on `git commit` calls, they have no effect on other Bash commands and don't meaningfully slow down normal work.

It is also possible to narrow the matcher further, so that the hook script only runs for specific Bash commands. For example, `"matcher": "Bash(git commit*)"` would only execute hook scripts when the command starts with `git commit`. I'd be cautious here, though, since Claude Code likes to chain multiple commands together (for example: `git add <files> && git commit -m "..."`). I haven't tested this enough yet to be confident that the hook script fires in such a case. In my personal hook scripts, I simply use grep to check whether `git commit` appears anywhere in the command.

## 7 Conclusion

Claude Code Hooks are a powerful but still underutilized feature. Particularly when Claude Code is used productively and autonomously, hooks provide the ability to enforce critical invariants – regardless of what Claude proposes or executes in a session.

Two principles are worth keeping in mind:

**Fail Closed, not Fail Open.** Hooks that exit with code 2 on unexpected errors would rather block too much than too little. This prevents a broken safety net from creating a false sense of security.

**Global vs. project-specific.** General checks like secret scanning or commit policies belong in the global configuration. Project-specific checks that require particular runtime environments or build tools belong in the `.claude/settings.json` of the respective project.

The barrier to entry is low: a hook is essentially just an executable program that reads JSON and writes JSON. Whether it's a shell script, Go binary, or Python script – the format is what matters, not the language. Anyone already using Claude Code in real projects should integrate hooks firmly into their workflow.

Commit and secret policies can of course also be documented in `CLAUDE.md`. Claude respects that quite well. But hooks offer an additional security layer that can be worthwhile – especially since LLMs don't act deterministically and can sometimes be very narrowly focused on their current task.

It should also be said that the examples and lifecycle points mentioned here are just a fraction of what's possible with hooks. We can, for example, send notifications when Claude Code needs input, automatically run formatters after edits, and much more.

For those who want to go deeper, the complete reference for all hook types, matchers, and output formats is available in the [official Claude Code documentation](https://code.claude.com/docs/en/hooks). Happy vibe coding.
