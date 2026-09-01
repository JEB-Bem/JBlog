'use strict'

// scripts/unocss/main.js
// 开发模式（hexo server）：注入 UnoCSS Runtime CDN，浏览器端按需生成 CSS
// 生产模式（hexo generate）：标记就绪，由 postbuild-uno.mjs 处理静态 CSS 生成

hexo.extend.filter.register('after_render:html', function (html, data) {
  const unocssConfig = hexo.config.unocss || {}
  if (unocssConfig.enable === false) return html

  // 只处理 HTML 页面
  if (!data.path || !data.path.endsWith('.html')) return html

  // 通过环境变量或 hexo 运行模式判断是 server 还是 generate
  // hexo server 时 hexo.env.cmd === 'server'
  const isServer = hexo.env.cmd === 'server'

  if (isServer) {
    // 开发模式：注入 UnoCSS Runtime CDN（浏览器端按需生成 CSS）
    const runtimeScript = [
      '<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>',
      '<script>',
      'window.__unocss = {',
      '  presets: ["uno", "attributify"],',
      '};',
      '</script>',
    ].join('\n')

    if (html.includes('</head>')) {
      return html.replace('</head>', runtimeScript + '\n</head>')
    }
  } else {
    // 生产模式：标记 UnoCSS 就绪（postbuild-uno.mjs 会扫描 public/ 并处理）
    hexo._unocssReady = true
  }

  return html
})
