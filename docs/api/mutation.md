# mutation

```js
const mutation = {
  namespace: 'test2',
  initialState: {},
  reduers: {
    reducerConditionOne: (state, action) => state,
  },
  centers: {
    centerConditionOne: (action, centerUtils) => {},
  },
};
```

或者

```js
const mutation = {
  namespace: 'test2',
  initialState: {},
  reduers: (state, action) => ({
    reducerConditionOne: () => state,
  }),
  centers: (action, centerUtils) => ({
    centerConditionOne: () => {},
  }),
};
```

## 结构定义

| 字段         | 类型                   | 必填 |
| ------------ | ---------------------- | ---- |
| namespace    | string                 | 是   |
| initailState | any (except undefined) | 是   |
| reducers     | object \| function     | 否   |
| centers      | object \| function     | 否   |

### namepace

`mutation` 的命名空间，只能用字符串。同时也是 `store` `getState` 返回的 state 上的属性，即 `combineReducers` 参数的 `reducer` 名。

```js
const mutations = [
  {
    namespace: 'counter',
    initialState: null,
    reducers: {
      test: state => state,
    },
  },
];
//combineReducer({
  //counter: state => state,
//});
```

### initialState

当前 `mutation` 的 `reducers` 第一个参数 `state`  的初始值，优先级低于 `createStore` 的参数 `preloadState`。

别名为 `state`，兼容 `dva`。

### reducers

`reducers` 支持两种类型写法。`reducers` 最终会合成一个`reducer`，`reducers` 中的各项 `reducer`，相当于 `switch ` 的一个条件。

- `object` 方式

  这种方式跟 `dva` 的 `model `一样。

  ```js
  const mutation = {
    namespace: 'counter',
    initialState: { value: 0 },
    reducers: {
      increment: state => {
        const { value } = state;
        return {
          ...state,
          value: value + 1,
        };
      },
      decrement: state => {
        const { value } = state;
        return {
          ...state,
          value: value - 1,
        };
      },
    },
  };
  ```

  上面的 `reducers` 最终会转换成下面的等同效果的 `reducer`：

  ```js
  function coutner(state = { value: 0 }, action) {
    const { value } = state;
    switch (action.type) {
      case 'counter/increment':
        return { ...state, value: value + 1 };
      case 'counter/decrement':
        return { ...state, value: value - 1 };
        return;
      default:
        state;
    }
  }
  ```

- `function` 方式

  `function` 方式的优点在于，提取了公共参数 `state` 和 `action`。

  ```js
  const mutation = {
    namespace: 'counter',
    initialState: { value: 0 },
    reducers: (state, action) => ({
      increment: () => {
        const { value } = state;
        return {
          ...state,
          value: value + 1,
        };
      },
      decrement: () => {
        const { value } = state;
        return {
          ...state,
          value: value - 1,
        };
      },
    }),
  };
  ```

  **函数模式的 reducers 请严格遵循下面的规则，只返回 reducers对象，不可以中途做任何操作，否则可能会报错**，如下面的是强烈不建议的，因为每次 `dispatch` 都会触发所有 `reducers`。

  ```js
  const mutation = {
    namespace: 'counter',
    initialState: { value: 0 },
    reducers: (state, action) => {
      //不可以在这里做赋值或者其他操作
      const { value } = state;
      return {
        increment: () => {
          return {
            ...state,
            value: value + 1,
          };
        },
        decrement: () => {
          return {
            ...state,
            value: value - 1,
          };
        },
      };
    },
  };
  ```

### centers

`centers` 跟 `reducers` 类似，`centers` 支持两种类型写法。`centers` 最终会合成一个`center`，`centers` 中的各项 `center`，相当于 `switch ` 的一个条件。

**函数模式的 centers 请严格遵循下面的规则，只返回 centers对象，不可以中途做任何操作，否则可能会报错**。

`center` 参数 API ，看[这里](../api/other.md#center)。

- `object` 方式

  ```js
  const mutation = {
    namespace: 'counter',
    initialState: null,
    reducers: {
      increment_async: (action, centerUtils) => {},
      decrement_async: (action, centerUtils) => {},
    },
  };
  ```

- `function` 方式

  ```js
  const mutation = {
    namespace: 'counter',
    initialState: null,
    reducers: (action, centerUtils) => ({
      increment_async: () => {},
      decrement_async: () => {},
    }),
  };
  ```


