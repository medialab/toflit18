/**
 * TOFLIT18 Start Script
 * ======================
 *
 * Launching the API and starting routines.
 */
import {api as config} from '../config.json';
import app from '../api/app';

console.log('Server started!');
app.listen(config.port);
