---
title: Linux Command 笔记
date: 2025/06/28 18:22:32
tags: Linux
categories: 笔记
filename: linux_command_notes.md
---

> 该笔记并不完善，只是半道觉得知识过多，因此开始记笔记罢了。

## 第 8 章 高级键盘技巧

### 8.3 命令历史记录

**好用的命令和快捷键**

- `history`: 查看命令历史记录
- `Ctrl + R`: 增量搜索历史记录
- !Important `Ctrl + J`: 将匹配项复制到当前命令行

**历史扩展**

- `!!`: 重复上一条命令
- `!number`: 执行 history 列表中的第 n 个命令
- `!string`: 重复以 string 开头的最后一个命令
- `!?string`: 重复包含 string 的最后一个命令

#### Ex-script

这个命令可以保存当前会话！一般格式为：

```bash
script <file>
```

常用选项

- `-a, --append`: 将新会话内容追加到已存在的记录文件末尾，而非覆盖。

- `q, --quiet`: 静默模式，不显示 “Script started...” 等提示信息。

- `f, --flush`: 每次输出都立即写入文件，方便在另一个终端使用 tail -f 实时查看。

- `t [秒数]`: 与 `-r`（记录时间）配合使用时，指定时间日志文件，或将时间信息输出到标准输出。

如果需要重放保存的会话，应该是要使用 `scriptreplay`, 不过前提是在录制的时候要保留一份时间日志文件。


## 第 9 章 权限

### 9.1 属主、属组以及其他用户（世界 World）

```bash
> id
uid=1000(jebhim) gid=1000(jebhim) groups=1000(jebhim),150(wireshark),960(docker),998(wheel)

> ls -l foo.txt
-rw-r--r-- 1 jebhim jebhim 0 May  9 14:42 foo.txt
0123456789
```

先看一下文件属性，一共 10 个字符：

`0`: 文件类型

| 属性 | 文件类型                                                                                     |
|------|----------------------------------------------------------------------------------------------|
| -    | 普通文件                                                                                     |
| d    | 目录                                                                                         |
| l    | 符号链接，其属性虚构为777，真实属性为指向文件的属性                                          |
| c    | 字符设备文件。这种文件类型指的是按字节流处理数据的设备，例如终端(`/dev/tty*`)或`/dev/null/` |
| b    | 块设备文件。这种文件类型指的是按块处理数据的设备，例如硬盘或DVD设备                         |

#### Ex 虚拟终端 VS 物理终端 VS 终端模拟器（Konsole）[^1],[^2],[^3],[^4]

##### 1. 终端（Terminal）的概念
- **终端**：按照百度百科，“经由通信设施向计算机输入程序和数据或接收计算机输出处理结果的设备”。
  - **输入终端**：键盘、鼠标、麦克风、摄像头等。
  - **输出终端**：显示器、耳机、打印机等。

  > 或者我们说输入设备和输出设备

- 终端实际上是输入设备和输出设备
  - 作为输出设备
    接受 UART 信号并显示（Escape Sequence，即转义序列就非常自然了）。更直白一点说，就是获取程序的信号，并向显示设备输出（写）。
  - 作为输入设备
    按键的 ASCII 码会输出到 UART（所以有很多控制字符）。直白一点说就是为程序提供输入，供程序处理。

  > UART(Universal Asynchronous Receiver/Transmitter)
  >
  > 将并行数据与串行数据互相转换，常用来驱动 RS-232、TTL电平的“串口”通信

当然，上面所说的都是真正的物理终端了，我们现在计算机使用的虚拟终端，实际上并不使用 UART 了。

---

##### 2. Shell 与 Bash
- **Shell**：命令行解释器，负责把终端输入的命令转换为操作系统调用。
- **常见实现**：Bash、Zsh、Fish 等。
- **流程**：
  1. 用户在终端输入命令  
  2. Shell 解析并执行  
  3. 计算结果反馈到终端输出  

---

##### 3. 物理终端 vs 虚拟终端 vs 伪终端

| 类型     | 源头/实现                                          | 设备文件                                | 特征                                                                                             |
|----------|----------------------------------------------------|-----------------------------------------|--------------------------------------------------------------------------------------------------|
| 物理终端 | 串口/UART 硬件                                     | `/dev/ttyS0`、`/dev/ttyS1`…             | 真正的 RS-232 串口接口，需要外接串口线或调试排针                                                 |
| 虚拟终端 | 内核 Virtual Console                               | `/dev/tty1`…`/dev/ttyN`                 | 无需外部硬件，通过 `Ctrl+Alt+F1…F6` 切换，多路本地文本控制台                                    |
| 伪终端   | 软件层面的“假”终端对，由一对 master/slave 设备构成 | `/dev/pts/N`(slave) `/dev/ptmx`(master) | 终端模拟器（如 Konsole）把用户的按键发给 master，而 shell 进程读写 slave，就像在真实终端上一样。 |

---

##### 5. 常见字符设备节点

- `/dev/ttyN`：第 N 个虚拟终端设备，由内核编译时参数 `CONFIG_VT_NR_CONSOLES` 决定总数。
- `/dev/ttyS*`：物理串口设备，数量由主板/PCI/USB 串口硬件和驱动决定。
- `/dev/console`：系统的主控制台，用于启动时消息输出和关键交互，通常映射到 `/dev/tty0`。
- `/dev/tty`：当前进程的控制终端，不管它是物理、虚拟还是串口。
- `/dev/ptmx` + `/dev/pts/N`：伪终端 master/slave 对，供终端模拟器和网络登录（SSH）使用。

---

##### 6. 伪终端（PTY）详解

1. **组成**
   - **主设备（Master）**：`/dev/ptmx` 打开后分配的主控端，由模拟器程序管理，即连接到终端模拟器。
   - **从设备（Slave）**：`/dev/pts/N`，被 shell 等进程当作真实终端，支持所有行规程和 ioctl。

2. **创建流程**
   ```c
   int mfd = posix_openpt(O_RDWR|O_NOCTTY);
   grantpt(mfd); unlockpt(mfd);
   char *sname = ptsname(mfd);
   int sfd = open(sname, O_RDWR|O_NOCTTY);
   setsid(); ioctl(sfd, TIOCSCTTY, 0);
   dup2(sfd,0); dup2(sfd,1); dup2(sfd,2);
    ```
    在实际使用中，伪终端经常被创建：
    - ssh, tmux new-window, ctrl-alt-t ...
    - `openpty()`: 通过 `/dev/ptmx` 申请一个新终端
      - 返回两个文件描述符（master/slave)

3. **数据流向**

主设备（PTY Master）- 由终端模拟器直接控制的端点

- 通过`read()` 获取从设备的输出（比如 `shell` 的 `stdout`
- 通过 `write()` 发送键盘输入到从设备

从设备（PTY Slave）- 行为与物理终端完全一直

- shell 等程序通过该设备获取输入，输出显示内容
- 主从设备通过内核双向管道连接

```bash
用户输入 → 终端模拟器写入 master
master → 内核 → slave → Shell 读取
Shell 输出 → 写入 slave
slave → 内核 → master → 模拟器渲染
```

> 伪终端一般通过内核与虚拟终端交互
>
> 使用 `tty` 可以查看现在使用的伪终端

[^1]: [linux各种终端类型的区别和概念](https://www.cnblogs.com/wyzhou/p/9283214.html)

[^2]: [什么是终端](https://www.cnblogs.com/jfzhu/p/13040942.html)

[^3]: [伪终端 为何物](https://juejin.cn/post/7347668434446729226)

[^4]: [JYY 终端](https://www.bilibili.com/video/BV1bNQAYZEpu/?spm_id_from=333.1387.collection.video_card.click&vd_source=2f242aaa83317e96a605fcd307d179a9)
