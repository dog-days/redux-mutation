import combineCenters from 'redux-center/lib/combine-centers';

import {
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  customStore as customBasicStore,
} from './basic';
import convertMutationObjects from './convert-mutation-objects';
import isPlainObject from './utils/isPlainObject';

/**
 * 创建经过修改后的createStore
 * @param {object} options 配置项，centers配置和convertMutationObjects配置
 * @param {object} 配置centersAliasName等
 * @return {object} ...createStore(...args)，返回的值跟redux createStore的是一致的。
 */
function customStore(options) {
  if (!options) {
    options = {};
  }
  const mutationObjectByNamespace = {};
  /**
   * 按照namespace的方式存放到mutationObjectByNamespace
   * @param {...object} mutationObjects 请看文件conver-mutation-object.js注释
   */
  function setMutationObjectByNamespace(mutationObjects = {}) {
    if (!Array.isArray(mutationObjects)) {
      mutationObjects = [mutationObjects];
    }
    mutationObjects.forEach(mutationObject => {
      const namespace = mutationObject.namespace;
      if (namespace) {
        mutationObjectByNamespace[namespace] = mutationObject;
      }
    });
  }
  const { centersAliasName, ...centerOptions } = options;
  /**
   * @param {...object} mutationObjects 请看文件conver-mutation-object.js注释
   * @param preloadedState 跟redux的createStore的一样，没做修改
   * @param enhancer 跟redux的createStore的一样，没做修改
   * @return {object} 返回了一个经过适配后的store，属性完全跟redux的store一致
   */
  return (mutationObjects, preloadedState, enhancer) => {
    let reducerAndCenters;
    if (typeof mutationObjects === 'function') {
      reducerAndCenters = mutationObjects;
    } else {
      setMutationObjectByNamespace(mutationObjects);
      reducerAndCenters = convertMutationObjects(mutationObjects, {
        combineCenters,
        centersAliasName,
      });
    }
    const store = customBasicStore(centerOptions)(
      reducerAndCenters,
      preloadedState,
      enhancer
    );
    return {
      replaceMutationObjects: createReplaceMutationObjects(
        store.replaceReducerAndCenters,
        { centersAliasName, mutationObjectByNamespace }
      ),
      ...store,
    };
  };
}
/**
 * @param {object} replaceReducerAndCenters 请查看./basic.js的相关注释
 * @param {object} options.mutationObjectByNamespace mutationObject的namespace为key的对象
 * @returns {function} replaceMutationObjects函数
 */
function createReplaceMutationObjects(
  replaceReducerAndCenters,
  { centersAliasName, mutationObjectByNamespace }
) {
  //热替换或动态加载中使用
  /**
   * @param {object | ...object} newMutationObjects 可以是单个mutationObject，也可以是多个mutationObject
   */
  return function(newMutationObjects) {
    if (!Array.isArray(newMutationObjects)) {
      newMutationObjects = [newMutationObjects];
    }
    // console.log(newMutationObjects);
    newMutationObjects.forEach(mutationObject => {
      if (!isPlainObject(mutationObject)) {
        throw new TypeError('Expect mutationObject to be an plain object.');
      }
      if (!mutationObject.namespace) {
        throw new TypeError('Expect mutationObject.namespace to be defined.');
      }
      if (mutationObjectByNamespace[mutationObject.namespace]) {
        //redux reducer替换的时候，如果对应的state已经初始化了，那么initialState就会失效。
        console.warn(
          `The namespace "${
            mutationObject.namespace
          }" of mutationObject will be replaced,and the new "initialState" will lose efficacy because it has been initialized.`
        );
      }
      mutationObjectByNamespace[mutationObject.namespace] = mutationObject;
    });
    //重新赋值
    newMutationObjects = [];
    for (let key in mutationObjectByNamespace) {
      newMutationObjects.push(mutationObjectByNamespace[key]);
    }
    const reducerAndCenters = convertMutationObjects(newMutationObjects, {
      centersAliasName,
      combineCenters,
    });
    replaceReducerAndCenters(reducerAndCenters);
  };
}
const createStore = customStore();

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  customStore,
  combineCenters,
  convertMutationObjects,
};
