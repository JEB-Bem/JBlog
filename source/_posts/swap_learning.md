---
title: 位运算的妙用——Swap
date: 2024/11/08 00:09:18
tags: [c/cpp, 算法]
categories: 笔记
filename: swap_learning.md
permalink: swap_learning.html
---

----
:::tip
本文章需要用到位运算的基础知识，没有了解过的同学可以看看 [OI-Wiki](https://oi-wiki.org/math/bit/)。
:::

## 0x00 位运算之异或的基本性质

我们使用 `XOR`,`^`,`⊕`来表示异或，在大部分编程语言中都使用 `^` 来表示。异或 `p ^ q` 的**真值表**如下：

| p    | q    | p ^ q |
| ---- | ---- | ----- |
| True | True | False |
| True | False | True |
| False | True | True |
| False | False | False |

简单举个栗子：

```python
>>> bin(0b10 ^ 0b11)
'0b1'
>>> bin(0b10110110 ^ 0b10001011)
'0b111101'
>>> bin(0b11101001 ^ 0b10110)
'0b11111111'
```

位运算都具有结合律和交换律，即
$$
a \oplus b \oplus c \Leftrightarrow a \oplus (b \oplus c) \Leftrightarrow a \oplus c \oplus b
$$
然后很容易得到 2 个小性质

1. 与 0 异或得到其本身

   ```python
   >>> bin(0b1100110 ^ 0)
   '0b1100110'
   ```

2. 与本身而异或得到 0

   ```python
   >>> bin(0b1100110 ^ 0b1100110)
   '0b0'
   ```

## 0x01 使用异或实现两个整数的交换

接下来我们可以利用上面两个小性质来实现位运算的交换了：

```python
a = 9, b = 7   # a = 0b1001  b = 0b111，为了表示方便，我们将原始值分别令为 a0, b0
a = a ^ b   # 这行代码的结果我们无需了解，但还是放在这里供验证：0b1110
b = a ^ b   # 结合前一行代码，这行代码等效于 b = (a0 ^ b0) ^ b0 = a0 ^ (b0 ^ b0) = a0 ^ 0 = a0
a = a ^ b   # 结合前面的代码（注意到这个时候 b 的值是 a0），这行代码等效于 a = (a0 ^ b0) ^ a0 = a0 ^ a0 ^ b = b0
```

通过上面的过程，我们就可以实现两个整数的交换，同时避免了使用一个临时变量，减小空间开销。

我在查阅资料时还发现了这种写法：

```python
a ,b = b, a
```

但我觉得这种方法涉及**打包**和**解包**，可能会有额外的开销（~~纯猜测，欢迎讨论~~），不过我们这里也只是为了学习位运算的性质罢了。

## 0x02 缺陷（~~小坑~~）

⚠️⚠️⚠️ 注意了！这个方法不适用于两个地址相同的变量！

如果是这种情况，这个方法没有任何问题：

```python
>>> a = 1
>>> b = 1
>>> a ^= b
>>> b ^= a
>>> a ^= b
>>> a, b
(1, 1)
```

但是如果是这种情况，或者是相似的情况，就会出现问题了：

```python
>>> def swap(nums, a, b):
...     nums[a] ^= nums[b]
...     nums[b] ^= nums[a]
...     nums[a] ^= nums[b]
... 
>>> arr = [1,2]
>>> swap(arr, 0, 0)
>>> print(arr)
[0, 2]
```

我将其写成这样的格式应该就理解了：

```python
nums[0] = nums[0] ^ nums[0]   # 1 ^ 1
nums[0] = nums[0] ^ nums[0]   # 0 ^ 0
nums[0] = nums[0] ^ nums[0]   # 0 ^ 0
```

这样就看的很清楚，但是在实际应用中，我们常常会忽略这一点，所以一定要注意了！

------

peace~
