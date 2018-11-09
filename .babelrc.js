const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 9'],
        },
        //不转换async 和 generator，不过项目没用到，为了减少转换后的代码量，也可以使用这两个特性
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        //test需要把import转换成commonjs require模式
        //rollup 支持 es import
        modules: NODE_ENV === 'TEST' ? 'commonjs' : false,
        loose: true,
      },
    ],
  ],
};
