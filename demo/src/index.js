import generatorsToAsync from 'redux-center/lib/generators-to-async';
import loggerMiddleware from 'redux-logger';
import {
  configCreateStore,
  applyMiddleware,
  applyPlugin,
} from 'redux-mutation';

const mutationObjects = [
  {
    //state: 0,也可以
    initialState: 0,
    namespace: 'counter',
    reducers: {
      increment(state, { payload }) {
        //这里没运行，因为下面运行了replaceMutationObjects，替换了counter
        console.log('这里不会运行');
        const { value } = payload;
        return state + value;
      },
      decrement(state, { payload }) {
        const { value } = payload;
        return state - value;
      },
    },
  },
  {
    namespace: 'tester',
    //state: null,也可以
    initialState: null,
    centers: {
      async test(action, { put, call, select }) {
        // console.log('center test');
        // await put({ type: 'test2' });
        await put({
          type: 'counter/increment',
          payload: {
            value: 1,
          },
        });
        console.log(
          'await before decrement:',
          await select(state => state.counter)
        );
        await put(
          {
            type: 'decrement',
            payload: {
              value: 3,
            },
          },
          'counter'
        );
        console.log(
          'await after DECREMENT:',
          await select(state => state.counter)
        );
        const data = await fetch('/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log('Fetched data:', data);
      },
      *test2(action, { put, call, select }) {
        // console.log('center test2');
        yield put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        // console.log('center test3');
      },
    },
  },
];
//默认不需要配置，const store = createStore(mutationObjects, applyMiddleware(loggerMiddleware))
const store = configCreateStore(
  applyPlugin(
    {
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
      centerEnhancer: function(
        center,
        { put },
        currentMutationObject,
        actionType
      ) {
        return async (...args) => {
          // console.log(currentMutationObject);
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
          let newState = {};
          switch (action.type) {
            //新的reducer
            case 'loading':
              newState.tester = action.payload;
              break;
            default:
          }
          return originalReducer({ ...state, ...newState }, action);
        };
      },
    },
    {
      //只要dispatch就会运行reducerEnhancer（中间件不拦截）
      reducerEnhancer: function(originalReducer) {
        return (state, action) => {
          //这里可以拦截已定义的reducer
          const newState = originalReducer({ ...state }, action);
          // console.log(newState, 222);
          return newState;
        };
      },
    }
  ),
  {
    generatorsToAsync,
  }
)(mutationObjects, applyMiddleware(loggerMiddleware));
store.replaceMutationObjects({
  //initialState不会生效的了，因为上面的counter已经初始化过了
  //可以不设置initialState或者state
  namespace: 'counter',
  reducers: {
    increment(state, { payload }) {
      const { value } = payload;
      return state + value;
    },
    decrement(state, { payload }) {
      const { value } = payload;
      return state - value;
    },
  },
});
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    document.getElementById('app').innerHTML = '请查看console';
    console.log('You can render dom here.');
  }, 200);
});
store.dispatch({ type: 'tester/test' });
