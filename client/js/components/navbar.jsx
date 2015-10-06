/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';
import {Link} from 'react-router';
import cls from 'classnames';

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
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
