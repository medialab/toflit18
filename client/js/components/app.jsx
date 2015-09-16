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

const ROUTER = (logged, route) => {
  if (!logged)
    return Login

  return ({
    classification: ClassificationPanel,
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
          Component = ROUTER(logged, route);

    return (
      <div id="main">
        <Addressbar onChange={this.onHashChange.bind(this)}
                    value={'/#/' + route} />
        <NavBar />
        <main className="container">
          {Component ? <Component /> : <div>Not Found!</div>}
        </main>
      </div>
    );
  }
}
