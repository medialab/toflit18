/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Link} from 'react-router';
import cls from 'classnames';
import {logout} from '../actions/session';

const LINKS = [
  {
    label: 'Exploration',
    url: '/exploration'
  },
  {
    label: 'Classification',
    url: '/classification/browser'
  }
];

@branch({
  actions: {logout}
})
export default class NavBar extends Component {
  static contextTypes = {
    history: React.PropTypes.object
  };

  render() {
    const history = this.context.history;

    return (
      <div>
        <div className="navbar-emphasis" />
        <nav className="navbar navbar-light bg-faded">
          <div className="container">
            <a className="navbar-brand" href="#">TOFLIT18</a>
            <ul className="nav navbar-nav">
              {LINKS.map(l => (
                <li className={cls('nav-item', {active: history.isActive(l.url)})}
                    key={l.url}>
                  <Link to={l.url}
                        className="nav-link">{l.label}</Link>
                </li>
              ))}
              <li className="nav-item pull-right">
                <a className="nav-link logout"
                   onClick={() => this.props.actions.logout()}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
