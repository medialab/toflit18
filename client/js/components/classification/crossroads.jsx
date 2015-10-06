/**
 * TOFLIT18 Client Classification Crossroads
 * ==========================================
 *
 * Letting the user choose what he wants to do
 */
import React from 'react';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';

export default function ClassificationCrossroads() {
  return (
    <div className="crossroads-wrapper">
      <Row>
        <Col md={2} />
        <Col md={8}>
          <div className="panel" style={{textAlign: 'center'}}>
            <Button kind="secondary">Browse</Button>
            <Button kind="secondary">Create</Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
