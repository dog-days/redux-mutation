import isPlainObject from './isPlainObject';
/**
 * 随机字符串
 * @return {string} 返回随机字符串
 */
export function randomString() {
  return Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.');
}
/**
 * 检测action是否合法
 * @param {object} action
 * @return undefined
 */
export function checkActionType(action) {
  if (typeof action.type !== 'string') {
    throw new TypeError(
      `Expect action.type to be a string.But the action.type is ${action.type}.`
    );
  }
}

/**
 * 是否为空对象
 * @param {obect} object
 */
export function isObjectEmpty(object) {
  for (let key in object) {
    return false;
  }
  return true;
}
