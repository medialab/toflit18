/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';
import cls from 'classnames';

export default class NavBar extends Component {
  render() {
    const {
      onMenu,
      sidenavOpened
    } = this.props;

    return (
      <div>
        <nav className="navbar navbar-toggleable-md fixed-top navbar-light bg-faded">
          <div className="container">
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className={cls('nav-item', 'menu-link', sidenavOpened && 'active')} onClick={onMenu}>
                  <a className="nav-link">
                    <i className="fa fa-bars" />
                  </a>
                </li>
                <li className="nav-item menu-link">
                  <a className="navbar-brand" href="#">TOFLIT18</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
