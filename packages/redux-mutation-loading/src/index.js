/**
 * loading plugin 不像 redux-mutation 一样考虑 async 这些新语法转换后的代码量
 * 直接使用 @babel/runtime 处理, 代码逻辑会更直观
 */

import { SEPARATOR } from 'redux-mutation';

import isPlainObject from './utils/isPlainObject';

let currentActionLoadingType;
let currentNamespace;

const STARTLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}start-loading`;
const ENDLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}end-loading`;

export const LOADINGFIELDNAME = '$loading';

export default {
  centerEnhancer: function(center, { put }, currentMutation, actionType) {
    return async (action, ...otherArgs) => {
      const { initialState } = currentMutation;
      const { [LOADINGFIELDNAME]: loading = true } = action;
      let result;

      // 只有开启了 loading 功能（默认开启），而且 initialState 是 plain object
      // 才可以使用 loading。
      if (loading && isPlainObject(initialState)) {
        // 默认都会执行 loading 逻辑，可以手动关掉，如下：
        // dispatch( { type: 'xxx', payload: { [LOADINGFIELDNAME]: false } }
        // 有些请求还是没必要使用 loading-plugin 的。
        currentNamespace = currentMutation.namespace;
        currentActionLoadingType = actionType + STARTLOADINGNAMESPACESUFFIXNAME;
        await put({
          type: currentActionLoadingType,
          payload: {
            [LOADINGFIELDNAME]: true,
          },
        });
        result = await center(action, ...otherArgs);
        // console.log(currentActionLoadingType, 111);
        // 防止中途currentActionLoadingType和currentNamespace被其他dispatch覆盖。
        currentActionLoadingType = actionType + ENDLOADINGNAMESPACESUFFIXNAME;
        currentNamespace = currentMutation.namespace;
        // console.log(currentActionLoadingType, 222);
        await put({
          type: currentActionLoadingType,
          payload: {
            [LOADINGFIELDNAME]: false,
          },
        });
      } else {
        delete action[LOADINGFIELDNAME];
        result = await center(action, ...otherArgs);
      }
      return result;
    };
  },
  reducerEnhancer: function(originalReducer) {
    return (state, action) => {
      let newState = {};
      switch (action.type) {
        case currentActionLoadingType:
          newState[currentNamespace] = {
            ...state[currentNamespace],
            ...action.payload,
          };
          break;
        default:
      }
      return originalReducer({ ...state, ...newState }, action);
    };
  },
};
