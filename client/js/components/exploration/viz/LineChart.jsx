/**
 * TOFLIT18 Data Line Chart Component
 * ===================================
 *
 * Basic line chart component describing flows along the years.
 */
import React, {Component} from 'react';
import measured from '../../../lib/measured';
import {six as palette} from '../../../lib/palettes';
import scale from 'd3-scale';
import shape from 'd3-shape';
import {flatten, min, max} from 'lodash';
import {prettyPrint} from '../../../lib/helpers';

/**
 * Main component.
 */
@measured
export default class LineChart extends Component {
  render() {
    let {data, width: fullWidth} = this.props;

    if (!data.length)
      return <svg width="100%" />;

    if (!fullWidth)
      return <svg width="100%" />;

    const margin = {
      top: 10,
      right: 10,
      left: 100,
      bottom: 30
    };

    const height = 180;

    const width = fullWidth - margin.left - margin.right,
          fullHeight = height + margin.top + margin.bottom;

    // Computing max values
    const fullData = flatten(data);

    const minYear = min(fullData, d => d.year).year,
          maxYear = max(fullData, d => d.year).year,
          maxValue = max(fullData, d => d.value).value;

    // Building scales
    const x = scale.linear()
      .domain([minYear, maxYear])
      .range([0, width]);

    const y = scale.linear()
      .domain([0, maxValue])
      .range([height, 0]);

    // Shapes
    const line = shape.line()
      .x(d => x(d.year))
      .y(d => y(d.value));

    function renderLine(points, i) {
      const parts = points.reduce(function(acc, point) {
        const lastPart = acc[acc.length - 1] || [],
              lastItem = lastPart[lastPart.length - 1];

        if (lastItem && (point.year - lastItem.year) <= 1) {
          lastPart.push(point);
        }
        else {
          acc.push([point]);
        }

        return acc;
      }, []);

      return parts.map(function(part) {

        // Rendering a whole series
        if (part.length > 1)
          return <path stroke={palette[i]} d={line(part)} />;

        // Rendering a single point in time
        const point = part[0];

        return <circle cx={x(point.year)}
                       cy={y(point.value)}
                       r={1.5}
                       fill={palette[i]} />;
      });
    }

    return (
      <svg width="100%" height={fullHeight} className="line-chart">
        <XAxis width={fullWidth}
               height={fullHeight}
               margin={margin}
               scale={x} />
        <YAxis width={fullWidth}
               height={fullHeight}
               margin={margin}
               scale={y} />
        <g className="points" transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map(renderLine)}
        </g>
      </svg>
    );
  }
}

/**
 * X axis.
 */
class XAxis extends Component {
  render() {
    const {margin, width, height, scale} = this.props;

    const bottom = height - margin.bottom;

    const ticks = scale.ticks();

    function renderTick(t, i) {
      const left = margin.left + scale(t);

      return (
        <g key={i} className="tick" transform={`translate(${left}, ${bottom})`}>
          <line y2={5} />
          <text y={15} textAnchor="middle">
            {t}
          </text>
        </g>
      );
    }

    return (
      <g className="x axis">
        <line x1={margin.left}
              x2={width - margin.right}
              y1={bottom}
              y2={bottom} />
        {ticks.map(renderTick)}
      </g>
    );
  }
}

/**
 * Y axis.
 */
class YAxis extends Component {
  render() {
    const {margin, width, height, scale} = this.props;

    const ticks = scale.ticks();

    function renderTick(t, i) {
      const top = (margin.top + scale(t));

      return (
        <g key={i} className="tick" transform={`translate(${margin.left}, ${top})`}>
          <line x1={-5} x2={0} textAnchor="right" />
          <text x={-7} y="0.32em" textAnchor="end">
            {prettyPrint(t)}
          </text>
          <line className="dotted" x2={width - margin.right - margin.left} />
        </g>
      );
    }

    return (
      <g className="y axis">
        <line x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={height - margin.bottom} />
        {ticks.filter(d => !!d).map(renderTick)}
      </g>
    );
  }
}
