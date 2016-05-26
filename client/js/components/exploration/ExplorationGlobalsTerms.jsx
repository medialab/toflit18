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
import {
  selectClassification,
  selectTerms,
  selectColorization
} from '../../actions/globals';


export default class ExplorationGlobalsTerms extends Component {
  render() {
    return (
      <div>
        <TermsPanel />
      </div>
    );
  }
}

@branch({
  actions: {
    select: selectTerms,
    selectColorization
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    state: ['states', 'exploration', 'globals', 'terms']
  }
})
class TermsPanel extends Component {
  render() {
    const {
      actions,
      classifications,
      state
    } = this.props;

    const colorKey = state.colorization === 'community' ?
      'communityColor' :
      'positionColor';

    const radioListener = e => actions.selectColorization(e.target.value);

    return (
      <div className="panel">
        <h4>Terms Network</h4>
        <em>Choose a product classification and display a graph showing relations between terms of the aforementioned classification</em>
        <hr />
        <ClassificationSelector type="product"
                                loading={!classifications.product.length || state.loading}
                                data={classifications.product}
                                onChange={actions.select}
                                selected={state.classification} />
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="community"
                 checked={state.colorization === 'community'}
                 onChange={radioListener} />
           Commmunity Color
        </label>
        <label>
          <input type="radio"
                 name="optionsRadio"
                 value="position"
                 checked={state.colorization === 'position'}
                 onChange={radioListener} />
           Position Color
        </label>
        <Network graph={state.graph} colorKey={colorKey} />
      </div>
    );
  }
}
