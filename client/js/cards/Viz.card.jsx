import devcards from 'devcards';
import React from 'react';
import Fetcher from '@yomguithereal/react-utilities/Fetcher';
import HelloViz from '../components/exploration/viz/HelloViz.jsx';

const devcard = devcards.ns('HelloViz');

devcard(
  'hello viz',
  'hello world',
  <Fetcher url="/directions_per_year.json">
    <HelloViz />
  </Fetcher>
);
