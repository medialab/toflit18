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

const defaultState = {

  // Data
  data: {
    classifications: {
      raw: null,
      flat: monkey(['.', 'raw'], flatClassifications),
      index: monkey(['.', 'flat'], classificationsIndex)
    },
    directions: null,
    viz: {
      sourcesPerDirections: null
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
  states: {

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
      },

      // Classification modal
      modal: {
        loading: false,
        patch: null,
        type: null,
        step: 'upload',
        inconsistencies: null,
        review: null
      }
    },

    // Exploration section
    exploration: {

      // Indicators view
      indicators: {
        creating: false,
        selectors: {
          productClassification: null,
          countryClassification: null,
          product: null,
          country: null,
          direction: null,
          kind: null
        },
        groups: {
          country: [],
          product: []
        },
        lines: []
      }
    }
  },

  // User-related information
  user: null,
};

const tree = new Baobab(defaultState);

export default tree;
