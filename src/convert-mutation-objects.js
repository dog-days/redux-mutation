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
function checkMutationObjectVariableType(mutationObject) {
  if (!isPlainObject(mutationObject)) {
    throw new TypeError('Expect mutationObject to be an plain object.');
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
 * 验证namespace是否重复
 * 验证所有reducers和centers的属性名是否重复，重复则抛出异常
 * @param {...object} mutationObjects
 */
function checkMutationObjects(mutationObjects) {
  //存放所有namepsace
  const allNamespace = {};
  //存放所有reducers和centers的property
  const allReducersCentersKey = {};
  mutationObjects.forEach(mutationObject => {
    checkMutationObjectVariableType(mutationObject);
    if (allNamespace[mutationObject.namespace]) {
      throw new Error(`The namespace "${mutationObject.namespace}" is exited.`);
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
 * @param {function} options.combineCenters 请参考redux-center的combineCenters
 * @param {string} options.centersAliasName mutationObject.centers别名，兼容dva和redux-saga-model
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    centers: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
export default function convertMutationsObjects(mutationObjects, options) {
  if (!Array.isArray(mutationObjects)) {
    mutationObjects = [mutationObjects];
  }
  checkMutationObjects(mutationObjects);
  const { centersAliasName, combineCenters } = options;
  const randomReducerKey = randomString();
  const reducersAndCenters = mutationObjects.reduce(
    function(reducersAndCenters, mutationObject) {
      if (reducersAndCenters.reducers[randomReducerKey]) {
        //reucers不为空对象时，删除默认的reducer
        delete reducersAndCenters.reducers[randomReducerKey];
      }
      const namespace = mutationObject.namespace;
      let { reducer, center } = convertMutationsObject(mutationObject, {
        centersAliasName,
        combineCenters,
      });
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
      centers: [],
    }
  );
  return {
    reducer: combineReducers(reducersAndCenters.reducers),
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
 * @param {function} options.combineCenters 请参考redux-center的combineCenters
 * @param {string} options.centersAliasName mutationObject.centers别名，兼容dva和redux-saga-model
 * @return {object} {reducer,centers} 结构如下
 *  {
 *    reducer: function(state,action){},
 *    center: function(action,{ put, call, select, dispatch, getState }){}
 *  }
 */
function convertMutationsObject(mutationObject, options) {
  checkMutationObjectVariableType(mutationObject);
  const { centersAliasName, combineCenters } = options;
  if (combineCenters !== undefined && typeof combineCenters !== 'function') {
    throw new TypeError('Expect combineCenters to be a function.');
  }
  const namespace = mutationObject.namespace;
  checkMutationObjectField(mutationObject, 'namespace');

  checkMutationObjectField(mutationObject, ['initialState', 'state']);
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
      return recducersFunctionsToOneFunctionByAction.bind(mutationObject)(
        reducersObject,
        { namespace },
        { state, action }
      );
    },
    center: (action, centerUtils) => {
      return centerFunctionsToOneFunctionByAction.bind(mutationObject)(
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
function recducersFunctionsToOneFunctionByAction(
  reducerObject,
  { namespace },
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
      //转换的时候，需要把fn上下文还原
      return fn.bind(this)(state, action);
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
function centerFunctionsToOneFunctionByAction(
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
      //转换的时候，需要把context上下文还原
      if (combineCenters) {
        //转换的时候，需要把fn上下文还原
        combineCenters(fn.bind(this))[0](action, {
          ...centerUtils,
          put,
        });
      } else {
        //转换的时候，需要把fn上下文还原
        fn.bind(this)(action, { ...centerUtils, put });
      }
    }
  }
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
      throw new TypeError('Expect action.type to be a string.');
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
