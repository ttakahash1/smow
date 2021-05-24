import {
  createStore,
  combineReducer,
  applyMiddlewaar
} from 'react-redux';
import thunk from 'redux-thunk';

const appReducer = combineReducer({});

export const store = createStore(
  appReducer,
  applyMiddlewaar(thunk)
);
