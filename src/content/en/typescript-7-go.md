---
title: "TypeScript 7 is almost here – what's changing and what Go has to do with it"
description: "The TypeScript team is porting the compiler to Go, achieving up to 10x faster build times. What TypeScript 6 and 7 mean, why Go was chosen, and what it means for your daily development work."
category: Technical
date: 2026-04-01
readTime: "14 min"
image: "/articles/typescript-7-go/typescript-go-thumb.png"
lang: en
translationSlug: typescript-7-go
---

## 1 Introduction

Since 2023, Typescript 5 is the newest Typescript Version. There hasn't been a bigger change in Typescript for a pretty long time now. But since early 2025, things have been stirring in the TypeScript ecosystem. Initially overlooked, then increasingly louder: The TypeScript team is working on a native implementation of the compiler – and it's not coming in TypeScript, but in **Go**. And it's fast. Very fast. Up to ten times faster.

What exactly is behind TypeScript 6 and TypeScript 7, why Go plays a central role, and what that means for your daily work – that's what this article is about.

## 2 TypeScript 6: The bridge nobody noticed

On March 23, 2026, the TypeScript team released TypeScript 6.0. Anyone hoping for a major feature release was disappointed at first glance. TypeScript 6 is deliberately not a feature release – it's a **transition release**.

The TypeScript team describes 6.0 itself as a "bridge" between TypeScript 5.9 and TypeScript 7. The main task of TypeScript 6: to deprecate everything that will no longer be supported in TypeScript 7. This includes, among other things:

- `--target es5` (ES2015 is the new lower bound)
- `--moduleResolution node` / `node10`
- `--baseUrl` as lookup root for modules
- `--outFile` (bundlers do this better today)
- `--module amd`, `umd`, `systemjs`
- `module`-syntax for namespaces (instead of `namespace`)
- `esModuleInterop: false` and `allowSyntheticDefaultImports: false`

At the same time, TypeScript 6 changes some defaults that have been controversial for years: `strict` is now `true` by default, `module` defaults to `esnext`, and `types` defaults to an empty array instead of all `@types` packages in `node_modules` – which alone improves build time by 20–50% in many projects.

The crucial point: If you want to use TypeScript 7, you should migrate to TypeScript 6 first. If you ignore the deprecation warnings from TypeScript 6, you will run into problems with TypeScript 7.

For a smooth migration, there's `"ignoreDeprecations": "6.0"` in the `tsconfig.json`, which silences all new errors for now – but not forever.

## 3 TypeScript 7: Not a rewrite, but a port

Now to the main event: TypeScript 7. Since March 2025, the TypeScript team has been working internally on a project called **"Corsa"** – a native implementation of the TypeScript compiler. Not in TypeScript, not in C++, but in **Go**.

There's an important point about this new codebase: The Go version of the compiler is **not a rewrite**. It's a **port**. The existing TypeScript code was not rethought or redesigned from the ground up. It was – with the goal of achieving the highest possible equivalence – **transferred to Go**.

This has an important advantage: Many implicit behaviors, inference rules, and edge cases of the TypeScript type system that have grown over the years in the JavaScript implementation are preserved. There's a good chance that TypeScript 7 will correctly type-check existing codebases out of the box – without having to adapt to "new semantics".

The TypeScript team has also backed this claim with numbers: Of around 20,000 compiler test cases that produce at least one error in TypeScript 6, TypeScript 7 reproduces the same errors in **all but 74 cases**. The remaining 74 discrepancies are either pending porting work or intentional changes related to the new defaults.

## 4 Why Go – and what does concurrency have to do with it?

The question is obvious: Why Go? TypeScript could have been reimplemented in Rust, C++, or as a WASM module.

The TypeScript team's answer is pragmatic. Go offers several advantages that are particularly relevant for this specific use case:

**Native compilation:** Go code is compiled to native binaries. Instead of starting a JavaScript engine that then interprets TypeScript, the new compiler runs as direct machine code – without overhead from V8 or similar runtimes.

**Shared-memory parallelism:** Go has a robust goroutine model that enables true multi-threading with shared memory. This is crucial: TypeScript type-checking is non-trivial to parallelize – there are dependencies between files and projects. But Go allows many parts of the check to actually run simultaneously. This means not only that individual projects are checked faster – multiple projects can also be built **in parallel**.

**Lower memory overhead:** According to initial measurements, the native implementation requires only about **half as much memory** as the JavaScript variant.

The result is impressive. Here's an excerpt from the measured speedups on real codebases:

| Codebase   | tsc (JS)  | tsgo (native) | Speedup |
|------------|-----------|--------------|---------|
| VS Code    | 77.8 s    | 7.5 s        | 10.4x   |
| Playwright | 11.1 s    | 1.1 s        | 10.1x   |
| TypeORM    | 17.5 s    | 1.3 s        | 13.5x   |
| date-fns   | 6.5 s     | 0.7 s        | 9.5x    |
| rxjs       | 1.1 s     | 0.1 s        | 11.0x   |

Anders Hejlsberg (lead architect of TypeScript) says that the native implementation is responsible for about half of the speedup (approximately 3x), while the other half is due to concurrency (approximately 3x).

The Language Server also benefits considerably. The time it takes for a large project to load completely in the editor drops from around 9.6 seconds to approximately **1.2 seconds** – an 8-fold speedup. This is a huge advantage, especially for larger projects.

## 5 An AI-driven future for ports?

It's worth pausing briefly here and entertaining a thought: Such a complex piece of software – the TypeScript compiler with all its special cases, inference rules, and implicit behaviors – was essentially transferred from one language to another. And with a high degree of semantic equivalence.

You can't help but wonder: Would this have worked similarly quickly a few years ago, without modern AI support?

Code translations of this kind – not rewriting logic, but transferring existing, well-understood code to another language – are exactly the type of task where AI assistants can provide enormous help. Whether a similar approach with cutting-edge models in the background would be conceivable in the future for other core web infrastructure – legacy code that continues to be needed with the highest possible compatibility, but should be written in a more performant or popular language – is at least worth considering.

## 6 Current status and what's still missing

TypeScript 7 is already available today as a native preview – and more mature than you might expect. You can install it via npm:

```bash
npm install -D @typescript/native-preview
```

The package provides a `tsgo` command that works analogously to `tsc` and can be run in parallel with it.

The Language Server is also available as a VS Code extension in the marketplace and is updated daily. Already implemented are, among other things:

- Code completions (including auto-imports)
- Go-to-definition and go-to-implementation
- Find-all-references
- Rename
- Quick fixes for missing imports
- Formatting

However, there are still open points that need to be addressed before the final release:

**JS Emit:** The JavaScript output has not yet been fully ported. If you only use TypeScript for type-checking and leave transpiling to another tool (Babel, esbuild, Vite), you're already in good shape. If you rely on TypeScript's own transpilation – especially for older targets – you'll have to wait.

**Compiler API:** The existing TypeScript API (the so-called Strada API) is not supported by TypeScript 7. Tools like linters, formatters, or IDE plugins that depend on this API will not work with TypeScript 7 for now. A new Corsa API is under development but not yet stable.

**Watch mode:** The `--watch` mode of the native implementation is still less efficient in some scenarios than the existing one. As a workaround, `tsgo --incremental` can be used in combination with your own file watcher (e.g., `nodemon`).

**JSDoc and JavaScript files:** If you run JavaScript projects with JSDoc annotations and TypeScript checking, you should know that some less common JSDoc tags and patterns are not supported (e.g., `@enum`, `@constructor`). Here, TypeScript 7 may report more errors than expected.

## 7 What makes TypeScript 6 incompatible with TypeScript 7

TypeScript 7 takes the deprecations from TypeScript 6 as hard breaking changes. If you rely on any of the following configurations, you'll need to migrate before TypeScript 7 can be used in production:

- `--target es5` → use at least `es2015`
- `--moduleResolution node10` → migrate to `nodenext` or `bundler`
- `--baseUrl` as module lookup root
- `--outFile`
- `--module amd`, `umd`, `systemjs`
- `esModuleInterop: false`

For many of these points, the experimental tool `ts5to6` helps, which automatically adjusts parts of the `tsconfig.json`:

```bash
npx @andrewbranch/ts5to6 --fixBaseUrl tsconfig.json
npx @andrewbranch/ts5to6 --fixRootDir tsconfig.json
```

Additionally, TypeScript 7 introduces a deterministic order for union types due to parallel type-checking. In rare cases, this can slightly change the output of declaration files or cause a previously "accidentally" working type error to suddenly become visible. The `--stableTypeOrdering` flag in TypeScript 6 allows you to simulate TypeScript 7 behavior in advance – as a diagnostic tool for migration.

## 8 When is TypeScript 7 coming?

The TypeScript team was surprisingly clear about the timeline. TypeScript 6 was released in March 2026 and is explicitly the **last JS-based release** – there will be no TypeScript 6.1 (only patch releases for critical bugs and security fixes).

TypeScript 7 is the next major release. The status in December 2025 was promising: Type-checking runs stably and is nearly feature-complete, language service features are being added daily. The team said they would release TypeScript 7 "within a few months" of TypeScript 6 – which puts the final release sometime in the range of **mid to late 2026**.

The upgrade path is deliberately gradual. TypeScript 6 and TypeScript 7 can be used in parallel – for example, TypeScript 7 for fast command-line checking in CI, TypeScript 6 for tools that depend on the old compiler API.

## 9 What does this mean for developers in practice?

The practical benefit can be broken down into three points:

**Faster build pipelines.** CI/CD runs that previously cost 80 seconds of TypeScript checking could fall below 10 seconds. That's not a marginal gain – it changes how teams structure feedback loops and how quickly developers get feedback on their changes.

**Smoother work in the editor.** The Language Server starts faster, autocomplete and find-all-references respond with noticeably less delay. If you work in large codebases, you know how annoying latency in these operations can be. TypeScript 7 is moving toward the LSP protocol (Language Server Protocol), which will also improve interoperability with other editors in the long term.

**Better foundation for AI-powered tools.** The TypeScript team itself highlights that the new performance opens up new possibilities for AI tools: wider semantic context windows, faster indexing of entire projects, deeper analyses that were previously too expensive to provide in real-time. This will directly influence the next generation of IDE features and AI assistants.

## 10 Conclusion

TypeScript 7 is not a hype project – it's solid infrastructure work that translates into measurable speedups. The unusual approach of porting an existing codebase to Go rather than rewriting it is deliberately chosen: It maximizes semantic compatibility and minimizes risk for existing projects.

TypeScript 6 is less a standalone release than a necessary intermediate step to properly clean up the bridge. If you're currently on TypeScript 5 and planning an upgrade anyway, you should migrate directly to 6 – and take deprecation warnings seriously, don't suppress them with `ignoreDeprecations`.

The native preview can already be used in parallel in many projects today. If you don't have special requirements for the compiler API or JS emit, you can try `tsgo` in your CI and get a feel right now for the scale of improvements.

TypeScript 7 simply makes developing with TypeScript faster. And that's plenty for a solid new version. If you want to dive deeper, you'll find the original articles from the TypeScript team in the resources. I can also recommend a YouTube video in which Anders Hejlsberg explains the changes.
