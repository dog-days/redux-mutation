import { combineReducers, compose } from 'redux';

import isPlainObject from './utils/isPlainObject';
import { SEPARATOR } from './utils/const';
import { checkActionType } from './utils/util';

/**
 * 转换多个mutation结构
 * namespace其实就是reducer名
 * @param {object | array} mutations
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
 * @param {string} options.centersAliasName mutation.centers别名，兼容dva和redux-saga-model
 * @param {function} options.reducerEnhancer 增强reducer，只要dispatch就会运行reducerEnhancer（前提中间件不拦截），结构如下：
 *  function(originalReducer){
 *    return (state,action)=>{
 *      //注意这里的state是，store.getState()后的值，整个store的值
 *      switch(action.type){
 *        //这里进行一些处理
 *      }
 *      return originalReducer(state,action);
 *    }
 *  }
 * @param {function} options.centerEnhancer 增强centers，只会在center规则命中的情况先运行，这个跟，reducerEnhancer不一样，结构如下：
 *  function(center, { put,call,select,dispatch,getState }, currentMutation, actionType){
 *    //...args=action,{ put,call,select,dispatch,getState }
 *    return async function(...args){
 *      //这里可以处理put()
 *      //await put({type: 'loading',payload: true})
 *      await center(...args);
 *      //这里也可以处理put()
 *      //await put({type: 'loading',payload: false})
 *    }
 *  }
 * @param {object} options.extraReducers 而外的reducer
 * @param {function | array} options.extraCenters 而外的centers
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    centers: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
class ConvertMutationsObjects {
  constructor(mutations, options = {}) {
    this.mutations = mutations;
    this.options = this.getDefaultOptions(options);
    //所有唯一且合法的centers actionType，从mutations的centers中整合出来的。
    this.allCentersActionTypes = [];
    return this.convertMutationsObjects();
  }
  getDefaultOptions(options) {
    return {
      reducerEnhancer: originalReducer => (...args) => originalReducer(...args),
      centerEnhancer: center => (...args) => center(...args),
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
    let mutations = this.mutations;
    const { reducerEnhancer } = this.options;
    if (!Array.isArray(mutations)) {
      mutations = [mutations];
    }
    this.checkMutations(mutations);
    const reducersAndCenters = mutations.reduce(
      (reducersAndCenters, mutation) => {
        let { reducer, center } = this.convertMutationsObject(mutation);
        reducersAndCenters.reducers[mutation.namespace] = reducer;
        reducersAndCenters.centers.push(center);
        return reducersAndCenters;
      },
      {
        reducers: {},
        //跟redux-centers不一致，这里需要其他数据
        //{[namespace]: {center,mutation}}
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
   * 转换单个mutation结构
   * @param {object} mutation  结构如下
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
  convertMutationsObject(mutation) {
    const { centersAliasName = 'effects', ...otherOptions } = this.options;
    const namespace = mutation.namespace;
    const reducersObject = mutation.reducers || {};
    const centersObject = mutation.centers || mutation[centersAliasName] || {};

    return {
      reducer: (state, action) => {
        //兼容state，推荐使用initialState
        //初始化state
        let initialState = mutation.initialState;
        if (initialState === undefined) {
          initialState = mutation.state;
        }
        if (state === undefined) {
          state = initialState;
        }
        // console.log(action, initialState, state, namespace);
        //bind是为了后续覆盖reducers和centers的上下问题
        return this.recducersFunctionsToOneFunctionByAction(
          reducersObject,
          { namespace, mutation },
          { state, action }
        );
      },
      center: (action, centerUtils) => {
        checkActionType(action);
        return this.centerFunctionsToOneFunctionByAction(
          centersObject,
          { namespace, mutation, ...otherOptions },
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
    { namespace, mutation },
    { state, action }
  ) {
    for (let key in reducerObject) {
      const fn = reducerObject[key];
      if (typeof fn !== 'function') {
        //忽略非函数的属性
        continue;
      }
      //reducerObject和centerObject的namespace+SEPARATOR+函数名 === action.type
      if (action.type === this.getActionType(namespace, key)) {
        //转换的时候，绑定fn上下文为mutation
        return fn.bind(mutation)(state, action);
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
  centerFunctionsToOneFunctionByAction(
    centersObject,
    { namespace, mutation, generatorsToAsync, centerEnhancer },
    { action, centerUtils }
  ) {
    const put = this.createNewPut(centerUtils.put, namespace);
    const newCenterUtils = {
      ...centerUtils,
      put,
    };
    const enhancerPut = action => {
      if (!!~this.allCentersActionTypes.indexOf(action.type)) {
        throw new Error(
          `
            The centerEnhancer should not interact with centers.
            Because it will cause an infinite loop.
            The action type is "${action.type}".
          `
        );
      }
      return centerUtils.put(action);
    };
    if (typeof centersObject === 'function') {
      centersObject = centersObject(action, newCenterUtils);
    }
    for (let centerName in centersObject) {
      // console.log(key);
      const fn = centersObject[centerName];
      if (typeof fn !== 'function') {
        //忽略非函数的属性
        continue;
      }
      //reducerObject和centerObject的namespace+SEPARATOR+函数名 === action.type
      if (action.type === this.getActionType(namespace, centerName)) {
        //当前运行的centerName，put中需使用
        this.currentCenterName = centerName;
        let center;
        if (generatorsToAsync) {
          //转换的时候，绑定fn上下文为mutation
          center = generatorsToAsync(fn.bind(mutation))[0];
        } else {
          // 转换的时候，绑定fn上下文为mutation
          center = fn.bind(mutation);
        }
        return centerEnhancer(
          center,
          {
            ...newCenterUtils,
            put: enhancerPut,
          },
          mutation,
          action.type
        )(action, newCenterUtils);
      }
    }
    //center配置shouldRunReducer=false，就必须返回true
    //return true不影响shouldRunReducer=true，统一返回true；
    return true;
  }
  /**
   * 根据namespace和functionName获取actionType
   * @param {string} namespace mutation.namespace
   * @param {string} functionName mutation.reducers[functionName]
   * 或者 mutation.centers[functionName]
   */
  getActionType(namespace, functionName) {
    return `${namespace}${SEPARATOR}${functionName}`;
  }
  /**
   * @param {function} originalPut 原来的的center put参数
   * @param {string} namespace mutation命名空间
   */
  createNewPut(originalPut, namespace) {
    /**
     * promise版的dispatch，在当前的center中使用的时候，默认会加上nameapce + SEPARATOR
     * action.type = `${namespace}${SEPARATOR}${action.type}`
     * 这种模式先的action.type的结构如下：
     * namespace + SEPARATOR + mutation.centers.centerName
     * 其中mutation.centers.centerName ，不可以包含SEPARATOR
     * @param {object} action
     * @param {string} replaceNamespace mutation namespace，替换当前默认的namespace
     */
    return (action, replaceNamespace) => {
      checkActionType(action);
      const actionType = action.type;
      let lastNamespace = replaceNamespace || namespace;
      if (actionType.indexOf(`${namespace}${SEPARATOR}`) === 0) {
        console.warn(
          `
            When using "put", you can use function name without namespace.
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
        //mutation.reducers和mutation.centers的属性是不能包含`${SEPARATOR}`
        //actionType只是使用了mutation.centers[centerName]
        //或者mutation.recuers[reducerName]
        //那么就可以当做，是在当前的mutation进行内部put
        newType = `${lastNamespace}${SEPARATOR}${actionType}`;
      }
      return new Promise(resolve => {
        if (!!~action.type.indexOf(this.currentCenterName)) {
          throw new Error('Can not put to center itself.');
        }
        resolve(originalPut({ ...action, type: newType }));
      });
    };
  }

  /**
   * 检测mutation对象必填的字段
   * @param {string} mutation 参考下面convertMutationsObject的注释
   * @param {string | array} field 字段名，如果是数组，那么第一个默认使用的，其他的是别名
   */
  checkMutationField(mutation, field) {
    let defaultField = field;
    if (Array.isArray(field)) {
      defaultField = field[0];
      let tempField;
      field.forEach(f => {
        if (mutation[tempField] === undefined) {
          tempField = f;
        }
      });
      field = tempField;
    }
    if (mutation[field] === undefined) {
      throw new Error(`Expect mutation[${defaultField}] be defined.`);
    }
  }
  /**
   * 验证mutation类型是否为plain object
   * 验证namespace是否重复
   * 验证所有reducers和centers的属性名是否重复，重复则抛出异常
   * 验证reducer函数名和center函数名是否合法
   * @param {array} mutations
   */
  checkMutations(mutations) {
    //存放所有namepsace
    const allNamespace = {};
    mutations.forEach(mutation => {
      //存放所有当前mutation的reducers和centers的property
      const reducersCentersKeysFlag = {};
      if (!isPlainObject(mutation)) {
        throw new TypeError('Expect mutation to be an plain object.');
      }
      this.checkMutationField(mutation, 'namespace');
      this.checkMutationField(mutation, ['initialState', 'state']);
      if (allNamespace[mutation.namespace]) {
        throw new Error(`The namespace "${mutation.namespace}" is exited.`);
      } else {
        allNamespace[mutation.namespace] = true;
      }
      function throwRducersCentersError(field) {
        throw new Error(
          `Teh current mutation reducers[property] and centers[property] should be unique.\r\nThe namespace is "${
            mutation.namespace
          }".And the property is "${field}".`
        );
      }
      const reducers = mutation.reducers;
      for (let reducersKey in reducers) {
        if (!!~reducersKey.indexOf(SEPARATOR)) {
          throw new TypeError(
            `mutation.reducers["${reducersKey}"] can not contain "${SEPARATOR}"`
          );
        }
        reducersCentersKeysFlag[reducersKey] = true;
      }
      const centers = mutation.centers;
      for (let centersKey in centers) {
        if (!!~centersKey.indexOf(SEPARATOR)) {
          throw new TypeError(
            `mutation.centers["${centersKey}"] can not contain "${SEPARATOR}"`
          );
        }
        if (reducersCentersKeysFlag[centersKey]) {
          throwRducersCentersError(centersKey);
        } else {
          reducersCentersKeysFlag[centersKey] = true;
        }
        this.allCentersActionTypes.push(
          this.getActionType(mutation.namespace, centersKey)
        );
      }
    });
  }
}

export default function(...args) {
  return new ConvertMutationsObjects(...args);
}