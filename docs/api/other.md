# 其他 API

### center

```js
(action,centerUtils) => void
```

`mutation`的`centers `中会用到 `center` 方法。

```js
const mutation = {
  namespace: 'test',
  initialState: null,
  centers: {
    centerOne(action, centerUtils) {},
    centerTwo(action, centerUtils) {},
  },
};
```

#### 参数

1. `action` *(*object*)*

   `dispatch(action)`中的action，详细可看[redux actions](https://redux.js.org/basics/actions)。

2. `centerUtils` *(*object*)*

   `centerUtils`包括下面的属性，下面的代码使用了`jest` 的测试代码。

   ```js
   const { put, select, delay, call, dispatch, getState } = centerUtils;
   ```

   - `put(action,namepace)`

     `promise`版的`dispatch`，同时结合`mutation`做了一些处理，在当前`mutation` 使用`put` 进行内部交流可以省略 `namespace`。

     ```js
     const mutations = [
       {
         namespace: 'other-mutation',
         initialState: null,
         centers: {
           async centerThree() {},
         },
       },
       {
         namespace: 'current-mutation',
         initialState: null,
         centers: {
           async centerOne(action, { put }) {
             // 在当前mutation 使用put 进行内部交流可以省略 namespace。
             //await put({ type: 'centerTwo' },'current-mutation');
             //await put({ type: 'current-mutation/centerTwo' })，这个会报warning
             await put({ type: 'centerTwo' });
             // 在非当前mutation 使用put，需要加上namespace。
             await put({ type: 'centerThree' }, 'other-mutation');
             //或者这样await put({ type: 'other-mutation/centerThree' });
           },
           centerTwo(action, centerUtils) {},
         },
       },
     ];
     ```

   - `select(selector)`

     `promise` 版的 `getState` , 同时支持`selector`，是为了兼容 `dva` 中 `redux-saga` 的 `select`。

     如果你没用过这个，可以直接使用`getState`代替。

     ```js
     const mutation = {
       namespace: 'test',
       initialState: null,
       centers: {
         async centerOne(action, { select, getState }) {
           const state = await select();
           const test = await select(state => test);
           const stateForGetState = getState();
           expect(stateForGetState).toEqual(state);
           expect(test).toEqual(state.test);
         },
       },
     };
     ```

   - `delay(ms)`

     `promise` 版的 `setTimeout` ，`resovle(ms)`。

     ```js
     const mutation = {
       namespace: 'test',
       initialState: null,
       centers: {
         async centerOne(action, { delay }) {
           const ms = await delay(1000);
           expect(ms).toEqual(1000);
         },
       },
     };
     ```

   - `call(fn, ...args)`

     异步版的 `call`，兼容 `dva` 中 `redux-saga` `call` 用法。如果你用过这个可以忽略。

     ```js
     const mutation = {
       namespace: 'test',
       initialState: null,
       centers: {
         async centerOne(action, { call }) {
           await call(fetch, '/data.json');
           //等价于 fetch('/data.json')
         },
       },
     };
     ```

   - `dispatch(action)`

     跟 [redux dispatch](https://redux.js.org/api/store#dispatch) 一样。

   - `getState()`

     跟 [redux getState](https://redux.js.org/api/store#getState) 一样。

   #### 返回值

   不需要返回值。

   **在`configCreateStore` 的 `options` `shouldRunReducer = false`  请不要返回 `true`，否则会导致`reudcer` 不运行。**

   ### centerEnhancer

   ```js
   (originalCenter, centerUtils, currentMutation, actionType) => (...args) =>
     originalCenter(...args);
   ```

   `centerEnhancer` 是在 `applayPluin` 中使用，`centerEnhancer` 只要在命中的情况下运行。参数跟` dva`中的 `onEffect` 的效果是一样的。

   ```js
   const pluginOne = {
     centerEnhancer: function(originalCenter, centerUtils, currentMutation, actionType) {
       return async (...args) => {
         return originalCenter(...args);
       };
     },
   };
   const store = createMutationStore(applyPlugin(pluginOne))(mutations);
   ```

   #### 参数

   1. `originalCenter`  *(*function*)*

      ```js
      (action, centerUtils) => any
      ```

      `dispatch` 或者 `put` 命中的 `center` 。

   2. `centerUtils`  *(*object*)*

      请参考上面 `center` 的参数 `centerUtils`。

   3. `currentMutation`  *(*object*)*

      `originalCenter` 所属的mutation。

   4. `actionType`  *(*string*)*

      `action` 对象的 `type` 属性，在 `redux-mutation` 中只可以是字符串。

      ```js
      const action = { type: 'test' };
      const actionType = action.type;
      ```

   #### 返回值

   返回 `center` 函数。

   #### reducerEnhancer

   ```js
   originalReducer => (...args) => originalReducer(...args);
   ```

   `reducerEnhancer` 是在 `applayPluin` 中使用，只要 `dispatch`就会触发 `reducerEnhancer` 。参数跟` dva`中的 `onReducer` 的效果是一样的。

   #### 参数

   1. `originalReducer`  *(*function*)*

      ```js
      (state, action) => state
      ```

      即将运行的 `reducer`，`redux` 对内只有一个 `reducer` （ `composeReducers` 会返回一个reducer）。

   #### 返回值

   返回 `reducer` 函数。















































