import { createStore, compose, applyMiddleware } from 'redux-mutation';

const mutationObjects = [
  function() {
    return {
      //state: 0,也可以
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
      *test2(action, { put, call, select }) {
        console.log('center test2');
        yield put({ type: 'test3' });
      },
      test3(action, { put, call, select }) {
        console.log('center test3');
      },
    },
  },
];

const testMiddleware = ({ dispatch, getState }) => next => action => {
  console.log('I am testMiddleware.');
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
    console.log('rendered', 'You can render dom here.');
  }, 200);
});
store.dispatch({ type: 'tester/test' });
