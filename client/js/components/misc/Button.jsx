/**
 * Bootstrap Button Components
 * ============================
 *
 * Collection of Bootstrap v4 button-related components.
 */
import React, {Component} from 'react';
import cls from 'classnames';
import Ladda from 'ladda';

export default class Button extends Component {

  constructor(props){
    super(props);
    this.setButtonRef = (button) => {
      this.button = button
    }
  }

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.button;
    this.ladda = Ladda.create(dom);
    if (this.props.loading)
      this.ladda.start();
  }

  // Updating loading status
  componentDidUpdate() {
    if(this.ladda)
      if (this.props.loading)
        this.ladda.start();
      else
        this.ladda.stop();
  }

  // Tearing the ladda button
  componentWillUnmount() {
    if(this.ladda){
    this.ladda.remove();
    this.ladda = null;}
  }


  render() {
    const {
      kind = 'primary',
      disabled,
      onClick,
      size,
      style = {}
    } = this.props;

    let classes = `btn btn-${kind} ladda-button`;

    if (disabled)
      classes += ' disabled';

    if (size)
      classes += (size === 'small' ? ' btn-sm' : 'btn-lg');

    const optional = {};

    if (kind === 'secondary')
      optional['data-spinner-color'] = '#373a3c';

    return (
      <button
        ref={this.setButtonRef}
        type="button"
        data-style="slide-left"
        className={classes}
        style={style}
        onClick={e => !disabled && typeof onClick === 'function' && onClick(e)}
        {...optional}>
        <span className="ladda-label">
          {this.props.children}
        </span>
      </button>
    );
  }
}

export class ExportButton extends Component {
  constructor(...args) {
    super(...args);
    this.state = {deployed: false};

    this.toggleList = this.toggleList.bind(this);
    this.handleClickBody = this.handleClickBody.bind(this);
    this.setButtonRef = (button) => {
        this.button = button
      }
    
    document.body.addEventListener('click', this.handleClickBody);

  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickBody);
    
  // Tearing the ladda button
  if(this.ladda){
    this.ladda.remove();
    this.ladda = null;}
  }

  // Mounting the ladda button
  componentDidMount() {
    const dom = this.button;
    this.ladda = Ladda.create(dom);
    if (this.props.loading)
      this.ladda.start();
  }

  // Updating loading status
  componentDidUpdate() {
    if (this.ladda)
      if (this.props.loading)
        this.ladda.start();
      else
        this.ladda.stop();
  }


  handleClickBody(e) {
    if (!this.state.deployed) return;

    const dom = this.refs.root;
    let node = e.target;
    let isOut = true;
    let maxDepth = 4;

    while (node && maxDepth-- && isOut) {
      if (node === dom) isOut = false;

      node = node.parentNode;
    }

    if (isOut) this.setState({deployed: false});
  }
  toggleList() {
    if (this.props.exports.length === 1) {
      this.props.exports[0].fn();
    }
    else if (this.props.exports.length > 1) {
      this.setState({deployed: !this.state.deployed});
    }
  }

  render() {
    return (
      <div
        ref="root"
        className={cls(
          'dropup',
          this.state.deployed && 'open'
        )}>
        <button
          ref={this.setButtonRef}
          type="button"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={this.toggleList}
          disabled={this.props.disabled || this.props.exports.length == 0}
          className={cls(
            'btn',
            'btn-default',
            this.props.exports.length > 1 && 'dropdown-toggle'
          )}>
          <span>Exports</span>
          { this.props.exports.length > 1 && <span className="caret" /> }
        </button>
        {
          this.props.exports.length > 1 &&
          <ul className="dropdown-menu">{
            this.props.exports.map(({label, fn}) => (
              <li
                key={label}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  fn();
                }}>
                <a href="#">{label}</a>
              </li>
            ))
          }</ul>
        }
      </div>
    );
  }
}
