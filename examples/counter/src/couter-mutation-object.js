export const namespace = 'counter';
export default {
  namespace,
  initialState: 0,
  reducers: {
    increment(state = 0, action) {
      return state + 1;
    },
    increment_if_odd(state = 0, action) {
      return state % 2 !== 0 ? state + 1 : state;
    },
    decrement(state = 0, action) {
      return state - 1;
    },
  },
  centers: {
    async increment_async(action, { put, delay }) {
      await delay(1000);
      //同一个mutation中，put可以省略namepace
      // await put({ type: 'counter/increment' });
      await put({ type: 'increment' });
    },
  },
};
