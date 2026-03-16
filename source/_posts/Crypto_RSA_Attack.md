---
title: "Crypto: 针对 RSA 的攻击方法"
date: 2025/11/06 21:16:40
tags: crypto
categories: 笔记
filename: Crypto_RSA_Attack.md
description: RSA 共模攻击与低加密指数广播攻击
keywords: RSA, 密码学, 共模攻击, 广播攻击, 数论
---

## 0x0 前言

数论菜鸡必须完成作业，因此整理一遍笔记帮助我自己理解.

## 0x1 数论函数与积性函数

数论函数（算术函数）就是定义域为正整数，[陪域](https://zh.wikipedia.org/wiki/%E5%88%B0%E8%BE%BE%E5%9F%9F)为复数的函数，i.e. $f: \mathbb{N} \rightarrow \mathbb{C}$.每个数论函数都可以被视为复数的[序列]().  
e.g. $f(n) = \sqrt{n} (n \in \mathbb{N})$

:::note
:::spoi 序列
序列（英语：Sequences）在数学中是指被排成一列的数学实体（如数字、函数），其中最常见的就是排成一列的数，即数列.
:::

若一个数论函数满足：

- $f(1)=1$
- 当 $a$ 和 $b$ 互质时，$f(ab) = f(a) f(b)$

则说它是一个**积性函数**，若不限制 $a$ 和 $b$ 互素，我们说此函数为**完全积性函数**.

:::tip
要求 $f(1)=1$ 是因为 $f(a) = f(a)*f(1)$, $f(1) = 1$ 就是显然的了.
:::

:::note
**性质**  
积性函数的值完全由质数的幂决定，i.e. 若将 $n$ 表示成质因数分解式如 $p_1^{a_1} p_2^{a_2} ... p_k^{a_k}$，那么 $f(n) = f(p_1^{a_1})f(p_2^{a_2})...f(p_k^{a_k})$.  
若 $f$ 为积性函数且 $f(p^n) = f(p)^n$，则 $f$ 为完全积性函数.
:::

## 0x2 莫比乌斯反演

莫比乌斯反演是数论中的重要内容．对于一些函数 $f(n)$，如果很难直接求出它的值，而容易求出其倍数和或约数和 $g(n)$，那么可以通过莫比乌斯反演简化运算，求得 $f(n)$ 的值．

### 0x21 莫比乌斯函数

莫比乌斯函数定义为:  
若 $n$ 可分解为 $p_1^{a_1} p_2^{a_2} ... p_k^{a_k}$,则
$$
\mu(n) =
\begin{cases}
1, & n = 1,\\
0, & \exists i\; st.\;a_i > 1,\\
(-1)^k, & other\;cases.
\end{cases}
$$

:::impo
后文若无特殊说明，$p_i$ 一般是指质数.
:::

:::note
**性质** 莫比乌斯函数是积性函数，但不是完全积性函数.
:::spoi 证明
注意互素的限制条件就容易证明了，还看啥详细证明🤪.
:::

:::note
**重要性质**  
对于 $n\in\mathbb{N^+}$，有
$$
\Sigma_{d|n}u(d)=[n=1]=
\begin{cases}
1, & n = 1,\\
0, & n \neq 1.
\end{cases}
$$
其中 $[\cdot]$ 是 Iverson 括号.
:::spoi 证明
令 $n = \Pi_{i=1}^k p_i^{e_i}$，设 $n' = \Pi_{i=1}^{k}p_i$ 根据二项式定理，有
$$
\Sigma_{d|n} \mu(d) = \Sigma_{d|n'} \mu(d) \tag{1}
$$
$$
= \Sigma_{i=0}^k \binom{k}{i}(-1)^i \tag{2}
$$
$$
= (-1 + 1)^k = [k = 0] = [n = 1] \tag{3}
$$

第 (1) 步实际上只需要想到如果 $d$ 中含有一个 $e_i > 1$ 的 $p_i$ 那么 $\mu(d) = 0$ 就很好想到了；  
第 (2) 步需要注意的是 $\mu(d) \neq k$，而是 $d$ 自己的不同质因数的个数（只有我自己需要注意吧😭），于是就可以得到这个结果了.  
:::

:::spoi Iverson 括号
用来将逻辑条件转化为数值
$$
[P]=
\begin{cases}
1, & if\;P\;is\;true,\\
0, & if\;P\;is\;false.
\end{cases}
$$
:::

### 0x22 莫比乌斯反演

:::note
设 $f(n),\;g(n)$ 是两个数论函数，那么有  
$$f(n) = \Sigma_{d|n}g(d)\Leftrightarrow g(n)=\Sigma_{d|n}\mu(\frac{n}{d})f(d)$$
:::spoi 证明
直接验证：
$$
\Sigma_{d|n}\mu(\frac{n}{d})f(d)=\Sigma_{k|n}g(k)\Sigma_d[k|d|n]\mu(\frac{n}{d}) \tag{1}
$$
$$
=\Sigma_{k|n}g(k)\Sigma_{d|n}[\frac{n}{d}|\frac{n}{k}]\mu(\frac{n}{d}) \tag{2}
$$
$$
=\Sigma_{k|n}g(k)[\frac{n}{k} = 1] \tag{3}
$$
$$
= g(n) \tag{4}
$$

第 (1) 步就是通过 $f(n) = \Sigma_{d|n}g(d)$ 的条件将原本式子中的 f(d) 给换掉，于是那个整除的条件就很显而易见了(需要注意的是第二个 $\Sigma$ 实际上是没有限制 $d$ 的).  
第 (2) 步就是一个命题的等价了，注意此时的 $\Sigma$ 是有限制 $d|n$ 的.  
第 (3) 步利用了前面的重要性质。  
第 (4) 步是因为 $[\frac{n}{k} = 1]$ 不为 0 的唯一取值就是 $k = n$

其中 $k|d|n$ 仍然是一个命题，表示 $k|d$ 且 $d|n$
:::

下面给出欧拉函数在莫比乌斯反演的应用：

欧拉函数 $\phi(n)$ 满足 $n = \Sigma_{d|n}\phi(d)$，那么 $\phi(n) = \Sigma_{d|n}\mu(\frac{n}{d})d$

:::note
:::spoi 欧拉函数性质的证明
上面提到 $n = \Sigma_{d|n}\phi(d)$  
后补充
:::

## 0x3 扩展欧几里得

下面是一个使用 C++ 实现的扩展欧几里得算法：

```cpp
int exgcd(int a, int b, int& x, int& y) {
  if (!b) {
    x = 1, y = 0;
    return a;
  }
  int t, res;
  res = exgcd(b, a % b, t, x);
  y = t - (a / b) * x;
  return res;
}
```

其证明见文末 [refrences](#refrences)

扩展欧几里得算法可以用来求解逆元，$a \pmod{m}$ 的逆元存在的充要条件是 $(a, m) = 1$.

我们可以将求解逆元等价于求解 $\exists s,t\; sa + tm = (a, m) = 1 \Leftrightarrow sa - 1 = -tm \Leftrightarrow sa \equiv 1 \pmod{m}$.

## 0x4 中国剩余定理（Chinese Remainder Theorem）

见我的这篇[笔记](/ChineseRemainderTheorem.html)

## 0x5 RSA 相关攻击

### 0x51 RSA 算法：

#### 计算密钥

1. 选取两个大素数 $p$，$q$，$p \neq q$；
2. 计算 $N = pq$, $\phi(N) = (p - 1)(q - 1)$；
3. 随便选取一个 $e$ 满足 $e < \phi(N)$ 且 $(e, \phi(N)) = 1$；
4. 计算 $ed \equiv 1 \pmod{\phi(N)}$ 获得 $d$；

获得公钥 $(N, e)$，私钥 $(N, d)$.

从上面的过程可以发现，$\phi(n),\;p,\;q,\;d$ 的值应该严格保密.

:::tip
一般来说我们会将 e 设置为 $65535$.
:::

#### 加密原理

假设明文为 $n$.

:::tip
我们所说的明文一般是指的是一个数，真正在现实生活中，比如要加密一个 flag：

```js
flag{the_flag}
```
我们就是遍历每一个字符，然后拿到 ASCII 码，使用 RSA 进行加密，最终得到一个数字的序列，就是密文了，当然，这是 CTF 比赛中常见的做法. 一个更加真实的使用场景可能是 [ssh 登录](https://zh.wikipedia.org/wiki/Secure_Shell#SSH%E7%9A%84%E5%AE%89%E5%85%A8%E9%AA%8C%E8%AF%81).
:::

密文 $c = n^d\;mod\;N$，注意这个地方的模不是 $\phi(N)$ 而是 $N$（如果 $\phi(N)$ 都告诉你了还加密啥啊😄）.

明文 $n = c^e\;mod\;N$.

其具体原理是，$c^e\;mod\;N=n^{ed}\;mod$，又 $ed \equiv 1 \pmod{\phi(N)}$，那么 $ed = 1 + h\phi(N),\;h \in \mathbb{Z}$，则 $n^{ed} = n \cdot n^{h\phi(N)}$.

1. 若$(n,N) = 1$，由欧拉定理，$n^{\phi(N)} \equiv 1 \pmod N$，则 $n^{ed} \equiv n \cdot 1 \equiv n \pmod{N}$.
2. 否则，不妨设 $n = pk$（$p$ 就是前面生成 $N$ 的素数），  
则 $n^{ed} = k^{ed} p^{ed}$，  
那么 $n^{ed} \equiv 0 \equiv n \pmod{p}$，  
又因为 $ed = 1 + h\phi(N) = 1 + h(p - 1)(q - 1)$，  
所以 $n^{ed} = n \cdot (n^{q-1})^{h(p-1)} \equiv n \cdot 1^{h(p-1)} \equiv n \pmod{q}$  
所以 $n^{ed} \equiv n \pmod N$ （使用定理 1）

:::note
:::spoi 定理 1
![20251107-342413f8cccec710.png](./images/20251107-342413f8cccec710.png)
:::

### 0x52 共模攻击

如果两个用户使用了**相同的模数**（也就是说两个大素数一个没换），只是使用了不同的私钥，我们就有机会使用 RSA 共模攻击，具体来说，若：

1. 使用了同一个 $N$；
2. 加密了用一个明文 $m$；
3. 加密指数不同且 $(e_1, e_2) = 1$

那么我们就可以求得 $m$，考虑下面的加密：

$$
\begin{cases}
c1 \equiv m^{e_1} \pmod{N}\\
c2 \equiv m^{e_2} \pmod{N}
\end{cases}
$$

由贝祖定理，$e_1s + e_2t = 1$，我们有

$$
c_1^sc_2^t \equiv m^{se_1}m^{te_2} \equiv m \pmod N
$$

而 $s,\;t$ 我们是可以使用扩展欧几里得直接解出来的，由此就可以达成攻击效果.

但是 $(e_1, e_2) = 1$ 要求还是有点高了，若使用 CRT 定理呢？

### 0x53 CRT 加速 RSA

定义以下参数：

| 参数              | 含义                          | 模量    |
|-------------------|-------------------------------|---------|
| $d_p=d mod (p-1)$ | 私钥指数在模 $p - 1$ 下的简化 | $p - 1$ |
| $d_q=d mod (q-1)$ | 私钥指数在模 $q - 1$ 下的简化 | $q - 1$ |

再定义：
$$
m_p = c^{d_p} \bmod{p} = c^{d + k_1(p-1)} \bmod{p} = c^d \bmod p\\
m_q = c^{d_q} \bmod{q} = c^{d + k_2(q-1)} \bmod{q} = c^d \bmod q
$$

:::note
运用欧拉定理不是要求 $(c, p) = 1$ 吗？  
是的，如果 $(c, p) \neq 1$ 的话，那么:  
$p \mid c$（$c \mid p$ 与 $p$ 是素数矛盾）,故 $c^{d + k_1(p-1)} \bmod{p} = 0 = c^d \bmod p$
:::

设下面的方程 $(S)$:

$$
(S'):
\begin{cases}
x \equiv c^d \pmod{p}\\
x \equiv c^d \pmod{q}
\end{cases}
$$

我们就可以得到 $x \equiv c^d \pmod{N}$，,也就是说 $x$ 就是我们要找的解密之后的明文，同时，该方程又等价于

$$
(S):
\begin{cases}
x \equiv m_p \pmod{p}\\
x \equiv m_q \pmod{q}
\end{cases}
$$

$$
m = pq = N\\
M_1 = q,\; M_2 = p\\
M_1t_1 \equiv 1 \pmod{p} \Leftrightarrow qt_1 \equiv 1 \pmod{p}\\
M_2t_2 \equiv 1 \pmod{q} \Leftrightarrow pt_2 \equiv 1 \pmod{q}\\
x = m_pqt_1 + m_qpt_2
$$

由此我们就实现了 CRT 加速 RSA.

#### 基于 CRT 的低加密指数广播攻击

如果在某次加密中加密指数 $e$ 的值较小，比如 $e = 3$，那么有 $c \equiv m^3 \pmod{N}$.

1. 若 $m$ 较小，导致 $m^3 < N$，$\bmod N$ 未起作用，我们就可以直接开立方拿到明文了；
2. 若 $m$ 较大，我们仍有可能拿到明文，具体方法见下.

假设有 $k$ 个用户同时收到了同一个明文 $m$ 使用同一个指数 $e$ 加密得到的密文，我们就可以设下面的方程：

$$
\begin{cases}
m^e \equiv c_1 \pmod{N_1}\\
m^e \equiv c_2 \pmod{N_2}\\
\vdots\\
m^e \equiv c_k \pmod{N_k}\\
\end{cases}
$$

若 $gcd(N_1, N_2, ... ,N_k) = 1$，那么我们可以使用 CRT，得到：

$$
M = \Pi_{i=1}^k N_1\\
M_i = M / N_i\\
M_it_i \equiv 1 \pmod{N_i}\\
m^e = \Sigma_{i=1}^k c_iM_it_i + k{\Pi_{i=1}^k N_i}
$$

需要注意的是，**这个 $m^e$ 实际上只有一个解是真正的结果**，所以我们只能在 $m^e < {\Pi_{i=1}^k N_i}$ 的情况下可以通过开方来获得明文.

这个地方之所以要求 $e$ 较小，就是为了让最终的 $m^e$ 能够不那么大，同时，如果我们已知的密文越多，就越有可能拿到明文.

<br/>

<b id="refrences">refrences</b>  
算术函数 https://zh.wikipedia.org/wiki/%E7%AE%97%E8%A1%93%E5%87%BD%E6%95%B8  
积性函数 https://zh.wikipedia.org/wiki/%E7%A9%8D%E6%80%A7%E5%87%BD%E6%95%B8  
莫比乌斯反演 https://oi-wiki.org/math/number-theory/mobius/  
欧拉函数 https://zh.wikipedia.org/wiki/%E6%AC%A7%E6%8B%89%E5%87%BD%E6%95%B0  
欧拉函数 https://baike.baidu.com/item/%E6%AC%A7%E6%8B%89%E5%87%BD%E6%95%B0/1944850  
关于欧拉函数及一些性质的美妙证明 https://zhuanlan.zhihu.com/p/36979522  
扩展欧几里得算法 https://zh.wikipedia.org/wiki/%E6%89%A9%E5%B1%95%E6%AC%A7%E5%87%A0%E9%87%8C%E5%BE%97%E7%AE%97%E6%B3%95  
扩展欧几里得算法 https://oi-wiki.org/math/number-theory/gcd/#%E6%89%A9%E5%B1%95%E6%AC%A7%E5%87%A0%E9%87%8C%E5%BE%97%E7%AE%97%E6%B3%95  
Introduction to Algorithms https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/  
中国海洋大学网络攻防先导实践 Crypto2 课堂讲义

<b id="read-more">readmore</b>  
[狄利克雷卷积和莫比乌斯反演](https://zhuanlan.zhihu.com/p/646539446)

<br/>
<br/>
<br/>

:::note
**特别声明**：本页面采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) 协议
:::
