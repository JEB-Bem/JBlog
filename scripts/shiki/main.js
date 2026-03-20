const patchedRenderers = new WeakSet()

let shikiPluginFactory = null
let shikiInitError = null

function disableHexoBacktickHighlighter() {
  const filters = hexo.extend.filter.list('before_post_render')
  const builtInBacktickFilter = filters.find((fn) => (
    fn.name === 'backtickCodeBlock'
    || fn.toString().includes('<hexoPostRenderCodeBlock>')
  ))

  if (!builtInBacktickFilter) return

  hexo.extend.filter.unregister('before_post_render', builtInBacktickFilter)
}

hexo.extend.filter.register('before_generate', async function () {
  disableHexoBacktickHighlighter()

  if (shikiPluginFactory || shikiInitError) return

  try {
    const {
      bundledLanguages,
      bundledThemes,
      createHighlighterCoreSync,
      createJavaScriptRegexEngine,
    } = require('shiki')
    const { fromHighlighter } = require('@shikijs/markdown-it')

    const [themes, langs] = await Promise.all([
      Promise.all([
        bundledThemes['catppuccin-latte'](),
        bundledThemes['catppuccin-mocha'](),
      ]),
      Promise.all([
        bundledLanguages.javascript(),
        bundledLanguages.typescript(),
        bundledLanguages.tsx(),
        bundledLanguages.jsx(),
        bundledLanguages.json(),
        bundledLanguages.bash(),
        bundledLanguages.sh(),
        bundledLanguages.shell(),
        bundledLanguages.shellscript(),
        bundledLanguages.zsh(),
        bundledLanguages.c(),
        bundledLanguages.cpp(),
        bundledLanguages.rust(),
        bundledLanguages.toml(),
        bundledLanguages.yaml(),
        bundledLanguages.markdown(),
        bundledLanguages.diff(),
        bundledLanguages.asm(),
        bundledLanguages.python(),
      ]),
    ])

    const highlighter = createHighlighterCoreSync({
      engine: createJavaScriptRegexEngine(),
      themes: themes.map((item) => item.default),
      langs: langs.map((item) => item.default),
    })

    shikiPluginFactory = fromHighlighter(highlighter, {
      themes: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha',
      },
      langAlias: {
        js: 'javascript',
        ts: 'typescript',
        yml: 'yaml',
        md: 'markdown',
      },
      defaultLanguage: 'text',
      fallbackLanguage: 'text',
    })
  } catch (error) {
    shikiInitError = error
    hexo.log.error('Failed to initialize Shiki for markdown-it rendering.')
    hexo.log.error(error)
  }
}, 0)

hexo.extend.filter.register('markdown-it:renderer', function (md) {
  if (!shikiPluginFactory) {
    if (shikiInitError) {
      hexo.log.warn('Shiki renderer skipped because initialization previously failed.')
    }
    return
  }

  if (patchedRenderers.has(md)) return

  shikiPluginFactory(md)
  patchedRenderers.add(md)
})
