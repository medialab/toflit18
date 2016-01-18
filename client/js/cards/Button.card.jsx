import devcards from 'devcards';
import React from 'react';
import Button from '../components/misc/Button.jsx';

var devcard = devcards.ns('Button');

const KINDS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger'
];

devcard(
  'Buttons',
  `
  Stylized Bootstrap v4 buttons used accross the TOFLIT18 application.
  `,
  <div>
    {KINDS.map(kind => {
      return (
        <Button key={kind}
                kind={kind}
                style={{marginRight: '10px'}}>
          {kind}
        </Button>
      );
    })}
  </div>
);

devcard(
  'Loading Buttons',
  `
  We are enhancing Boostrap buttons with Ladda in order to display nice
  looking loaders.
  `,
  <div>
    {KINDS.map(kind => {
      return (
        <Button key={kind}
                kind={kind}
                style={{marginRight: '10px'}}
                loading={true}>
          {kind}
        </Button>
      );
    })}
  </div>
);

devcard(
  'Disabled Buttons',
  `
  Buttons can of course be disabled.
  `,
  <div>
    {KINDS.map(kind => {
      return (
        <Button key={kind}
                kind={kind}
                style={{marginRight: '10px'}}
                disabled={true}>
          {kind}
        </Button>
      );
    })}
  </div>
);
