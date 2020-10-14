/**
 * TOFLIT18 Client API Client
 * ===========================
 *
 * Simple abstraction used to query the datascape's API.
 */
import Client from "djax-client";

const FORM = "application/x-www-form-urlencoded";

const client = new Client({
  settings: {
    baseUrl: CONFIG.endpoint,
  },

  defaults: {
    contentType: "application/json",
    dataType: "json",
    xhrFields: {
      withCredentials: true,
    },
  },

  services: {
    // Data related
    classifications: "/classification",

    groups: "/classification/:id/groups",

    group: {
      contentType: FORM,
      url: "/classification/group/:id",
    },

    directions: "/directions",

    sourceTypes: "/source_types",

    search: {
      contentType: FORM,
      url: "/classification/:id/search",
    },

    export: "/classification/:id/export.json",

    review: {
      method: "POST",
      url: "/classification/:id/:type/review",
    },

    commit: {
      method: "POST",
      url: "/classification/:id/:type/commit",
    },

    // Viz
    viz: {
      method: "POST",
      url: "/viz/:name",
    },

    perYear: {
      contentType: FORM,
      url: "/viz/per_year/:type",
    },

    flowsPerYear: {
      method: "POST",
      url: "/viz/flows_per_year/:type",
    },

    valuesPerYear: {
      method: "POST",
      url: "/viz/values_per_year/:type",
    },

    network: {
      method: "POST",
      url: "/viz/network/:id",
    },

    terms: {
      method: "POST",
      url: "/viz/terms/:id",
    },
    
    flows: {
      method: "POST",
      url: "/flows",
    },

    countFlows: {
      method: "POST",
      url: "/countFlows",
    },
  },
});

export default client;
