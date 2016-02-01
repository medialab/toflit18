/**
 * TOFLIT18 Client Global Viz Display
 * ===================================
 *
 * Displaying a collection of visualizations dealing with the dataset as a
 * whole.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {ClassificationSelector} from '../misc/Selectors.jsx';
import Network from './viz/Network.jsx';
import {selectClassification} from '../../actions/globals';

export default class ExplorationGlobals extends Component {
  render() {
    return (
      <div>
        <TermsPanel />
        <NetworkPanel />
      </div>
    );
  }
}

@branch({
  actions: {
    select: selectClassification
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    state: ['states', 'exploration', 'globals']
  }
})
class NetworkPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      state: {network}
    } = this.props;

    return (
      <div className="panel">
        <h4>Countries Network</h4>
        <em>Choose a country classification and display a graph showing relations between countries & directions.</em>
        <hr />
        <ClassificationSelector type="country"
                                loading={!classifications.country.length || network.loading}
                                data={classifications.country}
                                onChange={actions.select}
                                selected={network.classification} />
        <Network graph={network.graph} />
      </div>
    );
  }
}

class TermsPanel extends Component {
  render() {
    const dummyGraph = {nodes: [], edges: []};

    return (
      <div className="panel">
        <h4>Terms Network</h4>
        <em>Choose a product classification and display a graph showing relations between terms of the aforementioned classification</em>
        <hr />
        <Network graph={dummyGraph} />
      </div>
    );
  }
}
