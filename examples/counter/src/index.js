import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux-mutation';
import loggerMiddleware from 'redux-logger';

import counterMutation, {
  namespace as counterNamspace,
} from './couter-mutation';
import Counter from './Counter';

const store = createStore(counterMutation, applyMiddleware(loggerMiddleware));

const dispatchAction = type => store.dispatch({ type });

function render() {
  ReactDOM.render(
    <Counter
      value={store.getState()[counterNamspace]}
      onIncrement={() => dispatchAction(`${counterNamspace}/increment`)}
      onDecrement={() => dispatchAction(`${counterNamspace}/decrement`)}
      onIncrementIfOdd={() =>
        dispatchAction(`${counterNamspace}/increment_if_odd`)
      }
      onIncrementAsync={() =>
        dispatchAction(`${counterNamspace}/increment_async`)
      }
    />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);
