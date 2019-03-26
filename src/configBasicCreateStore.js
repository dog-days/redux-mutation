/**
 * src/basic.js是不包含combineCenters和converMutations
 * 如果没用到gennerators最好直接使用basic文件
 * src/index.js在src/basic的基础上包含了combineCenters和converMutations
 */
import { createStore as createReduxStore, applyMiddleware } from 'redux';
import createCenter from 'redux-center';

import isPlainObject from './utils/isPlainObject';
import compose from './compose';

function checkReducerAndCenters(reducerAndCenters) {
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof reducerAndCenters !== 'function' &&
    !isPlainObject(reducerAndCenters)
  ) {
    throw new TypeError(
      'Expect the reducerAndCenters to be a plain object or a function.'
    );
  }
}
/**
 * 创建经过修改后的createStore
 * @param {object} options 配置项，目前只有centers配置
 * @return {object} ...createStore(...args)，返回的值跟redux createStore的是一致的。
 */
export default function configBasicCreateStore(options) {
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
    checkReducerAndCenters(reducerAndCenters);
    if (
      typeof preloadedState === 'function' &&
      typeof enhancer === 'undefined'
    ) {
      enhancer = preloadedState;
      preloadedState = undefined;
    }
    // 不做reducer类型判断，由redux判断
    let reducer = {};
    // 不做centers类型判断，由redux-center判断
    let centers = [];
    let isOnlyReducer = false;
    if (typeof reducerAndCenters === 'function') {
      reducer = reducerAndCenters;
      isOnlyReducer = true;
    } else if (isPlainObject(reducerAndCenters)) {
      reducer = reducerAndCenters.reducer;
      centers = reducerAndCenters.centers || [];
    }
    let centerInstance;
    if (!isOnlyReducer) {
      let { ...centerOptions } = options;
      centerInstance = createCenter(centers, centerOptions);
      const centerMiddleware = centerInstance.createCenterMiddleware();
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
      if (!enhancer) {
        enhancer = composeEnhancers(applyMiddleware(centerMiddleware));
      } else {
        enhancer = composeEnhancers(
          applyMiddleware(centerMiddleware),
          enhancer
        );
      }
    }
    const store = createReduxStore(reducer, preloadedState, enhancer);
    return {
      replaceReducerAndCenters: createReplaceReducerAndCenters(
        store.replaceReducer,
        !!centerInstance && centerInstance.replaceCenters
      ),
      ...store,
    };
  };
}
function createReplaceReducerAndCenters(replaceReducer, replaceCenters) {
  // 热替换或动态加载中使用
  return reducerAndCenters => {
    checkReducerAndCenters(reducerAndCenters);
    let reducer;
    if (!replaceCenters) {
      reducer = reducerAndCenters;
    } else {
      reducer = reducerAndCenters.reducer;
      const centers = reducerAndCenters.centers;
      replaceCenters(centers);
    }
    replaceReducer(reducer);
  };
}
