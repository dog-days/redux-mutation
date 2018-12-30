import sinon from 'sinon';
import { configCreateStore, applyPlugin } from 'redux-mutation';

import loadingPlugin, { LOADINGFIELDNAME } from '../src/index';
import { delay } from './helper/util';
import mutations, {
  delayTime,
  counterNamespace,
  noLoadingNamespace,
} from './helper/mutaions';

describe('redux-loading-plugin', () => {
  it(`will dispatch the loading reducer without setting payload[${LOADINGFIELDNAME}] to false.`, async () => {
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    const reducerEnhancerSpy = sinon.spy(loadingPlugin.reducerEnhancer);
    loadingPlugin.reducerEnhancer = reducerEnhancerSpy;

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    store.dispatch({ type: `${counterNamespace}/increment_async` });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(reducerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace][LOADINGFIELDNAME]).toBe(false);
    expect(store.getState()[counterNamespace].count).toBe(1);
  });

  it(`will not dispatch the loading reducer by setting payload[${LOADINGFIELDNAME}] to false.`, async () => {
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    const reducerEnhancerSpy = sinon.spy(loadingPlugin.reducerEnhancer);
    loadingPlugin.reducerEnhancer = reducerEnhancerSpy;

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    store.dispatch({
      type: `${counterNamespace}/increment_async`,
      [LOADINGFIELDNAME]: false,
    });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(reducerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace][LOADINGFIELDNAME]).toBe(
      undefined
    );
    expect(store.getState()[counterNamespace].count).toBe(1);
  });

  it(`will not dispatch the loading reducer when mutaion initialState is not a plain object.`, async () => {
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    const reducerEnhancerSpy = sinon.spy(loadingPlugin.reducerEnhancer);
    loadingPlugin.reducerEnhancer = reducerEnhancerSpy;

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    store.dispatch({ type: `${noLoadingNamespace}/increment_async` });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(reducerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[noLoadingNamespace][LOADINGFIELDNAME]).toBe(
      undefined
    );
    expect(store.getState()[noLoadingNamespace]).toBe(1);
  });
});
