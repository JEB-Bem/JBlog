---
filename: des-attack.md
date: 2026/04/18 13:11:23
title: 现代密码学实践 - DES 穷举攻击
tags:
- crypto
description: 现代密码学实践 —— DES 密钥穷举攻击与 DES Python 部分实现
---

欢迎来到现代密码学实践之 DES 穷举攻击！在本次实践中，你将会使用 Python 来实现一个简单的 DES 加密算法（Part 1）！同时，我们将会使用 Python 来尝试穷举一个密文的密钥并将其解密（Part 2）！

## Part 1

获取这次实践 Part 1 将会用到的所有初始代码.

如果你能够连接上 Github，那么你可以直接 Clone 作业仓库：

```bash
git clone https://github.com/JEB-Bem/DES-CBC.git
```

否则，你可以从这里下载：[下载 zip 压缩包](https://chrjeb.cn/repos/DES-Attack.zip).

我们推荐你从 Github 获取 starter code，因为压缩包的更新可能不够及时.

如果有同学发现作业中有不合理的设计或错误，欢迎在评论区指出，如果涉及到实现细节，可以通过 QQ 联系我. 大家有任何问题，如果不涉及到实现细节，也可以在评论区提问. 我看到后会回复.

理论原理的 PPT 在[此处](/presentations)，视频在 PPT 的最后一页. 如果你已经有 DES 基础知识，可以根据我们的提示尝试一步步完成实验.

### Milestone 0: 阅读项目起始代码

下面是你将拿到的项目结构：

```bash
.
├── credentials.txt     # 存放 key, iv
├── des.py              # 主要代码
├── pyproject.toml      # uv 项目配置文件
├── README.md
├── requirements.txt    # pip 安装依赖列表
├── tests.py            # 测试文件
└── uv.lock             # uv 依赖列表
```

你首先需要完成项目环境的配置，我们建议你使用 [uv](https://github.com/astral-sh/uv)，这是一个简单、新手友好的 Python 环境管理工具. 你也可以使用虚拟环境管理工具，比如 [venv](https://docs.python.org/3.14/library/venv.html)，或者直接将包安装在系统中（并不推荐）. 如果你已经选择并安装好虚拟环境管理工具，接下来就是同步我们实验所需要的包了.

:::spoi uv
```bash
uv sync
```

就是这么简单~
:::

:::spoi venv

假设你已经创建了一个名为 `.venv` 的虚拟环境.

**Windows**

```bash
> .venv\Scripts\Activate.ps1  # 激活虚拟环境
(.venv) > pip install -r requirements.txt
```

如果激活虚拟环境报错，请自行 [STFW](https://cn.bing.com/search?q=Powershell+activate+python+venv+error%3A+%3CYour+Error+Message%3E).

**UNIX**

```bash
$ source .venv/bin/activate
(.venv) $ pip install -r requirements.txt
```

:::
<br/>

你可以检查是否已经配置成功：

uv:

```bash
uv run python -m unittest -v
```

venv:

```bash
# 已经激活虚拟环境
(.venv) $ python -m unittest -v
# 未激活
.venv/bin/python -m unittest -v      # UNIX
.venv/Scripts/python -m unittest -v  # Windows
```

如果一切没问题，你将在输出的最后一行看到：

```bash
FAILED (failures=9)
```

这说明所有测试都没有通过，因为我们什么都还没有实现.

> 以后的命令都只会使用 `uv` 来举例，想必你已经能够理解 `uv` 和 `venv` 命令的差异了.

:::tip
许多 IDE 比如 Pycharm 都有手动为当前项目选择解释器的功能，同时还会自动检测当前项目使用的测试框架和所有测试，因此，本实验完全可以使用 IDE 来进行，此处不过多展开，有兴趣的同学可以自行探索.
:::

实验环境已经配置完成了. 在这个实验中，你只需要阅读并修改 `des.py` 和 `tests.py`，其中 `des.py` 是本实验的主要代码，你需要根据提示补全我们声明好的的函数、类等，也可以自行新增辅助用的函数、类等代码. `tests.py` 是我们的测试代码，我们已经为你准备了一部分基础的测试用例，你可以自行添加更全面的测试用例，或者为你自己新增的函数和类添加测试代码.

阅读 `des.py`，了解实验代码的主要框架，根据类 `DESCipher` 的文档注释，我们可以明白其基本用法，比如，我们可以将一个明文字符串 `12345678abcdefgh` 加密：

1. 设置一个 key，比如从 `/dev/random` 里拿一个：`38e2d6a90dc475e5`，这是一串形式为十六进制的**字符串**，转换成 `bytes` 后长度应为 64bits.

2. 设置一个 iv，同样随机选取一个，比如 `5a1a83bd1c2e46e3`，其长度要求和 key 是一致的.

3. 初始化一个 `DESCipher` 实例.

```py
>>> cipher = DESCipher(key_hex="38e2d6a90dc475e5", iv_hex="5a1a83bd1c2e46e3")
```

4. 加密明文.

```py
>>> cipher.encrypt("12345678abcdefgh").hex()
'730fa6c518a2329e2d9bd32facc1d33a6957d9f3609345ee'
```

完成所有实现后，你可以使用 [Cyberchef](https://gchq.github.io/CyberChef/#recipe=DES_Encrypt(%7B'option':'Hex','string':'38e2d6a90dc475e5'%7D,%7B'option':'Hex','string':'5a1a83bd1c2e46e3'%7D,'CBC','Raw','Hex')&input=MTIzNDU2NzhhYmNkZWZnaA) 来检查最终的加密结果.

----

现在我们正式开始实验.

----

### Milestone 1：初始化 DESCipher 类

在这个里程碑中，你需要在 `__init__` 方法中初始化 `key` 和 `iv`，同时，我们还需要主动 raise `key_hex` 和 `iv_hex` 非法的情况，这里我们只要求你在长度非法时 raise 一个 `ValueError`，你可以自行添加更多的错误情况，从而让使用 `DESCipher` 的开发者能够更清楚输入究竟出了什么差错，而不是简单的一句 “你的输入有问题” :(

:::spoi Hints
- 为了实现将 `str` 类型的十六进制字符串转换为 `bytes`，你可能需要使用 `bytes.fromhex()`，看看[文档](https://docs.python.org/zh-cn/3/library/stdtypes.html#bytes.fromhex)是个不错的选择.
:::

:::tip
在每个 milestone 中，你可以搜索 `Milestone X` 来搜索这个 milestone 所有需要实现的地方.
:::

当你完成这个里程碑后，你就可以运行相关测试了，在这个里程碑中，需要运行的测试有：

- `test_init_invalid_length`
- `test_init_invalid_hex`
- `test_init_valid`

通过 `uv run python -m unittest -vk test_init` 来运行这三个测试. 如果你的 python 版本低于 3.7，这条语句可能报错，你需要手动指定上面这三个测试.

### Milestone 2：实现置换辅助函数

接下来我们实现辅助函数 `_permute`，他被声明为

```py
def _permute(block: int, size: int, permutation: list) -> int
```

这个辅助函数用于实现基本的“置换”[^1]功能，当我们使用这个辅助函数时，需要提供一个置换表 `permutation`，比如，我们有一个原始序列(数)和置换表

[^1]: 为了方便行文，我们所说的“置换”可能不符合标准的数学定义，此处的置换指的是根据置换表选择原始序列中的某些元素（可重复）重新排列得到新的序列，且不要求使用原始序列中所有的元素.

```py
block = 0b1100, size = 4
permutation = [0, 1, 0, 3]
```

这表示依次选取原始序列**从左到右**的第 0, 1, 0, 3 位，然后得到新的序列（数）：`0b1110`.

我们已经给出了 `_permute` 的一个错误实现，你现在只需要修复它，然后运行测试：

```bash
uv run python -m unittest test_base_permute
```

### Milestone 3：实现轮密钥生成

![20260614-3326d8fcae05bcd8.png](./images/20260614-3326d8fcae05bcd8.png)

首先是 *[Permuted Choice 1 (PC-1)](https://en.wikipedia.org/wiki/DES_supplementary_material#Permuted_choice_1_(PC-1))* 的实现. PC-1 从原始的 64bits 密钥中选取 56bits，并划分为 28bits 的左、右两部分密钥.

我们只需要使用先前已经实现的 `_permute` 函数即可，即使用两个从原始的 64 bits 中选择 28bits 的置换表. 完成 `pc1_permute`，然后运行测试：

```py
uv run python -m unittest test_pc1_permute
```

如果测试不通过，你可能需要检查 `pc1_permute` 和 `_permute` 的实现有没有问题. 同时，你也可以补充更多的测试用例.

完成 `rotate` 函数，然后运行测试 `test_rotate`. 如果你不明白 `rotate` 的功能，为什么不去看看对应的测试是怎么写的呢？🤓

接下来完成 *[Permuted Choice 2 (PC-2)](https://en.wikipedia.org/wiki/DES_supplementary_material#Permuted_choice_2_(PC-2))*，PC-2 接收左右两部分密钥，然后从中选取 48bits 作为本轮的轮密钥输出，实现起来也很简单，我们只需要将两部分密钥拼接，然后传给 `_permute` 做置换就行了，`PC2` 置换表也已经作为类的变量提前定义好了.

运行测试 `test_pc2_permute`.

最后我们完成 `round_gene`，根据上面的示意图，我们可以轻松实现这个函数. 使用 `test_round_gene` 来测试它.

### Milestone 4: 实现 Feistel(F) 函数

![20260614-28e4e5113f4d7576.png](./images/20260614-28e4e5113f4d7576.png)

Feistel Function 的实现细节如上图所示，我们需要依次进行 E-box 置换，轮密钥异或，S-box 代换和 P-box 置换.

E-box 和 P-box 的使用和 PC-1/2 的使用相差不大，异或也非常简单，这个函数的核心部分在与 S-box，在功能上，S-box 是整个算法的非线性变换部分，保证了 DES 算法的破解难度，在实现上，也是我们这个实验的重点之一.

首先是 S-box 代换表的储存，其结果如下所示：

```py
S = [
    [14, 4, ...]    # S[0]
    [15, 1, ...]    # S[1]
    [10, 0, ...]    # S[2]
    ...
    [13, 2, ...]    # S[7]
]
```

$S\left[ x \right]$ 表示将输入的 `block` 按照每 6bits 划分为 8 个 `chunk` 之后，第 $x$ 个 chunk 的代换表. 一般来说，`S` 是一个三维数组 `S[8][4][16]`，但是，为了方便的储存我们的 S 表，同时也为了练习二维数组行优先的一维储存，~~以及个人口味原因~~，我们在这里将第 $2$、$3$ 维 `[4][16]` 压缩为 `[64]` 来存放，于是对于其中第 $x$ 个 `chunk = 0bABBBBA`，我们就可以通过访问 `S[x][0bAABBBB]` 来访问这个 `chunk` 的值最终代换的结果.

例如，对于第一个 `chunk = 0b101100`，我们就应该访问 `S[0][0b100110]`：

```py
>>> DESCipher.S[0][0b100110]
2
```

具体流程可以参考下图：

[![20260615-88a9f6d9d60749e4.png](./images/20260615-88a9f6d9d60749e4.png)](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&dark=auto#R%3Cmxfile%3E%3Cdiagram%20name%3D%22%E7%AC%AC%201%20%E9%A1%B5%22%20id%3D%22L4WY4QtZTpsPmyYll0te%22%3E7Zxtj5s4EIB%2FTaRupY2MednkY5LdbXV3VavmpOt9dMAJdAnOgbNJ%2BuvPbwQwkGRTyL6BqgYGY8z4mRljz9IzJ8vtpxit%2FC%2FEw2EPAm%2FbM297EDrDAfufC3ZSYFmmFCziwJMiIxNMg19YCYGSrgMPJ4WClJCQBqui0CVRhF1akKE4JptisTkJi3ddoQUuCaYuCsvSfwKP%2BkpqOMPsxGccLHx16wG8kSeWKC2sniTxkUc2OZF51zMnMSFU7i23Exxy3aV6kdfd15zdNyzGET3lApx8nY%2BHmEQ%2Ft%2Bs%2FhwvL3f344xra5WpUzQndpUqIyTryMK%2FH6JnjjR9QPF0hl5%2FdsF5nMp8uQ3U6ecDU9dWBj1x%2FHeNPvNCtxQQ%2Fg8VCVMuef%2Byu40d8H1AaRAt1wZxE9B4tg5DzMopdfi%2BXJqw9t2jNtIxjVWhK1rFogU8pZ2HEnxze81NJf0EIuwtaBUnfJUsmdhNW5H5eVfE4V7Fs%2B1Q9Obs0cPntgjCckJCwErch7%2BprD8UPH3rQvBdbD05ojKJEKvGKXSE1%2BIjCtdKgEuCY4m1Oy6qnPmGyxDTesSJ%2BjqW0czYZeCZQNKla4FAdK%2FMy1SVIYb%2FY15yRwXYUHE8ApQK3MicM8RXfpWjGReOEopgqmwa8v1nnoCDiqhad7ZIwRKskEKVlCT8Ivb%2FQjqxpWk96xLphi73PGHn7658HNWhz2GyOm10HnC2RY0VT6Nhu4Sb2CeA1g5EFShjBmyJGplnECDqgJY5gmaNDvNXB9Z170rFP4uAXZypU%2BOjAJZtgGaIIc2o00ZiIkCSviskDTi08iHwcBxw4SlaqRIjnVO3OCKWsh%2BVBrLQMKmH2YrL6G8ULnBbJO5KIRNxEViRg%2FPAntMfsH1P7BPTtns2eeMKOjeyY%2FePFYzohEWsxsyNeLUYJ3eDkrdtH%2B5bQOOnmiaTDWtLZpTRA4XemEBSJrsrH2aowrEZBKGOwjm3CVDcPxXjEDzwPR9V4Ps0EBMw4vnvEkumGGZwItwjBlMVa9vNlWgUGaIoM06oHQ1WW9cyTa0MhU1SEKPNDbGyVlGjbt%2FN8AK0OwDfvBJ2QqvvzlxvZFUz635q%2FVYzLBrM%2FxfYW%2FNdI61Bj51TetBVt34hRVbwvdUbVGVXRqGDbRmUWjMoZNGpU5sWNyumMqjOqY0ZlXjZSGcBo1KouH6puOqvqrOqYVVkXtqpDE5SvwqoGnVV1VnXMquwLW1W6GvVqrWrYWVVnVcesyrnsaxUEZqNWdfn3qnQRvTOrzqzqzermssEKms4rD1bGSYvhTGv0uLUUbUMRX2EEKAwWzD5uXRxJEni%2FBC4KR%2BrEklmQMM8sWQO8MHjFbeTirHFTBTOYaThn6kyhdaVaWNtALhUjXsw%2B8KVTJk1%2FruQvP2Mbct%2BwTbkDbftKpmnotrAVW61BtNA4sG%2BSaiQc1LRtJ7aatvXF1koLs6al%2BrONmib%2BEtsl1VduHNupad1GbE16O7MqzGsZOgMtQ6e1zIqKYN95pRO9klJQGu6rs72A2ARlKvPrSvNqTpVXG4fEfRBYN0OYowEGLwWYogl7pZTJQ8ThyBvxRMyMGg8l%2Fj6bMEdikZHSOO0lQcOeN9794C3tG7aVCv4VguHQTgW3W%2FUw8miXP%2FrGRsGsY0SyDthzQ9N8oWODDy0X5jBFtmIixiGiwWOx%2B3Jo2QfYUXf4xsfXvdoERMPSqkhEZ6irMgJLFekpaHpejlRMqZ6mxnQQvk64m8l7zeEMB8M8zkYfDIz3g7MFmsLZeV6cK7LPXmVe9zMm24LZaMy28%2BI2LMdtw9AC9zHX2VzkrkgF64aG5w0N06HeoAqZac8eD0Ty7jlDvXK6v5amDTWnAh3YbyvhHzpnBcR03nAe4q2KjONckHRDlCTC3GpD49vxMy8qspmW1b8xig5HD0onB7dyXaXXjrYDXMU67KVcmpyGPsuhnZTCPGJexBIp%2F2NTpP3zGREuhFIofliAYYV5efDxAy%2FARnR8Humjle1fneeHKrLktdBlaZELtBa5KhYGu8h1juuxx2w8M5IAgRkf2GQUQQctuYbkRJgsuS%2FREEGwSJCpIzRoC6G0Mee%2F2b2roFU9OC681b6ouGZoo%2BhSFacGtf1gK61IJ7LliGZ2q0rNuLr9INzOErGT9aoqiyAnbtDXaRO0hv7Hla3N0Jrw7SPUzITXU6GB9dBUX2C1TpmhRVRDm7raj9max8z83Yiq2HkH4TQ3szpgeissFJy1TFAdn4vWemjZymRb7ScKni2IG2aR3fQrGk8O4gD2hw7INutwvW3H9G7iraHXlzvYG056A7ulGK0PItsL0Sd9cOWi8xYiv%2B5VwfD7OW9pFbNUcLdlr8Bc%2FXwqBcwMYLB4KrOB%2Bv1%2BKS1oVqooTiXPn8RU%2Fze9rSbg3AzVDoA1DQNiCeTiuVUG9%2FqHVVbfLHCtTY9wPJ69hy%2Bqxoa7uEbsBY81T%2FE7Bv5siig7hvPUwsQVmmlKWU0rJr9To5ip%2BMyNmodkTpYDk81EAvje9FEKRQfJKZV6t2r6uqYr%2Fl0wGbAZR4Cnx7JgrWXJnquxcxb9rfISrj7x7ejpem0t4JoVf1X%2F1t49mpkMyi%2Fzp605uMx%2FNLjwE9eJqGIkBiCr7XFfmFtzaTBDuUyknodi6hNH8OlIssPsS5by7Tn7HKh59z8%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E#%7B%22pageId%22%3A%22L4WY4QtZTpsPmyYll0te%22%7D)

在这个里程碑，我们不提供测试，你需要自行编写冒烟测试，并尝试编写更多的可以覆盖边界情况的测试.

### Milestone 5: 实现分组加密

有了 *f* 函数，我们只需要根据流程图按步就班的完成 16 轮的加密即可，参照下面的流程图：

![20260615-ae4381c10c7f283c.png](./images/20260615-ae4381c10c7f283c.png)

接着运行测试:

```bash
uv run python -m unittest -vk test_encrypt_block
```

### Milestone 6: 实现 CBC 模式下的明文加密

要实现明文加密，我们需要分成以下几步：
1. 填充 padding，这里我们使用 [PKCS#7 Padding](https://en.wikipedia.org/wiki/Padding_(cryptography)#PKCS#5_and_PKCS#7). 请自行阅读并完善 `encrypt` 函数.
2. 使用初始 iv 或上一个密文块异或当前的明文块.
3. 拼接密文块，然后返回.

要测试我们的加密是否正确，我们这里使用 doc test，运行 `uv run des.py` 即可运行 doc tests.

### Milestone 7: 实现 CBC 模式下的密文解密

最后一个里程碑，是实现密文解密，由于 F Network 优美的性质，我们只需要反向使用F 网络即可解密一个 block，而无需改动 f 函数. 其中运用的性质就是某一个数异或其自身得到 0，某一个数异或 0 得到其自身.

这个里程碑我们同样没有提供测试，你可以使用 unittest 和 pycryptodome 来进行对拍测试.

### Milestone X: 实现 CTR 模式

在现有的封装和抽象下，某一个分组的加密和整个明文的加密实际上被很好的解耦了，实际上工作模式和具体的加密算法本来就是解耦的，因此，你可以尝试自己实现一个 CTR 模式的 DES 对称加密，我们没有提供函数的定义，也没提供测试，你可以自行设计对应的函数和测试.

## Part 2

这部分在录屏中没有提到. 简单讲下原理，由于使用原密钥空间过于巨大，穷举需要耗费大量时间，所以，我们可以直接在 Part1 的基础上通过缩短密钥长度来缩小密钥空间，这需要对应的修改一部分实现，甚至修改 S-box 的实现，我还没有完全实现这个部分（可能鸽了），有实现的同学欢迎和我交流😍😍😋.
