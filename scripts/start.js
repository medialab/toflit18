/* eslint no-console: 0 */
/**
 * TOFLIT18 Start Script
 * ======================
 *
 * Launching the API and starting routines.
 */
import http from 'http';
import {api as config} from '../config.json';

let app = require('../api/app.js').default;

const server = http.createServer(app);

server.listen(config.port);

console.log(`API started on port ${config.port}...\n`);

// Server HMR
if (module.hot) {
  module.hot.accept('../api/app.js', function() {
    server.removeListener('request', app);
    app = require('../api/app.js').default;
    server.on('request', app);
  });
}
