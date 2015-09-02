/**
 * TOFLIT18 Client API Client
 * ===========================
 *
 * Simple abstraction used to query the datascape's API.
 */
import {endpoint} from './config.json';
import Client from 'djax-client';
import tree from './tree';

const client = new Client({
  settings: {
    baseUrl: endpoint
  }
});

export default client;
