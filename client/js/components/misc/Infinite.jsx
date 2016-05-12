/**
 * TOFLIT18 Client Infinite Scroll Component
 * ==========================================
 *
 * Simple component exposing some utilities to easily create infinite scrolling
 * behaviors.
 */
import React, {Component} from 'react';
import {Spinner} from './Loaders.jsx';

export default class Infinite extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {loading: false};
    this.currentCall = null;
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextState.tracker !== this.state.tracker) && this.currentCall) {
      this.currentCall.abort();
    }
  }

  handleScroll({target}) {

    const {
      scrollHeight,
      scrollTop,
      offsetHeight: height
    } = target;

    const scrollBottom = scrollHeight - height,
          distanceToBottom = scrollBottom - scrollTop;

    if (distanceToBottom < 500 &&
        !this.state.loading &&
        typeof this.props.action === 'function') {

      const promise = this.props.action(),
            reset = () => this.setState({loading: false});

      if (!promise)
        return;

      this.currentCall = promise;

      this.setState({loading: true});

      promise.then(reset, reset);
    }
  }

  render() {
    const className = this.props.className || false;

    const scrollHandler = e => this.handleScroll(e);

    return (
      <div className={className}
           onScroll={scrollHandler}>
        {this.props.children}
        {this.state.loading && <Spinner />}
      </div>
    );
  }
}
