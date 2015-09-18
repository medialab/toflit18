/**
 * Bootstrap Button Components
 * =============================
 *
 * Collection of Bootstrap v4 button-related components.
 */
import React, {Component} from 'react';
import Ladda from 'ladda';

export default class Button extends Component {

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.refs.button;
    this.ladda = Ladda.create(dom);

    if (this.props.loading)
      this.ladda.start();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    this.ladda.remove();
    this.ladda = null;
  }

  // Updating loading status
  componentDidUpdate() {
    if (this.props.loading)
      this.ladda.start();
    else
      this.ladda.stop();
  }

  render() {
    const {kind} = this.props,
          cls = `btn btn-${kind} ladda-button`;

    return (
      <button ref="button"
              type="button"
              data-style="slide-left"
              className={cls}
              onClick={this.props.onClick}>
        <span className="ladda-label">
          {this.props.children}
        </span>
      </button>
    );
  }
}
