/**
 * TOFLIT18 Client State Tree
 * ===========================
 *
 * Creating the Baobab state tree used by the whole application to function.
 */
import Baobab, {monkey} from 'baobab';
import {storageKey} from '../config.json';
import {merge} from 'lodash';
import {
  classificationsIndex,
  flatClassifications,
  isLogged
} from './monkeys';

// Reading from localStorage
let storageState = {};
// try {
//   storageState = JSON.parse(localStorage.getItem(storageKey));
// }
// catch (e) {
//   console.error('Error while reading localStorage!');
// }

const defaultState = {

  // Data
  data: {
    classifications: {
      raw: null,
      flat: monkey(['.', 'raw'], flatClassifications),
      index: monkey(['.', 'flat'], classificationsIndex)
    }
  },

  // Some generic UI flags
  flags: {
    logged: monkey(['user'], isLogged),
    login: {
      failed: false,
      loading: false
    },
    downloading: false
  },

  // Specific states
  states: merge({

    // Classification section
    classification: {

      // Classification browser
      browser: {
        loading: false,
        selected: null,
        query: '',
        current: monkey(
          ['.', 'selected'],
          ['data', 'classifications', 'index'],
          (selected, index) => index[selected] || null
        ),
        rows: []
      }
    }
  }, storageState),

  // User-related information
  user: null,
};

const tree = new Baobab(defaultState);

// Watching over some paths that need serialization
// const watcher = tree.watch({
//   states: ['states']
// }).on('update', function() {
//   const data = tree.serialize('states');

//   localStorage.setItem(storageKey, JSON.stringify(data));
// });

export default tree;
