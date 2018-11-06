import sinon from 'sinon';
import loggerMiddleware from 'redux-logger';
import { createStore, applyMiddleware } from '../../src/basic';

function reducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      break;
    default:
  }
  return state;
}
async function center(action, { put }) {
  switch (action.type) {
    case '@@test':
      await put({ type: 'INCREMENT' });
      break;
    default:
  }
}
const reducerSpy = sinon.spy(reducer);
const centerSpy = sinon.spy(center);
const store = createStore({ reducer: reducerSpy, centers: centerSpy });

describe('usage of default options', () => {
  it('should work correctly with basic style', done => {
    const prevReducerSpyCallCount = reducerSpy.callCount;
    const prevCenterSpyCallCount = centerSpy.callCount;
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        reducerSpy.callCount.should.equal(prevReducerSpyCallCount + 2);
        centerSpy.callCount.should.equal(prevCenterSpyCallCount + 2);
        unsubscribe();
        done();
      }, 100);
    });
    store.dispatch({ type: '@@test' });
  });
  it('should work correctly with replaceReducerAndCenters', done => {
    const reducerSpy = sinon.spy(reducer);
    const centerSpy = sinon.spy(center);
    store.replaceReducerAndCenters({ reducer: reducerSpy, centers: centerSpy });
    const prevReducerSpyCallCount = reducerSpy.callCount;
    const prevCenterSpyCallCount = centerSpy.callCount;
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        reducerSpy.callCount.should.equal(prevReducerSpyCallCount + 2);
        centerSpy.callCount.should.equal(prevCenterSpyCallCount + 2);
        unsubscribe();
        done();
      }, 50);
    });
    store.dispatch({ type: '@@test' });
  });
  it('should work correctly with the only reducer', () => {
    createStore(reducerSpy);
  });
  it('should work correctly with then param enhancer', () => {
    createStore(
      { reducer: reducerSpy, centers: centerSpy },
      applyMiddleware(loggerMiddleware)
    );
  });
  it('should work correctly with then param preloadedState', () => {
    const store = createStore(
      { reducer: reducerSpy, centers: centerSpy },
      10,
      applyMiddleware(loggerMiddleware)
    );
    store.getState().should.equal(10);
  });
  it('should throw error when reducerAndCenters is not a plain object or a function', done => {
    try {
      createStore();
    } catch (e) {
      done();
    }
  });
});
