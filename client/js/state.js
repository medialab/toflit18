/**
 * TOFLIT18 Client State Tree
 * ===========================
 *
 * Creating the Baobab state tree used by the whole application to function.
 */
import Baobab, {monkey} from 'baobab';
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
    sourceTypes: null
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
        queryGroup: '',
        queryItem: '',
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

      // Metadata view
      metadata: {
        dataType: null,
        perYear: null,
        flowsPerYear: null,
        fileName: null,
        selectors: {
          productClassification: null,
          countryClassification: null,
          product: null,
          country: null,
          direction: null,
          kind: null,
          sourceType: null
        },
        groups: {
          country: [],
          product: []
        },
      },

      // Indicators view
      indicators: {
        creating: false,
        selectors: {
          productClassification: null,
          countryClassification: null,
          product: null,
          country: null,
          direction: null,
          kind: null,
          sourceType: null
        },
        groups: {
          country: [],
          product: []
        },
        lines: []
      },

      // Globals views
      network: {
        graph: null,
        graphResultAPI: null,
        classification: null,
        ponderation: 'flows',
        loading: false,
        selectors: {
          dataType: null,
          productClassification: null,
          product: null,
          countryClassification: null,
          kind: null,
          dateMin: null,
          dateMax: null
        },
        groups: {
          country: [],
          product: []
        }
      },
      terms: {
        creating: false,
        graph: null,
        graphResultAPI: null,
        classification: null,
        colorization: 'community',
        loading: false,
        selectors: {
          productClassification: null,
          countryClassification: null,
          country: null,
          direction: null,
          kind: null,
          sourceType: null,
          dateMin: null,
          dateMax: null
        },
        groups: {
          country: []
        }
      }
    }
  },

  // User-related information
  user: null,
};

const tree = new Baobab(defaultState);

export default tree;
