/**
 * TOFLIT18 Client Indicators Display
 * ===================================
 *
 * Displaying a collection of indicators through picked visualizations.
 */
import React, {Component} from 'react';
import Fetcher from '../misc/fetcher.jsx';
import DataQualityBarChart from './viz/data_quality_barchart.jsx'

export default class ExplorationIndicators extends Component {
  render() {
    return (
      <div className="panel">
        <Fetcher url="/data/quality.json">
          <DataQualityBarChart />
        </Fetcher>
      </div>
    );
  }
}
