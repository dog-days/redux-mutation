# 迁移到 redux-mutation

`redux`迁移到`redux-mutation`十分简单，同时也完全不会影响之前的`reducer`，然后可以逐渐的把`redux reducer`迁移到`mutationObjects`。

`index.js`

```js
import { createMutaionStore, applyPlugin } from 'redux-mutation';
import reducers from './reducers';
import mutationObjects from './mutationObjects';

//无需使用combineReducers
const store = createMutaionStore(applyPlugin(
  { extraReducers: reducers }
))(mutationObjects);
```

`reducers.js`

```js
function counter(state = 0,action){
  switch(action.type){
    case "increase"：
      return state + 1
    default: 
      return state;
  }
}
function counter2(state = 0,action){
  switch(action.type){
    case "increase2"：
      return state + 1
    default: 
      return state;
  }
}
export default const reducers = {
  counter,
  counter2
}
```

`mutationObjects.js`

```js
const mutationObjectOne = {
  namespace: 'mutationObjectOne',
  initialState: 0,
  reducers: {},
  centers: {}
}
const mutationObjectOne2 = {
  namespace: 'mutationObjectOne2',
  initialState: 0,
  reducers: {},
  centers: {}
}
export default const mutationObjects = [
  mutationObjectOne,
  mutationObjectOne2
]
```







