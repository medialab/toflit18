/**
 * TOFLIT18 Start Script
 * ======================
 *
 * Launching the API and starting routines.
 */
import {api as config} from '../config.json';
import app from '../api/app';

console.log(`API started on port ${config.port}...\n`);
app.listen(config.port);
