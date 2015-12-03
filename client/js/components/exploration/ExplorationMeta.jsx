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
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import SourcesPerDirections from './viz/SourcesPerDirections.jsx';
import Matrix from './viz/Matrix.jsx';

@branch({
  cursors: {
    directionsPerYear: ['data', 'viz', 'directionsPerYear'],
    sourcesPerDirections: ['data', 'viz', 'sourcesPerDirections']
  }
})
export default class ExplorationMeta extends Component {
  render() {
    const {
      directionsPerYear,
      sourcesPerDirections
    } = this.props;

    return (
      <div>
        <div className="panel">
          <h3>Metadata</h3>
          <p>
            <em>Some information about the data itself.</em>
          </p>
        </div>
        <div className="panel">
          {directionsPerYear ?
            <DataQualityBarChart data={directionsPerYear} /> :
            <Waiter />}
        </div>
        <div className="panel">
          {sourcesPerDirections ?
           <SourcesPerDirections data={sourcesPerDirections} /> :
           <Waiter />}
        </div>
      </div>
    );
  }
}
