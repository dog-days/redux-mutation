import sinon from 'sinon';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

import { configCreateStore } from '../../../src';

describe('custom options usage', () => {
  let store;
  let reducerSpy;
  it('should show warning when using option in only reducer mode', () => {
    const stub = sinon.stub(console, 'warn');
    reducerSpy = sinon.spy(function(state = 0) {
      return state;
    });
    store = configCreateStore({
      generatorsToAsync,
    })(reducerSpy);
    stub.callCount.should.equal(1);
    stub.restore();
  });
  it('should work correctly using reducer format', () => {
    const action = { type: '@@test' };
    const prevReducerCallCount = reducerSpy.callCount;
    store.dispatch(action);
    reducerSpy.callCount.should.equal(prevReducerCallCount + 1);
  });
});
