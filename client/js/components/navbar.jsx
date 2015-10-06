/**
 * TOFLIT18 Client NavBar Component
 * =================================
 *
 */
import React, {Component} from 'react';
import {changeRoute} from '../actions/route';
import {branch} from 'baobab-react/decorators';
import cls from 'classnames';

const LINKS = [
  {
    label: 'Exploration',
    url: 'exploration'
  },
  {
    label: 'Classification',
    url: 'classification'
  }
];

@branch({
  actions: {
    navigate: changeRoute
  },
  cursors: {
    route: ['route']
  }
})
export default class NavBar extends Component {
  render() {
    const route = this.props.route,
          navigate = this.props.actions.navigate;

    return (
      <div>
        <div className="navbar-emphasis" />
        <nav className="navbar navbar-light bg-faded">
          <div className="container">
            <a className="navbar-brand" href="#">TOFLIT18</a>
            <ul className="nav navbar-nav">
              {LINKS.map(l => (
                <li className={cls('nav-item', l.url === route && 'active')}
                    key={l.url}
                    onClick={navigate.bind(null, l.url)}>
                  <a className="nav-link" href="#">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
