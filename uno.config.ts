import { defineConfig, presetAttributify, presetIcons, presetTypography, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
  ],
  rules: [
    // 自定义规则
  ],
  shortcuts: [
    // 自定义快捷方式
  ],
  theme: {
    // 自定义主题
  },
})
