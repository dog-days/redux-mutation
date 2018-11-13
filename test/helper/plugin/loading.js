import { SEPARATOR } from '../../../src';

let currentActionLoadingType;
let currentNamespace;
const STARTLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}start-loading`;
const ENDLOADINGNAMESPACESUFFIXNAME = `${SEPARATOR}end-loading`;
export const LOADINGFIELDNAME = '$loading';
export default {
  centerEnhancer: function(center, { put }, currentMutation, actionType) {
    return async (...args) => {
      currentNamespace = currentMutation.namespace;
      currentActionLoadingType = actionType + STARTLOADINGNAMESPACESUFFIXNAME;
      await put({
        type: currentActionLoadingType,
        payload: {
          [LOADINGFIELDNAME]: true,
        },
      });
      const result = await center(...args);
      // console.log(currentActionLoadingType, 111);
      //防止中途currentActionLoadingType和currentNamespace被其他dispatch覆盖。
      currentActionLoadingType = actionType + ENDLOADINGNAMESPACESUFFIXNAME;
      currentNamespace = currentMutation.namespace;
      // console.log(currentActionLoadingType, 222);
      await put({
        type: currentActionLoadingType,
        payload: {
          [LOADINGFIELDNAME]: false,
        },
      });
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
