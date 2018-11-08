# applyPlugin

```js
applyPlugin(...plugins)
```

`applyPlugin`是用来合并多个插件，有点类似`redux`的`applyMiddleware`。

### 引入

```js
import { applyPlugin } form 'redux-mutation';
```

### 参数

1. `...plugins` *(...object)*

   结构如下：

   ```js
   {
     extraCenters: {},
     extraReducers: {},
     reducerEnhancer: originalReducer => (state, action) => {
       return originalReducer(state, action);
     },
     centerEnhancer: (
       originalCenter,
       { put },
       currentMutationOjbect,
       actionType
     ) => (...args) => {
       return originalCenter(...args);
     },
   }
   ```

### 返回值

返回合并后的`plugin`配置。

```js
{
  extraCenters: {...},
  extraReducers: {...},
  reducerEnhancer: function(){},
  centerEnhancer: function(){},
}
```

### 例子

请看[插件使用](../advanced-usage/plugin.md)



