---
filename: information-theory-ch1.md
date: 2026-03-30 10:33:19
title: 信息论基础 - Chapter 2 离散信源及其信息测度
tags:
- Information Theory
category: 信息论
description: 信息论基础笔记
---

> 教材：《信息论：基础理论与应用 第 4 版》-傅祖芸  
> 课程：《信息论基础》- [imlaosky](https://www.bilibili.com/video/BV1dE411x7xy/)  
> 这份笔记仅用于学习用途，资料来源主要是课程 PPT、教材和 references 中引用的参考资料. 部分内容直接来自上述材料，若有侵权，请[联系](mailto:jeb_alex@outlook.com)我删除.

## 一维信源的数学模型及其分类

**信源**是信息的来源，我们使用概率空间（样本空间+概率测度）来描述信源. 前文提到：

> 样本空间是所有可能的消息的集合

自然的，我们想到可以用随机变量来描述信源输出的消息(即确定的消息).

在实际情况中，有些信源输出的消息是有限或可数的，而且每次只输出其中一个消息，比如投掷骰子.

对于这种试验，其每次朝上一面都是 $1, 2, \dots 6$ 中的一点，我们就可以说这个信源输出的消息是 “朝上一面是 $1$ 点”等 6 个不同消息.

每次试验必定随机地出现 6 个消息中的一个，显然，这 6 个消息是两两互不相容的基本事件集合，我们用**符号** $a_i, i = 1, \dots, 6$ 来表示这些消息，得到符号集 $A:\{a_1, a_2, \dots, a_6\}$.

由大量试验结果证明，这些消息出现的概率是相等的，因此，用离散型随机变量 $X$ 来描述这个信源输出的消息. 这个随机变量 $X$ 的样本空间就是符号集 $A$; 而 $X$ 的概率分布就是各消息出现的先验概率，即 $P(X=a_i) = \frac{1}{6},\ i = 1, \dots, 6$. 我们就得到的描述这个信源的数学模型（概率空间）：

$$
\left[
\begin{array}{cc}
X\\
P(x)
\end{array}
\right]
=
\left[
\begin{array}{cccccc}
a_1, & a_2, & a_3, & a_4, & a_5, & a_6\\
\frac{1}{6}, & \frac{1}{6}, & \frac{1}{6}, & \frac{1}{6}, & \frac{1}{6}, & \frac{1}{6}
\end{array}
\right]
$$

且 $\sum_{i=1}^{6} P(a_i) = 1$.

上式表明，信源的概率空间必定是一个完备集（完备集的概念似乎定义在拓扑学中，又被称为完美集）.

像上面这种信源输出的都是单个符号（或代码）的消息，他们的符号集的取值都是有限的或可数的. 我们可用一维离散型随机变量 $X$ 来描述这些信源的输出. 这样的信源称为（**一维**）**离散信源**. 它的数学模型就是离散型的概率空间. 另外，有时也称概率空间为**信源空间**.

$$
\left[
\begin{array}{c}
X\\
P(x)
\end{array}
\right]
=
\left[
\begin{array}{cccc}
a_1, & a_2, & ..., & a_q \\
P(a_1), & P(a_2), & ..., & P(a_q)
\end{array}
\right]
$$

且 $\sum_{i=1}^{q} P(a_i) = 1$，左式被称为**概率的归一化**.

当输出消息的符号集 $A$ 的取值是连续的，即样本空间的取值是连续的，我们就称该信源是（**一维**）**连续信源**，我们可用一维连续型随机变量 $X$ 来描述这些信源的输出，信源的数学模型就是连续型的概率空间:

$$
\left[
\begin{array}{c}
X\\
p(x)
\end{array}
\right]
=
\left[
\begin{array}{c}
(a, b)\\
p(x)
\end{array}
\right]
$$

且 $\int_a^b p(x) dx = 1$. 其中 $p(x)$ 称为概率密度函数. 当进行连续信源的概率规一时，实际上是在进行无穷级数的收敛.

:::impo
上述离散信源和连续信源是最简单、最基本的情况. 信源只输出一个消息（符号），所以可以用一维离散信源来表示. 其余的信源我们稍后讨论.
:::

![20260330-c9d406228b9b7f19.png](./images/20260330-c9d406228b9b7f19.png)

## （一维）离散信源的信息熵

### 信息熵的概念和定义

进行一个试验，从直觉上看，我们获得的信息应该是*试验中所有基本事件发生所获得的信息量（[自信息](/information-theory-ch1.html#信息的不确定性)）的均值*. 我们称这个均值为**信息熵**，记作 $H$.

:::warn
严格来说，我们不能预先假设“信息熵是自信息的均值”，**信息熵**的定义是在以下公理的基础上推导出来的. 请抛弃上面给出的信息熵的定义.
:::

:::note
**公理1** 对有 $n$ 个等概率结果的试验，信息熵 $H$ 是 $n$ 的单调上升函数.
:::

对于有等概率结果的试验，样本空间越大，那么产生消息后我们获得的信息就越多，这是符合直觉的. 不多解释，下面我们来考虑一个分步试验例子:

考虑一个试验有三个结果 $A, B, C$：

- $p(A) = \frac{1}{2}$
- $p(B) = \frac{1}{4}$
- $p(C) = \frac{1}{4}$

那么这个试验应该有一个不确定性，我们记为 $H(\frac{1}{2}, \frac{1}{4}, \frac{1}{4})$.

分成两步来看：

- 第一步：判断是不是 $A$，我们有一个不确定性 $H(\frac{1}{2}, \frac{1}{2})$
- 第二步：不是 $A$，再判断是 $B$ 还是 $C$，这一步也有不确定性 $H(\frac{1}{2}, \frac{1}{2})$ （注意我们已经在 $A$ 不发生的条件下了）

第一步的不确定一定会贡献给整个试验，但第二步实际上只有 $\frac{1}{2}$ 的概率会贡献给整个试验，所以我们要 $\times \frac{1}{2}$.

因此整个试验的不确定性应该满足：

$$
H(\frac{1}{2}, \frac{1}{4}, \frac{1}{4}) = H(\frac{1}{2}, \frac{1}{2}) + \frac{1}{2} H(\frac{1}{2}, \frac{1}{2})
$$

其核心是**第二步不是无条件发生的，而是“在第一步某个结果出现时才发生”**.

上面的过程可以一般化为：

$$
X \left[
\begin{array}{ccc}
A_1 & A_2 & A_3\\
p_1 & p_2 & p_3\\
\end{array}
\right]
$$

分步进行（分步实际上不是现实中真的拆成两步，而是在计算时分成两步来看）：

$$
\begin{aligned}
\text{Step 1: } &X_1 \left[
\begin{array}{cc}
p_1 & p_2 + p_3
\end{array}
\right]
A = A_1,\ B = A_2 \cup A_3
\\
\text{Step 2: } &X_2 \left[
\begin{array}{cc}
A_2 & A_3\\
\frac{p_2}{p_2 + p_3}  & \frac{p_3}{p_2 + p_3}
\end{array}
\right]
\end{aligned}
$$

于是有 $H(p_1, p_2, p_3) = H(p_1, p_2 + p_3) + (p_2 + p_3)H(\frac{p_2}{p_2 + p_3} , \frac{p_3}{p_2 + p_3})$.

:::note
**公理 2** 一个试验分成相继的两个试验时，未分之前的 $H$ 是分步之后 $H$ 的加权和，即
$$
H(p_1, p_2, p_3) = H(p_1, p_2 + p_3) + (p_2 + p_3)H(\frac{p_2}{p_2 + p_3} , \frac{p_3}{p_2 + p_3})
$$
:::

如果概率分布发生一个**任意小的变化**，例如把某两个事件的概率作微小调整

$$
(p_1,\dots,p_i,\dots,p_j,\dots,p_n)
\rightarrow
(p_1,\dots,p_i-\mu,\dots,p_j+\mu,\dots,p_n),
$$

其中 $\mu \to 0$，那么对应的不确定性度量也只能发生任意小的变化，即

$$
\lim_{\mu \to 0} H(p_1,\dots,p_i-\mu,\dots,p_j+\mu,\dots,p_n)
=
H(p_1,\dots,p_i,\dots,p_j,\dots,p_n).
$$

换句话说，要求信息量函数对概率扰动是稳定和平滑的，排除了概率微小变化却导致信息量突变的不合理函数.

:::note
**公理 3** $H$是概率 $p(a_i)$ 的连续函数.
:::

由以上三个公理可以得到信息熵的定义式：

$$
\begin{aligned}
H &= \sum_{i=1}^n p_i \log p_i\\
&= E[\log \frac{1}{p(x_i)} ]
\end{aligned}
$$

:::spoi 信息熵的定义式推导

**引理 1**[^1] 设 $m,n \in \N$ 且 $m \geq 2$. 则对任意正整数 $k$，存在唯一正整数 $l$，使得
$$
m^l \leq n^k < m^{l+1}
$$
[^1]: 本文不进行证明，可能有帮助的[参考](https://math.stackexchange.com/questions/3300698/terence-tao-analysis-i-ex-5-5-2-entry-point-needed)

**引理 2** 若 $f(n)$ 是 $n$ 的单调上升函数，且对一切正整数 $m$, $n$ 成立 $f(mn) = f(m) + f(n)$，则

$$
\begin{aligned}
f(n) = C \log n \tag{1}
\end{aligned}
$$

其中 $C$ 是一个正常数.

**证明** 由 $\text{(1)}$ 得 $f(1) = 0$，故对其他正整数 $m$ 有 $f(m) > 0$，且

$$
\begin{aligned}
f(n^2) &= f(n) + f(n) = 2f(n)\\
f(n^3) &= f(n^2) + f(n) = 3f(n)
\end{aligned}
$$

一般地
$$
f(n^k) = kf(n) \tag{2}
$$

由引理 1,若 $n, m$ 是两个任意的正整数，$m \neq 1$， 选任意大的正整数 $k$，再取正整数 $l$，使

$$
m^l \leq n^k < m^{l+1} \tag{3}
$$

由函数的单调性，$f(m^l) \leq f(n^k) < f(m^{l+1})$

由 $\text{(3)}$ 得
$$
lf(m) \leq kf(n) < (l+1)f(m)\\
\Rightarrow \frac{l}{k} \leq \frac{f(n)}{f(m)} < \frac{l+1}{k} \tag{4}
$$

由 $\text{(3)}$ 取对数得
$$
l \log m \leq k\log n < (l + 1) \log m\\
\Rightarrow \frac{l}{k} \leq \frac{\log n}{\log m} < \frac{l+1}{k} \tag{5}
$$

由 $\text{(4) (5)}$ 得 $\left|\frac{f(n)}{f(m)} - \frac{\log n}{\log m}\right| < \frac{1}{k}$ （由最大值减最小值得到）.

上式对任意大的 $k$ 都成立，因此

$$
\frac{f(n)}{f(m)} = \frac{\log n}{\log m}
$$

由 $m, n$ 的任意性，取 $m = a$ （$a$ 为 $log$ 的底数）

$$
\frac{f(n)}{f(a)} = \frac{\log n}{1}\\
\Rightarrow f(n) = f(a)\log n = C \log n
$$

（By lhw）

由于 $f(a) > 0$，所以 $C$ 是正数.

下面来证明熵的唯一表达式是：

$$
H = -C \sum_{i=1}^n p_i \log p_i
$$

**证明** 首先，记 $H(\frac{1}{n}, \frac{1}{n}, \dots, \frac{1}{n}) = f(n)$，由公理 1 可知 $f(n)$ 是 $n$ 的单调上升函数；对于 $mn$ 个等概结果的试验，可以把它分解为 $m$ 个有 $n$ 个等概结果的试验，因此由公理 2[^2] 可知

[^2]: 可以这样理解：第一步判断是在前 $(m - 1)n$ 个结果中，还是在最后 $n$ 个结果中，于是第一步的贡献为 $H(\frac{1}{mn}, \frac{1}{mn}, \dots, \frac{1}{mn}, \frac{1}{m})$，第二步，若是在最后 $n$ 个结果中，判断是哪一个，贡献为 $\frac{1}{m} H(\frac{1}{n}, \frac{1}{n}, \dots, \frac{1}{n})$，因此 $H(X) = H(\frac{1}{mn}, \frac{1}{mn}, \dots, \frac{1}{mn}, \frac{1}{m}) + \frac{1}{m} H(\frac{1}{n}, \frac{1}{n}, \dots, \frac{1}{n})$，继续递归地拆分 $n$ 个出来.

$$
f(mn) = f(m) + \sum^{m}_{i=1}\frac{1}{m}f(n) = f(m) + m \cdot \frac{1}{m} f(n)  = f(m) + f(n)
$$



利用引理 2 得到

$$
H(\frac{1}{n}, \frac{1}{n}, \dots, \frac{1}{n}) = C \log n
$$

当 $p_1, p_2, \dots, p_n$ 是有理数时，不妨记 $p_i = \frac{n_i}{\sum^{n}_{i=1} n_i}$[^3]（对于所有 $p_i$，我们进行通分，然后将 $p_i$ 的分子设为 $n_i$），考虑一个有 $m = \sum^{n}_{i=1} n_i$ 个等概结果的试验，这个试验又可以看作两个相继的试验，其中第一个试验一概率 $p_i$ 出现结果 $A_i$；而第二个试验则是在出现结果 $A_i$ 的基础上（$A_i$ 中有 $n_i$ 个基本事件)，考察它是出现在 $n_i$ 个等概结果中的哪一个，因此据公理 2 有

[^3]: 有理数可以表示为 $\frac{a}{b} (a, b \in \Z)$ 的形式.

$$
\begin{aligned}
C \log \sum^{n}_{i=1} n_i &= H(\frac{1}{m}, \frac{1}{m}, \dots, \frac{1}{m})\\
&= H(p_1, p_2, \dots, p_n) + \sum^{n}_{i=1} C \log n_i\\
&= H(p_1, p_2, \dots, p_n) + C \sum^{n}_{i=1} \log n_i
\end{aligned}
$$

于是

$$
\begin{aligned}
H(p_1, p_2, \dots, p_n) &= C\left[1 \cdot \log \sum^{n}_{i=1} n_i - \sum^{n}_{i=1} p_i \log n_i \right]\\
&= C \left[\sum^{n}_{i=1}p_i \cdot \left(\log \sum^{n}_{i=1} n_i\right) - \sum^{n}_{i=1} p_i \log n_i \right]\\
&= C \left[\sum^{n}_{i=1} \left( p_i \log \sum^{n}_{i=1} n_i \right) - \sum^{n}_{i=1} p_i \log n_i \right]\\
&= C \left[ \sum^{n}_{i=1} p_i \left( \log \sum^{n}_{i=1} n_i - \log n_i \right) \right]\\
&= C \sum^{n}_{i=1} p_i \left( \log \frac{\sum^{n}_{i=1} n_i}{n_i}  \right)\\
&= -C \sum^{n}_{i=1} p_i \log p_i
\end{aligned}
$$

最后，对任意的 $p_1, p_2, \dots, p_n$，可用有理数来逼近它（通过公理 3），因此上述表达式仍然成立.

**证毕**！

底数可以任意选取，我们一般选取底数为 $2$，并取 $C = 1$，原因是因为只要我任意改变底数的选取，就相当于是同时调整底数和常数，举例说明：

$$
\begin{aligned}
-C \sum^{n}_{i=1} p_i \log_b p_i &= - \sum^{n}_{i=1} p_i log_b p_i^C\\
&= - \sum^{n}_{i=1} p_i \frac{\log_2 p_i^C}{\log_2 b}\\
&= - \sum^{n}_{i=1} p_i \frac{C\log_2 p_i}{\log_2 b}\\
&= - \frac{C}{\log_2 b} \sum^{n}_{i=1} p_i \log_2 p_i
\end{aligned}
$$

简而言之，我们一般通过取 $C = 1$，然后变换底数来改变信息熵的单位.
:::

----

从均值的形式也可以推出自信息的定义式：

$$
I(x_i) = \log \frac{1}{p(x_i)} = - \log p(x_i)
$$

**信息熵**的物理含义：

- 表示输出消息**前**，信源的平均不确定性
- 表示输出消息**后**，每个符号所携带的平均信息量

### 信息熵的性质

::::tip
:::spoi 概率矢量(随机矢量)
当信源消息集（即符号集）的个数 $q$ 给定时，信源的信息熵就是概率分布 $P(x)$ 的函数，我们可用**概率矢量** $\bold{P}$ 来表示概率分布 $P(x)$:
$$
\bold{P} = \left(P(a_1), P(a_2), \dots, P(a_q)\right) = (p_1, p_2, \dots, p_q)
$$

这样，信息熵 $H(X)$ 是概率矢量 $\bold{P}$ 或它的分量 $p_1, p_2, \dots, p_q$ 的$q-1$ 元函数（各分量满足 $\sum^{q}_{i=1} p_i = 1$，所以 独立变量只有 $q-1$ 元）. 我们可以将熵的定义式写成

$$
\begin{aligned}
H(X) &= - \sum^{q}_{i=1} P(a_i)\log P(a_i) = -\sum^{q}_{i=1} p_i\log p_i\\
&= H(p_1, p_2, \dots, p_q) = H(\bold{P})
\end{aligned}
$$

$H(\bold{P})$ 是概率矢量 $\bold{P}$ 的函数，我们称 $H(\bold{P})$ 为熵函数. 当 $q=2$ 时，因为 $p_1 + p_2 = 1$，所以将 $2$ 个消息的熵函数写成 $H(p_1)$ 或 $H(p_2)$.
:::
::::

从定义直接得到
- 对称性：只与概率空间结构有关，与各概率的顺序无关：  
  $$
  H(p_1, p_2, \dots, p_n) = - \sum^{n}_{i=1} p_i \log p_i = H(p_{l1}, p_{l2}, \dots, p_{ln})
  $$

- 确定性：消息一定的信源没有不确定性，没有信息量：
  $$
  H(1, 0) = H(0, 1) = H(1,0,0,\dots,0) = 0
  $$

- 递增性：越琐碎，熵越大，公理 2 也是一个体现，分步试验的熵比分步的第一个试验的熵大
  $$
  H(p_1,p_2,\dots,p_{n-1},q_1, q_2,\dots, q_m) = H(p_1, p_2, \dots, p_{n-1}, p_n) + p_n H(\frac{q_1}{p_n}, \frac{q_2}{p_n}, \dots, \frac{q_m}{p_n})
  $$
  其中，$\sum^{n}_{i=1} p_i = 1, \sum^{m}_{j=1} q_j = p_n$.

  将概率为 $p_n$ 的事件分拆为 $m$ 个之后熵“变大”了.  
  （可用熵的定义式来证明这个性质）

绘制一维熵函数的图象可得
- 非负性
  $$
  H(X) \geq 0
  $$
- 极值性  
  **Jensen 不等式**  
  设 $\phi(x)$ 是 $[a, b]$ 上的上凸函数，而 $x_1, x_2, \dots, x_n$ 是 $[a, b]$ 中的任意点，$\lambda_1, \lambda_2, \dots, \lambda_n$ 是和为 $1$ 的正数，则
  $$
  \sum^{n}_{i=1} \lambda_i \phi(x_i) \leq \phi(\sum^{n}_{i=1} \lambda_i x_i)
  $$
  由此可以推出公理 1，即信源符号等可能时，信源熵最大. 等概分布的信源的平均不确定性最大.
- 上凸性  
  $H(\bold{P})$ 是严格上凸函数，即对任意概率矢量 $\bold{P}_1$ 和 $\bold{P}_2$ 以及任意 $0 < \theta < 1$ 有

  $$
  H[\theta\bold{P}_1 + (1 - \theta)\bold{P}_2] > \theta H(\bold{P}_1) + (1 - \theta) H(\bold{P_2})
  $$

  ::::tip
  :::spoi 上凸性
  我们来回顾一下上凸性的定义.  
    若函数 $f(x)$ 上任取两点 $x_1, x_2$，对任意 $\lambda \in [0, 1]$，都满足 $f(\lambda x_1 + (1 - \lambda) x_2) \geq \lambda f(x_1) + (1 - \lambda) f(x_2)$，我们就说这个函数是上凸的.
  ![20260407-277dabdf750c05b6.png](./images/20260407-277dabdf750c05b6.png)
  :::
  :::spoi 证明熵函数的上凸性
  先证明 $f(x) = -x\log x$ 是凹函数：
  $$
  \begin{aligned}
  f'(x)  &= -(\log{x} + \frac{1}{\ln 2} )\\ \Rightarrow
  f''(x) &= - \frac{1}{x\ln{2}}
  \end{aligned}
  $$
  因为 $x > 0$，所以 $f''(x) < 0$，所以 $f(x)$ 是上凸函数.  
  于是对 $\forall a, b > 0$ 和 $0 \leq \lambda \leq 1$ 有
  $$
  f(\lambda a + (1 - \lambda)b) \geq \lambda f(a) + (1 - \lambda) f(b)
  $$
  对于概率矢量 $\bold{P}_1, \bold{P}_2$，取第 $i$ 个分量 $p_{1i}$ 和 $p_{2i}$，有
  $$
  f(\lambda p_{1i} + (1 - \lambda)p_{2i}) \geq \lambda f(p_{1i}) + (1 - \lambda) f(p_{2i})
  $$
  全部分量求和，有
  $$
  \sum^{n}_{i=1} f(\lambda p_{1i} + (1 - \lambda)p_{2i}) \geq \lambda \sum^{n}_{i=1} f(p_{1i}) + (1 - \lambda) \sum^{n}_{i=1} f(p_{2i})
  $$
  左边正是
  $$
  H(\lambda \bold{P}_1 + (1 - \lambda) \bold{P}_2)
  $$
  右边正是
  $$
  \lambda H(\bold{P}_1) + (1 - \lambda) H(\bold{P}_2)
  $$
  :::
  ::::


公理 3，微小扰动对熵的影响也小:
- 扩展性
  $$
  \lim_{\varepsilon \to 0} H_{q+1}(p_1, p_2, \dots, p_q - \varepsilon, \varepsilon) = H_q(p_1, p_2, \dots, p_q)
  $$
  **证明**（By [imlaosky](https://www.bilibili.com/video/BV1dE411x7xy/))
  $$
  \begin{aligned}
    &H_{q+1}(p_1, p_2, \dots, p_{q}-\varepsilon, \varepsilon)\\
  = &-\left[ \sum^{q-1}_{i=1} p_i \log p_i + (p_q - \varepsilon)\log (p_q - \varepsilon) + \varepsilon \log \varepsilon \right]
  \end{aligned}\\
  \begin{aligned}
  \because &\lim_{\varepsilon \to 0} \varepsilon \log \varepsilon
  = \lim_{\varepsilon \to 0} \frac{\log \varepsilon}{\frac{1}{\varepsilon}}
  = \lim_{\varepsilon \to 0} \frac{\frac{1}{\varepsilon}}{-\frac{1}{\varepsilon^2} }
  = \lim_{\varepsilon \to 0} \varepsilon = 0\\
  \text{and} &\lim_{\varepsilon \to 0} \left( p_q - \varepsilon \right) \log (p_q - \varepsilon)\\
  = &\lim_{\varepsilon \to 0}p_q \log (p_q - \varepsilon) - \lim_{\varepsilon \to 0} \varepsilon \log (p_q - \varepsilon)\\
  = &p_q \log p_q
  \end{aligned}\\
  \therefore
  \lim_{\varepsilon \to 0} H_{q+1}(p_1, p_2, \dots, p_q - \varepsilon, \varepsilon) = H_q(p_1, p_2, \dots, p_q)
  $$

- 条件可加性与独立可加性[^4]  
  **条件熵**：设 $\alpha, \beta$ 是前述两个试验，以 $p(B_l | A_k)$ 记试验 $\alpha$ 出现结果 $A_k$ 的条件下，试验 $\beta$ 出现结果 $B_l$ 的概率，则

  $$
  H_{A_k}(\beta) = - \sum^{n}_{l=1} p(B_l | A_k) \log p (B_l | A_k)
  $$
  是在试验 $\alpha$ 出现 $A_k$ 的条件下，试验 $\beta$ 的熵.

  我们称平均值
  $$
  H_\alpha(\beta) = \sum^{m}_{k=1}p(A_k)H_{A_k}(\beta)
  $$
  为试验 $\alpha$ 实现的条件下试验 $\beta$ 的条件熵. 条件熵有这些重要性质：

  1. $H(\alpha \beta) = H(\alpha) + H_\alpha(\beta)$
    $$
    \begin{aligned}
    H(\alpha\beta)
    &= -\sum_{k, l} p(A_kB_l)\log p(A_kB_l)\\
    &= -\sum_{k, l} p(A_k)p(B_l | A_k)\left[ \log p(A_k) + \log p(B_l | A_k) \right]\\
    &= - \sum_k p(A_k)\log p(A_k)\sum_l p(B_l \mid A_k) \\
    &\quad - \sum_k p(A_k)\sum_l p(B_l \mid A_k)\log p(B_l \mid A_k) \\
    &= H(\alpha) \cdot 1 + \sum_{k}p(A_k) H_{A_k}(\beta) \\
    &= H(\alpha) + H_{\alpha}(\beta)
    \end{aligned}
    $$

  2. 当 $\alpha$ 与 $\beta$ 独立时，$H_{\alpha}(\beta) = H(\beta)$，由 (i) 得

    $$
    H(\alpha\beta) = H(\alpha) + H(\beta)
    $$

  3. $H_\alpha(\beta)$ 非负，且若所有 $p(A_i) > 0$，则当且仅当 $H_{A_i}(\beta) = 0 (i = 1,...,m)$ 时，$H_\alpha(\beta)=0$ 才成立，此时还有 $H(\alpha\beta) = H(\alpha)$. 这个性质实际上说明了当试验 $\alpha$ 的任何结果都使试验 $\beta$ 的去确定性完全消除时，才有 $H_\alpha(\beta)=0$，这其实表明 $\alpha$ 的结果完全决定了 $\beta$ 的结果.
  4. $H_\alpha(\beta) \leq H(\beta)$ (Jenson不等式可证，略)，由此还可以得到
    $$
    H(\alpha\beta) = H(\alpha) + H_\alpha(\beta) \leq H(\alpha) + H(\beta)
    $$
  [^4]: 定义和证明均来自 reference 1

## 离散无记忆扩展信源

:::note
离散无记忆信源是满足平稳性质的一类信源，平稳信源将在我们讨论完无记忆信源之后讨论.
:::

### 概述

在前文的一维离散信源的基础上，我们讨论离散无记忆信源.

首先我们知道，很多实际的离散信源输出的消息是时间或空间上的一系列符号. 在信源输出的序列中，每一位出现哪一个符号往往是随机的，且前后符号的出现一般具有统计依赖关系，即所有出现的符号会影响未来某一位出现某一符号的概率，简单来讲就是每一位出现什么符号的事件之间并不独立.

而我们这里讨论的离散无记忆信源，它的消息序列是平稳随机序列，其符号之间统计独立，其消息是一串符号序列，可以使用随机矢量来描述，且随机矢量的联合概率分布等于随机矢量中各个随机矢量的概率乘积.

:::tip
这里简要一提平稳和无记忆：
- **平稳性**：描述概率分布是否随时间变化
- **无记忆性**：描述不同时刻之间是否相互独立

我们现在只需要记住这里的离散无记忆信源（或称离散无记忆平稳信源）同时具有上面两个性质，**它在任意时刻输出某一符号的概率都不会发生变化，前后符号的出现也是相互独立的**，就足够了.

在之后讨论**平稳信源**时我们再讨论上面两个性质的区别与联系.
:::

### 离散无记忆扩展信源

为了方便研究信源，我们可以把信源一次输出一个符号，改成一次输出**一组符号**. 例如，对于一个二元信源（符号集为 $\{0, 1\}$），我们可以将每两个符号组成一组，这样就得到了新的符号集 $\{00, 01, 10, 11\}$，我们称其为**二元无记忆信源的二次扩展信源**. 类似的，我们还可以将每三个符号组成一组，得到二元无记忆信源的**三次扩展信源**.

:::tip
可能有点迷惑，好端端为什么要分组呢？我们研究扩展信源，一般就是用于压缩用途.
:::

类似的，我们可以将一个二元无记忆信源扩展为具有 $2^N$ 个符号的**二元无记忆信源**的 $N$ **次扩展信源**.

接下来我们讨论符号集更大的**无记忆信源**，设一个离散无记忆信源 $X$，其概率空间为：

$$
\left[
\begin{array}{cccc}
a_1 & a_2 & \cdots & a_q \\
p_1 & p_2 & \cdots & p_q
\end{array}
\right],
\sum_{i=1}^{q} p_i = 1 \quad (p_i \ge 0)
$$

对它的输出消息序列，我们可以用一组**组长度**为 $N$ 的序列来表示它. 这时，它就等效成了一个新信源. 符号集的大小为 $q^N$，每一个**符号**都是一个长度为 $N$ **消息序列**. 我们称这个信源为离散无记忆信源 $X$ 的 **$N$ 次扩展信源**，记作 $X^N$，其 $N$ 重概率空间为：

$$
\left[
\begin{array}{cccc}
\alpha_1 & \alpha_2 & \cdots & \alpha_{q^N} \\
P(\alpha_1) & P(\alpha_2) & \cdots & P(\alpha_{q^N})
\end{array}
\right]
$$

其中，每个符号 $\alpha_i$ 对应于某一个由 $N$ 个 $a_i$ 组成的序列. 而 $P(\alpha_i)$ 是对应的 $N$ 个符号组成的序列出现的**联合概率**.

又因为**原始**信源是**无记忆**的，则对任意 $\alpha_i = (a_{i_1}, a_{i_2}, a_{i_3}, \dots, a_{i_N}) \quad i_1, i_2, \dots, i_N \in \{1, 2, \dots, q\}$，有

$$
P(\alpha_i) = P(a_{i_1})P(a_{i_2}) \cdots P(a_{i_N}) = p_{i_1}p_{i_2} \cdots p_{i_N}
$$

我们可以得到 $\sum^{q^N}_{i=1} P(\alpha_i) = 1$，证明：

**Version 1** 一个我自己认为比较易懂的证明
![20260420-0f4efde6929ece90.png](./images/20260420-0f4efde6929ece90.png)

**Version 2** 严格的数学证明

$$
\begin{aligned}
\sum^{q^N}_{i=1} P(\alpha_i)
&= \sum^{q}_{i_1=1} P(a_{i_1}) \cdot \sum^{q}_{i_2=1} P(a_{i_2}) \cdots\sum^{q}_{i_N=1} P(a_{i_N})\\
&= \sum^{q}_{i_1=1}\sum^{q}_{i_2=1}\cdots\sum^{q}_{i_N=1}p_{i_1} \cdot p_{i_2} \cdots p_{i_N}\\
&= \sum^{q}_{i_1=1}p_{i_1}\sum^{q}_{i_2=1}p_{i_2}\cdots\sum^{q}_{i_N=1} p_{i_N} = 1\\
\end{aligned}
$$

下面证明 $H(X^N) = NH(X)$:

设 $\alpha_i$ 是 $X^N$ 概率空间中的一个符号，对应于由 $N$ 个 $a_i$ 组成的序列

$$
\alpha_i=(a_{i_1},a_{i_2},\cdots,a_{i_N})
$$

而

$$
P(\alpha_i)=p_{i_1}p_{i_2}\cdots p_{i_N},
\qquad
(i_1,i_2,\cdots,i_N=1,2,\cdots,q)
$$

根据熵的定义，$N$ 次扩展信源的熵为

$$
H(X^N)=-\sum_{X^N} P(\alpha_i)\log P(\alpha_i)
$$

其中，求和号 $\sum_{X^N}$ 是对信源 $X^N$ 中所有 $q^N$ 个符号求和，
所以求和的项共有 $q^N$ 个.
这种求和号可以等效于 $N$ 个求和，而且其中的每一个又是对 $X$ 中的 $q$ 个符号求和.
所以可改写为

$$
H(X^N)=\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_1}p_{i_2}\cdots p_{i_N}}
$$

由对数的性质

$$
\log \frac{1}{p_{i_1}p_{i_2}\cdots p_{i_N}}
=
\log \frac{1}{p_{i_1}}
+\log \frac{1}{p_{i_2}}
+\cdots+
\log \frac{1}{p_{i_N}}
$$

因此

$$
H(X^N)
=
\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_1}}
+\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_2}}
+\cdots+
\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_N}}
\tag{6}
$$

式 $(6)$ 中共有 $N$ 项，考察其中第一项：

$$
\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_1}}
=
\sum_{X^N}
p_{i_1}p_{i_2}\cdots p_{i_N}
\log \frac{1}{p_{i_1}}
$$

把对 $X^N$ 的求和展开成多重求和，得

$$
\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_1}}
=
\sum_{i_1=1}^{q}
\sum_{i_2=1}^{q}
\cdots
\sum_{i_N=1}^{q}
p_{i_1}p_{i_2}\cdots p_{i_N}
\log \frac{1}{p_{i_1}}
$$

把与 $i_1$ 无关的求和提出，可得

$$
=
\sum_{i_1=1}^{q}
p_{i_1}\log \frac{1}{p_{i_1}}
\left(
\sum_{i_2=1}^{q} p_{i_2}
\right)
\left(
\sum_{i_3=1}^{q} p_{i_3}
\right)
\cdots
\left(
\sum_{i_N=1}^{q} p_{i_N}
\right)
$$

因为

$$
\sum_{i_k=1}^{q} p_{i_k}=1,
\qquad
(k=2,3,\cdots,N)
$$

所以

$$
\sum_{X^N} P(\alpha_i)\log \frac{1}{p_{i_1}}
=
\sum_{i_1=1}^{q}
p_{i_1}\log \frac{1}{p_{i_1}}
=
H(X)
\tag{7}
$$

同理可得式 $(6)$ 中其余各项也都等于 $H(X)$

因此

$$
H(X^N)
=
H(X)+H(X)+\cdots+H(X)
=
N H(X)
$$

其中共有 $N$ 项

**证毕**

上面这个结论也可使用独立可加性来证明.

### 离散平稳信源

在一般情况下，离散信源的输出是空间或时间的离散符号序列，而且在序列中符号之间有依赖关系. 此时可用随机矢量来描述信源输出的消息，即
$$
X=(\cdots,X_1,X_2,X_3,\cdots,X_t,\cdots).
$$
其中任一变量 $X_i$ 都是离散随机变量，它表示 $t=i$ 时刻所输出的符号. 信源在 $t=i$ 时刻将要输出什么样的符号取决于两方面.

(1) 与信源在 $t=i$ 时刻随机变量 $X_i$ 的取值的概率分布 $P(x_i)$ 有关. 一般情况下 $t$ 不同时，概率分布也不同，即
$$
P(x_i)\ne P(x_j),\quad(i\ne j)
$$

(2) 与 $t=i$ 时刻以前信源输出的符号有关，即与条件概率
$$
P(x_i\mid x_{i-1},x_{i-2},\cdots)
$$
有关. 同样在一般情况下，它也是时间 $t=i$ 的函数，所以
$$
P(x_i\mid x_{i-1},x_{i-2},\cdots,x_{i-N},\cdots)
\ne
P(x_j\mid x_{j-1},x_{j-2},\cdots,x_{j-N},\cdots),
\quad i\ne j.
\tag{8}
$$

以上所叙述的是一般随机序列的情况，它比较复杂，因此现在只讨论平稳的随机序列.所谓平稳随机序列，就是序列的统计性质与时间的推移无关，即信源输出的符号序列的概率分布与时间起点无关.数学严格的定义如下.

若当 $t=i,t=j$ 时（$i,j$ 是大于 1 的任意整数，且 $i\ne j$），信源所输出的随机序列满足
$$
P(x_i)=P(x_j)=P(x),
$$
即其一维概率分布与时间起点无关，则序列是一维平稳的.这里等号表示任意两个不同时间信源输出符号的概率分布完全相同，即
$$
P(x_i=a_1)=P(x_j=a_1)=P(a_1),
$$

$$
P(x_i=a_2)=P(x_j=a_2)=P(a_2),
$$

$$
\cdots
$$

$$
P(x_i=a_q)=P(x_j=a_q)=P(a_q).
$$

具有这样性质的信源称为一维离散平稳信源.一维离散平稳信源无论在什么时刻均按 $P(x)$ 的概率分布输出符号.

N 维离散平稳信源的定义类似，简单描述为：对于任意两个时刻 $m, n$，有

$$
P(x_m) = P(x_n)\\
P(x_mx_{m-1}) = P(x_nx_{n-1})\\
\cdots\\
P(x_mx_{m-1} \cdots x_{m-N}) = P(x_nx_{n-1} \cdots x_{n-N})\\
\tag{9}
$$

下面我们以二维离散信源为例讨论.

#### 二维离散平稳信源

因为联合概率与条件概率具有以下关系：

$$
\begin{aligned}
P(x_ix_{i+1}) &= P(x_i)P(x_{i+1}|x_i)\\
P(x_ix_{i+1}x_{i+2}) &= P(x_i)P(x_{i+1}|x_i)P(x_{i+2}|x_ix_{i+1})\\
&\cdots\\
P(x_ix_{i+1}\cdots x_{i+N}) &= P(x_i)P(x_{i+1}|x_i) \cdots P(x_{i+N}|x_ix_{i+1} \cdots x_{i+N-1})\\
\end{aligned}
$$

因此对于离散平稳信源来说，由 $(9)$ 式可以得到，其条件概率也均与时间无关，至于关联长度 $N$ 有关. 他表示离散平稳信源输出的平稳随机序列前后的以来关系与时间起点无关.

因此，我们可以二维离散平稳信源就可以这样定义：对于任意两个时刻 $m, n$，有

$$
P(x_m) = P(x_n)\\
P(x_m|x_{m-1}) = P(x_n|x_{n-1})
$$

设一个二维离散平稳信源的概率空间为：

$$
\left[
\begin{array}{c}
X\\
P
\end{array}
\right]
=
\left[
\begin{array}{cccc}
s_1 & s_2 & \dots & s_k\\
p_1 & p_2 & \dots & p_k
\end{array}
\right]
\quad \sum^{n}_{i=1} p_i = 1
$$

因为二维离散平稳信源输出的符号序列中，相邻两个符号是有依赖的，即只与前一个符号有关联，而且依赖关系不随时间推移而变化. 那么，我们可以把这个二维信源输出的随机序列分成每两个符号一组，每组代表新信源 $X=X_1X_2$ 中的一个符号（消息）. 并假设组与组之间是统计独立的，互不相关的.

实际上，每组组尾的符号与下一组组头的符号是有关联的，不是统计独立的. 这个假设只是为了简化问题的数学分析. 此时，就可等效成一个新的离散无记忆信源 $X_1X_2$，它们的联合概率空间为

$$
\left[
\begin{matrix}
X_1 X_2 \\
P(x_1 x_2)
\end{matrix}
\right]
=
\left[
\begin{matrix}
s_1 s_1 & s_1 s_2 & \cdots & s_k s_k \\
p_1 p_1 & p_1 p_2 & \cdots & p_k p_k
\end{matrix}
\right]
\qquad
\sum_{i=1}^{k}\sum_{j=1}^{k} p_i p_j = 1\\

\sum^{k}_{j=1} p(s_j | s_i) = 1
$$

至此，我们就已经建立起了信息论的一些基本概念，后续的章节也围绕这些基本概念展开，因此这份出于帮助新手小白建立起从概率论到信息论的笔记就此完结.

**下一章**：系列完结  
**系列文章**：[信息论](/categories/信息论/)

<b id="references">references</b>  
\[1\]《概率论第一册：概率论基础》 复旦大学编 1979年4月第一版 P.184-190  
