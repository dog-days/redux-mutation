import configCreateStore from './configCreateStore';
import createStore from './createStore';
import { combineReducers, applyMiddleware } from 'redux';

import { SEPARATOR } from './utils/const';
import applyPlugin from './applyPlugin';
import compose from './compose';

export {
  combineReducers,
  applyMiddleware,
  compose,
  //new and changed api below
  createStore,
  configCreateStore,
  applyPlugin,
  SEPARATOR,
};
