/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import scale from 'd3-scale';
import {max} from 'lodash';

/**
 * Main component
 */
@measured
export default class DataQualityBarChart extends Component {
  render() {
    const {data, width} = this.props;

    const height = 200;

    if (!data)
      return null;

    // Computing max values
    const maxYear = data[data.length - 1].year,
          minYear = data[0].year,
          maxDirectionsCount = max(data.map(r => r.directions.length));

    // Building scales
    const x = scale.linear()
      .domain([minYear, maxYear])
      .range([0, width - 10]);

    const y = scale.linear()
      .domain([0, maxDirectionsCount])
      .range([height, 0]);

    return (
      <svg width="100%" height={height} className="quality-bar-chart">
        {width && data.map((row, i) =>
          <rect key={row.year}
                className="bar"
                x={x(row.year)}
                y={y(row.directions.length)}
                width={10}
                height={height - y(row.directions.length)} />)}
      </svg>
    );
  }
}
