# 使用mutation

`redux-mutation`兼容`redux`所有用法，使用`mutation`代替reducer是`redux-mutaion`的主要用法。

```js
import { createStore } from 'redux-mutation';

const mutations = [
  function() {
    //可以使用函数返回对象，多一层作用域保护变量
    return {
      //state: 0,也可以
      initialState: 0,
      //namespace相当于reducer名
      namespace: 'counter',
      reducers: {
        increment(state, action) {
          return state + 1;
        },
        decrement(state, action) {
          return state - 1;
        },
      },
    };
  },
  {
    //namespace相当于reducer名
    namespace: 'tester',
    //state: null,也可以
    initialState: null,
    centers: {
      async test(action, { put, call, select }) {
        console.log('center test');
        await put({ type: 'test2' });
        await put({ type: 'increment' }, 'counter');
        console.log(
          'counter after increment',
          await select(state => state.counter)
        );
        await put({ type: 'counter/decrement' });
        console.log(
          'counter after decrement',
          await select(state => state.counter)
        );
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log('fetchedData', data);
      },
      async test2(action, { put, call, select }) {
        console.log('center test2');
        await put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('center test3');
      },
    },
  },
];
const store = createStore(mutations);
store.subscribe(function() {
  console.log('rendered', 'You can render dom here.');
});
store.dispatch({ type: 'tester/test' });
```

