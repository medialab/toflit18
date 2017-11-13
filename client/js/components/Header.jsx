/**
 * TOFLIT18 Client Header Component
 * =================================
 *
 */
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import cls from 'classnames';
import Icon from './misc/Icon.jsx';

const LINKS = {
  data: [
    '/exploration/meta',
    '/classification/browser',
  ],
  view: [
    '/exploration/indicators',
    '/exploration/network',
    '/exploration/terms',
  ],
  glossary: '/glossary',
  about: '/about',
  legal: '/legal',
};

export default class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.menus = [];
    this.state = {
      deployedMenu: null,
      deployedBurger: false
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleBurger = this.toggleBurger.bind(this);
    this.handleClickBody = this.handleClickBody.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.handleClickBody);
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickBody);
  }

  handleClickBody(e) {
    if (!this.state.deployedMenu) return;

    let node = e.target;
    let isOut = true;
    let maxDepth = 4;

    while (node && --maxDepth) {
      if (this.menus.includes(node)) {
        isOut = false;
        break;
      }

      node = node.parentNode;
    }

    if (isOut)
      this.setState({deployedMenu: null});
  }
  toggleMenu(menu) {
    if (this.state.deployedMenu === menu)
      this.setState({deployedMenu: null});
    else
      this.setState({deployedMenu: menu});
  }
  toggleBurger() {
    this.setState({
      deployedBurger: !this.state.deployedBurger
    });
  }

  render() {
    const {
      deployedMenu,
      deployedBurger
    } = this.state;
    const router = this.context.router;

    function isActive(urls) {
      return (Array.isArray(urls) ? urls : [urls]).some(url => router.isActive(url));
    }

    return (
      <header>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <button
                type="button"
                className={cls('navbar-toggle', deployedBurger ? 'in' : 'collapsed')}
                aria-expanded={deployedBurger ? 'true' : 'false'}
                onClick={e => {
                  e.preventDefault();
                  this.toggleBurger();
                }} >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <Link className="navbar-brand" to="/home">
                <span className="sr-only">TOFLIT18</span>
                <Icon
                  source="logotype"
                  name="icon-logotype" />
              </Link>
            </div>
            <div
              className={cls('navbar-collapse', deployedBurger ? 'in' : 'collapse')}
              aria-expanded={deployedBurger ? 'true' : 'false'}
              id="bs-example-navbar-collapse-1" >
              <ul className="nav navbar-nav">
                <li
                  className={cls(
                    'dropdown',
                    deployedMenu === 'data' && 'open',
                    isActive(LINKS.data) && 'active',
                  )}>
                  <a
                    href="#"
                    ref={ref => this.menus.push(ref)}
                    className="dropdown-toggle dropdown-caret"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={deployedMenu === 'data' ? 'true' : 'false'}
                    onClick={e => {
                      e.preventDefault();
                      this.toggleMenu('data');
                    }} >
                    <span>Data</span>
                    <Icon name="icon-arrow-down" />
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/exploration/meta">Metadata</Link>
                    </li>
                    <li>
                      <Link to="/classification/browser">Classifications</Link>
                    </li>
                  </ul>
                </li>
                <li
                  className={cls(
                    'dropdown',
                    deployedMenu === 'view' && 'open',
                    isActive(LINKS.view) && 'active',
                  )}>
                  <a
                    href="#"
                    ref={ref => this.menus.push(ref)}
                    className="dropdown-toggle dropdown-caret"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={deployedMenu === 'view' ? 'true' : 'false'}
                    onClick={e => {
                      e.preventDefault();
                      this.toggleMenu('view');
                    }} >
                    <span>View</span>
                    <Icon name="icon-arrow-down" />
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to="/exploration/indicators">Indicators</Link>
                    </li>
                    <li>
                      <Link to="/exploration/network">Countries Network</Link>
                    </li>
                    <li>
                      <Link to="/exploration/terms">Product Terms</Link>
                    </li>
                  </ul>
                </li>
                <li className={cls(isActive(LINKS.glossary) && 'active')}>
                  <Link to="/glossary">Glossary</Link>
                </li>
                <li className={cls(isActive(LINKS.about) && 'active')}>
                  <Link to="/about">About</Link>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li className={cls(isActive(LINKS.legal) && 'active')}>
                  <Link to="/legal">Legal notice</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

Header.contextTypes = {
  router: PropTypes.object
};
