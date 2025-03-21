import {defineConfig, globalIgnores} from 'eslint/config'
import github from 'eslint-plugin-github'

export default defineConfig([
  globalIgnores([
    '**/dist/',
    '**/lib/',
    '**/node_modules/',
    'eslint.config.mjs'
  ]),
  github.getFlatConfigs().internal,
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  {
    rules: {
      'i18n-text/no-en': 0
    }
  }
])
