/**
 * TOFLIT18 Client State Tree
 * ===========================
 *
 * Creating the Baobab state tree used by the whole application to function.
 */
import Baobab, { monkey } from "baobab";
import { classificationsIndex, flatClassifications } from "./monkeys";

const defaultState = {
  // View (strongly bound to the router):
  view: null,
  viewGroup: null,

  // Data
  data: {
    classifications: {
      raw: null,
      flat: monkey([".", "raw"], flatClassifications),
      index: monkey([".", "flat"], classificationsIndex),
    },
    directions: null,
    sourceTypes: null,
  },

  // Some generic UI state
  ui: {
    downloading: false,
    alert: null,
  },

  // Specific states:
  metadataState: {
    dataModel: null,
    dataType: null,
    perYear: null,
    flowsPerYear: null,
    fileName: null,
    loading: false,
    selectors: {
      productClassification: null,
      partnerClassification: null,
      product: null,
      partner: null,
      direction: null,
      kind: null,
      sourceType: null,
      page: 0,
    },
    groups: {
      partner: [],
      product: [],
    },
  },
  classificationsState: {
    kind: "",
    loading: false,
    selected: "",
    selectedParent: "",
    orderBy: "",
    queryGroup: "",
    queryItem: "",
    footprint: "",
    fullSelected: monkey(
      [".", "selected"],
      ["data", "classifications", "index"],
      (selected, index) => index[selected] || null,
    ),
    fullSelectedParent: monkey(
      [".", "selectedParent"],
      ["data", "classifications", "index"],
      (selectedParent, index) => index[selectedParent] || null,
    ),
    rows: [],
    reachedBottom: false,
  },
  indicatorsState: {
    selectors: {
      productClassification: null,
      partnerClassification: null,
      product: null,
      partner: null,
      direction: null,
      kind: null,
      sourceType: null,
    },
    groups: {
      partner: [],
      product: [],
    },
    lines: [],
    dataIndex: {},
  },
  explorationNetworkState: {
    graph: null,
    data: null,
    classification: null,
    nodeSize: "flows",
    edgeSize: "flows",
    labelThreshold: 5,
    labelSizeRatio: 2,
    loading: false,
    selectors: {
      productClassification: null,
      product: null,
      partnerClassification: null,
      kind: null,
      sourceType: null,
      dateMin: null,
      dateMax: null,
    },
    groups: {
      partner: [],
      product: [],
    },
  },
  explorationTermsState: {
    creating: false,
    graph: null,
    data: null,
    classification: null,
    nodeSize: "flows",
    edgeSize: "flows",
    labelThreshold: 3,
    labelSizeRatio: 2,
    loading: false,
    selectors: {
      productClassification: null,
      partnerClassification: null,
      childClassification: null,
      partner: null,
      child: [],
      direction: null,
      kind: null,
      sourceType: null,
      dateMin: null,
      dateMax: null,
    },
    groups: {
      partner: [],
      child: [],
    },
  },
  explorationFlowsState: {
    creating: false,
    flows: null,
    nbFlows: null,
    loading: false,
    page: 0,
    selectors: {
      productClassification: null,
      partnerClassification: null,
      partner: null,
      product: null,
      direction: null,
      kind: null,
      sourceType: null,
      dateMin: null,
      dateMax: null,
      valueMin: null,
      valueMax: null,
      orders: []
    },
    groups: {
      partner: [],
      product: [],
    },
  },

  // User-related information
  user: null,
};

const tree = new Baobab(defaultState);

export default tree;
