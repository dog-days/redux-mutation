import 'lib-test/index';
// import generatorsToAsync from 'redux-center/lib/generators-to-async';
// import loggerMiddleware from 'redux-logger';
// import {
//   configCreateStore,
//   applyMiddleware,
//   applyPlugin,
// } from 'redux-mutation';
// import loadingPlugin from './loading-plugin';

// const mutationObjects = [
//   {
//     initialState: {
//       value: 2,
//     },
//     namespace: 'counter',
//     reducers: {
//       result(state, { payload }) {
//         return payload;
//       },
//     },
//     centers: {
//       *compute(action, { put, call, select }) {
//         const counter = yield select(state => state[this.namespace]);
//         yield put({
//           type: 'result',
//           payload: {
//             ...counter,
//             value: 1 + counter.value,
//           },
//         });
//         // yield new Promise(function(resolve){
//         //   setTimeout(function(){
//         //     resolve()
//         //   },1000)
//         // })
//       },
//     },
//   },
//   {
//     namespace: 'tester',
//     initialState: {},
//     centers: {
//       async test(action, { put, call, select }) {},
//     },
//   },
// ];
// //默认不需要配置，const store = createStore(mutationObjects, applyMiddleware(loggerMiddleware))
// const store = configCreateStore(applyPlugin(loadingPlugin), {
//   generatorsToAsync,
// })(mutationObjects, applyMiddleware(loggerMiddleware));
// store.subscribe(function() {
//   console.log('rendered', store.getState());
// });
// store.dispatch({ type: 'counter/compute' });
// store.dispatch({ type: 'tester/test' });
