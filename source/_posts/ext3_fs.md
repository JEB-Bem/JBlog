---
title: 文件系统与 Ext3 数据日志模式
date: 2026-03-21 16:37:04
tags:
  - Linux
  - FileSystem
  - OS
description: 简要阐述 Linux 操作系统中的文件系统概念与 ext3 文件系统下三种数据日志模式的区别
filename: ext3_fs.md
---

::: caut
这是一种过时的文件系统，已经被 *ext4* 取代.
:::

## 概述

Ext3(第三代扩展文件系统, Third extended filesystem)，在 2001 年推出时曾因其日志的功能被许多发行版选择. 但是如今已经被更好的 ext4 所取代.[^1] [^2]

Ext3 下有三种数据日志模式（或称日志等级）：

- `data=journal`：元数据和文件内容都会在真正落盘之前写入日志；
- `data=ordered`：只有元数据会写入日志，但要求文件内容落盘之后才提交元数据到日志；
- `data=writeback`：只有元数据会写入日志，但不要求写入日志和落盘的顺序.

为了更好地介绍上面提到的这些概念，我们先了解一下文件与文件系统.

## 文件与目录

> 本部分源自 *Operating Systems: Three Easy Pieces*，您可以到此处阅读原文：https://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf

我们知道操作系统将 CPU 虚拟化为进程（process），将内存（memory）虚拟化为地址空间（address space）. 这使得程序能够在一个虚拟化的“私有独立世界”中运行. **持久化储存（Persistent Storage）** 是另一重要的虚拟化部分. [^3]

在储存的虚拟化中有两个重要的抽象. 首先是**文件**，文件是一组字节的线性数组. 每个文件都具有一个较底层的名字，这个名字通常是某种形式的数字，由于历史渊源，这个数字通常是文件的索引节点数，即 inode number （i-number）. [^4]

在大多数操作系统中，系统都不会对文件有太多了解（例如文件的类型），文件系统只是将这些数据持久地存储在磁盘上并确保我们能再次获得这些数据（虽然这也并不简单）.

操作系统的第二个抽象是**目录**，与文件类似，它同样具有一个底层的名字. 而其内容通常是一个列表，每个元素是关于每个文件的 `<可读文件名, 底层文件名>` 对. 目录嵌套目录，就形成了文件树.

::::tip
:::spoi 文件名
在文件系统的不同目录下，可以分别定义相同的文件名或目录名，但是同一个目录下不能存在相同的文件名和目录名，这一点在 *Windows* 和 *Unix* 下都是一致的（eg. 1）. 另外，尽管我们常常使用后缀名来标识一个文件的类型，但这仅仅只是一个**约定**（eg. 2）.

```ascii
# eg. 1
bar
├── bar      # Can not be named as "foo"
│   └── foo
└── foo
```

```bash
# eg.2
$ echo "hello world" > foo.png
$ file foo.png
foo.png: ASCII text
```
:::
::::

<!-- TODO 补充文件的结构体、元数据等知识 -->

### 文件系统接口

<!-- TODO: 待完善 -->


更多的文件与目录有关知识，可查看这篇[文章](/file-and-directory.html)

## 文件系统实现

> 本部分源自 *Operating Systems: Three Easy Pieces*，您可以到此处阅读原文：https://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf

我们通过一个简单的文件系统实现（vsfs，Very Simple File System）来理解文件系统.

:::tip
你应该在学习过程中建立一个模型，明确下面几个问题：
1. 文件系统的数据和元数据分别存储在哪些**磁盘结构（on-disk structures）**中？
2. 当一个进程打开文件时，系统内部发生了什么？
3. 在执行一次读/写操作时，会访问哪些磁盘结构？
:::

### 文件系统的数据结构

### 文件系统的访问方法

[^1]: [Archlinux-wiki: Ext3](https://wiki.archlinux.org/title/Ext3)  
[^2]: [Wikipedia: Ext3](https://en.wikipedia.org/wiki/Ext3)  
[^3]: [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)  
[^4]: [Wikipedia: inode](https://en.wikipedia.org/wiki/Inode)  
