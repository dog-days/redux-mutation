/**
 * setTimeout promise用法
 * @param { numnber } ms 毫秒
 * @return { promise } resolve(ms)
 */
export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}
