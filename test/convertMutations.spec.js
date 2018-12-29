import convertMutations from '../src/convertMutations';
import { SEPARATOR } from '../src/utils/const';

describe('convertMutations', () => {
  it('throws if using the mutations not correctly', () => {
    // mutations type
    const mutationsTypeStr = 'Expect the mutations to be an array';
    expect(() => convertMutations()).toThrowError(mutationsTypeStr);
    expect(() => convertMutations('test')).toThrowError(mutationsTypeStr);
    expect(() => convertMutations(1)).toThrowError(mutationsTypeStr);
    expect(() => convertMutations(null)).toThrowError(mutationsTypeStr);
    expect(() => convertMutations(true)).toThrowError(mutationsTypeStr);
    expect(() => convertMutations({})).toThrowError(mutationsTypeStr);
    expect(() => convertMutations(() => {})).toThrowError(mutationsTypeStr);
    // mutation type
    const mutationTypeStr = 'Expect the mutation to be a plain object';
    expect(() => convertMutations(['test'])).toThrowError(mutationTypeStr);
    expect(() => convertMutations([1])).toThrowError(mutationTypeStr);
    expect(() => convertMutations([null])).toThrowError(mutationTypeStr);
    expect(() => convertMutations([true])).toThrowError(mutationTypeStr);
    expect(() => convertMutations([() => {}])).toThrowError(mutationTypeStr);
    expect(() => convertMutations([])).not.toThrowError();
    expect(() =>
      convertMutations([{ namespace: 'test', initialState: null }])
    ).not.toThrowError();
    // namespace err
    const namespaceErrString = 'Expect the namespace to be a string';
    expect(() => convertMutations([{}])).toThrowError(namespaceErrString);
    expect(() => convertMutations([{ initialState: 'test' }])).toThrowError(
      namespaceErrString
    );
    expect(() => convertMutations([{ state: 'test' }])).toThrowError(
      namespaceErrString
    );

    expect(() => convertMutations([{ namespace: 'test' }])).toThrowError(
      'Expect the initialState or state to be defined'
    );

    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          initialState: 'test',
          centers: {
            test: function() {},
          },
          reducers: {
            test: function() {},
          },
        },
      ])
    ).toThrowError(
      /The current mutation reducers\.(.*) and centers\.(.*) should be unique/
    );

    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          initialState: 'test',
        },
        {
          namespace: 'test',
          initialState: 'test',
        },
      ])
    ).toThrowError('Expect the namespace to be unique');

    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          initialState: 'test',
          reducers: {
            [`${SEPARATOR}test`]: () => {},
          },
        },
      ])
    ).toThrowError(
      `mutation.reducers["${SEPARATOR}test"] can not contain "${SEPARATOR}"`
    );

    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          initialState: 'test',
          centers: {
            [`${SEPARATOR}test`]: () => {},
          },
        },
      ])
    ).toThrowError(
      `mutation.centers["${SEPARATOR}test"] can not contain "${SEPARATOR}"`
    );

    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: 'dd',
        },
      ])
    ).toThrowError('Expect the centers to be a plain object');

    const reducersErrArgs = ['Expect the reducers to be a plain object'];
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: 'dd',
        },
      ])
    ).toThrowError(...reducersErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: true,
        },
      ])
    ).toThrowError(...reducersErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: 0,
        },
      ])
    ).toThrowError(...reducersErrArgs);

    const reducerTypeErrArgs = ['Expect the reducer to be a function'];
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: { test: null },
        },
      ])
    ).toThrowError(...reducerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: { test: 1 },
        },
      ])
    ).toThrowError(...reducerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: { test: true },
        },
      ])
    ).toThrowError(...reducerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers: { test: 'test' },
        },
      ])
    ).toThrowError(...reducerTypeErrArgs);

    const centerTypeErrArgs = ['Expect the center to be a function'];
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: { test: null },
        },
      ])
    ).toThrowError(...centerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: { test: 1 },
        },
      ])
    ).toThrowError(...centerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: { test: true },
        },
      ])
    ).toThrowError(...centerTypeErrArgs);
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: { test: 'test' },
        },
      ])
    ).toThrowError(...centerTypeErrArgs);

    expect(() => convertMutations([])).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers() {},
        },
      ])
    ).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          reducers() {},
        },
      ])
    ).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          initialState: 'test',
        },
      ])
    ).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
        },
      ])
    ).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
        },
        {
          namespace: 'test2',
          state: 'test',
        },
      ])
    ).not.toThrowError();
    expect(() =>
      convertMutations([
        {
          namespace: 'test',
          state: 'test',
          centers: () => {},
          reducers: () => {},
        },
        {
          namespace: 'test2',
          state: 'test',
          centers: {
            center: () => {},
          },
          reducers: {
            reducer: () => {},
          },
        },
      ])
    ).not.toThrowError();
  });
  it('throws if using the options not correctly', () => {
    // options extraReducers 类型错误
    const extraReducersErrStr = 'Expect the extraReducers to be a plain object';
    expect(() => convertMutations([], { extraReducers: 'a' })).toThrowError(
      extraReducersErrStr
    );
    expect(() => convertMutations([], { extraReducers: 1 })).toThrowError(
      extraReducersErrStr
    );
    expect(() => convertMutations([], { extraReducers: null })).toThrowError(
      extraReducersErrStr
    );
    expect(() => convertMutations([], { extraReducers: [] })).toThrowError(
      extraReducersErrStr
    );
    expect(() => convertMutations([], { extraReducers: true })).toThrowError(
      extraReducersErrStr
    );
    expect(() =>
      convertMutations([], { extraReducers: () => {} })
    ).toThrowError(extraReducersErrStr);
    expect(() =>
      convertMutations([], { extraReducers: {} })
    ).not.toThrowError();
    // options extraCenters 类型错误
    const extraCentersErrStr = 'Expect the extraCenters to be an array';
    expect(() => convertMutations([], { extraCenters: 'a' })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: 1 })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: null })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: {} })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: true })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: () => {} })).toThrowError(
      extraCentersErrStr
    );
    expect(() => convertMutations([], { extraCenters: [] })).not.toThrowError();
    // options centerEnhancer 类型错误
    const centerEnhancerErrStr = 'Expect the centerEnhancer to be a function';
    expect(() => convertMutations([], { centerEnhancer: 'a' })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => convertMutations([], { centerEnhancer: 1 })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => convertMutations([], { centerEnhancer: null })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => convertMutations([], { centerEnhancer: {} })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => convertMutations([], { centerEnhancer: true })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => convertMutations([], { centerEnhancer: [] })).toThrowError();
    expect(() =>
      convertMutations([], { centerEnhancer: () => {} })
    ).not.toThrowError();
    // options reducerEnhancer 类型错误
    const reducerEnhancerErrStr = 'Expect the reducerEnhancer to be a function';
    expect(() => convertMutations([], { reducerEnhancer: 'a' })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => convertMutations([], { reducerEnhancer: 1 })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => convertMutations([], { reducerEnhancer: null })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => convertMutations([], { reducerEnhancer: {} })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => convertMutations([], { reducerEnhancer: true })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => convertMutations([], { reducerEnhancer: [] })).toThrowError();
    expect(() =>
      convertMutations([], { reducerEnhancer: () => {} })
    ).not.toThrowError();
    // options generatorsToAsync 类型错误
    const generatorsToAsyncErrStr =
      'Expect the generatorsToAsync to be a function';
    expect(() => convertMutations([], { generatorsToAsync: 'a' })).toThrowError(
      generatorsToAsyncErrStr
    );
    expect(() => convertMutations([], { generatorsToAsync: 1 })).toThrowError(
      generatorsToAsyncErrStr
    );
    expect(() =>
      convertMutations([], { generatorsToAsync: null })
    ).toThrowError(generatorsToAsyncErrStr);
    expect(() => convertMutations([], { generatorsToAsync: {} })).toThrowError(
      generatorsToAsyncErrStr
    );
    expect(() =>
      convertMutations([], { generatorsToAsync: true })
    ).toThrowError(generatorsToAsyncErrStr);
    expect(() =>
      convertMutations([], { generatorsToAsync: [] })
    ).toThrowError();
    expect(() =>
      convertMutations([], { generatorsToAsync: () => {} })
    ).not.toThrowError();
    // options centersAliasName 类型错误
    const centersAliasNameErrStr = 'Expect the centersAliasName to be a string';
    expect(() =>
      convertMutations([], { centersAliasName: () => {} })
    ).toThrowError(centersAliasNameErrStr);
    expect(() => convertMutations([], { centersAliasName: 1 })).toThrowError(
      centersAliasNameErrStr
    );
    expect(() => convertMutations([], { centersAliasName: null })).toThrowError(
      centersAliasNameErrStr
    );
    expect(() => convertMutations([], { centersAliasName: {} })).toThrowError(
      centersAliasNameErrStr
    );
    expect(() => convertMutations([], { centersAliasName: true })).toThrowError(
      centersAliasNameErrStr
    );
    expect(() => convertMutations([], { centersAliasName: [] })).toThrowError();
    expect(() =>
      convertMutations([], { centersAliasName: 'test' })
    ).not.toThrowError();
  });
  it('returns the plain object', () => {
    const { reducer, centers } = convertMutations(
      [
        { namespace: 'test', initialState: null },
        { namespace: 'test2', initialState: null },
      ],
      {
        centersAliasName: 'test',
      }
    );
    expect(typeof reducer).toBe('function');
    expect(Array.isArray(centers)).toBe(true);
    expect(centers.length).toBe(2);
  });
});
