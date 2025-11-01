---
title: Switch 语句与变量声明
date: 2025/05/28 22:51:20
tags: c/cpp
categories: 笔记
filename: certificate_application.md
permalink: certificate_application.html
---

----
## 0x00 Include

在 C/C++ 中，若在 `case` 块中声明变量，有一些细节需要注意。先引入问题，看下面的代码：

```cpp
swtich (0) {
case 1:
    int x = 42;
case 2:
    ...
default:
    ...
}
```

无论是在 C(C23之后不会出现[^1]) 还是 C++ 中，都会出现编译错误/警告：

C

```bash
test.c:7:9: warning: a label can only be part of a statement and a declaration is not a statement [-Wfree-labels]
    7 |         int x = 42;
```

C++

```bash
g++ test.cpp
test.cpp: In function ‘int main()’:
test.cpp:9:10: error: jump to case label
    9 |     case 0:
      |          ^
test.cpp:7:13: note:   crosses initialization of ‘int x’
    7 |         int x = 42;
```

## 0x01 原因

这两个错误/警告的原因并不相同。

### C

在 C23 以前，如果在 `case VAL:` 后面紧跟一个 `Declaration`, C 会抛出警告:

```bash
a label can only be part of a statement and a declaration is not a statement [-Wfree-labels]
```

因为 `case VAL:` 实际上是一个标签（Label），label 只能修饰 statement, 而不能修饰 declaration。

因此，我们只需要在 `int x = 42;` 前面任意加上一个 statement 即可，更进一步，我们可以写一个空的 statement:

```c
swtich (0) {
case 1:;    // <-- 这里写了一个空的语句
    int x = 42;
case 2:
    ...
default:
    ...
}
```

当然，建议写得更加符合规范一点，即使其变成一个复合语句，也就符合修饰 statement 的标准了，需要注意的是，这是 C 的概念（复合语句）

```c
swtich (0) {
case 1: {
    int x = 42;
}
case 2:
    ...
default:
    ...
}
```

### C++

而在 C++ 中，之所以会抛出上面的错误，是因为编译器 swtich 中有多个 `case VAL:` 块，且其中一个块中还进行了初始化（不是声明，也不是赋值），在 C++ 中，变量初始化具有强语义（特别是类对象的构造函数不能被跳过），所以编译器强制你不得绕过初始化。

怎么改呢？一个方法是像 C 一样加上 `{}`，这保证了每个 `case` 块都拥有一个独立的作用域，而没有使用 `{}` 的 `case` 块将共享同一个作用域。

```cpp
swtich (0) {
case 1: {
    int x = 42;
}
case 2:
    ...
default:
    ...
}
```

所以，虽然 C 和 C++ 都可以通过加上 {} 来解决，但底层原因并不相同。

## 0x02 更进一步

C++ 中有没有其他方法呢？~~有的，兄弟，有的~~

```cpp
swtich (0) {
case 1:
    int x;
    x = 42;
case 2:
    ...
default:
    ...
}
```

是的，只要不进行初始化，C++ 不会报错。

那这么说，我们可以这样做：

```cpp
swtich (0){
case 1:
    int x;
    x = 42;
    // C 中甚至可以直接写 int x = 42; 只要前面有一个 statement 就可以
case 0:
    cout << x << endl;
    // C
    // printf("%d\n", x);
default:
    ...
}

$ g++ test.cpp && ./a.out
30893
```

那么这样呢？

```cpp
switch (0){
case 0:
    std::cout << x << std::endl;
case 1:
    int x;
    x = 42;
    break;
}

$ g++ test.cpp && ./a.out
test.cpp: In function ‘int main()’:
test.cpp:7:22: error: ‘x’ was not declared in this scope
    7 |         std::cout << x << std::endl;
      |                      ^
```

实际上，case 语句在底层是类似 `goto` 的逻辑，它会直接根据 swtich 需要匹配的值，跳转到相应的位置，第一个问题是如果没有 `break` 语句，就不会进行第二次跳转了，他会把后面其他 `case` 块的代码也执行了，第二个问题是，我在其他 case 块中即便没有定义某个变量，也可以正常编译，因为前面的 `case` 块中已经定义过了（可别忘了在普通的代码块中直接使用一个未定义的变量是会编译错误的！）。所以，上面的代码我们可以使用 goto 语句来实现：

```c
int main() {
    if (val == 1) goto CASE1;
    if (val == 0) goto CASE0;

CASE1:
    int x = 42;
CASE0:
    printf("%d\n", x);

    return 0;
}
```

如果我们抛弃标签：

```c
int x = 42;
printf("%d\n", x);
```

这样就可以说明为什么可以编译通过了。所以 `swtich` 相比 `goto` 就是多了结构化的语句，并且做了跳转表和一些额外的检查。

前面那个颠倒后就编译失败的例子也很好理解了：

```c
printf("%d\n", x);
int x = 42;
```

所以肯定会编译失败了。

[^1]: [Why can't vraiables be declared in a swtich statement?](https://stackoverflow.com/questions/92396/why-cant-variables-be-declared-in-a-switch-statement)

