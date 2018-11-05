import { compose } from 'redux';

/**
 * 整合插件
 * @param {...object} plugins
 */
export default function applyPlugin(...plugins) {
  let extraReducers = {};
  let extraCenters = [];
  const centerEnhancers = [];
  const reducerEnhancers = [];
  plugins.forEach(p => {
    p.centerEnhancer && centerEnhancers.push(p.centerEnhancer);
    p.reducerEnhancer && reducerEnhancers.push(p.reducerEnhancer);
    extraReducers = {
      ...p.extraReducers,
    };
    if (p.extraCenters) {
      extraCenters = extraCenters.concat(p.extraCenters);
    }
  });
  return {
    extraReducers,
    extraCenters,
    reducerEnhancer: compose(...reducerEnhancers),
    centerEnhancer: compose(...centerEnhancers),
  };
}
