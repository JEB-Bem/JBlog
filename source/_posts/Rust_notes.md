---
title: Rust Programming Language -- Notes
date: 2026/02/09 21:56:49
tags: Rust
categories: 笔记
filename: Rust_notes.md
description: Rust Programming Language 的相关笔记.
---

> - 本笔记适用于有其他语言基础，想要~~速通~~ Rust 的人群使用（或许使用“复习”更恰当）. 章节对应于 “The Rust Programming Language”（《Rust 编程语言》）.
> - 建议对照章节跳转阅读.

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

### 结构体的定义与实例化

#### 语法 & 基本使用

**定义**一个结构体:

```rust
struct <结构体名> {
    <字段名>: <数据类型>,
    ...
    <字段名>: <数据类型>[,]
}   // 无`;`!!!
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

单元结构体类似与单元类型`()`, 其中没有任何字段，可以定义为：

```rust
struct <结构体>;
```

这种结构体在讲到`traits`的时候会用到。

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

For more information about this error, try`rustc --explain E0106`.
error: could not compile`structs`(bin "structs") due to 2 previous errors
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
error[E0502]: cannot borrow`p`as immutable because it is also borrowed as mutable
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

原因是`let x = &mut p.x;`会导致`p`和`p.x`都失去三种权限，但需要注意的是`p.y`实际上权限没有变动，也就是说，下面这个程序是可以通过编译的：

```rust
fn main() {
    // -- snip --
    let mut p = Point { x: 0, y: 0 };
    let x = &mut p.x;
    println!("{}", p.y);
    *x += 1;
}
```

#### 结构体 & 派生特征

我们有时候想要直接打印一个结构体的信息，使用`println!("{<结构体变量>}")`会发生变异错误，这个时候，我们想要启用默认的调试输出格式，就需要使用派生特征，其语法为：

```rust
#[derive(Debug)]
struct <结构体> {
    ...
}

// 输出一个结构体的(详细)调试信息
println!("{结构体:?}");
println!("{结构体:#?}");
```

### 方法(Method)


要在一个结构体的上下文中定义函数，我们需要创建一个`impl`块。一个方法定义如下：

```rust
impl <结构体> {
    fn <方法名>(&self, 参数 ...)
}
```

:::note
在方法形参中的`&self`实际上是`self: &Self`的简写.  

在`impl`块中，类型`Self`实际上是`impl`所针对类型的别名，也就是说，在上面的例子中我们可以将`&self`或`self: &Self`替换为`self: &Rectangle`程序依然能够正常编译运行.  

另外`self`、`&self`、`&mut self`，分别表示参数的移动（会获取实例所有权，这种技术通常用于当方法将`self`转换为其他东西，并且你想阻止调用者在转换后使用原始实例时）、不可变借用和可变借用.
:::

要调用这些方法，使用`实例.方法(参数...)`的格式.

我们可以定义与结构体字段名相同的方法名，通常来说，这个方法作为获取器，返回字段的值，获取器的作用在于我们可以将字段设置为私有（在后面会提到）而不影响我们获取字段的值，当然我们并不强求将同名方法设置为获取器，下面是一个不同的做法：

```rust
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}
```

#### 关联函数

在`impl`中定义的所有函数都称为关联函数，如果某个关联函数的第一个参数不是`self`，那么它就不是方法.

:::warn
实际上，就算是方法，我们也可以使用`结构体::方法(实例（引用）)`的形式来调用.  
也就是说`实例.方法(参数...)`实际上只是一种语法糖罢了.
:::

不是方法的关联函数通常作为构造函数，这些函数的名称通常为 new，但是我们也可以设置为其他名称，比如`String::from`函数，以及下面的一个示例：

```rust
impl Rectangle {
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}
```

:::impo
在 Rust 中并没有类似与 C++ 里的`->`运算符，在使用点运算符时，Rust 会自动进行引用与解开引用.
:::spoi 示例

```rust
let r = &mut Box::new(Rectangle { 
    width: 1,
    height: 2
});
let area1 = r.area();
// 自动引用与解引用调用函数
let area2 = Rectangle::area(&**r);
// 自动解引用取出字段的值
println!("{}", r.width);
assert_eq!(area1, area2);
```

![20260223-5f103b7e90696da3.png](./images/20260223-5f103b7e90696da3.png)

:::

#### 多个`impl`块

可以将上面提到的这些函数写在一个`impl`块中，也可以写在多个`impl`块中，后面会讲到一个适合使用这种实现的情景.


#### 方法和所有权

结构体的所有权使用前面第四章所讲到的知识就可以理解，下面展示一些第四章未曾提到的部分.

如果结构体没有实现 Copy 特性，调用期望传入`self`的方法将会移动（move）传入的结构体. 例如：

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }

  fn set_width(&mut self, width: u32) {
    self.width = width;
  }

  fn max(self, other: Self) -> Self {
    let w = self.width.max(other.width);
    let h = self.height.max(other.height);
    Rectangle { 
      width: w,
      height: h
    }
  }
}

fn main() {
let rect = Rectangle {
    width: 0,
    height: 0
};

let other_rect = Rectangle { 
    width: 1, 
    height: 1 
};

let max_rect = rect.max(other_rect);
println!("{}", rect.area());
}
```

上面的代码会引发错误，因为 36 行移动了`rect`，导致`rect`失去所有权。

:::spoi 报错信息
```bash
error[E0382]: borrow of moved value:`rect`
  --> test.rs:33:16
   |
24 | let rect = Rectangle {
   |     ---- move occurs because`rect`has type`Rectangle`, which does not implement the`Copy`trait
...
32 | let max_rect = rect.max(other_rect);
   |                     ---------------`rect`moved due to this method call
33 | println!("{}", rect.area());
   |                ^^^^^^^^^^^ value borrowed here after move
```
:::

我们可以通过添加`#[derive(Copy, Clone)]`来启用编译器默认为结构体实现的`Copy`特征，这样，在需要传值移动的地方（这些地方都会消耗所有权），就会变成复制（这时只需要可读权）:

```rust
#[derive(Clone, Copy)]
struct Rectangle {
    ...
}

impl Rectangle {
    ...
    fn set_to_max(&mut self, other_rect: Self) {
        // *self = self.max(other_rect);
        // 这里 *self 和 other_rect 都只需要 R 权限
        // *self 拥有 R 和 W 权限.
        *self = Rectangle::max(*self, other_rect);
    }
}
```

这个例子展示了不实现 Copy 会导致的重复释放问题:

```rust
struct Rectangle {
    width: u32,
    height: u32,
    name: String,
}

impl Rectangle {    
  fn max(self, other: Self) -> Self {
    let w = self.width.max(other.width);
    let h = self.height.max(other.height);
    Rectangle { 
      width: w,
      height: h,
      name: String::from("max")
    }
  }
    fn set_to_max(&mut self, other: Rectangle) {
        let max = self.max(other);
        drop(*self); // This is usually implicit,
                     // but added here for clarity.
        *self = max;
    }
}

fn main() {
    let mut r1 = Rectangle { 
        width: 9, 
        height: 9, 
        name: String::from("r1") 
    };
    let r2 = Rectangle {
        width: 16,
        height: 16,
        name: String::from("r2")
    };
    r1.set_to_max(r2);
}
```
`Rectangle::max(*self, other)`会消耗所有权，如果真的能够运行，那么在`max`方法运行完之后，`*self`和`other`原本拥有的那部分数据因为没有人拥有它，会释放掉，之后执行`*self = max`的时候会先释放`*self`再给它赋值，这就会导致`self`的`name`被重复释放.


## 6 枚举与模式匹配

### 枚举的语法

```rust
enum 枚举类型 {
    枚举值[(数据类型, ...)],
    枚举值[ {数据类型, ...}],
    ...
}
```

一个枚举类型里面的每一项准确来说成为枚举变体，枚举变体可以看作一个构造枚举实例的函数，下面是一个枚举的应用实例：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

实际上，**上面的几个枚举变体可以分别看作单元结构体、结构体、元组结构体、元组结构体**.

:::tip
Rust 标准库提供了一个用于储存 IP 地址的枚举类型，其定义如下：

```rust
struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```
:::

枚举类型也可以实现`impl`块，其语法与结构体类似，示例如下：

```rust
impl Message {
    fn call(&self) {
        // method body would be defined here
    }
}

let m = Message::Write(String::from("hello"));
m.call();
```

#### Option 枚举

Rust 没有定义`null`值，避免了很多编程语言的空引用容易引发的错误，但 Rust 实现了 Option 类型，可以编码值存在或不存在的概念：

```rust
enum Option<T> {
    None,
    Some(T),
}
```

Option 枚举及其变体被包含在预置模块中，不需要显式的引入作用域中.  
下面是一个示例：

```rust
fn main() {
    let some_number = Some(5);
    let some_char = Some('e');

    let absent_number: Option<i32> = None;
}
```

##### 为什么`None`比`null`更好？

简单来说，因为编译器不会将`Option<T>`和`T`视为同一种类型，也就是说，下面的代码会导致编译错误：

```rust
    let x: i8 = 5;
    let y: Option<i8> = Some(5);

    let sum = x + y;
```

通过这个机制，编译器会确保我们在处理`Option<T>`时考虑到空与非空两种情况，一个常见的处理方法是使用`match`表达式：

```rust
let x: Option<i32> = Some(5);

let value = match x {
    Some(v) => v,
    None => panic!("value is None"),
};
```

### `match`控制流结构

语法如下，其中`模式 => 代码`被称为 match 臂（arms）

```rust
match 表达式 {
    模式 => 代码,   // 代码部分的花括号可选
    ...
}
```

`match`表达式的一个非常重要的特性是我们可以从匹配到的模式中提取值，比如下面的例子：

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        }
    }
}

fn main() {
    value_in_cents(Coin::Quarter(UsState::Alaska));
}
```

这个特性可以用于对 Option 枚举或其他枚举进行不同的处理.

#### 模式匹配必须全覆盖

`match`分支的模式必须穷尽表达式所有的可能性，否则会导致编译错误

##### `_`占位符

`_`是一种特殊模式，它匹配任何值并且不会绑定到该值。这告诉 Rust 我们不会使用该值，因此 Rust 不会就未使用的变量向我们发出警告。

其他情况下，我们可以自己定义其他的变量名来获取未匹配到的所有情形，需要注意的是，我们需要将这种分支放到 `match` 表达式的后面，因为 `match` 是顺序匹配的.

#### 所有权问题

在使用模式匹配时，同样需要考虑所有权问题，特别是移动之后导致原表达式的所有权丢失，比如：

```rust
fn main() {
let opt: Option<String> = 
    Some(String::from("Hello world"));

match opt {
    // 下面这个就不会有问题
    // Some(_) => println!("Some"),
    Some(s) => println!("Some: {}", s),
    None => println!("None!")
};

println!("{:?}", opt);
}
```

解决方法是使用引用（借用）：

```rust
fn main() {
    let opt: Option<String> = 
        Some(String::from("Hello world"));

    // opt became &opt
    match &opt {
        Some(s) => println!("Some: {}", s),
        None => println!("None!")
    };

    println!("{:?}", opt);
}
```

:::impo
Rust 会将引用从外层的 `&Option<String>` 传递到内层的 `&String`，所以最终 `s` [绑定](https://doc.rust-lang.org/reference/patterns.html#binding-modes)的类型实际上是 `&String`.
:::

### `if let` & `let else` -- 流程控制

我们可以将一些模板化的 `match` 语句做一个简化，`if let` 的语法是：

```rust
if let 模式 = 表达式 {
    代码        // 可以直接写返回表达式
} else {
    代码        // 返回时必须使用 return
};              // 不要忘记分号
// 花括号不可省略
```

应用举例：

```rust
fn describe_state_quarter(coin: Coin) -> Option<String> {
    let state = if let Coin::Quarter(state) = coin {
        state
    } else {
        return None;
    };

    if state.existed_in(1900) {
        Some(format!("{state:?} is pretty old, for America!"))
    } else {
        Some(format!("{state:?} is relatively new."))
    }
}

```

还可以使用 `let else` 结构，模式捕捉到的变量会直接返回：

```rust
fn describe_state_quarter(coin: Coin) -> Option<String> {
    let Coin::Quarter(state) = coin else {
        return None;
    };

    if state.existed_in(1900) {
        Some(format!("{state:?} is pretty old, for America!"))
    } else {
        Some(format!("{state:?} is relatively new."))
    }
}
```

## 7 Packages, Crates and Modules

Rust 提供了一套模块系统，分为下面这些层次：

- Packages（包)：Cargo 的特性（功能），允许我们构建、测试和共享 Crates；
- Crates（包、包装箱）：生成库或可执行文件的模块树；
- Modules（模块）and use：控制**路径**的组织、作用域和隐私性

### Packages 和 Crates

Crate 是 Rust 中的最小编译单位，有两种形式：

- Binary Crate: 编译成可执行文件，必须含有 main 函数
- Library Crate: 编译成库文件，不含有 main 函数

:::tip
一般 Rust 开发者谈到“crate”时，指的是 Library Crate，即一般编程概念中的库.
:::

Crate 根（root）是一个源文件，Rust 编译器从这里开始编译，并构成这个 crate 的根模块.

Package 是包含一个或多个 Crate 的功能集合。必须含有：

- `Cargo.toml` 描述怎样构建（build）这些 crates.
- 任意数量的 Binary Crate 和最多一个 Library Crate （两者至少一个）

::: tip
实际上 Cargo 就是一个包含**用于构建代码的命令行工具（即二进制 Crates）** 的包.
:::

使用 `cargo new` 命令就是在创建一个包：

```bash
$ cargo new my-project
     Created binary (application) `my-project` package
$ ls my-project
Cargo.toml
src
$ ls my-project/src
main.rs
```

`Cargo.toml` 中并没有提到 `src/main.rs`，这是因为 Cargo 遵循 `src/main.rs` 是与包同名的 Binary Crate 的 crate root，同理 `src/lib.rs` s是与包同名的 Library Crate 的 crate root.

:::note
如果一个包包含 src/main.rs 和 src/lib.rs，它有两个 Crate：一个二进制 Crate 和一个库 Crate，它们的名称都与包的名称相同。一个包可以通过在 src/bin 目录中放置文件来拥有多个二进制 Crate：每个文件都会是一个独立的二进制 Crate。
:::

### Modules

#### Modules Cheat Sheet

- **从 crate root 开始**： 当编译一个 Crate 时，编译器首先在 crate root file （库 crate 通常是 src/lib.rs，二进制 crate 通常是 src/main.rs）中查找要编译的代码.

- **声明模块**：在 crate 根文件中，可以声明新的模块；假设声明了一个名为 `garden` 的模块（使用 `mod garden;`），编译器会在以下位置查找该模块的代码：

    - 内联（inline），在前面提到的 `mod garden` 后紧跟的花括号中，且这时不需要分号；
    - 在文件 *src/garden.rs* 中；
    - 在文件 *src/garden/mod.rs*；

- 声明子模块：在任何非 crate root 文件中，例如在 *src/garden.rs* 中声明 `mod vegetables;` 编译器会在以父模块命名的目录的以下位置查找子模块的代码
    
    - 内联，与模块的内联声明一样；
    - 在文件 *src/garden/vegetables.rs* 中;
    - 在文件 *src/garden/vegetables/mod.rs* 中.

- 模块中代码的路径（Paths）：一旦某个模块成为你的 crate 的一部分，只要符合隐私规则，你就可以使用代码的路径从该 crate 的任何其他地方引用该模块中的代码。例如，garden vegetables 模块中的 Asparagus 类型可以在 `crate::garden::vegetables::Asparagus` 处找到.

- Private vs. public: 模块中的代码默认对父模块私有，使用 `pub mod` 声明可使模块共有，要使得共有模块中的项（items）也变为共有，在其声明前使用 `pub`.

- `use` 关键字：在作用域内，`use` 关键字创建项的快捷方式，从而减少长路径的重复，其功能类似与 *C++* 中的 `using`.

### 在模块树中使用路径

路径有两种形式：

- 绝对路径是从 crate 根开始的完整路径；对于来自外部 crate 的代码，绝对路径以 **crate 名称**为起始，而对于来自当前 crate 的代码，它以字面量 `crate` 开头。
- 一个相对路径从当前模块开始，并使用 `self`、`super` 或当前模块中的标识符。

在 Rust 中，所有项目（函数、方法、结构体、枚举、模块和常量）默认情况下对父模块是私有的。如果你想将函数或结构体等项目设为私有，你需要将它们放在一个模块中。

父模块中的项目不能使用子模块中的私有项目，但子模块中的项目可以使用它们祖先模块中的项目。这是因为子模块封装并隐藏了它们的实现细节，但子模块可以看到它们定义的上下文。

#### 使用 pub 关键字暴露路径

一个 item 可被访问，当且仅当：

- 它本身是 pub
- 从当前作用域到它之间的每一级模块都是可见的

:::note
模块是容器，公开模块并不代表公开其内的内容.
:::

:::spoi 示例
`eat_at_restaurant` 想要访问到 `add_to_waitlist` 函数，那么 `add_to_waitlist` 和 `hosting` 就必须公开，即**确保整个路径上的模块和项都公开**，但是注意到子模块只是对父模块封装并隐藏，而不对同级的其他项和模块隐藏（也就是属于同一父模块），因此 `eat_at_restaurant` 天然的就可以访问到 `front_of_house` （但不包括其内容）.

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
        // 添加了一个小的测试，用于演示可以访问到祖先模块（准确来说是所属 crate 下的其他内容）
        mod a {
            mod b {
                fn test() {
                    crate::eat_at_restaurant();
                }
            }
        }
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();

    // Relative path
    front_of_house::hosting::add_to_waitlist();
}
```
:::

<br/>

:::tip
[The Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) 指导了如何设计和管理公共 API.
:::

:::tip
:::spoi 具有二进制文件和库的包的最佳实践

我们提到过，一个包可以同时包含一个 *src/main.rs* 二进制 crate 根和一个 *src/lib.rs* 库 crate 根，并且这两个 crate 默认都会使用包名。通常来说，采用这种模式（同时包含一个 library crate 和一个 binary crate）的 package，会在 binary crate 中只保留足够启动程序的代码，然后由它去调用定义在 library crate 中的代码。这样其他项目就能受益于包提供的最大功能，因为库 crate 的代码可以被共享。这样其他项目就能受益于包提供的最大功能，因为库 crate 的代码可以被共享。

模块树应该在 *src/lib.rs* 中定义。然后，通过以包的名称开始路径，任何公共项目都可以在二进制 crate 中使用。二进制 crate 使用库 crate 就像完全外部的 crate 使用库 crate 一样：它只能使用公共 API。这有助于你设计一个良好的 API；你不仅是作者，也是客户端！
:::

#### `super` & 相对路径

通过在路径开头使用 `super` 可以访问到以父模块为起点的相对路径，类似于文件系统中的 `..` 语法.

#### 结构体与枚举类型的公开

同样可以使用 `pub` 公开结构体与枚举类型。需要注意的是仅仅在定义结构体之前使用 `pub` 只会公开其本身，其内部的字段并不会被公开。我们需要在字段之前加上 `pub` 来公开某一字段.

:::impo
如果结构体的某一字段没有被公开，那么就必须提供一个公共的关联函数，比如 `new()` 来创建结构体的实例.
:::

**相反**，使用 `pub` 公开一个枚举类型会直接公开其所有变体.

:::tip
枚举类型默认公开其字段，结构体默认不公开其字段.
:::

### 使用 use 关键字将路径引入作用域

类似 *Python* 中的 `import ... as ...`，*C++* 中的 `using`，我们在 Rust 中可以使用 `use <path> as <alias>` 的方式来引入路径.

更类似的应该是将 `use` 当作文件系统中的 *link* 来理解.

需要注意的是，**`use` 仅在 `use` 出现的作用域中起作用**，例如：

```rust
use crate::front_of_house::hosting;

mod customer {
    pub fn eat_at_restaurant() {
        hosting::add_to_waitlist();
    }
}
```

解决方法是将 path 调整一下，并将 `use` 移动到 `customer mod` 中.

::: tip
**使用 `use` 引入路径的惯用做法**

一般来说，对于函数，我们常常只引入到其父模块，这样既简化路径，又明确了函数非本地定义.  
对于结构体、枚举以及其他 items，指定完整路径是惯用的做法.


**例外**  
若要同时引入两个相同的 item，只能引入它们的父模块或使用别名.
:::

#### 使用 pub use 重新导出名称

如果在 `use` 前加上 `pub`，就相当于把这个名称重新导入到了当前模块下（用文件系统中的 link 会比较好理解），举个例子：

```rust
// lib.rs
mod front_of_house;

pub use crate::front_of_house::hosting;

// front_of_house.rs
pub mod hosting {
    pub fn add_to_waitlist() {
        println!("added");
    }
}

// main.rs
use restaurant::hosting;

fn main() {
    hosting::add_to_waitlist();
}
```

#### 使用外部包

我们前面提到,

> “绝对路径是从 crate 根开始的完整路径；对于来自外部 crate 的代码，绝对路径以 **crate 名称**为起始，而对于来自当前 crate 的代码，它以字面量 `crate` 开头。”

`use` 的使用技巧与前面所提到的大差不差. **需要注意的是使用外部包时应当在 *Cargo.toml* 中列出依赖，如果只在本地存在，需要添加本地包的路径.**

#### 使用嵌套逻辑和通配符简化 use 列表

```rust
// --snip--
use std::cmp::Ordering;
use std::io;
// --snip--

// 简化
// --snip--
use std::{cmp::Ordering, io};
// --snip--

use std::io;
use std::io::Write;

// 简化
use std::io::{self, Write};


// 通配符 常用于导入所有测试内容
use std::collections::*;
```

### 将模块分离到不同的文件中

基本方法不多解释，就是前面提到的 cheat sheet 中的规范.

:::note
对于 crate root 中声明的名为 `front_of_house` 模块，编译器会在以下位置寻找模块的代码：
- *src/front_of_house.rs*: 常用的方式
- *src/front_of_house/mod.rs*: 较旧的风格

对于子模块的代码放置风格同样有两种，与模块类似，*/mod.rs* 的写法同样是较旧的风格。

**对于同一个（子）模块而言，同时使用两种声明风格会引起编译错误**，不同的模块之间风格可以混用.
:::

## 常见集合（Collections）

Rust 的标准库包含了一些非常有用的数据结构，称为集合。大多数其他数据类型表示一个特定的值，但集合可以包含多个值。与内置的数组和元组类型不同，这些集合指向的数据存储在**堆**上，这意味着数据量不需要在编译时确定，并且可以在程序运行时增长或缩小。每种集合都有不同的能力和成本，我们主要讨论三种集合：

- 向量（Vector）：允许并排（紧凑）储存多个值；
- 字符串（String）：一组字符的集合；
- 哈希映射（Hash Map）：他是数据结构——映射（Map）的特定实现.

:::tip
标准库提供的[其他类型的集合](https://doc.rust-lang.org/std/collections/index.html)
:::

### 向量

一些基本的语法：

```rust
// 创建新的空向量
let v: Vec<type> = Vec::new();
// 指定长度与默认值
let v[: Vec<type>] = vec![value; len];

// 更新向量 - 要求 value 类型同为 type，v 为 mutable
v.push(value);

// 读取向量中的元素
let var: type = v[index];
let var: &type = &v[index];
let var: Option<&type> = v.get(2);

/* 遍历向量中的值
 * `&v` 则 i 的类型为 &type
 * `&mut v` 则 i 的类型为 &mut type 这个表达式在底层应该等价于 v.iter()
 * `v` 则 i 的类型为 type
 */
for i in &v {
    // --snip--
}
```

#### for 遍历向量的工作方式

![20260308-edc68adc6afc658f.png](./images/20260308-edc68adc6afc658f.png)

这从底层原理解释了为什么无法边遍历边修改向量.

:::tip
`a..b` 也是一个表达式，其类型为 *Range<T>*
:::

#### 枚举在向量中的妙用

有时候我们想用向量储存不同类型的值，我们可以枚举不同类型的变体，然后用向量来储存：

```rust
    enum SpreadsheetCell {
        Int(i32),
        Float(f64),
        Text(String),
    }

    let row = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Text(String::from("blue")),
        SpreadsheetCell::Float(10.12),
    ];
```

顺带一提，可以使用 `Vec::pop()` 方法来移除并返回最后一个元素.

:::tip
:::spoi 关于向量使用的小技巧
1. 下面这个程序会出现所有权问题，如果代码能够通过编译，那一旦第一个元素非 `0`，只要经过一次 `shrink_to_fit`，`v.iter()` 就会失效（注意这里是倒序的）.

    ```rust
    /// Removes all the zeros in-place from a vector of integers.
    fn remove_zeros(v: &mut Vec<i32>) {
        for (i, t) in v.iter().enumerate().rev() {
            if *t == 0 {
                v.remove(i);
                v.shrink_to_fit();
            }
        }
    }
    ```
    
    改进方法比较巧妙，由于是倒序的，所以删除后面的元素不会影响前面元素的索引：
    
    ```rust
    fn remove_zeros(v: &mut Vec<i32>) {
        for i in (0 .. v.len()).rev() {
            if v[i] == 0 {
                v.remove(i);
                v.shrink_to_fit();
            }
        }
    }
    ```

2. 下面这个程序理论上来说是安全的，但是会引起编译错误：

    ```rust
    fn reverse(v: &mut Vec<String>) {
        let n = v.len();
        for i in 0 .. n / 2 {
            let p1 = &mut v[i] as *mut String;
            let p2 = &mut v[n - i - 1] as *mut String;
            unsafe { std::ptr::swap_nonoverlapping(p1, p2, 1); }
        }
    }
    ```

    为了改进，我们只能使用 `unsafe` 块，这里是一个安全的用法：

    ```rust
    fn reverse(v: &mut Vec<String>) {
        let n = v.len();
        for i in 0 .. n / 2 {
            let p1 = &mut v[i] as *mut String;
            let p2 = &mut v[n - i - 1] as *mut String;
            unsafe { std::ptr::swap_nonoverlapping(p1, p2, 1); }
        }
    }
    ```
:::

### 使用 String 来储存 UTF-8 编码文本

`String` 被实现为 bytes 的集合，在 Rust 中 *string (字符串)* 这一术语通常表示唯一的一种字符串类型——字符串切片 `str`，且常见于其借用形式 `&str`. 我们前面提到，**字符串切片是对储存在其他地方的 UTF-8 编码字符串数据的引用**. 比如，字符串字面量被储存在程序的二进制文件中，因此他们也是字符串切片.

而 `String` 则是一种由 Rust 标准库提供的但并非编码在核心语言中的，可增长、可变、可被拥有的 UTF-8 编码字符串类型. 当 Rust 开发者提到 “*strings*” 这一术语时，他们可能指的是 `String` 或字符串切片 `&str`，而不仅仅是其中之一.

`String` 的一些基本语法见下：

```rust
// 创建空的 String
let mut s = String::new();

// 字符串切片转 String
// to_string 在任何实现了 Display 特性的类型上都可以使用
let data = "initial contents";
let s = data.to_string();

let s = "foo".to_string();
let s = String::from("foo");

// 追加字符串
s.push_str("bar");    // s => "foobar"
// 追加字符
s.push('l');

// 拼接字符串
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2; // s1 被移动

// 同时拼接多个字符串，第一个字符串被移动
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = s1 + "-" + &s2 + "-" + &s3;
// 使用 format
let s = format!("{s1}-{s2}-{s3}");
```

要解释为什么*拼接字符串*一例中 `s1` 被移动，为什么 `s2` 要使用引用，都与 `+` 运算符调用的函数签名有关：

```rust
fn add(self, s: &str) -> String {
```

注意，这里 `&s2` 的类型是 `&String`，但是在传入方法时被 Rust 进行了强制类型转换.

:::tip
Rust 中一个 `char` 占用 4 字节，表示 Unicode 标量，所以我们可以直接 `push` 中文字符.
:::

#### Rust 不支持 String 索引

一个 `String` 实际上是一个 `Vec<u8>` 的包装，这意味着，对于 `String::from("Здравствуйте")`，其长度将是反直觉的 $24$，因为这个字符串中的每个 Unicode 标量需要 2 个字节的存储空间.

因此，Rust 为了防止 UTF-8 编码导致的这种可能出现的无法立即发现的错误，并没有索引的支持.

从 Rust 的角度，实际上有三种看待字符串的角度：

- 作为字节
- 作为标量值
- 作为字节簇（Grapheme Clusters）—— 最接近人类直觉的字符/字母的概念

对于单词 `नमस्ते`，从字节或者说 `Vec<u8>` 的角度来看是：

```rust
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164, 164,
224, 165, 135]
```

这是计算机最终存储这些数据的方式，如果我们把他们看作 Unicode 标量即 Rust 中的 `char` 类型，那么这些字节应是这样的：

```rust
['न', 'म', 'स', '्', 'त', 'े']
```

其中的第 4 个和第 6 个是变音符号，不是字母，若我们把他们看作字符簇，那么这个单词应当由四个字母组成：

```rust
["न", "म", "स्", "ते"]
```

Rust 提供了多种解释原始字符串数据的方式，方便各种需求的实现。另外一般来说索引操作预期需要常数时间 $O(1)$，但是 `String` 需要从开头遍历来寻找每个 `UTF-8` 字符的起始字节和长度，因此无法保证这种性能，故不实现索引.

#### 切片字符串

从另一个角度来说，使用索引无法确定到底应该返回字节值、标量值还是字符串切片，因此，当我们使用字符串切片的时候，需要更加明确。

```rust
let hello = "Здравствуйте";

let s = &hello[0..4];
```

这里 `s` 是一个 `&str`，包含字符串的前四个字节，因为我们知道这些字符都是 2 字节 UTF-8 字符，所以 `s` 是 `Зд`.

如果我们再次尝试 `&hello[0..1]` (截取了一个字符的一部分字节)，Rust 会报错：
:::spoi 报错信息
```bash
$ cargo run
   Compiling collections v0.1.0 (file:///projects/collections)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/collections`

thread 'main' panicked at src/main.rs:4:19:
byte index 1 is not a char boundary; it is inside 'З' (bytes 0..2) of `Здравствуйте`
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```
:::

所以切片时边界一定要对应 `UTF-8` 字符的边界.

#### 字符串迭代

我们可以分别通过 `.chars` 和 `.bytes()` 迭代 Unicode 字符和字节. 由于获取字符簇过于复杂，Rust 标准库并未提供支持.

#### 在 Hash Maps 中存储键值对

`HashMap<K, V>` 使用**哈希函数**存储类型 `K` 的键到类型 `V` 的值的映射，该函数决定了它如何将这些键和值放置在内存中。下面介绍其基本语法：

```rust
use std::collection::HashMap;

let mut scores = HashMap::new();

// 所有键必须同类型，所有值必须同类型
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

// get 返回的是 Option(&V)，.copied() 会返回其 Option(V)
let score = scores.get(&String::from("Blue")).copied().unwrap_or(0);

// 遍历（迭代）哈希映射中的键值对
// 同样使用引用来防止移动 scores 中的数据
// **迭代哈希是随机顺序进行**
for (key, value) in &scores {
    // -- snip --
}

// 覆盖值
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

// 在键不存在时添加键值对
// .entry() 返回 Entry<'_, K, V) 其中的 '_ 表示匿名生命周期
// Entry::or_insert() 的定义是：如果对应的 Entry 键存在，则返回该键的值的一个
// 可变引用，如果不存在，则将参数作为此键的新值插入，并返回新值的一个可变引用。
scores.entry(String::from("Blue")).or_insert(50);

// 基于旧值更新值
let text = "hello world wonderful world";
let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

for (key, value) in map {
    println!("{key}: {value}");
}
```

#### Hash Maps 与 所有权

对于实现了 `Copy` 特性的类型，其值会被赋值到哈希映射中，对于未实现的类型，其值会被移动，哈希映射将会拥有这些值. 为了在插入后仍然拥有这些值，我们可以插入值的引用，这就要求了引用的值必须在哈希映射有效期间保持有效，这就涉及到了生命周期的内容.

#### Hashing Functions (哈希函数)

默认情况下， HashMap 使用一种名为 SipHash 的哈希函数，该函数可以提供对涉及哈希表的拒绝服务（DoS）攻击的防护 1 。这不是最快的哈希算法，但性能下降所带来的安全性提升的权衡是值得的。如果你分析代码后发现默认的哈希函数对于你的用途来说太慢了，你可以通过指定不同的哈希器来切换到另一个函数。哈希器是一种实现了 BuildHasher 特性的类型。我们将在第 10 章讨论特性以及如何实现它们。你不必一定从零开始实现自己的哈希器；crates.io 上有其他 Rust 用户共享的库，提供了实现许多常见哈希算法的哈希器。

## 错误处理

Rust 将错误分为两大类：**可恢复错误**和**不可恢复错误**。对于可恢复错误，例如文件未找到错误，我们通常只想向用户报告问题并重试操作。不可恢复错误总是错误的症状，例如尝试访问数组末尾之外的地址，因此我们希望立即停止程序。

大多数语言不区分这两种错误类型，而是使用异常等机制以相同的方式处理它们。Rust 没有异常。相反，它有用于可恢复错误的类型 `Result<T, E>` 和在程序遇到不可恢复错误时停止执行的 `panic!` 宏。

### 不可恢复错误

> If an unrecoverable error occurs – one where you think, crap, this program is a dumpster fire… – you should *panic*. Panics terminate the program immediately and cannot be caught. (Side note: it’s technically possible to catch and recover from panics, but doing so really defeats the philosophy of error handling in Rust, so it’s not advised.)
>
> —— CS110L Lecture Notes

在 Rust 中，有两种情形会导致程序崩溃：一是执行会导致代码崩溃的操作（比如访问数组越界）；二是显式调用 `panic!` 宏。

:::tip
**应对崩溃：回溯堆栈或中止程序**

默认情况下，当发生崩溃时，程序会开始回溯，这意味着 Rust 会沿着堆栈向上移动并清理遇到的每个函数中的数据。然而，回溯和清理是一项大量工作。因此，Rust 允许你选择替代方案：立即中止，这会结束程序而不进行清理。  
程序使用的内存随后需要由操作系统清理。如果您的项目中需要将生成的二进制文件尽可能小，可以通过在 Cargo.toml 文件中对应的部分添加 `panic = 'abort'`， Rust会从展开（unwinding）模式（即回溯清理）切换到在 panic 时中止（aborting）。例如，如果您想在发布模式下在恐慌时中止，可以添加如下内容：

```toml
[profile.release]
panic = 'abort'
```

**显示调用栈**

我们可以在运行时使用 `RUST_BACKTRACE=1` 环境变量来显示调用栈，需要注意的是必须启用调试符号，即使用 `cargo build` 或 `cargo run` 而不带 `--release` 标志.
:::

### 可恢复错误

Result 用于处理潜在的可恢复错误：

```rust
enum Result<T, E> {
    Ok(T),  // 成功
    Err(E), // 失败
}
```

举例：
```rust
use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");
}
```

`File::open` 将 `std::fs::File` 作为成功类型 `T`，将 `std::io::Error` 作为失败类型 `E`. 与 `Option` 相似，我们可以用 `match`、`is_some()` 等工具进行处理。

CS110L 有一个关于如何抉择使用 `Result` 还是 `Option` 的例子：

```rust
    pub fn from_fd(pid: usize, fd: usize) -> Option<OpenFile> {
        let fd_path = format!("/proc/{pid}/fd/{fd}");
        let name = OpenFile::path_to_name(fs::read_link(fd_path).ok()?.to_str()?);
        let fd_info_path = format!("/proc/{pid}/fdinfo/{fd}");
        let fd_info = fs::read_to_string(fd_info_path).ok()?;
        let cursor = OpenFile::parse_cursor(&fd_info[..])?;
        let access_mode = OpenFile::parse_access_mode(&fd_info[..])?;

        Some(OpenFile {
            name,
            cursor,
            access_mode,
        })
    }
```

> Note: whether this function returns Option or Result is a matter of style and context. Some people might argue that you should return Result, so that you have finer grained control over possible things that could go wrong, e.g. you might want to handle things differently if this fails because the process doesn't have a specified fd, vs if it fails because it failed to read a */proc* file. However, that significantly increases complexity of error handling. In our case, this does not need to be a super robust program and we don't need to do fine-grained error handling, so returning Option is a simple way to indicate that "hey, we weren't able to get the necessary information" without making a big deal of it.  
> —— CS110L

#### 匹配不同错误

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {e:?}"),
            },
            _ => {
                panic!("Problem opening the file: {error:?}");
            }
        },
    };
}
```

`File::open` 返回的值的类型是 `io::Error` ，这是一个由标准库提供的结构体。这个结构体有一个 `kind` 方法，我们可以调用它来获取一个 `io::ErrorKind` 值。枚举 `io::ErrorKind` 是由标准库提供的，它有表示 `io` 操作可能产生的不同错误类型的变体。我们想要使用的变体是 `ErrorKind::NotFound` ，它表示我们试图打开的文件还不存在。所以我们先匹配 `greeting_file_result` ，并在其内部匹配 `error.kind()` 。

内部对 `error.kind()` 的匹配会检查其值是否为 `ErrorKind::NotFound`，如果是，会用 `File::create` 创建文件，由于这个函数也有可能失败，因此我们再次匹配其结果，如果失败，显示错误信息并 panic.

#### `match` 的替代方案

`match` 表达式实用但原始，我们可以使用闭包来处理 `Result`，比 `match` 更简洁.

下面使用闭包和 `unwrap_or_else` 实现相同功能的代码：

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Problem creating the file: {error:?}");
            })
        } else {
            panic!("Problem opening the file: {error:?}");
        }
    });
    dbg!(greeting_file);
}
```

此外，我们还可以使用 `unwrap` 和 `expect` 来便捷地在错误时引起 panic，具体用法可以参考[文档](https://doc.rust-lang.org/std/result/enum.Result.html#method.expect).

#### 传播（Propagate）错误

当函数的实现调用可能失败的操作时，您可以选择将错误返回给调用代码，以便调用代码决定如何处理。这称为传播错误，并将更多控制权交给调用代码，因为调用代码中可能有更多信息或逻辑来决定如何处理错误，而您的代码上下文中可能没有这些信息。比如下面的代码，函数名阐述了是从文件中读取用户名，这表示可能会出现错误，于是我们合理的将错误传播到调用方：

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let username_file_result = File::open("hello.txt");

    let mut username_file = match username_file_result {
        Ok(file) => file,
        Err(e) => return Err(e),    // 将错误原样返回
    };

    let mut username = String::new();

    // read_to_string 接收一个 buf，从文件读取到的字符串会拼接到其后
    // 函数返回读取到的字符串的长度
    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),    // 将错误原样返回
    }
}
```

上面的代码非常格式化，于是我们可以使用 `?` 操作符简化这一过程:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}
```

:::note
`?` 运算符会通过标准库中的 `From` 特性中定义的 `from` 函数来将返回的错误类型转换为当前函数返回类型中定义的错误类型. 这在函数返回一个错误类型来表示函数可能失败的所有方式时非常有用.
:::

当然，实际上还有一个更短的方法来完成这一函数的功能：

```rust
use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

:::note
- `?` 还可以与 `Option<T>` 一起使用，成功则返回 `Some` 内的值，否则返回 `None`.
- `?` 无法自动转换 `Option` 与 `Result`. 想要完成转换，可以在 `Result` 上使用 `ok()`方法或在`Option` 上使用 `ok_or(v)` 方法（返回 `Err(v)`）.
- `?` 一般无法用于 `main` 函数，但可以添加一个返回类型，`main` 可以返回 `Result<(), E>`，这样就可以使用 `?` 了. 比如，我们可以返回 `Result<(), Box<dyn Error>>`，这个类型后面会提到.
    另外，`main` 函数可以返回任何实现了 `std::process::Termination` 特质的类型，该特质包含一个返回 `ExitCode` 的函数 `report` 。
:::

### To panic! or Not to panic! 🤣🤣🤣🤔

> 此部分可以当作拓展阅读，毕竟这篇文章是笔记性质的. 此部分[原文](https://rust-book.cs.brown.edu/ch09-03-to-panic-or-not-to-panic.html)

到[这里](to_panic_or_not_to_panic.html)阅读此部分内容.

#### 比编译器拥有更多信息的情况

当您有其他逻辑确保 Result 将具有 Ok 值，但该逻辑不是编译器能理解的情况，也适合调用 expect 。您仍然需要处理一个 Result 值：尽管在您特定的情境中逻辑上不可能失败，但您所调用的操作在一般情况下仍有可能失败。如果您能通过手动检查代码确保您永远不会遇到 Err 变体，那么调用 expect 并在参数文本中说明您认为永远不会遇到 Err 变体的原因，是完全可以接受的。以下是一个例子：

## 附录 A [21+ Rust Pro Tips](https://www.youtube.com/watch?v=53XYcpCgQWE)

1. 使用`dbg!`宏来进行快速调试，方便快速、获取定位行号和变量的内容;
2. 使用`todo!`宏来添加待办事项，这样编译运行时就会提示待办事项;
3. 使用泛型和宏来降低代码冗余性;
4. `main.rs`应当尽量简洁，方便测试;

## 附录 B Rust 风格指南

见 [Rust Style Guidelines](https://doc.rust-lang.org/1.0.0/style/README.html)
