/**
 * TOFLIT18 Client Infinite Scroll Component
 * ==========================================
 *
 * Simple component exposing some utilities to easily create infinite scrolling
 * behaviors.
 */
import React, {Component} from 'react';

export default class Infinite extends Component {
  handleScroll(e) {
    console.log(e);
  }

  render() {
    return <div onScroll={this.handleScroll}>{this.props.children}</div>;
  }
}
