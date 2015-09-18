/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import Addressbar from 'react-addressbar';
import NavBar from './navbar.jsx';
import Login from './login/login.jsx';
import ClassificationPanel from './classification/panel.jsx';
import ExplorationPanel from './exploration/panel.jsx';

const ROUTER = (logged, route) => {
  if (!logged)
    return Login

  return ({
    classification: ClassificationPanel,
    exploration: ExplorationPanel
  })[route];
};

@branch({
  cursors: {
    logged: ['flags', 'logged'],
    route: ['route']
  }
})
export default class App extends Component {
  onHashChange(url) {
    const hash = location.hash.split('/').slice(1);

    // TODO: add an action here
  }

  render() {
    const {route, logged} = this.props,
          Route = ROUTER(logged, route);

    return (
      <div id="main">
        <Addressbar onChange={this.onHashChange.bind(this)}
                    value={'/#/' + (logged ? route : 'login')} />
        <NavBar />
        <main className="container">
          {Route ? <Route /> : <div>Not Found!</div>}
        </main>
      </div>
    );
  }
}
