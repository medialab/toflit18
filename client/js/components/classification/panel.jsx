/**
 * TOFLIT18 Client Classification View
 * =====================================
 *
 * Displayed the view used to aggregate data.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import Crossroads from './crossroads.jsx';
import Browser from './browser.jsx';

const ROUTER = (subroute) => {
  return Browser;
};

@branch({
  cursors: {
    subroute: ['subroute']
  }
})
export default class ClassificationPanel extends Component {
  render() {
    const Route = ROUTER(this.props.subroute);

    return (
      <div id="classification">
        <Route />
      </div>
    );
  }
}
