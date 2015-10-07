/**
 * TOFLIT18 Client API Client
 * ===========================
 *
 * Simple abstraction used to query the datascape's API.
 */
import {endpoint} from '../config.json';
import Client from 'djax-client';

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

    logout: '/logout',

    // Data related
    classifications: '/classification',
    groups: '/classification/:id/groups',
    export: '/classification/:id/export.json'
  }
});

export default client;
