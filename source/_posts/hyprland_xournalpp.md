---
title: Hyprland 下的笔记方案——使用Xournal++
date: 2025/11/2 00:00:40
top: false
tags: [Linux, Hyprland]
categories: 教程
filename: hyprland_xournalpp.md
permalink: hyprland_xournalpp.html
---

----
## 安装 

在 ArchLinux 下安装，其他发行版可自行前往 Github [首页](https://github.com/xournalpp/xournalpp) 查看。

```bash
pacman -S xournalpp
```

## 数位板配置

> 如果你的数位板一切正常，请跳过这一步

我的数位板是凡画的，没法使用凡画提供的 Windows 驱动，而我们需要确保数位板的方向正确，怎么办呢？Hyprland 提供了一个配置选项：

```script
    tablet {
        transform = 1
    }
```

只需要将上面这一行放到 hyprland 配置文件的 input 块里面，hyprland 就会将所有 tablet,即平板/数位板等触摸输入设备的方向旋转 90 度。如果想单独针对一个设备，请自行查阅 hyprland 的 wiki，不保证一定成功。

## xournal++ 下拉菜单不显示

当我们点击一个 xournal++ 的下拉菜单之后，可能出现不显示，实际上出现这种情况时 clion/pycharm 等软件的下拉菜单可能也出现了问题，原因是因为你软件所在的显示器没有在坐标 (0,0) 处，导致软件的下拉菜单出现了移位，只需要修改 monitor 的起始坐标就好了（出现这种问题的想必都使用了多显示器，我就不过多赘述了）

下面是 xournal++ 的 [Issue](https://github.com/xournalpp/xournalpp/issues/5717)
