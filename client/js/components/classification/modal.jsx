/**
 * TOFLIT18 Client Classification Modal
 * =====================================
 *
 * Displaying a modal enabling the user to patch/create/fork classifications.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';

export default class ClassificationModal extends Component {
  render() {
    return (
      <div className="modal-wrapper">
        <Row className="full-height">
          <Col md={12} className="full-height">
            <div className="panel full-height">
              This is a very fancy modal, isn't it?
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
