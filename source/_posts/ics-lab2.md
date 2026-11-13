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

### 2.3 实验指南

为了演示拆除炸弹的基本方法，我们使用一个简单的程序来模拟 bomb 程序，其源代码为：

```c
/* hello.c */
#include <stdio.h>
#include <stdlib.h>

void explode() {
    fprintf(stderr, "Bomb!!!\n");
    exit(8);
}

void test(int x, int y, int numbers[]) {
    for (int i = 0; i < 4; ++i) {
    }
}

int main() {
    int numbers[4] = { 0, 0, 0, 0 };
    test(3, 2, numbers);
    for (int i = 0; i < 4; ++i) {
        printf("numbers[%d]: %d\n", i, numbers[i]);
    }
}
```

:::tip
系列讲义讲解的所有 demo 都存在[在线目录](https://chrjeb.cn/files/ics-demos/)中，对于本次实验的 demo，你可以使用下面的命令下载：

```bash
wget -r -np -nH --cut-dirs=2 -e robots=off --reject="index.html*" \
"https://chrjeb.cn/files/ics-demos/Lab2/"
```
:::

然后，使用 `make clean all` 编译，这里我们使用了编译选项 `-O1`，避免 GCC 过优化导致我们读不懂函数逻辑，~~今天课上就是因为默认的 *-O2* 优化导致调试时翻车了~~.

接下来尝试使用 gdb(pwndbg) 调试程序，启动 gdb (以 pwndbg 为例演示)：

```bash
$ pwndbg ./hello
```

使用 `b(reakpoint)` 命令在 `test()` 函数处打断点（假设我们已经知道校验逻辑在 test 函数中），然后使用 `r(un)/c(ontinue)` 命令开始/继续执行，直到停在 `test` 的第一条指令：

```bash
pwndbg> b test
Breakpoint 2 at 0x555555555194
pwndbg> c
Continuing.

Breakpoint 2, 0x0000555555555194 in test ()
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
...
```

使用 `disas test` 观察反汇编代码:

```bash
Dump of assembler code for function test:
=> 0x0000555555555194 <+0>:	imul   edi,esi
   0x0000555555555197 <+3>:	mov    eax,0x0
   0x000055555555519c <+8>:	lea    ecx,[rdi+rax*1]
   0x000055555555519f <+11>:	cmp    DWORD PTR [rdx+rax*4],ecx
   0x00005555555551a2 <+14>:	jne    0x5555555551af <test+27>
   0x00005555555551a4 <+16>:	add    rax,0x1
   0x00005555555551a8 <+20>:	cmp    rax,0x4
   0x00005555555551ac <+24>:	jne    0x55555555519c <test+8>
   0x00005555555551ae <+26>:	ret
   0x00005555555551af <+27>:	sub    rsp,0x8
   0x00005555555551b3 <+31>:	call   0x555555555169 <explode>
```

这里需要使用到[调用约定](https://en.wikipedia.org/wiki/Calling_convention)的知识，我们调试的程序是 x64 程序，因此可以使用 Lab0 提到的[手册](https://wiki.osdev.org/System_V_ABI)，来确认函数参数的传入方式，[这里](https://wiki.osdev.org/Calling_Conventions)还有一个比较直观的表格：

![20261113-20c8c701e9820883.png](./images/20261113-20c8c701e9820883.png)

由此可以确定 `test(3, 2, numbers)` 分别通过 `rdi`、`rsi`、`rdx` 三个参数传入，由此，我们可以开始分析了.

注意到首先计算了 `edi = edi * esi (imul edi, esi)`，也就是 `edi = 3 * 2 = 6`，接下来，`eax = 0`，然后令 `ecx = rdi + rax * 1`，再比较 `mem(rdx + rax * 4) == ecx`，这里 `rdx` 指向 `numbers`，`rax = 0`，因此就是比较 `numbers[0] == ecx(value: 6)`，如果不相等，就跳转到 27 行，然后直接爆炸，因此要求 `numbers[0] = 6`，这样我们就推导出 `numbers[0]` 的值了.

:::tip
上面的分析中，只是令 `eax = 0`，为什么就能断定 `rax = 0` 呢？这里涉及到 x64 的一个小特性，所有的算术和逻辑指令写入 32 位**通用寄存器**会将其高 32 位置为 0，而写入 8, 16 位寄存器则没有这个性质.
:::

**下一步怎么做**？这时候有两种思路，记住 `numbers[0]` 的值是 6，然后从 `<+11>` 开始继续推；第二种思路，将 `main` 函数中的 `numbers[0]` 修改为 6，然后重新再跑一次，这里我们选择第二种.

将 `main` 函数修改为如下所示：

```c
int main() {
    int numbers[4] = { 6, 0, 0, 0 };
    test(3, 2, numbers);
    for (int i = 0; i < 4; ++i) {
        printf("numbers[%d]: %d\n", i, numbers[i]);
    }
}
```

在另一个终端中重新 `make`，gdb(pwndbg) 会自动发现文件被修改了，因此使用 `r(un)` 就可以重新运行而不需要退出 gdb(pwndbg)，我们的断点也不需要重新打了，可以看到程序停在了 `test` 函数的位置，并且 `numbers[0]` 的值也发生了变化，pwndbg 很好的展示了这一变化（甚至贴心的告诉你跳转不会发生了）：

![20261113-6715b32311f304e9.png](./images/20261113-6715b32311f304e9.png)

接下来就该从 `<+11>` 继续看了，由于 `cmp` 运算后 `ZF=0`，不满足 `jne` 跳转条件，因此不会跳转，再看 `<+16>`，`rax += 1`，然后判断 `rax == 4`，如果不等于就跳转到 `<+8>`，显然 `1 != 4`，看到 `<+8>` 的 `ecx = rdi + rax = 7`，然后判断 `mem(rdx + rax * 4) == ecx(value: 7)`，也就是问 `numbers[1] == 7`，如果不等于就会爆炸，因此我们就推导出 `numbers[1] = 7`，依次类推，`numbers[2] = 8`，`numbers[3] = 9`，我们就成功逆向出了 `test` 函数的检查逻辑.

到这里，相信你已经大致掌握了一些基础的 gdb 指令，再自己学一学 `x` 等命令的使用，就大概能完成本次实验了.

<!--
#### 栈

这里再简单讲讲 *graph.txt*，画这个图的意义主要是方便大家梳理栈内存，下面以一个简单的程序来讲讲如何逆向栈的布局：

```c
// stack.c
int *calc(int x) {
    static int arr[4] = { 0 };
    arr[x] = arr[x - 1] = 1;
    arr[x + 1] = arr[x] + arr[x - 1] * 2;
    arr[0] = -1;
    return arr;
}

int main() {
    // 说什么传递参数，其实这里只能传递一个 2 :(
    int *arr = calc(2);
    for (int i = 0; i < 4; ++i) {
        printf("%d ", arr[i]);
    }
    return 0;
}
```
-->

同样使用 make 编译，然后我们开始调试，将断点打在 `calc`（具体操作不再展开）,

#### GDB 的底层原理（offtopic）

这里展开讲讲 GDB 的底层原理，并不要求大家掌握，在 x64 中，有这样一条特殊的指令——`INT3`，这是 GDB 断点能力的重要技术基础：

> The INT3 instruction uses a one-byte opcode (CC) and is intended for calling the debug exception handler with a breakpoint exception (#BP). (This one-byte form is useful because it can replace the first byte of any instruction at which a breakpoint is desired, including other one-byte instructions, without overwriting other instructions.)

INT3 的机器码就是一个简单的 `0xCC`（很方便记忆），当 GDB 想给某个进程（还记得我们讨论过进程的概念）下断点时，比如 `b *0x55555555519f`（注意地址前面的 `*`），其在底层做的事情其实很简单（也有点 dirty）——将 `0x55555555519f` 处的这个字节替换为 `0xCC`，也就是 `INT3` 指令.

需要注意 `0x55555555519f` 应该是一条指令的开头，这样 CPU 不会先执行一个不完整的指令，再执行 `INT3`.

替换完成之后（需要保存原来的字节），当我们在 GDB 中按下 `c/r` 命令时， CPU 会直接开始运行，当执行到 `INT3` 指令时，进程就会停下来（准确说是陷入内核态），然后通知 GDB，GDB 就知道进程停下来了，这时，如果我们再次使用 `c` 命令：

- GDB 需要将原来的指令字节还原回去
- 再将 `IP`（指令计数器）倒退一个字节
- 然后执行一条指令（怎么让 CPU 执行且只执行一条指令，也是个问题🤔）
- 再把原来的指令的第一个字节替换为 `CC`（让这个断点下次依然能够停下）
- 最后让 CPU 继续执行下去.

一个简单的 `continue` 指令背后原来这么复杂. 但是又觉得计算机的世界好像没有什么魔法！不过是将一个字节做几次替换，CPU 其实也不知道什么是断点，CPU 只知道碰到这个指令需要停下来.

### 2.4 实验评测

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
- 代码上传到 OJ 后，即使 OJ 在运行过程中 bomb explode，也不会扣除你的分数，请放心使用 OJ，本次依然依然没有提交次数限制. 😋
:::

<div class="oj-box" data-api="https://chrjeb.cn/api/submission/" course="ICS2026" module="bomblab">Lab2 - BombLab</div>

### 2.5 注意事项与提示

1. 若你不了解 Makefile 文件，建议每次完成编辑后使用 `make` 命令编译；
2. 如果你不适应 linux 的编辑器，可以尝试使用 VSCode + ssh 的方式来编辑文件，具体操作方法自行搜索；

#### references
- 复旦大学-ICS-Lab2 https://ics-26fall-fdu.github.io/labs/lab2-bomb-lab/
- 参考教材 《计算机系统-基于 x86+Linux 平台》
- 参考教材 [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- 参考教材 CSAPP

