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
    session: {
      url: '/session'
    },

    log: {
      method: 'POST',
      url: '/login'
    },

    test: {
      url: '/classifications/test'
    }
  }
});

export default client;
