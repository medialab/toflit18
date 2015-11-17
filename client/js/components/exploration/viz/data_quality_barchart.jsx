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
import {max, range} from 'lodash';

const DEFAULT_MARGIN = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20
};

/**
 * Main component
 */
@measured
export default class DataQualityBarChart extends Component {
  render() {

    // Basic properties
    const {data, width} = this.props;

    const margin = {...DEFAULT_MARGIN, ...(this.props.margin || {})};

    const height = 100;

    // If no data was supplied, we don't render
    if (!data)
      return null;

    // Computing max values
    const maxYear = data[data.length - 1].year,
          minYear = data[0].year,
          maxDirectionsCount = max(data.map(r => r.directions.length)),
          allYears = range(0, maxYear - minYear + 1).map((_, i) => minYear + i);

    // Building scales
    const x = scale.linear()
      .domain([minYear, maxYear])
      .range([0, width - 10]);

    const y = scale.linear()
      .domain([0, maxDirectionsCount])
      .range([height, 0]);

    // Rendering
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
