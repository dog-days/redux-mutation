import sinon from 'sinon';
import { configCreateStore, applyPlugin } from 'redux-mutation';

import createLoadingPlugin, { LOADINGNAMESPACE } from '../src/index';
import { delay } from './helper/util';
import mutations, { delayTime, counterNamespace } from './helper/mutaions';

describe('redux-loading-plugin', () => {
  it(`will dispatch the loading reducer without setting action[${LOADINGNAMESPACE}] to false.`, async () => {
    const loadingPlugin = createLoadingPlugin();
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    const extraLoadingReducerSpy = sinon.spy(
      loadingPlugin.extraReducers[LOADINGNAMESPACE]
    );

    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    loadingPlugin.extraReducers = {
      [LOADINGNAMESPACE]: extraLoadingReducerSpy,
    };

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    await delay(200);

    let subscribeCounter = 0;
    store.subscribe(() => {
      const loadingState = store.getState()[LOADINGNAMESPACE][counterNamespace];
      switch (subscribeCounter) {
        case 0:
          expect(loadingState).toBe(undefined);
          break;
        case 1:
          expect(loadingState).toBe(true);
          break;
        case 2:
          expect(loadingState).toBe(true);
          break;
        case 3:
          expect(loadingState).toBe(false);
          break;
        default:
      }
      subscribeCounter++;
    });

    store.dispatch({ type: `${counterNamespace}/increment_async` });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace].count).toBe(1);
  });

  it(`will not dispatch the loading reducer while setting action[${LOADINGNAMESPACE}] to false.`, async () => {
    const loadingPlugin = createLoadingPlugin();
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    const extraLoadingReducerSpy = sinon.spy(
      loadingPlugin.extraReducers[LOADINGNAMESPACE]
    );

    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    loadingPlugin.extraReducers = {
      [LOADINGNAMESPACE]: extraLoadingReducerSpy,
    };

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    await delay(200);

    let subscribeCounter = 0;
    store.subscribe(() => {
      const loadingState = store.getState()[LOADINGNAMESPACE][counterNamespace];
      switch (subscribeCounter) {
        case 0:
          expect(loadingState).toBe(undefined);
          break;
        case 1:
          expect(loadingState).toBe(undefined);
          break;
        default:
      }
      subscribeCounter++;
    });

    store.dispatch({
      type: `${counterNamespace}/increment_async`,
      [LOADINGNAMESPACE]: false,
    });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace].count).toBe(1);
  });

  it(`will dispatch the loading reducer with custom options.`, async () => {
    const customLoadingNamespace = '__loading__';
    const loadingPlugin = createLoadingPlugin({
      namespace: customLoadingNamespace,
    });
    const centerEnhancerSpy = sinon.spy(loadingPlugin.centerEnhancer);
    const extraLoadingReducerSpy = sinon.spy(
      loadingPlugin.extraReducers[customLoadingNamespace]
    );

    loadingPlugin.centerEnhancer = centerEnhancerSpy;
    loadingPlugin.extraReducers = {
      [customLoadingNamespace]: extraLoadingReducerSpy,
    };

    const store = configCreateStore(applyPlugin(loadingPlugin))(mutations);

    await delay(200);

    let subscribeCounter = 0;
    store.subscribe(() => {
      const loadingState = store.getState()[customLoadingNamespace][
        counterNamespace
      ];
      switch (subscribeCounter) {
        case 0:
          expect(loadingState).toBe(undefined);
          break;
        case 1:
          expect(loadingState).toBe(true);
          break;
        case 2:
          expect(loadingState).toBe(true);
          break;
        case 3:
          expect(loadingState).toBe(false);
          break;
        default:
      }
      subscribeCounter++;
    });
    store.dispatch({ type: `${counterNamespace}/increment_async` });

    await delay(delayTime + 20);

    expect(centerEnhancerSpy.callCount).toBe(1);
    expect(store.getState()[counterNamespace].count).toBe(1);
  });
});
