/**
 * TOFLIT18 Client Icon Component
 * ==========================================
 *
 * Simple pure component to deal with icons in the app
 */
import React from 'react';

export default ({name, source = 'icons'}) => (
  <svg
    aria-hidden="true"
    className={'icon ' + name} >
    <use xlinkHref={`./assets/svg/${source}/${source}.svg#${name}`} />
  </svg>
);
