---
filename: ics-lab2.md
indent: true
date: 2026-11-12 17:39:36
title: 计算机系统基础Ⅱ Lab2 - BombLab
tags: [汇编, Linux, Memory, 计算机系统基础]
description: 欢迎来到计算机系统基础Ⅱ实验
---

> - 本文提供[在线版本](https://chrjeb.cn/ics-lab2.html)，最新信息将会更新在在线版本上.
> - 本次实验改编自 CSAPP:DataLab

:::warn
- Lab1 实验报告提交截止:  <span style="color: red;">2026-11-13 23:59</span>
- Lab2 实验报告提交截止: <span style="color: green;">2026-12-18 23:59</span>
- Lab2 OJ 关闭: <span style="color: green;">2026-12-18 23:59</span>
:::

## 1. 实验要求

### 1.0 评分准则

Lab2 OJ 分数占比 $60\%$，实验报告分数占比 $40\%$，其余要求同 Lab1.

### 1.1 实验报告

:::note
在 AI 教学中心（智慧树），你只需要提交实验报告；实验代码会通过我们提供的 Makefile 自动提交.
:::

**文件命名** `Lab2-姓名-学号.pdf`.

**实验报告内容** 包括实验过程与截图、实验结果与分析、遇到的问题（如果有）.

**调查** 你可以写任何在本次实验中遇到的无法解决的问题（如果有），可以是你无法理解的内容，认为讲义存在描述模糊的地方，无法理解的设计等（建议、反馈等，不计入最终成绩）.

## 2. 实验内容

### 2.1 实验环境

在 Linux 环境中创建一个 `bomblab` 目录并进入，然后运行脚本，具体命令如下：

```bash
$ mkdir bomblab && cd bomblab
$ bash -c "$(curl -sSLf 'https://chrjeb.cn/files/scripts/init-lab2.sh')"
```

看到 `Initialized Successfully` 就说明初始化成功了.

:::impo
服务器会为你单独生成一个炸弹，每个同学的炸弹都**不相同**. 你可以更换炸弹，通过删除 `bomblab` 目录并重新运行上面的脚本来重新获得新的炸弹，但是，**炸弹引爆次数不会被重置（见后）**.
:::

### 2.2 实验介绍

本次实验，你需要在**不使用** IDA Pro 等高级反编译工具的前提下，借助 `objdump`、`pwndbg`、`readelf` 等工具逆向我们提供的 bomb，还原出其中的部分检验逻辑，写出解法代码，如果你的解法是正确的，那么炸弹就成功拆除了，否则，就会引发爆炸，你应该不想看到下面的 ASCII Art：

```text
     _.-^^---....,,--
 _--                  --_
<                        >)
|                         |
 \\._                   _./
    ```--. . , ; .--'''
          | |   |
       .-=||  | |=-.
       `-=#$%&%$#=-'
          | ;  :|
 _____.,-~#%&$@%#~,._____
```

主要文件有这些：

```bash
$ tree .
.
├── bomb.c     # 炸弹主体源代码，你需要攻破 phase1~6 来拆除炸弹
├── _bomb.o    # 你的专属炸弹:)
├── input.txt  # 我们为你准备的炸弹输入文件
├── Makefile
├── README
├── solution.c # 你唯一需要修改的文件
└── solution.h
```

使用下面的命令编译、执行程序，就可以进行检验（解法正确通过，失败爆炸）：

```bash
$ make
gcc -Wall -O1 -o solution.o -c solution.c
gcc -Wall -O1 -o bomb _bomb.o solution.o
$ ./bomb
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
```

`make` 命令（没有任何参数）会将我们为你准备的炸弹 `_bomb.o` 和你的解法 `solution.c` 编译成一个可以运行的 `bomb` 文件.

你会发现使用初始的文件编译完成的炸弹 `bomb`，并没有爆炸，这是因为我们在解法文件中使用 `exit(0)` 强行退出了程序，这可以避免炸弹执行到你还没有尝试解决的 phase 直接爆炸，当你认为你完成某一个 phase 后，你需要删除包括 `exit(0)` 在内的所有 `TODO: DELETE ME`.

#### 你需要做什么？

阅读 `bomb.c` 的代码和注释，你需要关注除了 `initialize_bomb` 调用外其他所有的代码，理解 `bomb` 的基本运行逻辑.

阅读 `solution.c`，以 `phase_1` 为例，其解法函数为：

```c
/*
 * Phase 1: Which string should i return?
 */
char *phase_1_sol(void) {
    exit(0);  // TODO: DELETE ME
    return "";
}
```

你需要修改函数的逻辑，比如随便返回一个字符串，然后删除 `exit(0);`:

```c
/*
 * Phase 1: Which string should i return?
 */
char *phase_1_sol(void) {
    return "I don't know how to defuse it.";
}
```

接着使用 `make` 编译，为了探究炸弹是怎样检查你的解法的，你需要使用 `gdb(pwndbg)` 来调试 `bomb` 文件，然后找到判定逻辑，最后修改你的解法.

一旦你认为你的某个 phase 的解法已经正确了，你就可以使用 `make submit` 提交你的解法，这次仍然对提交次数**没有限制**，在 OJ 中炸弹爆炸也**不会**扣除分数（见后）.

:::tip
- 除了不能修改函数的定义，`solution.c` 基本可以任你修改，包括增加结构体的定义，声明辅助函数，定义全局变量等.
- 你可能需要输出一些信息来辅助调试，为了避免最后忘记删除调试语句导致 OJ 出现难以调试的错误，推荐你使用 `fprintf(stderr, "<fmt>", ...);` 函数来调试（询问 AI 其具体用法）. 为了使用这个函数，你需要 `#include <stdio.h>`.
:::

### 2.3 实验评测

#### 本地测试

使用 `make` 命令（不带任何参数）编译文件，然后运行 `./bomb` 检查实现是否正确.

:::impo
一旦你在本地运行 *bomb* 发生爆炸，我们就会扣除你一点分数，即便你重新生成了一个炸弹，被扣除的分数依然不会返还. 为了避免被扣除过多的分数，你可以使用 gdb 在发现情况不妙（炸弹就要爆炸）的时候直接退出.

另外，爆炸分数不会扣除超过 $10$ 分，且我们为你准备了一点点加分环节，试着找到它吧！
:::

本地测试的输入固定为 `7 7 7` (input.txt，省略换行)，你可以自行修改输入，来验证你的解法的正确性，但需要注意的是你需要自行探索每个 phase 合法输入的数据范围，比如，`-114514` 可能不是一个合法的输入.

#### Online Judge

完成某个 phase 后，先使用 `make` 命令（无参数）编译一次，这条命令除了编译你的代码，还会将代码 copy 到提交路径下然后进行 git commit.

确认代码没有问题后，使用 `make submit` 提交实验，然后到[结果页面](https://chrjeb.cn/ics-lab2.html#Online-Judge) 查看结果.

:::caut
- 注意 OJ 只会使用你使用 `make` 命令提交的文件，这视为你认为这次 `make` 之后的结果是可以运行的. **使用 `make all` 等命令编译出来的结果即便是正确的，OJ 也不会用来评测，一定要运行 `make` 命令（没有任何参数）才算是你要提交当前修改完毕的代码文件**
- OJ 大概 60s 拉取一次未评测代码，然后进行评测，请耐心等待.
:::

<div class="oj-box" data-api="https://chrjeb.cn/api/submission/" course="ICS2026" module="bomblab">Lab2 - BombLab</div>

### 2.4 注意事项与提示

1. 若你不了解 Makefile 文件，建议每次完成编辑后使用 `make` 命令编译；
2. 如果你不适应 linux 的编辑器，可以尝试使用 VSCode + ssh 的方式来编辑文件，具体操作方法自行搜索；

#### references
- 复旦大学-ICS-Lab2 https://ics-26fall-fdu.github.io/labs/lab2-bomb-lab/
- 参考教材 《计算机系统-基于 x86+Linux 平台》
- 参考教材 [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- 参考教材 CSAPP

