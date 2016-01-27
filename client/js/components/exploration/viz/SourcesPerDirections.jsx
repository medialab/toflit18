/**
 * TOFLIT18 Client Sources Per Directions Component
 * =================================================
 *
 * Series of bar charts displaying the amount of data coming from different
 * sources per directions.
 */
import React, {Component} from 'react';
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

    // Measures & scales
    const barWidth = width / (maxYear - minYear) - 3,
          height = SIZE * (data.length+1);

    const x = linear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const y = linear()
      .domain([0, maxFlows])
      .range([0, SIZE]);

    // const yearTicks = x.ticks(3);

    // Rendering logic
    return (
      <svg width="100%" height={height} className="sources-per-directions">
        <Axis width={width} height={SIZE} scale={x} years={allYears} />

        <g>
          {data.map((direction, i) =>
            <Direction key={direction.name}
                       order={i}
                       width={width}
                       bar={barWidth}
                       data={direction}
                       x={x}
                       y={y}
                       allYears={allYears}
                       />)}
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
      y,
      allYears
    } = this.props;

    const yPos = SIZE;

    function renderRect(local, {year, flows}) {
      let rectYPos,
          rectHeight,
          xOffset
          ;

      rectHeight = Math.max(1,y(flows));
      rectYPos = SIZE - rectHeight;

      if (local) {
        xOffset = bar/4 + 2;
      }
      else {
        xOffset = -bar/4 + 2;
      }

      return (
        <rect key={year}
              className={`${local ? 'local' : 'national'}-bar`}
              width={bar/2}
              height={rectHeight}
              x={x(year) + xOffset}
              y={rectYPos}>
          <title>{`${flows} total flows (${year}) for${local?' non':''} local`}</title>
        </rect>
      );
    }

    function renderUnderline(year, i){
      return  <rect width={bar}
              height={1}
              x={x(year)}
              y={SIZE+2}>
        </rect>
    };

    return (
      <g transform={`translate(0, ${SIZE * order})`}>
        <Axis width={width} height={SIZE} scale={x} years={allYears} />

        <text x={0}
              y={yPos-SIZE/3}
              fill="black">
          {data.name}
        </text>

        {data.local.map(renderRect.bind(null, true))}
        {data.national.map(renderRect.bind(null, false))}
        {allYears.map(renderUnderline)}

      </g>
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
