import { defineConfig, presetUno, presetAttributify } from 'unocss'
import extractorMdc from '@unocss/extractor-mdc'

export default defineConfig({
  extractors: [
    extractorMdc(),
  ],

  presets: [
    presetUno({ preflight: false }),
    presetAttributify(),
  ],

  // content.filesystem 用于 dev mode (hexo server) 时文件监听
  content: {
    filesystem: [
      'source/**/*.md',
      'themes/**/*.ejs',
    ],
  },
})
