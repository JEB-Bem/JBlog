---
title: "Mimalloc: Free List Sharding in Action"
date: 2026/05/25 11:11:29
tags:
- OS
- Memory
filename: mimalloc-note.md
description: "Notes for Microsoft Malloc Implementation: Mimalloc —— Free List Sharding in Action"
keywords: [OS, Memory, 内存, "Memory Allocator", "Free List Sharding"]
---

本文介绍一种由微软研发的内存分配器（Memory Allocator）—— [Mimalloc](https://www.microsoft.com/en-us/research/uploads/prod/2019/06/mimalloc-tr-v1.pdf). 关于该分配器的更严谨的分析，可自行阅读原文，本文只将其作为入门 Memory Allocator 的范例来介绍，主要讲一些 Memory Allocator [常见的问题（APLAS‘19）](https://jyywiki.cn/OS/manuals/malloc-survey.pdf)和 Mimalloc 的解决方案，不讨论过于深入的 Full List，也不讨论[相关的二进制安全问题](https://blackhat.com/presentations/bh-usa-07/Ferguson/Whitepaper/bh-usa-07-ferguson-WP.pdf).

## Memory Allocator 需要解决

Memory Allocator 所做的无非就是这几点：

1. 确保并行分配与释放操作的正确性；
2. 尽可能高效的完成内存的分配与释放；
3. 尽可能减少内存碎片，尽可能提高内存的利用率；

稍加思索就会发现上面几个要求实际上是互相矛盾的（比如我们分配一个很大的内存然后从不释放，用完就再次分配，那效率肯定很高了，但内存的利用率也就惨不忍睹了），我们必须平衡以上的要求以提高整体性能. 阅读过 *APLAS‘19* 这篇综述就会明白，这不仅仅是一个简单的数据结构问题（甚至数学上很有效的数据结构在真实的 workload 下也可能效率低下，~~比如区间树？~~），我们需要结合真实世界的 workload，结合真实世界的内存分配与释放的规律来调整我们的设计，因此这个问题实际上非常复杂，甚至可能没有唯一正确的答案[^1]. 我们甚至还没有考虑二进制安全问题. 😢

[^1]: 关于 *malloc*/*free* 的讨论，可以阅读和观看 NJU jyy 老师的这篇 [Lecture Note](https://jyywiki.cn/OS/2026/lect10.md) 和[课堂回放](https://www.bilibili.com/video/BV1yu9cBCEAb?spm_id_from=333.788.videopod.sections&vd_source=2f242aaa83317e96a605fcd307d179a9)，最后尝试完成这个 [Mini Lab](https://jyywiki.cn/OS/2026/labs/M5.md).

## 主要思想

1. 引入 *page*(非 *OS Page*, 4KiB) 的概念，每个线程中的每类 size 都拥有独立的 page，其大小通常为 64KiB；
2. 每一个 *free list** 都对应于一个 *page* 被 使用，这样所有的分配和释放都在一个 *page* 中完成，不受堆中其他对象的分配和释放的影响；
3. 每一个 thread 都有若干 *local-free list* （per size-class)，对于线程本地 free 的 *chunk*，会被分配到这个 *local-free list* 中；
4. 对于在线程 *A* 中分配，在其他线程中释放的内存，将其分配到线程 *A* 的 *thread-free* lists 中. 这些 thread-free lists 同样按 page 划分. 同时每隔一段时间，就会*原子地*将 thread-free lists 移动到 *local-free list* 中；
5. 最后，还有一个 *allocation free list*，每次需要分配内存时都从 *allocation free list* 中获取 *chunk*，而当一个 *allocation free list* 中的 *chunk* 全部使用完时，将会让 *local-free list* 成为一个新的 *allocation free list*，与此同时会进行上面提到的将 *thread-free lists* 批量移动到 *local-free list* 的过程. 上述设计可以确保整个分配器将会有一个基于分配次数的节奏（心跳），与此同时分摊了一些昂贵操作的消耗，比如延迟引用计数的减小（作为讲解 malloc 一般机制的文章，在后文中我们会**弱化**引用计数相关的讨论），上文提到批量移动 *thread-free lists* 等.

注意，上面的三类 *free-list*，都对应于 thread 中的每类 size.

:::tip
我们简要一提多数 Memory Allocators 的设计思路，即分别提供 *fast path* 和 *low path*，*fast path* 会提供一条快速的内存分配、释放路径，而 *low path* 可以让分配器在 *fast path* 暂时不可用时 fall back 到 *low path*，同时确保了分配器的性能和稳定性. 而 *free list* 就是设计 *fast path* 常用的数据结构，一般是针对一系列特定的 size，比如 32Bytes、48Bytes、... 、1008 Bytes 这样，每一个 size 具有一个 *free list*. 这样我们就可以在收到分配请求时根据请求的 size 快速分配一个合适的 *chunk*.

不过，我们上面的介绍仍然省略了很多细节，以 **glibc** 的 *ptmalloc* 实现为例，其内部就有 `tcache`、`fast bin`、`small bin`、`large bin`、`unsorted bin` 等一系列数据结构.
:::

下面我们介绍 mimalloc 的具体实现.

## Free List 切片 (Sharding)

接下来我们讨论 *free list* 的具体细节，然后再来讨论它们在堆中的具体分布和具体实现.

### Allocation Free Lists

我们来看论文中的例子，很多分配器会给将 *free list* 设计为针对每个 size 设计 *free list* 的结构. 这种简单的结构会导致较差的*空间局部性*，因为分配的 *chunk* 会传播到整个 heap 空间中（A：free list 跨越了 heap 很大一部分空间）：

![20260526-28473601a6173349.png](./images/20260526-28473601a6173349.png)

当我们在（A）下分配分配一个具有 3 个元素的 list $p$ 达到（B）状态，$p$ 同样跨越了 heap 的一大块空间而具有较差的空间局部性. 而当我们交错地进行分配和释放操作时，上述布局实际上很容易出现.

:::notes
为什么需要好的**空间局部性**（Spatial Locality）？  
🤖（*GPT 5.4 Thinking*)：因为 CPU 访问内存不是按“对象”一个个孤立访问的，而是按 cache line、page、TLB 等粒度成批加载. 相关对象如果在内存中靠得近，程序遍历结构时会少很多 cache miss / TLB miss，速度会明显更好.
:::

因此，**mimalloc** 通过为每一类 *size* 分配 *page* 来限制 *free list* 从而达到了较优的空间局部性（A）：

![20260526-97e6be04347adfcf.png](./images/20260526-97e6be04347adfcf.png)

分配 list $p$ (即从 free list 的头部不断取出 chunk) 之后（B），$p$ 的元素都位于一个 page 中，具有较好的空间局部性.

**现在，我们已经引入了 free list 的基本构造，即每一种 size 对应的 page 中的链表. 同时，我们还引入了第一种 free list: Allocation Free Lists. 下文简称为 free list 或 regular free list.**

### No Bump Pointer

我们已经有了一个大体的内存结构. 但还有很多细节需要处理，我们先来讨论第一个细节，在一个 *page* 中，我们如果需要去分配一个 *chunk*，具体怎么实现呢？

可以有下面这个 *C* 风格的伪代码：

```c
void* malloc_in_page( page_t* page, size_t size ) {
  block_t* block = page->free;                   // page-local free list
  if (block==NULL) return malloc_generic(size);  // slow path
  page->free = block->next;                      // fast path
  page->used++;
  return block;
}

// 补充
struct block_t { struct block_t* next; }
```

观察上面的代码，可以发现分配只有一个简单的判断——*free list* 非空直接分配，否则进入 `malloc_generic` 慢路径分配（后文提到，这个函数除了在 page 以外的内存还有其他的功能）. 另外，还使用到 `used` 来高效判断页面中的所有对象是否都已经被释放了.

这个设计的优点在于，只有一个逻辑判断，可预测性是比较高的，具体分析可以阅读原文. 而常见的 *reap design* 则是使用了 *bump pointer*，这种指针可以在 free list 为空时扩大（向未使用内存的方向移动）来分配内存，直到碰到边界则无法再分配多余内存（其中一种设计），但是这意味着在分配时需要做两次判断，更多细节可以自行查阅了解. 初此之外，由于 bump pointer 是顺序分配的，其优点是空间局部性较好，但会有潜在的分配可预测的安全问题，而 **mimalloc** 通过 page 和 free list 的随机初始化同时具有随机分配和较好的空间局部性的优点.

:::tip
这里有一个很多 allocator 都常用到小技巧，对于一个 *chunk*，当其处于使用状态时，*chunk* 的一些元数据其实是不需要使用的，比如这个地方的 `next` 字段，因此我们就可以让用户数据覆盖这部分元数据，体现在 **mimalloc** 中就是我们可以直接返回一个 `block_t` 指针给用户. 因为 `block_t` 中的字段都可以被覆盖.
:::

以上就是 *regular free list* 的初步实现.

### Local Free Lists

前文我们提到，我们可以将引用计数延迟到分配器压力最大时释放，那么根据前面的设计，实际上就是就 `malloc_generic` 慢路径分配了. 于是理所当然的，我们把这个操作放到 `malloc_generic` 里面，但是如何让那些使用引用计数的**运行时**知道这个时候引用计数被**释放**了呢？需要让**运行时**提供一个 `defered_free` 的 call back，我们在 free 引用指向的内存之前先调用这个 call back 告知运行时.

接下来，怎么控制哪些引用需要延迟释放，哪些不需要呢？需要一个计数器，一旦计数器超过限制，我们就让后续的引用进入延迟释放列表，而不是直接释放.

好了，我们已经有一套比较完善的机制了，此时我们再考虑一个“边界”情况，如果用户长时间反复的分配、然后再释放同样大小的 chunk，我们就会始终处于快路径下，那些引用可能很长时间都无法得到释放了. 如果在进行上面这一套反复分配释放的组合拳，或者干脆不做分配和释放的同时，我们不断的大量释放引用，就会导致很大一块内存没有被使用，却得不到释放.

因此我们希望分配器在若干次（有限）地释放之后，直接进入 `malloc_generic` 慢路径，这样上面的问题就被解决了🤓（~~好像还是没有解决不分配，但是不停释放引用的情况~~）.

:::note
或许我们可以尝试构造一组 workload，在大片引用释放之后不进行任何分配操作，这就会让一大部分引用始终得不到释放？但是真的有这种 workload 吗？这种 case 有任何副作用吗？🤔
:::

具体来说，我们可以引入 *local free list*，所有释放的 chunk 都放到这个 list 里面，当 regular free list 发现没有 chunk 可以用于分配时，就进入 `malloc_generic`，然后再在这个函数中将 local free list 中的 chunk 移动到 regular free list 中. 伪代码其实很简单，开销也不大：

```c
page->free = page->local_free;    // move the list
page->local_free = NULL;          // and the local list is empty again
```

### Thread Free Lists

接下来我们考虑并发的问题，现在我们的分配操作实际上都只会在线程本地完成，因此我们的分配不会有并发问题. 但是我们的释放操作目前可能存在竞争问题，影响我们的 fast path. 考虑这样的场景：由于每个线程都可以释放任意对象，因此我们可以在线程 B 中释放线程 A 本地分配的对象. 基于我们目前的设计，必须为 local free list 设计锁或者需要设计为原子操作，这会降低我们快路径的效率. 因此，我们最后对 free list 做一次 sharding，引出 *thread free list* 的概念，类似于其他两种 free list，它同样对应于某个 thread 中某类 size 的 page. 其功能就是让其他线程 free 的 chunk 都进入到线程 A 的 *thread free list* 中，而不与线程 A 自己 free 的路径冲突，保证了 free 的 fast path 的性能. 非本地释放的伪代码如下：

```c
// usage
atmoic_push( &page->thread_free, p );

// func definition
void atomic_push( block_t** list, block_t* block ) {
  do { block->next = *list; }
  while (!atomic_compare_and_swap(list, block->next, block));
}

// supplementary declaration (pseudo)
bool atomic_compare_and_swap(type *ptr, type old_val, type new_val);
```

同样，我们在 `malloc_generic` 中进行 thread free list 的移动操作：

```c
tfree = atomic_swap( &page->thread_free, NULL ):
append( page->free, tfree );

// supplementary declaration (pseudo)
type atomic_swap(type *ptr, type new);
```

## 实现

介绍完所有的设计（~~实际上还有一些针对边界情况的设计没有讲到，可以自行阅读原文~~）,我们接下来就详细讨论一下如何实现的问题.

### Malloc

为了分配一个对象，malloc 需要首先确定一个指针 *thread local heap*(`tlb`). 从这个指针开始寻找到正确的 page（首先确定 *size class*）. 对于 $size$ 小于 1KiB 的小对象来说，我们规定 size class 为 $\lceil \frac{size}{8} \rceil$，伪代码为：

```c
void* malloc_small( size_t n ) {                     // 0 < n <= 1024
  heap_t* heap   = tlb;
  page_t* page   = heap->pages_direct[(n+7)>>3];     // divide up by 8
  block_t* block = page->free;
  if (block == NULL) return malloc_generic(heap, n); // slow path
  page->used++;
  return block;
}
```

:::note
此处 `tlb` 的获取，`pages_direct` 的维护等细节都没有展开，我们只需要明白其思想即可.
:::

![Fig.1](./images/20260527-d17e770c24d5b7f6.png)

我们简单介绍上图的结构，每个 thread 维护一个 `tlb` 指针，指向了 thread local heap，每个 local heap 的头部是一些 metadata，比如前文提到的 `pages_direct` 数组，方便小对象能快速找到可用的 page，以及一个 `pages` 数组. 一个更详细但仍有些粗糙的 `pages` 数组结构可以如下图所示：

![20260527-c58ee7f569deab4c.png](./images/20260527-c58ee7f569deab4c.png)

从图中可以看出 `pages_direct` 相当于为 small objects 维护了一个可用的 page，而 pages 则是储存了所有 size class 拥有的 pages 队列，在这个队列中的元素再去指向具体的 page.

接下来我们讨论 *segment* 的划分，我们设 *segment* 为 4 MiB，每个 segment 由元数据与三种 page —— small page、large page、huge page —— 中的其中一种组成，以 small page 举例，当 $size class \leq 8\text{KiB}$ 时，我们就使用 small page，并规定一页 small page 的大小为 64KiB，因此一个 segment 中一共有 $\frac{4MiB}{64KiB} = 64$ 页 pages. 这时候就有同学要问了，segment 全都用来放 pages 了，那么 *segment metadata* 放哪里呢？不错，我们通过缩减(shortening)第一个 page 的大小来达到这一要求，因此，上图中的 $segment 1$ 用于储存 small pages，然后 $size(page\_area_1) = 64\text{KiB} - size(metadata) - size(guard\_page)$. 总结如下：

- *small page*: object size 不大于 8KiB，size 等于 64KiB；
- *large pate*: object size 不大于 512KiB，segment 中只有一个跨越整个 segment 的 page；
- *huge page*: object size 大于 512KiB，segment 中只有一个 page，但其 size 就等于 object size.

以上就是 fast path 分配逻辑，large page 和 huge page 的伪代码与 small page 类似，不详细展开.

### Free

上面的设计有两个目的：
1. 统一接口，让 small page、large page 和 huge page 都走同一套逻辑；
2. 在 free 时能够方便的**定位**到 segment metadata.

只要我给定任何一个需要释放的指针 $p$，那么只需要将 $p$ 的低 $22$ 位置为 `0`，就可以得到 segment metadata 的地址.

:::note
如果是 *huge page* 分配了一个大于段 size 的对象，怎么找到 segment metadata 呢？  
实际上从下图（忽略 page 的一些细节）可知，object 的起始位置实际上仍然在 segment 内（实际上并不严格，严谨来说应该是 segment 的前 4MiB 区域内），因此经过 masking，我就能拿到 metadata.
![20260527-015fe6af11d85ac7.png](./images/20260527-015fe6af11d85ac7.png)
:::

一个 free 的伪代码如下：

```c
#define MB (1024 * 1024)
void free( void* p ) {
  segment_t* segment = (segment_t*)((uintptr_t))p & ~(4*MB - 1);
  if (segment==NULL) return;
  page_t* page = &segment->pages[(p - segment) >> segment->page_shift];
  block_t* block = (block_t*)p;
  if (thread_id() == segment->thread_id) { // local free
    block->next = page->local_free;
    page->local_free = block;
    page->used--;
    if (page->used - page->thread_freed == 0) page_free(page);
  } else {  // non-local free
    atomic_push( &page->thread_free, block );
    atomic_incr( &page->thread_freed );
  }
}
```

代码中首先求得 `segment` 指针，然后算得 `p` 相对于 `segment` 的偏移，那么基于前面说的每类 page 的 size，以及 shortening 的设计，我们只需要除以对应 page 的 size 就可以求得 `page index`. 接下来就是前文描述的 local free 和 non-local free 的过程，不过多阐述.

注意其中的 `page_free` 主要是为了及时释放已经没有对象的 page，防止占用过多内存.

### Generic Allocation

```c
void* malloc_generic( heap_t* heap, size_t size ) {
  defered_free();
  foreach( page in heap->pages[size_class(size)] ) {
    page_collect(page);
    if (page->used - page->thread_freed == 0) {
      page_free(page);
    } else if (page->free != NULL) {
      return malloc(size);    // 跳转到 fast path，也就是说直接从 regular
                              // free list 中获取 chunk.
    }
  }
  ....    // allocate a fresh page and malloc from there.
}

void page_collect(page) {
  page->free = page->local_free;    // move the local free list
  page->local_free = NULL;
  ....    // move the thread free list atomically
}
```

上面的代码做了以下事务：
1. 释放延迟引用；
2. 收集 thread_free list 和 local free list；
3. 在有空闲 chunk 时重新进入 fast path 分配，否则去分配一个新的 page 并从此处 malloc.

## 说明

上面的介绍中其实还有很多小细节没有完善，可以自行阅读 mimalloc 的 [repository](https://github.com/microsoft/mimalloc).

peace~

<b id="read-more">readmore</b>  
[mimalloc: A new, high-performance, scalable memory allocator for the modern era](https://www.microsoft.com/en-us/research/blog/mimalloc-a-high-performance-scalable-memory-allocator-for-the-modern-era/)
