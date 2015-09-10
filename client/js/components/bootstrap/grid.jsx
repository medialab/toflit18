/**
 * Bootstrap Grid Components
 * ==========================
 *
 * Collection of Bootstrap v4 grid-related components.
 */
import React, {Component} from 'react';

export class Row extends Component {
  render() {
    return <div className="row">{this.props.children}</div>;
  }
}

export class Col extends Component {
  render() {
    const cls = `col-md-${this.props.md}`;

    return <div className={cls}>{this.props.children}</div>;
  }
}
