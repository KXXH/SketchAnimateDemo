import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,

  rules: {
    'no-unused-vars': 'off', // 关闭 ESLint 自带的 no-unused-vars
    '@typescript-eslint/no-unused-vars': 'off', // 关闭 @typescript-eslint 的 no-unused-vars
    'unused-imports/no-unused-imports': 'error', // 开启 unused-imports 插件的 no-unused-imports
    'unused-imports/no-unused-vars': [ // 开启 unused-imports 插件的 no-unused-vars
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
})
