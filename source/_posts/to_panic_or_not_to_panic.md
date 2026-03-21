---
title: To panic! or Not to panic!
date: 2026/03/10 18:22:32
tags: Rust
filename: to_panic_or_not_to_panic.md
description: Rust 错误处理笔记，围绕 panic、Result、unwrap 与 expect 的使用场景展开讨论。
keywords: Rust, panic, Result, unwrap, expect
---

> 这篇文章类似于翻译的性质，你可以直接阅读[原文](https://rust-book.cs.brown.edu/ch09-03-to-panic-or-not-to-panic.html).

一般来说，返回 `Result` 是一个好的默认选择，不过，在示例、原型代码和测试等情况下，编写会 panic 的代码比返回 `Result` 更合适.

## 示例、原型代码（Prototype Code）和测试

当你编写一个示例来解释某个概念时，同时包含健壮的错误处理代码可能会使示例变得不清晰。在示例中，调用像 `unwrap` 这样可能引发恐慌的方法被视为你希望应用程序处理错误的**占位符**，具体处理方式可能因你其他代码的不同而不同。

同样， `unwrap` 和 `expect` 方法在原型设计阶段非常方便，在你准备好决定如何处理错误之前。它们在你的代码中留下了清晰的标记，以便当你准备使程序更健壮时使用。

:::tip
Prototype Code 可以理解为产品开发初期的临时代码. 或者说为了验证一个想法、设计或技术可行性而快速写出的临时代码，而不是最终产品代码。
:::

如果一个方法调用在测试中失败，你希望整个测试都失败，即使该方法不是测试的功能。因为 panic! 是标记测试失败的方式，调用 `unwrap` 或 `expect` 正是应该发生的事情。

## 比编译器拥有更多信息的情况

当您有其他逻辑确保 Result 将具有 Ok 值，但该逻辑不是编译器能理解的情况，也适合调用 expect 。您仍然需要处理一个 Result 值：尽管在您特定的情境中逻辑上不可能失败，但您所调用的操作在一般情况下仍有可能失败。如果您能通过手动检查代码确保您永远不会遇到 Err 变体，那么调用 expect 并在参数文本中说明您认为永远不会遇到 Err 变体的原因，是完全可以接受的。以下是一个例子：

```rust
 use std::net::IpAddr;

    let home: IpAddr = "127.0.0.1"
        .parse()
        .expect("Hardcoded IP address should be valid");
```

我们知道 `parse` 一定能解析成功，但是编译器是不知道的，因此直接使用 `unwrap` 或 `expect` 就是很好的选择。

## 错误处理指南

当代码有可能进入坏的状态时，建议让代码 panic. “坏状态”一般说的是某些假设、保证、契约或不变量被破坏的情况，例如向代码传递了无效值、矛盾值或缺失值——再加上以下一种或多种情况：

- 坏状态是意料之外的，而不是像用户以错误格式输入数据那样可能会偶尔发生的情况。
- 从这一点开始，你的代码需要依赖于不在这种坏状态，而不是在每一步都检查这个问题。
- 你无法以好的方式在使用的类型中编码这些信息。我们将在第 18 章的“[将状态和行为编码为类型](https://rust-book.cs.brown.edu/ch18-03-oo-design-patterns.html#encoding-states-and-behavior-as-types)”中通过一个例子来解释我们的意思。

:::tip
这或许提示了我们，在进行项目设计时，应当规划好或者逐步完善项目的假设、保证、契约等.
:::

----

由于这篇文章更多的是在阐释代码编写过程中的思想，并没有太多语法、规范等问题需要记录，遂决定不再翻译这篇文章，请自行阅读[原文](https://rust-book.cs.brown.edu/ch09-03-to-panic-or-not-to-panic.html)，以免我的翻译影响你对 Rust 语言设计哲学的理解。
