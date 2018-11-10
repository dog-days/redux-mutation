import sinon from 'sinon';
import { createStore } from '../../../src';

describe('function tpye of mutation object center', () => {
  it('should work correctly', done => {
    const reducerSpy = sinon.spy(function(state = 0) {
      return state;
    });
    let centerSpy;
    const mutations = [
      function() {
        return {
          namespace: 'test',
          initialState: null,
          reducers: {
            reducerSpy,
          },
          centers: (action, { put }) => ({
            centerSpy: (...args) => {
              centerSpy = sinon.spy(async function() {
                await put({ type: 'reducerSpy' });
              });
              centerSpy(...args);
            },
          }),
        };
      },
    ];
    const store = createStore(mutations);
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        centerSpy.callCount.should.equal(1);
        reducerSpy.callCount.should.equal(1);
        unsubscribe();
        done();
      }, 50);
    });
    store.dispatch({ type: 'test/centerSpy' });
  });
});
