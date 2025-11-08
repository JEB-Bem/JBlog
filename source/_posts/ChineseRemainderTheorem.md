---
title: "中国剩余定理笔记"
date: 2025/11/07 19:16:40
tags: crypto
categories: 笔记
filename: ChineseRemainderTheorem.md
---

----
待完善:
- [ ] 包含算法导论的讲义
- [x] 包含 wikipedia 的讲义

## Introduction

孙子提出了这样一个问题：

找出所有整数 $x$，它们被 $3$，$5$ 和 $7$ 除时，余数分别为 $2$, $3$ 和 $2$。一个这样的解是 $x = 23$，所有的解是形如 $23 + 105k$（$k$ 为任意整数）的整数。

中国剩余定理说明，对一组两两互质的模数（$3$，$5$ 和 $7$）来说，其取模运算的方程组对其积（$105$）取模运算的方程之间存在一种对应关系。 

## Description

用现代数学的语言描述，孙子定理给出了以下的一元线性同余方程组有解的判定条件，并用构造法给出了在有解情况下的解的具体形式。

$$
(S):
\begin{cases}
x \equiv a_1 \pmod{m_1}\\
x \equiv a_2 \pmod{m_2}\\
\hspace{1.1em}\vdots\\
x \equiv a_m \pmod{m_m}\\
\end{cases}
$$

中国剩余定理说明：假设整数 $m_1,m_2,m_3,...,m_n$，则对任意的整数：$a_1, a_2, ..., a_n$，方程组 $(S)$ 有解，并且可以通过如下方式构造得到：

1. 设 $m = m_1 \times m_2 \times ... \times m_n = \Pi_{i=1}^{n}m_i$ 是整数 $m_1,m_2,m_3,...,m_n$ 的乘积，并设 $M_i = m/m_i$；
2. $t_i$ 是线性同余方程 $M_it_i \equiv 1 \pmod{m_i}$ 的一个解；
3. 方程组 $(S)$ 有整数解，解为 $x = \Sigma_{i=1}^n a_iM_it_i$. 这个解是一个特解，通解为 $x + km (k \in \mathbb{Z})$.

:::spoi 证明
因为 $M_i = m/m_i$ 是除了 $m_i$ 之外所有模数的倍数，所以 $\forall k \neq i, a_iM_it_i \equiv 0 \pmod{m_k}$。  
又因为 $a_iM_it_i \equiv a_i \pmod{m_i}$，所以代入 $x = \Sigma_{i=1}^{n}a_iM_it_i$，原方程成立.

另外，假设 $x_1$ 和 $x_2$ 都是方程组 $(S)$ 的解，那么：
$$
\forall i \in \{1,2,...,n\}, x_1 - x_2 \equiv 0 \pmod {m_i}.
$$
而 $m_1, m_2, ..., m_n$ 两两互质，这说明 $m = \Pi_{i=1}^n m_i$ 整除 $x_1 - x_2$. 所以方程组 $(S)$ 的任何两个解之间必然相差 $m$ 的整数倍。而另一方面，$x = \Sigma_{i=1}^{n}a_iM_it_i$ 是一个解，这就说明了方程组 $(S)$ 所有的解的集合就是：
$$
\{km + \Sigma_{i=1}^{n}a_iM_it_i, k \in \mathbb{Z}\}
$$
:::

<br/>
<br/>

<b id="refrences">refrences</b>  
《算法进阶指南》  
中国剩余定理 https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%89%A9%E4%BD%99%E5%AE%9A%E7%90%86
