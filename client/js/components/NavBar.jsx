/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import cls from 'classnames';
import {logout} from '../actions/session';

@branch({
  actions: {logout},
  cursors: {
    logged: ['flags', 'logged']
  }
})
export default class NavBar extends Component {
  render() {
    const {
      logged,
      onMenu,
      sidenavOpened
    } = this.props;

    if (!logged)
      return null;

    const logoutButton = (
      <span className="nav-item">
        <a className="nav-link logout"
          onClick={() => this.props.actions.logout()}>
          Logout
        </a>
      </span>
    );

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
              {logged && logoutButton}
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
