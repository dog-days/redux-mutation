const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 9'],
        },
        // test需要把import转换成commonjs require模式
        // rollup 支持 es import
        modules: NODE_ENV === 'TEST' ? 'commonjs' : false,
        loose: true,
      },
    ],
  ],
  plugins: [
    // 需要配套安装 @babel/runtime（dependencies，非 devDependencies）
    // 其中 helper 功能可以减少转换生成的代码（通过引用 @babel/runtime）
    '@babel/plugin-transform-runtime',
  ],
};
