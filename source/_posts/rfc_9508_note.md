---
title: RFC 9508 OpenPGP 笔记 【持续更新】
date: 2025/10/05 23:36:58
top: true
tags: Web
categories: 笔记
filename: rfc_9508_note.md
permalink: rfc_9508_note.html
---

本文讨论的内容：

- [ ] Introduction
- [x] General Functions
- [x] Data Element Formats
- [ ] Packet Syntax
- [ ] Packet Types (Overview)
- [ ] Base64 Conversions
- [ ] Cleartext Signature Framework
- [ ] Regular Expressions
- [ ] Constants
- [ ] Packet Sequence Composition
- [ ] Elliptic Curve Cryptography
- [ ] Notes on Algorithms
- [ ] Security Consierations
- [ ] Implementation Considerations

## 总体功能 - General Functions

> OpenPGP 通过使用公钥和/或对称加密以及数字签名，为消息和数据文件提供数据机密性和完整性。它提供用于编码和传输加密和/或签名消息的格式。此外，OpenPGP 提供用于编码和传输密钥和证书的功能，尽管密钥存储和管理不在本文档的范围内。
>
> —— 《RFC 4880》

下面是 OpenPGP 标准规定应当实现的功能 (可以部分实现)：

- Confidentiality (保密性) via Encryption
- Authentication via Digital Signature
- Compression
- Conversion to Base64 (~~后两项出现在这里未免有些突兀了~~)

## 数据元素格式 - Data Element Formats

描述了 OpenPGP 是怎样储存数据的

### 标量数字 - Scalar Numbers

> [!TIP]  
> Octet: 八位的字节，八位组  
>
> 表示一个储存了八位二进制的数字序列/数组。

标量数字没有符号，且使用大端序储存。我们使用 `[xx]` 表示一个十六进制表示的八位字节（Octet），则对于下面的标量 n:

```js
[1210]
```

其十进制表示为：`n[0] << 8 + n[1]` 即 `0x12 << 8 + 0x10`，结果为 `4624`。  
（在上面的计算中为什么使用 `n[0]` 表示 [12] 呢？因为在内存中大端序就是低地址表示权更大的位）

### 多精度整数 - Multiprecision Integers (MPIs)

多精度整数同样是无符号整数，用来储存大整数，如加密计算中使用的大整数。

MPI 的结构是：

```text
| length | value |
```

- length: 2 个 8 位字节的标量（16位），**注意是位数而非字节数**
- &nbsp;value: 包含实际整数的 octets 串

这些 octets 共同组成一个大端序数字；通过在大端序数字前加上适当的 length，可以将其转换为一个 MPI。

下面是几个 MPI 的例子：

```text
[00 00]       <=> 0
[00 01 01]    <=> 1  # [00 01] 为 2 个字节，表示实际数值的长度为 1,
                     # [01] 为实际数值
[00 09 01 FF] <=> 511
```

> [!IMPORTANT]  
> [附加规则](https://www.rfc-editor.org/rfc/rfc9580.html#section-3.2-7)
>
> - MPI 的大小应当是 `(MPI.length + 7) / 8 + 2` octets  
> - length 描述从数值字段的最高非零位开始的长度
> - MPI 中没有使用的位必须 (**MUST**) 为0

> [!TIP]
> 使用 MPIs 编码其他数据
>
> 在某些情况下，我们会使用 MPIs 对非整数数据进行编码，比如一个椭圆曲线 (Elliptic curve, EC) 的点，或者一个长度已知且固定的 octet 串。其表示形式与前文规定的相同。

### 密钥 ID 和指纹 - Key IDs and Fingerprints

一个密钥 ID 是一个 8 octets 的标量，用于表示一个密钥（**但不保证密钥 ID 是唯一的**）。与之相比，指纹唯一的可能性更大，两者都是通过密钥计算出来的，且不同版本的标准的计算方式都不相同。

后文会详细描述两者的计算方式。

### 文本 - Text

除非另有说明，应当采用 Unicode 的 UTU-8 编码。

### 时间字段 - Time Fields

使用一个 4 octets 的时间戳来表示，单位是秒，从 `1970-0-0 00:00:00` 开始计时。

### 密钥环 - Keyrings

密钥环是一个或多个密钥的集合，使用文件或数据库储存。通常，一个密钥环是一个密钥的顺序列表，但它可能在任何适合的数据库中储存。

### 字符串-密钥指定符 - String-to-Key (S2K) Specifier

一个 S2K 指定符用于将一个密码 (passphrase) 字符串转换为一个对称加密/解密密钥。需要使用 S2K 的密码用于加密私钥的秘密部分和对称加密消息。

> [!TIP]
>
> 以AES加密保护私钥为例，我们使用输入密码之后，需要将密码根据预先设定的算法转换为一个 AES 密钥（一般是 256 位），然后使用这个密钥来对称加密/解密我们储存的私钥。

**S2K Specifier Types**

| ID      | S2K Type                               | S2K Field Size (Octets) | Generate?                            | Reference                                                                      |
|---------|----------------------------------------|-------------------------|--------------------------------------|--------------------------------------------------------------------------------|
| 0       | Simple S2K                             | 2                       | No                                   | [Section 3.7.1.1](https://www.rfc-editor.org/rfc/rfc9580.html#s2k-simple)      |
| 1       | Salted S2K                             | 10                      | Only When string is high entropy(熵) | [Section 3.7.1.2](https://www.rfc-editor.org/rfc/rfc9580.html#s2k-salted)      |
| 2       | Reserved Value(保留值，新标准可能使用) | -                       | No                                   |                                                                                |
| 3       | Iterated and Salted S2K                | 11                      | Yes                                  | [Section 3.7.1.3](https://www.rfc-editor.org/rfc/rfc9580.html#s2k-iter-salted) |
| 4       | Argon2                                 | 20                      | Yes                                  | [Section 3.7.1.4](https://www.rfc-editor.org/rfc/rfc9580.html#s2k-argon2)      |
| 100-110 | Private or Experimental Use            | -                       | As appropriate (按需)                |                                                                                |

> If "Yes" is not present in the "Generate?" column, the S2K entry is used only for reading in backward-compatibility mode and SHOULD NOT be used to generate new output.
> 若 "Generate?" 不为 "Yes" 表示这种 S2K 仅用于在向后兼容 (新版本兼容旧版本) 的模式中进行读取且不应用于生成新输出。

#### Simple S2K

简单 S2K 直接对字符串进行 hash 运算从而生成密钥数据。这种哈希运算如下所示：

```text
Octet 0: 0x00
Octet 1: hash algorithm (一个 hash 算法的 ID)
```

若计算出来的 hash 值长度大于所需要的会话密钥 (session key) 的长度，比如 AES 所需要的 256 位，那么就截取 hash 值的高位(最左端) octets 作为密钥。

若计算出来的 hash 值长度小于所需要的会话密钥长度，我们就需要使用不同长度的值为 0 的 octets 拼接在原始的密码前面，然后进行多轮hash，依次拼接，其过程如下：

> [!TIP]
>
> 在密码学中，`||` 表示拼接两个字节序列

```
# 假设 Hash(x) 能够产生长度为 20 的 hash value.
# 我们需要的 session key 长度为 36.
# 原始密码为 passphrase
H1 = Hash(passphrase)
H2 = Hash([00] || passphrase)

Key = (H1 || H2) >> (36 - 20)
```

#### Salted S2K

带盐的 S2K 的 hash 运算如下所示：

```text
Octet 0:        0x01
Octet 1:        hash algorithm
Octets 2-9:     8-octet salt value
```

其他过程与 Simple S2K 完全相同。

#### Iterated and Salted S2K

这种 S2K 会将每次 hash 的结果作为参数再次 Hash：

```text
Octet 0:        0x01
Octet 1:        hash algorithm
Octets 2-9:     8-octet salt value
Octet 10:       count; a 1-octet coded value
```

count 使用下面的公式被编码为一个 1-octet 的数字：

```c
#define EXPBIAS 6
    count = ((Int32)16 + (c & 15)) << ((c >> 4) + EXPBIAS);
```

> 上面的公式使用 C99 语法描述。

这种 S2K 的处理方式是：

首先处理按照 `salt||passphrase||salt||passphrase...` 的顺序不断拼接，直到这个 octets 串的位数达到 `count` (**count表示位数而非迭代次数**)，然后将低位（最右端）超出 `count` 的部分去掉，但是如果 `count` 小于 `salt || passphrase` 的长度，就不能截断(我们需要保证一定有一份完整的 `salt||passphrase`)。

然后对这个 `octets` 进行 hash，其处理过程同 salted S2K。

#### Argon2

> Argon2 是一种现代密码学中的**密码派生函数（Password-Based Key Derivation Function, PBKDF）**，用于将人类可读的密码转化为强随机度的密钥（类似 S2K、PBKDF2、scrypt 的升级版）。
> 它是目前被广泛认为最安全、最先进的口令哈希算法之一，并且是 Password Hashing Competition (PHC) 的最终获胜算法（2015）。

```text
  Octet  0:        0x04
  Octets 1-16:     16-octet salt value
  Octet  17:       1-octet number of passes t
  Octet  18:       1-octet degree of parallelism p
  Octet  19:       1-octet encoded_m, specifying the exponent of
                   the memory size
```

> - 每一个 passphrase 都应该 **(SHOULD)** 拥有一个唯一的 Salt.
> - passes t 和 degree of parallelism p 必须 **(MUST)** 非零.
> - m 的含义是 $2^{encoded\_m}$ KiB 的 RAM。编码后的 m 必须 **(MUST)** 在 $[\,3+2^{\lceil log_2p \rceil},\,31\,]$ 内，从而使得 RAM 控制在 $[\,8*p, \,2^{31}\,]$ 中。

参数设置的[首选推荐](https://www.rfc-editor.org/rfc/rfc9106#section-4)是：

```py
t = 1
p = 4
m = 2^(21)
salt.length = 128
tag.size = 256      # 输出的 hash 长度
```

### S2K 的使用 - S2K Usage

> [!CAUTION]
>
> 对于 S2K 的实现
> 1. 不得使用 Simple S2K
> 2. 除非输入字符串具有高熵（用户输入的字符串一般不具有，而良好随机源生成的字符串可能具有），不得使用 Salted S2K

> [!TIP]
>
> Argon2 是标准的建议实现，因为 Iterated and Salted S2K 不提供 memory hardness.

#### 私钥加密 - Secret Key Encryption

私钥包中的公钥材料之后的第 1 个 octet 说明了是否以及怎样加密私钥材料。这个字节被称为 “S2K usage octet”。

如果 `S2K usage octet` 为 `0`，说明私钥数据不被保护，若非 `0`，则描述了如何使用 `passphrase` 解锁私钥。

在 RFC2440 之前，`S2K usage octet` 表示了使用[对称密码算法ID](https://www.rfc-editor.org/rfc/rfc9580.html#symmetric-algos)来加密私钥，并强制使用 MD5 来生成 hash。这种方案对应了后面的 `LegacyCFB`

后续实现则通过在 `S2K usage octet` 中使用储存特殊值（`253(AEAD)`, `254(CFB)`, `255(MalleableCFB)` 等 加密模式的 ID） 来加密私钥，并在之后立即跟上一组描述如何由 `passphrase` 来产生对称密钥，以及相关参数的字段。

> [!NOTE]
>
> - 不同版本的 OpenPGP 包在二进制字段结构上有所不同。下面的表格按 S2K usage octet 分类，概括了第 5.5.3 节中每种加密格式的字段排列和处理细节。
> - 下面的表格中 `check(x)` 表示 “2-octest 校验和”，即 `x` 中所有字节的和模 65536。`info` 和 `packetprefix` 参数在后文中会有详细描述。`Generate?` 缩写为 `Gen?`。

| S2K Usage Octet                                  | Shorthand（简写） | Encryption Parameter Fields                                                                           | Encryption                                                                               | Gen? |
|--------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|------|
| 0                                                | Unprotected       | -                                                                                                     | v3 or v4 keys: [cleartext secrets \|\| check(secrets)] <br/>v6 keys: [cleartext secrets] | Yes  |
| Known symmetric cipher algo ID (see [Section 9.3](https://www.rfc-editor.org/rfc/rfc9580.html#symmetric-algos)) | LegacyCFB         | IV                                                                                                    | CFB(MD5(passphrase), secrets \|\| check(secrets))                                        | No   |
| 253                                              | AEAD              | params-length (v6-only), cipher-algo, AEAD-mode, S2K-specifier-length (v6-only), S2K-specifier, nonce | AEAD(HKDF(S2K(passphrase), info), secrets, packetprefix)                                 | Yes  |
| 254                                              | CFB               | params-length (v6-only), cipher-algo, S2K-specifier-length (v6-only), S2K-specifier, IV               | CFB(S2K(passphrase), secrets \|\| SHA1(secrets))                                         | Yes  |
| 255                                              | MalleableCFB      | cipher-algo, S2K-specifier, IV                                                                        | CFB(S2K(passphrase), secrets \|\| check(secrets))                                        | No   |

> IV 的含义及作用
>
> 在现代加密中，IV（初始化向量，Initialization Vector）虽然是明文公开的，但其“随机性”或“唯一性”依然是至关重要的。  
> IV 的作用不是保密，而是**打乱加密初始状态**，使得相同的明文在相同密钥下每次加密都产生不同的密文，从而防止攻击者通过观察密文重复来推断明文内容。  
> 解密时，接收方会直接从密文包中读取 IV，再与相同的密钥一同输入解密算法即可还原明文。因此，IV 公开并不会影响解密正确性。  
> 它的意义在于：**通过增加随机性实现语义安全（semantic security）**，防止模式分析与重复检测，是现代对称加密安全性的重要基础。  
> 通俗来说，就是攻击者无法通过对大量的密文的频率分析来破解加密。
>
> 其中的 nonce 可以认为是 AEAD 版本的 IV。

**以 AEAD 举例，描述 Encryption**

1. `S2K(passphrase)`: 获取passphrase到对应的密钥；
2. `HKDF(key, info)`: 通过 `HKDF` (基于 `HMAC` 的密钥派生函数) 生成最终的 `AEAD` 密钥；
2. `AEAD(final_key, secrets, packetprefix)`: 加密最终数据  
    其中 `packetprefix` 即包前缀数据，用于验证包的完整性；  
    `nonce` 作为随机数也会被使用

> When emitting a secret key (with or without passphrase protection), an implementation MUST only produce data from a row with "Generate?" marked as "Yes". Each row with "Generate?" marked as "No" is described for backward compatibility (for reading version 4 and earlier keys only) and MUST NOT be used to generate new output. Version 6 secret keys using these formats MUST be rejected.
> 在生成密钥是，必须 (**MUST**) 从 "Generate?" 为 "Yes" 的模式中生成，其他的仅能用于向后兼容。

> [!NOTE]
>
> 版本 6 的参数相比 版本 4 多增加了一对长度计数，每对计数宽度为 1 octet。

> [!WARNING]
>
> `Argon2` 仅用于使用 AEAD 模式的加密中。

#### 对称密钥消息加密 - Symmetric Key Message Encryption

OpenPGP 可以在消息开头创建一个对称密钥加密会话密钥 (SKESK) 包。这用于允许 S2K 规范器用于密码转换，或创建混合 SKESK 包和 PKESK 包的消息。从而让我们能使用密码或公钥对来解密消息。

## 数据包语法 - Packet Syntax

