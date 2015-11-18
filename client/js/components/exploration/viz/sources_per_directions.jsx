/**
 * TOFLIT18 Client Sources Per Directions Component
 * =================================================
 *
 * Series of bar charts displaying the amount of data coming from different
 * sources per directions.
 */
import React, {Component} from 'react';
import scale from 'd3-scale';
import {sort} from 'lodash';

/**
 * Main component
 */
export default class SourcesPerDirections extends Component {
  render() {
    const {data} = this.props;

    let width = 1000,
        height = 5000;

    const x = scale.linear()
      .domain([1718, 1780])
      .range([0, width]);

    const y = scale.linear()
      .domain([0, 2428])
      .range([0, 60]);

    const barWidth = 1000/62;

    function renderLocal(d, i) {
      return d.map(function({year, nb_flows}) {
        return (
          <rect width={barWidth - 2}
                height={y(nb_flows)}
                x={x(year)}
                y={120 * i + 119 - y(nb_flows)}
                fill="blue">
            <title>{`${nb_flows} total flows`}</title>
          </rect>
        );
      });
    }

    function renderNational(d, i) {
      return d.map(function({year, nb_flows}) {
        return (
          <rect width={barWidth - 2}
                height={y(nb_flows)}
                x={x(year)}
                y={120 * i + 121}
                fill="red">
            <title>{`${nb_flows} total flows`}</title>
          </rect>
        );
      });
    }

    return (
      <svg width={width} height={height}>
        <g>
        <text x={0} y={30} fill="black">1718</text>
        <text x={width/2} y={30} fill="black">1750</text>
        <text x={width - 40} y={30} fill="black">1780</text>
          {Object.keys(data).map((k, i) =>
            <line x1={0} y1={120 * i + 120} x2={width} y2={120 * i + 120} stroke="black" strokeWidth="2px" />)}
          {Object.keys(data).map((k, i) =>
            <text x={0} y={120 * i + 100} fill="black">{k}</text>
          )}
          {Object.keys(data).map((k, i) => renderLocal(data[k]['Local'], i))}
          {Object.keys(data).map((k, i) => renderNational(data[k]['National par direction'], i))}
        </g>
      </svg>
    );
  }
}