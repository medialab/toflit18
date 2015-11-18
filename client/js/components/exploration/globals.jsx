/**
 * TOFLIT18 Client Global Viz Display
 * ===================================
 *
 * Displaying a collection of visualizations dealing with the dataset as a
 * whole.
 */
import React, {Component} from 'react';
import Fetcher from '../misc/fetcher.jsx';
import Sankey from './viz/sankey.jsx';

export default class ExplorationGlobals extends Component {
  render() {
    return (
      <div className="panel">
        Global viz...
        <Fetcher url="/data/sankey.json">
          
        </Fetcher>
      </div>
    );
  }
}


