export const delayTime = 200;
// begin----counterMutation
export const counterNamespace = 'counter';
export const counterMutation = {
  namespace: counterNamespace,
  initialState: 0,
  reducers: {
    increment(state, action) {
      return state + 1;
    },
  },
  centers: {
    async put_async(action, { put }) {
      await put({ type: 'increment' });
    },
    async delay_async(action, { put, delay }) {
      await delay(delayTime);
      await put({ type: 'increment' });
    },
    async warning_async(action, { put, delay }) {
      await put({ type: `${counterNamespace}/increment` });
    },
    async put_self_error_async(action, { put, delay }) {
      await put({ type: 'put_self_error_async' });
    },
    async the_same_center_name(action, { put, delay }) {
      await put({ type: 'differentNamespace/the_same_center_name' });
    },
  },
};
export const replacedMutation = {
  namespace: counterNamespace,
  // replaceMutations中initialState无效，可以不定义
  reducers: {
    increment(state) {
      return state + 3;
    },
  },
  centers: {
    async put_async(action, { put }) {
      await put({ type: 'increment' });
    },
  },
};

export const functionTypeNamespace = 'functionTypeNamespace';
export const functionTypeMutation = () => ({
  namespace: functionTypeNamespace,
  initialState: 1,
  reducers: {
    increment(state) {
      return state + 3;
    },
  },
  centers: {
    async put_async(action, { put }) {
      await put({ type: 'increment' });
    },
  },
});

export const centersReducersFunctionTypeNamespace =
  'centersReducersFunctionTypeNamespace';
export const centersReducersFunctionTypeMutation = {
  namespace: centersReducersFunctionTypeNamespace,
  initialState: 1,
  reducers: state => ({
    increment() {
      return state + 1;
    },
  }),
  centers: (action, { put }) => ({
    async put_async() {
      await put({ type: 'increment' });
    },
  }),
};

export const generatorNamespace = 'generatorNamespace';
export const generatorMutation = {
  namespace: generatorNamespace,
  initialState: 0,
  reducers: {
    increment(state) {
      return state + 1;
    },
  },
  centers: {
    *increment_async(action, { put, delay }) {
      yield delay(delayTime);
      yield put({ type: 'increment' });
    },
    test_async() {
      // error plugin中用到
    },
  },
};
export const replacedGeneratorMutation = {
  namespace: generatorNamespace,
  reducers: {
    increment(state) {
      return state + 2;
    },
  },
  centers: {
    *increment_async(action, { put, delay }) {
      yield delay(delayTime);
      yield put({ type: 'increment' });
    },
  },
};

// end---counterMutation
export default [
  counterMutation,
  functionTypeMutation,
  centersReducersFunctionTypeMutation,
  generatorMutation,
];
