# 使用 replaceMutationObjects

`replaceMutationObjects`可用于热替换和动态加载，同理于`replaceReducer`，也可以当做`replaceReducer`使用。

`replaceMutationObjects`详细说明请看API文档。

## webpack热替换例子

`index.js`

```js
import { createStore,replaceMutationObjects } from 'redux-mutation';
import mutationObjects from './mutationObjects'

const store = createStore(mutationObjects);

function render(payload){
  store.dispatch({ type: 'tester/increment'})
}
render("首次渲染");

if (module.hot) {
  module.hot.accept('./mutationObjects', () => {
    replaceMutationObjects(mutationObjects);
    render('热替换渲染');
  });
}
```

`mutationObject.js`

```js
export default const mutationObjects = [
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

