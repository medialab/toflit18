/**
 * TOFLIT18 Client Icon Component
 * ==========================================
 *
 * Simple pure component to deal with icons in the app
 */
import React from 'react';
import cls from 'classnames';

export default ({name, className, source = 'icons'}) => (
  <svg
    aria-hidden="true"
    className={cls('icon ' + name, className)} >
    <use xlinkHref={`./assets/svg/${source}/${source}.svg#${name}`} />
  </svg>
);
