/**
 * TOFLIT18 Client Classification Crossroads
 * ==========================================
 *
 * Letting the user choose what he wants to do
 */
import React from 'react';
import {branch} from 'baobab-react/higher-order';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';
import {changeSubroute} from '../../actions/route';

function Crossroads({actions: {navigate}}) {
  return (
    <div className="crossroads-wrapper">
      <Row>
        <Col md={2} />
        <Col md={8}>
          <div className="panel" style={{textAlign: 'center'}}>
            <Button kind="secondary" onClick={navigate.bind(null, 'browse')}>Browse</Button>
            <Button kind="secondary">Create</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default branch(Crossroads, {
  actions: {
    navigate: changeSubroute
  }
});
