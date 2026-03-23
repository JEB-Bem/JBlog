---
filename: dms-lock-dpms.md
date: 2026-03-23 16:04:27
title: Hyprland + Dank Material Shell 锁屏后黑屏无法唤醒的原因与解决方案
tags:
  - hyprland
  - dpms
  - DMS
description: 在 Arch Linux + Hyprland + Dank Material Shell 环境中，锁屏后显示器进入 DPMS 省电状态但无法唤醒的问题分析与解决方法. 本文解释问题成因，并提供可靠配置方案恢复正常锁屏体验. 
---

## 起因

在使用 Hyprland 搭配 Dank Material Shell（简称 DMS）时，我遇到了一个不容易定位的问题：

锁屏后屏幕关闭，但无法重新点亮.

表现为：

- 执行 `dms ipc call lock lock`，等待一段时间后
- 或启用：`Turn off all displays immediately when the lock screen activates` （这个配置出现在 DMS 的设置界面的 `Power & Security / Lock Screen / Lock Screen behavior` 下）并锁屏后

屏幕进入省电状态（DPMS off），但：

- 键盘操作无效
- 鼠标移动无效
- 屏幕保持黑屏
- Hyprland 实际仍然运行，可以切换到 tty3，并确认 tty1 中 Hyprland 仍然活着，甚至可以盲操 Hyprland

## 调试

:::tip
[太长不看版](#解决方案)
:::

:::warn
在我的机器上，我的 Hyprland 运行在 `tty1`，`tty3` 是一个未登录的终端，请勿混淆.
:::

最开始发生显示器黑屏时，我立刻意识到了我曾经在配置中看到的 `Turn off all displays immediately when the lock screen activates` 选项，于是尝试按下电源键唤醒显示器，但是没有成功. 无奈之下只能重启，然后我关闭了这个选项（~~毕竟捣鼓 Linux 多一事不如少一事 😭~~）. 后来又一次因为锁屏上个厕所回来发现显示器熄灭了（注意，我是主动锁屏了，而不是被动等待 idle 帮我自动进入睡眠）. 进入锁屏后 DMS 会在一段时间后自动将显示器熄灭. 这次熄灭后我按动键盘、移动鼠标包括按下电源键都没有办法唤醒屏幕. 于是我开始猜测显示器熄灭的机制：

1. 和我曾经使用 Hyprlock 时一样，属于手动将显示器亮度调低到 0. 这就很好办了，直接盲操，输入密码，回车，然后通过 `/sys/class/backlight/intel_backlight/brightness` 强行修改亮度就是. 
2. 用了某种我还没学过的机制，真的将显示器“关闭”了😢
3. 锁屏工具或者 Hyprland 崩溃了？

显然，经过我的一顿捣鼓，应该是属于第二、三种情况... 但是我仍然没有重启，而是试着用 Ctrl+Alt+3 切到 `tty3`，然后我成功了. ~~这个显示器的状态是那么正常，tty 闪烁的光标是那么美丽~~

于是我开始怀疑：

1. DMS 崩溃了？
2. Hyprland 崩溃了？
3. 显示器被“关闭”了？

如果我没记错的话，我当时应该是现在 `tty3` 中用 `dms restart` 重启了 DMS，没有恢复，然后用又重启了 sddm 服务（我使用 sddm 登录管理器来启动 Hyprland）. 于是成功恢复了（如果我没记错的话）. 

但是好景不长，不长记性的我再次直接锁屏去吃饭了. 不出意外，回来时显示器再次熄灭了. 于是我决定在 `tty` 中尝试定位一下问题. 

我首先运行了一下 `dms --help`，看看有没有什么锁屏相关的功能，毕竟是因为锁屏进入了这种状态. 没有发现相关命令，到 ipc 下看看，发现有一个 `islockLocked` 功能：

```bash
lock             demo, forceReset, isLocked, lock, status, unlock
```

于是我检查了一下，发现现在仍然处于锁屏状态，于是直接 `unlock` (现在已经登录 tty，说明我们是有通过认证的，所以能够解锁，这个设计是没有问题的). 然后切回去一看还是没有恢复. 

然后用 `dms brightness` 检查了一下，发现两个显示器（外接了一个）都是有亮度的，再次确认了 `dms lock` 应该做了什么事情. 于是向用 `hyprctl` 看看显示器的状态，但是报错了，当前的 `tty` 下没有 `Hyrpland` 的环境变量. 

### 排除问题

这时我切回去，想看看我刚才 `unlock` 之后是不是已经成功解锁了，于是 AI 一下，盲操着给 `tty3` 发了个消息：

```bash
$ mesg y    # 可能需要 tty1 和 tty3 都执行一次这个命令
$ write $(whoami) tty3
hello
^D
```

然后在 `tty3` 中发现确实有输出，于是可以确定 `tty1` 的问题就是显示器熄灭了，其他运行一切正常.

### 反弹 shell

因为 `tty1` 和 `tty3` 显示器行为明显不同，我在 `tty3` 下面拿到的很多信息可能都不准确，于是我想到了网路攻击中常用的技巧：Web 反弹 Shell，这里肯定不需要用到其他的服务器啦（当然你想的话也是可以的），我们只需要在 `tty1` 中将命令的标准输入输出和报错重定向到 `tty4` 中就可以了.

我原本使用的直接重定向，但是好像会有什么奇奇怪怪的问题，于是采用了最稳的方法，改良了一下 CTF 中常用的 payload：

1. 在 `tty3` 中首先运行 `nc -lvp 9999` 监听 `9999` 端口
2. 在 `tty1` 中运行下面的命令反弹 shell

    :::impo
    因为我使用 `zsh`，使用下面的 `payload` 需要先运行 `bash` 命令进入 `bash` Shell.
    :::

    ```bash
    bash> bash -i >& /dev/tcp/127.0.0.1/9999 0>&1
    ```

回到 `tty3` 中：

```bash
Listening on license.sublimehq.com 9999
Connection received on localhost 40802
<终端提示符> 
```

反弹成功了，于是我在 tty3 中就可以调试了，简单跟 AI 友好交流了一番，在一番 `cat` 之后终于找到了一个“异常”：

```bash
$ cat /sys/class/graphics/fb0/blank
4
```

问了一下 AI，`4` 代表 `FB_BLANK_POWERDOWN`，即显示器已进入电源关闭级别，于是 AI 得出 `DPMS` 可能被关闭的结论.

:::spoi ChatGPT: DPMS 是什么？与亮度设为 0 的区别，以及相关机制总结

#### 一、DPMS 的定义

DPMS（Display Power Management Signaling）是由 VESA 制定的一种显示器电源管理机制，用于控制显示器进入待机、休眠或关闭等节能状态. 它的作用不是改变画面亮度，而是改变显示器的工作状态. 

当系统触发 DPMS 时，显卡会通过视频接口向显示器发送电源管理信号，使显示器关闭背光或进入低功耗模式，从而显著降低能耗. 因此 DPMS 本质属于硬件级显示设备电源控制机制. 

#### 二、DPMS 与亮度设为 0 的区别

将显示器亮度设为 0 并不会关闭显示器. 

在亮度设为 0 时：

显示器仍然处于正常工作状态  
背光系统仍然供电  
显卡持续输出视频信号  
显示接口链路保持活动  

而当使用 DPMS 关闭显示器时：

显示器进入待机或关闭状态  
背光关闭  
显示面板进入低功耗模式  
显卡输出可能降低功耗  

因此可以理解为：

亮度设为 0 只是视觉上变黑  
DPMS 是真正关闭显示输出

#### 三、与 DPMS 类似或相关的机制

除了 DPMS，还有一些机制也参与显示器控制，但它们作用层级不同. 

首先是 DDC/CI 机制. 

DDC/CI 允许操作系统直接控制显示器内部参数，例如亮度、对比度、输入源和色温. 这属于显示器参数控制机制，而不是电源控制机制. 

其次是 HDMI-CEC 机制. 

HDMI-CEC 用于设备之间传递控制信号，例如电视关闭时同步关闭其它影音设备. 这种机制主要用于家庭影音系统的联动控制. 

第三是 ACPI 电源管理体系. 

ACPI 是整机级电源管理框架，负责统一管理 CPU、GPU、显示器以及外设的电源状态. DPMS 可以理解为显示子系统内部的一种具体电源控制策略. 

第四是 Linux 中的 DRM/KMS 显示管理机制. 

在现代 Linux 系统中，DPMS 通常通过 DRM 和 KMS 接口实现. 这些机制负责管理显卡输出、显示连接器状态以及显示模式控制，是 DPMS 的底层实现基础之一. 

#### 四、整体关系理解

从系统结构角度可以理解为：

ACPI 负责整机电源管理  
DRM/KMS 负责显示输出控制  
DPMS 负责显示器电源状态切换  
DDC/CI 负责显示器参数控制  
HDMI-CEC 负责设备之间电源联动  

它们属于不同层级，但共同参与显示设备行为管理. 

#### 五、总结

DPMS 是一种用于控制显示器电源状态的标准机制，可以让显示器进入待机或关闭状态，从而显著降低功耗. 

将显示器亮度设为 0 只是调整显示效果，并不会关闭显示器电源，也不会明显降低系统功耗. 

因此可以简单理解为：

DPMS 控制的是显示器是否在工作  
亮度控制的是显示器显示多亮
:::

其实我已经在反弹 `tty1` 后使用 `hyprctl monitors` 看过显示器的状态，但是我并没有看出什么异常（亮度啥的都正常，显示器也都是 `enabled` 状态），由于是在手机上问的 AI，并没有给他看完整的显示其状态（写这篇文章时才想起来可以在 `tty` 用 Codex 啊！）于是按照 AI 的建议，我再次使用 `hyprctl` 查看了显示器状态，然后看到了：

```bash
...
dpmsStatus: 0
...
```

DPMS 被关闭了！

补充：在成功解除这个省电状态后，我去查阅了 DMS 的相关 Issue，找到了 DMS 的[锁屏机制](https://github.com/AvengeMedia/DankMaterialShell/pull/1402).

## 解决方案

因此，我们需要解除 `DPMS` 的省电状态（[DPMS 是什么？](#一、DPMS-的定义)）. 为了方便跳转过来的同学，我们重新梳理一遍前置条件：

:::spoi 如果你已经通过各种方法连上了 `tty1`（或者你自己的 Hyprland 等窗口管理器运行所在的 `tty`），或者在其他 `tty` 中能够让 `hyprctl` 或者你自己的窗口管理器的命令行工具正常工作. 

运行这个命令，对于非 Hyprland 用于，请查阅相关文档.

```bash
$ hyprctl dispatch dpms on
```
:::

:::spoi 不，还没有！
在其他 `tty` 中使用 `dms ipc call lock unlock` 解锁你的锁屏，或者直接盲操解锁锁屏（没有试验过）

接下来，你可以直接盲操，因为这时虽然显示器已经关闭，但是你已经进入桌面管理器了，你只需要用你熟悉的方式打开一个终端即可. 使用你自己的窗口管理器解除省电状态（DPMS），对于 Hyprland：

```bash
$ hyprctl dispatch dpms on
```
:::

好了，现在显示器应该已经解除省电状态了，实际上 DMS 的这个配置需要在 Hyprland 等窗口管理器中添加配置，但是 DMS 的文档中并没有提到你需要添加这个配置，或许 DMS 的自动 Setup 脚本里有，但是使用其提供的单独配置选项似乎并没有修改 `misc` 的配置. 扯回来，我们需要在 Hyprland 的配置中添加下面两个选项（至少添加一个）：

```py
misc {
  ...
    mouse_move_enables_dpms = true
    key_press_enables_dpms = true
  ...
}
```

这里是 Hyprland 的[相关介绍](https://wiki.hypr.land/Configuring/Variables/#misc).

完结撒花 🎉🎉🎉
