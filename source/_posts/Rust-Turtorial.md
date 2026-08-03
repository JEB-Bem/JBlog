---
title: 胡言乱语之 Rust
date: 2026/08/03 17:41:11
tags: Rust
filename: Rust-Turtorial.md
description: 在我所学过的所有语言中 Rust 可以说是最难的语言，今天随便写一点我对于这门语言的理解
keywords: Rust，设计哲学，思想，phisolophy
---

:::caut
这篇文章是一篇草稿，并未正式发布！
:::

最近一直在学习 *Rust*，有一些小小的感悟，进而有此一文。学习 *Rust* 真的应该先对 *C* 或者 *C++* 有一些比较深刻地理解，才能明白 *Rust* 对于解决 *C/C++* 在内存安全等领域的困境所提出的设计哲学。

一提起 Rust，相信很多人的第一印象都是其强大（甚至说严苛）的所有权系统，但我想我们应该真正理解或者说 Rust 的灵魂应该是这句话——“Safety is the Absence of Undefined Behavior”，在 *Rust* 中，可以说几乎不存在未定义行为，根据这一原则 Rust 为我们提供了一个相当。要理解为什么未定义行为如此危险，我想我们需要先了解 *C/C++* 在内存安全中关于未定义行为的困境.

## Undefined Behavior

<b id="references">references</b>  
[Rust Programing Language(Brown University Forked Version)](https://rust-book.cs.brown.edu/)  
[Everything in C is undefined behavior](https://blog.habets.se/2026/05/Everything-in-C-is-undefined-behavior.html)  
[Behavior Considered Undefined](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)
