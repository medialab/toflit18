/**
 * TOFLIT18 Client Application Router
 * ===================================
 *
 * Routing the application.
 */
import React, {Component} from 'react';
import {Router, Route, IndexRoute, Redirect} from 'react-router';
import PropTypes from 'baobab-react/prop-types';
import App from './app.jsx';
import Login from './login/login.jsx';
import ClassificationPanel from './classification/panel.jsx';
import ClassificationBrowser from './classification/browser.jsx';
import ClassificationCrossroads from './classification/crossroads.jsx';
import ExplorationPanel from './exploration/panel.jsx';
import history from '../history';

export default class AppRouter extends Component {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {

    const isLogged = () => {
      return this.context.tree.get('flags', 'logged');
    };

    return (
      <Router history={history}>
        <Redirect from="/" to="/classification/browser" />
        <Route path="/" component={App}>
          <Route path="/login" component={Login} />
          <Route path="/" onEnter={(_, redirect) => !isLogged() && redirect(null, '/login')}>
            <Route path="classification" component={ClassificationPanel}>
              <IndexRoute component={ClassificationCrossroads} />
              <Route path="browser" component={ClassificationBrowser} />
            </Route>
            <Route path="exploration" component={ExplorationPanel}>
              <IndexRoute component={ExplorationPanel} />
            </Route>
          </Route>
        </Route>
      </Router>
    );
  }
}
