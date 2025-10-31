---
title: Aliyun & Let's Encrypt - Apply for a certificate
date: 2025/10/31 17:50:58
tags: Linux
categories: 随笔
permalink: certificate-application-for-Ali4LetEnc
---

本文介绍如何使用 `Certbot` 向 `Let's encrypt` 申请证书，使用阿里云服务器。

# 证书

> [!NOTE]
> 公开密钥认证（英语：Public key certificate），又称数字证书（digital certificate）或身份证书（identity certificate）。是用于公开密钥基础建设的电子文件，用来证明公开密钥拥有者的身份。此文件包含了公钥信息、拥有者身份信息（主体）、以及数字证书认证机构（发行者）对这份文件的数字签名，以保证这个文件的整体内容正确无误。拥有者凭着此文件，可向电脑系统或其他用户表明身份，从而对方获得信任并授权访问或使用某些敏感的电脑服务。
> —— [wikipedia](https://zh.wikipedia.org/wiki/%E5%85%AC%E9%96%8B%E9%87%91%E9%91%B0%E8%AA%8D%E8%AD%89)
