import sinon from 'sinon';
import { createStore } from '../../../src';

describe('function tpye of mutation object', () => {
  it('should work correctly', () => {
    const reducerSpy = sinon.spy(function(state = 0) {
      return state;
    });
    const mutations = [
      function() {
        return {
          namespace: 'test',
          initialState: null,
          reducers: {
            reducerSpy,
          },
        };
      },
    ];
    const store = createStore(mutations);
    const prevReducerCallCount = reducerSpy.callCount;
    store.dispatch({ type: 'test/reducerSpy' });
    reducerSpy.callCount.should.equal(prevReducerCallCount + 1);
  });
});