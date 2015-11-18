/**
 * TOFLIT18 Client Sankey Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';
import scale from 'd3-scale';
import {sum, groupBy} from 'lodash';

/**
 * Helpers
 */

 /**
 * Sankey component
 */
export default class SourcesPerDirections extends Component {
  render() {
    // const {data: {nodes, links}} = this.props;

    let data = {
    	direction : {
    		local : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}],
    		national : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}]
    	},
    	direction1 : {
    		local : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}],
    		national : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}]
    	},
    	direction2 : {
    		local : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}],
    		national : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}]
    	},
    	direction3 : {
    		local : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}],
    		national : [{year:1750, count: 50}, {year:1760, count: 50},{year:1770, count: 50}]
    	}
    }

    let width = 1000,
        height = 600;

    const x = scale.linear()
      .domain([1750, 1770])
      .range([0, width - 100]);


    function renderLocal(d, i) {
      return d.map(function({year, count}) {
        return <rect width={100} height={count} x={x(year)} y={120 * i + 120} fill="blue"/>;
      });
    }

    function renderNational(d, i) {
      return d.map(function({year, count}) {
        return <rect width={100} height={count} x={x(year)} y={120 * i + 70} fill="red"/>;
      });
    }
 
    return (
      <svg width={width} height={height}>
        <g>
          {Object.keys(data).map((k, i) =>
            <line x1={0} y1={120 * i + 120} x2={width} y2={120 * i + 120} stroke="black" strokeWidth="2px" />)}
          {Object.keys(data).map((k, i) => renderLocal(data[k].local, i))}
          { Object.keys(data).map((k, i) => renderNational(data[k].local, i))}
        </g>
      </svg>
    );
  }
}

/**
 * Line component
 */
class Line extends Component {
  render() {
    const {x1, y1, X2, Y2} = this.props;

    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
    );
  }
}

/**
 * Rect component
 */
class Rect extends Component {
  render() {
    const {height, width, x, y} = this.props;

    return (
      <rect width={width} height={height} x={x} y={y}/>
    );
  }
}


