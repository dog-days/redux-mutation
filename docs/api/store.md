# Store

```js
const store = createStore(...args);
```

这里`store`只新增了一个方法 [replaceMutationObjects](/docs/api/store.md#replaceMutationObjects)，其他用法可以参考[redux store](https://redux.js.org/api/store)。

## Store 方法

### replaceMutationObjects(mutationObjects)

```js
replaceMutationObjects(mutationObjects);
```

跟`redux`的`replaceReducer`一样，`replaceMutationObjects`可以用来动态加载`mutationObject`，和热替换。

### 参数

1. `mutationObject` *(array | object)*:

   `mutationObject`定义，详细看[这里](../introduction/new-concepts.md#mutationobject)。

