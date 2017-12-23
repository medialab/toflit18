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

  // Some generic UI state
  ui: {
    downloading: false,
    alert: null
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
        dataModel: null,
        dataType: null,
        perYear: null,
        flowsPerYear: null,
        fileName: null,
        loading: false,
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
        data: null,
        classification: null,
        nodeSize: 'flows',
        edgeSize: 'flows',
        labelThreshold: 7,
        labelSizeRatio: 2,
        loading: false,
        selectors: {
          productClassification: null,
          product: null,
          countryClassification: null,
          kind: null,
          sourceType: null,
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
        data: null,
        classification: null,
        nodeSize: 'flows',
        edgeSize: 'flows',
        labelThreshold: 7,
        labelSizeRatio: 2,
        loading: false,
        selectors: {
          productClassification: null,
          countryClassification: null,
          childClassification: null,
          country: null,
          child: null,
          direction: null,
          kind: null,
          sourceType: null,
          dateMin: null,
          dateMax: null
        },
        groups: {
          country: [],
          child: []
        }
      }
    }
  },

  // User-related information
  user: null,
};

const tree = new Baobab(defaultState);

export default tree;
