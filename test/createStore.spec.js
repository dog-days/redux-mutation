import sinon from 'sinon';
import { delay } from './helper/util';
import { createStore, SEPARATOR } from '../src';
import reducer, { replacedReducer } from './helper/reducer';
import mutations, {
  counterMutation,
  replacedMutation,
  functionTypeNamespace,
  centersReducersFunctionTypeNamespace,
  delayTime,
  counterNamespace,
} from './helper/mutaions';

describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(mutations);
    const methods = Object.keys(store);
    expect(methods.length).toBe(6);
    expect(methods).toContain('subscribe');
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('replaceReducer');
    expect(methods).toContain('replaceReducerAndCenters');
    expect(methods).toContain('replaceMutations');
  });

  it('throws if the mutations is not an array or a function or a plain object', () => {
    const throwArgs =
      'Expect the mutations to be an array or a plain object or a function';
    expect(() => createStore()).toThrowError(throwArgs);
    expect(() => createStore('test')).toThrowError(throwArgs);
    expect(() => createStore(1)).toThrowError(throwArgs);
    expect(() => createStore(null)).toThrowError(throwArgs);
    expect(() => createStore(true)).toThrowError(throwArgs);
    //array
    expect(() => createStore(mutations)).not.toThrowError();
    //function
    expect(() => createStore(() => {})).not.toThrowError();
    //object
    expect(() => createStore(counterMutation)).not.toThrowError();
  });

  it('throws if using the replaceMutations not correctly', () => {
    const store = createStore(mutations);
    expect(() => store.replaceMutations()).toThrowError(
      'Expect the mutations to be an array or a plain object or a function'
    );
    expect(() => store.replaceMutations({})).toThrowError(
      'Expect the mutation namespace to be defined'
    );
    expect(() =>
      store.replaceMutations({ namespace: 'test' })
    ).not.toThrowError();
  });

  it('throws if the action type is not a string(mutation mode)', () => {
    //mutation模式做了限制
    const store = createStore(mutations);
    const throwArgs = ['Expect the action type to be a string'];
    expect(() => store.dispatch({ type: 0 })).toThrowError(...throwArgs);
    expect(() => store.dispatch({ type: true })).toThrowError(...throwArgs);
    expect(() => store.dispatch({ type: null })).toThrowError(...throwArgs);
    expect(() => store.dispatch({ type: {} })).toThrowError(...throwArgs);
    expect(() => store.dispatch({ type: 'test' })).not.toThrowError();
  });

  it('do not throws if action type is not a string(reducer mode)', () => {
    const store = createStore(state => state);
    expect(() => store.dispatch({ type: 0 })).not.toThrowError();
    expect(() => store.dispatch({ type: true })).not.toThrowError();
    expect(() => store.dispatch({ type: null })).not.toThrowError();
    expect(() => store.dispatch({ type: {} })).not.toThrowError();
    expect(() => store.dispatch({ type: 'test' })).not.toThrowError();
  });

  it('throws if using put not correctly', done => {
    const store = createStore(mutations);
    store
      .dispatch({ type: `${counterNamespace}/put_self_error_async` })
      .catch(e => {
        const flag = !!e.message.match('Can not put to center itself');
        //eslint-disable-next-line
        expect(flag).toBe(true);
        done();
      });
  });

  it('warns if using put to the current mutation reducer or center with prefix namespace ', async () => {
    const store = createStore(mutations);
    const stub = sinon.stub(console, 'warn');
    store.dispatch({ type: `${counterNamespace}/warning_async` });
    await delay(20);
    expect(stub.callCount).toBe(1);
    //还原
    stub.restore();
  });

  it('should put to specific reducer', async () => {
    //mutation is object
    let incrementSpy = sinon.spy(counterMutation.reducers.increment);
    let putAsyncSpy = sinon.spy(counterMutation.centers.put_async);
    counterMutation.reducers.increment = incrementSpy;
    counterMutation.centers.put_async = putAsyncSpy;
    let store = createStore(mutations);
    let prevValue = store.getState()[counterNamespace];
    expect(prevValue).toBe(0);
    store.dispatch({ type: `${counterNamespace}/put_async` });
    await delay(20);
    expect(incrementSpy.callCount).toBe(1);
    expect(putAsyncSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace]).toBe(prevValue + 1);

    //mutation is function
    prevValue = store.getState()[functionTypeNamespace];
    expect(prevValue).toBe(1);
    store.dispatch({ type: `${functionTypeNamespace}/put_async` });
    await delay(20);
    expect(store.getState()[functionTypeNamespace]).toBe(prevValue + 3);

    //mutation.centers mutation.reducers is function
    prevValue = store.getState()[centersReducersFunctionTypeNamespace];
    expect(prevValue).toBe(1);
    store.dispatch({
      type: `${centersReducersFunctionTypeNamespace}/put_async`,
    });
    await delay(20);
    const result = store.getState()[centersReducersFunctionTypeNamespace];
    expect(result).toBe(prevValue + 1);
  });

  it('should work with select function', async () => {
    const incrementSpy = sinon.spy(counterMutation.reducers.increment);
    const selectAsyncSpy = sinon.spy(async (action, { select, put }) => {
      let counter = await select(state => state[counterNamespace]);
      expect(counter).toBe(0);
      const state = await select();
      counter = state[counterNamespace];
      expect(counter).toBe(0);
      await put({ type: 'increment' });
    });
    counterMutation.reducers.increment = incrementSpy;
    counterMutation.centers.select_async = selectAsyncSpy;
    const store = createStore(mutations);
    const prevValue = store.getState()[counterNamespace];
    store.dispatch({ type: `${counterNamespace}/select_async` });
    await delay(20);
    expect(incrementSpy.callCount).toBe(1);
    expect(selectAsyncSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace]).toBe(prevValue + 1);
  });

  it(`should be delayed ${delayTime}ms`, async () => {
    const incrementSpy = sinon.spy(counterMutation.reducers.increment);
    const delayAsyncSpy = sinon.spy(counterMutation.centers.delay_async);
    counterMutation.reducers.increment = incrementSpy;
    counterMutation.centers.delay_async = delayAsyncSpy;
    const store = createStore(mutations);
    const prevValue = store.getState()[counterNamespace];
    store.dispatch({ type: `${counterNamespace}/delay_async` });
    await delay(delayTime + 20);
    expect(incrementSpy.callCount).toBe(1);
    expect(delayAsyncSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace]).toBe(prevValue + 1);
  });

  it('should replace the mutations', async () => {
    const store = createStore(mutations);
    //object
    store.replaceMutations(replacedMutation);
    store.dispatch({ type: `${counterNamespace}/put_async` });
    await delay(20);
    expect(store.getState()[counterNamespace]).toBe(3);
    //array
    store.replaceMutations([replacedMutation]);
    store.dispatch({ type: `${counterNamespace}/put_async` });
    await delay(20);
    expect(store.getState()[counterNamespace]).toBe(3 * 2);
    //array [function]
    store.replaceMutations([
      function() {
        return replacedMutation;
      },
    ]);
    store.dispatch({ type: `${counterNamespace}/put_async` });
    await delay(20);
    expect(store.getState()[counterNamespace]).toBe(3 * 3);
  });

  it('should work when mutations is a reducer', () => {
    const store = createStore(reducer);
    expect(store.getState()).toBe(0);
    store.dispatch({ type: 'increment' });
    //0 + 1
    expect(store.getState()).toBe(1);
    store.replaceMutations(replacedReducer);
    store.dispatch({ type: 'increment' });
    //1 + 3
    expect(store.getState()).toBe(4);
  });
});
