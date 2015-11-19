/**
 * TOFLIT18 Client Sources Per Directions Component
 * =================================================
 *
 * Series of bar charts displaying the amount of data coming from different
 * sources per directions.
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import scale from 'd3-scale';
import {max, min, uniq} from 'lodash';

/**
 * Main component
 */
@measured
export default class SourcesPerDirections extends Component {
  render() {
    const {data, width} = this.props;

    if (!data)
      return null;

    if (!width)
      return <svg width="100%" />;

    // Measures
    const step = 60,
          barWidth = 7,
          height = step * 2 * data.length;

    // Computing max values
    let allYears = new Set(),
        allFlows = new Set();

    data.forEach(({local, national}) => {
      local.forEach(({year, flows}) => {
        allYears.add(year);
        allFlows.add(flows);
      });
      national.forEach(({year, flows}) => {
        allYears.add(year);
        allFlows.add(flows);
      });
    });

    allYears = Array.from(allYears);
    allFlows = Array.from(allFlows);

    const minYear = min(allYears),
          maxYear = max(allYears);

    const maxFlows = max(allFlows);

    // Scales
    const x = scale.linear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const y = scale.linear()
      .domain([0, maxFlows])
      .range([0, step]);


    // Rendering logic
    function renderLocal(d, i) {
      return d.map(function({year, flows}) {
        return (
          <rect width={barWidth - 2}
                height={y(flows)}
                x={x(year)}
                y={120 * i + 119 - y(flows)}
                fill="blue">
            <title>{`${flows} total flows`}</title>
          </rect>
        );
      });
    }

    function renderNational(d, i) {
      return d.map(function({year, flows}) {
        return (
          <rect width={barWidth - 2}
                height={y(flows)}
                x={x(year)}
                y={120 * i + 121}
                fill="red">
            <title>{`${flows} total flows`}</title>
          </rect>
        );
      });
    }

    return (
      <svg width="100%" height={height}>
        <g>
        <text x={0} y={30} fill="black">1718</text>
        <text x={width/2} y={30} fill="black">1750</text>
        <text x={width - 40} y={30} fill="black">1780</text>
          {data.map((direction, i) =>
            <line x1={0} y1={120 * i + 120} x2={width} y2={120 * i + 120} stroke="black" strokeWidth="2px" />)}
          {data.map((direction, i) =>
            <text x={0} y={120 * i + 100} fill="black">{direction.name}</text>
          )}
          {data.map((direction, i) => renderLocal(direction.local, i))}
          {data.map((direction, i) => renderNational(direction.national, i))}
        </g>
      </svg>
    );
  }
}
