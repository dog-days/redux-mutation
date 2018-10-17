import { combineReducers } from 'redux';

import isPlainObject from './utils/isPlainObject';
import { SEPARATOR } from './utils/const';

/**
 * 检测mutationObject对象必填的字段
 * @param {string} mutationObject 参考下面convertMutationsObject的注释
 * @param {string | array} field 字段名，如果是数组，那么第一个默认使用的，其他的是别名
 */
function checkMutationObjectField(mutationObject, field) {
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
      mutationObject or mutationObject() ${defaultField} must be defined.For example:
        function(){
          return {
            namespace: 'test',
            //initailState alias as state
            //state : {},
            initailState: 'state',
            reducers: {},
            centers: {}
          }
        }
      `
    );
  }
}
/**
 * mutationObject类型适配
 * @param {object | function} mutationObject
 * @return {object} mutationObject
 */
function mutationObjectAdapter(mutationObject) {
  if (typeof mutationObject === 'function') {
    //兼容函数返回plant object，是为了处理创建多个store时（互不相关的组件），起到变量保护作用
    //隔离作用域
    mutationObject = mutationObject();
  }
  if (!isPlainObject(mutationObject)) {
    throw new TypeError(
      'mutationObject or mutationObject() must be an plain object.'
    );
  }
  return mutationObject;
}

const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.');

/**
 * 转换多个mutationObject结构
 * namespace其实就是reducer名
 * @param {...function | ...object} mutationObjects
 *  [
 *    function(){
 *      return {
 *        namespace: 'test',
 *        //alias as state
 *        //state : {},
 *        initailState: {},
 *        reducers: {}
 *        centers: {}
 *      }
 *    },
 *    function(){
 *      return {
 *        namespace: 'test2',
 *        //alias as state
 *        //state : {},
 *        initailState: {},
 *        reducers: {}
 *        centers: {}
 *      }
 *    },
 *  ]
 *  或者
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
 * @param {function} combineCenters 请参考redux-center的combineCenters
 * @param {string} centersAliasName mutationObject.centers别名，兼容dva和redux-saga-model
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    centers: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
export default function convertMutationsObjects(
  mutationObjects,
  combineCenters,
  { centersAliasName }
) {
  if (!Array.isArray(mutationObjects)) {
    mutationObjects = [mutationObjects];
  }
  const reducersAndCenters = mutationObjects.reduce(
    function(reducersAndCenters, mutationObject) {
      mutationObject = mutationObjectAdapter(mutationObject);
      const namespace = mutationObject.namespace;
      let { reducer, center } = convertMutationsObject(
        mutationObject,
        combineCenters,
        { centersAliasName }
      );
      reducersAndCenters.reducer[namespace] = reducer;
      reducersAndCenters.centers.push(center);
      return reducersAndCenters;
    },
    {
      reducer: {
        //reducer为空的时候会提示错误，传递一个reducer
        //可以消除错误提示。
        [randomString()]: function() {
          return null;
        },
      },
      centers: [],
    }
  );
  return {
    reducer: combineReducers(reducersAndCenters.reducer),
    centers: reducersAndCenters.centers,
  };
}
/**
 * 转换单个mutationObject结构
 * @param {object | function} mutationObject  结构如下
 *  function(){
 *    return {
 *      namespace: 'test',
 *      //alias as state
 *      //state : {},
 *      initailState: {},
 *      reducers: {}
 *      centers: {}
 *    }
 *  }
 * @param {function} combineCenters 请参考redux-center的combineCenters
 * @param {string} centersAliasName mutationObject.centers别名，兼容dva和redux-saga-model
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    center: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
export function convertMutationsObject(
  mutationObject,
  combineCenters,
  { centersAliasName }
) {
  mutationObject = mutationObjectAdapter(mutationObject);
  if (combineCenters !== undefined && typeof combineCenters !== 'function') {
    throw new TypeError('combineCenters must be a function.');
  }
  const namespace = mutationObject.namespace;
  checkMutationObjectField(mutationObject, 'namespace');
  //兼容state，推荐使用initialState
  //初始化state
  let initialState = mutationObject.initialState;
  if (initialState === undefined) {
    initialState = mutationObject.state;
  }
  checkMutationObjectField(mutationObject, ['initialState', 'state']);
  const reducersObject = mutationObject.reducers || {};
  const centersObject =
    mutationObject.centers || mutationObject[centersAliasName] || {};

  return {
    reducer: (state, action) => {
      return obejctFunctionsToOneFunctionByAction(
        reducersObject,
        { namespace, initialState },
        { state, action }
      );
    },
    center: (action, centerUtils) => {
      return centerFunctionsToOneFunctionByAction(
        centersObject,
        { namespace, combineCenters },
        { action, centerUtils }
      );
    },
  };
}
/**
 * reducerObject转换为redux的reducer函数。
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
export function obejctFunctionsToOneFunctionByAction(
  reducerObject,
  { namespace, initialState },
  { state, action }
) {
  if (state === undefined) {
    state = initialState;
  }
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
      //匹配到直接终止
      return fn(state, action);
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
 * @param {string} namespace 命名空间，相当于reducer函数名
 * @param {function} combineCenters 请参考redux-center的combineCenters
 * @param {object} action redux action
 * @param {object} centerUtils redux-center的cener函数参数 {put,call,select,dispatch,getState}
 * @return undefined
 */
export function centerFunctionsToOneFunctionByAction(
  centersObject,
  { namespace, combineCenters },
  { action, centerUtils }
) {
  const put = createNewPut(centerUtils.put, namespace);
  for (let key in centersObject) {
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
      if (combineCenters) {
        //参数只有一个center函数。
        combineCenters(fn)[0](action, { ...centerUtils, put });
      } else {
        fn(action, { ...centerUtils, put });
      }
      //匹配到直接终止
      return;
    }
  }
  //允许默认redux的dispatch行为，详细请看redux-center
  //没有匹配到，必须返回
  return true;
}
/**
 * @param {function} originalPut 原来的的center put参数
 * @param {string} namespace mutationObject命名空间
 */
function createNewPut(originalPut, namespace) {
  /**
   * promise版的dispatch，在当前的center中使用的时候，默认会加上nameapce + SEPARATOR
   * action.type = `${namespace}${SEPARATOR}${action.type}`
   * 这种模式先的action.type的结构如下：
   * namespace + SEPARATOR + mutationObject.centers.centerName
   * 其中mutationObject.centers.centerName ，不可以包含SEPARATOR
   * @param {object} action
   * @param {string} replaceNamespace mutationObject namespace，替换当前默认的namespace
   */

  return function(action, replaceNamespace) {
    const actionType = action.type;
    if (typeof actionType !== 'string') {
      throw new TypeError('action.type must be a string.');
    }
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
