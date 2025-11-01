---
title: 关于get类IO读写方法的探究
date: 2024/10/29 20:50:27
tags: c/cpp
categories: 笔记
filename: get_cache_learn.md
---

## 0x00 前言

本人已光荣进入了 hjmy 大学，现在已经开始高级程序语言设计课程。在一次老师布置的作业中，我发现课程中还有着我没有学习过的知识点，遂记录之。

## 0x01 题目背景

老师要求我们完成一个凯撒密码有关的题目，其实就是一个 ASCII 码 + mod 的性质的题目，关键在于老师的附加要求：

- 不能使用 `scanf()`，而是使用 `getchar()`

- **不能使用数组**

- 输入输出样例为：

  ```javascript
  明文为：ABCabcxyzXYZ
  密文为：DEFdefbcdBCD
  ```

  （其中 `ABCabcxyzXYZ` 为输入部分）

 以上就是老师的题目和要求，实际上我是有点懵逼的，但是老师提示了缓冲区的相关知识，因此我去查阅了相关资料。

## 0x02 查阅资料

`gets()` 和 `getchar()` 方法都有一个特点，或者所有的输入输出方法都有一个特点，会使用对应的输入输出缓冲区，而且绝大部分系统都是使用的行缓冲。那么先来讲讲什么是缓冲区：

> 缓冲区 Buffer 又称为缓存 Cache，是内存空间的一部分。也就是说，在内存中
> 预留了一定的存储空间，用来暂时保存输入或输出的数据，这部分预留的空间就叫做缓冲
> 区。 缓冲区根据其对应的是输入设备还是输出设备，分为输入缓冲区和输出缓冲区。[^1]

缓冲区分为三种类型：全缓冲、行缓冲和不带缓冲。

1) 全缓冲
  在这种情况下，当填满缓冲区后才进行实际 I/O操作。全缓冲的典型代表是对磁盘文件
  的读写。
2) 行缓冲
  在这种情况下，当在输入和输出中遇到换行符时，执行真正的 I/O操作。这时，我们输
  入的字符先存放在缓冲区，等按下回车键换行时才进行实际的I/O操作。典型代表是标准输
  入( `stdin` )和标准输出( `stdout` )。
3) 不带缓冲
  也就是不进行缓冲，标准错误文件 stderr 是典型代表，这使得出错信息可以直接尽快
  地显示出来。

下列情况会引发缓冲区的刷新:[^2]

　　缓冲区满时;

　　执行 `fflush` 语句;

　　执行 `endl` 语句;

　　关闭文件。

大致了解了之后，我们来分析一下，`getchar()` 函数获取输入时有一个特点，首先进入缓冲区获取输入，如果缓冲区啥都没有，那么就向系统请求输入，这个使用系统使用的是行缓冲，即系统会让用户开始输入，当检测到回车换行的时候，系统就会将一整行的字符（包括换行符）填入缓冲区，然后 `getchar()` 就会从缓冲区取得一个字符，后续的 `getchar()` 也是这样的逻辑。

那么我们接下来解决一下问题，如何打出 `密文为` 这几个字呢？

首先，我们可以先执行一条 `getchar()` 语句，只要执行了这条语句，在缓冲区没有任何字符的情况下，系统就会向用户获取输入，这个时候，就会进入一种阻塞状态，只有等用户最后敲下换行符，这一行字符进入缓冲区， `getchar()` 获取到了一个字符，程序才会继续执行，也就是说，我们这个时候紧接着再使用 `printf()` 输出 `密文为：` 这几个字就可以打出输出提示了，接下来就可以直接开始搞了。

## 0x03 开始实践

直接上代码

```c
// 凯撒密码
// 生如夏花般绚烂 死若秋叶之静美
// JEB-Bem 2024-09-24
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>
#define PPP puts("Bing Bing");

char s[1000],c[1000];

char replace(char c, int mode){
	int p = 4;

	if (mode == 2)
		p = -p;

	if (!(('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')))
		return c;

	if (('a' <= c && c <= 'z'))
		return ((c - 'a' + p) % 26 + 'a');
	if (('A' <= c && c <= 'Z'))
		return ((c - 'A' + p) % 26 + 'A');
}

void met1(){
	int mode = 1, st = 10;

	printf("明文为: ");
	// getchar();
	scanf("%s", s);
	for (int i = 0;i < sizeof(s);++ i){
		if (s[i] == '\0')
			break;

		//97 122 65 90
		if (('a' <= s[i] && s[i] <= 'z') || ('A' <= s[i] && s[i] <= 'Z'))
			s[i] = replace(s[i], mode);
	}
	printf("密文为: ");
	for (int i = 0;i < sizeof(s);++ i){
		if (s[i] == '\0')
			break;

		if (('a' <= s[i] && s[i] <= 'z') || ('A' <= s[i] && s[i] <= 'Z'))
			putchar(s[i]);
	}
	putchar('\n');
}

void met2(){
	int mode = 1;
	char c;

	printf("明文为：");
	fflush(stdin);//清空输入缓存区内字符
	c = getchar();
	printf("密文为：");
	while(c != '\n'){
		if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'))
			c = replace(c, mode);
		putchar(c);
		c = getchar();
	}
}

int main(){
	met2();
	return 0;
}
```

[^1]: [c语言缓冲区类型,清空缓冲区，谈 `getchar`、`getch`、`getche`](https://blog.csdn.net/weixin_42528287/article/details/85957394)

[^2]:[c语言里缓冲区的理解](https://blog.csdn.net/qq_36532097/article/details/70197061#:~:text=%E5%AE%83%E7%9A%84%E4%B8%BB%E8%A6%81%E7%9B%AE%E7%9A%84%E6%98%AF%E5%87%8F%E5%B0%91I)
