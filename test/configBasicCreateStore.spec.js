import sinon from 'sinon';

import { delay } from './helper/util';
import { applyMiddleware } from '../src';
import configBasicCreateStore from '../src/configBasicCreateStore';
import reducer, { replacedReducer } from './helper/reducer';
import center, { replacedCenter } from './helper/center';

const createStore = configBasicCreateStore();

describe('configBasicCreateStore', () => {
  it('throws if the reducerAndCenters is not a plain object or a function', () => {
    const errString =
      'Expect the reducerAndCenters to be a plain object or a function';
    // createStore
    expect(() => createStore()).toThrowError(errString);
    expect(() => createStore('a')).toThrowError(errString);
    expect(() => createStore(1)).toThrowError(errString);
    expect(() => createStore(null)).toThrowError(errString);
    expect(() => createStore([])).toThrowError(errString);
    expect(() => createStore({})).toThrowError(
      'Expected the reducer to be a function'
    );
    expect(() => createStore({ reducer })).not.toThrowError();
    expect(() => createStore({ reducer, centers: center })).not.toThrowError();
    expect(() =>
      createStore({ reducer, centers: [center] })
    ).not.toThrowError();
    expect(() => createStore(reducer)).not.toThrowError();

    // replaceReducerAndCenters
    const store = createStore({ reducer, centers: [center] });
    expect(() => store.replaceReducerAndCenters()).toThrowError(errString);
    expect(() => store.replaceReducerAndCenters('a')).toThrowError(errString);
    expect(() => store.replaceReducerAndCenters(1)).toThrowError(errString);
    expect(() => store.replaceReducerAndCenters(null)).toThrowError(errString);
    expect(() => store.replaceReducerAndCenters([])).toThrowError(errString);
    expect(() => store.replaceReducerAndCenters({})).toThrowError(
      'Expected the nextReducer to be a function'
    );
    expect(() =>
      store.replaceReducerAndCenters({ reducer })
    ).not.toThrowError();
  });

  it('should put to specific reducer', async () => {
    const reducerSpy = sinon.spy(reducer);
    const centerSpy = sinon.spy(center);
    const store = createStore({ reducer: reducerSpy, centers: [centerSpy] });
    const prevReducerSpyCallCount = reducerSpy.callCount;
    const prevCenterSpyCallCount = centerSpy.callCount;
    store.dispatch({ type: '@@test' });
    await delay(20);
    expect(reducerSpy.callCount).toBe(prevReducerSpyCallCount + 2);
    expect(centerSpy.callCount).toBe(prevCenterSpyCallCount + 2);
    expect(store.getState()).toBe(1);
  });
  it('should replace the reducer and center ', async () => {
    const store = createStore({ reducer, centers: [center] });
    store.replaceReducerAndCenters({
      reducer: replacedReducer,
      centers: replacedCenter,
    });
    store.dispatch({ type: '@@test' });
    await delay(20);
    expect(store.getState()).toBe(-3);
  });
  it('should work when reducerAndCenters is a reducer', () => {
    const store = createStore(reducer);
    store.dispatch({ type: 'increment' });
    expect(store.getState()).toBe(1);
    store.replaceReducerAndCenters(replacedReducer);
    store.dispatch({ type: 'increment' });
    // prevState + 3
    expect(store.getState()).toBe(4);
  });
  it('accepts preloadedState as the second argument', () => {
    const store = createStore({ reducer: reducer, centers: [center] }, 10);
    expect(store.getState()).toBe(10);
  });
  it('accepts enhancer as the second argument if initial state is missing', () => {
    const action = { type: 'increment' };
    const spyMiddleware = () => next => action => {
      expect(action).toEqual(action);
      return next(action);
    };
    // only redcuer
    let store = createStore(reducer, applyMiddleware(spyMiddleware));
    store.dispatch(action);
    expect(store.getState()).toBe(1);
    // reducerAndCenters
    store = createStore(
      { reducer, centers: [center] },
      applyMiddleware(spyMiddleware)
    );
    store.dispatch(action);
    expect(store.getState()).toBe(1);
  });
  it('accepts enhancer as the third argument', async () => {
    const initialState = 3;
    const action = { type: 'increment' };
    const spyMiddleware = () => next => action => {
      expect(action).toEqual(action);
      return next(action);
    };
    // only redcuer
    let store = createStore(
      reducer,
      initialState,
      applyMiddleware(spyMiddleware)
    );
    store.dispatch(action);
    expect(store.getState()).toBe(initialState + 1);
    // reducerAndCenters
    store = createStore(
      { reducer, centers: [center] },
      initialState,
      applyMiddleware(spyMiddleware)
    );
    store.dispatch(action);
    expect(store.getState()).toBe(initialState + 1);
  });
});
