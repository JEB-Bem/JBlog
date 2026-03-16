---
title: 汇编语言笔记
date: 2025/07/09 20:18:32
tags: 汇编
categories: 笔记
filename: Assembly.md
description: 汇编语言入门笔记，整理指令、数据表示、不同架构方言与基础概念。
keywords: 汇编, Assembly, x86, 指令系统, 计算机基础
---

## Concept Of Assembly

Assembly(汇编语言) is the simplest programming language. It tells CPU what to do.

Assembly is a direct translation of binary code ingested(获取) by the CPU... so it's very CPU architecture dependent.

- Nouns(名词/主体) / Operands
- Verbs(动作) / Operations
add, sub(stract)[减], mul(tiply), div(ide), move, comp(are), test...

### Assembly Dialects

![image-20250519225457518](images/image-20250519225457518.png)

Every architecture has its own variant(变体):

- **x86** assembly
- **arm** assembly
- **ppc** assembly
- **mips** assembly
- **risc-v** assembly
- **pdp-11** assembly

An assembly instruction looks like one of:

```asm
OPERATION
OPERATION OPERAND(操作数)
OPERATION OPERAND OPERAND
OPERATION OPERAND OPERAND OPERAND
...
```

还有一些 Sub Dialects...? 看不懂，后面再看吧

![image-20250519225925101](images/image-20250519225925101.png)

## Data In Assembly

二进制用**大量**数据淹没了感官

剩下的就是讲二进制，略

下面是一张 ASCII 码的十六进制对照表，行数字表示第一个数码，列数字表示第二个数码

eg. `0x3e` -> `>`

![image-20250519231450720](images/image-20250519231450720.png)

补充一下，Python想要打出 ASCII 码对应的字符，应该这样做：

```python
 下面是使用转义字符的方法
print('\x3e')
print('\u003e') # 四位unicode
print('\U0000003e') # 八位unicode

 其他稀奇古怪的格式
hex_value = "41"
char = chr(int(hex_value, 16))
print(char)  # 输出：A

hex_value = "4F60"
char = chr(int(hex_value, 16))
print(char)  # 输出：你

 示例：将多个十六进制字符转换为字符串
hex_string = "48656c6c6f20576f726c64"  # "Hello World" 的十六进制
result = bytes.fromhex(hex_string).decode("ascii")
print(result)  # 输出：Hello World

hex_values = ["4F60", "597D"]  # "你好"
chars = ''.join(chr(int(h, 16)) for h in hex_values)
print(chars)  # 输出：你好
```

### Grouping Bits into Bytes (数据分组)

> ~~以上标题意译~~

A standard-sized grouping of bits is called a *byte*.

> 从历史上看，这一定程度上与 text encoding(文本编码)有关。(e.g. # of bits to encode a letter(字母))

#### Historical byte widths

Nothing inherently(内在，固有) good in any # of bits over any other # of bits (within reason).

I've encounted architectures with 6-bit, 7-bit, 8-bit, 9-bit, 12-bit, 16-bit, 18-bit, 31-bit, and 36-bit bytes!

The newest "real-world" architecture of these was from the late 1960s...

>在合理范围内，不同位数的字节之间并不存在任何内在或固有的优劣之分。
>
> 我曾接触过一些计算机架构，其中的 字节（byte） 大小分别为 6 位、7 位、8 位、9 位、12 位、16 位、18 位、31 位和 36 位。
>
> 这些架构中最新的“真实世界”架构还是上世纪 1960 年代末期的产品……

#### 8-bit byte

IBM invented 8-bit EBCDIC in 1963 for use on their terminals. ASCII(also released in 1963) replaced it, but the 8-bit byte stuck. Every modern architecture uses 8-bit bytes.

> IBM 于 1963 年发明了用于其终端设备的 8 位 EBCDIC（扩展二进制编码的十进制交换码）。同年，**ASCII（美国信息交换标准代码）**也被发布，并逐渐取代了 EBCDIC，但 8 位字节（byte） 的概念却保留了下来。如今，几乎所有的现代计算机架构都使用 8 位字节。

Bytes are 8-bit, but modern architecture are(mostly) 64-bit...

所以有了下面的进一步划分：

#### Word

Words are groupings of 8-bit bytes. Architectures define the *word width*. For historical reasons, the terminology is *really messed up*.

> 字（Word） 是由 8 位字节（byte） 组成的集合（所以字长应当是 64 bits）。
不同的计算机架构会定义其字长（word width）。
由于历史原因，相关术语已经变得 相当混乱。

- **Nibble**: half of a byte, 4 bits
- **Byte**: 1 byte, 8 bits
- **Half word / "word"**: 2 bytes, 16 bits
- **Double word(dword)**: 4 bytes, 32 bits
- **Quad word(qword)**: 8 bytes, 64 bits

> 注：Quad 就是“4倍的”的意思

### Expressing Numbers

A 64-bit machine can reason(处理) about 64-bits at a time.

> ⚠️  In practice, even more. Modern x86 can use specialized hardware (一般是硬件加速元件) to crunch(快速处理) data 512 bits(64 bytes) at a time!

What happens if we add `1` to `0xffffffffffffffff`?

> Integer overflow: `1 + 0xffffffffffffffff = 0x10000000000000000` (0-width: 16)
>
> The 65th bit(1) doesn't fit!
>
> The extra bit gets put in common *carry bit(CF)* storage by the CPU, and the result of the computation becomes **0**!
>
> The inverse(反面的事物) happens if we substract(减) 1 from 0.
>
> The *CF* will be set to 1, too! This called *underflow*.

### Anatomy of a Word(字的结构)

Consider `oxc001c475`

![image-20250520003507957](images/image-20250520003507957.png)



## Register

> CPUs need to be fast.
>
> To be fast, CPUs need rapid access to data they're working on. This is done via the *Register File*.

![image-20250520004529411](images/image-20250520004529411.png)

Registers are very fast, temporary stores for data.

You get several "general purpose" registers:

- 8085: a, c, d, b, e, h, l
- 8086: ax, cx, dx, bx, **sp**, **bp**, si, di
- x86: eax, ecx,, edx, ebx, **esp**, **ebp**, esi, edi
- **amd64(x86_64)**: rax, rcx, rdx, rbx, **rsp**, **rbp**, rsi, rdi, r8, r9, r10, r12, r13, r14, r15
- arm: r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15

The address of the next instruction is in a register:

eip(x86), rip(amd64), r15(arm)

Various extensions add other registers(x87, MMX, SSE, etc)

> 在 计算机体系结构 中，扩展（Extension） 是指 对现有指令集架构（ISA）的功能增强或扩展，通常通过增加新的 指令集、寄存器或硬件模块 来提高计算能力、优化性能或支持新的应用场景。例如：增加 浮点运算寄存器（x87 FPU），以支持浮点数计算。

### Register Size

Registers are(typically) the same size as the word width of the architecture. On a 64-bit architecture(most) regiters will hold 64 bits (8 bytes).

### Partial Register Access

![image-20250520103007910](images/image-20250520103007910.png)

![image-20250520103320412](images/image-20250520103320412.png)

### Setting Registers

We load data into registers with assembly. `mov` means "move".

```asm
mov rax, 0x539
mov rbx, 1337
```

Data specified directly in the instruction like this is called an **Immediate Value**.

We can also load data into partial registers:

```asm
mov ah, 0x5
mov al, 0x39
```

#### 32-bit CAVEAT (警告)!

If you write to a 32-bit partial (e.g., `eax`), the CPU will *zero out* the rest of the register (对寄存器置0)!

This was done for (believe it or not) performance reasons (性能原因):

This set `rax` to `0xffffffffffff0539`;

```asm
mov rax, 0xffffffffffffffff
mov ax, 0x539
```

This set `rax` to `0x0000000000000539`

```asm
mov rax, 0xffffffffffffffff
mov eax, 0x539
```

### Shunting (传输) Data Around

You can also `mov` data between registers!

**LINGUISTIC (语言的) CAVEAT**

`mov` doesn't move the data, it copies it.

This sets both `rax` and `rbx` to 0x539(1337).

```asm
mov rax, 0x539
mov rbx, rax
```

You can, of course, `mov` partials (32-bit clobber(覆盖) caveat applies)!

This sets `rax` to 0x539 and `rbx` to `0x39`.

```asm
mov rax, 0x539
mov rbx, 0
mov bl, al
```

### Extending Data

Consider:

```asm
mov eax, -1
```

`eax` is now `0xffffffff` (both `4294967295` and `-1`) but `rax` is now `0x00000000ffffffff` (only `4294967295`)

If you wanted the operate on that `-1` in 64-bit land

```asm
mov eax, -1
movsx rax, eax
```

`movsx` does a sign-extending move, preserving (保留) the Two's Complement (二进制补码) value(i.e., copies the top bit to the rest of the register)

`eax` is now `0xffffffff` and `rax` is now `0xfffffffffffffffff`.

### Register Arithmetic(算术运算)

Once we have data in registers, we can compute!

For most arthmetic instruction, the first specified register stores the result.

![image-20250520113717932](images/image-20250520113717932.png)

[rappel tool](https://github.com/yrp604/rappel)

### Some Registers are Special

You cannot directly read from or write to `rip`.

Contains the memory address of the next instruction to be executed(ip = Instruction Pointer)

You should be careful with `rsp`.

Contains the address of an region of memory to store temporary data(sp = Stack Pointer)

Some other registers are, by convention (约定), used for important things.

## 编写第一个汇编程序

```asm
.intel_syntax noprefix
mov rdi, 42
mov rax, 60
syscall
```

上面这个代码实现了一个最简单的 assembly 程序，首先 `.intel_syntax noprefix` 声明我们使用 intel 的 x86_64 语法，而不是 AT&T 语法。

我们实现了将 exit 的调用号 60 传入 rax, 将退出状态码（供 exit 使用的参数）放入 rdi 中，然后调用 syscall。

> 按照 jyy 的上帝比喻，我们准备好要干的事情，按照我们的契约（约定）写在纸上，然后祈祷上帝来帮我们完成这件事情。

接下来是如何编译链接出我们的 ELF。

> ELF 是 Linux 下的二进制可执行文件格式，类似 Windows 的 .exe

接下来，`as -o asm.o asm.s`

这里， as 工具读取 asm.s ，将其汇编成二进制代码，并输出一个名为 asm.o 的目标文件。这个目标文件包含实际的已汇编二进制代码，但它尚未准备好运行。首先，我们需要链接它。

In a typical development workflow, source code is compiled and assembly is assembled to object files (`.o`), and there are typically many of these (generally, each source code file in a program compiles into its own object file). These are then linked together into a single executable. Even if there is only one file, we still need to link it, to prepare the final executable. This is done with the ld (stemming from the term "link editor") command, as so:

```bash
$ ld -o exe asm.o
/nix/store/22qnvg3zddkf7rbpckv676qpsc2najv9-binutils-2.43.1/bin/ld: warning: cannot find entry symbol _start; defaulting to 0000000000401000
```

然后我们可以运行它：

```bash
$ ./exe
$ echo $?
42
```

> `echo $?` 是一个 Linux/Unix Shell 命令，用来输出上一个命令的退出状态码（exit code）。

----

### _start?

The attentive learner might have noticed that ld prints a warning about entry symbol _start. The _start symbol is, essentially, a note to ld about where in your program execution should begin when the ELF is executed. The warning states that, absent a specified _start, execution will start right at the beginning of the code. This is just fine for us!

If you want to silence the error, you can specify the _start symbol, in your code, as so:

```asm
.intel_syntax noprefix
.global _start
_start:
mov rdi, 42
mov rax, 60
syscall
```

There are two extra lines here. The second, _start:, adds a label called start, pointing to the beginning of your code. The first, .global _start, directs as to make the _start label globally visible at the linker level, instead of just locally visible at the object file level. As ld is the linker, this directive is necessary for the _start label to be seen.

## Memory: Process Perspective

> ⚠ 在 x86 这样的小端系统中，内存中的储存是倒过来的（按字节，体现在 hex 中就是两位两位的倒置）！但在寄存器中不会这样

$Memory \leftrightarrow Disk$

$Memory \leftrightarrow Registers$

$Memory \leftrightarrow Network$

$Memory \leftrightarrow Video Card (显卡)$

There is too much memory to name every location (unlike registers).

Process memory is addressed linearly(线性的).

```text
From: 0x10000 (for security reasons)
To: 0x7fffffffffff (for architecture / OS purpose)
```

以上是分配给用户空间的（实际上从 0 到 0x10000 也分配给用户了，只是不能访问，分配给内核空间的则是

```
0xFFFF800000000000 ~ 0xFFFFFFFFFFFFFFFF（约 128 TB）
```

x86-64 中间那段地址是刻意保留的“非法地址区”，因为 CPU 实际只实现了 48 位虚拟地址线。合法地址必须是 64 位中高 16 位是符号位的扩展，这叫 canonical addressing。

Each memory address references **one byte / 8 bits** in memory. This means 127 terabytes(TB) of addressable RAM.

### A Process' Memory

You don't have 127 TB of RAM... But that's okay, cause it's all ~~fake pretend~~ virtual!

Your process' memory starts out partially filled in by the Operating System.

> 意思好像是会填充一些程序代码，库代码，全局变量之类的东西。

| 填充内容            | 说明                                        |
| --------------      | ------------------------------              |
| **.text段**         | 你的代码要加载到这里                        |
| **.data/.bss**      | 全局变量、静态变量存放位置                  |
| **堆区**            | 动态内存起始位置，malloc 时用到             |
| **栈区**            | 用于函数调用、返回地址、局部变量等          |
| **环境变量**        | `envp`：比如 `PATH=/usr/bin` 等             |
| **参数数组**        | `argc` / `argv[]`，你得知道自己的命令行参数 |
| **ELF解释器加载器** | Linux 下用于解析 `.interp` 的 loader        |


![image-20250523162854583](images/image-20250523162854583.png)

Your process can ask for more memory from the Operating System! (稍后详细讲解)

![image-20250523162915788](images/image-20250523162915788.png)

### Memory (stack)

The stack has several uses. For now, we'll talk about *temporary data storage*.

Registers and immediates can be **pushed** onto the stack to save values:

```asm
mov rax, 0xc001ca75
push rax
push 0xb0bacafe # WARNING: even on 64-bit x86, you can only push 32-bit immediates...
push rax
```

> 1) 尽管只能 push 32-bit 的立即数，但是它会被符号扩展到 64 bit，另外 mov 是允许 mov 64 bit 立即数的。
>
> 2) 可以通过 push register 来一次性 push 一个 64 bit 的立即数。
>
> 3) Like `mov`, `push` leaves the value in the src (source) register intact (完整的, 不变的).
> push 不会影响到源寄存器中的储存的值

![image-20250523163903796](images/image-20250523163903796.png)

Values can be **popped** back off of the stack (to any register).

```asm
pop rbx # sets rbx to 0xc001ca75
pop rcx # sets rcx to 0xb0bacafe
```

![image-20250523163911014](images/image-20250523163911014.png)

### Addressing the Stack (栈的寻址)

The CPU knows where the stack is because its address is stored in **rsp**. （不够准确，rsp 指向栈顶才更准确）

> `rsp` 通常是 `0x7f` 后面跟着一坨随机的垃圾值
>
> `rsp` 从高地址向低地址增长，但这跟端序没有关系
>
> `rsp` 指向的是栈顶元素的开头

![image-20250523165834243](images/image-20250523165834243.png)

### Addressing Memory

You can also move data between registers and memory with `mov`!

> 如果一个内存地址是不可访问的，程序会崩溃，发生段错误！

This will load the 64-bit value stored at memory address `0x12345` into `rbx`:

```asm
mov rax, 0x12345
mov rbx, [rax]
```

This will store the 64-bit value in `rbx` into memory at `0x133337`:

```asm
mov rax, 0x133337
mov [rax], rbx
```

This is equivalent to push `rcx`:

```asm
sub rsp, 8
mov [rsp], rcx
```

**Each addressed memory location contains one byte**

An 8-byte write at address `0x133337` will write to addresses `0x133337` through `0x13333f`.

### Controlling Write Sizes

You can use partials to store/load fewer bits!

Load 64 bits from addr `0x12345` and store lower 32 bits to addr `0x133337`.

```asm
mov rax, 0x12345
mov rbx, [rax]
mov rax, 0x133337
mov [rax], ebx # ebx 是 rbx 的低四字节
```

Store 8 bits from `ah` to addr `0x12345`.

```asm
mov rax, 0x12345
mov [ah], rax
```

Don't forget: changing 32-bit partials (e.g., by loading from memory) zero out the whole 64-register. Storing 32-bits to memory has no such problems, through.

### Memory Endianess (内存端序)

Data on most modern systems is stored *backwards*, in *little endian*.

```asm
mov eax, 0xc001ca75
```

![image-20250523175219663](images/image-20250523175219663.png)

Bytes are only shuffled for multi-byte stores and loads of registers to memory!

> 字节只有在多字节存储和加载寄存器到内存时才会被打乱！

Yes, writes to the stack behave just like any other write to memory.

Why little endian?

> Intel created the 8008 for a company called Datapoint in 1972.
>
> Datapoint used little endian for easier implementation of carry in arithmetic!
>
> Intel used little endian in 8008 for compatibility with Datapoint's processes!
>
> Every step in the evolution between 8008 and modern x86 maintained some level of binary compatibility with its predecessor.

### Address Calculation

You can do some limited calculation for memory addresses.

Use `rax` as an offset (偏移量) off some base address (in this case, the stack).

```asm
mov rax, 0
mov rbx, [rsp+rax*8] # read a qword right at the stack pointer
inc rax
mov rcx, [rsp_rax*8] # read the qword to the right of the previous one
```

You can get the calculated address with Load Effective Address (`lea`).

```asm
mov rax, 1
pop rcx
lea rbx, [rsp+rax*8+5] # rbx now holds the computed address for double-checking 意思是可以写更多的代码做进一步检查
mov rbx, [rbx]
```

Address calculation has limits.

```asm
reg + reg * (2 or 4 or 8) + value
```

This is as good as it gets.

### RIP-Relative Addressing

#### ✅ `rip` 是什么？

`rip` 是 x86-64 架构中的寄存器，全称为 **Register Instruction Pointer**，用于指向当前正在执行的指令的地址（即程序计数器）。它的位宽是 **64 位**。

---

#### 🧠 `rip` 指向的是哪条指令？

- `rip` 始终指向**当前正在执行的那条指令的起始地址**。
- 指令执行完后，`rip` 自动更新为下一条指令地址。
- 所以：
- 在执行过程中读取 `rip` → 得到当前指令地址；
- 某些语义（如 `call`/`lea`）表现得像是指向“下一条指令”。

---

#### ✅ 为什么 `rip` 有时看起来像指向“下一条指令”？

##### 示例 1：`call`

```asm
call func
```

- `call` 指令会把**下一条指令的地址**（`rip + sizeof(call)`）压入栈；
- 所以在 `func` 内部执行 `pop rax`，得到的是“返回点”地址，即 **下一条指令**。

##### 示例 2：RIP-relative addressing

```asm
lea rax, [rip + offset]
```

- 表面上是用 `rip`，实际上 offset 是 **基于当前指令结束后的位置**。
- 所以也表现为基于 **下一条指令** 来偏移。

---

#### ✅ `rip` 的最大优势：支持位置无关代码（PIC）

- `rip` 相对寻址可以这样写：

```asm
mov rax, [rip + offset]
lea rax, [rip + offset]
```

- 优势包括：
- ✅ 支持动态库（不固定地址）
- ✅ 编译器生成的代码可随意加载基址
- ✅ 支持 ASLR（地址空间随机化）
- ✅ 无需修改代码也能执行多份副本

---

#### 📘 总结对比

| 概念           | 指向哪儿？                         | 表现                      |
|----------------|------------------------------------|---------------------------|
| `rip`           | 当前正在执行的指令地址              | 实际地址                  |
| `call` 保存地址 | 下一条指令（`rip + 指令长度`）      | 用于返回                  |
| `rip + offset`  | 相对下一条指令的位置                 | 用于地址计算              |

---

#### ✅ 总结一句话：

> `rip` 永远指向当前正在执行的指令本身，但某些情况下（如 `call` 或 `rip` 相对寻址）由于**偏移是相对于下一条指令**，所以看起来像是“指向下一条指令”。

`lea` is one of the few instructions that can directly access the `rip` register!

```asm
lea rax, [rip] # load the address of the next instruction into rax
lea rax, [rip+8] # the address of the next instruction, plus 8 bytes.
```

You can also use `mov` to read directly from those locations!

```asm
mov rax, [rip] # load 8 bytes from the location pointed to by the address of the next instruction
```

Or even write there!

```asm
mov [rip], rax # write 8 bytes over the next instruction (CAVEATS APPLY)
```

This is useful for working with data embedded near you code!

This is what makes certain security features on modern machines possible.

### Writing Immediate Values

You can also write immediate values. However, you must specify their size!

This writes a 32-bit 0x1337 (padded with 0 bits) to address 0x133337.

```asm
mov rax, 0x133337
mov DWORD PTR [rax], 0x1337
```

Depending on your assembler, it might expect `DWORD` instead of `DWORD PTR`.

### Other Memory Regions

Other regions migth be mapped in memory!

We previously talked about regions loaded due to directives(指令) in the ELF headers, but functionality such as mmap and malloc can cause other regions to be mapped as well.

> “我们之前讨论的是 ELF 文件头中的段指令（如 .text、.data、.bss）导致的一些内存区域被加载。但实际上，像 mmap 和 malloc 这样的运行时功能，也会额外在进程地址空间中映射其他区域。”

These will feature prominently(显著地) (and be discussed) in future modules.

### 补充

实际上可以使用 Immediates 直接访问内存：

```asm
mov rax, [0x12345]
```


----
### 一些思考

#### ❓ 问题

既然一个进程在执行的时候，系统会将程序代码加载到内存中，是不是意味着如果我 run 了这个程序，我就可以将这个程序文件从磁盘上移动甚至删除，但运行的进程不会出现问题？

#### ✅ 简洁结论

是的，大多数情况下你可以在程序运行之后移动或删除原始的程序文件，**已经在运行的进程不会受到影响**。

前提是：**你不使用 mmap 来动态映射该程序文件或数据段**。

#### 🧠 操作系统加载机制解释

当你运行一个可执行文件时，操作系统做了这些事情：

- 加载 `.text`（代码段）、`.data`（静态数据段）、`.rodata` 等到**虚拟内存中**；
- 这些段通常被 **mmap 或直接拷贝** 到内存；
- 加载后，文件描述符可以关闭，程序照常执行。

所以：
- 程序运行时使用的是 **内存中的副本**；
- 删除/移动磁盘文件不会影响已加载进程；
- `/proc/[pid]/exe` 仍指向原 inode（显示 `(deleted)`）。

#### 🧪 Linux 示例验证

```bash
$ cp myapp /tmp/testapp
$ /tmp/testapp     # 程序开始运行
$ rm /tmp/testapp  # 删除文件
```

运行中程序依然在执行。

```bash
$ ls -l /proc/$(pidof testapp)/exe
lrwxrwxrwx ... /proc/1234/exe -> /tmp/testapp (deleted)
```

说明内核仍保留文件映射。

#### ⚠️ 哪些情况下会出问题？

| 场景                         | 是否安全 | 原因说明                          |
|------------------------------|----------|-----------------------------------|
| 程序运行后删除可执行文件      | ✅ 安全   | 程序代码已加载到内存              |
| 程序使用 `mmap` 映射自身      | ⚠️ 可能风险 | 重新访问被删除页时可能失败         |
| 加载插件/动态库后再删除文件   | ⚠️ 可能风险 | `dlopen()` 失败，或者调用崩溃       |
| 使用 mmap 读取数据文件并被删  | ❌ 有风险 | 数据页可能无效，程序访问时会崩溃   |

#### 🎯 真实用途示例

很多 Linux 守护进程在启动后立即执行：

```c
unlink("/proc/self/exe");  // 删除自身
```

这样别人看不到原文件，但服务照常运行，提高安全性。

#### ✅ 总结

| 结论点                             | 说明                             |
|------------------------------------|----------------------------------|
| 是否可以删除运行中的程序文件？       | ✅ 可以，大多数情况是安全的         |
| 为什么可以？                        | 因为程序执行的是内存中已加载内容    |
| 什么情况下会出问题？                 | 使用 mmap、动态加载库、插件、文件页 |
