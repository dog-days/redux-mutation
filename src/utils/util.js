import isPlainObject from './isPlainObject';

/**
 * 检测action是否合法
 * @param {object} action
 * @return undefined
 */
export function checkActionType(action) {
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof action.type !== 'string'
  ) {
    throw new TypeError('Expect the action type to be a string.');
  }
}

/**
 * 是否为空对象
 * @param {obect} object
 */
export function isObjectEmpty(object) {
  if (process.env.NODE_ENV !== 'production' && !isPlainObject(object)) {
    throw new TypeError('Expect the object to be a plain object');
  }
  for (let key in object) {
    return false;
  }
  return true;
}
