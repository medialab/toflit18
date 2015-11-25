/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import React, {Component} from 'react';
import {Waiter} from '../misc/Loaders.jsx';
import {branch} from 'baobab-react/decorators';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';
import Matrix from './viz/Matrix.jsx';

@branch({
  cursors: {
    sourcesPerDirections: ['data', 'viz', 'sourcesPerDirections']
  }
})
export default class ExplorationMeta extends Component {
  render() {
    const sourcesPerDirections = this.props.sourcesPerDirections;

    return (
      <div className="panel">
        {sourcesPerDirections ?
          <SourcesPerDirections data={sourcesPerDirections} /> :
          <Waiter />}
      </div>
    );
  }
}
