/**
 * TOFLIT18 Client State Tree
 * ===========================
 *
 * Creating the Baobab state tree used by the whole application to function.
 */
import Baobab from 'baobab';
import {
  isLogged
} from './facets';

const defaultState = {
  user: null,
  $isLogged: [
    ['user'],
    isLogged
  ]
};

const tree = new Baobab(defaultState);

export default tree;
