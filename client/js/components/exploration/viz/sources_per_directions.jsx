/**
 * TOFLIT18 Client Sankey Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';
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
    		local : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}],
    		national : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}]
    	},
    	direction1 : {
    		local : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}],
    		national : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}]
    	},
    	direction2 : {
    		local : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}],
    		national : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}]
    	},
    	direction3 : {
    		local : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}],
    		national : [{year:1750, count: 50}, {year:1750, count: 50},{year:1750, count: 50}]
    	}
    }

    let width = 1000,
        height = 600;

    return (

    	<div>Hello viz</div>

     /* <svg width={width} height={height}>
        <g>
          {data.map((data, i) =>
          <line x1=0 y1=
          />
          <rect width={nodeWidth}
                height={30}
                x={nodeWidth * i + nodePadding}
                y={15}
                key={i} />)}
          {nodes.slice(5).map((data, i) =>
          <rect width={nodeWidth}
                height={30}
                x={nodeWidth * i + nodePadding}
                y={115}
                key={i} />)}
        </g>
      </svg>*/
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


