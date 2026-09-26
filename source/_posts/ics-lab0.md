---
filename: ics_lab0.md
date: 2026-09-19 14:54:29
title: 计算机系统基础Ⅱ Lab0 - 实验环境配置与基本概念
tags: [汇编, Linux, Memory, 计算机系统基础]
description: 欢迎来到计算机系统基础Ⅱ实验
indent: true
---

> 本文提供[在线版本](https://chrjeb.cn/ics-lab-pre.html).

实验环境配置参考附件***计算机系统基础Ⅱ实验环境配置.pdf***或[在线版本](/ics-lab-env.html).

## 1. 欢迎来到二进制的世界！

:::caut
为了更好地完成实验，实验课所需要使用的知识可能会超出理论课目前所学，其中一些涉及计算机科学与技术导论的所学，我们就不展开讲解，而一些新的知识，实验讲义会尽量覆盖，但仍然需要同学们根据课后参考资料等途径补充知识. 不过，我们需要的是基本概念，建立起一个计算机系统的基础模型，因此即便是理论课还未涉及的部分也不会过于深入.
:::

接下来就是计算机系统基础的正式实验内容了，本次实验是先导试验，涉及的基本概念比较多，主要是为了再次巩固理论课所学，可能会有点难度，但我们会循序渐进，结合参考资料和 LLM，消化好每一次实验的内容，相信完成之后你一定能有不小的收获[^2].

[^2]: [为什么要学习计算机系统基础](https://nju-projectn.github.io/ics-pa-gitbook/ics2026/why.html)

在 Linux 中打开我们提供的 *code* 文件夹（你需要确保共享文件夹配置正确[双向]，或自行采用其他方法），使用以下命令编译得到中间产物和最终的 *elf* 文件：

```bash
$ make hello
gcc hello.c -E -o hello.i -ggdb -m32
gcc hello.i -S -o hello.s -m32 -ggdb -O0 -fno-PIC -fno-stack-protector
gcc hello.s -c -o hello.o -m32
gcc hello.o -o hello -ggdb -m32 -no-pie -static
```

:::tip
- 为了学会 Makefile 的基本使用，你可以阅读我们提供的 *用 gcc 编写 hello_world.pdf*，也可以进阶一些，阅读这两篇很好的 Tutorials: [Learn Makefiles](https://makefiletutorial.com/)、[跟我一起学 Makefile](https://seisman.github.io/how-to-write-makefile/introduction.html)，若想学习得更全面一些，推荐这门[课程](https://csdiy.wiki/%E7%BC%96%E7%A8%8B%E5%85%A5%E9%97%A8/MIT-Missing-Semester).
- 上面的 `gcc` 命令可能比较疑惑，这时我们就需要一本全面的手册，你可以使用 `info gcc`，也可以使用 `man gcc`，我更推荐后者，`man` 默认使用 `less` 作为阅读器，你可以自行使用 AI 辅助阅读文档，另一个常用的命令是 `gcc --help=common`，可以输出常用的选项.
:::

你会得到四个新文件：

```bash
$ file hello.i hello.s hello.o hello
hello.i: C source, ASCII text
hello.s: assembler source, ASCII text
hello.o: ELF 32-bit LSB relocatable, Intel i386,
version 1 (SYSV), with debug_info, not stripped
hello:   ELF 32-bit LSB executable, Intel i386,
version 1 (GNU/Linux), statically linked,
BuildID[sha1]=9e6c3343a9cf8ddc20ecb5ad2ca25105a3209698,
for GNU/Linux 4.4.0, with debug_info, not stripped
```

后续的分析都是使用 `hello` 这个二进制程序进行的.

### 1.1 一个进程

对于进程，一个简单的定义是“*运行中的程序*”. 我们就从这个简单定义开始，一步步完善我们的模型.

![20260920-6596a9d5e39b6ebe.png](./images/20260920-6596a9d5e39b6ebe.png)

进程可以看作是一个状态机（State Machine），程序的执行实际上就是**状态的转移**，而一个进程的状态由两个明显的组成部分：*地址空间（Address Space）*和*寄存器（Registers）*. 从硬件的视角来看，CPU 就是不断的从地址空间 PC 指向的位置取出指令，然后执行它，执行的过程中可能改变地址空间和寄存器，这就发生了状态的转移，执行完毕后，PC 指针指向下一条指令的起始位置，程序执行下一条指令. 因此，计算机实际上就是不停计算的机器，下面是一个伪代码展示（摘自 HDU-CS-WIKI）.

```rs
let pc
loop {
    let inst = read_from_memory(pc); // 从PC指示的存储器位置取出指令
    let new_pc = exec_inst(inst); // 执行指令
    pc = new_pc; // 更新PC
}
```

#### 体系结构与汇编语言

在计算机领域，汇编语言（Assembly Language）常被简称为汇编，通常缩写为 ASM 或 asm，泛指指令与体系结构的机器码指令之间具有非常强的对应关系的低级编程语言. 汇编语言的每条语句通常与机器码指令一一对应，但也支持常量、注释、汇编器伪指令，以及例如内存位置、寄存器和宏的符号标签（译自 Wikipedia）.

体系结构与汇编语言的知识相当繁杂，这个[网站](https://pwn.college/computing-101/)通过视频教学与在线实践一步一步构建起体系结构的框架和历史，与我们的课程相比是一个不太相同的视角，[这里](./Assembly.html)是我曾经学习的一点笔记，比较杂乱，更推荐直接在网站上学习.

本课会涉及到两种体系结构，其一是 *IA-32*（又称 i386，i80386 或 x86，我们马上就会涉及）；其二是 *i8086*（被 *DOS* 系统使用，会在后续的实验中再讲解）[^5]. 下面是关于 IA-32 一些有用的速查手册，强烈建议大致浏览一下，使用 AI 辅助，明确手册的作用，方便后续实验查阅：

[^5]: 关于内存访问的发展，这篇[文章](https://blogsystem5.substack.com/p/from-0-to-1-mb-in-dos)写得很好，可以帮助我们更进一步理解内存.

- IA-32（i386）的官方手册在 *i386.pdf*，以后的实验中会经常用到；
- 一个个人网站提供的便捷[指令速查页面](https://www.felixcloutier.com/x86/)，推荐同学们使用；
- Linux 目前使用 [System V ABI](https://jyywiki.cn/OS/manuals/sysv-abi.pdf)，我们会使用到其规定的调用约定（Calling Conventions），可以通过 [OSDev](https://wiki.osdev.org/Calling_Conventions) 速查.

:::tip
关于汇编语言的语法风格，Linux 上存在两种：Intel 和 GNU 的 AT&T，GNU Bin utils 基本都使用的是 AT&T 风格，Intel 则是 pwndbg 的默认风格，主要区别是操作数的顺序不同，选择哪种风格属口味问题，大多数工具也都支持更换风格，留给大家自行探索.
:::

我们前面绘制了简单进程模型示意图（x86），接下来我们讨论得更具体一些，按照前文所述，进程的两个关键组成部分就是地址空间和寄存器了.

##### 平坦的内存空间（Address Space）

在 IA-32 的设计中，内存是平坦的，一个进程拥有从 `0x0` 到 `0xFFFFFFFF` 的大小为 $2^{32}$ Bytes = $4$ GiB 的***虚拟内存空间***，我们暂时忽略其他内存节，聚焦于单线程进程的堆和栈，这是大家在写 C 语言程序时最基本的内存概念. 我们的示例程序在进入 `test` 函数体之后的内存布局类似于：

![20260922-0d399e910c566778.png](./images/20260922-0d399e910c566778.png)

:::tip
- 不同的计算机架构会定义其字长（word width）. 由于历史原因，相关术语已经变得相当混乱.
- 在 x86_64 中，字长是 64 bits.
- 在 IA-32(x86) 中，字长则是 32 bits.
- Quad 就是“4倍的”的意思
:::

##### 调用约定

下面是几种平台的调用约定，我们关注第一行，System V i386 的调用约定，注意到 IA-32 无额外的对齐要求，而 `push` 和 `pop` 的操作数大小都是 4 字节，因此 IA-32 在最宽松的条件下是 4 字节对齐的.

而 IA-32 的函数参数全部使用栈来传递，返回值使用 `EAX` 和 `EDX` 寄存器存储.

![20260921-007d692f02841ad0.png](./images/20260921-007d692f02841ad0.png)

因此，对于函数签名：

```c
int test(char *x, char y, int z);
```

当调用者调用 `test` 时，

- 调用者从右到左依次 `push` 参数（若存在 `long long` 类型的参数，该参数需要 `push` 两次）；
- 将调用完将要执行的指令地址 `push` 到栈中，并将 `EIP` 设置为 `test` 第一条指令的地址（`call`）；

其进入函数体之后某一时刻的栈帧应当如下图所示：

![20260921-e3d6a3cf68879fc5.png](./images/20260921-e3d6a3cf68879fc5.png)

当函数返回时，

- 若返回值长度大于 4 字节，返回值的低 4 字节存储到 `EAX`，高 4 字节存储到 `EDX`；
- `ESP` 被设置为 `EBP` 当前的值，然后 `EBP` 通过 `pop` 恢复到调用前的值，注意 `ESP` 也随着 `pop` 增大 4 字节（`leave`）；
- `EIP` 通过 `pop` 设置为调用者调用完函数要执行的下一条指令的地址，因此 `ESP += 4` （`ret`）.

### 1.2 ELF (Executable and Linkable Format)

![20260921-3750b592c75f35c8.png](./images/20260921-3750b592c75f35c8.png)

> In computing, the Executable and Linkable Format (ELF, formerly named Extensible Linking Format) is a common standard file format for executable files, object code, shared libraries, device drivers, and core dumps.  
> —— Wikipedia

本节，我们关注于 `hello`，即 *elf* 文件，其余文件在下一节做解释.

![20260922-68a294585c79b423.png](./images/20260922-68a294585c79b423.png)

本节的第一张图看起来相当复杂，有各种各样的 Tables、Headers，看起来眼花缭乱，不用担心，我们目前只需要掌握一个基本概念——“程序是怎样跑起来的？”. 接下来我们就围绕这个概念展开[^6].

[^6]: 为了简化模型，我们忽略动态加载的过程和动态链接器/加载器等内容，以静态程序举例.

#### 加载（Loading）

首先引入一个基本概念，程序是被加载到内存之中，才能被操作系统执行的. 那么操作系统[^6]怎么知道如何把程序加载到内存里呢？在 *Linux* 中，只需要读取 *elf* 的 *ELF Header* 和 *Program Header Table* 就可以了！

```bash
$ readelf -h hello
ELF Header:
  Class:                             ELF32
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - GNU
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Intel 80386
  Version:                           0x1
  Entry point address:               0x804ae40
  Start of program headers:          52 (bytes into file)
  Start of section headers:          765524 (bytes into file)
  Flags:                             0x0
  Size of this header:               52 (bytes)
  Size of program headers:           32 (bytes)
  Number of program headers:         10
  Size of section headers:           40 (bytes)
  Number of section headers:         32
  Section header string table index: 31
```

```bash
$ readelf -l hello
Elf file type is EXEC (Executable file)
Entry point 0x804ae40
There are 10 program headers, starting at offset 52

Program Headers:
  Type           Offset   VirtAddr   PhysAddr   FileSiz MemSiz  Flg Align
  LOAD           0x000000 0x08048000 0x08048000 0x00200 0x00200 R   0x1000
  LOAD           0x001000 0x08049000 0x08049000 0x724d8 0x724d8 R E 0x1000
  LOAD           0x074000 0x080bc000 0x080bc000 0x3052c 0x3052c R   0x1000
  LOAD           0x0a4b14 0x080edb14 0x080edb14 0x03348 0x061b4 RW  0x1000
  NOTE           0x000174 0x08048174 0x08048174 0x00024 0x00024 R   0x4
  NOTE           0x0a44d8 0x080ec4d8 0x080ec4d8 0x00054 0x00054 R   0x4
  TLS            0x0a4b14 0x080edb14 0x080edb14 0x0001c 0x00028 R   0x4
  GNU_PROPERTY   0x0a44d8 0x080ec4d8 0x080ec4d8 0x00034 0x00034 R   0x4
  GNU_STACK      0x000000 0x00000000 0x00000000 0x00000 0x00000 RW  0x10
  GNU_RELRO      0x0a4b14 0x080edb14 0x080edb14 0x024ec 0x024ec R   0x1
...
```

看起来也很复杂，但是没关系，我们只需要从操作系统的视角真正去加载一遍就可以了.

![20260922-6d77e080ced60d44.png](./images/20260922-6d77e080ced60d44.png)

具体而言，加载的过程可以简化为：

- 操作系统识别出 ELF 文件了，于是按照规范去文件头部读取 ELF Header；
- ELF Header 里记录了 Program Headers 的偏移（offset），于是可以读取每一条需要加载的段（Segment）；
- 根据 Program Headers Table 中的某一条 LOAD 记录，操作系统把 ELF 文件中的某一段二进制数据“搬”到这个进程的内存空间中.
- 操作系统根据 ELF Headers 中的 Entry Point 等设置 PC 指针等，完成初始化.

然后就可以开始运行了！针对 *elf* 文件，我们就了解到这里.

🎉🎉🎉 到此为止，我们已经把整个内存空间的全貌基本补齐了，在 2.1 节，我们了解到进程运行时会分配栈和堆，这可以看作是一个程序运行时的“草稿纸”，所有运行时产生的非持久数据都储存在里面，而我们加载进来的这些段呢？其中一些可读可写的段（我们的全局变量会放在这里面）实际上也是“草稿纸”的一部分，而另一些只读的段，除了我们定义的常量以外，就是代码了，这可以看作一个进程的“大脑”，下一步做什么？根据运算得到的结果该做怎样的处理？什么时候停止？都是由从文件（以及从 libc 库，我们暂时忽略这个概念）加载进来的那些只读的段来决定的.

![Memory Overview](./images/image-20250523162915788.png)
(摘自 Pwn College)

### 1.3 逆向与调试

关于调试，也就是 GDB（pwndbg）的使用，有几篇很好的材料[^3]，为了更好的理解其所说的内容，可以先阅读这篇[前置内容](https://nju-projectn.github.io/ics-pa-gitbook/ics2026/0.5.html).

[^3]: [GDB Tutorial](https://beej.us/guide/bggdb/)、[GDB Cheat Sheet](https://csapp.cs.cmu.edu/3e/docs/gdbnotes-x86-64.pdf)

接下来我们以示例程序为例，演示一个简单*单文件 C 语言程序*的预处理、编译、汇编和链接过程[^4]，并做简单的调试.

[^4]: 此处省略一些细节，感兴趣可以了解：[Translation Unit](https://en.wikipedia.org/wiki/Translation_unit_(programming)).

上一节我们使用 `make` 获得了四个文件，这四个文件的产生过程，配合选项可以解释为：

![20260921-b22cdf87b721b4d7.png](./images/20260921-b22cdf87b721b4d7.png)

这四条 `gcc` 使用了很多选项，对于我们目前来说，只需要了解其中几个选项，其他选项会在后续的实验中陆续学习. 首先是一些影响执行结果的选项（这些选项不会使得最终生成的文件类型不同）：

- `-ggdb`: 与 `-g` 的效果类似，都用于在生成的结果中插入调试信息（这样你的 gdb 就认识某条语句对应的源代码是什么了），不过 `-ggdb` 是专门针对 `gdb` 做了些优化，对我们而言差别不大.
- `-m32`: 生成 x86（32位）架构的目标文件

然后是一些影响执行阶段的选项（Overall Options，这些选项会使最终生成的文件类型不同）：

- `-E`: `gcc` 只会执行预处理（Preprocessing）阶段，预处理阶段会对我们的 `.c` 源代码文件进行文件导入、宏定义展开、条件编译等操作. 不严谨的说，如果删除其中的 `# ` 开头的语句，最终产生的文件实际上还可以被视作一个 C 的源代码文件，只是现在不再还有任何宏定义、条件编译等语句.
- `-S`: `gcc` 会一直执行到编译（Compiling）阶段，而起始阶段由 `gcc` 从输入文件的扩展名推断（或者由 `-x` 选项指定）. 我们得到的编译产物就是一个汇编代码文件了，这就是大多数高级程序语言所谓的“编译”功能.
- `-c`：`gcc` 会一直执行到汇编（Assembling）阶段（起始阶段同 `-S`）. 汇编可以简单理解为将汇编代码翻译成机器码，这时得到的文件就是一个二进制文件，在 linux 中，我们得到的是一个*可重定位目标文件（Relocatable object file）*.

  ```bash
  file hello.o
  hello.o: ELF 32-bit LSB relocatable, Intel i386, version 1 (SYSV),
  with debug_info, not stripped
  ```

  一个 `.o` 文件可以：
  - 经过归档，成为一个 `.a` 静态库；
  - 经过链接，成为一个 `.so` 共享库（`-shared` 选项）或可执行文件.

- 若不指定上面三个选项，`gcc` 会执行到链接（Linking）阶段（起始阶段同 `-S`）. 顾名思义，链接即是将一个或多个 `.o` 文件链接成共享库（Shared Library）或可执行文件（Executable）.

#### GDB 调试

实际上，前面已经使用过了 `readelf`、`elfcat`、`objdump` 等工具，这里再做一次简单介绍.

- `readelf` 主要用于查看 `elf` 内存储的各种信息，使用
  - `-h` 选项可以查看 `elf` 的 ELF 头；
  - `-l` 选项可以查看程序头表；
  - `-S` 选项可以查看节头表；
  - `-s` 选项可以查看所有符号.
- `objdump` 主要用于反编译 `elf` 文件，使用
  - `-M intel, i386` 指定汇编代码风格为 intel，并指定目标平台为 IA-32；
  - `-S` 反汇编并混入源代码；
  - `-d` 反汇编代码段；
  - `--disassemble=<Symbol>` 反汇编指定符号对应的代码；
  - `-s` 展示所有 sections；
  - `-r` 展示重定向条目；
  - `-j <Section>` 展示特定 Section 的内容.
  - 举例：`objdump --disassemble=main -S -M intel,i386 hello`，只反汇编 main 函数，并输出 Intel 语法的 32 位汇编，同时混入源码；
- `elfcat` 是一个可视化工具，可以在 html 中展示 `elf` 的结构，使用 `elfcat <file>` 输出 html 代码到 `<file>.html`.

`gdb` 的使用在接下来的内容中一并解释，接下来我们尝试用上面这些工具验证我们前面所讲的理论内容.

程序是有入口的，这是静态链接的可执行文件的第一条指令执行的地方，我们首先查看 entry point 的位置（省略部分输出）：

```bash
readelf -h hello
ELF Header:
...
  Entry point address:               0x804ae40
  Start of program headers:          52 (bytes into file)
  Start of section headers:          765592 (bytes into file)
...
```

可以看到入口是 `0x804ae40`，也就是说进程被加载后 PC 指针就会被设置为 `0x804ae40`，我们在 pwndbg 中通过 `starti` 可以启动进程，并停在第一条指令的位置：

![20260922-9d6f7919b6fa72cd.png](./images/20260922-9d6f7919b6fa72cd.png)

（由于 pwndbg 输出信息很多，我们接下来只展示部分输出）

确实停在 `0x804ae40` 了！接下来我们借此机会再确认一件事——ELF 的段真的是如我们预期的那样被“搬”（映射）到内存空间中了吗？我们可以使用 `vmmap` 命令：

```bash
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
     Start        End Perm     Size  Offset File (set vmmap-prefer-relpaths on)
 0x8048000  0x8049000 r--p     1000       0 hello
 0x8049000  0x80bc000 r-xp    73000    1000 hello
 0x80bc000  0x80ed000 r--p    31000   74000 hello
 0x80ed000  0x80f1000 rw-p     4000   a4000 hello
 0x80f1000  0x80f4000 rw-p     3000       0 [anon_080f1]
0xf7ff5000 0xf7ff9000 r--p     4000       0 [vvar]
0xf7ff9000 0xf7ffb000 r--p     2000       0 [vvar_vclock]
0xf7ffb000 0xf7ffe000 r-xp     3000       0 [vdso]
0xfffdd000 0xffffe000 rw-p    21000       0 [stack]
```

和我们的预期完全是一模一样的，我们还在最后一行看到了栈的分配. 那么堆在什么时候分配呢？在我们第一次尝试动态分配内存的时候，比如使用 `malloc`.

接下来，让我们确认一条指令执行完毕后，PC 指针真的如我们所想的移动. 我们进行单步执行操作

```bash
pwndbg> ni
--- Registers ---
 EAX  0
 EBX  0
 ECX  0
 EDX  0
 EDI  0
 ESI  0
 EBP  0
 ESP  0xffffd0c0 ◂— 1
*EIP  0x804ae42 (_start+2) ◂— pop esi
--- DISASM ---
0x804ae40 <_start>       xor    ebp, ebp            EBP => 0
 ► 0x804ae42 <_start+2>     pop    esi                 ESI => 1
...
```

程序执行了当前的指令，`EBP` 被置零，然后 `PC` 指针设置为 `0x804ae42`，表示即将执行 `_start` 函数的第二条指令. 接下来，我们直接跳转到 `main` 函数，为了到达这里，我们可以选择：

- `start`，即重启程序，并停止在 `main` 的第一条语句/指令；
- `b main`，首先在 `main` 打一个断点，然后 `c` 继续执行到下一个断点处；

这里我们用第二种方法，可以看到已经停止在 `main` 的第一条语句了. 注意到这时我们已经能看到 [ SOURCE (CODE) ] 这个子窗口了. 这是因为我们使用 `gcc` 编译选项添加了调试信息.

![20260922-1f0b59ac20673ca5.png](./images/20260922-1f0b59ac20673ca5.png)

接下来我们尝试确认调用函数的过程是否与我们的理论一致. 使用 `ni` 命令单步执行到 `call test` 指令的位置：

```bash
   0x804b06e <main+78>     mov    eax, dword ptr [eax]
   0x804b070 <main+80>     sub    esp, 4
   0x804b073 <main+83>     push   eax
   0x804b074 <main+84>     push   0x62
   0x804b076 <main+86>     push   0x80bc02a
 ► 0x804b07b <main+91>     call   test
        arg[0]: 0x80bc02a ◂— 0x20630061 /* 'a' */
        arg[1]: 0x62
        arg[2]: 6
   0x804b080 <main+96>     add    esp, 0x10
   0x804b083 <main+99>     mov    edx, dword ptr [n]
   0x804b089 <main+105>    imul   eax, edx
   0x804b08c <main+108>    mov    dword ptr [ebp - 0x14], eax
   0x804b08f <main+111>    sub    esp, 8
```

参数 2、1、0 从 `<main+83` 开始通过三次 `push` 指令依次入栈，符合我们 2.1 节讲解的理论知识. 我们先记录一下目前的寄存器，稍后在 `call` 之后看看寄存器的变化：

```bash
regs
 EAX  6
 EBX  0xffffd0cc —▸ 0xffffd33a ◂— 'SHELL=/usr/bin/zsh'
 ECX  0x80f1560 (_IO_stdfile_1_lock) ◂— 0
 EDX  0x80f1560 (_IO_stdfile_1_lock) ◂— 0
 EDI  0xffffd0c4 —▸ 0xffffd30b ◂— '/tmp/hello'
 ESI  0x80efff4 (_GLOBAL_OFFSET_TABLE_) ◂— 0
 EBP  0xffffcfc8 ◂— 2
*ESP  0xffffcfa0 —▸ 0x80bc02a ◂— 0x20630061 /* 'a' */
*EIP  0x804b07b (main+91) —▸ 0xffff45e8 ◂— 0
```

然后，我们使用 `si` 命令（而不是使用 `s` 命令）步入，进入 `test` 函数：

```bash
...
 ► 0x804afc5 <test>       push   ebp
   0x804afc6 <test+1>     mov    ebp, esp
   0x804afc8 <test+3>     sub    esp, 0x10
...
```

这时候再看寄存器，

```bash
pwndbg> regs
 EAX  6
 EBX  0xffffd0cc —▸ 0xffffd33a ◂— 'SHELL=/usr/bin/zsh'
 ECX  0x80f1560 (_IO_stdfile_1_lock) ◂— 0
 EDX  0x80f1560 (_IO_stdfile_1_lock) ◂— 0
 EDI  0xffffd0c4 —▸ 0xffffd30b ◂— '/tmp/hello'
 ESI  0x80efff4 (_GLOBAL_OFFSET_TABLE_) ◂— 0
 EBP  0xffffcfc8 ◂— 2
*ESP  0xffffcf9c —▸ 0x804b080 (main+96) ◂— add esp, 0x10
*EIP  0x804afc5 (test) ◂— push ebp
```

可以发现 `ESP` 已经发生了变化（`EIP` 自然会发生变化），`EBP` 仍然保持原值，接下来我们查看现在的栈，从 `ESP` 到 `EBP`，一共 `0xffffcfc8 - 0xffffcf9c = 44` 字节，由于栈的操作数大小为 $4$ 字节，因此：

```bash
pwndbg> x/11wx $esp
0xffffcf9c:	0x0804b080	0x080bc02a	0x00000062	0x00000006
0xffffcfac:	0x080f0e64	0x080f3c68	0x080d83f8	0x00000002
0xffffcfbc:	0x080f4d70	0xffffcfe8	0xffffcfe0
```

从低到高看，栈中的前四个元素分别是：

- `0x0804b080`: 指令 `<main+96>`，即 `call` 之后的下一条指令的地址；
- `0x080bc02a`: 常量字符串 `"a"` 的地址，也就是 `char *x`；
- `0x00000062`: 按照小端序，`0xffffcfa4` 处存储的实际上是 `0x62`，也就是 `char y`，你可以使用 `x/16bx $esp` 确认这一点.
- `0x00000006`: 这是 `int z`.

同样验证了我们之前所学，再看反汇编代码，可以看到马上就要执行的是 `push ebp`，一切都与我们所学对应起来.

:::tip
- 可以使用 `disas <函数名>` 查看函数的整个反汇编代码；
- 可以使用 `l <函数名>` 查看函数的前十行 C 代码，按下回车可以继续查看；
- 你可能注意到 `next` 和 `n` 的效果是一样的，实际上，在 gdb 中只要敲出一定的前缀（让 gdb 能够区分出来），或者 gdb 设置的缩写，就可以直接执行这条命令，比如，`disas/disasse/disassemble` 这三条命令的效果是一样的.
:::

## 2. Lab0 - 二进制分析与调试

下面是你需要完成的实验内容，本次实验更多是探索性质的，你可以尝试使用我们提供的工具，验证理论课和前面实验讲义所讲解的内容，并在实验报告中记录你的发现和想法. 下面是一些必须完成的实验内容和一些供探索的选做内容.

### 2.1 可重定位目标文件 Vs. 可执行文件

删除 *Makefile* 中的 target `hello` 的 `-static` 选项，使用下面命令保存两个反汇编结果，然后尝试使用 `diff` 等工具比较两个汇编结果的不同，从而总结可重定位目标文件和可执行文件的不同（intel 语法风格的选项可去掉，但两条命令的选项请保持一致）.

```bash
make clean all
objdump -S -M intel,i386 hello > hello-1.txt
objdump -S -M intel,i386 hello.o > hello-2.txt
```

:::tip
使用 `diff` 命令还是不太直观对吧？你可以试试一个 Rust 开发的命令行工具 `delta`($\delta$)，这个命令可以在命令行中可视化地“diff”两个文件. 你还可以尝试使用 vscode 等 IDE 自带的文件比较工具.
:::

### 2.2 调试分析

:::note
本节使用 *bar* 文件作为分析对象.
:::

你应该注意到 Make 尝试使用 `gdb`、`objdump`、`readelf` 等工具，逆向确认全局变量 `n` 在 `hello` 文件中的偏移，并给出完整的分析过程. 下面以常量字符串 `"Hello World"` 为例作演示.

```bash
# 进入 main 函数体，停在第一条语句
pwndbg> start
 ► 0x804afd6 <main+17>    mov    dword ptr [s], 0xdeabbeef
   0x804afe0 <main+27>    sub    esp, 0xc
   0x804afe3 <main+30>    push   0x80bc018
   0x804afe8 <main+35>    call   puts
```

根据 `call puts` 可以确定常量字符串在进程的内存空间的位置是 `0x80bc018`，我们使用 `x` 命令确认一下

```bash
pwndbg> x/s 0x80bc018
0x80bc018:	"Hello World."
```

:::tip
**Help Message of x**

*Examine memory: x/FMT ADDRESS.*

`ADDRESS` is an expression for the memory address to examine.
`FMT` is a repeat count followed by a format letter and a size letter.

Format letters are `o(octal)`, `x(hex)`, `d(decimal)`, `u(unsigned decimal)`,
  `t(binary)`, `f(float)`, `a(address)`, `i(instruction)`, `c(char)`, `s(string)`
  and `z(hex, zero padded on the left)`.

Size letters are `b(byte)`, `h(halfword)`, `w(word)`, `g(giant, 8 bytes)`.

The specified number of objects of the specified size are printed
according to the format.  If a negative number is specified, memory is
examined backward from the address.

Defaults for format and size letters are those previously used.
Default count is 1.  Default address is following last thing printed
with this command or "print".
:::

确认是在这个位置，我们还没有介绍节的概念，不过没关系，有段的概念就足够了，我们现在确认这个字符串属于哪一个段

```bash
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
     Start        End Perm     Size  Offset File
 0x8048000  0x8049000 r--p     1000       0 bar
 0x8049000  0x80bc000 r-xp    73000    1000 bar
 0x80bc000  0x80ed000 r--p    31000   74000 bar
 0x80ed000  0x80f0000 r--p     3000   a4000 bar
 0x80f0000  0x80f1000 rw-p     1000   a7000 bar
 0x80f1000  0x80f4000 rw-p     3000       0 [anon_080f1]
 0x80f4000  0x8116000 rw-p    22000       0 [heap]
0xf7ff5000 0xf7ff9000 r--p     4000       0 [vvar]
0xf7ff9000 0xf7ffb000 r--p     2000       0 [vvar_vclock]
0xf7ffb000 0xf7ffe000 r-xp     3000       0 [vdso]
0xfffdd000 0xffffe000 rw-p    21000       0 [stack]
```

可以确认是 `0x80bc000  0x80ed000`，接下来我们对比 *Program Headers Table*：

```bash
Program Headers:
  Type           Offset   VirtAddr   PhysAddr   FileSiz MemSiz  Flg Align
  LOAD           0x000000 0x08048000 0x08048000 0x00200 0x00200 R   0x1000
  LOAD           0x001000 0x08049000 0x08049000 0x72458 0x72458 R E 0x1000
  LOAD           0x074000 0x080bc000 0x080bc000 0x3050c 0x3050c R   0x1000
  LOAD           0x0a4b14 0x080edb14 0x080edb14 0x03348 0x061b4 RW  0x1000
```

根据对应位置，`"Hello World."` 在源文件所对应的段的起始位置是 `0x074000`，然后我们计算文件中的偏移：

```py
hw_offset = 0x074000 + 0x80bc018 - 0x080bc000
hw_offset = 0x74018
```

我们就找到这个常量字符串的位置了，使用 `xxd` 确认一下：

```bash
$ xxd -s 0x74018 -l 16 bar
00074018: 4865 6c6c 6f20 576f 726c 642e 0063 203d  Hello World..c =
```

:::note
如果我们提供的虚拟机镜像没有安装 `xxd`，`hexedit` 和 `bvi`，你需要用下面的命令安装.

```bash
sudo apt install xxd hexedit bvi
```
:::

### 2.3 选做

1. 尝试将 `hello.c` 重命名为 `hello.c.bak`，然后使用 pwndbg 调试 `hello`，现在还能看到 C 源代码吗？猜测原因，尝试使用 `hello.i` 等文件和 `gcc` 的选项确认自己的猜测.
2. 为什么在 [2.3](#2-3-逆向与调试) 的示意图中，`.LC0` 这个常量储存的是 `"Hello World, Jeb."`，我们运行程序后仍然能看到换行被正确输出了？尝试找出原因.
3. 探索 `libfoo.so`，看看它与 `.o` 和 Executable 之间的联系与区别？

## 3. 实验要求

### 3.1 实验报告

**文件命名** `Lab0-姓名-学号.pdf`.

**实验报告内容** 包括实验过程与截图、实验结果与分析、遇到的问题（如果有）.

**调查** 你在本次实验中遇到的无法解决的问题（如果有），可以是你无法理解的内容，认为讲义存在描述模糊的地方，无法理解的设计等.

### 3.2 学术诚信

请勿过分依赖 AI，实验讲义实际上已经基本覆盖了实验所需要的知识，文末还提供了一些更详细的参考资料，所以实验的难度并不大. 你可以使用 AI 理解计算机系统的各种底层原理，了解各类实验工具的使用，这些工具的底层细节是什么，有什么拓展用途等.

你可以让 AI 辅助你解决遇到的问题，比如“为什么课本上 IA-32 在函数序言部分都会 push ebp，而我自己编译出来的 32 位程序却没有这样做呢？”，**但你不应该让 AI 直接完成实验，提供实验的详细思路、细节，或直接解决你遇到的问题**，比如“为什么这个 payload 无法 return 到预期位置？请你给我一个正确的 payload”，而应该是“我现在正在做...，我理解的 return 到预期位置的思路是...，我的思路有什么问题？”. 我们鼓励你将你与 AI 探讨的过程反映到实验报告中.

实验内容很有可能在期末考试中涉及，且这些知识都是未来专业课极其重要的基础，希望同学们认真完成.

---

最后，如果实验讲义有任何错误，或你认为实验讲义还有待完善，有知识点没有涉及，欢迎联系助教. 有任何问题都可以在课程群中提出.

#### references
- VirtualBox User Manual - https://www.virtualbox.org/manual/
- Linux 101 (USTC-LUG) - https://101.lug.ustc.edu.cn/
- NJU PA (2026 Fall) - https://nju-projectn.github.io/ics-pa-gitbook/ics2026/
- Position-independent code (Wikipedia) - https://en.wikipedia.org/wiki/Position-independent_code
- C Preprocessor (Wikipedia) - https://en.wikipedia.org/wiki/C_preprocessor
- Computing 101 (Pwn College) - https://pwn.college/computing-101/
- ELF Sections Cheat Sheet - https://gabi.xinuos.com/elf/03-sheader.html#special-sections
- 链接和加载 (NJU-OS 2026 春) - https://jyywiki.cn/OS/2026/lect11.md
- 参考教材 [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- 参考教材 CSAPP
