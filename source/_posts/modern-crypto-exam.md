---
filename: modern-crypto-exam.md
date: 2026-07-13 09:26:49
title: 现代密码学对称加密体制期末复习笔记
tags:
- Crypto
description: OUC 现代密码学对称加密体制期末复习笔记（26春）
---

## 概论及古典密码学

[思维导图](https://atlas.mindmup.com/3d0e4ce7-bda2-43f5-a306-aa209a596082/)

## 对称加密体制

> 对称加密体制是一对高效的算法 $E$ 和 $D$，  
> $$
> E: K \times M \rightarrow C \\
> D: K \times C \rightarrow M,
> $$
> 满足 $D(k, E(k, m)) = m, \forall m \in M, k \in K，$  
> $M、C、K$ 分别为明文空间、密文空间、密钥空间

:::tip
何为“高效”？高效是指该算法能在概率多项式时间内完成.
:::

### 流密码

#### 随机性（randomness）

随机性的概念在密码学中占有极其重要的地位：
- 随机数可以作为密钥使用
- 在密码体制和安全的构造中也得到广泛应用

> 是否存在真正的随机性？这是一个哲学问题. 但量子力学告诉我们，答案是肯定的.

##### 随机序列

- 性质：不能可重复产生——用完全同样的输入操作两次，得到两个不相关的序列
- 数学解释：概率服从均匀分布——产生每个比特的两种取值概率为 $\frac{1}{2}$；任意两个比特统计上相互独立（从信息论的角度上来说，随机序列是一个二元无记忆平稳信源）
- 产生：使用专门的设备（随机数发生器），输入使用各种无法预测的信号：空气状况、电流变化率，机械磁盘转动噪声...
    - 输入是不断变化的，输出也就不可重复.
    - 没有人能重构输入信号，也就没有人能预测产生的下一个数
- 电子计算机不能产生真正的随机序列（量子计算机另当别论），只能产生伪随机序列

> 任何人考虑用数学的方法产生随机数，**肯定是不合理的！**  
> ——香农

#### 一次一密和完善安全性

##### 一次一密（OTP，one-time pad）

*pad：密码本*

```text
m:0110111
k:1011010
c:1101101
```

原理：$m \oplus k = c$

密钥流是随机序列，且**不重复使用**.

给定密文 $c$ 和明文 $m$，则密钥 $k = m \oplus c$.

##### 完善保密性（Perfect Secrecy，香农，1949）

> 唯密文攻击下，密文不能泄露明文的任何信息！  
> ——香农

**定义（完善保密性）**：如果一个对称加密体制（$E$，$D$）满足以下条件，它具有完善保密性：
$$
\forall m_0, m_1 \in M,\ \forall c \in C,\;
\Pr\!\left[E(k,m_0)=c\right]
=
\Pr\!\left[E(k,m_1)=c\right],\\
$$
其中 $k$ 是随机选取的，且 $|m_0|=|m_1|$.

- $Pr[x]$ 表示事件 $x$ 的概率
- $M,\ C,\ K$ 分别为明文、密文、密钥空间

**解释**：
- 给定密文，攻击这无法确定密文对应哪个明文，因为任意一个明文 $m$ 加密后为 $c$ 的概率都是相等的.
- 即使拥有**无限**计算资源也无法从密文获得明文的任何信息
- 唯密文攻击无效，无条件安全

:::note
注意到上面的定义实际上要求给定**任意一个**可能出现的密文和**每一个**明文，我都能找到一个密钥，将明文加密成密文.
:::

**证明** 一次一密具有完善保密性：

$\forall m \in M,\ \forall c \in C$，

$$
Pr \left[ E(k, m) = c \right] = \frac{|k: E(k, m) = c|}{|K|} = \frac{1}{|K|} \\
$$
其中，
$$
\begin{aligned}
&\text{有唯一 } k = m \oplus c \text{ 使得 } E(k, m) = c \\
&\Rightarrow |k: E(k, m) = c| = 1
\end{aligned}
$$

:::tip
一般来说，我们只需要证明 $\forall m,\ \forall c,\; |k: E(k, m) = c|$ 是常数，就可以证明一个对称加密体制具有完善保密性.
:::

> **香农定理** 完善保密性要求 $|K| \ge |M|$

> **引理 1** 对于每个固定密钥 $k$，函数 $E(k, m)$ 关于明文 $m$ 是单射的.

**证明**：  
（*为了简化证明，我们假设密钥是均匀分布的. *）  
固定一个实际可能产生的密文 $c$，即：
$$
Pr \left[ C = c \right] > 0
$$
若满足完善保密性，$\forall m_i \in M$，存在集合
$$
K_i = \left\{ k \in K | E(k, m_i) = c \right\} \neq \varnothing
$$
由引理 1，任意 $K_i$ 之间相交为空，由完善保密性，$|K_i|$ 为一常数 $w$，故

$$
|K| \ge \sum^{|M|}_{i=1}|K_i| = w|M| \ge |M|.
$$

**证毕**！

:::tip
$|K| \ge \sum^{|M|}_{i=1}|K_i|$ 是因为可能有某些密钥 $k$，对于固定密文 $c$，没有任何明文 $m$ 满足
$$
E(k, m) = c.
$$
:::

**由香农定理，要满足完善保密性，所需密钥至少和明文一样长（bits）. **

#### 流密码（Stream Cipher）与语义安全性（Semantic Secrecy）

##### 流密码

基本思想  
使用“伪随机”密钥流代替“随机”密钥流

使用工具  
“伪随机生成器”（PRG，Pseudo Random Generator）

实现方法  
利用一个短的**随机**密钥（称作“种子”）作为 PRG 的输入，由 PRG 产生**伪随机**密钥流，再与明文流/密文流异或. 即定义一个 PRG 函数为 $G(k)$. 则
$$
\begin{aligned}
E(k, m) &= G(k) \oplus m\\
D(k, c) &= G(k) \oplus c
\end{aligned}
$$

**定义（PRG）**：$G$ 是一个高效的确定性函数，如果 $G$ 是一个 PRG，则
$$
G: \left\{ 0, 1 \right\}^s \rightarrow \left\{ 0, 1 \right\}^n, s \ll n
$$

- $\left\{ 0, 1 \right\}^s$：种子空间

- **事实1**：PRG 必须是不可预测的（unpredictable）——给定输出的某些比特，高效预测其他任一比特的成功概率可以忽略
- **事实2**：$G$ 是安全的 $\Rightarrow$ $G$ 是不可预测的
- **定理**：$G$ 是不可预测的 $\Rightarrow$ $G$ 是安全的

$G$ 是不可预测的 $\Leftrightarrow$ $G$ 是安全的

**定义（PRG 的安全性）**： 设 $G$ 是一个 RPG，如果对于任何高效的算法，成功区分 $G$ 的输出和等长的随机序列的概率都是可忽略的（计算上不可区分），则 G 是一个安全的 RPG.

##### 语义安全性

**【完善保密性 VS. 语义安全性】**

- 完善保密性
    - 唯密文攻击无效
    - 无条件安全（即使拥有无限的计算资源，唯密文攻击也无法破译）
- 语义安全性
    - 选择明文攻击无效（密钥只使用一次）
    - 计算上安全（攻击者的计算资源有限，符合现实）

> **语义安全性（semantic security）**要求：攻击者看到密文后，不能以计算可行（使用一个概率多项式时间（PPT，Probabilistic Polynomial Time）算法）的方式获得任何关于明文的额外信息.

:::note
概率多项式时间算法（Probabilistic Polynomial Time Algorithm），字面意思，这是一个多项式时间复杂度的算法，并且可能是非确定的，即算法中有随机的“部分”.
:::

这里的“信息”不仅包括完整明文，还包括：

* 明文的某个比特；
* 明文的某种属性；
* 关于明文的任意可有效计算的函数 $f(m)$，这里可以把 $f$ 看作一个属性，也就是说我们无法通过密文获取到加密前的明文的任何属性. $f(m)$ 的严格定义是一个布尔函数，对**破译**这个行为进行数学刻画.

假设攻击者已经知道明文的长度、概率分布或其他公开辅助信息. 语义安全性要求：

> 攻击者看到密文后，对 $f(m)$ 的预测能力，不能显著优于没有看到密文时的预测能力.

对于对称加密方案：

$$
\Pi=
\left(
\operatorname{Gen},
\operatorname{Enc},
\operatorname{Dec}
\right)
$$

密钥 $k$ 由 *Challenger* 保管. 攻击者可以请求任意明文的密文.

在通常的计算安全模型中，对称加密的语义安全性与 IND-CPA 等价：

$$
\boxed{
\text{Semantic Security under CPA}
\iff
\text{IND-CPA}
}
m_b
$$

IND-CPA 的核心问题是：

> 攻击者能否判断挑战密文加密的是 $m_0$ 还是 $m_1$？


[![20260714-38476c82ba084769.png](./images/20260714-38476c82ba084769.png)](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&dark=auto#R%3Cmxfile%3E%3Cdiagram%20name%3D%22%E7%AC%AC%201%20%E9%A1%B5%22%20id%3D%22u-eP2Awe6DbMSAQx9fpp%22%3E7Vtbc5s6EP41mmkeksFgc3kEbKfttHM6ddsz05czMshYDUauEHVyfn0lITB3x7lNeg4ZTwzL7mq10vdppRBg%2BLvbawr3248kRDHQtfAWGHOg65OJafAvIbnLJaZh5oKI4lApHQUr%2FC9SQk1JMxyitKbICIkZ3teFAUkSFLCaDFJKDnW1DYnrre5hhFqCVQDjtvRvHLJt2S%2Fn%2BOAtwtFWNW3rVv5gBwtl1ZN0C0NyqIiMBTB8SgjLr3a3PopF8oq85HbLnqdlYBQlrMPga4roX%2BsfIie6FsM1HxeppKJDdAdxOIcMKrHlAZ0PjcETb%2FBLTX7Mn5kIzwuFXnkHDLf2NEU%2FM5QEaI5hROEOzPykcKDlITIc4D1MRCi%2BGJhUXGxhHKMkQnTYwC0M3PAXoimkd1K%2FYeNe8ngiGZ369lWYixmwXeDKC3cJbBMsTOAsgTsDC1tIXJmQpkO%2F5dDNHS6S4M0N0EU%2FdhdnhGEBdw5sBywc4MyAtxRheCawbXFhT0QkIoyFDmz%2B0VQLxf3kdHyqpbV4LsZUk025wJZNOT7gPeAXvB1nKsLhsXjOvbsdSIe6yJ%2BjNdLwz%2FqcRNjAWwDHkANjyaB4LL4IUGSECz3Zi4XMgqdX5p1orXeOcgbY4Kg5S5NMoOZoZOUYKGH0%2FsNq%2Ft3Q2Sp7n779fh1%2B%2FZyEl5MSniXsFL%2FAdUEMWht%2FCpIpuyuUIkqyPW%2BWUZikuapHsiQUpDThchRi9o67VrcxCW5QeJ0bzUW80sEnGIY4iYSSkKU3iAVbZbKFwTaj6BoKiykX%2FMBRJJvXRU4y%2BgstMWPKnIs2JGFLuMOxIGSf7LAY2BUPj399XJXuV6oTgdQQ2RZd4wBk6LbSW5Wka0R2iHFk6tq2QoYzTWXpcKROS58pdlbMHJW2R%2FLiFyrzxW2FzgbprcIqVaJ7p4abZ9r1a088mKLVccS2bBerTHHC3gtptos%2F4A2KccLvvD2imMfL%2FRvzWIk%2FHWXeYYsZWu1hIEwPVIyLmJoMcj2qPIeU7L9AGiGmhjkgcQz3Kc5nl5BQxMcuxb%2FQZ5Tmi6KQkoyJ9vxysRPCPaGMS1I%2BybCcigim7IBSAYIEHRZhdOygZHkFEFQ%2BqGOmfB6vScW6AcOqUo8DMVswX0p7TOXkDGu2Wk2BCqi0NDiCOVJU5ucw3aJQJYJngNyUy7Re8ZCnHa5TEmcMuTRQhYaUlndmxbFPYpIPMZ%2FNlyGkN284hziGpc3zXhiB%2FLkQ7SrzWcX%2BI%2BbFRzHeGxzH3Q4X%2FsJfLnOHk42u6dpF2ZFzQhCo7tbPf7r0Sxb4QtE6C7aI5RSg%2B98QDWHCV3zfpViMn59ygrjkkMMbZVwk0Cy5oYKnbzDOUDceB3lXb%2FNulV%2F7ubpGuiOERwj%2F3yDctZA3Yfq4uuEJy4LppF0WTGZKptwYpioT1L7R1p6zajhuLfqKBncsGkbGGRnnZYqGBhwHawZjrBlGBI8IHmsGXZ%2B9aM3wpv%2Bs7qKzjECijCiPxeTQDxUVKAldcYDN79biYEigLilOyJ0Kzlw%2B8uIEaU0YI7sawjkp1NFcINeYlygtEakYqMSO1jEfZP89GNxEUq%2BYewmRJFlH4uRqdmJS90%2FSF1uWhpahx5%2FZnl6%2BzPbyJYavgosHrWfj5HkqRnwuBmzTHUUxZHzpr419F3dJUz688K6isCe8Ckgrnj8JQYUcp1qNHHVNa%2FBg7rHb2jScTuuy%2BZRkNEDKqvpnq4ajaU8YpSMmC6SWI8nTZbIeSd299OzX6FkbpOcKTtQMLqEwyeH2QARCJQg46GVt%2Bcfh6ElJ%2BDSHWs%2FEoeMIn8WUdfL%2Fr%2FDm1KoXlbqpDROc1WBKSz%2Bh3%2FBvT8%2FgZU6nV1PdnlmT%2FLdhdAb7EJoe9KuCfBbWbr3q0IlX%2B8G45tsOwfDVLX8NPApl1d2bErVw20T4DoehLJTO3midi8YavDoAVAPY4D7sSLXHNwc%2BwyTkTKVrHmYP2q5N7NZurVzpixPeZiVgnL9d61vgT72scHr9d8ft2WuvDO41yIMc4oybr9czNV7h5ksxlXalaQMvrTRW0EKFbDYpqq2GZ2%2FZDOdqZtVI0pics2ubcgeOU1nFO32dXRyYht0X14tu40jG9pmQVV8Wu9fBW11vZPZXxuwPeEfw9Dt9GnhCspdIGdAzxkXhj1sUdI0Vf5zrG9bqC0ovd3I3qxfKhjW8A22e9E2bb5Kf0lfvtt%2FzZLDH%2BtEngy1HT7mkcNHxzfvcw%2FH%2FF4zFbw%3D%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E#%7B%22pageId%22%3A%22u-eP2Awe6DbMSAQx9fpp%22%7D)

其中 Challenger 随机选择：

$$
b\xleftarrow{\$} \{0,1\}
$$

并生成挑战密文：

$$
c\leftarrow\operatorname{E}(k,m_b)
$$

如果攻击者在 $b = 0$ 和 $b = 1$ 的条件下选取 $1$ 的概率相差可以忽略，那就可以认为攻击者分辨不同消息在计算上是不可行的，因此，攻击者的优势可以定义为：

$$
\operatorname{Adv}
=
\left|
\Pr\!\left[ b' = 1 | b = 0 \right]
-
\Pr\!\left[ b' = 1 | b = 1 \right]
\right|
$$

我们为攻击者设计一个概率多项式时间的破译算法 $A$，若在这个破译算法下，攻击者的优势 $\operatorname{Adv}$ 仍然是可忽略的，那么我们就称该对称加密方案具有语义安全性.

注意，此处要求两条消息等长：

$$
|m_0|=|m_1|
$$

是因为标准语义安全性通常不隐藏消息长度. 如果两条消息长度不同，攻击者可能直接根据密文长度进行区分.

:::spoi 这里给出一个完整的语义安全性的定义
1. 游戏参加方包括*挑战者（challenger）*和*攻击者（adversary）*
2. *adversary* 选择两条等长的消息 $m_0,\ m_1$ 发送给挑战者
3. *challenger* 生成随机比特 $b\xleftarrow{\$} \{0,1\}$
4. *challenger* 将 $E(k, m_b)$ 发送给 *adversary*
5. *adversary* 猜测 $b$

即对任意的概率多项式时间算法 $A$，任意的消息 $m_0,\ m_1$ 都有：
$$
\operatorname{Adv} = \left|
\Pr[A(E(k, m_0)) = 1 | b = 0] -
\Pr[A(E(k, m_1)) = 1 | b = 1]
\right|
$$
可以忽略

:::

**语义安全性与完善保密性**

| 对比项   | 完善保密性           | 语义安全性             |
| ----- | --------------- | ----------------- |
| 英文    | Perfect secrecy | Semantic security |
| 安全类型  | 信息论安全           | 计算安全              |
| 攻击者能力 | 不受计算资源限制        | 概率多项式时间           |
| 密文泄露  | 完全不泄露明文信息       | 不能有效提取额外信息        |
| 攻击优势  | 严格为零            | 至多为可忽略量           |
| 典型方案  | 一次一密            | 现代随机化对称加密         |

完善保密性要求明文与密文在统计上独立：

$$
\Pr[M=m\mid C=c]
=
\Pr[M=m]
$$

即使攻击者拥有无限计算能力，观察密文也不会改变它对明文的认识.

语义安全性允许密文在信息论意义上包含明文信息，但要求这些信息无法被计算能力受限的攻击者有效提取.

因此：

$$
\boxed{
\text{完善保密性是信息论安全，语义安全性是计算安全}
}
$$

:::spoi 常见误区

1. **无法恢复完整明文，就具有语义安全性. **

   错误. 只要攻击者能够有效获得明文的某个比特或属性，就可能违反语义安全性.

2. **攻击者的成功概率必须严格等于 $\frac12$. **

   错误. 语义安全性允许攻击者具有可忽略的额外优势：

   $$
   \Pr[b'=b]
   =
   \frac12+\operatorname{negl}(\lambda)
   $$

3. **使用随机数就一定具有语义安全性. **

   错误. 随机化是重要条件，但不能代替正式的安全证明.

4. **确定性对称加密也可能满足 IND-CPA. **

   通常错误. 攻击者可以先查询 $m_0$ 和 $m_1$ 的密文，再与挑战密文比较.

5. **语义安全性可以防止密文被修改. **

   错误. 语义安全性只保证机密性，不自动保证完整性和身份认证.

6. **语义安全性会隐藏消息长度. **

   错误. 标准定义通常允许攻击者知道明文长度.

7. **语义安全性等同于完善保密性. **

   错误. 完善保密性抵抗无限计算能力的攻击者，而语义安全性只抵抗计算能力受限的攻击者.

$$
\boxed{
\text{语义安全性要求：密文不能给攻击者带来可有效利用的额外明文信息. }
}
$$

:::

> **定理** 一次一密是语义安全的

**证明** 考虑两个实验

$$
\begin{aligned}
C_0 &= K_0 \oplus m_0\\
C_1 &= K_1 \oplus m_1
\end{aligned}
$$

由于 $K_0, K_1$ 具有相同的概率分布，易证 $C_0, C_1$ 具有相同的概率分布，且概率分布为

$$
$$

令
$$
q(c) = \Pr \left[ A(m_0, m_1, c) = 1 \right]
$$

在实验 $\operatorname{EXP}(0)$ 中，根据全概率公式

$$
\begin{aligned}
\Pr \left[ A(m_0, m_1, C_0) = 1 \right]
&= \sum_{c\in\{0, 1\}^n} \Pr \left[ C_0 = c \right] \Pr \left[ A(m_0, m_1, c) = 1 \right] \\
&= \sum_{c\in\{0, 1\}^n} \frac{1}{2^n} q(c)
\end{aligned}
$$

同理可得，在 $\operatorname{EXP}(1)$ 中，$\Pr \left[ A(m_0, m_1, C_1) = 1 \right] = \sum_{c\in\{0, 1\}^n} \frac{1}{2^n} q(c)$

因此

$$
\operatorname{Adv}
=
\left|
\Pr\!\left[ A(m_0, m_1, C_0) = 1 \right]
-
\Pr\!\left[ A(m_0, m_1, C_1) = 1 \right]
\right|
= 0
$$

**证毕！**


> **定理** PRG 是安全的，则相应的流密码是语义安全的

**证明** 设 PRG 为 $G:\{0,1\}^{\lambda}\rightarrow\{0,1\}^{n}$

则

$$
\operatorname{E}(k, m)=m\oplus G(k),
\qquad
K\xleftarrow{\$}\{0,1\}^{\lambda}.
$$

对任意等长消息 $m_0,m_1\in\{0,1\}^{n}$ 和任意 $PPT$ 攻击者 $A$，令
$$
\begin{aligned}
&p_b=
\Pr\!\left[
A\!\left(m_b\oplus G(K)\right)=1
\right],
\; b\in\{0,1\}.
\end{aligned}
$$

再令 $R\xleftarrow{\$}\{0,1\}^{n}$，由三角不等式

$$
\begin{aligned}
\operatorname{Adv}
={}&
\left|
\Pr\!\left[A(m_0\oplus G(K))=1\right]
-
\Pr\!\left[A(m_1\oplus G(K))=1\right]
\right|
\\[4pt]
\leq{}&
\left|
\Pr\!\left[A(m_0\oplus G(K))=1\right]
-
\Pr\!\left[A(m_0\oplus R)=1\right]
\right|
\\
&+
\left|
\Pr\!\left[A(m_0\oplus R)=1\right]
-
\Pr\!\left[A(m_1\oplus R)=1\right]
\right|
\\
&+
\left|
\Pr\!\left[A(m_1\oplus R)=1\right]
-
\Pr\!\left[A(m_1\oplus G(K))=1\right]
\right|.
\end{aligned}
$$

$$
\boxed{
G\text{ 是安全的 PRG}
\Longrightarrow
\operatorname{E}_k(m)=m\oplus G(k)
\text{ 是语义安全的}
}
$$

示意图
![流密码是语义安全的](./images/20260715-02e1d14e660205e1.png)
**证毕！**

---

**流密码的密钥不能重复使用**

1. 不满足语义安全性
   ![20260715-837857bca39477c6.png](./images/20260715-837857bca39477c6.png)
2. 在已知明文攻击下不安全，因为可以使用明文和密文异或得到密钥
3. 在唯密文攻击下也不安全，因为通过两个密文的异或：
    $$
    \begin{aligned}
    c_0 \oplus c_1
    &= (m_0 \oplus k) \oplus (m_1 \oplus k)\\
    &= m_0 \oplus m_1
    \end{aligned}
    $$
    根据明文的异或特征，英文等自然语言和 ASCII 码存在足够冗余，容易推出明文.

最好使用 Two-Time Pad，先使用密钥 $k$ 和 PRG 生成一个伪随机序列 $G(k) \Rightarrow k_1, k_2, \dots$，然后再在每次加密会话消息时使用 $k_i$ 生成真正用于流密码的密钥 $G(k_i)$.

### 分组密码

输入：一个定长的明文分组  
输出：一个等长的密文分组

- 设计分组密码的两种基本技术（香农），其目的是为了抵抗攻击者对密码系统的分析
    - 混乱（Confusion）：使明文和密文之间、密钥和密文之间的相关统计特性极小化，从而使攻击者无法找到密钥，其实现方法是**代换**；
    - 扩散（Diffusion）：将明文及密钥的影响尽可能迅速地散布到较多个密文比特中，其实现方法是**置换**.
- 绝大多数的分组密码都是通过**迭代技术**构造的
    ![20260715-9e6adb2ee41f5922.png](./images/20260715-9e6adb2ee41f5922.png)
    - 轮密钥（子密钥）：$k_1, \dots, k_d$；
    - 轮函数：$R(k_i,\cdot)$；
    - AES-128(d=10)，DES(d=16)，IDEA.

#### DES（数据加密标准）

见 [现代密码学实践- DES 穷举攻击](/des-attack.html)

- 安全性
    - 随着计算机技术的飞速发展，56 bits 的有效密钥长度不足以抵抗穷举攻击，其密钥空间只有 $2^{56}$.
    - DES 依靠 S-box 实现非线性变换，但 NSA 被指责在 S-box 上隐藏了“陷门”
- 3DES——使用两个或三个密钥，执行三次 DES 算法，具体来说，执行方式分为（其中的 D 和 E 分别表示解密和加密，比如 EDE 就是分别使用三个密钥进行加密-解密-加密的操作来加密，然后使用解密-加密-解密的操作来解密）：
    - DES-EEE3
    - DES-EDE3
    - DES-EEE2
    - DES-EDE2
    - 类似于算法中的双向 DFS 的技巧，如果只进行两重 DES，容易分别从两端穷举密钥来使得破译难度降低到$O(2^{63})$.
- DESX
    ![20260715-db3f03e952e68d44.png](./images/20260715-db3f03e952e68d44.png)
