# API 文档

`redux-mutation` API完全继承redux，然后有新增API和小改动。

`[参数]`中括号代表可选。

### 顶层 API

- 有变化和新增的 API
  - [createStore(mutations, [preloadedState], [enhancer])](createStore.md)
  - [configCreateStore([plugins], [options])](configCreateStore.md)
  - [applyPlugin(...plugins)](applyPlugin.md)

- 无变化的 API
  - [combineReducers(reducers)](https://redux.js.org/api/combinereducers)
  - [applyMiddleware(...middlewares)](https://redux.js.org/api/applymiddleware)
  - [bindActionCreators(actionCreators, dispatch)](https://redux.js.org/api/bindactioncreators)
  - [compose(...functions)](https://redux.js.org/api/compose)

### Store API

- 有变化和新增的 API
  - [store.replaceMutations(mutations)](store.md#replaceMutations)

- 无变化的 API
  - [store.getState()](https://redux.js.org/api/store#getState)
  - [store.dispatch(action)](https://redux.js.org/api/store#dispatch)
  - [store.subscribe(listener)](https://redux.js.org/api/store#subscribe)
  - [store.replaceReducer(nextReducer)](https://redux.js.org/api/store#replaceReducer)

### Center API

