
/**
 * TOFLIT18 Client Sources Per Directions Component
 * =================================================
 *
 * Series of bar charts displaying the amount of data coming from different
 * sources per directions.
 */
import React, {Component} from 'react';
import Tooltip from 'rc-tooltip';
import measured from '@yomguithereal/react-utilities/measured';
import {scaleLinear as linear} from 'd3-scale';
import {max, min, sortBy} from 'lodash';

/**
 * Constants.
 */
const SIZE = 120;

/**
 * Main component.
 */
@measured({width: '100%'})
export default class SourcesPerDirections extends Component {
  render() {
    const {data: unsorted, width} = this.props;

    if (!unsorted)
      return null;

    const data = sortBy(unsorted, 'name');

    // Computing max values
    let allYears = new Set(),
        allFlows = new Set();

    data.forEach(item => {
      item.data.forEach(({year, flows}) => {
        allYears.add(year);
        allFlows.add(flows);
      });
    });

    allYears = Array.from(allYears);
    allFlows = Array.from(allFlows);

    const minYear = min(allYears),
          maxYear = max(allYears);

    const maxFlows = max(allFlows);

    // Measures & scales
    const barWidth = width / (maxYear - minYear) - 3,
          height = SIZE * data.length + 30;

    const x = linear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const y = linear()
      .domain([0, maxFlows])
      .range([0, SIZE - 25]);

    // const yearTicks = x.ticks(3);

    // Rendering logic
    return (
      <svg width="100%" height={height} className="sources-per-directions">
        <Legend
          x={10}
          y={10}
          label="Number of flows"
          className="local-bar" />
        <g>
          {data.map((direction, i) =>
            <Direction key={direction.name}
              order={i}
              width={width}
              bar={barWidth}
              item={direction}
              x={x}
              y={y}
              allYears={allYears} />)}
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
      item,
      y,
      allYears
    } = this.props;

    const yPos = SIZE;

    // Building scales
    const x = linear()
      .domain([min(allYears), max(allYears)])
      .range([0, width - 10]);

    function renderRect(local, {year, flows}) {
      const rectHeight = Math.max(1, y(flows)),
            rectYPos = SIZE - rectHeight;

      const tooltip = `${flows} total flows (${year})`;

      return (
        <Tooltip
          placement="top"
          align={{offset: [3, 0]}}
          overlay={tooltip}
          key={year}>
          <rect className={`${local ? 'local' : 'national'}-bar`}
            width={bar}
            height={rectHeight}
            x={x(year)}
            y={rectYPos} />
        </Tooltip>
      );
    }

    function renderUnderline(year) {
      return (
        <rect width={bar}
          key={year}
          height={1}
          x={x(year)}
          y={SIZE + 2} />
      );
    }

    return (
      <g transform={`translate(0, ${SIZE * order})`}>
        <Axis
          width={width}
          height={SIZE}
          scale={x}
          years={allYears} />

        <text x={0}
          y={yPos - SIZE / 3}
          fill="black">
          {item.name}
        </text>

        {item.data.map(renderRect.bind(null, true))}
        {allYears.map(renderUnderline)}
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
          className="legend-label">{label}</text>
      </g>
      );
  }
}


/**
 * Axis.
 */
class Axis extends Component {
  render() {
    const {height, scale} = this.props;

    const ticks = scale.ticks(15);

    function renderTick(t, i) {
      const left = scale(t);

      return (
        <g key={i} className="tick" transform={`translate(${left}, 0)`}>
          <line y2={5} x1={5} x2={5} />
          <text y={15} x={5} textAnchor="middle">{t}</text>
        </g>
      );
    }

    return (
      <g className="axis" transform={`translate(0, ${height + 2})`}>
        {ticks.slice(0, -1).map(renderTick)}
      </g>
    );
  }
}
