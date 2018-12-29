import sinon from 'sinon';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

import { delay } from './helper/util';
import { configCreateStore, applyPlugin } from '../src';
import mutations, {
  delayTime,
  generatorMutation,
  generatorNamespace,
  replacedGeneratorMutation,
} from './helper/mutaions';
import loadingPlugin, { LOADINGFIELDNAME } from './helper/plugin/loading';
import testPlugin, { defaultState, reducerName } from './helper/plugin/test';
import errorPlugin from './helper/plugin/error';

describe('createStore', () => {
  it('uses generator accepting options as the second argument', async () => {
    const incrementSpy = sinon.spy(generatorMutation.reducers.increment);
    const incrementAsyncSpy = sinon.spy(
      generatorMutation.centers.increment_async
    );
    generatorMutation.reducers.increment = incrementSpy;
    generatorMutation.centers.increment_async = incrementAsyncSpy;
    mutations.generatorMutation = generatorMutation;
    const store = configCreateStore({
      generatorsToAsync,
    })(mutations);
    store.dispatch({ type: `${generatorNamespace}/increment_async` });
    await delay(delayTime + 20);
    expect(incrementSpy.callCount).toBe(1);
    expect(incrementAsyncSpy.callCount).toBe(1);
    expect(store.getState()[generatorNamespace]).toBe(1);
    // replaceMutations
    store.replaceMutations(replacedGeneratorMutation);
    store.dispatch({ type: `${generatorNamespace}/increment_async` });
    await delay(delayTime + 20);
    // prevState + 2
    expect(store.getState()[generatorNamespace]).toBe(1 + 2);
  });
  it('uses plugins accepting options as the third argument', async () => {
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    const reducerEnhancerSpy = sinon.spy(loadingPlugin.reducerEnhancer);
    loadingPlugin.reducerEnhancer = reducerEnhancerSpy;
    const testExtraReducerSpy = sinon.spy(
      testPlugin.extraReducers[reducerName]
    );
    testPlugin.extraReducers[reducerName] = testExtraReducerSpy;
    const extraCenterSpy = sinon.spy(testPlugin.extraCenters[0]);
    testPlugin.extraCenters[0] = extraCenterSpy;
    const store = configCreateStore(applyPlugin(loadingPlugin, testPlugin), {
      generatorsToAsync,
    })(mutations);
    store.dispatch({ type: `${generatorNamespace}/increment_async` });
    await delay(delayTime + 20);
    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(reducerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[generatorNamespace][LOADINGFIELDNAME]).toBe(false);
    expect(extraCenterSpy.callCount).toBeGreaterThan(1);
    expect(extraCenterSpy.callCount).toBeGreaterThan(1);
    expect(store.getState()[reducerName]).toBe(defaultState);
  });
  it('throws if using put inside the existing centers', async () => {
    const store = configCreateStore(applyPlugin(errorPlugin), {
      generatorsToAsync,
    })(mutations);
    // 异步的error，try catch不到
    const err = await store
      .dispatch({
        type: `${generatorNamespace}/increment_async`,
      })
      .catch(e => e);
    expect(err.message).toMatch(
      'You can only put to reducer in centerEhancer, otherwise it will cause an infinite loop'
    );
  });
  it('warns if using option with mutations(reducer mode)', () => {
    const stub = sinon.stub(console, 'warn');
    const reducerSpy = sinon.spy(function(state = 0) {
      return state;
    });
    configCreateStore({
      generatorsToAsync,
    })(reducerSpy);
    expect(stub.callCount).toBe(1);
    stub.restore();
  });
});
