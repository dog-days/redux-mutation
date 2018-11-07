# Redux-Mutation

[![build status](https://travis-ci.org/dog-days/redux-mutation.svg?branch=master)](https://travis-ci.org/dog-days/redux-mutation) [![codecov](https://codecov.io/gh/dog-days/redux-mutation/branch/master/graph/badge.svg)](https://codecov.io/gh/dog-days/redux-mutation) [![npm package](https://badge.fury.io/js/redux-mutation.svg)](https://www.npmjs.org/package/redux-mutation) [![NPM downloads](http://img.shields.io/npm/dm/redux-mutation.svg)](https://npmjs.org/package/redux-mutation)

> 你完全可以使用`redux-mutation`替换`redux`。

`redux-mutaion`是变异版的`redux`，基于[redux](https://redux.js.org/)，**保留`redux`所有原用法的基础上**，定义了新用法。`redux-mutation`同时支持`async`和`generator`用法，这个得益于`redux-center`。

`redux-mutation`是基于[redux-center](https://github.com/dog-days/redux-center)，有一个`center`概念，这个可以移步`redux-center`。

`redux-mutation` umd 包gip后只有3.8KB（包括redux-center，但不包括redux），所以不用担心会太大。

## 由来

目前`redux-mutation`默认用法跟`dva`的 model 是很像的，因为公司前端项目用了阿里[dva](https://github.com/dvajs/dva)的 model 形式，本人也觉得这种用法挺不错。所以`redux-mutation`对外的用法目前是`dva`的 model 用法。

`redux-mutation`默认用法相当于`dva`model 的抽离，本人也会向`dva`的 model 的用法进行兼容，然后`redux-mutation`是可以完全替换掉公司前端类库`redux-saga-model`（dva model 层的抽离）。

## 浏览器兼容性

兼容 IE9、edge、谷歌、火狐、safar 等浏览器，其中 IE 需要而外支持`promise`。

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

需要而外安装`redux >= 3.1.0`，测试是基于`redux@4.0.1`，最低兼容到`redux@3.1.0`版本，这个跟`applyMiddleware`有关。

```sh
npm i redux redux-mutation
```

### 使用例子

```js
import { createStore } from 'redux-mutation';

const mutationObjects = [
  {
    //state: 0,也可以
    initialState: 0,
    //namespace相当于reducer名
    namespace: 'counter',
    reducers: {
      increment(state, action) {
        return state + 1;
      },
      decrement(state, action) {
        return state - 1;
      },
    },
  },
  {
    //namespace相当于reducer名
    namespace: 'tester',
    //state: null,也可以
    initialState: null,
    centers: {
      async test(action, { put, call, select }) {
        console.log('center test');
        await put({ type: 'test2' });
        await put({ type: 'increment' }, 'counter');
        console.log(
          'counter after increment',
          await select(state => state.counter)
        );
        await put({ type: 'counter/decrement' });
        console.log(
          'counter after decrement',
          await select(state => state.counter)
        );
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log('fetchedData', data);
      },
      async test2(action, { put, call, select }) {
        console.log('center test2');
        await put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('center test3');
      },
    },
  },
];
const store = createStore(mutationObjects);
store.subscribe(function() {
  console.log('rendered', 'You can render dom here.');
});
store.dispatch({ type: 'tester/test' });
```

## 文档

- [API 文档](./API.md)

## 在浏览器中使用 umd 方式

有两种方式，第一种是使用 cdn，第二种就是直接在打包后的的`./dist`文件中获取。

### cdn 方式

- https://unpkg.com/redux-mutation/dist/redux-mutation.js
- https://unpkg.com/redux-mutation/dist/redux-mutation.min.js

window.ReduxMutation相当于：

```js
import * as ReduxMuation from 'redux-mutation';
```

### 构建方式

```sh
git clone https://github.com/dog-days/redux-mutation
cd redux-mutation
npm install
npm test
npm run build
```

然后在根目录下的`./dist`文件夹获取相关的 js 文件。

## 基于源文件运行例子

请看[这里](https://github.com/dog-days/redux-mutation/tree/master/examples)。