import { createStore, configCreateStore } from './redux-mutation';
import {
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
} from 'redux';

import { SEPARATOR } from './utils/const';
import applyPlugin from './apply-plugin';

export {
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
  //new and changed api below
  createStore,
  configCreateStore,
  applyPlugin,
  SEPARATOR,
};
