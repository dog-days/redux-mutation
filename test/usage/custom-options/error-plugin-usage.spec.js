import { configCreateStore, applyPlugin } from '../../../src';
import errorPlugin from './error-plugin';

import counterMutation, {
  namespace as counterNamspace,
} from './couter-mutation';

const store = configCreateStore(applyPlugin(errorPlugin))(counterMutation);
describe('CenterEnhancer', function() {
  it('should throw error when put inside the existing centers.', done => {
    const unsubscribe = store.subscribe(() => {
      unsubscribe();
    });
    //异步的error，try catch不到
    store.dispatch({ type: `${counterNamspace}/increment_async` }).catch(e => {
      done();
    });
  });
});
