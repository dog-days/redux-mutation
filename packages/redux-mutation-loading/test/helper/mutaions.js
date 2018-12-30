export const delayTime = 200;

// begin----counterMutation
export const counterNamespace = 'counter';
export const counterMutation = {
  namespace: counterNamespace,
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      return {
        count: state.count + 1,
      };
    },
  },
  centers: {
    async increment_async(action, { put }) {
      await put({ type: 'increment' });
    },
  },
};
// end---counterMutation

// begin----noLoadingMutation
export const noLoadingNamespace = 'counter2';
export const noLoadingMutation = {
  namespace: noLoadingNamespace,
  // 非 plain obejct 是不会触发 loading 的
  initialState: 0,
  reducers: {
    increment(state) {
      return state + 1;
    },
  },
  centers: {
    async increment_async(action, { put }) {
      await put({ type: 'increment' });
    },
  },
};
// end---noLoadingMutation

export default [counterMutation, noLoadingMutation];
