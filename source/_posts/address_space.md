---
title: mmap、pmap 与 proc
date: 2025/07/15 20:18:32
tags: [Linux, OS]
filename: address_space.md
description: 从 mmap、pmap 与 /proc 入手，梳理 Linux 进程地址空间与内存映射的基本机制。
keywords: Linux, mmap, pmap, proc, 虚拟内存
---

## 内存中的数据段划分

这个[文件](https://jyywiki.cn/os-demos/virtualization/address-space/simple.c)带我们初步认识了内存空间的结构

## mmap

> 在 `execve` 之后，内核确定了目前哪些空间是 process 可用的，其他区域（就叫红区吧）一旦访问就会 core dump，那么如果在程序运行过程中进行了 malloc, 内核应该怎么处理呢？答案是使用 mmap 去申请空间，将红区变成可用的。

mmap 是一种内存映射的机制，用于将文件或设备的内容映射到内存中。它不仅可以用来访问文件，也可以用于分配一块大的内存区域，适用于需要大规模内存分配的场景。

在 C/C++ 中，mmap 通常用于以下几个目的：

- 内存映射文件：将文件内容映射到内存，使得对文件的访问像操作内存一样高效。

- 匿名映射：直接在进程的虚拟地址空间中分配内存，不与任何文件关联，常用于大内存分配，避免使用传统的堆或栈。

```c
void* mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
```
- `addr`：映射的起始地址，通常设为 NULL，让系统自动选择合适的地址。
- `length`：映射的内存区域大小，通常以字节为单位。
- `prot`：映射区域的访问权限标志，常用的选项有：
    - `PROT_READ`：可读
    - `PROT_WRITE`：可写
    - `PROT_EXEC`：可执行
    - `PROT_NONE`：无权限
- `flags`：映射的特性，常用的选项有：
    - `MAP_SHARED`：共享映射，如果映射文件，则表示可以修改源文件, 内核分配内存则是单纯的共享
    - `MAP_PRIVATE`：私有映射，其余类似上
    - `MAP_ANONYMOUS`：内存分配，否则就是映射文件
- `fd`：文件描述符，若使用匿名映射，则应设置为 -1。
- `offset`：文件映射的起始偏移量，通常为 0。

mmap 的返回值是一个指向映射区域的指针。如果映射成功，mmap 会返回映射区域的起始地址；如果失败，则返回 MAP_FAILED，这是一个常量，通常定义为 (void *) -1。

```c
char *buf = mmap(NULL,
    TK_OUTPUT_LIMIT,
    PROT_READ | PROT_WRITE,
    MAP_SHARED | MAP_ANONYMOUS, -1, 0);
```

使用类似于上面的代码和 `fork()` 函数，可以实现父子进程之间内存的共享，而非父子进程之间一般需要创建一个特殊的共享内存的文件用于内存共享，这是 IPC（进程间通信）的一种实现方式。

### pmap

> pmap - report memory map of a process

```bash
pmap [option ...] pid ...
```

pmap 主要是利用 `/proc/[pid]/maps` 文件下信息（可以使用 `strace` 查看）

----

这个[文件](https://jyywiki.cn/os-demos/virtualization/address-space/mmap-demo.c)有一些使用 mmap 的例子，其中有一个映射文件的例子，我们需要注意：

如果在 `open` 的时候没有没有写权限，那么在 `mmap` 的时候不能同时设置 `MAP_SHARED` 和 `PROT_WRITE`，因为对文件没有写权限，如果没有使用 `SHARED`，则没有问题，因为内核会复制一个文件副本，然后程序映射的内存空间实际上是这个副本，所以不会有问题，如果两个都开的话会报错（前提是使用了 `perr()`）：
```bash
mmap file: Permission denied
```

mmap（ANOYNOUS）一段内存之后，内存并没有直接被分配，而是真正去访问的时候才会分配内存，而且也只是分配访问的内存，所以理论上，可以分配一段很长的内存（甚至超出物理内存的大小）

> 补充一点，ANOYNOUS 分配后的内存，一旦访问，初始值为 0.

![image-20250711000938715](images/image-20250711000938715.png)

## 入侵地址空间

我们可以使用 /proc/[pid]/mem 来直接访问到一个进程的虚拟内存（如果有足够的权限的话。
