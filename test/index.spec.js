import {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  configCreateStore,
  applyPlugin,
  SEPARATOR,
} from '../src';

describe('ReduxMutation export', () => {
  it('should be correct.', () => {
    //eslint-disable-next-line
    (!!createStore).should.be.true;
    //eslint-disable-next-line
    (!!combineReducers).should.be.true;
    //eslint-disable-next-line
    (!!bindActionCreators).should.be.true;
    //eslint-disable-next-line
    (!!applyMiddleware).should.be.true;
    //eslint-disable-next-line
    (!!compose).should.be.true;
    //eslint-disable-next-line
    (!!__DO_NOT_USE__ActionTypes).should.be.true;
    //eslint-disable-next-line
    (!!configCreateStore).should.be.true;
    //eslint-disable-next-line
    (!!applyPlugin).should.be.true;
    //eslint-disable-next-line
    (!!SEPARATOR).should.be.true;
  });
});
