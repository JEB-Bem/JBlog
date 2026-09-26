---
filename: ics-lab-env.md
indent: true
date: 2026-09-26 15:42:59
title: 计算机系统基础Ⅱ实验环境配置
tags: [计算机系统基础, Linux]
description: 计算机系统基础Ⅱ实验环境配置讲义
---

> 本文提供[在线版本](https://chrjeb.cn/ics-lab-env.html).

## 1 虚拟机

:::tip
大部分同学应该都有《计算机科学与技术导论》的基础，因此正确安装和使用虚拟机应该不成问题，如果你选择
- 使用自己已经安装好的 Linux 虚拟机/物理机或 WSL——可以前往 [2.工具安装与配置](#2-工具安装与配置) 安装必要的工具
- 使用我们提供的镜像或安装自己喜欢的镜像——请继续阅读本节
:::

要安装虚拟机，可以使用免费的 VMware（注意 Workstation 提供给 Windows，Fusion 提供给 MacOS）或 VirtualBox，其中最新版的 VMware 的获取可能有些复杂，且可能有网络问题.

### 1.1 VirtualBox

#### 安装软件

进入 VirtualBox 的[下载界面](https://www.virtualbox.org/wiki/Downloads)，下载对应版本的安装包，MacOS 一般使用 *Apple Silicon hosts*. 若出现网络问题，这里提供一个 *VirtualBox-7.2.18-175117-Win.exe* 的[备用下载链接](http://chrjeb.cn/VirtualBox-7.2.18-175117-Win.exe)，更推荐从上面的官网下载.

根据 VirtualBox 的 [User Manual](https://www.virtualbox.org/manual/topics/installation.html#install-win-installdir-req)，Windows 用户在安装时可能对安装目录有特殊要求，若出现问题，可阅读该 Manual 检查是否有目录的权限问题. 安装时请勾选 **Networking** 和 **USB support** 选项. MacOS 用户也可参考[Manual](https://www.virtualbox.org/manual/topics/installation.html#installation-mac)安装.

#### 安装 Kubuntu 26.04

我们使用一个桌面风格类似与 Windows 的 Ubuntu 系统来完成本学期的实验，你也可以自行寻找你喜欢的镜像自行安装. 这里我们提供一个虚拟机镜像，理论上来说使用我们的镜像之后，你就不再需要进行 [1.2](#1-2-工具安装与配置) 的配置. [下载链接](https://chrjeb.cn/virtualbox-Kubuntu-isc-vm.ova) 或从 QQ 群中获取 （virtualbox-Kubuntu-isc-vm.ova）

其配置为：

```js
Account:
  username: oucics
  password: oucICS2026
Hardware:
  Memory: 8 GB
```

将其导入 VirtualBox，设置剪贴板、共享文件夹等即可正常使用.

### 1.2 VMware

你需要先[注册](https://profile.broadcom.com/web/registration)一个*博通*的账号，接下来以 VMware Workstation Pro 为例演示，Fusion 同理.

首先进入[产品列表](https://support.broadcom.com/group/ecx/free-downloads)，选择 *VMware Workstation Pro*，然后点击最新版，目前是 `26H1u1`，接着，你需要先点击进去阅读，然后再到这个页面同意协议，最后点击下载；接下来你需要填写地址，这里并没有特殊要求，最后提交，回到下载页面后再次点击下载按钮即可下载.

![20260919-76b22001f48e874f.png](./images/20260919-76b22001f48e874f.png)

如果你在安装过程中出现了无法解决的问题，可以在课程群里提问或私聊助教. 这里还有一些不错的教程[^1].

[^1]: [USTC LUG 的 Linux 101 指南](https://101.lug.ustc.edu.cn/Ch01/#get-vm-softwares)、[HDU-CS-WIKI 的 Linux 环境安装指南](https://hdu-cs.wiki/7.%E5%BA%95%E5%B1%82%E6%A8%A1%E5%9D%97/7.1%20Linux%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85.html)

#### 安装 Kubuntu 26.04

我们使用一个桌面风格类似与 Windows 的 Ubuntu 系统来完成本学期的实验，你也可以自行寻找你喜欢的镜像自行安装. 这里我们提供一个 Kubuntu [官网镜像](https://cdimage.ubuntu.com/kubuntu/releases/26.04.1/release/kubuntu-26.04.1-desktop-amd64.iso)，由于助教没有使用 VMware，所以你需要自行完成安装系统的步骤并跟随 [1.2](#1-2-工具安装与配置) 完成接下来的工具配置.

:::tip
当然，你也可以选择导入 ova 文件，但你需要额外配置 VMware Tools 来使用剪贴板和共享文件夹等功能.
:::

硬件配置可参考[上文](#安装-Kubuntu-26-04)，

首先确保虚拟机已经连接网络，虚拟机网络配置为 NAT 模式一般可以正常使用，否则可以尝试 Bridge（桥接模式）. 若网络正常，点击 *Install Kubuntu* 你会看到以下欢迎界面：

![20260920-c1bfed506d9d5748.png](./images/20260920-c1bfed506d9d5748.png)

Location 和 Keyboard 都保持默认即可，Customize 选择 *Minimal Installation*，在 Partitions 中选择 *Erase Disk*，并设置 No swap.

![20260920-95699861ddb40327.png](./images/20260920-95699861ddb40327.png)

设置用户名，密码，接下来一路确认，并等待安装完成即可.

![20260920-56f1a6b6c28b9766.png](./images/20260920-56f1a6b6c28b9766.png)

## 2 工具安装与配置

:::tip
如果你已经使用了 `virtualbox-Kubuntu-isc-vm.ova`，则可以跳过本节（1.2）
:::

对于 Kubuntu 或其他 Ubuntu 26 发行版(bash)，使用以下命令下载我们提供的安装脚本并执行安装，脚本中部分命令需要 *root* 权限，因此需要你输入用户密码，注意输入密码时密码**可能不会**显示出来，因此看到屏幕没有动静很正常，确认密码输入完毕后回车即可.

如果你介意脚本自动安装的选项不符合你的使用习惯，你可以跟随下面的指南手动安装：

```bash
$ curl -fsSL 'https://chrjeb.cn/install.sh' | bash
```

:::tip
若无其他说明，类似与上面的“命令行”块中，以 `$ ` 开头的表明这是需要执行的命令，若这一行的末尾没有 `\` 且第二行无 `$ ` 说明这是命令的输出，有时候输出会被截断或省略，**否则**这是命令的第二行.
:::

若**最终**看到下面的输出，说明安装成功，否则请根据下面的教程手动安装，并使用 AI 辅助解决问题，同样如果你在安装过程中出现了无法解决的问题，可以在课程群里提问或私聊助教.

```bash
=============================
Installed 2026 Fall ICS Utils
=============================
```

:::warn
本节剩余部分使用 Kubuntu 举例，对于 debian 系的 Distro (发行版) 基本都适用.
:::

### 2.1 更换 APT 软件源

安装脚本的第一步是把 Ubuntu 官方源换成清华 TUNA 镜像，加快后续下载速度. 请根据清华源的[帮助手册](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)更新你的 apt 源. 最后执行：

```bash
$ sudo apt update
```

:::tip
如果你的系统本来就用的是别的国内镜像（比如装系统时选了 `mirrors.ustc.edu.cn`），请跳过这一步
:::

### 2.2 安装基础工具

```bash
$ sudo apt install -y binutils build-essential gcc-multilib \
  libc6-dev-i386 unzip vim
```

然后是一个增强的 gdb —— *pwndbg* (/paʊnˈdiˌbʌɡ/)，注意:

```bash
$ curl --proto '=https' --tlsv1.2 -LsSf 'https://install.pwndbg.re' \
  | sh -s -- -t pwndbg-gdb -u
Installing rootless...
Downloading... https://releases.pwndbg.re/releases/2026.07...
Installing... pwndbg-gdb in /home/oucics/.local/lib/pwndbg-gdb
Creating... symlink in /home/oucics/.local/bin/pwndbg
Installation complete.
🚀 Run binary with: pwndbg
```

*pwndbg* 会检测 `~/.local/bin` 是否在 `$PATH` 里，如果不在会打印一条黄色警告——根据提示操作即可，我们使用的 shell 是 `bash`.

::::spoi 可选部分

### 2.3 安装 Rust 工具链与 elfcat

`elfcat` 是一个用 Rust 写的 ELF 可视化工具，所以需要先装 Rust 工具链：

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

`-y` 表示所有选项都用默认值，全程不需要交互.

然后编译安装 `elfcat`：

```bash
$ cargo install elfcat
```

### 2.4 安装 Firefox

把 Mozilla 的签名公钥放进 `/etc/apt/keyrings`（`apt-key` 已被废弃，现在第三方源的公钥统一放在这个目录）：

```bash
$ sudo install -d -m 0755 /etc/apt/keyrings
$ wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- \
  | sudo tee /etc/apt/keyrings/packages.mozilla.org.asc > /dev/null
```

核对公钥指纹：

```bash
$ gnupghome=$(mktemp -d)
$ fingerprint=$(GNUPGHOME="$gnupghome" gpg -n -q --import --import-options \
  import-show /etc/apt/keyrings/packages.mozilla.org.asc 2>/dev/null \
  | awk '/^pub/{getline; gsub(/^[ \t]+|[ \t]+$/, ""); print; exit}' || true)
$ rm -rf "$gnupghome"
$ echo "$fingerprint"
```

脚本拿到的指纹应该是 `35BAA0B33E9EB396F59CA838C0BA5CE6DC6315A3`.

添加 Mozilla 的 APT 源:

```bash
$ sudo tee /etc/apt/sources.list.d/mozilla.sources > /dev/null << EOF
> Types: deb
> URIs: https://packages.mozilla.org/apt
> Suites: mozilla
> Components: main
> Signed-By: /etc/apt/keyrings/packages.mozilla.org.asc
> EOF
```

写一条优先级规则（pin）

```bash
$ sudo tee /etc/apt/preferences.d/mozilla > /dev/null << EOF
> Package: *
> Pin: origin packages.mozilla.org
> Pin-Priority: 1000
>
> Package: firefox
> Pin: release o=Ubuntu
> Pin-Priority: -1
> EOF
```

最后刷新索引并安装：

```bash
$ sudo apt-get update
$ sudo apt-get install -y firefox
```

::::

