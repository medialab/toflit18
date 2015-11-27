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
import {max, min, uniq, sortBy} from 'lodash';

/**
 * Constants.
 */
const SIZE = 100;

/**
 * Main component.
 */
@measured
export default class SourcesPerDirections extends Component {
  render() {
    const {data: unsorted, width} = this.props;

    if (!unsorted || !width)
      return <svg width="100%" height={0} />;;

    const data = sortBy(unsorted, 'name');

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

    allYears = Array.from(allYears).filter(y => +y !== 1860);
    allFlows = Array.from(allFlows);

    const minYear = min(allYears),
          maxYear = max(allYears);

    const maxFlows = max(allFlows);

    // Measures & scales
    const barWidth = width / (maxYear - minYear) - 1,
          height = SIZE * data.length;

    const x = scale.linear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const y = scale.linear()
      .domain([0, maxFlows])
      .range([0, SIZE / 2]);

    const yearTicks = x.ticks(3);

    // Rendering logic
    return (
      <svg width="100%" height={height} className="sources-per-directions">
        <g>
          {data.map((direction, i) =>
            <Direction key={direction.name}
                       order={i}
                       width={width}
                       bar={barWidth}
                       data={direction}
                       x={x}
                       y={y} />)}
        </g>
      </svg>
    );

  }
}

/**
 * Direction.
 */
class Direction extends Component {
  render() {
    const {
      order,
      bar,
      width,
      data,
      x,
      y
    } = this.props;

    const yPos = SIZE / 2;

    function renderRect(local, {year, flows}) {
      let rectYPos,
          rectHeight;

      if (local) {
        rectYPos = SIZE / 2 - y(flows) - 1;
        rectHeight = y(flows);
      }
      else {
        rectYPos = SIZE / 2 + 1;
        rectHeight = y(flows);
      }

      return (
        <rect key={year}
              className={`${local ? 'local' : 'national'}-bar`}
              width={bar}
              height={rectHeight}
              x={x(year)}
              y={rectYPos}>
          <title>{`${flows} total flows (${year})`}</title>
        </rect>
      );
    }

    return (
      <g transform={`translate(0, ${SIZE * order})`}>
        <line x1={0}
              y1={yPos}
              x2={width}
              y2={yPos}
              stroke="black"
              strokeWidth="1px" />
        <text x={0}
              y={yPos - 25}
              fill="black">
          {data.name}
        </text>
        {data.local.map(renderRect.bind(null, true))}
        {data.national.map(renderRect.bind(null, false))}
      </g>
    );
  }
}
