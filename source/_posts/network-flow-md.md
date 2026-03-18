---
title: 网络流笔记
date: 2026-03-18 15:22:40
tags: 算法
categories: 笔记
---

## 概述

***网络流***是一个具有容量和源汇点概念的特殊有向图 $G = (V, E)$。

- ***容量***（Capacity）：是一个映射（函数） $c: E \rightarrow \R^+$，记作 $c_{uv}$ 或 $c(u, v)$. 当 $(u, v) \notin E$ 时，可以假定 $c(u, v)=0$.
- $V$ 中有两个特殊的点：***源点***（source）$s$ 和***汇点***（sink）$t (s \neq t)$.

***流***（flow）是一个映射（函数）$f: E \rightarrow \R^+$，记作 $f_{uv}$ 或 $f(u, v)$，其满足以下性质：

1. **容量限制**：每条边流过的流量不得超过其容量，即 $0 \leq f(u, v) \leq c(u, v)$；
2. 流守恒性：除源汇点外，任意结点 $u$ 的净流量为 $0$. 其中，我们定义 $u$ 的净流量为 $f(u) = \Sigma_{x \in V}f(u, x) - \Sigma_{x \in V}f(x, u)$.

对于整个网络上的***流*** $f$（也就是说已经确定了每条边上的流量，考虑整体的流量），定义 $f$ 的流量 $|f|$ 为 $s$ 的净流量 $f(s)$. 由流守恒性，$|f| = -f(t)$.

![20260318-d130aa121ef204ba.png](./images/20260318-d130aa121ef204ba.png)

对于这个例子，$|f| = 4$.

在图论中，去掉其中所有边能使一张网络流图不再连通（即分成两个子图）的边集称为图的割. 一张图上的最小的割称为***最小割***. 这里的割是**边割集**.

另一种割的说法：如果 ${S, T}$ 是 $V$ 的一个划分（即 $S \cup T = V$ 且 $S \cap T = \emptyset$），且满足 $s \in S, t \in T$，则 ${S, T}$ 是 $G$ 的一个 $s-t$ 割（*cut*）. 这里的割是**点割集**.

::::spoi 划分
想要详细的了解划分的相关概念，这里有一条 wikipedia 学习链条:  
[集合](https://zh.wikipedia.org/wiki/%E9%9B%86%E5%90%88_(%E6%95%B0%E5%AD%A6))👉[有序对](https://zh.wikipedia.org/wiki/%E6%9C%89%E5%BA%8F%E5%AF%B9)👉[二元关系](https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%85%83%E5%85%B3%E7%B3%BB)👉[等价关系](https://zh.wikipedia.org/wiki/%E7%AD%89%E4%BB%B7%E5%85%B3%E7%B3%BB)👉[等价类](https://zh.wikipedia.org/wiki/%E7%AD%89%E4%BB%B7%E7%B1%BB)👉[划分](https://zh.wikipedia.org/wiki/%E9%9B%86%E5%90%88%E5%88%92%E5%88%86)

集合 $X$ 的划分是 $X$ 的非空子集的集合，使得每个 $X$ 的元素 $x$ 都只包含在这些子集的其中一个内。

等价的说， $X$ 的子集的集合 $P$ 是 $X$ 的划分，则

1. $P$ 的元素都不是空集.
2. $P$ 的并集等于 $X$.
3. $P$ 的任何两个元素的交集为空.

:::note 划分和等价关系
如果给定在集合 $X$ 上的一个等价关系，则所有等价类的集合形成 $X$ 的一个划分。反过来说，如果给定在 $X$ 上的一个划分 $P$，我们可以在 $X$ 上定义等价关系 $~$，使得 $x ~ y$ 当且仅当存在 $P$ 的一个成员包含 $x$ 和 $y$ 二者。“等价关系”和“划分”的概念因此本质上是等价的。
:::
::::

### 最大流

令 $G = (V, E)$ 是一个有源汇点的网络，我们希望在 $G$ 上指定合适的流 $f$，以最大化整个网络的流量 $|f|$（即 $\Sigma_{x \in V} f(s, x) - \Sigma_{x \in V} f(x, s)$，这一问题被称作最大流问题.

#### 朴素算法

先考虑

#### Ford-Fulkerson 增广

这是计算最大流的一类算法的总称，其核心是贪心思想.

##### 剩余容量

对于边 $(u, v)$，我们将其容量与流量只差称为剩余流量 $c_f(u, v)$，即 $c_f(u, v) = c(u, v) - f(u, v)$.

##### 残量网络

我们将 $G$ 中所有节点

<Graph indexType="custom" height="400" width="400" nodes={[{label:1,center:{x:142.6,y:296}},{label:2,center:{x:310.4,y:323.1}},{label:3,center:{x:223.5,y:303.7}},{label:4,center:{x:112,y:215.9}},{label:5,center:{x:296,y:230.7}},{label:6,center:{x:211,y:204.3}},{label:"7",center:{x:221.5,y:67.5}},{label:11,center:{x:282.2,y:133}},{label:9,center:{x:149.3,y:121.7}}]} edges={[{source:0,target:2},{source:0,target:4},{source:0,target:5},{source:1,target:4},{source:1,target:5},{source:2,target:3},{source:2,target:4},{source:4,target:5},{source:5,target:8},{source:8,target:7},{label:"12/19",source:6,target:5}]} />

----

## References

- [OI-Wiki 网络流](https://oi-wiki.org/graph/flow/)
