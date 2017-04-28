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
import {maxBy, range, uniq, filter, isEmpty} from 'lodash';

/**
 * Main component.
 */
@measured({width: '100%'})
export default class DataQualityBarChart extends Component {
  render() {

    // Basic properties
    let data = this.props.data;
    const width = this.props.width;

    const bottomMargin = 25,
          topMargin = 20,
          height = 60;

    // manage meta or indicator context
    if (!data.length) {
      return null;
    }

    if (data && data[0].params) {
      data = filter(data, (l) => {
        return l.data.length > 0;
      });
    }

    // If no data was supplied, we don't render
    if (!data.length) {
      return null;
    }

    // check if params available in data
    // TODO: this smells very bad!
    function checkParams(items) {
      let test;
      items.forEach(d => {
        if (d.hasOwnProperty('params') === true) {
          test = true;
          return;
        }
        else
          test = false;

      });
      return test;
    }

    // check if data comes from indicators view
    if (data.length > 0 && checkParams(data)) {
      const nbDirectionByYear = {};
      data.forEach(line => {
        line.data.forEach((e) => {
          // concat direction by year & check if count and value available
          if (e.value !== null && e.count !== null) {
            if (nbDirectionByYear[e.year]) {
              nbDirectionByYear[e.year] = nbDirectionByYear[e.year].concat(e.nb_direction);
            }
            else {
              nbDirectionByYear[e.year] = e.nb_direction;
            }
          }
        });
      });

      // create an array of data with nb of direction, year and directions
      const nbDirectionByYear2 = [];

      if (!isEmpty(nbDirectionByYear)) {
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
            directions
          });
        }

        data = nbDirectionByYear2;
      }
      else {
        return null;
      }

    }

    // Computing max values
    const maxYear = data[data.length - 1].year,
          minYear = data[0].year,
          maxDirectionsCount = maxBy(data.map(r => r.data)),
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
        <Axis
          width={width}
          height={height + topMargin}
          scale={x}
          years={allYears} />
        <Legend
          x={10}
          y={10}
          label="Number of element by year"
          className="bar" />
        <g>
          {data.map(row => {
            let dataDisplayed;
            if (row.directions)
              dataDisplayed = row.directions;
            else
              dataDisplayed = row.data;

            return (
              <g key={row.year}>
                <Tooltip
                  placement="top"
                  align={{offset: [3, 0]}}
                  overlay={dataDisplayed + ` (${row.year})`}
                  mouseLeaveDelay={0}>
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

/*
 * Legend
 */
class Legend extends Component {
  render() {
    const {x, y, label, className} = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width="10"
          height="10"
          className={className} />
        <text
          x={x + 20}
          y={y + 10}
          textAnchor="left"
          className="legend-label">
          {label}
        </text>
      </g>
      );
  }
}
