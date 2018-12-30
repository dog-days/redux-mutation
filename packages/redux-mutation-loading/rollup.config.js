import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

// babel需要再 commonjs plugin 之前配置
const commonjsPlugin = commonjs({
  include: /node_modules/,
});

function commonAndEsExternal(id) {
  const dependencies = Object.keys(pkg.dependencies || {});
  const peerDependencies = Object.keys(pkg.peerDependencies || {});
  const allDependencies = dependencies.concat(peerDependencies);
  return allDependencies.some(a => {
    return new RegExp(a).test(id);
  });
}

function createCommonConfigByInput(input, fileName, umdName) {
  return [
    // CommonJS
    {
      onwarn(warning, warn) {
        // 隐藏 bundle['default'] warning
        if (warning.code === 'MIXED_EXPORTS') return;
        // Use default for everything else
        warn(warning);
      },
      input,
      output: { file: `lib/${fileName}.js`, format: 'cjs', indent: false },
      external: commonAndEsExternal,
      plugins: [
        // babel需要再 commonjs plugin 之前配置
        babel({
          exclude: 'node_modules/**',
          runtimeHelpers: true,
          externalHelpers: true,
        }),
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
      external: commonAndEsExternal,
      plugins: [
        // babel需要再 commonjs plugin 之前配置
        babel({ exclude: 'node_modules/**', runtimeHelpers: true }),
        nodeResolve({
          jsnext: true,
        }),
        commonjsPlugin,
      ],
    },

    // UMD Development
    {
      onwarn(warning, warn) {
        // 隐藏 bundle['default'] warning
        if (warning.code === 'MIXED_EXPORTS') return;
        // Use default for everything else
        warn(warning);
      },
      input,
      output: {
        file: `dist/${fileName}.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        babel({ exclude: 'node_modules/**', runtimeHelpers: true }),
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
      onwarn(warning, warn) {
        // 隐藏 bundle['default'] warning
        if (warning.code === 'MIXED_EXPORTS') return;
        // Use default for everything else
        warn(warning);
      },
      input,
      output: {
        file: `dist/${fileName}.min.js`,
        format: 'umd',
        name: umdName,
        indent: false,
        sourcemap: true,
      },
      plugins: [
        babel({ exclude: 'node_modules/**', runtimeHelpers: true }),
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
  ...createCommonConfigByInput('src/index.js', 'index', 'ReduxMutationLoading'),
];
