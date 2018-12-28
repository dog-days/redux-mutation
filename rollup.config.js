import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

//babel需要再 commonjs plugin 之前配置
const commonjsPlugin = commonjs({
  include: /node_modules/,
});

function createCommonConfigByInput(input, fileName, umdName) {
  return [
    // CommonJS
    {
      input,
      output: { file: `lib/${fileName}.js`, format: 'cjs', indent: false },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins: [
        //babel需要再 commonjs plugin 之前配置
        babel({ exclude: 'node_modules/**' }),
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
      ],
    },

    // ES
    {
      input,
      output: { file: `es/${fileName}.js`, format: 'es', indent: false },
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins: [
        //babel需要再 commonjs plugin 之前配置
        babel({ exclude: 'node_modules/**' }),
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
      ],
    },

    // UMD Development
    {
      input,
      output: {
        file: `dist/${fileName}.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        babel({
          exclude: 'node_modules/**',
        }),
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
        replace({
          'process.env.NODE_ENV': JSON.stringify('development'),
        }),
      ],
    },

    // UMD Production
    {
      input,
      output: {
        file: `dist/${fileName}.min.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        babel({
          exclude: 'node_modules/**',
        }),
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        terser({
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
        }),
      ],
    },
  ];
}

export default [
  ...createCommonConfigByInput(
    'src/index.js',
    'redux-mutation',
    'ReduxMutation'
  ),
];
