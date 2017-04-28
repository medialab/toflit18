/**
 * Bootstrap Loader Components
 * ============================
 *
 * Collection of loading indicators.
 */
import React, {Component} from 'react';
import Ladda from 'ladda';

/**
 * A classic round spinner created from a hacked Ladda button.
 */
export class Spinner extends Component {

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.refs.button;
    this.ladda = Ladda.create(dom);

    this.ladda.start();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    this.ladda.remove();
    this.ladda = null;
  }

  render() {
    return (
      <div className="loader">
        <button
          ref="button"
          type="button"
          className="btn btn-primary ladda-button"
          data-style="contract">
          <span className="ladda-label">&nbsp;</span>
        </button>
      </div>
    );
  }
}

/**
 * Three moving little dots...
 */
export class Waiter extends Component {
  static defaultProps = {
    align: 'center'
  };

  constructor() {
    super();

    this.state = {dots: '...'};

    // Ticking
    this.interval = setInterval(() => {
      if (this.state.dots.length === 3)
        this.setState({dots: ''});
      else
        this.setState({dots: this.state.dots + '.'});
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const dots = this.state.dots.replace(/\./g, '\u00b7'),
          align = this.props.align;

    return <div className="waiter" style={{textAlign: align}}>{dots}&nbsp;</div>;
  }
}
