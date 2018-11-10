# configCreateStore

```
configCreateStore([plugin],[options])
```

可配置`createStore`，`configCreateStore`返回值为[createStore](/docs/api/createStore)。

### 引入

```js
import { configCreateStore } form 'redux-mutation';
const createStore = configCreateStore(applyPlugin(...plugins),options);
```

### 参数

1. [`plugin`] *(object)*：`plugin` 会整合进`options`，可以理解为特殊的options，配合[applyPlugin](/docs/api/applyPlugin)使用。

   结构如下：

   ```js
   configCreateStore(applyPlugin(
     {
       reducerEnhancer,
       centerEnhancer,
       extraReducers,
       extraCenters,
     }
   ))
   ```

   - reducerEnhancer

     增强reducer，只要dispatch就会运行reducerEnhancer（前提中间件不拦截），结构如下：

     ```js
     function testReducerEnhancer(originalReducer) {
       return (state, action) => {
         //注意这里的state是，store.getState()后的值，整个store的值
         return originalReducer(state, action);
       };
     }
     ```

   - centerEnhancer

     增强centers，只会在center规则命中的情况先运行，这个跟，`reducerEnhancer`不一样。而且为了避免死循环，`centerEnhancer`中不可以`put`数据到已存在的`centers`。

     结构如下：

     ```js
     function test(
       center,
       { put, call, select, dispatch, getState },
       currentMutation,
       actionType
     ) {
       //...args=action,{ put,call,select,dispatch,getState }
       return async function(...args) {
         //拦截处理命中规则的center
         //这里可以处理put()
         //await put({type: 'loading',payload: true})
         await center(...args);
         //这里也可以处理put()
         //await put({type: 'loading',payload: false})
       };
     }
     
     ```

   - extraReducers

     ```js
     {
       reducer1: function(state,action){return state},
       reducer2: function(state,action){return state},
     }
     ```

     请移步[迁移到 redux-mutation](/docs/other/migrating.md)文档。

   - extraCenters

     同理`extraReducers`。

     ```js
     [
       function(action, { put }){},
       function(action, { put }){},
     ]
     ```

2. [`options`]*(object)*：配置项

   | options           | 类型     | 说明                                | 默认值  |
   | ----------------- | -------- | ----------------------------------- | ------- |
   | generatorsToAsync | function | generator转async                    | 无      |
   | centersAliasName  | string   | mutation.centers别名，兼容dva | effects |
   | shouldRunReducer  | boolean  | redux-center 高级选项，可以不理会。 | true    |

### 返回值

`configCreateStore`返回[createStore](/docs/api/createStore)。

#### 例子

`index.js`

```js
import generatorsToAsync from 'redux-center/lib/generators-to-async';
import loggerMiddleware from 'redux-logger';
import {
  configCreateStore,
  applyMiddleware,
  applyPlugin,
} from 'redux-mutation';
import loadingPlugin from './loading-plugin';

const mutations = [
  {
    initialState: {
      value: 2,
    },
    namespace: 'counter',
    reducers: {
      result(state, { payload }) {
        return payload;
      },
    },
    centers: {
      *compute(action, { put, call, select }) {
				const counter = yield select(state => state[this.namespace]);
        yield put({
          type: 'result',
          payload: {
            ...counter,
            value: 1 + counter.value,
          },
        });
      },
    },
  },
];
//默认不需要配置，const store = createStore(mutations, applyMiddleware(loggerMiddleware))
const store = configCreateStore(applyPlugin(loadingPlugin), {
  generatorsToAsync,
})(mutations, applyMiddleware(loggerMiddleware));
store.subscribe(function() {
  console.log('rendered', store.getState());
});
store.dispatch({ type: 'counter/compute' });
```

`loading-plugin.js`

```js
import { SEPARATOR } from 'redux-mutation';

let currentActionLoadingType;
let currentNamespace;
const STARTLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}start-loading`;
const ENDLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}end-loading`;
const LOADINGFIELdNAME = '$loading';
export default {
  centerEnhancer: function(center, { put }, currentMutation, actionType) {
    return async (...args) => {
      currentNamespace = currentMutation.namespace;
      currentActionLoadingType = actionType + STARTLOADINGNAMESPACESUFFIXNAME;
      await put({
        type: currentActionLoadingType,
        payload: {
          [LOADINGFIELdNAME]: true,
        },
      });
      const result = await center(...args);
      //防止中途currentActionLoadingType和currentNamespace被其他dispatch覆盖。
      currentActionLoadingType = actionType + ENDLOADINGNAMESPACESUFFIXNAME;
      currentNamespace = currentMutation.namespace;
      await put({
        type: currentActionLoadingType,
        payload: {
          [LOADINGFIELdNAME]: false,
        },
      });
      return result;
    };
  },
  reducerEnhancer: function(originalReducer) {
    return (state, action) => {
      let newState = {};
      switch (action.type) {
        case currentActionLoadingType:
          newState[currentNamespace] = {
            ...state[currentNamespace],
            ...action.payload,
          };
          break;
        default:
      }
      return originalReducer({ ...state, ...newState }, action);
    };
  },
};
```



