---
title: 胡言乱语之 Rust
date: 2026/08/03 17:41:11
tags: Rust
filename: Rust-UB.md
description: 在我所学过的所有语言中 Rust 可以说是最难的语言，今天随便写一点我对于这门语言的理解
keywords: Rust，设计哲学，思想，phisolophy
---

最近一直在学习 *Rust*，有一些小小的感悟，进而有此一文. 学习 *Rust* 真的应该先对 *C* 或者 *C++* 有一些比较深刻地理解，才能明白 *Rust* 对于解决 *C/C++* 在内存安全等领域的困境所提出的设计哲学.

一提起 Rust，相信很多人的第一印象都是其强大（甚至说严苛）的所有权系统，但我想我们应该真正理解或者说 Rust 的灵魂应该是这句话——“Safety is the Absence of Undefined Behavior”，在 *Rust* 中，可以说几乎不存在未定义行为，要理解为什么未定义行为被视作洪水猛兽，我想我们需要先了解 *C/C++* 在内存安全中关于未定义行为的困境.

## Undefined Behavior

未定义行为有很多，在 *C23* 标准中，“undefined” 一词就出现了 283 次. 这是个惊人的数字，*C* 可能出现的未定义行为很多，而且大多隐晦无法察觉，这意味着在 *C* 中人类几乎无法写出一个稍微复杂一点的不会发生未定义行为的程序. 很多人对于未定义行为的恐怖还一无所知，下面简单举几个例子：


```c
printf("%f", 5);
```

`printf("%f", 5)` 是未定义行为（UB）：实参是 `4` 字节的 `int`，但 `printf` 内部按 `%f` 用 `va_arg` 读取 `8` 字节的 `double` —— 多读出的 `4` 字节来自栈/寄存器中与本语句无关的数据（按照 System V ABI，`x86_64` 从 `XMM` 浮点寄存器读到脏值、`i386` 用 `i386` 字节 `int` 拼上 `4` 字节栈脏值），你就这样泄露了 CPU/内存的信息. 有人就要问了，“难道不能通过 `%f` 判断形参的类型，然后把形参转换成对应的数据类型吗？”  
不能——因为类型信息在进入省略号（`...`）的那一刻就已经丢失了：`printf` 收到的不是一个 `int 5`，而是一段“不知道是什么的字节”，`va_arg` 只能按 `%f` 声明的类型去原样截取 8 个字节，而“把它从 `int` 转换成 `double`”这个操作的前提是知道它原本是 `int`——这个信息在调用点就没有被传递，转换无从谈起. 因此，调用*可变参数函数*时稍有不慎就会写出可能发生 UB 的程序.

再举一个例子，我们在学习 x86 汇编相关知识时，都会了解到建议我们把堆、栈内存按照数据类型对齐，不仅仅是为了方便 CPU 读取数据的次数最少，同时也能保证 `SSE/SIMD` 语句能够正常运行，不过我们都知道 CPU 仍然可以在内存没有对齐的时候读取数据. 但这时我们的思维却局限在特定的架构上了，其他的某些架构可能根本就不支持读取未对齐的数据：

```c
int foo(const int* p) {
    return *p;                                   // UB
}

bool parse_packet(const uint8_t* bytes) {
    const int* magic_intp = (const int*)bytes;   // UB
    int magic_raw = foo(magic_intp);
    int magic = ntohl(magic_raw);
    ...
}

```

首先是 `foo` 里面的 UB，这就是上文提到的问题，`p` 如果没有对齐的话，这次的数据读取操作就是一个 UB，特别的，如果 `foo` 声称解引用 `p` 的操作是[***原子***](https://en.wikipedia.org/w/index.php?title=Atomicity_(programming)&redirect=no)的，那这个函数就很可能酿成大错—— `foo` 对 `p` 的解引用很可能因为未对齐而进行两次读取操作！

接下来是 `parse_packet` 中的 UB，只不过把指针转了一下型，`uint8_t*` 变 `int*` 并没有解引用为什么 UB？——注意，这里有个被忽略的前提：`int*` 要求 `4` 字节对齐，而 `bytes` 是一段字节流，对齐要求只有 `1`. *C11 6.3.2.3p7* 规定“转换后的指针若与目标类型对齐不符，行为未定义”.

除此之外，`double-free`, `use after free` 这些熟知但是并不少见的 UB 更是不必多说.

那么未定义行为意味着什么呢？**意味着编译器可能与你的意愿背道而驰**，你的程序一旦可能引发未定义行为，那就意味着在一个绝对比特精准的程序里面引入了不确定性，在其他地方，在未来甚至当下的某个时间，这个程序都可能脱离你的掌控.

## Safety is the Absence of Undefined Behavior

实际上这里的安全指内存安全，关于内存安全，*D-Language* 给出的定义是：

> Memory Safety for a program is defined as it being impossible for the program to corrupt memory.

Rust 列举了[未定义行为的列表](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)，从语言层面上，非 *unsafe* 块/函数不可能发生未定义行为，这是一大壮举. 这时候有人要说了：“像 Java，Python，Go 这些语言，也都或多或少的限制了 UB，Rust 也并非做了什么了不起的事吧？”

的确，但 Rust 所做的不只是杜绝 UB，他还把 UB 的检查，以及“内存回收”（所有权系统/RAII，同时也杜绝了*数据竞争*）提前到了编译器，做到了 Trait，Iterator 等机制的零成本抽象，这是 Rust 为什么快的原因. 可以说 Rust Compiler 做了很多脏活累活.

**那么，这就是使用 *Rust* 的原因吗？**

不是，我认为之所以使用 Rust，不是因为编译器有多么智能多么严苛，没有人是因为 Rust 的编译错误一大堆所以想用 Rust，我认为之所以使用 Rust，是因为它总结了人类几十年以来积累的编程经验，填上了 UB 的大坑，编译器不是一个简单的检查工具，它更是一个编程助手，总结了几十年经验的编程助手. 我常常觉得软件工程是一门伟大的学科，它将人类辉煌的哲学思想融入了计算机，许多惊人的巧思背后体现的不过是一条简单的哲学思想. 回过头来才发现，当初“**自然科学**”一词其实取得相当精准.

peace~ 附赠愚人节“梗图”一张（~~速度与安全的取舍~~）：

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">FFmpeg is moving to Rust 🦀<br><br>Our use of C and Assembly in FFmpeg has been an unacceptable violation of safety.<br><br>FFmpeg will be running 10x slower - but we&#39;re doing it for your safety. <br><br>All your videos will appear green - safety first, working software later.</p>&mdash; FFmpeg (@FFmpeg) <a href="https://x.com/FFmpeg/status/2039115531744334180?ref_src=twsrc%5Etfw">March 31, 2026</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>

:::note
本文并非~~无脑鼓吹 Rust 牛逼~~的无脑行为，用 Rust 同样会有让人蛋疼的瞬间，每个语言都有其精妙之处，有其适合的领域，我们需要做的是从这些精妙设计中获得知识.
:::

<b id="references">references</b>  
[Rust Programing Language(Brown University Forked Version)](https://rust-book.cs.brown.edu/)  
[Everything in C is undefined behavior](https://blog.habets.se/2026/05/Everything-in-C-is-undefined-behavior.html)  
[Behavior Considered Undefined](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)  
[Rust Book: Option Enum](https://rust-book.cs.brown.edu/ch06-01-defining-an-enum.html#the-option-enum)
