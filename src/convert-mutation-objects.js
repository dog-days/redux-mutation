import { combineReducers, compose } from 'redux';

import isPlainObject from './utils/isPlainObject';
import { SEPARATOR } from './utils/const';
import { randomString, checkActionType } from './utils/util';

/**
 * 转换多个mutationObject结构
 * namespace其实就是reducer名
 * @param {...object} mutationObjects
 *  [
 *    {
 *      namespace: 'test',
 *      //alias as state
 *      //state : {},
 *      initailState: {},
 *      reduers: {},
 *      centers: {},
 *    },
 *    {
 *      namespace: 'test2',
 *      state: {},
 *      reduers: {},
 *      centers: {},
 *    }
 *  ]
 * @param {function} options.generatorsToAsync 请参考redux-center的generatorsToAsync
 * @param {string} options.centersAliasName mutationObject.centers别名，兼容dva和redux-saga-model
 * @param {function} options.reducerEnhancer 增强reducer，结构如下：
 *  function(originalReducer){
 *    return (state,action)=>{
 *      //注意这里的state是，store.getState()后的值，整个store的值
 *      switch(action.type){
 *        //这里进行一些处理
 *      }
 *      return originalReducer(state,action);
 *    }
 *  }
 * @param {function} options.centerEnhancer 增强centers，结构如下：
 *  function(center, { put,call,select,dispatch,getState }, currentMutationObject, actionType){
 *    //...args=action,{ put,call,select,dispatch,getState }
 *    return async function(...args){
 *      //这里可以处理put()
 *      //await put({type: 'loading',payload: true})
 *      await centers(...args);
 *      //这里也可以处理put()
 *      //await put({type: 'loading',payload: false})
 *    }
 *  }
 * @param {object} options.extraReducers 而外的reducer
 * @param {function | ...function} options.extraCenters 而外的centers
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    centers: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
class ConvertMutationsObjects {
  constructor(mutationObjects, options = {}) {
    this.mutationObjects = mutationObjects;
    this.options = this.getDefaultOptions(options);
    return this.convertMutationsObjects();
  }
  getDefaultOptions(options) {
    return {
      reducerEnhancer: function(originalReducer) {
        return (...args) => {
          return originalReducer(...args);
        };
      },
      centerEnhancer: function(center) {
        return async (...args) => {
          return await center(...args);
        };
      },
      ...options,
    };
  }
  /**
   * @return {object} {reducer,centers} 结构如下
   *  {
   *    reducer: function(state,action){},
   *    centers: function(action,{ put, call, select, dispatch, getState }){}
   *  }
   */
  convertMutationsObjects() {
    let mutationObjects = this.mutationObjects;
    const { reducerEnhancer } = this.options;
    if (!Array.isArray(mutationObjects)) {
      mutationObjects = [mutationObjects];
    }
    this.checkMutationObjects(mutationObjects);
    const randomReducerKey = randomString();
    const reducersAndCenters = mutationObjects.reduce(
      (reducersAndCenters, mutationObject) => {
        if (reducersAndCenters.reducers[randomReducerKey]) {
          //reucers不为空对象时，删除默认的reducer
          delete reducersAndCenters.reducers[randomReducerKey];
        }
        const namespace = mutationObject.namespace;
        let { reducer, center } = this.convertMutationsObject(mutationObject);
        reducersAndCenters.reducers[namespace] = reducer;
        reducersAndCenters.centers.push(center);
        return reducersAndCenters;
      },
      {
        reducers: {
          //reducers为空的时候会提示错误，传递一个reducer
          //可以消除错误提示。
          [randomReducerKey]: function() {
            return null;
          },
        },
        //跟redux-centers不一致，这里需要其他数据
        //{[namespace]: {center,mutationObject}}
        centers: [],
      }
    );
    //而外的reducer和centers，用作插件，插件的代码是要放在一起的
    let {
      extraReducers = {},
      extraCenters = [],
      generatorsToAsync,
    } = this.options;
    if (reducersAndCenters.reducers) {
      reducersAndCenters.reducers = {
        ...reducersAndCenters.reducers,
        ...extraReducers,
      };
    }
    if (reducersAndCenters.centers) {
      if (!Array.isArray(extraCenters)) {
        extraCenters = [extraCenters];
      }
      if (generatorsToAsync) {
        extraCenters = generatorsToAsync(extraCenters);
      }
      reducersAndCenters.centers = extraCenters.concat(
        reducersAndCenters.centers
      );
    }
    return {
      reducer: compose(
        reducerEnhancer,
        combineReducers
      )(reducersAndCenters.reducers),
      centers: reducersAndCenters.centers,
    };
  }
  /**
   * 转换单个mutationObject结构
   * @param {object} mutationObject  结构如下
   *   {
   *     namespace: 'test',
   *     //alias as state
   *     //state : {},
   *     initailState: {},
   *     reducers: {}
   *     centers: {}
   *   }
   * @return {object} {reducer,centers} 结构如下
   *  {
   *    reducer: function(state,action){},
   *    center: function(action,{ put, call, select, dispatch, getState }){}
   *  }
   */
  convertMutationsObject(mutationObject) {
    this.checkMutationObjectVariableType(mutationObject);
    const { centersAliasName = 'effects', ...otherOptions } = this.options;
    const namespace = mutationObject.namespace;
    this.checkMutationObjectField(mutationObject, 'namespace');
    this.checkMutationObjectField(mutationObject, ['initialState', 'state']);
    const reducersObject = mutationObject.reducers || {};
    const centersObject =
      mutationObject.centers || mutationObject[centersAliasName] || {};

    return {
      reducer: (state, action) => {
        //兼容state，推荐使用initialState
        //初始化state
        let initialState = mutationObject.initialState;
        if (initialState === undefined) {
          initialState = mutationObject.state;
        }
        if (state === undefined) {
          state = initialState;
        }
        // console.log(action, initialState, state, namespace);
        //bind是为了后续覆盖reducers和centers的上下问题
        return this.recducersFunctionsToOneFunctionByAction(
          reducersObject,
          { namespace, mutationObject },
          { state, action }
        );
      },
      center: async (action, centerUtils) => {
        checkActionType(action);
        return await this.centerFunctionsToOneFunctionByAction(
          centersObject,
          { namespace, mutationObject, ...otherOptions },
          { action, centerUtils }
        );
      },
    };
  }
  /**
   * reducerObject转换为redux的reducer函数。
   * 跟dva的handleAction实现是一致的，返回reducer。
   * dva的使用了Array.reduce方式，挺高大上，不过会变复杂，相对不好理解。
   * 这里逻辑并不复杂，Array.reduce在这里大才小用了。
   * 直接使用for in语句来处理，会更直观。
   * 其实就是相当于把官方redux例子的switch语句改为了if语句。
   * @param {object} reducerObject 格式如下
   * {
   *   test{}
   *   test2{}
   * }
   * @param {string} namespace 命名空间，相当于reducer函数名
   * @param {any} initailState reducer初始化state
   * @param {any} state redux state
   * @param {object} action redux action
   * @return undefined
   */
  recducersFunctionsToOneFunctionByAction(
    reducerObject,
    { namespace, mutationObject },
    { state, action }
  ) {
    for (let key in reducerObject) {
      if (!!~key.indexOf(SEPARATOR)) {
        throw new TypeError(
          `mutationObject.reducers["${key}"] can not contain "${SEPARATOR}"`
        );
      }
      const fn = reducerObject[key];
      if (typeof fn !== 'function') {
        //忽略非函数的属性
        continue;
      }
      //reducerObject和centerObject的namespace+SEPARATOR+函数名 === action.type
      if (action.type === `${namespace}${SEPARATOR}${key}`) {
        //转换的时候，绑定fn上下文为mutationObject
        return fn.bind(mutationObject)(state, action);
      }
    }
    //默认使用原来的state
    return state;
  }
  /**
   * reducerObject转换为redux的reducer函数。
   * @param {object} centersObject 格式如下
   * {
   *   test{}
   *   test2{}
   * }
   * @param {string} options.namespace 命名空间，相当于reducer函数名
   * @param {function} options.generatorsToAsync 请参考redux-center的generatorsToAsync
   * @param {function} options.centerEnhancer 请参考上面centerEnhancer注释
   * @param {object} action redux action
   * @param {object} centerUtils redux-center的cener函数参数 {put,call,select,dispatch,getState}
   * @return {any}
   */
  async centerFunctionsToOneFunctionByAction(
    centersObject,
    { namespace, mutationObject, generatorsToAsync, centerEnhancer },
    { action, centerUtils }
  ) {
    const put = this.createNewPut(centerUtils.put, namespace);
    for (let key in centersObject) {
      // console.log(key);
      const fn = centersObject[key];
      if (typeof fn !== 'function') {
        //忽略非函数的属性
        continue;
      }
      if (!!~key.indexOf(SEPARATOR)) {
        throw new TypeError(
          `mutationObject.centers["${key}"] can not contain "${SEPARATOR}"`
        );
      }
      //reducerObject和centerObject的namespace+SEPARATOR+函数名 === action.type
      if (action.type === `${namespace}${SEPARATOR}${key}`) {
        let center;
        if (generatorsToAsync) {
          //转换的时候，绑定fn上下文为mutationObject
          center = generatorsToAsync(fn.bind(mutationObject))[0];
        } else {
          // 转换的时候，绑定fn上下文为mutationObject
          center = fn.bind(mutationObject);
        }
        const newCenterUtils = {
          ...centerUtils,
          put,
        };
        return await centerEnhancer(
          center,
          centerUtils,
          mutationObject,
          action.type
        )(action, newCenterUtils);
      }
    }
    //center配置shouldRunReducer=false，就必须返回true
    //return true不影响shouldRunReducer=true，统一返回true；
    return true;
  }
  /**
   * @param {function} originalPut 原来的的center put参数
   * @param {string} namespace mutationObject命名空间
   */
  createNewPut(originalPut, namespace) {
    /**
     * promise版的dispatch，在当前的center中使用的时候，默认会加上nameapce + SEPARATOR
     * action.type = `${namespace}${SEPARATOR}${action.type}`
     * 这种模式先的action.type的结构如下：
     * namespace + SEPARATOR + mutationObject.centers.centerName
     * 其中mutationObject.centers.centerName ，不可以包含SEPARATOR
     * @param {object} action
     * @param {string} replaceNamespace mutationObject namespace，替换当前默认的namespace
     */
    return (action, replaceNamespace) => {
      checkActionType(action);
      const actionType = action.type;
      let lastNamespace = replaceNamespace || namespace;
      if (actionType.indexOf(`${namespace}${SEPARATOR}`) === 0) {
        console.warn(
          `
          When using "put" in the current mutationObject，
          you can use function name without namespace.
          You should use in this way:
          await put({
            type: ${actionType.split(`${namespace}${SEPARATOR}`)[1]};
          });
          We do not recommend using in this way:
          await put({
            type: ${actionType}
          });
        `
        );
      }
      let newType = actionType;
      if (!~newType.indexOf(SEPARATOR)) {
        //mutationObject.reducers和mutationObject.centers的属性是不能包含`${SEPARATOR}`
        //actionType只是使用了mutationObject.centers[centerName]
        //或者mutationObject.recuers[reducerName]
        //那么就可以当做，是在当前的mutationObject进行内部put
        newType = `${lastNamespace}${SEPARATOR}${actionType}`;
      }
      return originalPut({ ...action, type: newType });
    };
  }

  /**
   * 检测mutationObject对象必填的字段
   * @param {string} mutationObject 参考下面convertMutationsObject的注释
   * @param {string | array} field 字段名，如果是数组，那么第一个默认使用的，其他的是别名
   */
  checkMutationObjectField(mutationObject, field) {
    let defaultField = field;
    if (Array.isArray(field)) {
      defaultField = field[0];
      let tempField;
      field.forEach(f => {
        if (mutationObject[tempField] === undefined) {
          tempField = f;
        }
      });
      field = tempField;
    }
    if (mutationObject[field] === undefined) {
      throw new Error(
        `
        Expect mutationObject[${defaultField}] be defined.For example:
        {
          namespace: 'test',
          //initailState alias as state
          //state : {},
          initailState: 'state',
          reducers: {},
          centers: {}
        }
      `
      );
    }
  }
  /**
   * 检测mutationObject类型
   * @param {object} mutationObject
   */
  checkMutationObjectVariableType(mutationObject) {
    if (!isPlainObject(mutationObject)) {
      throw new TypeError('Expect mutationObject to be an plain object.');
    }
    return mutationObject;
  }
  /**
   * 验证namespace是否重复
   * 验证所有reducers和centers的属性名是否重复，重复则抛出异常
   * @param {...object} mutationObjects
   */
  checkMutationObjects(mutationObjects) {
    //存放所有namepsace
    const allNamespace = {};
    //存放所有reducers和centers的property
    const allReducersCentersKey = {};
    mutationObjects.forEach(mutationObject => {
      this.checkMutationObjectVariableType(mutationObject);
      if (allNamespace[mutationObject.namespace]) {
        throw new Error(
          `The namespace "${mutationObject.namespace}" is exited.`
        );
      } else {
        allNamespace[mutationObject.namespace] = true;
      }
      function throwRducersCentersError(field) {
        throw new Error(
          `reducers[property] and centers[property] should be unique.\r\nThe namespace is "${
            mutationObject.namespace
          }".And the property is "${field}".`
        );
      }
      const reducers = mutationObject.reducers;
      for (let reducersKey in reducers) {
        if (allReducersCentersKey[reducersKey]) {
          throwRducersCentersError(reducersKey);
        } else {
          allReducersCentersKey[reducersKey] = true;
        }
      }
      const centers = mutationObject.centers;
      for (let centersKey in centers) {
        if (allReducersCentersKey[centersKey]) {
          throwRducersCentersError(centersKey);
        } else {
          allReducersCentersKey[centersKey] = true;
        }
      }
    });
  }
}

export default function(...args) {
  return new ConvertMutationsObjects(...args);
}
