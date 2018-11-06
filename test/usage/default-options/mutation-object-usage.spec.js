import sinon from 'sinon';
import { createStore } from '../../../src';

import counterMutationObject, {
  delayTime,
  namespace as counterNamspace,
} from './couter-mutation-object';

const incrementSpy = sinon.spy(counterMutationObject.reducers.increment);
const incrementAsyncSpy = sinon.spy(
  counterMutationObject.centers.increment_async
);
counterMutationObject.reducers.increment = incrementSpy;
counterMutationObject.centers.increment_async = incrementAsyncSpy;

const store = createStore(counterMutationObject);

describe('usage of default options', () => {
  it('should contain the apis of store', () => {
    // eslint-disable-next-line
    (!!store.replaceMutationObjects).should.be.true;
  });
  it('should work correctly with mutationObject', done => {
    //默认设置只要dispatch就会运行center和reducer
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        incrementSpy.callCount.should.equal(1);
        incrementAsyncSpy.callCount.should.equal(1);
        unsubscribe();
        done();
      }, delayTime + 50);
    });
    store.dispatch({ type: `${counterNamspace}/increment_async` });
  });
  it('should work correctly when using replaceMutationObjects', done => {
    const incrementSpy = sinon.spy(function(state = 0, action) {
      return state + 1;
    });
    const incrementAsyncSpy = sinon.spy(async function increment_async(
      action,
      { put }
    ) {
      await put({ type: 'increment' });
    });
    store.replaceMutationObjects({
      namespace: 'newOne',
      initialState: 0,
      reducers: {
        increment: incrementSpy,
        //也不会报错，不过会忽略
        test: 'dd',
      },
      centers: {
        increment_async: incrementAsyncSpy,
        //也不会报错，不过会忽略
        test2: 'dd',
      },
    });
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        incrementSpy.callCount.should.equal(1);
        incrementAsyncSpy.callCount.should.equal(1);
        unsubscribe();
        done();
      }, 50);
    });
    store.dispatch({ type: `newOne/increment_async` });
  });
  it('should show warning when put inside mutationObject using prefix namespace', done => {
    const stub = sinon.stub(console, 'warn');
    let clearSetTimeout;
    const unsubscribe = store.subscribe(() => {
      clearTimeout(clearSetTimeout);
      clearSetTimeout = setTimeout(() => {
        stub.callCount.should.equal(1);
        //还原
        stub.restore();
        unsubscribe();
        done();
      }, 50);
    });
    store.dispatch({ type: `${counterNamspace}/warning_async` });
  });

  it('should show warning when using replaceMutationObjects to replace existing mutationObject.', () => {
    const stub = sinon.stub(console, 'warn');
    store.replaceMutationObjects({
      namespace: 'newOne',
      initialState: null,
      centers: {},
      reducers: {},
    });
    stub.callCount.should.equal(1);
    stub.restore();
  });
  it('should throw error when using replaceMutationObjects without using plain object', done => {
    try {
      store.replaceMutationObjects();
    } catch (e) {
      done();
    }
  });

  it('should throw error when using replaceMutationObjects without using namespace', done => {
    try {
      store.replaceMutationObjects({
        initialState: null,
        centers: {},
        reducers: {},
      });
    } catch (e) {
      done();
    }
  });

  it('should throw error when using dispatch without using string of action type', done => {
    try {
      store.dispatch({ type: 0 });
    } catch (e) {
      done();
    }
  });
});
