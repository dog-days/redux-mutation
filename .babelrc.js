const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 9'],
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: true,
      },
    ],
  ],
  plugins: [
    // don't use `loose` mode here - need to copy symbols when spreading
    '@babel/proposal-object-rest-spread',
    //test需要把import转换成commonjs require模式
    NODE_ENV === 'TEST' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};
