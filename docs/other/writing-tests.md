# 编写测试

`redux` 是很好测试，`redux-mutation` 当然也很好测试。

### 设置

我们建议用 [Jest](http://facebook.github.io/jest/) 作为测试引擎。注意因为是在 node 环境下运行，所以你不能访问 DOM。

如果你使用 [create-react-app](https://github.com/facebook/create-react-app) 创建的 `react app` 项目，`jest 一切就绪`，无需任何处理，遵循它用法就行。

```
npm install --save-dev jest
```

若想结合 [Babel](http://babeljs.io/) 使用（这里指的是Bable 7），你需要安装 `babel-jest` ：

```
npm babel-jest babel-core@^7.0.0-bridge.0 @babel/core -D
```

并且在 `.babelrc.js` 中使用 [@babel/preset-env](https://babeljs.io/docs/en/next/babel-preset-env.html) 启用 `ES6` 的功能 （针对webpack，webpack 本身支持 import，无需转换成commonjs）：

```js
const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        //test需要把import转换成commonjs require模式
        //webpack 支持 es import
        modules: NODE_ENV === 'TEST' ? 'commonjs' : false,
        loose: true,
      },
    ],
  ],
};
```

这里不多说 `preset-env` 的配置。

然后，在 `package.json` 的 `scripts` 里加入这一段：

```js
{
  ...
  "scripts": {
    ...
    "test": "cross-env NODE_ENV=TEST jest",
    "test:watch": "cross-env NODE_ENV=TEST npm test -- --watch"
  },
  "jest": {
    "testRegex": "(/test/.*\\.spec.js)$"
  },
  ...
}
```

请先安装 `cross-env`:

```sh
npm i cross-env -D
```

然后在`./test` 文件夹中新建 ` xxx.spec.js` 测试文件，编写测试代码。运行 `npm test` 就能单次运行了，或者也可以使用 `npm run test:watch` 在每次有文件改变时自动执行测试。

### 例子

