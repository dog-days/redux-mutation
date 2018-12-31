/**
 * loading plugin 不像 redux-mutation 一样考虑 async 这些新语法转换后的代码量
 * 直接使用 @babel/runtime 处理, 代码逻辑会更直观
 * 跟 dva-loading 比较像，但是用法还是有区别的
 */

import { SEPARATOR } from 'redux-mutation';

export const LOADINGNAMESPACE = '$loading';

export default function createLoadingPlugin(options = {}) {
  const { namespace = LOADINGNAMESPACE } = options;
  const LOADINGSHOW = `${namespace}${SEPARATOR}show`;
  const LOADINGHIDE = `${namespace}${SEPARATOR}hide`;

  return {
    centerEnhancer: function(center, { put }, currentMutation, actionType) {
      const currentNamespace = currentMutation.namespace;

      return async (action, ...otherArgs) => {
        const { [namespace]: shouldDispatchLoading = true } = action;

        let result;

        // 只有开启了 loading 功能（默认开启）
        // 通过 dispatch( { type: 'xxx', [LOADINGNAMESPACE]: false })
        if (shouldDispatchLoading) {
          // loading 状态设置为 true
          await put({
            type: LOADINGSHOW,
            payload: {
              namespace: currentNamespace,
              loading: true,
            },
          });

          result = await center(action, ...otherArgs);

          // loading 状态设置为 false
          await put({
            type: LOADINGHIDE,
            payload: {
              namespace: currentNamespace,
              loading: false,
            },
          });
        } else {
          delete action[namespace];
          result = await center(action, ...otherArgs);
        }
        return result;
      };
    },
    extraReducers: {
      [namespace](state = {}, { type, payload }) {
        if (type === LOADINGSHOW || type === LOADINGHIDE) {
          return {
            [payload.namespace]: payload.loading,
          };
        } else {
          return state;
        }
      },
    },
  };
}
