/**
 * TOFLIT18 Client Side Navigation Component
 * ==========================================
 *
 * Component rendering the side navigation that one can toggle.
 */
import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import cls from 'classnames';

const LINKS = [
  {
    label: 'MetaData',
    url: '/exploration/meta'
  },
  {
    label: 'Classifications',
    url: '/classification/browser'
  },
  {
    label: 'Indicators',
    url: '/exploration/indicators'
  },
  {
    label: 'Countries Network',
    url: '/exploration/globals'
  },
  {
    label: 'Product Terms',
    url: '/exploration/globalsterms'
  }
];

export default function SideNav(props, context) {
  const {
    opened = false,
    onClose
  } = props;

  const router = context.router;

  return (
    <div>
      <div id="sidenav" className={cls(opened && 'opened')}>
        {/* <a className="close-btn" onClick={onClose}>&times;</a> */}
        <ul className="sidenav-links">
          {LINKS.map(link => {
            return (
              <li
                key={link.url}
                className={cls('sidenav-link', router.isActive(link.url) && 'active')}>
                <Link to={link.url} onClick={onClose}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        id="sidenav-overlay"
        className={cls(opened && 'opened')}
        onClick={onClose} />
    </div>
  );
}

SideNav.contextTypes = {
  router: PropTypes.object
};
