/**
 * TOFLIT18 Client Meta Viz Display
 * =================================
 *
 * Displaying a collection of visualizations dealing with the sources
 * themselves and how they interact with each other.
 */
import React, {Component} from 'react';
import Fetcher from '../misc/fetcher.jsx';
import SourcesPerDirections from './viz/sources_per_directions.jsx';

export default class ExplorationMeta extends Component {
  render() {
    return (
      <div className="panel">
        <Fetcher url="/data/sources_per_directions.json">
          <SourcesPerDirections />
        </Fetcher>
      </div>
    );
  }
}
