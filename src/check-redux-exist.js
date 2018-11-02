/**
 * 检测redux是否存在，umd中需要
 * @param {any} reduxApi redux export api
 */
export default function checkReduxExist(reduxApi) {
  try {
    if (reduxApi) {
      //这里必须运行代码，否则打包会被移除。
      console.log();
    }
  } catch (e) {
    throw new Error(
      `
        Please use with redux,refering to https://github.com/reduxjs/redux.
        Umd usage
        <scrpit src="https://unpkg.com/redux/dist/redux.js"></scrpit>
        Es6 usage (not recommended)
        import redux from 'Redux';
        window.Redux = redux;
      `
    );
  }
}
