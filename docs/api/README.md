# API 文档

`redux-mutation` API完全继承redux，然后有新增API和小改动。

`[参数]`中括号代表可选。

### 顶层 API

**import**

```js
import {
  combineReducers,
  applyMiddleware,
  //new and changed api below
  compose,
  createStore,
  configCreateStore,
  applyPlugin,
  SEPARATOR,
} from 'redux-mutation';
```

**umd**

```js
const {
  combineReducers,
  applyMiddleware,
  //new and changed api below
  compose,
  createStore,
  configCreateStore,
  applyPlugin,
  SEPARATOR,
} = window.ReduxMutation;
```

- 有变化和新增的 API

  - [createStore(mutations, [preloadedState], [enhancer])](createStore.md)
  - [configCreateStore([plugins], [options])](configCreateStore.md)
  - [applyPlugin(...plugins)](applyPlugin.md)
  - [compose(...functions)](compose.md)
  - `SEPARATOR`，值等于 `/`。

- 无变化的 API
  - [combineReducers(reducers)](https://redux.js.org/api/combinereducers)
  - [applyMiddleware(...middlewares)](https://redux.js.org/api/applymiddleware)

- 不采用的 API

  如果要使用，请直接使用 `redux` 的。

  ```js
  import { bindActionCreators } from 'redux';
  ```

  - [bindActionCreators(actionCreators, dispatch)](https://redux.js.org/api/bindactioncreators)

### Store API

```js
const store = createStore(mutations);
//或者 const store = configCreateStore(...args)(mutations)
const {
  dispatch,
  getState,
  subscribe,
  replaceReducer,
  replaceMutations,
} = store;
```

- 有变化和新增的 API

  - [store.replaceMutations(mutations)](store.md#replacemutations-mutations)

- 无变化的 API
  - [store.getState()](https://redux.js.org/api/store#getState)

  - [store.dispatch(action)](https://redux.js.org/api/store#dispatch)

  - [store.subscribe(listener)](https://redux.js.org/api/store#subscribe)

  - [store.replaceReducer(nextReducer)](https://redux.js.org/api/store#replaceReducer)

    兼容` redux` `replaceReducer`，`reducer` 模式建议使用 `replaceMutations`。

### 其他 API

#### Center

[center(action,centerUtils)](other.md#center-action-centerutils)

#### CenterEnhancer

[centerEnhancer(originalCenter,centerUtils,currentMutation,actionType)](other.md#centerenhancer)

#### ReducerEnhancer

[reducerEnhancer(originalReducer)](other.md#reducerenhancer)