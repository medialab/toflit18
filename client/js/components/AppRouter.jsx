/**
 * TOFLIT18 Client Application Router
 * ===================================
 *
 * Routing the application.
 */
import React, {Component} from 'react';
import {Router, Route, IndexRoute, Redirect} from 'react-router';
import PropTypes from 'baobab-react/prop-types';
import App from './App.jsx';
import Login from './login/Login.jsx';
import ClassificationPanel from './classification/ClassificationPanel.jsx';
import ClassificationModal from './classification/ClassificationModal.jsx';
import ClassificationBrowser from './classification/ClassificationBrowser.jsx';
import ExplorationPanel from './exploration/ExplorationPanel.jsx';
import ExplorationMeta from './exploration/ExplorationMeta.jsx';
import ExplorationIndicators from './exploration/ExplorationIndicators.jsx';
import ExplorationGlobals from './exploration/ExplorationGlobals.jsx';
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
        <Redirect from="/" to="/exploration/meta" />
        <Route path="/" component={App}>
          <Route path="/login" component={Login} />
          <Route path="/" onEnter={(_, redirect) => !isLogged() && redirect(null, '/login')}>

            <Redirect from="classification" to="classification/browser" />
            <Redirect from="exploration" to="exploration/meta" />

            <Route path="classification" component={ClassificationPanel}>
              <Route path="browser" component={ClassificationBrowser} />
              <Route path="modal" component={ClassificationModal} />
            </Route>
            <Route path="exploration" component={ExplorationPanel}>
              <Route path="meta" component={ExplorationMeta} />
              <Route path="indicators" component={ExplorationIndicators} />
              <Route path="globals" component={ExplorationGlobals} />
            </Route>
          </Route>
        </Route>
        <Redirect from="*" to="/" />
      </Router>
    );
  }
}
