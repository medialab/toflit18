import devcards from 'devcards';
import React from 'react';
import Button from '../components/misc/Button.jsx';

const devcard = devcards.ns('Misc');

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
  <div style={{textAlign: 'center'}}>
    <div style={{marginBottom: '10px'}}>
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
    <div style={{marginBottom: '10px'}}>
      {KINDS.map(kind => {
        return (
          <Button key={kind}
                  kind={kind}
                  style={{marginRight: '10px'}}
                  loading>
            {kind}
          </Button>
        );
      })}
    </div>
    <div>
      {KINDS.map(kind => {
        return (
          <Button key={kind}
                  kind={kind}
                  style={{marginRight: '10px'}}
                  disabled>
            {kind}
          </Button>
        );
      })}
    </div>
  </div>
);
