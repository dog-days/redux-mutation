import isPlainObject from './utils/isPlainObject';
import compose from './compose';

function checkPlugins(plugins) {
  const pluginProperies = [
    'extraCenters',
    'extraReducers',
    'centerEnhancer',
    'reducerEnhancer',
  ];
  let allExtraReducers = {};
  plugins.forEach(plugin => {
    const {
      extraCenters = [],
      extraReducers = {},
      centerEnhancer = () => {},
      reducerEnhancer = () => {},
    } = plugin || {};
    if (!isPlainObject(plugin)) {
      throw new TypeError('Expect the plugin to be a plain object.');
    }
    if (!isPlainObject(extraReducers)) {
      throw new TypeError('Expect the extraReducers to be a plain object.');
    }
    if (!Array.isArray(extraCenters)) {
      throw new TypeError('Expect the extraCenters to be an array.');
    }
    if (typeof centerEnhancer !== 'function') {
      throw new TypeError('Expect the centerEnhancer to be a function.');
    }
    if (typeof reducerEnhancer !== 'function') {
      throw new TypeError('Expect the reducerEnhancer to be a function.');
    }
    for (let property in plugin) {
      if (!~pluginProperies.indexOf(property)) {
        throw new Error(
          `Expect the plugin to contain the allowed property(${pluginProperies}).`
        );
      }
    }
    for (let reducerKey in extraReducers) {
      if (allExtraReducers[reducerKey]) {
        throw new Error(
          `Expect the extraReducers key to be unique between plugins.`
        );
      }
    }
    allExtraReducers = { ...allExtraReducers, ...extraReducers };
  });
}
/**
 * 整合插件
 * @param {...object} plugins
 */
export default function applyPlugin(...plugins) {
  checkPlugins(plugins);
  let extraReducers = {};
  let extraCenters = [];
  const centerEnhancers = [];
  const reducerEnhancers = [];
  plugins.forEach(p => {
    p.centerEnhancer && centerEnhancers.push(p.centerEnhancer);
    p.reducerEnhancer && reducerEnhancers.push(p.reducerEnhancer);
    extraReducers = {
      ...extraReducers,
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
