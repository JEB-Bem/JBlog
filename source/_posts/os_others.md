---
title: 有权限却不可写？ —— 关于操作系统和国际标准的一些随笔
date: 2025/07/08 20:18:32
tags:
  - Linux
  - OS
categories: 笔记
filename: os_others.md
description: 从 UTF-8 编码结构、Linux 信号机制到文件权限判定规则，解析操作系统中的关键细节：UTF-8 前缀编码、Ctrl+Z 挂起与 kill 信号行为，以及 Linux owner 与 group 权限的实际判定逻辑。
keywords: 操作系统, UTF-8, Linux 信号, 文件权限, 标准
---

## Unicode and UTF-8 & ASCII

UTF-8 是一种用于电子通信的字符编码标准。由 Unicode 标准定义，其名称源自 Unicode Transformation Format – 8-bit.

UTF-8 使用 1 到 4 个单字节（8 位）代码单元的变长编码，支持所有 1,112,064 个 [3] 有效的 Unicode 代码点。

低数值的码点，由于出现频率较高，通常使用更少的字节进行编码。它被设计为向后兼容 ASCII：Unicode 的前 128 个字符与 ASCII 一一对应，使用单个字节进行编码，其二进制值与 ASCII 相同，因此仅使用这些字符编码的 UTF-8 文件与 ASCII 文件完全相同。

UTF-8 encodes code points in one to four bytes, depending on the value of the code point. In the following table, the characters u to z are replaced by the bits of the code point, from the positions U+uvwxyz:

| First code point | Last code point | Byte1    | Byte2    | Byte3    | Byte4    |
|------------------|-----------------|----------|----------|----------|----------|
| U+0000           | U+007F          | 0yyyzzzz |          |          |          |
| U+0080           | U+07FF          | 110xxxyy | 10yyzzzz |          |          |
| U+0800           | U+FFFF          | 1110wwww | 10xxxxyy | 10yyzzzz |          |
| U+010000         | U+10FFFF        | 11110uvv | 10vvwwww | 10xxxxyy | 10yyzzzz |

> 关于 UTF-8 过长编码，还存在一些安全问题可以利用

utf-8 的一些特点：

- UTF-8 是一种前缀编码（prefix code）：一个编码单元（这里指一个 Unicode 码点的 UTF-8 字节序列）不会是另一个编码单元的前缀。
- 自同步性（self-synchronizing）：UTF-8 的设计使得如果从字符串中的任意位置开始读取，都能通过往前最多回溯 3 个字节来找到当前字符的起始字节。
- 排序兼容性：UTF-8 编码的字节序设计使得按字节序对 UTF-8 字符串排序，结果与按 UTF-32（每字符固定32位）编码的排序一致。这意味着直接对 UTF-8 编码的字节序列进行字典序排序是可行且正确的。

![image-20250714233138063](images/image-20250714233138063.png)

## 信号处理的细节

操作的大致流程

```bash
sleep 1337
```

使用 Ctrl+Z 挂起（暂停）进程，进程进入 后台暂停状态（stopped）。

用 `kill <pid>` 发送信号杀进程，但发现进程仍然存在。

用 `fg` 恢复进程到前台。

再用 `ps` 发现进程已经被杀死。

**为什么会这样？**

1. 挂起（Ctrl+Z）导致进程处于 停止（STOPPED）状态

Ctrl+Z 会向进程发送 SIGTSTP 信号，进程收到后进入 暂停状态，停止执行，不消耗 CPU。

在这个状态下，进程不处理绝大多数信号，比如 SIGTERM，它实际上处于“睡眠”状态。

2. kill 发送信号默认是 SIGTERM（终止信号）

当你对 暂停状态 的进程发送 SIGTERM 时，进程不会马上终止，因为它被暂停了，信号无法被正常处理。

只有一些信号（比如 SIGKILL）会立即终止进程，且不能被捕获或忽略。

3. 恢复到前台后，进程重新开始运行
你执行 fg 命令后，进程从暂停状态恢复运行。

恢复后进程会处理之前未能处理的信号，比如之前的 SIGTERM。

于是进程才真正被杀死。


## 权限的小细节

根据下面的信息，hacker 对 pwn 可写吗？

```bash
$ id
uid=1000(hacker) gid=1000(hacker) groups=1000(hacker)
$ ls -l pwn
-r-xrwxr-x 1 hacker hacker 0 May 15 15:13 /challenge/pwn
```

不可写

当 owner 也属于 group 时：

- owner 操作文件时只看 owner 权限，不看 group 权限。

- group 权限对 owner 没影响，即使 owner 是 group 的成员。

- group 权限只对非 owner 的该组成员生效。
