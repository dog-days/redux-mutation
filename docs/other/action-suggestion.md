# Action使用建议

> Action 很简单，就是一个单纯的包含 `{ type, payload }` 的对象，`type` 是一个常量用来标示动作类型，`payload` 是这个动作携带的数据。Action 需要通过 `store.dispatch()` 方法来发送。

- 严格遵循`{ type, payload }`格式。

- 不建议使用[Action Creators](https://redux.js.org/basics/actions#action-creators)，直接使用`dispacth({type: "",payload: {}})`，无需模块分离（redux官方的例子action是分离的）。

  ```js
  dispatch({
    type: `${namespace}/testCenter`,
    payload: {
      data: {}
    }
  })
  ```