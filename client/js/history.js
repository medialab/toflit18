/**
 * TOFLIT18 Client Browser History
 * ================================
 *
 * Creating the app's browser history so it can be used elsewhere.
 */
import {createHashHistory} from 'history';

export default createHashHistory({queryKey: false});
