/**
 * TOFLIT18 Client Header Component
 * =================================
 *
 */
import React, {Component, PropTypes} from 'react';
import cls from 'classnames';
import Icon from './misc/Icon.jsx';

const LINKS = {
  data: [
    '/exploration/meta',
    '/classification/browser',
    '/sources',
  ],
  view: [
    '/exploration/indicators',
    '/exploration/network',
    '/exploration/terms',
  ],
  glossary: [
    '/glossary',
    '/concepts',
  ],
  sources: '/sources',
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
    function isActive(urls) {
      const fragmentPathname = ((location.hash || '#').match(/#([^\?]*)(?:\?|$)/) || [])[1] || '';
      return (Array.isArray(urls) ? urls : [urls]).some(url => url === fragmentPathname);
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
              <a className="navbar-brand" href="#/home">
                <span className="sr-only">TOFLIT18</span>
                <Icon
                  source="logotype"
                  name="icon-logotype" />
              </a>
            </div>
            <div
              className={cls('navbar-collapse', deployedBurger ? 'in' : 'collapse')}
              aria-expanded={deployedBurger ? 'true' : 'false'}
              id="bs-example-navbar-collapse-1" >
              <ul className="nav navbar-nav">
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
                    <span>Explore trade</span>
                    <Icon name="icon-arrow-down" />
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a href="#/exploration/indicators">Time Series</a>
                    </li>
                    <li>
                      <a href="#/exploration/network">Locations Network</a>
                    </li>
                    <li>
                      <a href="#/exploration/terms">Product Terms Network</a>
                    </li>
                  </ul>
                </li>
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
                      <a href="#/exploration/meta">Metadata</a>
                    </li>
                    <li>
                      <a href="#/classification/browser">Classifications</a>
                    </li>
                    <li>
                      <a href="#/exploration/sources">Sources</a>
                    </li>
                  </ul>
                </li>
                <li
                  className={cls(
                    'dropdown',
                    deployedMenu === 'glossary' && 'open',
                    isActive(LINKS.glossary) && 'active',
                  )}>
                  <a
                    href="#"
                    ref={ref => this.menus.push(ref)}
                    className="dropdown-toggle dropdown-caret"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={deployedMenu === 'glossary' ? 'true' : 'false'}
                    onClick={e => {
                      e.preventDefault();
                      this.toggleMenu('glossary');
                    }} >
                    <span>Glossary</span>
                    <Icon name="icon-arrow-down" />
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a href="#/glossary/products">Products</a>
                    </li>
                    <li>
                      <a href="#/glossary/concepts">Concepts</a>
                    </li>
                  </ul>
                </li>
                <li className={cls(isActive(LINKS.about) && 'active')}>
                  <a href="#/about">About</a>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li className={cls(isActive(LINKS.legal) && 'active')}>
                  <a href="#/legal">Legal notice</a>
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
