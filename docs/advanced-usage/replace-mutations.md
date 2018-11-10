# 使用 replaceMutations

`replaceMutations`可用于热替换和动态加载，同理于`replaceReducer`，也可以当做`replaceReducer`使用。

`replaceMutations`详细说明请看API文档。

## webpack热替换例子

`index.js`

```js
import { createStore,replaceMutations } from 'redux-mutation';
import mutations from './mutations'

const store = createStore(mutations);

function render(payload){
  store.dispatch({ type: 'tester/increment'})
}
render("首次渲染");

if (module.hot) {
  module.hot.accept('./mutations', () => {
    replaceMutations(mutations);
    render('热替换渲染');
  });
}
```

`mutation.js`

```js
export default const mutations = [
  {
    //state: 0,也可以
    initialState: 0,
    namespace: 'tester',
    centers: {
      async increment(action, { put }) {
        console.log(action.payload)
      },
    },
  },
];
```

