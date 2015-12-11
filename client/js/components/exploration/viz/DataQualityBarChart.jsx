/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import scales from 'd3-scale';
import {max, range} from 'lodash';

/**
 * Main component.
 */
@measured
export default class DataQualityBarChart extends Component {
  render() {

    // Basic properties
    const {data, width} = this.props;

    const bottomMargin = 25,
          topMargin = 20,
          height = 60;

    // If no data was supplied, we don't render
    if (!data || !width)
      return <svg width="100%" />;

    // Computing max values
    const maxYear = data[data.length - 1].year,
          minYear = data[0].year,
          maxDirectionsCount = max(data.map(r => r.directions.length)),
          allYears = range(0, maxYear - minYear + 1).map((_, i) => minYear + i);

    // Building scales
    const x = scales.linear()
      .domain([minYear, maxYear])
      .range([0, width - 10]);

    const y = scales.linear()
      .domain([0, maxDirectionsCount])
      .range([height, 0]);

    // Rendering
    return (
      <svg width="100%" height={height + bottomMargin + topMargin} className="quality-bar-chart">
        <Axis width={width} height={height + topMargin} scale={x} years={allYears} />
        <g>
          {data.map(row => {
            return (
              <g>
                <text x={x(row.year) + 5}
                      y={y(row.directions.length) - 5 + topMargin}
                      textAnchor="middle">
                  {row.directions.length}
                </text>
                <rect key={row.year}
                      className="bar"
                      x={x(row.year)}
                      y={y(row.directions.length) + topMargin}
                      width={10}
                      height={height - y(row.directions.length)} />
              </g>
            );
          })}
        </g>
      </svg>
    );
  }
}

/**
 * Axis.
 */
class Axis extends Component {
  render() {
    const {width, height, scale} = this.props;

    const ticks = scale.ticks(15);

    function renderTick(t, i) {
      const left = scale(t);

      return (
        <g key={i} className="tick" transform={`translate(${left}, 0)`}>
          <line y2={5} x1={5} x2={5} />
          <text y={15} x={5} textAnchor="middle">
            {t}
          </text>
        </g>
      );
    }

    return (
      <g className="axis" transform={`translate(0, ${height + 2})`}>
        <line x2={width} />
        {ticks.slice(0, -1).map(renderTick)}
      </g>
    );
  }
}
