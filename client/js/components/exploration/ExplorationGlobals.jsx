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

@branch({
  actions: {
    select: selectClassification
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    state: ['states', 'exploration', 'globals']
  }
})
export default class ExplorationGlobals extends Component {
  render() {
    const {
      actions,
      classifications,
      state: {network}
    } = this.props;

    return (
      <div className="panel">
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


