# 新概念

`redux-mutation`比`redux`新增了两个概念，`redux`的核心概念看[这里](https://redux.js.org/introduction/coreconcepts)。

## center

类似于`redux-saga`的`effects`概念，`redux-mutation`有个`center`概念。`center`跟`redux`的`reducer`很像，详细请看[redux-center](https://github.com/dog-days/redux-center)。

`center`函数可以是`async`函数，如果使用`generator`需要使用`redux-center`的`generatorsToAsync`工具函数转换。

### 例子

`center`函数例子：

```js
async function centerExample(action,{ put }){
  put({type: 'target'});
  //无需return
}
```

## mutation

`mutation` 整合了 `reducers` 和 `centers`，是个核心概念，请看 [mutation API](../api/mutation.md)。

