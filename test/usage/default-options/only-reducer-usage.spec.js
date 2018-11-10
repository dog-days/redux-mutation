import sinon from 'sinon';
import { createStore } from '../../../src';

const reducerSpy = sinon.spy(function(state = 0, action) {
  return state;
});
const store = createStore(reducerSpy);

describe('usage of default options', () => {
  const prevReducerSpyCallCount = reducerSpy.callCount;
  it('should work correctly with the only reducer', done => {
    const unsubscribe = store.subscribe(() => {
      reducerSpy.callCount.should.equal(prevReducerSpyCallCount + 1);
      unsubscribe();
      done();
    });
    store.dispatch({ type: 'test' });
  });
  it('should work correctly with replaceMutations', done => {
    const reducerSpy = sinon.spy();
    store.replaceMutations(reducerSpy);
    const prevReducerSpyCallCount = reducerSpy.callCount;
    const unsubscribe = store.subscribe(() => {
      reducerSpy.callCount.should.equal(prevReducerSpyCallCount + 1);
      unsubscribe();
      done();
    });
    store.dispatch({ type: 'test' });
  });
});
