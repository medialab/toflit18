/**
 * TOFLIT18 Client Infinite Scroll Component
 * ==========================================
 *
 * Simple component exposing some utilities to easily create infinite scrolling
 * behaviors.
 */
import React, {Component} from 'react';
import Loader from '../bootstrap/loader.jsx';
import {debounce} from 'lodash';

export default class Infinite extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {loading: false};
  }

  handleScroll({target}) {
    const {
      scrollHeight,
      scrollTop,
      offsetHeight: height
    } = target;

    const scrollBottom = scrollHeight - height,
          distanceToBottom = scrollBottom - scrollTop;

    if (distanceToBottom < 200 &&
        !this.state.loading &&
        typeof this.props.action === 'function') {
      this.setState({loading: true});

      const promise = this.props.action(),
            reset = () => this.setState({loading: false});
      promise.then(reset, reset);
    }
  }

  render() {
    const className = this.props.className || false;

    const scrollHandler = e => this.handleScroll(e);

    return (
      <div className={className}
           onScroll={debounce(scrollHandler, 500)}>
        {this.props.children}
        {this.state.loading && <Loader />}
      </div>
    );
  }
}
