import combineCenters from 'redux-center/lib/combine-centers';

import {
  createStore as createBasicMutationStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
} from './basic';
import convertMutationObjects from 'redux-mutation/lib/convert-mutation-objects';

/**
 * 创建经过修改后的createStore
 * @param {functon} createStore
 * @return {object} ...createStore(...args)，返回的值跟redux createStore的是一致的。
 */
function createMutationStore(createStore) {
  /**
   * @param {object} mutationObjects 请看文件conver-mutation-object.js注释
   * @param preloadedState 跟redux的createStore的一样，没做修改
   * @param enhancer 跟redux的createStore的一样，没做修改
   * @return {object} 返回了一个经过适配后的store，属性完全跟redux的store一致
   */
  return (mutationObjects, preloadedState, enhancer) => {
    const reducerAndCenters = convertMutationObjects(
      mutationObjects,
      combineCenters
    );
    const store = createStore(reducerAndCenters, preloadedState, enhancer);
    return {
      ...store,
    };
  };
}
const createStore = createMutationStore(createBasicMutationStore);
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  combineCenters,
  convertMutationObjects,
};
