---
title: Rust Programming Language -- Notes
date: 2026/02/09 21:56:49
tags: Rust
categories: 笔记
filename: Rust_notes.md
description: Rust Programming Language 的相关笔记.
---

> 本笔记适用于有其他语言基础，想要~~速通~~ Rust 的人群使用（或许使用“复习”更恰当）. 章节对应于 “The Rust Programming Language”（《Rust 编程语言》）.  
> 建议对照章节跳转阅读.

## 4 所有权

```rust
fn main() {
  let mut a_num = 0;
  inner(&mut a_num);    // L2
}

fn inner(x: &mut i32) {
  let another_num = 1;
  let a_stack_ref = &another_num;

  let a_box = Box::new(2);
  let a_box_stack_ref = &a_box;
  let a_box_heap_ref = &*a_box;    // L1

  *x += 5;
}
```
![20260205-491b510f36c6477a.png](./images/20260205-491b510f36c6477a.png)


## 5 使用结构体组织相关数据

### Defining and Instantiating Structs

#### 语法 & 基本使用

**定义** 一个结构体:

```rust
struct <结构体名> {
    <字段名>: <数据类型>,
    ...
    <字段名>: <数据类型>[,]
}   // 无 `;` !!!
```

为结构体实例**赋值**：

```rust
let <变量>[: <结构体>] = <结构体> {
    <字段> : <值>,
    ...
    <字段> : <值>[,]
};

// 或者分开写

let user: User;

user = User {
    ...
};
```

如果我们预先定义好了与字段名同名同类型的变量，那么在赋值的时候可以省略字段名：

```rust
<变量> = <结构体> {
    <字段> : <值>,
    <变量>,
    ...
    <字段> : <值>[,]
};
```

如果我们预先定义了一个结构体实例，那么我们可以在这个变量的基础上去修改字段的值从而获得一个新的结构体实例.

```rust
let <var2>[: <结构体>] = {
    <字段> : <值>,
    <变量>,
    ..<var1>
}
```

:::warn
注意，若是某字段的数据类型没有实现 copy 特性，将会 move var1 中的该字段到 var2 中，这会导致 var1 中的字段失效！  
详见所有权相关笔记，或 [“Copying vs. Moving Out of a Collection”](https://rust-book.cs.brown.edu/ch04-03-fixing-ownership-errors.html#fixing-an-unsafe-program-copying-vs-moving-out-of-a-collection).
:::

##### Tuple Struct

**语法：**
```rust
sturct <结构体>(<类型>, ...);
```

赋值也很简单：

```rust
let <var> = <结构体>(<值>, ...);
```

同样，元组结构体也可以进行解构，但是必须声明其类型：

```rust
let <结构体>(<var>, ...) = <tuple-struct-value/var>; // <- 我想表达此处需要一个右值
```

##### 单元结构体

单元结构体类似与单元类型 `()`, 其中没有任何字段，可以定义为：

```rust
struct <结构体>;
```

这种结构体在讲到 `traits` 的时候会用到。

#### 结构体数据的所有权

一般来说，我们选择让结构体拥有数据的所有权，当然，我们也可以储存数据的引用，但是这需要使用到第十章所讲到的**生命周期（lifetime）** 的特性。

举一个例子，我们有下面的代码，这段代码储存了未指定生命周期的引用。

```rust
struct User {
    active: bool,
    username: &str,
    email: &str,
    sign_in_count: u64,
}

fn main() {
    let user1 = User {
        active: true,
        username: "someusername123",
        email: "someone@example.com",
        sign_in_count: 1,
    };
}
```

:::spoi 报错信息
```bash
$ cargo run
   Compiling structs v0.1.0 (file:///projects/structs)
error[E0106]: missing lifetime specifier
 --> src/main.rs:3:15
  |
3 |     username: &str,
  |               ^ expected named lifetime parameter
  |
help: consider introducing a named lifetime parameter
  |
1 ~ struct User<'a> {
2 |     active: bool,
3 ~     username: &'a str,
  |

error[E0106]: missing lifetime specifier
 --> src/main.rs:4:12
  |
4 |     email: &str,
  |            ^ expected named lifetime parameter
  |
help: consider introducing a named lifetime parameter
  |
1 ~ struct User<'a> {
2 |     active: bool,
3 |     username: &str,
4 ~     email: &'a str,
  |

For more information about this error, try `rustc --explain E0106`.
error: could not compile `structs` (bin "structs") due to 2 previous errors
```
:::

具体如何修复，需要在第 10 章讨论。


#### 结构体的借用

我们简单举一个例子，更多的细节实际上在前面所有权的章节就已经讨论过了.

```rust
struct Point { x: i32, y: i32 }

fn print_point(p: &Point) {
    println!("{}, {}", p.x, p.y);
}

fn main() {
    let mut p = Point { x: 0, y: 0 };
    let x = &mut p.x;
    print_point(&p);
    *x += 1;
}
```

![20260209-3e25c6ed9573f001.png](./images/20260209-3e25c6ed9573f001.png)

:::spoi 报错信息
```bash
error[E0502]: cannot borrow `p` as immutable because it is also borrowed as mutable
  --> test.rs:10:17
   |
9  |     let x = &mut p.x;
   |             -------- mutable borrow occurs here
10 |     print_point(&p);
   |                 ^^ immutable borrow occurs here
11 |     *x += 1;
   |     ------- mutable borrow later used here

```
:::

原因是 `let x = &mut p.x;` 会导致 `p` 和 `p.x` 都失去三种权限，但需要注意的是 `p.y` 实际上权限没有变动，也就是说，下面这个程序是可以通过编译的：

```rust
fn main() {
    // -- snip --
    let mut p = Point { x: 0, y: 0 };
    let x = &mut p.x;
    println!("{}", p.y);
    *x += 1;
}
```

