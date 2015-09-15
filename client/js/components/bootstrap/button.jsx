/**
 * Bootstrap Button Components
 * =============================
 *
 * Collection of Bootstrap v4 button-related components.
 */
import React, {Component} from 'react';

export default class Button extends Component {
  render() {
    const kind = this.props.kind,
          cls = `btn btn-${kind}`;

    return (
      <button type="button"
              className={cls}
              onClick={this.props.onClick}>
        {this.props.children}
      </button>
    );
  }
}
