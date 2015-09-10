/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import Addressbar from 'react-addressbar';
import NavBar from './navbar.jsx';
import Login from './login/login.jsx';
import ClassificationPanel from './classification/panel.jsx';

const ROUTER = (route) => {
  return ({
    classification: ClassificationPanel,
    login: Login
  })[route];
};

export default class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {route: 'login'};
  }

  onHashChange(url) {
    const hash = location.hash.split('/').slice(1);
    this.setState({route: hash});
  }

  render() {
    const route = this.state.route,
          Component = ROUTER(route);

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
