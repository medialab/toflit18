/**
 * Bootstrap Loader Component
 * ===========================
 *
 * Hacking a Ladda button to serve as loading indicator.
 */
import React, {Component} from 'react';
import Ladda from 'ladda';

export default class Loader extends Component {

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.refs.button;
    this.ladda = Ladda.create(dom);

    this.ladda.start();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    this.ladda.remove();
    this.ladda = null;
  }

  render() {
    return (
      <div className="loader">
        <button ref="button"
                type="button"
                className="btn btn-primary ladda-button"
                data-style="contract">
          <span className="ladda-label">&nbsp;</span>
        </button>
      </div>
    );
  }
}
