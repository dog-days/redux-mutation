import applyPlugin from '../src/applyPlugin';

describe('applyPlugin', () => {
  it('throws if plugin is not valid', () => {
    // plugin 类型错误
    const pluginTypeErrStr = 'Expect the plugin to be a plain object';
    expect(() => applyPlugin('a')).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin(1)).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin(null)).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin(undefined)).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin(true)).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin([])).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin(() => {})).toThrowError(pluginTypeErrStr);
    expect(() => applyPlugin()).not.toThrowError();
    expect(() => applyPlugin({})).not.toThrowError();
    // allowed property
    expect(() => applyPlugin({ test: 2 })).toThrowError(
      'Expect the plugin to contain the allowed property'
    );
    expect(() =>
      applyPlugin({
        extraCenters: [],
        extraReducers: {},
        centerEnhancer: () => {},
        reducerEnhancer: () => {},
      })
    ).not.toThrowError();
    // plugin extraReducers 类型错误
    const extraReducersErrStr = 'Expect the extraReducers to be a plain object';
    expect(() => applyPlugin({ extraReducers: 'a' })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: 1 })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: null })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: [] })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: true })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: () => {} })).toThrowError(
      extraReducersErrStr
    );
    expect(() => applyPlugin({ extraReducers: {} })).not.toThrowError();
    // plugin extraCenters 类型错误
    const extraCentersErrStr = 'Expect the extraCenters to be an array';
    expect(() => applyPlugin({ extraCenters: 'a' })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: 1 })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: null })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: {} })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: true })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: () => {} })).toThrowError(
      extraCentersErrStr
    );
    expect(() => applyPlugin({ extraCenters: [] })).not.toThrowError();
    // plugin centerEnhancer 类型错误
    const centerEnhancerErrStr = 'Expect the centerEnhancer to be a function';
    expect(() => applyPlugin({ centerEnhancer: 'a' })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => applyPlugin({ centerEnhancer: 1 })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => applyPlugin({ centerEnhancer: null })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => applyPlugin({ centerEnhancer: {} })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => applyPlugin({ centerEnhancer: true })).toThrowError(
      centerEnhancerErrStr
    );
    expect(() => applyPlugin({ centerEnhancer: [] })).toThrowError();
    expect(() => applyPlugin({ centerEnhancer: () => {} })).not.toThrowError();
    // plugin reducerEnhancer 类型错误
    const reducerEnhancerErrStr = 'Expect the reducerEnhancer to be a function';
    expect(() => applyPlugin({ reducerEnhancer: 'a' })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => applyPlugin({ reducerEnhancer: 1 })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => applyPlugin({ reducerEnhancer: null })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => applyPlugin({ reducerEnhancer: {} })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => applyPlugin({ reducerEnhancer: true })).toThrowError(
      reducerEnhancerErrStr
    );
    expect(() => applyPlugin({ reducerEnhancer: [] })).toThrowError();
    expect(() => applyPlugin({ reducerEnhancer: () => {} })).not.toThrowError();
    // 不同plugin extraReducers key值重复
    expect(() =>
      applyPlugin(
        { extraReducers: { test: () => {} } },
        { extraReducers: { test: () => {} } }
      )
    ).toThrowError('Expect the extraReducers key to be unique between plugins');
  });
  it('returns plain object', () => {
    let pluginObject;
    let extraReducers;
    let extraCenters;
    let centerEnhancerCounter = 0;
    let reducerEnhancerCounter = 0;
    const centerEnhancerOtherArgsSpy = [
      { put: () => {}, select: () => {}, delay: () => {}, call: () => {} },
      { namespace: '@@test' },
      { type: '@@test' },
    ];
    const originalCenterSpy = action => action;
    const originalReducerSpy = state => state;
    const action = { type: '@@action' };

    // plugins is undefined
    pluginObject = applyPlugin();
    expect(pluginObject.extraReducers).toEqual({});
    expect(pluginObject.extraCenters).toEqual([]);
    expect(pluginObject.reducerEnhancer(1)).toBe(1);
    expect(pluginObject.centerEnhancer(1)).toBe(1);
    // plugins is [{}]
    pluginObject = applyPlugin({});
    expect(pluginObject.extraReducers).toEqual({});
    expect(pluginObject.extraCenters).toEqual([]);
    expect(pluginObject.reducerEnhancer(originalReducerSpy)(1)).toBe(1);
    expect(pluginObject.centerEnhancer(originalCenterSpy)(1)).toBe(1);
    // plugins is [{...}]
    extraReducers = {
      reduerOne: () => {},
      reduerTwo: () => {},
    };
    extraCenters = [() => {}, () => {}];
    pluginObject = applyPlugin({
      extraReducers,
      extraCenters,
      reducerEnhancer: originalReducer => (...args) => {
        reducerEnhancerCounter++;
        return originalReducer(...args);
      },
      centerEnhancer: (originalCenter, ...otherArgs) => (...args) => {
        centerEnhancerCounter++;
        expect(otherArgs).toEqual(centerEnhancerOtherArgsSpy);
        return originalCenter(...args);
      },
    });
    expect(pluginObject.extraReducers).toEqual(extraReducers);
    expect(pluginObject.extraCenters).toEqual(extraCenters);
    expect(
      pluginObject.reducerEnhancer(originalReducerSpy)(action.type)
    ).toEqual(action.type);
    expect(
      pluginObject.centerEnhancer(
        originalCenterSpy,
        ...centerEnhancerOtherArgsSpy
      )(action)
    ).toEqual(action);
    expect(reducerEnhancerCounter).toBe(1);
    expect(centerEnhancerCounter).toBe(1);
    // plugins is [{...},{...},{...},{}]
    reducerEnhancerCounter = 0; // 重置counter
    centerEnhancerCounter = 0; // 重置counter
    const plugins = [
      {
        extraReducers: {
          reduerOne: () => {},
          reduerTwo: () => {},
        },
        extraCenters: [() => {}, () => {}],
        reducerEnhancer: originalReducer => (...args) => {
          reducerEnhancerCounter++;
          return originalReducer(...args);
        },
        centerEnhancer: (originalCenter, ...otherArgs) => (...args) => {
          centerEnhancerCounter++;
          expect(otherArgs).toEqual(centerEnhancerOtherArgsSpy);
          return originalCenter(...args);
        },
      },
      {
        extraCenters: [() => {}, () => {}],
        reducerEnhancer: originalReducer => (...args) => {
          reducerEnhancerCounter++;
          return originalReducer(...args);
        },
        centerEnhancer: (originalCenter, ...otherArgs) => (...args) => {
          centerEnhancerCounter++;
          expect(otherArgs).toEqual(centerEnhancerOtherArgsSpy);
          return originalCenter(...args);
        },
      },
      {
        extraReducers: {
          reduerThree: () => {},
        },
        reducerEnhancer: originalReducer => (...args) => {
          reducerEnhancerCounter++;
          return originalReducer(...args);
        },
        centerEnhancer: (originalCenter, ...otherArgs) => (...args) => {
          centerEnhancerCounter++;
          expect(otherArgs).toEqual(centerEnhancerOtherArgsSpy);
          return originalCenter(...args);
        },
      },
      {},
    ];
    pluginObject = applyPlugin(...plugins);
    expect(pluginObject.extraReducers).toEqual({
      ...plugins[0].extraReducers,
      ...plugins[1].extraReducers,
      ...plugins[2].extraReducers,
      ...plugins[3].extraReducers,
    });
    expect(pluginObject.extraCenters).toEqual([
      ...plugins[0].extraCenters,
      ...plugins[1].extraCenters,
    ]);
    expect(
      pluginObject.reducerEnhancer(originalReducerSpy)(action.type)
    ).toEqual(action.type);
    expect(
      pluginObject.centerEnhancer(
        originalCenterSpy,
        ...centerEnhancerOtherArgsSpy
      )(action)
    ).toEqual(action);
    expect(reducerEnhancerCounter).toBe(3);
    expect(centerEnhancerCounter).toBe(3);
  });
});
