# 只使用reducer

用法跟`redux`一模一样。

```js
import { createStore, combineReducers } from 'redux-mutation';

function counter(state = 0,action){
  switch(action.type){
    case "increase"：
      return state + 1
    default: 
      return state;
  }
}
const reducer = combineReducers({ counter });
const store = createStore(reducer);
store.subscribe(function() {
  console.log('rendered', 'You can render dom here.');
});
store.dispatch({ type: 'increase' });
```

