/**
 * 可以参考 https://github.com/reduxjs/redux/blob/master/src/compose.js
 * 从右到左合成多个参数的函数，基于redux compose改造而来
 * 例如 compose(f, g, h) 合成如下面的
 * (firstArg,...otherArgs) => f(g(h(firstArg,...otherArgs),...otherArgs),...otherArgs).
 * 跟redux的compose区别在于，这里合并的函数是可以多个参数的，除了第一个参数一定是函数外，其他参数无限制。
 * 多参数compose可以兼容redux的单个参数compose
 * @param {...function} funcs 需要被合成的函数（arguments参数）
 * @returns {function} 从右到左把接收到的函数合成后的最终函数。
 */
export default function compose(...funcs) {
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
