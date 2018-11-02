# createStore

```
createStore(mutationObjects, [preloadedState], [enhancer])
```

> 创建一个 Redux [store](https://www.redux.org.cn/docs/api/Store.html) 来以存放应用中所有的 state。
>
> 应用中应有且仅有一个 store。

除了参数`mutationObjects`不一样，其他的参数跟`redux`的[createStore](https://redux.js.org/api/createstore)参数是一样的。

### 引入

```js
import { creactStore } form 'redux-mutation';
```

或者使用[configMutationStore](/docs/api/configCreateStore)获取`createStore`。

```js
import { configCreateStore } form 'redux-mutation';
const createStore = configCreateStore(...args);
```

### 参数

1. `mutationObjects` *(function | object | array)*：

   - `function`

     就是`reducer`，这种情况下完全跟`redux` `createStore`一样。

   - `object`

     会转为`[object]`数组，然后跟下面`array`情况一样了。

   - `array`

     详细看[这里](/docs/introduction/new-concepts.html#mutationObject)

2. [`preloadedState`] *(any)*：**跟`redux`的一样，没变化。**

   - `非function`

     初始时的 state。 在同构应用中，你可以决定是否把服务端传来的 state 水合（hydrate）后传给它，或者从之前保存的用户会话中恢复一个传给它。如果你使用 [`combineReducers`](https://www.redux.org.cn/docs/api/combineReducers.html)创建 `reducer`，它必须是一个普通对象，与传入的 keys 保持同样的结构。否则，你可以自由传入任何 `reducer` 可理解的内容。

   - `function`

     `preloadedState`为函数时，会转为第三参数`enhancer`，同时第三参数失效，继续传入第三参数会报错。

3. [`enhancer`] *(function)*：**跟`redux`的一样，没变化。**

   `store`增强器。您可以选择指定它来增强`store`的第三方功能，可以理解为中间件。`enhancer`需要配合`applyMiddleware`一起使用：

   ```js
   import reduxThunkMiddleware from 'redux-thunk';//中间件
   createStore(...arg,applyMiddleware(reduxThunkMiddleware))
   ```

   如何使用可以看[applymiddleware](https://redux.js.org/api/applymiddleware)。

### 返回值

返回一个 store 对象，详细请看[这里](/docs/api/store.md)。

### 例子

```js
import { createStore } from 'redux-mutation';

const mutationObjects = [
  {
    initialState: 0,
    namespace: 'counter',
    reducers: {
      increment(state, { payload }) {
        const { value } = payload;
        return state + value;
      },
      decrement(state, { payload }) {
        const { value } = payload;
        return state - value;
      },
    },
    centers: {
      async compute(action, { put, call, select }) {
        await put({
          type: 'increment',
          payload: {
            value: 1,
          },
        });
        await put(
          {
            type: 'decrement',
            payload: {
              value: 3,
            },
          },
        );
      },
    },
  },
];
const store = createStore(mutationObjects);
store.subscribe(function() {
  console.log('rendered', store.getState());
});
store.dispatch({ type: 'counter/compute' });
```
