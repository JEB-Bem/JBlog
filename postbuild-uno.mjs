/**
 * postbuild-uno.mjs
 * Post-build 脚本：扫描 public/ 目录中的 HTML 文件，
 * 使用 UnoCSS 程序化 API 按需生成 CSS，并注入 <link> 标签到 HTML 中。
 */
import { createGenerator } from '@unocss/core'
import { presetUno, presetAttributify } from 'unocss'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'fs'
import { resolve, join, dirname, basename } from 'path'

const BASE_DIR = resolve(import.meta.dirname)
const PUBLIC_DIR = join(BASE_DIR, 'public')
const CSS_OUTPUT = 'css/uno.css'
const CSS_OUTPUT_PATH = join(PUBLIC_DIR, CSS_OUTPUT)

// 收集 public/ 下所有 HTML 文件
function collectHTMLFiles(dir) {
  const results = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      // 跳过某些目录
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      results.push(...collectHTMLFiles(fullPath))
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath)
    }
  }
  return results
}

// 使用 UnoCSS API 生成 CSS
async function generateUnoCSS(htmlFiles) {
  // 合并所有 HTML 内容
  let combined = ''
  for (const file of htmlFiles) {
    try {
      combined += readFileSync(file, 'utf8') + '\n'
    } catch (_) {}
  }

  if (!combined.trim()) {
    console.log('[UnoCSS] No HTML content found.')
    return ''
  }

  // 加载配置
  let config = {}
  try {
    const configPath = join(BASE_DIR, 'uno.config.ts')
    const { loadConfig } = await import('@unocss/config')
    const result = await loadConfig(process.cwd(), configPath)
    if (result.config) {
      config = result.config
      console.log('[UnoCSS] Loaded config from uno.config.ts')
    }
  } catch (err) {
    console.warn('[UnoCSS] Failed to load config, using defaults:', err.message)
    config = {
      presets: [presetUno(), presetAttributify()],
      preflights: [],
    }
  }

  // 确保 presets 有效
  if (!config.presets || config.presets.length === 0) {
    config.presets = [presetUno(), presetAttributify()]
  }

  const generator = await createGenerator(config)

  // 提取 token 并生成 CSS
  const tokens = new Set()
  try {
    const extracted = await generator.applyExtractors(combined)
    if (extracted) {
      extracted.forEach(t => tokens.add(t))
    }
  } catch (err) {
    console.warn('[UnoCSS] Extraction warning:', err.message)
  }

  console.log(`[UnoCSS] Extracted ${tokens.size} unique utility classes.`)

  if (tokens.size === 0) {
    console.log('[UnoCSS] No utility classes found in HTML.')
    return ''
  }

  const { css } = await generator.generate(new Set(tokens), { minify: true })
  return css
}

// 将 <link> 标签注入到所有 HTML 文件中
function injectCSSLink(htmlFiles) {
  const linkTag = `<link rel="stylesheet" href="/${CSS_OUTPUT}" />`

  let injectedCount = 0
  for (const file of htmlFiles) {
    try {
      let html = readFileSync(file, 'utf8')
      if (html.includes(linkTag.trim())) continue // 已注入

      if (html.includes('</head>')) {
        html = html.replace('</head>', linkTag + '\n</head>')
      } else if (html.includes('<body')) {
        html = html.replace('<body', linkTag + '\n<body')
      } else {
        html = linkTag + '\n' + html
      }
      writeFileSync(file, html, 'utf8')
      injectedCount++
    } catch (err) {
      console.error(`[UnoCSS] Failed to inject into ${file}:`, err.message)
    }
  }

  return injectedCount
}

// Main
console.log('[UnoCSS] Post-build starting...')

const htmlFiles = collectHTMLFiles(PUBLIC_DIR)
console.log(`[UnoCSS] Found ${htmlFiles.length} HTML files.`)

if (htmlFiles.length === 0) {
  console.log('[UnoCSS] No HTML files, exiting.')
  process.exit(0)
}

const css = await generateUnoCSS(htmlFiles)

if (css && css.trim().length > 0) {
  // 确保输出目录存在
  const outputDir = dirname(CSS_OUTPUT_PATH)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(CSS_OUTPUT_PATH, css, 'utf8')
  const cssSize = (Buffer.byteLength(css, 'utf8') / 1024).toFixed(1)
  console.log(`[UnoCSS] Generated ${CSS_OUTPUT} (${cssSize} KB).`)

  const injectedCount = injectCSSLink(htmlFiles)
  console.log(`[UnoCSS] Injected stylesheet link into ${injectedCount} HTML files.`)
} else {
  console.log('[UnoCSS] No CSS generated. Try adding UnoCSS utility classes to your content.')
}

console.log('[UnoCSS] Post-build complete.')
