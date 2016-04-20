/**
 * TOFLIT18 Data Quality Bar Chart Component
 * ==========================================
 *
 * A brushable component displaying a bar chart showing periods of time when
 * data is actually existing.
 */
import React, {Component} from 'react';
import Tooltip from 'rc-tooltip';
import measured from '@yomguithereal/react-utilities/measured';
import {scaleLinear as linear} from 'd3-scale';
import {max, range, uniq, filter, concat} from 'lodash';

/**
 * Main component.
 */
@measured({width: '100%'})
export default class DataQualityBarChart extends Component {
  render() {

    // Basic properties
    let {data, width} = this.props;

    const bottomMargin = 25,
          topMargin = 20,
          height = 60;

    console.log("data quality", data);
    data = filter(data, (l) => { return l.data.length > 0 });
    // If no data was supplied, we don't render
    if (!data.length) {
      return null;
    }

    // check if data comes from indicators view
    if (data[0].params) {
      const nbDirectionByYear = {};
      data.forEach(line => {
        line.data.forEach((e) => {
          // concat direction by year
          if (nbDirectionByYear[e.year]) {
            nbDirectionByYear[e.year] = nbDirectionByYear[e.year].concat(e.nb_direction);
          }
          else {
            nbDirectionByYear[e.year] = e.nb_direction;
          }
        });
      });

      // create an array of data with nb of direction, year and directions
      const nbDirectionByYear2 = [];
      for (const key in nbDirectionByYear) {

          let directions = [];

          if (nbDirectionByYear[key]) {
            nbDirectionByYear[key].forEach((d) => {
              directions.push({direction: d});
            });

            // get unique value of direction
            directions = uniq(directions, 'direction')
                          .map((d) => {
                            return d.direction;
                          })
                          .sort();
          }
        nbDirectionByYear2.push({
          data: directions.length,
          year: key,
          directions: directions
        });
      }

      data = nbDirectionByYear2;
    }

    // Computing max values
    const maxYear = data[data.length - 1].year,
          minYear = data[0].year,
          maxDirectionsCount = max(data.map(r => r.data)),
          allYears = range(0, maxYear - minYear + 1).map((_, i) => minYear + i);

    // Building scales
    const x = linear()
      .domain([minYear, maxYear])
      .range([0, width - 10]);

    const y = linear()
      .domain([0, maxDirectionsCount])
      .range([height, 0]);

    // Rendering
    return (
      <svg width="100%" height={height + bottomMargin + topMargin} className="quality-bar-chart">
        <Axis width={width} height={height + topMargin} scale={x} years={allYears} />
        <g>
          {data.map(row => {
            return (
              <g key={row.year}>
                <Tooltip placement="top" align={{offset: [3, 0]}} overlay={row.directions + ` (${row.year})`}>
                  <rect className="bar"
                        x={x(row.year)}
                        y={y(row.data) + topMargin}
                        width={6}
                        height={height - y(row.data)} />
                </Tooltip>
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

    const ticks = scale.ticks();

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
      <g className="x axis" transform={`translate(0, ${height + 2})`}>
        <line x2={width} />
        {ticks.slice(0, -1).map(renderTick)}
      </g>
    );
  }
}
