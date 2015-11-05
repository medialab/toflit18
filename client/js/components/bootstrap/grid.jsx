/**
 * Bootstrap Grid Components
 * ==========================
 *
 * Collection of Bootstrap v4 grid-related components.
 */
import React, {Component} from 'react';
import cls from 'classnames';

export class Row extends Component {
  render() {
    return <div className={cls('row', this.props.className)}>{this.props.children}</div>;
  }
}

export class Col extends Component {
  render() {
    const size = `col-md-${this.props.md}`;

    return <div {...this.props} className={cls(size, this.props.className)}>{this.props.children}</div>;
  }
}
