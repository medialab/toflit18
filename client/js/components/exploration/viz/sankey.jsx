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
    const {data, height, width} = this.props; 

    margin = {top: 1, right: 1, bottom: 6, left: 1},
	width = document.querySelector('#chart').offsetWidth,
	height = 600;

	sankey = {},
	nodeWidth = 10,
	nodePadding = 8,
	nodes = [],
	links = [];

    return (
      <svg width="width" height="height"> </svg>
    );
  }
}
