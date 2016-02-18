/**
 * TOFLIT18 Client Browser History
 * ================================
 *
 * Creating the app's browser history so it can be used elsewhere.
 */
import {createHashHistory} from 'history';
import {useRouterHistory} from 'react-router';

export default useRouterHistory(createHashHistory)({queryKey: false});
