import configCreateStore from './configCreateStore';
import createStore from './createStore';
import {
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes,
} from 'redux';

import { SEPARATOR } from './utils/const';
import applyPlugin from './applyPlugin';

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
