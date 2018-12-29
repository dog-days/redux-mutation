import { SEPARATOR } from 'redux-mutation';

let currentActionLoadingType;
let currentNamespace;
const STARTLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}start-loading`;
const ENDLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}end-loading`;
export const LOADINGFIELDNAME = '$loading';
export default {
  centerEnhancer: function(center, { put }, currentMutation, actionType) {
    return async (action, ...otherArgs) => {
      const { payload = {} } = action;
      const { [LOADINGFIELDNAME]: loading = true } = payload;
      let result;
      if (loading) {
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
