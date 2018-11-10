# Store

```js
const store = createStore(...args);
```

这里`store`只新增了一个方法 [replaceMutations](/docs/api/store.md#replaceMutations)，其他用法可以参考[redux store](https://redux.js.org/api/store)。

## Store 方法

### replaceMutations(mutations)

```js
replaceMutations(mutations);
```

跟`redux`的`replaceReducer`一样，`replaceMutations`可以用来动态加载`mutations`，和热替换。

### 参数

1. `mutations` *(array | object)*:

   `mutation`定义，详细看[这里](../introduction/new-concepts.md#mutationobject)。

