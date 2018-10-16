/**
 * src/basic.js是不包含combineCenters和converMutationObjects
 * 如果没用到gennerators最好直接使用basic文件
 * src/index.js在src/basic的基础上包含了combineCenters和converMutationObjects
 */
import {
  createStore as createReduxStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
} from 'redux';
import createCenter from 'redux-center';

import isPlainObject from './utils/isPlainObject';

/**
 * 创建经过修改后的createStore
 * @param {functon} createStore
 * @return {object} ...createStore(...args)，返回的值跟redux createStore的是一致的。
 */
function createBasicMutationStore(createStore) {
  /**
   * @param {object} reducerAndCenters 整合了reducers和centers，也可以直接当做reducer，格式如下
   *  {
   *    reducer: combineReducers(...args), //函数
   *    centers: [function(action,{put,call,select}){}], //数组
   *  }
   *  或者
   *  combineReducers(...args),
   * @param preloadedState 跟redux的createStore的一样，没做修改
   * @param enhancer 跟redux的createStore的一样，没做修改
   * @return {object} 返回了一个经过适配后的store，属性完全跟redux的store一致
   */
  return (reducerAndCenters, preloadedState, enhancer) => {
    if (
      typeof preloadedState === 'function' &&
      typeof enhancer === 'undefined'
    ) {
      enhancer = preloadedState;
      preloadedState = undefined;
    }
    //不做reducer类型判断，由redux判断
    let reducer = {};
    //不做centers类型判断，由redux-center判断
    let centers = [];
    if (typeof reducerAndCenters === 'function') {
      reducer = reducerAndCenters;
    } else if (isPlainObject(reducerAndCenters)) {
      reducer = reducerAndCenters.reducer;
      centers = reducerAndCenters.centers || [];
    } else {
      throw new TypeError(
        `
          reducerAndCenters could only be an object or function.For example:
          {
            reducers: combineReducers(...args),
            centers: [
              function(){},
              function(){},
            ]
          }
          or
          combineReducers(...args)
        `
      );
    }
    const centerInstance = createCenter(centers);
    const centerMiddleware = centerInstance.createCenterMiddleware();
    if (!enhancer) {
      enhancer = applyMiddleware(centerMiddleware);
    } else {
      enhancer = compose(
        applyMiddleware(centerMiddleware),
        enhancer
      );
    }
    const store = createStore(reducer, preloadedState, enhancer);
    return {
      ...store,
    };
  };
}
const createStore = createBasicMutationStore(createReduxStore);
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
};
