import { namespace } from './couter-mutation-object';
export default {
  centerEnhancer: function(center, { put }) {
    return async (...args) => {
      await put({
        type: `${namespace}/test_async`,
      });
      console.log(...args);
      const result = await center(...args);
      return result;
    };
  },
};
