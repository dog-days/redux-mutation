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
 * 从右到左合成多个参数的函数
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
