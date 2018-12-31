export const delayTime = 200;

// begin----counterMutation
export const counterNamespace = 'counter';
export const counterMutation = {
  namespace: counterNamespace,
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      return {
        ...state,
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

export default [counterMutation];
