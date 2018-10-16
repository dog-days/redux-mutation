import { createStore, compose, applyMiddleware } from 'redux-mutation';

const mutationObjects = [
  function() {
    return {
      initialState: 0,
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
    namespace: 'tester',
    initialState: 0,
    centers: {
      async test(action, { put, call, select }) {
        await put({ type: 'test2' });
        await put({ type: 'increment' }, 'counter');
        console.log(await select());
        await put({ type: 'counter/decrement' });
        console.log('counter', await select(state => state.counter));
        const data = await call(fetch, '/demo.json').then(resonse => {
          return resonse.json();
        });
        console.log(data);
      },
      *test2(action, { put, call, select }) {
        console.log('test2');
        yield put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('test3');
      },
    },
  },
];

const testMiddleware = ({ dispatch, getState }) => next => action => {
  console.log('testMiddleware');
  return next(action);
};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  mutationObjects,
  composeEnhancers(applyMiddleware(testMiddleware))
);
let clearRenderTimeout;
store.subscribe(function() {
  //避免dispath过于频繁。
  //这样可以避免频繁渲染，集中一次渲染。
  clearTimeout(clearRenderTimeout);
  clearRenderTimeout = setTimeout(function() {
    console.log('You can render dom here.');
  }, 200);
});
// store.dispatch({ type: 'render' });
store.dispatch({ type: 'tester/test' });
