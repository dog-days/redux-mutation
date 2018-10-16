# redux-mutation

> 你完全可以使用`redux-mutation`替换`redux`。

`redux-mutaion`是变异版的`redux`，同时保留所有原来属性和用法。`redux-mutation`同时支持`async`和`generator`用法，这个得益于`redux-center`。

## redux-mutaion由来

`redux-mutation`可以简单理解为`redux-thunk`的升级版，跟`redux-saga`类似，没`redux-saga`那么复杂。

`redux-mutation`是基于[redux-center](https://github.com/dog-days/redux-center)，有一个`center`概念，这个可以移步`redux-center`。

目前`redux-center`默认用法跟`dva`的model是很像的，因为公司前端项目用了阿里[dva](https://github.com/dvajs/dva)的model形式，本人也认同这种用法。所以默认对外的用法目前是`dva`的model用法，同时基于最基本的用法（后续会说明）也可以定制新用法。

`redux-mutation`默认用法相当于`dva`model的抽离，本人也会向`dva`的model的用法进行兼容，然后`redux-mutation`是可以完全替换掉公司前端类库`redux-saga-model`（dva model层的抽离）。

## 安装

需要而外安装`redux`（更新此文档时，最新版本是4.0.1）和`redux-center`。

```sh
npm i redux redux-center redux-mutation
```

## 使用

首先几种，`redux-mutation`完全兼容`redux`用法。

### 无缝替换redux

```js
//import { createStore,combineReduers,applyMiddleware } from 'redux'
import { createStore,combineReduers,applyMiddleware } from 'redux-mutation'
import thunk from 'redux-thunk'

function counter(state = 0, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1
  case 'DECREMENT':
    return state - 1
  default:
    return state
  }
}

let store = createStore(combineReducers({counter}),applyMiddleware(thunk))
store.subscribe(() =>
  console.log(store.getState())
)

store.dispatch({ type: 'INCREMENT' })
// {counter: 1}
store.dispatch({ type: 'INCREMENT' })
// {counter: 2}
store.dispatch({ type: 'DECREMENT' })
// {counter: 1}
```

### 默认的dva model用法

如果你用个dva，那么这个用法也很简单，其实就相当于把`reducers`替换为了`mutationObjects`，然后其他用法跟`redux`完全保持一致，详细说明请看下面API。

这里的`mutationObjects.centers`相当于dva的是`effects`。

```js
import { createStore, compose, applyMiddleware } from 'redux-mutation';

const mutationObjects = [
  function() {
    //可以使用函数返回对象，多一层作用域保护变量
    return {
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
    };
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
      *test2(action, { put, call, select }) {
        console.log('center test2');
        yield put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('center test3');
      },
    },
  },
];

const testMiddleware = ({ dispatch, getState }) => next => action => {
  console.log('I am testMiddleware.');
  return next(action);
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  mutationObjects,
  composeEnhancers(applyMiddleware(testMiddleware))
);
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    console.log('rendered', 'You can render dom here.');
  }, 200);
});
store.dispatch({ type: 'tester/test' });
```

### 自定义用法

`convert-mutation-objects.js`自定义了`dva model`的用法，然后转换成最基本的用用法（后续会说明）。

```js
import { createStore, compose, applyMiddleware } from 'redux-mutation/lib/basic';
import convertMutationObjects from 'redux-mutation/lib/convert-mutation-objects';
import combineCenters from 'redux-center/lib/combine-centers';

const mutationObjects = [
  function() {
    return {
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
    };
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
      *test2(action, { put, call, select }) {
        console.log('center test2');
        yield put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('center test3');
      },
    },
  },
];

const testMiddleware = ({ dispatch, getState }) => next => action => {
  console.log('I am testMiddleware.');
  return next(action);
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reducerAndCenters = convertMutationObjects(
  mutationObjects,
  combineCenters
);
const store = createStore(
  reducerAndCenters,
  composeEnhancers(applyMiddleware(testMiddleware))
);
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    console.log('rendered', 'You can render dom here.');
  }, 200);
});
store.dispatch({ type: 'tester/test' });
```

## API

绝大部分的接口用法请参考[redux](https://github.com/reduxjs/redux)，这里列出新增和改动的功能。

### 默认入口文件lib/index.js

```js
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  combineCenters,
  convertMutationObjects,
};
```

这里只有createStrore的参数有变动，同时新增了`combineCenters`、`convertMutationObjects`。

#### createStore

```js
//redux
function createStore(reducer, [preloadedState], [enhancer]) 
//redux-mutation
function createStore(mutationObjects, [preloadedState], [enhancer]) 
```

##### 参数改动

这里改变的地方是参数`reducer`，`mutationObjects`兼容redux的reducer。`mutationObjects`结构如下

```js
[
  {
    namespace: 'test',//必填
    //initialState的别名state
    //state: null,也可以
    initialState: null,//必填
    reducers: {
      //action.type === "test/clear"会执行这个clear函数
      clear(state,action){
        return state;
      }
    },
    centers: {
      //action.type === "test/dataAdapter"会执行这个dataAdapter函数
      async dataAdapter(state,{put, call, select, dispatch, getState}){
        await put({type: ''});
      }
    }
  }
]
```

`reducers`和`centers`的函数执行规则如下：

action.type =`${namespace}${SEPERATOR}${centerFunctionName}`，其中`SEPERATOR`默认为`/`，例如：

```js
//伪代码
{
  namespace: 'test',//必填
  initialState: null,
  reducers: {
		display(state,action){}
  },
  centers: {
    async data(state,{put, call, select, dispatch, getState}){
      //默认没有${SEPERATOR},就是在当前mutationObject中查找。
      //就会运行上面的reducers display函数
      await put({type: 'display'});
      //相当于await put({type: 'display'},'test');
      //相当于await put({type: 'test/display'});
    }
  },
}
dispatch({type: "test/data"}) //就会运行上面的centers data函数
```

##### 返回改动

新增`replaceMutationObjects`，继承`lib/basic.js`的返回store。

```js
store.replaceMutationObjects(mutationObjects);
```

#### combineCenters

`combineCenters`请看`redux-center`。

#### convertMutationObjects

文件位于`lib/convert-mutation-Objects`。

```js
/**
 * 转换多个mutationObject结构
 * namespace其实就是reducer名
 * @param {...function | ...object} mutationObjects
 *  [
 *    function(){
 *      return {
 *        namespace: 'test',
 *        //alias as state
 *        //state : {},
 *        initailState: {},
 *        reducers: {}
 *        centers: {}
 *      }
 *    },
 *    function(){
 *      return {
 *        namespace: 'test2',
 *        //alias as state
 *        //state : {},
 *        initailState: {},
 *        reducers: {}
 *        centers: {}
 *      }
 *    },
 *  ]
 *  或者
 *  [
 *    {
 *      namespace: 'test',
 *      //alias as state
 *      //state : {},
 *      initailState: {},
 *      reduers: {},
 *      centers: {},
 *    },
 *    {
 *      namespace: 'test2',
 *      state: {},
 *      reduers: {},
 *      centers: {},
 *    }
 *  ]
 * @param {function} combineCenters 请参考redux-center的combineCenters
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    centers: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
export default function convertMutationsObjects(
  mutationObjects,
  combineCenters
) {}
```

### 基础用法lib/basic.js

一般直接使用入口文件的接口即可，触发要自定义，例如你只用`async`，并不想使用`generator`，为了减少`generator`的代码可以使用基础用法。

```js
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes
};
```

这里只有createStrore的参数有变动。

#### createStore

```js
//redux
function createStore(reducer, [preloadedState], [enhancer]) 
//redux-mutation
function createStore(reducerAndCenters, [preloadedState], [enhancer]) 
```

##### 参数改动

这里改变的地方是`reducer`，`reducerAndCenters`兼容redux的reducer。`reducerAndCenters`结构如下

```js
{
  //跟redux的reducer完全一样，只是把这个放入了对象中。
  reducer: function(state,action){}
  //用法跟redux-center的centers一样，具体请看redux-center。
  centers: [
    function(action,{put,call,select,dispatch,getState}){},
    function(action,{put,call,select,dispatch,getState}){},
  ]
}
```

这是最基础的用法，reducer就是跟redux的用法一样，centers用法跟center的用法一样
`redux-mutation`默认用法就需要把`dva model`用法适配成这种用法。

##### 返回改动

新增`replaceReducerAndCenters`

```js
store.replaceReducerAndCenters(reducerAndCenters);
```



















