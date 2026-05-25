---
title: RFC 9580 OpenPGP 笔记 (By GPT)
date: 2026/05/22 11:22:58
tags:
- Web
- Crypto
filename: rfc_9580_openpgp_summay.md
description: RFC 9580 OpenPGP 学习笔记
keywords:
- OpenPGP
- RFC 9580
- 密码学
- 协议
- 标准
---

# RFC 9580 OpenPGP 宏观学习笔记

## 0. 先建立一张总图

RFC 9580 规定的是 **OpenPGP 数据对象的格式**。OpenPGP 不是单个算法，而是一套把密钥、签名、加密消息、压缩数据、明文数据等对象编码成“包序列”的协议格式。

可以把 OpenPGP 看成四层：

```text
用户语义层
  ├─ 我要发一封加密邮件
  ├─ 我要签名一个文件
  ├─ 我要发布我的公钥
  └─ 我要撤销一把密钥

OpenPGP 对象层
  ├─ OpenPGP Message：消息
  ├─ Transferable Public Key：可传输公钥，也就是 OpenPGP certificate
  ├─ Transferable Secret Key：可传输私钥
  └─ Detached Signature：分离签名

包序列层
  ├─ PKESK / SKESK：加密会话密钥
  ├─ SEIPD：完整性保护的加密数据
  ├─ SIG / OPS：签名与一遍式签名
  ├─ LIT：真正的明文数据
  ├─ PUBKEY / SECKEY / SUBKEY：密钥材料
  ├─ UID / UAT：身份标识或用户属性
  └─ COMP / PADDING / MARKER 等辅助包

密码算法层
  ├─ 公钥加密：X25519、X448、ECDH、旧 RSA 等
  ├─ 签名：Ed25519、Ed448、ECDSA、旧 RSA/DSA 等
  ├─ 对称加密：AES、Camellia 等
  ├─ AEAD：OCB、EAX、GCM
  ├─ 哈希：SHA-256、SHA-512、SHA3 等
  └─ S2K：把口令转换成密钥，推荐 Argon2
```

OpenPGP 最核心的思想是：

1. **真正的大数据通常用对称加密加密**。
2. **对称会话密钥再用公钥或口令保护**。
3. **所有内容都编码成 packet，也就是包**。
4. **签名既可以签文件，也可以签身份、子密钥、撤销声明、策略信息等**。
5. **公钥不是裸公钥，而是一个证书结构：主密钥 + 用户身份 + 自签名 + 子密钥 + 第三方认证 + 撤销信息**。

典型加密消息结构：

```text
PKESK / SKESK ...     # 一个或多个“加密后的会话密钥”
SEIPD                 # 用会话密钥加密后的正文容器
  └─ COMP?            # 可选压缩
       └─ OPS?        # 可选一遍式签名头
            └─ LIT    # 真正的文件或文本数据
            └─ SIG?   # 签名包
```

典型公钥证书结构：

```text
Primary Public Key
  ├─ Direct Key Self-Signature
  ├─ User ID / User Attribute
  │    └─ Certification Signature(s)
  ├─ Public Subkey
  │    └─ Subkey Binding Signature
  └─ Revocation Signature(s)
```

---

## 1. Introduction：RFC 9580 的定位

### 这一部分讲了什么

RFC 9580 说明：本文档规定 OpenPGP 的 **message-exchange packet formats**，也就是消息交换时使用的包格式。它覆盖加密、解密、签名、密钥管理等功能所需的数据格式。

它取代了 RFC 4880、RFC 5581 和 RFC 6637，因此可以理解为现代 OpenPGP 的主要规范版本。

### 意义是什么

这部分限定了文档边界：

- 它不是“如何一步步写一个应用”的教程。
- 它规定的是可互操作格式：如何读、检查、生成和写出符合规范的 OpenPGP 包。
- 它不深入讨论本地存储、UI、密钥数据库设计等实现细节。
- 它会讨论避免安全漏洞所需的实现注意事项。

### 在 OpenPGP 体系中提供什么功能

它给整个体系定性：OpenPGP 是一种 **数据格式与互操作协议**，而不是单一库、单一应用或单一加密算法。

### 学习时应抓住的概念

以后看到 “OpenPGP” 时，不要只想到 “PGP 加密邮件”。更准确地说，OpenPGP 是一套规定如下对象如何编码和组合的标准：

- 加密消息
- 签名消息
- 分离签名
- 公钥证书
- 私钥材料
- 用户身份绑定
- 子密钥绑定
- 撤销证明
- 算法偏好
- ASCII Armor 文本封装

---

## 2. General Functions：OpenPGP 的基本功能

### 这一部分讲了什么

这一章从功能角度介绍 OpenPGP：

1. 通过加密提供机密性。
2. 通过数字签名提供认证与完整性。
3. 可选压缩。
4. 可把二进制对象转换为 Base64 文本形式。
5. 允许只做签名的子集应用。

### 2.1 Confidentiality via Encryption：机密性

#### 讲了什么

OpenPGP 使用 **混合加密**：

- 消息正文用对称算法加密。
- 每条消息随机生成一个一次性的 session key。
- session key 再用接收者的公钥加密。
- 如果有多个接收者，同一个消息可以有多个加密后的 session key。

#### 意义

公钥加密适合保护小数据，例如会话密钥；对称加密适合保护大数据，例如文件正文。OpenPGP 把两者组合起来，兼顾性能与密钥分发能力。

#### 在体系中的功能

它解释了 PKESK、SKESK、SEIPD 三类包之间的关系：

```text
PKESK/SKESK = 保护 session key
SEIPD       = 用 session key 派生出的 message key 加密正文
```

#### 文档例子的解释

RFC 给出的流程可以理解为：

```text
发送者创建消息
  ↓
生成随机 session key
  ↓
用每个接收者的公钥加密 session key
  ↓
可选压缩消息
  ↓
用 session key 派生出的 message key 加密消息
  ↓
接收者用自己的私钥解开 session key
  ↓
接收者用 session key 派生 message key 并解密正文
```

如果 Alice 给 Bob 和 Carol 发同一条加密消息：

```text
PKESK for Bob
PKESK for Carol
SEIPD encrypted body
```

Bob 用自己的私钥解开 Bob 那个 PKESK，Carol 解开 Carol 那个 PKESK。两人得到同一个 session key，然后解开同一个 SEIPD 正文。

### 2.2 Authentication via Digital Signature：数字签名

#### 讲了什么

签名流程是：

```text
消息
  ↓ hash
摘要
  ↓ 用私钥签名
签名
  ↓
接收者用公钥验证
```

#### 意义

签名提供三个核心属性：

- 消息未被篡改。
- 签名者持有对应私钥。
- 在应用语义允许时，可以把消息归属于某个身份或密钥。

#### 在体系中的功能

它解释了 Signature Packet 的基础作用：签名包是“某把公钥与某段数据之间的绑定声明”。这个“数据”可以是文件正文，也可以是 User ID、子密钥、撤销声明等。

### 2.3 Compression：压缩

#### 讲了什么

OpenPGP 可以压缩数据。压缩不是必须功能，但许多历史 OpenPGP 消息都使用压缩。

#### 意义

压缩的作用有两个：

- 减小数据体积。
- 在某些情况下减少明文结构暴露。

但压缩也有安全和实现风险，例如压缩炸弹、资源耗尽等，后面安全章节会提到。

#### 在体系中的功能

压缩包 `COMP` 可以包裹一组内部 OpenPGP 包。解压后得到新的 OpenPGP 包序列。

### 2.4 Conversion to Base64：ASCII Armor

#### 讲了什么

OpenPGP 对象本质上是任意 8-bit 字节流，但很多通道只适合传输可打印文本。因此 OpenPGP 定义 ASCII Armor，即把二进制 OpenPGP 对象编码成 Base64 文本并加上头尾标记。

#### 意义

这使 OpenPGP 数据可以通过邮件正文、论坛、剪贴板、文本文件等通道传输。

#### 例子

你常见的：

```text
-----BEGIN PGP MESSAGE-----
...
-----END PGP MESSAGE-----
```

这不是加密算法本身，而是外层文本包装。

### 2.5 Signature-Only Applications：只签名应用

#### 讲了什么

OpenPGP 原本设计为同时支持加密和签名，但现实中存在只需要签名的应用。例如软件包校验、Git tag 签名、发布声明等。

#### 意义

这说明 OpenPGP 可以作为通用签名格式使用，不必总是和加密绑定。

---

## 3. Data Element Formats：基础数据元素

### 这一部分讲了什么

这一章定义 OpenPGP 内部最基础的数据表示：整数、大整数、Key ID、fingerprint、文本、时间、keyring、S2K 等。

### 意义是什么

这是 OpenPGP 的“字节级基础设施”。如果第 4 章的 packet 是结构层，那么第 3 章就是字段层。

### 3.1 Scalar Numbers：标量整数

OpenPGP 中的标量整数是无符号整数，使用 big-endian，即网络字节序。

意义：不同平台必须对同一字节串解释出同一数值。

例子：

```text
2 字节：n[0] << 8 + n[1]
4 字节：n[0] << 24 + n[1] << 16 + n[2] << 8 + n[3]
```

### 3.2 Multiprecision Integers：MPI 大整数

#### 讲了什么

MPI 用来编码密码学里的大整数，例如 RSA 模数、DSA 参数、签名值等。

MPI 格式：

```text
2 字节 bit length
后续若干字节整数内容，big-endian
```

#### 文档例子解释

```text
[00 00]
```

表示 bit length = 0，因此值为 0。

```text
[00 01 01]
```

表示 bit length = 1，后面的整数是 `0x01`，值为 1。

```text
[00 09 01 FF]
```

表示 bit length = 9，后面的整数是 `0x01FF`，二进制为 9 位，值为 511。

错误例子：

```text
[00 02 01]
```

它声称长度是 2 bit，但 `0x01` 的最高非零位只有 1 bit，所以规范说应编码为：

```text
[00 01 01]
```

#### 在体系中的功能

MPI 是传统公钥算法参数和签名值的基础表示。即使某些 ECC 数据不是数学整数，规范中也可能用 MPI 的外壳编码它们。

### 3.2.1 用 MPI 编码其他数据

某些地方用 MPI 承载非整数数据，例如 EC point 或固定长度 octet string。关键是 wire representation 相同：先有 bit length，再有最短字节表示。

意义：OpenPGP 历史上大量结构围绕 MPI 设计，ECC 引入后继续利用 MPI 作为兼容外壳。

### 3.3 Key IDs and Fingerprints

#### 讲了什么

- Key ID 是 8 字节标识符。
- Fingerprint 更长，更接近全局唯一。
- 不同版本密钥的 Key ID 与 fingerprint 计算方式不同。

#### 意义

Key ID 是短标识，便于查找；fingerprint 是更可靠的身份校验材料。

#### 在体系中的功能

- v3 PKESK 用 Key ID 标识接收者。
- v6 PKESK 使用 fingerprint 标识接收者。
- 签名子包中可以包含 Issuer Fingerprint。
- 用户人工比对时应优先使用 fingerprint，而不是 Key ID。

### 3.4 Text

默认文本编码是 UTF-8。

意义：避免不同本地字符集造成签名验证失败或身份字符串歧义。

### 3.5 Time Fields

时间字段是 4 字节无符号整数，表示从 1970-01-01 00:00:00 UTC 起经过的秒数。

用途包括：

- 密钥创建时间。
- 签名创建时间。
- 密钥或签名有效期计算。
- Literal Data Packet 中的文件时间戳字段。

### 3.6 Keyrings

Keyring 是一个或多个密钥的集合，可以是文件，也可以是数据库。

意义：RFC 承认实现中会有“密钥环”概念，但具体数据库结构不属于本文档范围。

### 3.7 String-to-Key, S2K

#### 讲了什么

S2K 是把用户口令转换为对称密钥的机制。它用于两个地方：

1. 保护私钥的 secret key material。
2. 生成基于口令的对称加密消息。

#### 意义

用户输入的 passphrase 通常不是高熵密钥。S2K 负责把口令变成可用于加密的密钥，并提高暴力破解成本。

### 3.7.1 S2K 类型

RFC 9580 定义了四类：

| 类型 | 名称 | 新数据是否应生成 | 宏观理解 |
|---|---|---:|---|
| 0 | Simple S2K | 不应生成 | 直接 hash 口令，太弱 |
| 1 | Salted S2K | 仅高熵字符串场景 | 加 salt，但仍不够强 |
| 3 | Iterated and Salted S2K | 可生成 | 加 salt 且重复 hash，提高成本 |
| 4 | Argon2 | 推荐 | 具备 memory-hardness，抵抗 GPU/ASIC 暴力破解更好 |

### Simple S2K

直接 hash passphrase。若 hash 输出不够长，就用多个 hash context 拼接输出。

意义：历史兼容，不适合新数据。

### Salted S2K

把 8 字节 salt 放在 passphrase 前一起 hash。

意义：同一个口令在不同对象中得到不同派生密钥，降低预计算字典攻击效果。

### Iterated and Salted S2K

把 salt + passphrase 重复输入 hash，直到达到编码的 octet count。

意义：让攻击者每猜一次口令都要付出更多计算成本。

注意：这里的 count 是“要 hash 的字节数”，不是普通意义上的“迭代轮数”。

### Argon2

使用 Argon2id，带 16 字节 salt、passes、parallelism、memory size。

意义：Argon2 是 memory-hard KDF，攻击者不仅需要算力，还需要大量内存。

#### 文档例子解释

RFC 给出 Argon2 S2K 示例：

```text
04 XX ... XX 01 04 15
```

可解释为：

- `04`：S2K 类型是 Argon2。
- 中间 16 个 `XX`：随机 salt。
- `01`：passes t = 1。
- `04`：parallelism p = 4。
- `15`：memory size exponent = 0x15 = 21，因此内存大小是 `2^21 KiB`。

这不是密文，而是描述“如何从 passphrase 派生密钥”的参数块。

### 3.7.2 S2K 使用位置

#### Secret Key Encryption

私钥包中有一个 S2K usage octet，用来说明 secret material 是否被 passphrase 保护，以及用何种方式保护。

关键值：

- `0`：不加密私钥材料。
- `253`：AEAD 保护，现代推荐方向。
- `254`：CFB + SHA-1 检查。
- `255`：MalleableCFB，已不推荐。

意义：OpenPGP 的私钥文件不是简单保存裸私钥，通常会通过 passphrase + S2K + 对称加密保护。

#### Symmetric Key Message Encryption

SKESK 包允许消息用 passphrase 解密，也允许同一消息同时支持 public-key 解密与 passphrase 解密。

例子：

```text
PKESK for Bob
SKESK for shared passphrase
SEIPD encrypted body
```

Bob 可用私钥解密；知道共享口令的人也可通过 SKESK 解密。

---

## 4. Packet Syntax：包语法

### 这一部分讲了什么

OpenPGP 对象由 packet 组成。每个 packet 有：

```text
packet header
packet body
```

header 中包含 packet type 和 body length。解析时，packet header 中的长度是确定边界的权威来源。

### 意义是什么

这是 OpenPGP 的结构核心。只要理解 packet，就能理解 OpenPGP 的大部分对象。

### 在体系中提供什么功能

它提供：

- 如何识别一个 packet 的类型。
- 如何知道 packet body 多长。
- 如何支持流式数据。
- 如何处理 legacy packet。
- 如何处理未知 packet。

### 4.1 Overview

一个 OpenPGP Message、keyring、certificate、detached signature 都是 packet 序列。

某些 packet 内部还包含新的 packet 序列。例如：

```text
Compressed Data Packet
  └─ 解压后得到 Literal Data Packet / Signature Packet / ...
```

或：

```text
SEIPD Packet
  └─ 解密后得到内部 OpenPGP Message
```

### 4.2 Packet Headers

OpenPGP 有两类 packet header：

1. 当前 OpenPGP 格式。
2. Legacy 格式。

当前格式中首字节：

```text
bit 7 = 1
bit 6 = 1
bits 5..0 = Packet Type ID
```

Legacy 格式中 bit 6 = 0，并且只有 4 bit 表示 packet type，因此只能表示较小类型号。

意义：现代实现应该生成当前格式，但可能要读取 legacy 格式以兼容历史数据。

### 4.2.1 OpenPGP Format Packet Lengths

OpenPGP 格式支持四种长度编码：

| 长度编码 | 范围 | 用途 |
|---|---:|---|
| 1-octet | 0 到 191 | 小包 |
| 2-octet | 192 到 8383 | 中等包 |
| 5-octet | 到 2^32-1 | 大包 |
| Partial Body Length | 不预先知道总长度 | 流式处理 |

### 文档长度例子解释

#### 例 1：长度 100

```text
0x64
```

因为 100 < 192，直接用一个字节表示。

#### 例 2：长度 1723

```text
0xC5 0xFB
```

它属于 192 到 8383 范围，用 2 字节形式。计算方式是：

```text
((0xC5 - 192) << 8) + 0xFB + 192 = 1723
```

#### 例 3：长度 100000

```text
0xFF 0x00 0x01 0x86 0xA0
```

`0xFF` 表示后面跟 4 字节长度，`0x000186A0` 十进制就是 100000。

#### Partial Body Length 例子

RFC 还给出一种把 100000 字节拆成多个片段的方式：

```text
32768 字节
2 字节
1 字节
65536 字节
1693 字节
```

前面若干段用 partial length，最后一段必须用普通 length。意义是支持生成者不知道总长度时仍能流式输出数据。

### 4.2.2 Legacy Format Packet Lengths

Legacy 格式支持 1、2、4 字节长度，也支持 indeterminate length。

意义：只为兼容历史数据。现代实现不应生成 indeterminate legacy packet。

### 4.3 Packet Criticality

Packet Type ID 分成 critical 和 non-critical：

- 0 到 39：critical。
- 40 到 63：non-critical。

规则：

- 遇到未知 critical packet：必须拒绝整个 packet sequence。
- 遇到未知 non-critical packet：必须忽略。

意义：这是向前兼容机制。新功能如果不可忽略，就放 critical 区；如果可忽略，就放 non-critical 区。

---

## 5. Packet Types：OpenPGP 的核心包类型

### 这一部分讲了什么

第 5 章定义 OpenPGP 的全部核心 packet 类型。这是 RFC 9580 最大、最重要的一章。

### 意义是什么

如果说 OpenPGP 是一个“文件格式协议”，packet type 就是它的语法构件。每个包承担一种功能：加密会话密钥、签名、保存密钥、保存明文、保存压缩数据、保存用户身份等。

### 主要 packet 一览

| Type ID | 名称 | 简写 | 作用 |
|---:|---|---|---|
| 1 | Public Key Encrypted Session Key | PKESK | 用公钥保护 session key |
| 2 | Signature | SIG | 签名与认证声明 |
| 3 | Symmetric Key Encrypted Session Key | SKESK | 用口令派生密钥保护 session key |
| 4 | One-Pass Signature | OPS | 流式签名验证辅助 |
| 5 | Secret Key | SECKEY | 主私钥包 |
| 6 | Public Key | PUBKEY | 主公钥包 |
| 7 | Secret Subkey | SECSUBKEY | 私有子密钥 |
| 8 | Compressed Data | COMP | 压缩后的内部包序列 |
| 9 | Symmetrically Encrypted Data | SED | 旧式无完整性保护加密包，废弃 |
| 10 | Marker | MARKER | 历史标记，忽略 |
| 11 | Literal Data | LIT | 实际文件或文本内容 |
| 12 | Trust | TRUST | 本地 keyring 信任信息，不导出 |
| 13 | User ID | UID | 文本身份，例如姓名邮箱 |
| 14 | Public Subkey | PUBSUBKEY | 公共子密钥 |
| 17 | User Attribute | UAT | 用户属性，例如图片 |
| 18 | SEIPD | SEIPD | 完整性保护的加密数据 |
| 21 | Padding | PADDING | 填充，抵抗流量分析 |

---

### 5.1 PKESK：Public Key Encrypted Session Key Packet

#### 讲了什么

PKESK 保存“用接收者公钥加密后的 session key”。一个加密消息可以有多个 PKESK，每个对应一个接收者。

#### 意义

它把“消息正文加密”和“接收者授权”分离开：正文只加密一次，会话密钥可以分别加密给多个接收者。

#### 在体系中的功能

典型结构：

```text
PKESK for recipient A
PKESK for recipient B
SEIPD encrypted message
```

接收者找到能用自己私钥解开的 PKESK，得到 session key，再解开 SEIPD。

#### v3 与 v6 PKESK

- v3 PKESK：用于 v1 SEIPD；用 8 字节 Key ID 标识接收者。
- v6 PKESK：用于 v2 SEIPD；用 key version + fingerprint 标识接收者，也支持匿名接收者。

版本必须和 SEIPD 版本配套：

```text
v3 PKESK ↔ v1 SEIPD
v6 PKESK ↔ v2 SEIPD
```

#### 算法字段

PKESK 针对不同公钥算法有不同字段：

- RSA：保存 `m^e mod n` 的 MPI。
- Elgamal：保存两个 MPI，但现代不应生成。
- ECDH：保存临时 EC 公钥和封装后的 session key。
- X25519：保存 32 字节 ephemeral public key 和 AES key wrap 后的 session key。
- X448：类似 X25519，但 56 字节公钥，使用 SHA-512 HKDF 与 AES-256 key wrap。

#### 匿名接收者

PKESK 可以不暴露具体 Key ID 或 fingerprint。接收者实现需要尝试所有可用私钥。这减少流量分析，但增加解密尝试成本。

---

### 5.2 Signature Packet：签名包

#### 讲了什么

Signature Packet 表示某把公钥与某段数据之间的绑定关系。

这段数据可能是：

- 文件或文本。
- User ID 与 public key 的绑定。
- 子密钥与主密钥的绑定。
- 密钥撤销声明。
- 第三方对某个签名的确认。

#### 意义

OpenPGP 的“认证体系”主要靠签名包构建。签名不仅是“签文件”，也是“签身份”和“签密钥结构”。

#### 签名版本

- v3 Signature：历史格式，不应新生成。
- v4 Signature：RFC 4880 时代的常见格式。
- v6 Signature：现代格式，支持更宽 subpacket length，且加入随机 salt。

对应关系：

```text
v4 key → v4 signature
v6 key → v6 signature
```

### 5.2.1 Signature Types：签名类型

签名类型决定签名的语义。

| 类型 | 名称 | 语义 |
|---:|---|---|
| 0x00 | Binary Signature | 对二进制文档签名 |
| 0x01 | Text Signature | 对规范化换行后的文本签名 |
| 0x02 | Standalone Signature | 只签自己的子包内容 |
| 0x10 | Generic Certification | 泛泛认证某 User ID 属于某 key |
| 0x11 | Persona Certification | 未做身份核验的认证 |
| 0x12 | Casual Certification | 做过普通/随意核验 |
| 0x13 | Positive Certification | 做过较强核验 |
| 0x18 | Subkey Binding | 主密钥声明拥有某子密钥 |
| 0x19 | Primary Key Binding | 签名子密钥反向声明属于主密钥 |
| 0x1F | Direct Key Signature | 直接给 key 附加属性或策略 |
| 0x20 | Key Revocation | 撤销主密钥 |
| 0x28 | Subkey Revocation | 撤销子密钥 |
| 0x30 | Certification Revocation | 撤销认证签名 |
| 0x40 | Timestamp Signature | 时间戳签名 |
| 0x50 | Third-Party Confirmation | 对另一个签名作确认，类似公证 |

#### 重要理解

OpenPGP 的“证书”不是 CA 签出来的单一证书，而是很多签名包堆叠出来的结构：

```text
Public Key
  ├─ Self-signature: 我声明这个 User ID 属于我
  ├─ Third-party certification: 其他人也相信这个 User ID 属于这把 key
  ├─ Subkey binding: 我声明这个子密钥属于我
  └─ Revocation: 我撤销某个 key / User ID / subkey / certification
```

### 5.2.3 Signature Subpackets：签名子包

v4/v6 签名包中有 hashed subpackets 和 unhashed subpackets。

- Hashed subpackets：被签名覆盖，可信。
- Unhashed subpackets：不被签名覆盖，只能作提示信息。

#### 意义

Signature Packet 本身不仅保存签名值，还保存大量元信息，例如：

- 签名创建时间。
- 签名过期时间。
- 签发者 fingerprint。
- 密钥有效期。
- 算法偏好。
- 是否可导出认证。
- 信任签名。
- key flags。
- 撤销原因。
- 支持的特性。
- 预期接收者 fingerprint。

#### 关键子包

| 子包 | 功能 |
|---|---|
| Signature Creation Time | 签名创建时间，必须在 hashed 区 |
| Issuer Fingerprint | 标识签名者 fingerprint |
| Key Expiration Time | 密钥有效期 |
| Preferred AEAD Ciphersuites | 接收者偏好的 AEAD 加密组合 |
| Preferred Hash Algorithms | 偏好的 hash 算法 |
| Preferred Compression Algorithms | 偏好的压缩算法 |
| Key Flags | 说明 key 可用于认证、签名、加密、认证登录等 |
| Reason for Revocation | 撤销原因 |
| Features | 声明支持 v1/v2 SEIPD 等高级能力 |
| Intended Recipient Fingerprint | 防止签名被转发到非预期加密上下文 |

#### 文档例子：Preferred AEAD Ciphersuites

RFC 给出 6 字节示例：

```text
09 02 09 03 13 02
```

它按两个字节一组解释：

```text
09 02 = AES-256 + OCB
09 03 = AES-256 + GCM
13 02 = Camellia-256 + OCB
```

并且如果没有显式列出 AES-128 + OCB，它会被隐式放在最后，因为这是 mandatory-to-implement 组合。

### 5.2.3.10 Self-Signatures：自签名

自签名是 OpenPGP 证书结构的关键。

作用包括：

- 证明 User ID 属于该主密钥。
- 证明 subkey 属于该主密钥。
- 记录算法偏好、特性、key flags、过期时间等。

v6 key 推荐把整体 key 信息放在 Direct Key self-signature，而不是 User ID self-signature。这能减少攻击者剥离 User ID self-signature 后隐藏过期时间或算法偏好的风险。

### 5.2.4 Computing Signatures：签名计算

签名不是只 hash 文件内容。OpenPGP 会把以下内容组合进 hash：

- 被签名数据。
- 签名包中从 version 到 hashed subpacket 的元数据。
- trailer。
- v6 签名还先 hash 随机 salt。

意义：防止同一个签名被重新解释为其他版本或其他类型的签名。

#### 文本签名的特殊点

Text Signature 会先把行尾规范化为 `<CR><LF>`，并以 UTF-8 编码后再 hash。

这解释了为什么同一个文本文件在不同系统上换行不同也可能验证一致，但也说明如果 whitespace 有语义，就要小心。

### 5.2.5 Malformed and Unknown Signatures

未知或畸形签名不能被当成验证成功，但也不应中止整个 packet stream 的处理。这允许一个消息中有多个签名，其中某些签名因新算法或格式无法识别，其他签名仍可验证。

---

### 5.3 SKESK：Symmetric Key Encrypted Session Key Packet

#### 讲了什么

SKESK 用 passphrase 派生出的密钥保护 session key。

#### 意义

它让 OpenPGP 支持“口令加密消息”。同时，一个消息可以混合 PKESK 和 SKESK：

```text
PKESK for Alice
SKESK for shared passphrase
SEIPD encrypted body
```

#### v4 与 v6

- v4 SKESK：配 v1 SEIPD。
- v6 SKESK：配 v2 SEIPD，使用 AEAD 保护 session key。

#### 文档例子：v6 SKESK Additional Data

RFC 举例：AES-128 + OCB 的 additional data 是：

```text
0xC3 0x06 0x07 0x02
```

含义：

- `0xC3`：OpenPGP 格式编码的 Packet Type ID 3，即 SKESK。
- `0x06`：SKESK version 6。
- `0x07`：AES-128。
- `0x02`：OCB。

这类 additional data 的作用是把上下文也绑定进认证，防止同一密文被挪到另一个语义位置使用。

---

### 5.4 One-Pass Signature Packet：一遍式签名包

#### 讲了什么

普通签名可能在数据之后出现；OPS 放在数据之前，让接收者在读取流的过程中就开始计算 hash。

结构：

```text
One-Pass Signature Packet
OpenPGP Message
Corresponding Signature Packet
```

#### 意义

支持大文件或流式数据签名验证，不必先缓存整个文件。

#### 多个 OPS 的括号结构

如果有多个 one-pass signatures，最后出现的 Signature Packet 对应最靠近数据前面的 OPS 的相反顺序。可以理解为栈结构：

```text
OPS A
OPS B
Data
SIG B
SIG A
```

---

### 5.5 Key Material Packets：密钥材料包

#### 讲了什么

定义公钥、私钥、子密钥的包格式。

四类：

| 包 | 作用 |
|---|---|
| Public Key Packet | 主公钥，开启一个 OpenPGP certificate |
| Public Subkey Packet | 公共子密钥 |
| Secret Key Packet | 主私钥，包含公钥字段和 secret material |
| Secret Subkey Packet | 私有子密钥 |

### 5.5.2 Public Key Packet Formats

#### 版本

- v3：强烈废弃。
- v4：RFC 4880 时代主流，但 RFC 9580 中已 deprecated，不建议新生成。
- v6：推荐新生成。

#### v3 弱点

v3 Key ID 是 RSA modulus 的低 64 位，容易构造碰撞；fingerprint 使用 MD5，且格式存在额外碰撞风险。

#### v4

v4 包含：

```text
version = 4
creation time
public key algorithm
algorithm-specific public key material
```

fingerprint 是 SHA-1 over normalized public key packet。

#### v6

v6 类似 v4，但增加 public key material 的长度字段，帮助在未知算法情况下解析 secret key packet。

```text
version = 6
creation time
public key algorithm
public key material length
public key material
```

fingerprint 是 SHA-256 over normalized public key packet。

### 5.5.3 Secret Key Packet Formats

Secret Key Packet = Public Key Packet 字段 + secret key material。

secret material 通常被 passphrase 保护。保护方式由 S2K usage octet 说明。

#### 现代方向

- v6 secret key 更强调长度字段和 AEAD。
- Argon2 只能和 AEAD S2K usage 253 搭配。
- 旧的 checksum 和 malleable CFB 不应新生成。

#### 文档例子：AEAD 保护 secret key 的 Additional Data

RFC 举例说明，保护 secret key material 时，AEAD 的 additional data 包含 packet type、version、creation time、algorithm、public key 参数等。

以 v4 Secret Key Packet 为例，additional data 以：

```text
0xC5 0x04 ...
```

开头：

- `0xC5`：OpenPGP 编码的 Secret Key Packet Type ID 5。
- `0x04`：key version 4。
- 后面跟创建时间、算法 ID、公钥参数。

意义：私钥加密不仅保护 secret material，还把它绑定到对应 public key 上，防止被替换或错配。

### 5.5.4 Key IDs and Fingerprints

| Key version | Fingerprint | 长度 | Key ID |
|---:|---|---:|---|
| v3 | MD5 over RSA MPIs | 128 bit | RSA modulus 低 64 位 |
| v4 | SHA-1 over normalized pubkey packet | 160 bit | fingerprint 低 64 位 |
| v6 | SHA-256 over normalized pubkey packet | 256 bit | fingerprint 高 64 位 |

#### 文档例子：Ed25519 v4/v6 fingerprint 材料

v4 Ed25519 fingerprint hash 材料概念上是：

```text
0x99
2 字节长度
version = 4
creation time
algorithm = 27
32 字节 Ed25519 public key
```

v6 Ed25519 fingerprint hash 材料概念上是：

```text
0x9B
4 字节长度
version = 6
creation time
algorithm = 27
4 字节 key material 长度
32 字节 Ed25519 public key
```

意义：同样的 RSA 数学材料如果编码成 v3/v4/v6 key，也会有不同 Key ID 和 fingerprint。

### 5.5.5 Algorithm-Specific Parts of Keys

不同算法的 key material 不同。

| 算法 | 公钥材料 | 私钥材料 |
|---|---|---|
| RSA | n, e | d, p, q, u |
| DSA | p, q, g, y | x |
| Elgamal | p, g, y | x |
| ECDSA | curve OID + EC point | scalar |
| ECDH | curve OID + EC point + KDF params | scalar |
| X25519 | 32 字节 public key | 32 字节 native secret key |
| X448 | 56 字节 public key | 56 字节 native secret key |
| Ed25519 | 32 字节 public key | 32 字节 native secret key |
| Ed448 | 57 字节 public key | 57 字节 native secret key |

宏观上：第 5.5.5 是算法适配层，把数学对象映射到 OpenPGP wire format。

---

### 5.6 Compressed Data Packet

#### 讲了什么

COMP 包保存压缩后的 packet 序列。

格式：

```text
compression algorithm octet
compressed data
```

#### 意义

压缩包不是压缩裸文本，而是压缩“一组 OpenPGP packet”。解压后继续按 packet stream 解析。

#### 支持算法

包括 ZIP/raw DEFLATE、ZLIB、BZip2 等。

---

### 5.7 Symmetrically Encrypted Data Packet：旧 SED

#### 讲了什么

SED 是旧式对称加密数据包，不提供完整性保护。

#### 意义

RFC 9580 明确说它 obsolete。实现不得新生成，通常应拒绝处理；若处理，必须警告用户。

#### 在体系中的功能

它主要用于历史兼容。现代加密消息应使用 SEIPD，尤其是 v2 SEIPD + AEAD。

---

### 5.8 Marker Packet

Marker Packet 内容是三个字节：

```text
0x50 0x47 0x50
```

即 UTF-8 文本 `PGP`。

意义：历史遗留，收到时必须忽略。

---

### 5.9 Literal Data Packet

#### 讲了什么

LIT 包保存真正的消息正文，即不再由 OpenPGP 进一步解释的数据。

格式包括：

```text
format octet
filename length + filename
timestamp
literal data
```

#### format octet

- `b`：二进制数据。
- `u`：UTF-8 文本数据。
- `t`：旧文本模式，已废弃，因为没有明确编码。

#### 意义

OpenPGP 的加密、压缩、签名容器最终通常包裹 Literal Data Packet。

#### 重要安全点

Literal Data Packet 的 format、filename、timestamp 不包含在普通文档签名 hash 中，不能当作被签名保护的可信元数据。

因此新生成时推荐：

```text
format = b，除非确定是 UTF-8 文本
filename = 空字符串
timestamp = 0
```

如果想签名文件名、权限、目录结构等元数据，应签一个归档文件，例如 pax/tar，而不是依赖 Literal Data Packet 字段。

### 5.9.1 `_CONSOLE`

历史上 filename `_CONSOLE` 表示 “for your eyes only”。RFC 9580 不推荐新生成，因为这个字段不可强制执行，也不受签名保护。

---

### 5.10 Trust Packet

Trust Packet 只用于本地 keyring，记录实现内部的信任信息。

意义：它不是可互操作的公共证书内容。导出给他人时不应包含；从非本地输入读取时应忽略。

---

### 5.11 User ID Packet

User ID 是 UTF-8 文本，通常约定为：

```text
Name <email@example.com>
```

但规范不强制其内容。

意义：User ID 是“人类身份标签”，它本身不证明属于某把 key。证明关系要靠 certification signature。

---

### 5.12 User Attribute Packet

User Attribute 是比 User ID 更通用的用户属性，可以包含非文本数据，例如图片。

#### Image Attribute Subpacket

图片属性子包有一个 image header。文档提到版本 1 的前三字节：

```text
0x10 0x00 0x01
```

注意这里 header length 是 little-endian，这是历史例外。当前定义的图片编码是 JPEG。

意义：OpenPGP certificate 可以携带头像等属性，但它们同样需要签名认证才有绑定意义。

---

### 5.13 SEIPD：Symmetrically Encrypted and Integrity Protected Data Packet

#### 讲了什么

SEIPD 是现代加密消息的核心容器。解密后得到内部 OpenPGP Message。

#### v1 SEIPD

v1 使用 CFB 模式加密，并使用 SHA-1 based MDC 检测修改。

宏观理解：

```text
随机前缀
明文 packet sequence
0xD3 0x14
SHA-1 MDC
```

全部一起加密。

MDC 不是签名，也不是强 MAC；它是比裸 CFB 更好的修改检测机制。

#### v2 SEIPD

v2 使用 AEAD，提供更严格的密文完整性保护。

格式包括：

```text
version = 2
cipher algorithm ID
AEAD algorithm ID
chunk size
32 字节 salt
encrypted chunks + tags
final summary tag
```

#### 意义

v2 SEIPD 是 RFC 9580 的现代加密核心。它把机密性与完整性绑定起来，解决旧式 CFB 加密可篡改的问题。

#### 文档例子：v2 SEIPD chunk additional data

RFC 举例：使用 EAX、AES-128、chunk size 为 `2^22` 时，第一个 chunk 的 additional data 是：

```text
0xD2 0x02 0x07 0x01 0x10
```

解释：

- `0xD2`：OpenPGP 格式编码的 Packet Type ID 18，即 SEIPD。
- `0x02`：SEIPD version 2。
- `0x07`：AES-128。
- `0x01`：EAX。
- `0x10`：chunk size octet，表示 `1 << (0x10 + 6) = 2^22` 字节。

#### EAX / OCB / GCM

这三个是 AEAD 模式：

| 模式 | nonce 长度 | tag 长度 | 说明 |
|---|---:|---:|---|
| EAX | 16 字节 | 16 字节 | AEAD 模式 |
| OCB | 15 字节 | 16 字节 | mandatory-to-implement |
| GCM | 12 字节 | 16 字节 | 常见 AEAD 模式 |

---

### 5.14 Padding Packet

Padding Packet 包含随机数据，用来抵抗流量分析。

典型位置：

- v6 Transferable Public Key 末尾。
- v2 SEIPD 内部消息末尾。

意义：加密不隐藏长度；padding 用来模糊长度信息。

---

## 6. Base64 Conversions：ASCII Armor

### 这一部分讲了什么

这一章定义如何把 OpenPGP 二进制对象编码为 ASCII Armor。

### 意义是什么

ASCII Armor 解决传输兼容性问题：OpenPGP 原始对象是任意字节流，而很多通道只适合可打印文本。

### 在体系中提供什么功能

它提供：

- Base64 包装。
- Armor Header Line。
- Armor Headers。
- Armor Tail Line。
- 可选 CRC24 checksum。

### 6.1 Optional Checksum

ASCII Armor 可以带一个 CRC24 footer，格式是 `=` 加 4 个 Base64 字符。

但 RFC 9580 明确弱化它：

- 不能因为 CRC 缺失、错误或不一致就拒绝 OpenPGP 对象。
- 新生成时通常不应生成 CRC24。
- v2 SEIPD、v6 signature-only armor、v6 key armor 等场景不得生成 CRC24 footer。

意义：CRC24 不是安全完整性保护。真正的完整性应由签名或 AEAD 提供。

### 6.2 Forming ASCII Armor

ASCII Armor 结构：

```text
-----BEGIN PGP ...-----
Armor Headers

Base64 data
optional checksum
-----END PGP ...-----
```

常见 header line：

| Header | 用途 |
|---|---|
| `BEGIN PGP MESSAGE` | 加密、签名或压缩文件 |
| `BEGIN PGP PUBLIC KEY BLOCK` | 公钥 |
| `BEGIN PGP PRIVATE KEY BLOCK` | 私钥 |
| `BEGIN PGP SIGNATURE` | 分离签名、MIME 签名、cleartext 签名 |

### Armor Headers

Armor Headers 是 key-value 形式，例如：

```text
Version: ...
Comment: ...
Hash: ...
Charset: ...
```

但这些 header 是 armor 的一部分，不是消息本体，通常不受签名保护。

#### Version

不推荐输出，除非调试并经用户同意，因为它泄露实现信息。

#### Comment

任意 UTF-8 文本，但传输中未必可靠。

#### Hash

主要为旧 cleartext signature 兼容而存在。验证时必须忽略其内容，真正使用签名包里指定的 hash algorithm。

#### Charset

OpenPGP 默认 UTF-8。Charset header 可以提供字符集提示，但实现可以忽略并假定 UTF-8。

---

## 7. Cleartext Signature Framework：明文签名框架

### 这一部分讲了什么

Cleartext Signature Framework 允许对可读文本签名，同时保持文本本身仍可直接阅读。

典型结构：

```text
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

明文内容
-----BEGIN PGP SIGNATURE-----
...
-----END PGP SIGNATURE-----
```

### 意义是什么

它适合签署声明、公告、纯文本邮件等，让人不需要解码 OpenPGP 包也能看到文本内容。

### 在体系中提供什么功能

它是 text signature 的一种外层显示框架，签名实际仍是 Signature Packet，只是明文不放在 Literal Data Packet 中，而是直接放在 ASCII armor 风格结构里。

### 7.1 Cleartext Signed Message Structure

关键规则：

- 明文签名按 text signature 处理。
- 行尾规范化为 `<CR><LF>`。
- 签名/验证前会去除每行末尾的空格和 tab。
- 在 header 与空行之间只允许规范的 Hash Armor Header。

### 7.2 Dash-Escaped Text

为避免明文中的行被误识别为 armor header，凡是以 `-` 开头的行都要 dash-escape。

例如明文行：

```text
-----BEGIN SOMETHING-----
```

会变成类似：

```text
- -----BEGIN SOMETHING-----
```

计算签名 hash 时使用的是原始 cleartext，而不是 dash-escaped 形式。

### 7.3 问题与限制

Cleartext Signature Framework 不适合所有文本。

主要问题：

1. 它会修剪每行尾部 whitespace。
2. 对 whitespace 有语义的格式可能被破坏。
3. 非常大的 cleartext signed message 不适合人类判断“哪些内容被签名覆盖”。
4. 某些 header 内容可能误导用户。

#### 文档例子：Unified Diff

RFC 提到 unified diff 中 whitespace 有语义。例如一行只有一个空格可能表示上下文空行，尾随空格的增删也可能是实际变更。Cleartext 签名会修剪尾随 whitespace，因此不适合安全签署这种文本。

更安全的选择：

- signed message。
- detached signature。

---

## 8. Regular Expressions：正则表达式

### 这一部分讲了什么

这一章定义 OpenPGP 中用于 Trust Signature scope 限制的正则表达式语法。

### 意义是什么

它服务于“信任签名 + 正则约束”的场景。例如你信任某个 introducer 只为某个域名下的邮箱做身份认证。

### 在体系中提供什么功能

它与 Signature Subpacket 中的 Regular Expression 子包配合使用，限制信任传递范围。

### 文档例子解释

RFC 提到 `[0-9]` 匹配任意十进制数字。

可以理解为：如果 trust signature 附带一个 regex，例如限制 User ID 必须匹配某个邮箱域名，那么只有符合该模式的 User ID 认证才继承信任。

---

## 9. Constants：常量与算法注册表

### 这一部分讲了什么

这一章定义 OpenPGP 中各种算法 ID 和常量：

- Public Key Algorithms。
- ECC Curves。
- Symmetric Key Algorithms。
- Compression Algorithms。
- Hash Algorithms。
- AEAD Algorithms。

### 意义是什么

OpenPGP packet 中存的是数字 ID，而不是算法名称。第 9 章是把这些数字 ID 解释成算法语义的注册表。

### 9.1 Public Key Algorithms

现代重点：

- Ed25519：签名 mandatory-to-implement。
- X25519：加密 mandatory-to-implement。
- Ed448、X448：should implement。

历史/废弃：

- RSA deprecated，但可读取。
- DSA deprecated，不应生成。
- Elgamal deprecated，不应生成。
- EdDSALegacy、Curve25519Legacy 仅历史兼容。

宏观理解：RFC 9580 把现代 OpenPGP 的默认方向从 RSA/DSA/Elgamal 转向 Ed25519/X25519 与 AEAD。

### 9.2 ECC Curves

列出 NIST P-256/P-384/P-521、Brainpool、Ed25519Legacy、Curve25519Legacy 等曲线 OID。

#### 文档例子：P-256 OID 截断

完整 DER 编码：

```text
06 08 2A 86 48 CE 3D 03 01 07
```

OpenPGP curve OID 表示去掉前两个 DER 字节：

```text
2A 86 48 CE 3D 03 01 07
```

意义：OpenPGP 存的是截断后的 OID body，不是完整 DER 对象。

### 9.3 Symmetric Key Algorithms

包括 AES、Camellia 等，也保留历史算法如 IDEA、TripleDES、CAST5 等。

宏观理解：现代实现应偏向 AES 与 AEAD 组合；旧算法主要为兼容。

### 9.4 Compression Algorithms

包括：

- Uncompressed。
- ZIP。
- ZLIB。
- BZip2。

### 9.5 Hash Algorithms

包括 SHA-2、SHA-3 等，也列出 MD5、SHA-1、RIPEMD-160 等历史算法。

现代方向：避免 MD5、SHA-1、RIPEMD-160。

### 9.6 AEAD Algorithms

包括 EAX、OCB、GCM。OCB 是 mandatory-to-implement。

---

## 10. Packet Sequence Composition：包序列组合规则

### 这一部分讲了什么

第 10 章定义哪些 packet 可以按什么顺序组合成合法 OpenPGP 对象。

它区分三类 packet sequence：

1. Transferable Public Keys / Transferable Secret Keys。
2. OpenPGP Messages。
3. Detached Signatures。

### 意义是什么

单个 packet 只是零件。第 10 章定义如何把零件组装成有效对象。

### 10.1 Transferable Public Keys：可传输公钥 / certificate

OpenPGP certificate 不是单独一个公钥，而是一个 packet sequence。

#### v6 certificate 结构

```text
Primary Key
  [Revocation Signature...]
   Direct Key Signature...
  [User ID or User Attribute
      [Certification Revocation Signature...]
      [Certification Signature...]]...
  [Subkey
      [Subkey Revocation Signature...]
       Subkey Binding Signature...]...
  [Padding]
```

意义：

- 主密钥在最前。
- v6 key 使用 Direct Key self-signature 存储算法偏好。
- User ID 是可选的。
- 子密钥必须由主密钥签名绑定。
- padding 可用于模糊证书长度。

#### v6 revocation certificate

v6 revocation certificate 必须包含 primary key 和 revocation signature：

```text
Primary Key
Revocation Signature
```

这与某些 v4 历史做法不同。

#### v4 certificate 结构

```text
Primary Key
  [Revocation Signature]
  [Direct Key Signature...]
  [User ID or User Attribute [Signature...]]...
  [Subkey [Subkey Revocation Signature...] Subkey Binding Signature...]...
```

v4 key 通常要求至少一个 User ID + self-signature，因为很多历史实现把 key preferences 放在 User ID self-signature 中。

#### v3 key 结构

v3 key 只有 RSA 主密钥、User ID、签名，不支持 subkey。已经废弃。

#### Common Requirements

主公钥必须在第一位。主密钥必须能签名，因为它需要产生 self-signature。子密钥可以用于加密、签名、认证等。

实践建议：不同用途使用不同 subkey：

```text
主密钥：认证 / 绑定 / 撤销
子密钥 A：签名数据
子密钥 B：加密通信
子密钥 C：认证登录
```

### 10.2 Transferable Secret Keys

私钥序列结构类似公钥证书，但 public key/subkey packet 替换为 secret key/secret subkey packet。

意义：OpenPGP 私钥导出也是 packet sequence，而不是裸私钥 blob。

### 10.3 OpenPGP Messages

RFC 给出消息语法。宏观上：

```text
OpenPGP Message
  = Encrypted Message
  | Signed Message
  | Compressed Message
  | Literal Message
```

#### Encrypted Message

```text
[ESK Sequence,] Encrypted Data
```

ESK 可以是 PKESK 或 SKESK。Encrypted Data 可以是 SED 或 SEIPD，但 SED 已废弃。

#### Signed Message

有两种形式：

```text
Signature Packet, OpenPGP Message
```

或 one-pass：

```text
One-Pass Signature Packet, OpenPGP Message, Corresponding Signature Packet
```

#### Unwrapping

解密 SEIPD 或解压 COMP 后，得到的新字节流必须继续解析为合法 OpenPGP packet sequence。

### 10.3.2 版本约束

ESK 与 SEIPD 版本必须匹配：

```text
v3 PKESK / v4 SKESK → v1 SEIPD
v6 PKESK / v6 SKESK → v2 SEIPD
```

签名版本也必须与 key version 匹配：

```text
v4 key → v4 Signature + v3 OPS
v6 key → v6 Signature + v6 OPS
```

### 10.4 Detached Signatures

Detached Signature 是与被签数据分开保存的 Signature Packet 序列。

例子：软件发布中：

```text
program.tar.gz
program.tar.gz.sig
```

`.sig` 文件只含签名包，被签数据在另一个文件中。

意义：适合软件包校验、文件发布、不可修改原文件格式的场景。

---

## 11. Elliptic Curve Cryptography：椭圆曲线密码学格式

### 这一部分讲了什么

第 11 章定义 OpenPGP 中 ECC 相关的曲线、点格式、标量格式、KDF 与 ECDH。

### 意义是什么

ECC 是现代 OpenPGP 的核心算法基础。RFC 9580 推荐 Ed25519/X25519，相关 wire format 需要明确规定，否则不同实现无法互操作。

### 11.1 ECC Curves

支持：

- NIST P-256/P-384/P-521。
- brainpoolP256r1/P384r1/P512r1。
- X25519/X448。
- Ed25519/Ed448。
- Legacy Curve25519/Ed25519Legacy。

v3 key 不允许使用 ECC。

### 11.2 EC Point Wire Formats

两类主要点格式：

```text
SEC1:            0x04 || x || y
Prefixed native: 0x40 || native
```

意义：点格式必须有前缀，使 MPI 的最高字节至少有一位为 1，从而保持固定大小编码。

### 11.3 EC Scalar Wire Formats

定义标量如何以 octet string 或 prefixed octet string 表示。

宏观理解：这是“私钥标量或曲线相关整数如何落到字节串”的规则。

### 11.4 Key Derivation Function

ECC 加密通常先通过密钥协商得到 shared secret，再用 KDF 产生对称密钥来包裹 session key。

### 11.5 ECDH Algorithm

ECDH 在 OpenPGP 中用于保护 session key。流程概念：

```text
发送方生成临时私钥
  ↓
临时私钥 × 接收者公钥 = shared secret
  ↓
KDF(shared secret, parameters) → key-encryption key
  ↓
用该 key 包裹 session key
  ↓
消息中放入临时公钥 + wrapped session key
```

X25519/X448 则有专门算法字段和 HKDF/AES key wrap 流程。

---

## 12. Notes on Algorithms：算法说明

### 这一部分讲了什么

第 12 章对算法选择、旧算法风险、PKCS#1 编码、CFB 模式、扩展策略等进行说明。

### 意义是什么

第 9 章列 ID，第 12 章解释如何安全理解这些算法，哪些应避免，哪些只是历史兼容。

### 12.1 PKCS#1 Encoding in OpenPGP

用于 RSA 加密、RSA 签名，以及旧 Elgamal 包装中的 PKCS#1 v1.5 编码。

意义：RSA 不是直接对原文整数做幂运算；需要带结构的 padding/encoding。

安全注意：PKCS#1 错误处理必须避免泄漏 oracle 信息。

### 12.2 Symmetric Algorithm Preferences

接收者可在 self-signature 中声明算法偏好。发送者应选择双方都支持且安全的算法。

意义：OpenPGP 的算法协商不是在线握手，而是通过 certificate 中的 preference subpackets 完成。

### 12.3 Other Algorithm Preferences

包括压缩偏好和 hash 偏好。

重要原则：接收者偏好不等于发送者必须使用弱算法。安全性判断仍由实现负责。

### 12.4 RSA

RSA 已 deprecated，不建议生成新 RSA key。弱 RSA key 尤其应避免。

宏观理解：RFC 9580 仍保留 RSA 兼容能力，但现代 OpenPGP 方向是 ECC。

### 12.5 DSA

DSA deprecated，不应生成。原因包括参数限制、老旧安全边界、现代替代算法更合适。

### 12.6 Elgamal

Elgamal deprecated，不应生成或加密。若读取历史 Elgamal 私钥解密，应给出弱安全警告。

### 12.7 EdDSA

OpenPGP 对 EdDSA 使用“预哈希”的方式：OpenPGP 签名流程先 hash 消息，然后把摘要作为 EdDSA 输入。

对于 Ed448，OpenPGP 使用空 context string。

### 12.8 Reserved Algorithm IDs

有些 ID 保留但未定义足够参数，不能实际实现。例如 X9.42、AEDH、AEDSA 等。

### 12.9 CFB Mode

定义 OpenPGP 中使用的 CFB 模式。历史 v1 SEIPD 和 SED 使用 CFB；现代 v2 SEIPD 使用 AEAD。

### 12.10 Private or Experimental Parameters

多个命名空间保留 100-110 作为 private/experimental use；packet type 60-63 也保留给 private/experimental。

意义：允许实验，但一旦广泛使用，应转入正式 IANA 管理，避免互操作混乱。

### 12.11 Meta Considerations for Expansion

如果扩展不是向后兼容的，应通过 Features signature subpacket 声明。

宏观理解：OpenPGP 的扩展策略是：

```text
新算法通常可向前兼容
新 packet 或不可忽略功能通常需要显式 feature signaling
```

---

## 13. Security Considerations：安全考虑

### 这一部分讲了什么

第 13 章列出实现 OpenPGP 时必须注意的安全问题。

### 意义是什么

OpenPGP 是老协议，历史格式很多。安全实现不仅要“按格式解析”，还要避免旧格式、弱算法和 oracle 行为带来的攻击。

### 13.1 SHA-1 Collision Detection

SHA-1 已不再碰撞安全，但 v4 fingerprint 需要 SHA-1，因此实现不能完全移除 SHA-1。

建议：检测已知 SHA-1 碰撞攻击迹象，将潜在不确定破坏转为显式拒绝。

### 13.2 Advantages of Salted Signatures

v6 signatures 加入随机 salt，且先 hash salt。

意义：

- 让签名非确定化。
- 减少 chosen-prefix collision 风险。
- 避免同一消息重复签名导致某些实现或硬件故障下泄漏签名密钥。

### 13.3 Elliptic Curve Side Channels

ECC scalar multiplication 可能有侧信道风险。尤其当应用变成远程 decryption/signing oracle 时，需要限速、时间盲化、失败次数控制等。

### 13.4 Risks of a Quick Check Oracle

v1 SEIPD 和 SED 中的 quick check 原本用于快速发现错误 session key 或错误 passphrase。但如果错误信息或时序暴露给攻击者，就可能形成 oracle。

建议：不要把 quick check 的结果以可被攻击者区分的方式暴露。

### 13.5 Avoiding Leaks from PKCS#1 Errors

RSA/PKCS#1 解码错误不能暴露细节，否则可能形成 padding oracle。

宏观原则：错误处理要常量时间或至少不可区分，不要告诉攻击者“具体哪里错了”。

### 13.6 Fingerprint Usability

Fingerprint 比 Key ID 更可靠，但用户人工比对长 fingerprint 也容易出错。

意义：UI/UX 不能只显示短 Key ID 并让用户信任。

### 13.7 Avoiding Ciphertext Malleability

旧 SED 和裸 CFB 可篡改。现代实现应选择完整性保护容器：

- v2 SEIPD + AEAD 优先。
- v1 SEIPD 可兼容。
- SED 不应生成。

### 13.8 Secure Use of v2 SEIPD Session-Key-Reuse Feature

v2 SEIPD 的设计允许在某些场景重用 ESK 并更换 salt，以派生不同 message key。但实现必须谨慎，避免密钥/nonce 重用风险。

### 13.9 Escrowed Revocation Signatures

Revocation Key 子包已废弃。若要委托撤销能力，可预先生成并托管 revocation signature。

宏观理解：与其在证书里声明“某 key 可撤销我”，不如预先生成撤销签名并安全保存。

### 13.10 Random Number Generation and Seeding

OpenPGP 强依赖随机数：session key、salt、nonce、签名 salt、padding 等都需要高质量随机性。

随机数差会破坏整个系统。

### 13.11 Traffic Analysis

加密不隐藏元数据，例如消息长度、接收者数量、时间等。Padding Packet 和匿名接收者可缓解部分流量分析。

### 13.12 Surreptitious Forwarding

攻击者可能把一份签名内容转发给非预期接收者，使签名在错误上下文中仍看似有效。

Intended Recipient Fingerprint 子包用于把签名限制在指定加密接收者上下文中。

### 13.13 Hashed vs. Unhashed Subpackets

unhashed subpacket 不受签名保护，不应承载安全关键含义。

原则：安全关键元信息必须放 hashed subpacket。

### 13.14 Malicious Compressed Data

压缩数据可能导致资源耗尽，例如解压后极大。实现应限制资源、流式处理并防御压缩炸弹。

---

## 14. Implementation Considerations：实现考虑

### 这一部分讲了什么

这一章主要讨论实现时的兼容问题，尤其是 legacy fingerprint storage 与 v6 key 的交互。

### 意义是什么

RFC 9580 引入 v6 fingerprint，长度和计算方式都变化。旧系统可能只保存短 fingerprint 或按 v4 假设设计，需要迁移策略。

### 在体系中提供什么功能

它不定义新密码对象，而是提醒实现者：升级格式时要注意旧数据库、旧 UI、旧索引结构对 fingerprint 长度和 Key ID 的假设。

---

## 15. IANA Considerations：注册表管理

### 这一部分讲了什么

这一章说明 OpenPGP 相关的 IANA 注册表如何命名、更新、移除、添加，以及哪些字段采用何种注册策略。

### 意义是什么

OpenPGP 是可扩展协议。算法 ID、packet type、signature subpacket type 等都不能随意占用，否则会破坏互操作。

### 在体系中提供什么功能

它为未来扩展提供治理机制：

- 新算法如何注册。
- 新 packet type 如何注册。
- 哪些范围可 private/experimental use。
- 哪些变更需要 RFC required。
- designated experts 如何评审。

---

## 16. References：参考文献

### 这一部分讲了什么

分为 normative references 和 informative references。

### 意义是什么

OpenPGP 不是孤立规范，它依赖许多其他标准：

- RFC 2119 / RFC 8174：规范术语。
- RFC 4648：Base64。
- RFC 5869：HKDF。
- RFC 7748：X25519/X448。
- RFC 8032：Ed25519/Ed448。
- RFC 9106：Argon2。
- NIST/FIPS 文档：DSA/ECDSA、GCM、CFB 等。

### 在体系中的功能

这些引用说明 OpenPGP 自己规定“如何组合和编码”，但底层算法细节很多来自外部密码学标准。

---

## Appendix A. Test Vectors：测试向量

### 这一部分讲了什么

附录 A 提供大量测试向量，供实现者验证自己的编码、签名、加密、解密是否与规范一致。

### 意义是什么

对协议实现而言，测试向量非常重要。即使你理解了文字规范，也可能在字节序、长度字段、hash trailer、AEAD additional data、salt、nonce、MPI 编码等细节上出错。测试向量用于发现这些错误。

### 主要测试内容

包括：

- v4 Ed25519Legacy key。
- v4 Ed25519Legacy signature。
- v6 certificate。
- v6 secret key。
- passphrase-locked v6 secret key。
- cleartext signed message。
- inline-signed message。
- X25519 + AEAD-OCB 加密解密。
- AEAD-EAX / OCB / GCM 加密解密。
- 使用 Argon2 的对称加密消息。

### 如何理解这些例子

#### A.3 Sample Version 6 Certificate

这是一个完整 v6 transferable public key 示例。它展示：

```text
Primary Key
Direct Key Signature
User ID / User Attribute 可选
Subkey + Binding Signature
```

重点不是记住字节串，而是理解 v6 certificate 的自签名结构和 fingerprint/signature 计算方式。

#### A.3.1 Hashed Data Stream for Signature Verification

这个例子展示验证签名时实际 hash 的字节流。

意义：OpenPGP 签名验证不是“只 hash 原文”，而是 hash 原文 + packet-specific prefix + signature metadata + trailer。这个测试向量用于确认实现是否按规范拼接 hash input。

#### A.4 / A.5 Secret Key 示例

A.4 是未锁定或普通 v6 secret key 示例；A.5 是 passphrase locked v6 secret key 示例。

重点是观察：

- public key fields 仍然存在。
- secret material 在后面。
- S2K parameters 描述如何从 passphrase 派生 key。
- AEAD tag 或旧式检查值用于验证解密结果。

#### A.6 Cleartext Signed Message

展示 cleartext signature 的外观。重点：

- 明文本身可读。
- 签名在后面 ASCII armored signature 中。
- 验证时要处理 dash escaping、行尾规范化和尾随空白修剪。

#### A.7 Inline-Signed Message

inline signed message 与 cleartext signed message 不同：它是 OpenPGP packet sequence 内部的 signed message，明文通常在 Literal Data Packet 中。

宏观区别：

```text
Cleartext signature: 人类可直接读文本 + armored signature
Inline signed message: OpenPGP packet 序列中的签名消息
Detached signature: 签名文件与被签文件分开
```

#### A.8 X25519-AEAD-OCB Encryption and Decryption

这是现代公钥加密路径示例：

```text
v6 PKESK: X25519 保护 session key
v2 SEIPD: AEAD-OCB 加密正文
```

重点：

- X25519 用来协商/派生 key-encryption key。
- session key 被包裹。
- 正文用 AEAD-OCB 以 chunk 方式加密并认证。

#### A.9 / A.10 / A.11 AEAD-EAX/OCB/GCM

这些示例展示不同 AEAD mode 下 SKESK + SEIPD 的解密过程。

重点：不同 AEAD mode 的 nonce 长度、tag 计算和 additional data 不同，但 packet 层语义相同。

#### A.12 Argon2 对称消息

这些示例展示使用 Argon2 S2K 的 v4 SKESK，分别配 AES-128、AES-192、AES-256。

意义：验证实现是否能正确解析 Argon2 S2K 参数，并从 passphrase 派生正确密钥。

---

## Appendix B. Upgrade Guidance：从 RFC 4880 / 6637 升级

### 这一部分讲了什么

附录 B 总结 RFC 9580 相对旧规范的重要新增和变化。

### 意义是什么

它是实现者的升级清单，也能帮助学习者理解“现代 OpenPGP”相对“旧 OpenPGP”的方向。

### 关键升级点

#### 新的/推荐的公钥签名算法

- Ed25519：mandatory-to-implement。
- Ed448。
- EdDSALegacy：历史兼容。
- Brainpool ECDSA。

#### 新的/推荐的公钥加密算法

- X25519：mandatory-to-implement。
- X448。
- ECDH with legacy/brainpool curves。

#### AEAD 加密

包括：

- v2 SEIPD。
- OCB mandatory-to-implement。
- EAX、GCM。
- v6 PKESK。
- v6 SKESK。
- Preferred AEAD Ciphersuites 子包。
- Features 子包中声明 v2 SEIPD 支持。
- secret key encryption 使用 AEAD S2K usage。

#### v6 keys and signatures

包括：

- v6 public keys。
- v6 fingerprints and Key IDs。
- v6 secret keys。
- v6 signatures。
- v6 one-pass signatures。

#### Certificate 结构变化

- v6 推荐在 Direct Key signature 中保存 preferences。
- v6 revocation certificate 自包含 primary key。
- User ID 明确可选。

#### S2K

新增 Argon2，且推荐使用。

#### 新子包

Intended Recipient Fingerprint，用来缓解 surreptitious forwarding。

#### 新 digest algorithms

SHA3-256、SHA3-512。

#### 新 packet

Padding Packet。

#### 新 message structure 概念

Packet Criticality。

#### 主要废弃项

- 弱 RSA key、DSA、Elgamal。
- MD5、SHA-1、RIPEMD-160。
- IDEA、TripleDES、CAST5。
- Simple S2K。
- MalleableCFB。
- SED packet。
- Literal Data Packet filename/date 字段作为重要元数据。
- `_CONSOLE` filename。
- v3 public keys。
- v3 signatures。
- CRC24 footer 与 Version armor header。

### 术语变化

旧术语与新术语关系：

| 旧说法 | 新说法/理解 |
|---|---|
| Radix-64 | ASCII Armor base64 encoding |
| Old packet format | Legacy packet format |
| New packet format | OpenPGP packet format |
| Certificate | 专指 Transferable Public Key |
| Packet Tag | Packet Type ID 或 encoded Packet Type ID |
| MDC packet | 现在作为 v1 SEIPD 的内部机制理解 |

---

## Appendix C. Errata Addressed：已处理勘误

### 这一部分讲了什么

列出 RFC 9580 合并或解决的 RFC 4880 等历史勘误。

### 意义是什么

RFC 9580 不只是增加新算法；它还清理了旧规范中的不明确、错误或实现分歧点。

### 在体系中的功能

它提高互操作性。许多旧实现之间的差异来自规范含混或 errata；RFC 9580 把这些内容纳入正式规范。

---

## 总结：如何把各章连成一个整体

### 1. OpenPGP 的基本对象

```text
Message              = 要传输的加密/签名/压缩/明文消息
Certificate          = 可传输公钥，包含身份和绑定签名
Secret Key           = 可传输私钥，通常被 passphrase 保护
Detached Signature   = 与被签数据分离保存的签名
```

### 2. OpenPGP 的基本数据结构

```text
Data element → Packet → Packet Sequence → OpenPGP Object → ASCII Armor optional
```

### 3. 加密路径

```text
Literal data
  → optional signature
  → optional compression
  → session key encryption
  → SEIPD body encryption
  → optional ASCII Armor
```

对应 packet：

```text
PKESK/SKESK + SEIPD(COMP?(OPS? LIT SIG?))
```

### 4. 签名路径

```text
data
  → canonicalization if text
  → hash(data + signature metadata + trailer + v6 salt)
  → public-key signature
  → Signature Packet
```

签名可用于：

- 文档。
- 文本。
- User ID 认证。
- 子密钥绑定。
- key revocation。
- certification revocation。
- third-party confirmation。

### 5. 证书路径

```text
Primary Key
  → Direct Key self-signature
  → User ID / User Attribute + certification signatures
  → Subkey + binding signatures
  → Revocation signatures when needed
```

核心关系：

```text
User ID 不等于身份真实性
User ID + self-signature = keyholder 声称该身份属于自己
User ID + third-party certification = 其他 keyholder 也认证该绑定
Subkey + binding signature = 主密钥声明拥有子密钥
Revocation signature = 某 key 或绑定不再有效
```

### 6. 现代 OpenPGP 的方向

RFC 9580 的现代化方向可以概括为：

```text
v6 keys
v6 signatures with salt
X25519 for encryption
Ed25519 for signatures
v2 SEIPD with AEAD
Argon2 for passphrase-derived keys
fingerprint over Key ID
avoid legacy malleable encryption
avoid weak/deprecated algorithms
```

### 7. 最重要的心智模型

以后看到 OpenPGP 相关概念，可以先问五个问题：

1. 这是 **packet**、**packet sequence**，还是外层 **ASCII Armor**？
2. 它属于 **message**、**certificate**、**secret key**，还是 **detached signature**？
3. 它是在处理 **正文数据**、**session key**、**密钥材料**，还是 **身份绑定**？
4. 它是现代 v6/v2/AEAD 路径，还是历史兼容路径？
5. 它是否被签名或 AEAD 认证覆盖？如果没有，就不能把它当安全事实。

只要能回答这五个问题，就能把大多数 OpenPGP 术语放回 RFC 9580 的整体体系中。
