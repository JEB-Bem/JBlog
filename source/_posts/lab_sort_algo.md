---
title: 实验6 排序算法
date: 2024-11-06 19:32
tags: [算法]
categories: WriteUps
filename: lab_sort_algo.md
---

----
:::impo
本实验全部在 Linux 下进行，某些代码可能无法在 Windows 下正确的运行。
:::

## 0x00 实验分析

本次实验要求随机生成100000个随机数，使用冒泡排序和快速排序两种方法，并比较执行时间。

语言要求：

1. C语言
2. Python

## 0x01 C语言实现

### 分析实现逻辑

实验要求比较运行时间，在 Windows 和 Linux[^1] 下我们都可以使用 `clock` 这个函数，它返回自程序启动以来的时间，不过需要注意的是 Windows 下 `clock` 返回**挂墙时间**，而 Linux 下则获得 **CPU 时间**。

#### 测量运行时间

##### 问题1 挂墙时间和 CPU 时间

在我使用 `clock` 时，实际上没有考虑挂墙时间和CPU时间的区别，导致我测试过程中始终得不到理想的运行结果。我的主要测试代码为：

```c
int main() {
	clock_t begin, end;
	double cpu_time_used;
	begin = clock();

	sleep(3);

	end = clock();
	cpu_time_used = ((double) (end - begin)) / CLOCKS_PER_SEC;
	printf("%lf\n", cpu_time_used);

	return 0;
}
```

在多次测试后，我的运行结果始终为 `0.00002`左右的一个极小值，我查询了很多资料，甚至查询了GNU GCC的官方文档[^2],首先可以确定，我获取运行时间的代码没有问题，因此我再次把投向了sleep，只有这一个地方了，首先问问AI：

- Q: 这段代码的期望运行结果是什么？
- A：由于 `sleep()` 函数会让出CPU资源，程序在 `sleep(3)` 期间不会执行任何CPU指令，因此 `clock()` 函数记录的CPU时间差会非常小（接近于0）。

我回想起了以前学习 Python 异步执行的时候曾经浅浅的了解过的CPU运行原理，再去看看网友解释的挂墙时间和 CPU 时间：

> *Wall time* (also known as *clock time* or *wall-clock time)* is simply the total time elapsed during the measurement. 
>
> 挂墙时间（也称为时钟时间或挂钟时间）只是测量过程中经过的总时间。
>
> *CPU Time*, on the other hand, refers to the time the CPU was busy processing the program’s instructions. The time spent waiting for other things to complete (like I/O operations) is not included in the CPU time.
>
> CPU时间是指CPU忙于处理程序指令的时间。等待其他事情完成（例如I / O操作）所花费的时间不包括在CPU时间中。

原来如此，`sleep` 在被调用后会让出CPU资源，此时 CPU 会去执行其他进程。看来我的代码没有问题，运行结果也是正确的，下面可以开始写排序算法了。

#### 生成随机数列

在此之前，我想到一个问题，既然需要排列两次，那么肯定需要重复排列两个无序数组，因此，我需要复制一份数组（如果数列静态的初始化在程序内部，自然不需要，但我们使用了随机数动态生成，因此需要进行复制），这时，我想到了 `memset()`，这个函数可以快速的初始化内存块，那么有没有一个类似的函数可以快速的复制内存块呢？查阅资料，有一个 `memcpy()`，以上两个函数都需要导入 `string.h` 头文件。

##### 问题2 `rand()`函数的随机性

接下来，我们开始生成随机数，如果是在 Windows 下，我们会碰到很多问题，这些问题大都是因为编译器的 `rand()`实现问题导致的，一般来说，使用 `rand()` 获得的随机数范围是 `0 ~ RAND_MAX`，而在 Windows 下，`RAND_MAX = 2^15 - 1`，而我们单纯的将这个范围扩大也会导致随机性降低等问题，这主要是因为取模运算的性质导致的，这里摘抄 [OI-Wiki](https://oi-wiki.org/misc/random/) 的解释:

关于 `rand()` 和 `rand()%n` 的随机性：

- C/C++ 标准并未关于 `rand()` 所生成随机数的任何方面的质量做任何规定。
- GCC 编译器对 `rand()` 所采用的实现方式，保证了分布的均匀性等基本性质，但具有 低位周期长度短 等明显缺陷。（例如在笔者的机器上，`rand()%2` 所生成的序列的周期长约 $2\cdot 10^6$
- 即使假设 `rand()` 是均匀随机的，`rand()%n` 也不能保证均匀性，因为 `[0,n)` 中的每个数在 `0%n,1%n,...,RAND_MAX%n` 中的出现次数可能不相同。

查阅资料，网上有各种方法来扩大随机数的产生范围，使用 `rand()<<15 | rand()`的操作是比较简单且可靠的操作，虽然这种操作实际上并没有囊括所有的随机数范围，但是一个比较好的方案。

而在 Linux 中，虽然 `RAND_MAXN` 同样存在范围限制，但在小数据范围并不需要考虑，因为 `RAND_MAX = 2 ^ 31 - 1`，所以没有超过这个范围的时候我们不需要过多考虑随机性的问题，虽然 `rand()`本身并未保证其生成随机数的质量。接下来我们只需要使用 `for` 生成一个随机的数列就可以了。

#### 冒泡排序

冒泡排序的时间复杂度是 O(n ^ 2) 的，空间复杂度就是 O(n)，实现方法即 `i` 从 `n-1 ~ 1` 逆序遍历，然后 `j` 从 `0 ~ i - 1` 逆序遍历，如果不满足排序规则就交换两个元素，最后每一轮都可以确定目前的第 `i` 项是第 `i + 1` **小**的项，用数学归纳法可以证明其正确性。

#### 快速排序

快速排序和归并排序一样使用了递归的思想，两者是一种类似于逆操作的关系。快速排序的原理是随机取得一个基准值，然后将比基准值小（大）的数放到左边，把比基准值大（小）的数放到右边，然后递归排序左区间和右区间，直到区间长度为1。

### 代码实现

#### 测量时间

这个地方 GNU GCC 官方给出的建议是在最后的计算之前一定要转换为 `double` 类型计算，原因是，不同的系统下 `clock_t` 的定义会有不同，而大多数情况下 `clock_t` 也可以看作 `long int` 来使用，因此，我们需要将其转化为 `double` 类型除以 `CLOCKS_PER_SEC` 以获取更精确的值（浮点数），而不是一个整数。

```c
// 测量时间所用的框架
clock_t begin, end;
double cpu_time_used;
begin = clock();

/*
	运行的代码
*/

end = clock();
cpu_time_used = ((double) (end - begin)) / CLOCKS_PER_SEC;
printf("%lf\n", cpu_time_used);
```

#### 算法优化和一些小细节的处理

##### 1.优化交换操作的空间开销

这里可以使用位运算来减少空间开销，原理是基于异或运算的结合律、交换律、与 0 异或结果为自身和与自身异或结果为 0 来实现的。

```c
nums[j] = nums[j] ^ nums[j+1];
nums[j+1] = nums[j] ^ nums[j+1];
nums[j] = nums[j] ^ nums[j+1];
```

##### 2.数组复制

如前文所说，我们可以使用 `string.h` 中的 `memcpy()` 来实现：

```c
memcpy(arr2, arr1, sizeof(arr1));
```

##### 3.输入输出重定向

使用 `freopen()` 进行输入输出重定向，需要注意的是，由于我们中间还需要输出一些运行时间等提示，所以，我们还需要重定向回来，可以使用：

```c
freopen("/dev/tty", "w", stdout);
```

但是这是 Linux 下的参数，Windows 下还需要做调整。

### 运行结果

以下为运行结果：

![20251102-5745fe4b87294460.png](./images/20251102-5745fe4b87294460.png)

![20251102-3a095f2334081451.png](./images/20251102-3a095f2334081451.png)

![20251102-90220606a157a17d.png](./images/20251102-90220606a157a17d.png)

我们还可以使用 `diff` 命令来比较两个输出文件，从而大致验证算法的正确性：

```bash
diff bubble_res.out quick_res.out
```

运行结果为空，此处不做展示。

> 注：我的快速排序实现并不是太标准，因为是按着印象写的，所以有些地方做的有些复杂了。

## 0x02 Python 实现

前面已经分析过实现程序的思路了，这里就不再分析，直接分析关键代码。

### 关键代码和细节实现

#### 时间测量

使用 `time` 模块的 `time()` 函数可以获得一个以 sec 为单位的时间戳，我们可以用来测量时间。

#### 生成随机数列

使用 `random` 模块的 `random.choices()` 函数来生成一个元素可以重复的数列。

#### 数列拷贝⚠️

这个地方需要使用**深拷贝**而不是**浅拷贝**，两者的不同在于一个是重新开辟内存空间，拷贝的是原**列表**的值，一个是仅仅拷贝了列表的引用。

我们可以使用 `copy` 模块中的 `deepcopy()` 函数来实现。

#### 冒泡排序

实现思路和 C 一样套用即可

快速排序

这个地方使用比较经典的快速排序实现方法，而不是使用 C 程序中的思路。

> 写 Python 的时候发现一个问题，使用位运算来实现 swap 时间开销比普通实现还要大，具体原因还不知道，正在研究中

### 运行结果

![20251102-245f2312e556d5d2.png](./images/20251102-245f2312e556d5d2.png)

![20251102-21765593830ca7a5.png](./images/20251102-21765593830ca7a5.png)

![20251102-7592db0f018c658f.png](./images/20251102-7592db0f018c658f.png)

同样可以使用 `diff` 命令来比较两个输出文件，从而大致验证算法的正确性：

```bash
diff bubble_res.out quick_res.out
```

运行结果为空，此处不做展示。

[^1]: [在C / C ++中测量执行时间的8种方法](https://zhuanlan.zhihu.com/p/349949616)

[^2]: [Processor And CPU Time](https://ftp.gnu.org/old-gnu/Manuals/glibc-2.2.3/html_chapter/libc_21.html#SEC428)
