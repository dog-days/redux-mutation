// 之所以要用函数包含mutation是为了隔离作用域
// 有些场景是要用到的。
/**
 * array[index]如果是函数，运行函数转成返回值，例如
 * [
 *  function(){
 *    return {namespace: "test"}
 *  }
 * ]
 * 转换成
 * [
 *  {namespace: "test"}
 * ]
 * @param {...any} functions 数组函数
 * @return {...object} 返回mutations 请看./convert-mutation-object.js注释
 */
export default function functionsToAnys(functions) {
  if (!Array.isArray(functions)) {
    functions = [functions];
  }
  return functions.map(f => {
    if (typeof f === 'function') {
      f = f();
    }
    return f;
  });
}
