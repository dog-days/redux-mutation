# redux-mutation

> 你完全可以使用`redux-mutation`替换`redux`。

`redux-mutaion`是变异版的`redux`，同时保留所有原来属性和用法。`redux-mutation`同时支持`async`和`generator`用法，这个得益于`redux-center`。

`redux-mutation`是基于[redux-center](https://github.com/dog-days/redux-center)，有一个`center`概念，这个可以移步`redux-center`。

## 由来

目前`redux-mutation`默认用法跟`dva`的 model 是很像的，因为公司前端项目用了阿里[dva](https://github.com/dvajs/dva)的 model 形式，本人也觉得这种用法挺不错。所以`redux-mutation`默认对外的用法目前是`dva`的 model 用法，同时基于最基本的用法（后续会说明）也可以定制新用法。

`redux-mutation`默认用法相当于`dva`model 的抽离，本人也会向`dva`的 model 的用法进行兼容，然后`redux-mutation`是可以完全替换掉公司前端类库`redux-saga-model`（dva model 层的抽离）。

## 浏览器兼容性

兼容 IE9、edge、谷歌、火狐、safar 等浏览器，其中 IE 需要而外支持`promise`。

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

## 入门使用

### 安装

需要而外安装`redux`（更新此文档时，最新版本是 4.0.1）和`redux-center`。

```sh
npm i redux redux-center redux-mutation
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
