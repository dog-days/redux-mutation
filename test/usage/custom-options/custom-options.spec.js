import sinon from 'sinon';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

import { configCreateStore, applyPlugin } from '../../../src';
import loadingPlugin, { LOADINGFIELdNAME } from './loading-plugin';
import testPlugin, { defaultState, reducerName } from './test-plugin';

import counterMutationObject, {
  delayTime,
  namespace as counterNamspace,
} from './couter-mutation-object';

const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
loadingPlugin.centerEnhancer = centerEnhancerSpy;
const reducerEnhancerSpy = sinon.spy(loadingPlugin.reducerEnhancer);
loadingPlugin.reducerEnhancer = reducerEnhancerSpy;
const testExtraReducerSpy = sinon.spy(testPlugin.extraReducers[reducerName]);
testPlugin.extraReducers[reducerName] = testExtraReducerSpy;
const extraCentersSpy = sinon.spy(testPlugin.extraCenters);
testPlugin.extraCenters = extraCentersSpy;
const incrementSpy = sinon.spy(counterMutationObject.reducers.increment);
const incrementAsyncSpy = sinon.spy(
  counterMutationObject.centers.increment_async
);
counterMutationObject.reducers.increment = incrementSpy;
counterMutationObject.centers.increment_async = incrementAsyncSpy;

const store = configCreateStore(applyPlugin(loadingPlugin, testPlugin), {
  generatorsToAsync,
})(counterMutationObject);

describe('custom options usage', () => {
  it('should work correctly with generator', done => {
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
  it('should work correctly with centerEnhancer', () => {
    centerEnhancerSpy.callCount.should.equal(1);
  });
  it('should work correctly with reducerEnhancer', () => {
    reducerEnhancerSpy.callCount.should.equal(1);
    store.getState()[counterNamspace][LOADINGFIELdNAME].should.equal(false);
  });
  it('should work correctly with extraCenters', () => {
    extraCentersSpy.callCount.should.above(1);
  });
  it('should work correctly with extraReducers', () => {
    extraCentersSpy.callCount.should.above(1);
    store.getState()[reducerName].should.equal(defaultState);
  });
});
