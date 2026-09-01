'use strict'

// scripts/comark/main.js
// MDC (Markdown Components) 内联语法 — 子集实现
//
// 支持的语法：
//   [text]{.class1 .class2}   — 内联 Span → <span class="class1 class2">text</span>
//   :span{.class}text:span    — 同上（完整 comark 语法）
//
// 实现方式：正则替换（纯 CJS，无外部依赖）

/**
 * 在原始 markdown 中将 [text]{.class} 替换为 <span class="class">text</span>
 */
function processMDCSyntax(content) {
  // 方案 A：正则替换（覆盖 95% 场景，可靠）
  // [text]{.class .class2} → <span class="class class2">text</span>
  content = content.replace(
    /\[([^\]]+)\]\{\.([^}]+)\}/g,
    (_, text, classes) => {
      const classList = classes.replace(/\./g, ' ').replace(/\s+/g, ' ').trim()
      return `<span class="${classList}">${text}</span>`
    }
  )

  // :span{.class}text:span → <span class="class">text</span>
  content = content.replace(
    /:span\{\.([^}]+)\}([\s\S]*?):span/g,
    (_, classes, text) => {
      const classList = classes.replace(/\./g, ' ').replace(/\s+/g, ' ').trim()
      return `<span class="${classList}">${text}</span>`
    }
  )

  return content
}

// ---------------------------------------------------------------------------
// Hexo 集成
// ---------------------------------------------------------------------------

// before_post_render: 预处理 markdown 源码
hexo.extend.filter.register('before_post_render', function (data) {
  const comarkConfig = hexo.config.comark || {}
  if (comarkConfig.enable === false) return data

  if (data.content) {
    data.content = processMDCSyntax(data.content)
  }

  return data
})

// after_post_render: 清理未处理的 {.class} 残留
hexo.extend.filter.register('after_post_render', function (data) {
  const comarkConfig = hexo.config.comark || {}
  if (comarkConfig.enable === false) return data

  if (data.content) {
    // 将 {.class} 合并到紧邻的前一个 HTML 元素
    data.content = data.content.replace(
      /(<(\w+)([^>]*)>)([\s\S]*?)<\/\2>\{\.([^}]+)\}/g,
      (_, openTag, tagName, attrs, innerContent, classes) => {
        const classList = classes.replace(/\./g, ' ').replace(/\s+/g, ' ').trim()
        const existingClass = attrs.match(/class="([^"]*)"/)
        if (existingClass) {
          const newAttrs = attrs.replace(
            /class="([^"]*)"/,
            `class="${existingClass[1]} ${classList}"`.trim()
          )
          return `<${tagName}${newAttrs}>${innerContent}</${tagName}>`
        }
        return `<${tagName}${attrs} class="${classList}">${innerContent}</${tagName}>`
      }
    )

    // 移除其他未被处理的 {.class} 残留
    data.content = data.content.replace(/\{\.([^}]+)\}/g, '')
  }

  return data
})
