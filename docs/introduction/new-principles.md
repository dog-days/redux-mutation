# 新原则

`redux`的三大原则看[这里](https://redux.js.org/introduction/threeprinciples)。

## 异步等耗时逻辑交给center处理

异步请求、相对复杂的或者耗时数据处理等，先在`center`中处理，然后传递到`reducer`中处理。例如：

```js
{
  namespace: 'test',
  //alias as state
  //state : {},
  initialState: {
    data: null
  },
  reduers: {
    testReducer(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
  },
  centers: {
    async testCenter(action, { put,call }) {
      const await fetch("/demo.json").then(response => {
        return response.json();
      });;
      await put({ type: "testReducer",payload: data });
    },
  },
};
```

