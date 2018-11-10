import configBasicCreateStore from './configBasicCreateStore';
import convertMutations from './convertMutations';
import functionsToAnys from './functionsToAnys';
import isPlainObject from './utils/isPlainObject';
import { isObjectEmpty } from './utils/util';

/**
 * 创建经过修改后的createStore
 * @param {object} plugin plugin 会整合进options，可以理解为特殊的options，配合applyPlugin使用
 * @param {object} options 配置项，centers配置和convertMutations配置
 * @return {object} 返回createStore函数
 */
export default function configCreateStore(plugin = {}, options = {}) {
  options = {
    ...options,
    ...plugin,
  };
  const mutationByNamespace = {};
  /**
   * 按照namespace的方式存放到mutationByNamespace
   * @param {object | array} mutations 请看functions-to.anys.js和conver-mutation-object.js注释
   */
  function setMutationByNamespace(mutations) {
    mutations.forEach(mutation => {
      const namespace = mutation.namespace;
      if (namespace) {
        mutationByNamespace[namespace] = mutation;
      }
    });
  }
  /**
   * @param {function object | array} mutations 请看文件conver-mutation-object.js注释
   * @param preloadedState 跟redux的createStore的一样，没做修改
   * @param enhancer 跟redux的createStore的一样，没做修改
   * @return {object} 返回了一个经过适配后的store，属性完全跟redux的store一致
   */
  return (mutations, preloadedState, enhancer) => {
    let reducerAndCenters = {};
    let onlyOriginalReducer = false; //mutations格式是否是reducer格式
    if (typeof mutations === 'function') {
      //mutations是redux reducer格式
      //即function(state,action)
      onlyOriginalReducer = true;
      reducerAndCenters.reducer = mutations;
      if (!isObjectEmpty(options)) {
        console.warn(
          'options param will not work when mutations is reducer format.'
        );
      }
    } else {
      mutations = functionsToAnys(mutations);
      setMutationByNamespace(mutations);
      //options不做过滤
      reducerAndCenters = convertMutations(mutations, options);
    }
    //options不做过滤
    const store = configBasicCreateStore(options)(
      reducerAndCenters,
      preloadedState,
      enhancer
    );
    return {
      replaceMutations: createReplaceMutations(
        {
          store,
          onlyOriginalReducer,
          mutationByNamespace,
        },
        options
      ),
      ...store,
    };
  };
}
/**
 * @param {object} options.store redux store实例
 * @param {object} options.onlyOriginalReducer mutations的格式是redux的reducer格式
 * @param {object} options.mutationByNamespace mutation的namespace为key的对象
 * @returns {function} replaceMutations函数
 */
function createReplaceMutations(
  { store, onlyOriginalReducer, mutationByNamespace },
  options
) {
  //热替换或动态加载中使用
  /**
   * 可替换单个和多个
   * @param {object | array} mutations 请看functions-to.ays.js和conver-mutation-object.js注释
   */
  return function(newMutations) {
    if (onlyOriginalReducer) {
      return store.replaceReducer(newMutations);
    }
    newMutations = functionsToAnys(newMutations);
    // console.log(newMutations);
    newMutations.forEach(mutation => {
      if (!isPlainObject(mutation)) {
        throw new TypeError('Expect mutation to be an plain object.');
      }
      if (!mutation.namespace) {
        throw new TypeError('Expect mutation.namespace to be defined.');
      }
      mutationByNamespace[mutation.namespace] = mutation;
    });
    //重新赋值
    newMutations = [];
    for (let key in mutationByNamespace) {
      newMutations.push(mutationByNamespace[key]);
    }
    const reducerAndCenters = convertMutations(newMutations, options);
    store.replaceReducerAndCenters(reducerAndCenters);
  };
}
