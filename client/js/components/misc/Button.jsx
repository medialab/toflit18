/**
 * Bootstrap Button Components
 * ============================
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

  // Updating loading status
  componentDidUpdate() {
    if (this.props.loading)
      this.ladda.start();
    else
      this.ladda.stop();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    this.ladda.remove();
    this.ladda = null;
  }

  render() {
    const {kind, disabled, onClick, size} = this.props;

    let cls = `btn btn-${kind} ladda-button`;

    if (disabled)
      cls += ' disabled';

    if (size)
      cls += (size === 'small' ? ' btn-sm' : 'btn-lg');

    const optional = {};

    if (kind === 'secondary')
      optional['data-spinner-color'] = '#373a3c';

    return (
      <button ref="button"
              type="button"
              data-style="slide-left"
              className={cls}
              onClick={e => !disabled && typeof onClick === 'function' && onClick(e)}
              {...optional}>
        <span className="ladda-label">
          {this.props.children}
        </span>
      </button>
    );
  }
}

export class ButtonGroup extends Component {
  render() {
    return <div className="btn-group" role="group">{this.props.children}</div>;
  }
}
