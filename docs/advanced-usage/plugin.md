# 使用插件

`redux-mutaiton`新增了个插件功能，需要配合`applyPlugin`使用。如果使用配置项，如`generatorsToAsync`可以在`applyPlugin`后面的参数使用。

```js
import { createMutationStore, applyPlugin } from 'redux-mutation';
import generatorsToAsync from 'redux-center/lib/generators-to-async';
import pluginOne form './pluginOne'

const mutations = [
  {
    //state: 0,也可以
    initialState: 0,
    namespace: 'counter',
    centers: {
      *increment(action, { put }) {
      	yield put({ type: 'test' });
      },
    },
  },
];

const store = createMutationStore(
  applyPlugin(pluginOne), 
  { generatorsToAsync }
)(mutations);
```

`pluginOne.js`

```js
export default const pluginOne = {
  extraReducers: {
    extraOne: function(state = null, action) {
      return state;
    },
  },
  extraCenters: [
    function(action) {
      // console.log(action);
    },
  ],
  //只有center规则命中这里才会运行，这点跟reducerEnhancer不一样
  centerEnhancer: function(center, { put }, currentMutation, actionType) {
    return async (...args) => {
      // console.log(currentMutation);
      //这里可以拦截center
      await put({ type: 'loading', payload: true });
      const result = await center(...args);
      await put({ type: 'loading', payload: false });
      return result;
    };
  },
  //只要dispatch就会运行reducerEnhancer（中间件不拦截）
  reducerEnhancer: function(originalReducer) {
    return (state, action) => {
      //这里可以拦截已定义的reducer
      const newState = {};
      return originalReducer({ ...state, ...newState }, action);
    };
  },
};
```

