/**
 * TOFLIT18 Client State Tree
 * ===========================
 *
 * Creating the Baobab state tree used by the whole application to function.
 */
import Baobab, {monkey} from 'baobab';
import {
  isLogged
} from './facets';

const defaultState = {
  flags: {
    logged: monkey(['user'], isLogged),
    login: {
      failed: false,
      loading: false
    }
  },
  route: 'classification',
  subRoute: null,
  state: {
    classification: {}
  },
  user: null,
};

const tree = new Baobab(defaultState);

export default tree;
