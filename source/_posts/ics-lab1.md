---
filename: ics-lab1.md
date: 2026-10-30 10:05:52
title: 计算机系统基础Ⅱ Lab1 - DataLab
tags: [汇编, Linux, Memory, 计算机系统基础]
description: 欢迎来到计算机系统基础Ⅱ实验
indent: true
---

> - 本文提供[在线版本](https://chrjeb.cn/ics-lab1.html)，最新信息将会更新在在线版本上.
> - 本次实验改编自 CSAPP:DataLab

:::warn
- Lab0 实验报告提交截止: <span style="color: red;">2026-10-30 23:59</span>
- Lab1 实验报告提交截止:  <span style="color: green;">2026-11-13 23:59</span>
- Lab1 OJ 关闭:  <span style="color: green;">2026-11-13 23:59</span>
:::

## 1. 实验要求

:::note
实验要求已更新
:::

### 1.0 评分准则

是的，实验相较大家以往接触的实验都比较难，但是我们不希望你借助 AI 一次性完成实验，这样你根本无法得到必要的训练，**也会得到较低的分数**，相反，诚实地完成实验报告反而会获得一个比较好的分数，具体的评分原则如下：

1. 你诚实地完成了实验，撰写了实验报告，若借助 AI，需要完全理解 AI 撰写的内容，即**你可以对你所写的内容负责**，我们会对同学进行抽查，如果发现实验报告一笔带过，抽查的时候却啥都不懂，本次实验计为 **0** 分；
2. 对于借助 AI 的部分，你可以在实验报告中展示你最初的问题，通过 AI 你学会了什么，**学到什么才是学习的目的**；
3. 我们在这次实验中新增了一些反 AI 作弊的机制，你至少需要保证实验的每一条代码都是你自行完成的.
4. 本次 DataLab 的实验有评测分，具体比例（违反学术诚信整个实验 0 分）实验报告 $30%$，实验 $70%$.

只要遵守以上 3 点，实际上就可以拿到一个较好的分数了，即使你是在 AI 的指导下一步一步完成实验，只要是自己动手，（尽量）理解了自己所做的操作，都算是自己的能力.

### 1.1 实验报告

:::note
在 AI 教学中心（智慧树），你只需要提交实验报告；实验代码会通过我们提供的 Makefile 自动提交.
:::

**文件命名** `Lab1-姓名-学号.pdf`.

**实验报告内容** 包括实验过程与截图、实验结果与分析、遇到的问题（如果有）.

**调查** 你可以写任何在本次实验中遇到的无法解决的问题（如果有），可以是你无法理解的内容，认为讲义存在描述模糊的地方，无法理解的设计等（建议、反馈等，不计入最终成绩）.

### 1.2 学术诚信

请勿过分依赖 AI，实验讲义实际上已经基本覆盖了实验所需要的知识，文末还提供了一些更详细的参考资料，所以实验的难度并不大. 你可以使用 AI 理解计算机系统的各种底层原理，了解各类实验工具的使用，这些工具的底层细节是什么，有什么拓展用途等.

你可以让 AI 辅助你解决遇到的问题，比如“为什么课本上 IA-32 在函数序言部分都会 push ebp，而我以前自己编译出来的 32 位程序却没有这样做呢？”，**但你不应该让 AI 直接完成实验，提供实验的详细思路、细节，或直接解决你遇到的问题**，比如“为什么这个 payload 无法 return 到预期位置？请你给我一个正确的 payload”，而应该是“我现在正在做...，我理解的 return 到预期位置的思路是...，我的思路有什么问题？”. 我们鼓励你将你与 AI 探讨的过程反映到实验报告中. **不允许直接使用 AI 撰写实验报告.**

实验内容很有可能在期末考试中涉及，且这些知识都是未来专业课极其重要的基础，希望同学们认真完成.

最后，如果实验讲义有任何错误，或你认为实验讲义还有待完善，有知识点没有涉及，欢迎联系助教. 有任何问题都可以在课程群中提出.

:::tip
大家对展示加分似乎并不积极，并不需要你的实验掌握得有多么好，只要你在实验中有所得，都可以上来展示.
:::

## 2. 实验内容

### 2.1 实验环境

在 Linux 环境中创建一个 `datalab` 目录并进入，然后运行脚本，具体命令如下：

```bash
$ mkdir datalab && cd datalab
$ curl -sSLf 'https://chrjeb.cn/files/scripts/init-lab1.sh' | bash
```

看到 `Initialized Successfully` 就说明初始化成功了.

### 2.2 实验介绍

主要文件有这些：

```bash
$ tree .
.
├── Makefile  # 请在文件顶部填入你的学号和 TOKEN
├── bits.c    # 你唯一需要编辑的代码文件
├── bits.h    # 函数定义，请勿修改
├── btest.c   # 本地自测框架文件，请勿修改
├── btest.h   # 本地自测框架文件，请勿修改
├── decl.c    # 本地自测框架文件，请勿修改
├── dlc       # 语法检查器，检查是否使用了不允许使用的操作符或函数
├── fshow.c   # 浮点数查看辅助工具源代码，请勿修改
├── ishow.c   # 整数查看辅助工具源代码，请勿修改
├── README    # CSAPP:DataLab 项目介绍原始文件
└── tests.c   # 正确行为默认实现，请勿修改
```

`TOKEN`（用于验证你的身份）会在后续 Onlin Judge 开放后发放.

#### 你需要做什么？

修改 `bits.c` 中的每一道题目的函数体，大部分题目都只需要修改 `return` 表达式即可.

`bits.c` 的顶部是对实验代码的详细描述和约束，每道题目的函数定义顶部也有输入参数示例和对你的实现的要求，请仔细阅读上面的文件. 对于每一道题目上方的注释中，特别需要注意以下信息：

1. 能使用的运算符有哪些？
2. 能使用的运算符数量有哪些？
3. 能使用的常量范围是？
4. 变量类型与输入参数的取值范围是？
5. 能否使用 `if` 等语句？

### 2.3 实验评测

#### 本地测试

**傻瓜式操作** 使用 `make` 命令编译文件，然后运行 `btest` 检查实现是否正确，再运行 `./dlc bits.c` 检查是否违背了前面提到的运算符限制等规则.

**详细介绍**

`make` 命令会编译 `btest.c bits.c decl.c tests.c` 这些文件形成 `btest`，当你运行 `./btest` 的时候，默认就会使用你写的 `bits.c` 实现来进行测试，为了更好的测试自己的实现，你可以手动指定函数的参数来测试特定测试用例下的表现，比如：

```bash
$ ./btest -f bitXor -1 2 -2 1
Score	Rating	Errors	Function
ERROR: Test bitXor(2[0x2],1[0x1]) failed...
...Gives 2[0x2]. Should be 3[0x3]
Total points: 0/1
```

可以测试 `bitXor(2, 1)` 的表现是否符合预期，预期是 `3[0x3]`，然而我们的默认实现返回了 `2[0x2]`.

为了查看某个整数的十六进制，或者查看某个整数的十进制，或者查看一个有符号数的无符号形式，都可以使用 `ishow` 工具，比如

```bash
$ ./ishow 124
Hex = 0x0000007c,	Signed = 124,	Unsigned = 124
$ ./ishow -124
Hex = 0xffffff84,	Signed = -124,	Unsigned = 4294967172
$ ./ishow 0xFFFFFFFF
Hex = 0xffffffff,	Signed = -1,	Unsigned = 4294967295
```

浮点数也有工具可以使用，下面是一些使用示例（特别注意如果是整数要使用 `123.0` 的形式）

```bash
$ ./fshow 1.2
Floating point value 1.200000048
Bit Representation 0x3f99999a, sign = 0, exponent = 0x7f, fraction = 0x19999a
Normalized.  +1.2000000477 X 2^(0)

$ ./fshow 0.3
Floating point value 0.3000000119
Bit Representation 0x3e99999a, sign = 0, exponent = 0x7d, fraction = 0x19999a
Normalized.  +1.2000000477 X 2^(-2)

$ ./fshow 0xFFFFFFFF
Floating point value -nan
Bit Representation 0xffffffff, sign = 1, exponent = 0xff, fraction = 0x7fffff
Not-A-Number

$ ./fshow 123.0
Floating point value 123
Bit Representation 0x42f60000, sign = 0, exponent = 0x85, fraction = 0x760000
Normalized.  +1.9218750000 X 2^(6)
```

:::note
为了更好的使用这些工具，你可以分别使用 `./btest -h`、`./dlc -h`、`./ishow`、`./fshow` 来查看每个工具的使用帮助.
:::

#### Online Judge

完成实验后，使用 `make` 编译，确认代码没有问题后，使用 `make submit` 提交实验，OJ 开放后会返回一个查看评测结果的地址.

### 2.4 注意事项与提示

1. 若你不了解 Makefile 文件，建议每次完成编辑后使用 `make` 命令编辑；
2. 如果你不适应 linux 的编辑器，可以尝试使用 VSCode + ssh 的方式来编辑文件，具体操作方法自行搜索；
3. 部分测试可能会提示超时，这有可能是测试代码使用的默认实现为暴力算法，拖累了你的实现，这时你可以使用 `./btest -T <lim>` 来修改超时的时间限制，默认是 20s；
4. 变量定义需要放在一个函数体的顶部，否则可能导致 `dlc` 检查器报错.

#### references
- 复旦大学-ICS-Lab1 https://ics-26fall-fdu.github.io/labs/lab1-data-lab/
- 参考教材 《计算机系统-基于 x86+Linux 平台》
- 参考教材 [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- 参考教材 CSAPP
