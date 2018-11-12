import isPlainObject from './utils/isPlainObject';

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
/**
 * 从右到左合成多个参数的函数，基于redux compose改造而来
 * 例如 compose(f, g, h) 合成如下面的
 * (firstArg,...otherArgs) => f(g(h(firstArg,...otherArgs),...otherArgs),...otherArgs).
 * 跟redux的compose区别在于，这里合并的函数是可以多个参数的，除了第一个参数一定是函数外，其他参数无限制。
 * @param {...function} funcs 需要被合成的函数（arguments参数）
 * @returns {function} 从右到左把接收到的函数合成后的最终函数。
 */
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (firstArg, ...otherArgs) =>
    a(b(firstArg, ...otherArgs), ...otherArgs)
  );
}
