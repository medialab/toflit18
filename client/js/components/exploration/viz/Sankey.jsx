/**
 * TOFLIT18 Client Login Component
 * ================================
 *
 * Displayed when user authentication is required to continue.
 */
import React, {Component} from 'react';

/**
 * Helpers
 */



/**
 * Sankey component
 */
export default class Sankey extends Component {
  render() {
    const {data} = this.props; 

  let width = 1000,
  height = 600;

  let sankey = {},
    nodeWidth = 10,
    nodePadding = 8,
    nodes = [],
    links = [];

    return (
      <svg width={width} height={height}> </svg>
    );
  }
}
