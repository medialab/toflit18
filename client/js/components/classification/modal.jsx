/**
 * TOFLIT18 Client Classification Modal
 * =====================================
 *
 * Displaying a modal enabling the user to patch/create/fork classifications.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';


/**
 * Main component.
 */
@branch({
  cursors: {
    target: ['states', 'classification', 'browser', 'current'],
    modal: ['states', 'classification', 'modal']
  }
})
export default class ClassificationModal extends Component {
  render() {
    const {modal, target} = this.props;

    return (
      <div className="modal-wrapper">
        <Row className="full-height">
          <Col md={12} className="full-height">
            <div className="panel full-height">
              <ModalTitle name={target.name} action={modal.type} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Displaying an helpful title.
 */
class ModalTitle extends Component {
  render() {
    const {name, action} = this.props;

    let title;

    if (action === 'update')
      title = `Updating "${name}"`;
    else if (action === 'fork')
      title = `Forking "${name}"`;
    else if (action === 'create')
      title = `Creating from "${name}"`;

    return (
      <div>
        <h2>{title}</h2>
        <hr />
      </div>
    );
  }
}
