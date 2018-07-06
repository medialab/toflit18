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
        kind: { name: "Products", value: "product" },
        loading: false,
        selected: 2,
        selectedParent: 1,
        orderBy: 'size',
        queryGroup: '',
        queryItem: '',
        current: monkey(
          ['.', 'selected'],
          ['data', 'classifications', 'index'],
          (selected, index) => index[selected] || null
        ),
        currentParent: monkey(
          ['.', 'selectedParent'],
          ['data', 'classifications', 'index'],
          (selectedParent, index) => index[selectedParent] || null
        ),
        rows: [],
        reachedBottom: false,
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
        dataModel: { name: "Direction", value: "direction", special: true },
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
          sourceType: { name: "National best guess", value: "National best guess" }
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
        classification: { name: "Grouping", author: "toflit18", slug: "grouping", id: 15 },
        nodeSize: 'flows',
        edgeSize: 'flows',
        labelThreshold: 5,
        labelSizeRatio: 2,
        loading: false,
        selectors: {
          productClassification: null,
          product: null,
          countryClassification: null,
          kind: null,
          sourceType: { name: "National best guess", value: "National best guess" },
          dateMin: {name: 1750, id: 1750},
          dateMax: {name: 1750, id: 1750}
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
        classification: { name: "Simplification", slug: "simplification", id: 3, author: "toflit18"},
        nodeSize: 'flows',
        edgeSize: 'flows',
        labelThreshold: 5,
        labelSizeRatio: 2,
        loading: false,
        selectors: {
          productClassification: null,
          countryClassification: null,
          childClassification: { author: "toflit18", id: 10, name: "SITC EN", slug: "sitc_en"},
          country: null,
          child: { id: 615179, name: "Raw materials, inedible, except fuels" },
          direction: null,
          kind: null,
          sourceType: { name: "National best guess", value: "National best guess" },
          dateMin: {name: 1750, id: 1750},
          dateMax: {name: 1750, id: 1750}
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
