import sinon from 'sinon';
import generatorsToAsync from 'redux-center/lib/generators-to-async';

import { configCreateStore } from '../../../src';

describe('custom options usage', () => {
  it('should show warning when using option in only reducer mode', () => {
    const stub = sinon.stub(console, 'warn');
    configCreateStore({
      generatorsToAsync,
    })(function(state = 0) {
      return state;
    });
    stub.callCount.should.equal(1);
    stub.restore();
  });
});
