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
    logged: monkey(['user'], isLogged)
  },
  user: null
};

const tree = new Baobab(defaultState);

export default tree;
