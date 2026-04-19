---
filename: des-attack.md
date: 2026-04-18 13:11:23
title: 现代密码学实践 - DES 穷举攻击
tags:
- crypto
description: 现代密码学实践 —— DES 密钥穷举攻击与 DES Python 部分实现
---

欢迎来到现代密码学实践之 DES 穷举攻击！在本次实践中，你将会使用 Python 来实现一个简单的 DES 加密算法（Part 1）！我们同时，将会使用 Python 来尝试穷举一个密文的密钥并将其解密（Part 2）！

## Part 1

获取这次实践 Part 1 将会用到的所有初始代码：[下载 zip 压缩包](https://chrjeb.cn/repos/DES-Attack.zip)

如果你能够连接上 Github，那么你可以直接使用这个命令 Clone 作业仓库：

```bash
git clone https://github.com/JEB-Bem/DES-CBC.git
```

如果有同学发现作业中有不合理的设计或错误，欢迎在评论区指出，如果涉及到实现细节，可以通过 QQ 联系我. 大家有任何问题，如果不涉及到实现细节，也可以在评论区提问. 我看到后会回复.

PPT在[此处]()，视频在 PPT 的最后一页.

## Part 2

这部分在录屏中没有提到. 简单讲下原理，由于使用原密钥空间过于巨大，穷举需要耗费大量时间，所以，我们可以直接在 Part1 的基础上通过缩短密钥长度来缩小密钥空间，这需要对应的修改一部分实现，甚至修改 S-box 的实现，我还没有完全实现这个部分（可能鸽了），有实现的同学欢迎和我交流😍😍😋.
