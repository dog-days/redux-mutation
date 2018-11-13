export const defaultState = '@@test';
export const reducerName = 'testExtraReducer';
export default {
  centerEnhancer: function(center) {
    return async (...args) => {
      const result = await center(...args);
      return result;
    };
  },
  extraCenters: [function() {}],
  extraReducers: {
    [reducerName](state = defaultState) {
      return state;
    },
  },
};
