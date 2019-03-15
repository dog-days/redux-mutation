# Redux-Mutation

[![build status](https://travis-ci.org/dog-days/redux-mutation.svg?branch=master)](https://travis-ci.org/dog-days/redux-mutation) [![codecov](https://codecov.io/gh/dog-days/redux-mutation/branch/master/graph/badge.svg)](https://codecov.io/gh/dog-days/redux-mutation) [![npm package](https://badge.fury.io/js/redux-mutation.svg)](https://www.npmjs.org/package/redux-mutation) [![NPM downloads](http://img.shields.io/npm/dm/redux-mutation.svg)](https://npmjs.org/package/redux-mutation) ![](https://img.shields.io/badge/minzipped%20size-4.5kb-brightgreen.svg)

> 如果你只是用了 Redux，然后想过度到 redux-mutation，你完全可以使用 redux-mutation 替换 redux。迁移特别简单，请看[迁移到 redux-mutation](./docs/other/migrating.md)文章。

`redux-mutaion`是变异版的`redux`，基于 [redux](https://redux.js.org/)，**保留 `redux` 所有原用法的基础上**，定义了新用法（dva model 用方法）。`redux-mutation` 同时支持 `async` 和 `generator` 用法，这个得益于 `redux-center`。

`redux-mutation` 是基于[redux-center](https://github.com/dog-days/redux-center)，有一个`center`概念，这个可以移步 `redux-center`。（如果你用过 dva ，你可以理解 centers 为 effects）。

`redux-mutation` umd 包 gip 后只有 4.5KB（包括 redux-center 和 redux），所以不用担心会太大。

## 由来

目前`redux-mutation`默认用法跟 `dva` 的 model 是很像的，因为公司前端项目用了阿里 [dva](https://github.com/dvajs/dva) 的 model 形式，本人也觉得这种用法挺不错。所以 `redux-mutation` 对外的用法目前是 `dva` 的 model 用法。

`redux-mutation` 默认用法相当于 `dva` model 的抽离，本人也会向 `dva` 的 model 的用法进行兼容（当然 redux-saga 用法兼容不了）。

## 浏览器兼容性

兼容 IE11、edge、谷歌、火狐、safar 等浏览器，其中 IE 需要而外支持`promise`。

### Npm Promise

首先安装 promise

```sh
npm i promise
```

然后添加下面代码

```js
if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}
```

### Umd Promise

```html
<script src="https://www.promisejs.org/polyfills/promise-6.1.0.min.js"></script>
```

## 入门使用

### 安装

需要而外安装`redux >= 3.1.0`，测试是基于 `redux@4.0.1`，最低兼容到 `redux@3.1.0` 版本，这个跟 `applyMiddleware` 有关。

```sh
npm i redux redux-mutation
```

### 使用例子

```js
import { createStore } from 'redux-mutation';

const mutations = [
  {
    // 别名 state，兼容 dva
    initialState: 0,
    namespace: 'counter',
    reducers: {
      increment(state, action) {
        return state + 1;
      },
      decrement(state, action) {
        return state - 1;
      },
    },
    // 别名 effects，兼容 dva
    centers: {
      async increment_async(action, { put, call, select }) {
        await put({ type: 'increment' }, 'counter');
      },
    },
  },
];
const store = createStore(mutations);
store.subscribe(function() {
  console.log('rendered', 'You can render dom here.');
});
store.dispatch({ type: 'tester/increment_async' });
```

## 文档

- [API 文档](./docs/api/README.md)

## 在浏览器中使用 umd 方式

### cdn 方式

- https://unpkg.com/redux-mutation/dist/redux-mutation.js
- https://unpkg.com/redux-mutation/dist/redux-mutation.min.js

`const { createStore } = window.ReduxMutation`相当于 es6 import:

```js
import { createStore } from 'redux-mutation';
```

### 构建方式

```sh
git clone https://github.com/dog-days/redux-mutation
cd redux-mutation
npm install
#npm test（安装完成后，postinstall 会触发）
#npm run build （生成例子可用代码，安装完成后，postinstall 会触发）
```

然后在根目录下的 `./dist` 文件夹获取相关的 js 文件。

## 基于源文件运行例子

请看[这里](https://github.com/dog-days/redux-mutation/tree/master/examples)。
