/**
 * TOFLIT18 Client API Client
 * ===========================
 *
 * Simple abstraction used to query the datascape's API.
 */
import {endpoint} from '../config.json';
import Client from 'djax-client';

const FORM = 'application/x-www-form-urlencoded';

const client = new Client({
  settings: {
    baseUrl: endpoint
  },

  defaults: {
    contentType: 'application/json',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    }
  },

  services: {

    // Login related
    session: '/session',

    login: {
      method: 'POST',
      url: '/login'
    },

    logout: {
      method: 'POST',
      url: '/logout'
    },

    // Data related
    classifications: '/classification',

    groups: '/classification/:id/groups',

    directions: '/directions',

    sourceTypes: '/source_types',

    search: {
      contentType: FORM,
      url: '/classification/:id/search'
    },

    searchItem: {
      contentType: FORM,
      url: '/classification/:id/searchItem'
    },

    export: '/classification/:id/export.json',

    review: {
      method: 'POST',
      url: '/classification/:id/:type/review'
    },

    commit: {
      method: 'POST',
      url: '/classification/:id/:type/commit'
    },

    // Viz
    viz: {
      contentType: FORM,
      url: '/viz/:name'
    },

    perYear: '/viz/per_year/:type',

    flowsPerYear: '/viz/flows_per_year/:type',

    network: {
      contentType: FORM,
      url: '/viz/network/:id'
    },

    terms: {
      contentType: FORM,
      url: '/viz/terms/:id'
    }
  }
});

export default client;
