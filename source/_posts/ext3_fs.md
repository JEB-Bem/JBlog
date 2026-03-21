---
title: 文件系统与 Ext3 数据日志模式
date: 2026-03-21 16:37:04
tags:
  - Linux
  - FileSystem
  - OS
description: 简要阐述 Linux 操作系统中的文件系统概念与 ext3 文件系统下三种数据日志模式的区别
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

## 文件与目录

我们知道操作系统将 CPU 虚拟化为进程（process），将内存（memory）虚拟化为地址空间（address space）. 这使得程序能够在一个虚拟化的“私有独立世界”中运行. **持久化储存（Persistent Storage）** 是另一重要的虚拟化部分. [^3]

在储存的虚拟化中有两个重要的抽象. 首先是文件，文件是一组字节的线性数组. 

[^1]: [Archlinux-wiki: Ext3](https://wiki.archlinux.org/title/Ext3)  
[^2]: [Wikipedia: Ext3](https://en.wikipedia.org/wiki/Ext3)  
[^3]: [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)  
