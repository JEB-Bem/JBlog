# OJ 提交结果查询 API

本文档定义博客文章中的 `.oj-box` 组件所调用的后端接口。

后端只需要返回 **HTML 片段**，不需要返回 CSS；卡片、列表、状态颜色等样式由博客主题 `themes/oranges/source/css/oj-box.css` 统一提供。

## 1. 前端行为

- 默认请求地址：`GET /api/oj/submission`
- 可以在文章中通过 `data-api` 覆盖：

  ```html
  <div class="oj-box" data-api="https://oj.example.com/api/submission">Lab1 - DataLab</div>
  ```

- 前端会发送 `Accept: application/json`。
- 用户输入 Token 和 Student ID 后，前端会防抖 400ms 再发起请求。
- 接口需要 **同步返回最终结果**；前端当前没有轮询或异步任务查询逻辑。
- `?mock=1` 是纯前端预览，不会请求后端。

## 2. 请求

### 2.1 方法和地址

```http
GET /api/oj/submission?student_id=2026000000&access_token=xxxxx HTTP/1.1
Accept: application/json
```

### 2.2 查询参数

| 参数 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `student_id` | 是 | string | 学号 |
| `access_token` | 是 | string | OJ Token |

客户端会对参数做 URL 编码。后端需要校验两个参数都存在且非空。

## 3. 成功响应

### 3.1 状态码和响应头

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
```

### 3.2 响应体

```json
{
  "score": "<span class=\"oj-orange\">Partial</span> · 20/20 pts · 2/4 passed",
  "best_score": 20,
  "content": "<ol><li><div class=\"test-name\">test_basic</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 10 pts · 50 ms</div></li><li><div class=\"test-name\">test_single</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 10 pts · 32 ms</div></li><li><div class=\"test-name\">test_large</div><div class=\"test-meta\"><span class=\"oj-orange\">Wrong Answer</span> · 0 pts · 1203 ms</div><div class=\"test-detail\">expected 42<br>got 0</div></li><li><div class=\"test-name\">test_max</div><div class=\"test-meta\"><span class=\"oj-orange\">Time Limit</span> · 0 pts · 2000 ms</div><div class=\"test-detail\">limit 2000 ms</div></li></ol>"
}
```

### 3.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `score` | string / number | 是 | 顶部总分摘要。推荐返回 HTML 字符串 |
| `best_score` | number | 否 | 历史最高分，前端显示为 `Best <value>pts` |
| `content` | string | 是 | 包含 `<ol>` 的 HTML 字符串 |

- `score` 会直接插入页面顶部，适合返回类似 `Partial · 70/70 pts · 5/7 passed` 的摘要。
- `best_score` 会显示为 `Best 70pts`；为空或省略时不显示。
- `content` 会直接插入结果区域，列表结构由后端自己生成。
- 测试数量、顺序、分数、耗时都由后端计算，前端不做任何计算。
- `best_score` 也兼容 `bestScore`、`highest_score`、`highestScore` 字段名。

## 4. 推荐的 HTML 结构

### 4.1 总分摘要

```html
<span class="oj-orange">Partial</span> · 70/70 pts · 5/7 passed
```

如果全部通过：

```html
<span class="oj-green">Accepted</span> · 70/70 pts · 7/7 passed
```

历史最高分只返回数字，前端显示为 `Best 70pts`：

```text
70
```

### 4.2 列表结构

`content` 返回一个包含 `<ol>` 的 HTML 字符串，列表项由后端自己生成：

```html
<ol>
  <li>
    <div class="test-name">test_basic</div>
    <div class="test-meta">
      <span class="oj-green">Accepted</span> · 10 pts · 50 ms
    </div>
  </li>
  <li>
    <div class="test-name">test_large</div>
    <div class="test-meta">
      <span class="oj-orange">Wrong Answer</span> · 0 pts · 1203 ms
    </div>
    <div class="test-detail">expected 42<br>got 0</div>
  </li>
  <li>
    <div class="test-name">test_max</div>
    <div class="test-meta">
      <span class="oj-orange">Time Limit</span> · 0 pts · 2000 ms
    </div>
    <div class="test-detail">limit 2000 ms</div>
  </li>
</ol>
```

前端会为 `.oj-tests > ol` 和其中的 `<li>` 应用列表样式，后端不需要写 CSS。

### 4.3 颜色类名

只提供两个颜色类名，后端根据状态自行选择：

| 类名 | 颜色 |
| --- | --- |
| `oj-green` | 绿色 |
| `oj-orange` | 橙色 |

不再区分 `oj-accepted`、`oj-partial`、`oj-wrong`、`oj-time-limit` 等语义状态类。

### 4.4 HTML 限制

- 只返回 HTML 片段，不要返回 `<html>`、`<head>`、`<body>`。
- 不要返回 `<style>` 或 `<script>`。
- 不要依赖外部 CSS 或 JavaScript。
- 可以使用 `<ol>`、`<li>`、`<div>`、`<span>`、`<code>`、`<br>`、`<strong>` 等常规标签。
- 列表结构必须由后端放在 `content` 字符串中。
- 测试名称、错误信息、期望值等动态内容必须由后端做 HTML 转义，避免 XSS。

## 5. 空结果

如果该学生没有提交记录，推荐返回：

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": "未找到提交记录"
}
```

前端会显示：

```text
查询失败：未找到提交记录
```

也允许返回 `200` 和空结果：

```json
{
  "score": "",
  "content": ""
}
```

前端会显示“没有返回评测结果。”。

## 6. 错误响应

所有错误响应都应该返回 JSON：

```json
{
  "error": "Invalid token"
}
```

| 状态码 | 场景 |
| --- | --- |
| `400` | 缺少 `student_id` 或 `access_token` |
| `401` | Token 无效或已过期 |
| `403` | Token 与学号不匹配 |
| `404` | 没有找到提交记录 |
| `429` | 请求过于频繁 |
| `500` | 后端内部错误 |

前端会优先显示 JSON 中的 `error` 字段；如果错误响应不是 JSON，则显示 `HTTP <status>`。

## 7. CORS

如果接口和博客同源（例如都部署在 `https://chrjeb.cn`），不需要额外配置 CORS。

如果通过 `data-api` 请求其他域名，需要返回：

```http
Access-Control-Allow-Origin: https://chrjeb.cn
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Accept
Vary: Origin
```

当前前端只发送 `Accept` 请求头，属于简单请求，通常不会触发预检。如果后端未来要求 `Authorization` 等自定义请求头，需要同时支持 `OPTIONS` 预检。

## 8. 安全建议

- 只通过 HTTPS 提供接口。
- Token 目前通过查询参数传递，注意不要把它完整写入访问日志。
- Token 应该设置有效期，并绑定到学号。
- 对 `student_id` 和 `access_token` 做限流，避免暴力枚举。
- 只返回当前 Token 对应学生的数据。
- 所有拼接到 HTML 中的动态内容都必须转义。
- 返回 `Cache-Control: no-store`，避免代理缓存个人评测结果。

## 9. 最小实现检查清单

- [ ] 提供 `GET /api/oj/submission`
- [ ] 接收 `student_id` 和 `access_token`
- [ ] 返回 `application/json; charset=utf-8`
- [ ] `score` 返回 HTML 摘要
- [ ] 可选返回 `best_score` 历史最高分
- [ ] `content` 返回包含 `<ol>` 的 HTML 字符串
- [ ] 错误返回 `{ "error": "..." }`
- [ ] 同步返回最终评测结果
- [ ] 不返回 CSS、`<style>` 或 `<script>`
- [ ] 同源部署，或正确配置 CORS
- [ ] 设置 `Cache-Control: no-store`

## 10. 完整请求示例

```bash
curl -s 'https://chrjeb.cn/api/oj/submission?student_id=2026000000&access_token=test-token'
```

```json
{
  "score": "<span class=\"oj-orange\">Partial</span> · 70/70 pts · 5/7 passed",
  "best_score": 70,
  "content": "<ol><li><div class=\"test-name\">test_basic</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 10 pts · 50 ms</div></li><li><div class=\"test-name\">test_single</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 10 pts · 32 ms</div></li><li><div class=\"test-name\">test_wall</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 15 pts · 78 ms</div></li><li><div class=\"test-name\">test_dead_end</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 15 pts · 61 ms</div></li><li><div class=\"test-name\">test_cycle</div><div class=\"test-meta\"><span class=\"oj-green\">Accepted</span> · 20 pts · 94 ms</div></li><li><div class=\"test-name\">test_large</div><div class=\"test-meta\"><span class=\"oj-orange\">Wrong Answer</span> · 0 pts · 1203 ms</div><div class=\"test-detail\">expected 42<br>got 0</div></li><li><div class=\"test-name\">test_max</div><div class=\"test-meta\"><span class=\"oj-orange\">Time Limit</span> · 0 pts · 2000 ms</div><div class=\"test-detail\">limit 2000 ms</div></li></ol>"
}
```
