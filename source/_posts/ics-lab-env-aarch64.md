---
filename: ics-lab-env-aarch64.md
indent: true
date: 2026-10-15 12:37:03
title: 计算机系统基础Ⅱ实验环境配置(Windows on Arm)
tags: [计算机系统基础, Linux]
description: Arm 架构下计算机系统基础Ⅱ实验环境配置补充说明.
---

> 针对 Arm 架构的 Windows 用户，其他架构请阅读这篇[讲义](https://chrjeb.cn/ics-lab-env.html).  
> 本文提供[在线版本](https://chrjeb.cn/ics-lab-env-aarch64.html).

## 1 前言

由于计算机系统基础实验使用 x86/x64 进行授课，因此 Arm 用户（包括苹果用户），可能都需要进行额外配置.

:::tip
关于 Mac，似乎有另一种可以直接转译 x64 指令的方法，如果你已经配置好环境了，可以不用阅读本文.
:::

目前，有两种方法. 第一是租赁云服务器，比如[阿里云的试用活动](https://free.aliyun.com/?product=1351)，使用 2 核(vCPU) 2 GiB 的配置有 3 个月的试用期限，完全可以完成我们的实验，工具上，可以配合 XShell 等远程连接工具实现文件上传下载. 这里不展开讲解，配置好云服务器后可以直接回到[工具配置](https://chrjeb.cn/ics-lab-env.html#2-工具安装与配置)完成工具配置.

第二种方法是使用 QEMU，相对比较复杂，优点是本地可用. 注意，由于助教的环境是 Linux，所以只测试了 QEMU 中的配置过程，QEMU 本身的安装没有在 Mac 和 Windows (Arm) 上配置，如果你遇到了什么问题，可以联系助教，如果自行解决了，也可以将问题和解决方法告知助教，方便我们更新文档.

## 2 QEMU 配置说明

### 2.1 安装 QEMU

- Windows(Arm): https://qemu.weilnetz.de/aarch64/ ，目前的最新版是 *qemu-arm-setup-20260811.exe*
- Mac: https://www.qemu.org/download/

安装完成之后，你应该可以使用 `qemu-system-x86_64 --version` 命令.

### 2.2 下载 Ubuntu 镜像
下载 ubuntu 镜像，

- [下载链接1](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/26.04.1/ubuntu-26.04.1-live-server-amd64.iso)
- [下载链接2](https://mirrors.ustc.edu.cn/ubuntu-releases/resolute/ubuntu-26.04.1-live-server-amd64.iso)

[更多国内 Ubuntu 镜像下载地址](https://mirrors.cernet.edu.cn/os/ubuntu)，可自行选择速度最快的镜像源，注意我们使用的系统是 *26.04.1(adm64,Server)*.

### 2.3 创建虚拟磁盘

创建一个合适的目录，把刚刚下载的镜像放到这里，然后在此目录下打开命令行,创建一个 20G 的虚拟磁盘.

```bash
$ qemu-img create -f qcow2 ubuntu26-amd64.qcow2 20G
```

### 2.4 安装 Ubuntu Server

使用以下命令安装系统：

Unix(Mac):

```bash
$ qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg \
  -drive file=ubuntu26-amd64.qcow2,if=ide,format=qcow2 \
  -cdrom ubuntu-26.04.1-live-server-amd64.iso \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device virtio-net-pci,netdev=net0
```

Powershell(Windows):

```bash
> qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg `
  -drive file=ubuntu26-amd64.qcow2,if=ide,format=qcow2 `
  -cdrom ubuntu-26.04.1-live-server-amd64.iso `
  -netdev user,id=net0,hostfwd=tcp::2222-:22 `
  -device virtio-net-pci,netdev=net0
```

命令执行后会弹出一个窗口，等待一段时间后（可能比较长）会出现下面的界面

![20261015-a1dc9d749a5e200a.png](./images/20261015-a1dc9d749a5e200a.png)

连续回车确认，直到出现下面这个界面，按 ↑ 键移动到 Ubuntu Server (minimized) 选项，按下空格确认，再按 ↓ 键移动到 [Done   ]，按下回车.

![20261015-945138ed088b1aaf.png](./images/20261015-945138ed088b1aaf.png)

然后再次按下回车，直到来到下面这个界面：

![20261015-b4e7391c1a184965.png](./images/20261015-b4e7391c1a184965.png)

出现最后一行的 `Reading package lists...` 说明网络没有问题，继续回车，在下面这个界面，按 ↓ 键直到移动到 [Done   ]，然后按两次回车

![20261015-2a064df45032501d.png](./images/20261015-2a064df45032501d.png)

会弹出一个确认界面，选择 `Continue`，回车，下面配置用户，可参照我的配置：

![20261015-319cd811938736f8.png](./images/20261015-319cd811938736f8.png)

移动到 Done，继续回车，在下面这个界面按下空格选中：

![20261015-c6b66bd877874284.png](./images/20261015-c6b66bd877874284.png)

移动到 Done，继续回车，下面这个界面啥都不选，移动到 Done，回车

![20261015-919bf599ea52a029.png](./images/20261015-919bf599ea52a029.png)

等待安装（看到这里，关闭电脑的自动睡眠，然后去吃个饭吧 😂）：

![20261015-ed0d085c15130813.png](./images/20261015-ed0d085c15130813.png)

最后，移动到 [Reboot Now]，回车

![20261015-cec67063a23828b1.png](./images/20261015-cec67063a23828b1.png)

重启后会停在一个界面，要求你移除 Medium，这时直接关闭窗口即可（或在命令行中用 Ctrl-A X 强行中断）.

### 2.5 重新启动系统

用以下命令重新启动系统：

Unix(Mac):

```bash
$ qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg \
  -drive file=ubuntu26-amd64.qcow2,if=virtio,format=qcow2 \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device virtio-net-pci,netdev=net0
```

Powershell(Windows):

```bash
> qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg `
  -drive file=ubuntu26-amd64.qcow2,if=virtio,format=qcow2 `
  -netdev user,id=net0,hostfwd=tcp::2222-:22 `
  -device virtio-net-pci,netdev=net0
```

等待，直到看到 cloud-init 的日志开始输出，并看到类似于下面这种指纹图时，再开启一个终端，或者使用 XShell 等 SSH 连接工具（推荐）.

```bash
+--[ED25519 256]--+
|        .        |
|       . .       |
|      o . o      |
|     o + = .     |
|    . * S =      |
|     + o *       |
|    . . o        |
|   . .           |
|  ..             |
+----[SHA256]-----+
```

:::tip
1. 如果你需要从 qemu 从脱离鼠标，试试 `Ctrl + Alt + G`.
2. 配置信息
ip: `127.0.0.1`  
端口: `2222`  
用户名（如果你使用前面提到的配置）：`oucics`
密码：即前面的配置密码
:::

然后使用以下命令替换 CMDLINE（会要求你输入当前用户的密码）：

```bash
sudo sed -i 's/^GRUB_CMDLINE_LINUX_DEFAULT=""/GRUB_CMDLINE_LINUX_DEFAULT="console=tty0 console=ttyS0,115200n8"/' /etc/default/grub
```

再运行下面两个命令：

```bash
echo 'GRUB_TERMINAL=serial' | sudo tee -a /etc/default/grub
echo 'GRUB_SERIAL_COMMAND="serial --speed=115200 --unit=0 --word=8 --parity=no --stop=1"' | sudo tee -a /etc/default/grub
```


验证一下是否是下面的输出：

```bash
$ grep -E "GRUB_CMDLINE_LINUX_DEFAULT|GRUB_TERMINAL|GRUB_SERIAL_COMMAND" /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="console=tty0 console=ttyS0,115200n8"
#GRUB_TERMINAL=console
GRUB_TERMINAL=serial
GRUB_SERIAL_COMMAND="serial --speed=115200 --unit=0 --word=8 --parity=no --stop=1"
```

核对没有问题之后更新 grub.

```bash
sudo update-grub
```


```bash
sudo reboot
```

现在你可以关闭这个 QEMU 窗口了.

### 2.6 进行实验

以后每次要启动系统时，使用命令

Unix(Mac):

```bash
$ qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg \
  -drive file=ubuntu26-amd64.qcow2,if=virtio,format=qcow2 \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device virtio-net-pci,netdev=net0 \
  -nographic -serial mon:stdio
```

Powershell(Windows):

```bash
> qemu-system-x86_64 -M q35 -cpu qemu64 -m 8G -smp 2 -accel tcg `
  -drive file=ubuntu26-amd64.qcow2,if=virtio,format=qcow2 `
  -netdev user,id=net0,hostfwd=tcp::2222-:22 `
  -device virtio-net-pci,netdev=net0 `
  -nographic -serial mon:stdio
```

等待当前终端输出下面的字样，你就可以直接登录，或者再打开新的终端使用 ssh 登录，或者使用 ssh 连接工具，如 XShell.

```bash
Ubuntu 26.04.1 LTS ics-qemu ttyS0

ics-qemu login:
```

关闭系统可以使用 `sudo shutdown now` (推荐) 或者用 `Ctrl-A X`.

:::tip
为了完成实验，你可能还需要阅读[工具配置](https://chrjeb.cn/ics-lab-env.html#2-工具安装与配置)完成工具配置.
:::
