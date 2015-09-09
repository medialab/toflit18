/**
 * TOFLIT18 Client Application Component
 * ======================================
 *
 * Root component for the application.
 */
import React, {Component} from 'react';
import Addressbar from 'react-addressbar';
import Login from './login/login.jsx';
import AggregationPanel from './aggregation/panel.jsx';

const ROUTER = (route) => {
  return ({
    aggregation: AggregationPanel,
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
        <main>
          {Component ? <Component /> : <div>Not Found!</div>}
        </main>
      </div>
    );
  }
}
