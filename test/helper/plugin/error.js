import { generatorNamespace } from '../mutaions';
export default {
  centerEnhancer: function(center, { put }) {
    return async (...args) => {
      await put({
        type: `${generatorNamespace}/test_async`,
      });
      const result = await center(...args);
      return result;
    };
  },
};
