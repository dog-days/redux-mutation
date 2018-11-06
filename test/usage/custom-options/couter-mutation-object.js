export const delayTime = 200;
export const namespace = 'counter';
export default {
  namespace,
  initialState: 0,
  reducers: {
    increment(state = 0, action) {
      return state + 1;
    },
  },
  centers: {
    *increment_async(action, { put, delay }) {
      yield delay(delayTime);
      yield put({ type: 'increment' });
    },
    *test_async() {
      /**测试会用到 **/
    },
  },
};
