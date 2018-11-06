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
    async increment_async(action, { put, delay }) {
      await delay(delayTime);
      //同一个mutation中，put可以省略namepace
      // await put({ type: 'counter/increment' });
      await put({ type: 'increment' });
    },
    async warning_async(action, { put, delay }) {
      await put({ type: `${namespace}/increment` });
    },
  },
};
