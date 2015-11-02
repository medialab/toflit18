/**
 * TOFLIT18 Client Classification Modal
 * =====================================
 *
 * Displaying a modal enabling the user to patch/create/fork classifications.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';
import FileInput from '../misc/file.jsx';
import {Waiter} from '../bootstrap/loaders.jsx';

import {
  parse
} from '../../actions/patch';

/**
 * Main component.
 */
@branch({
  actions: {
    parse
  },
  cursors: {
    target: ['states', 'classification', 'browser', 'current'],
    modal: ['states', 'classification', 'modal']
  }
})
export default class ClassificationModal extends Component {
  render() {
    const {actions, modal, target} = this.props;

    const hasInconsistencies = !!(modal.inconsistencies || []).length;

    return (
      <div className="modal-wrapper">
        <Row className="full-height">
          <Col md={12} className="full-height">
            <div className="panel full-height">
              <ModalTitle name={target.name}
                          model={target.model}
                          action={modal.type} />
              <Upload parser={actions.parse} />
              {hasInconsistencies && <ConsistencyReport report={modal.inconsistencies} />}
              {modal.step === 'review' && <Review />}
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
    const {action, name, model} = this.props;

    let title;

    if (action === 'update')
      title = `Updating "${name} (${model})"`;
    else if (action === 'fork')
      title = `Forking "${name} (${model})"`;
    else if (action === 'create')
      title = `Creating from "${name} (${model})"`;

    return (
      <div>
        <h3>{title}</h3>
        <hr />
      </div>
    );
  }
}

/**
 * Upload form.
 */
class Upload extends Component {
  render() {
    const parser = this.props.parser;

    return (
      <div>
        <Row>
          <Col md={6}>
            <FileInput onFile={file => parser(file)}/>
          </Col>
          <Col md={3}>
            <input type="text"
                   className="form-control"
                   placeholder="delimiter [ , ]" />
          </Col>
          <Col md={3}>
            <input type="text"
                   className="form-control"
                   placeholder={'escape character [ " ]'} />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="explanation">
            <em>
              Here, there should be some recapitulative text about the expected format,
              the desired headers and what should be inside each column...
            </em>
          </Col>
        </Row>
        <hr />
      </div>
    );
  }
}

/**
 * Consistency step.
 */
class ConsistencyReport extends Component {
  render() {
    const report = this.props.report;

    return (
      <div>
        <h5 className="red">There seems to be some consistency issues with your file:</h5>
        <ul className="consistency-report">
          {report.map(error => <InconsistentItem key={error.item} error={error} />)}
        </ul>
      </div>
    );
  }
}

/**
 * Inconsistent item.
 */
class InconsistentItem extends Component {
  render() {
    const error = this.props.error;

    const text = `Line n°${error.index} - the "${error.item}" item has been ` +
                 `linked to ${error.groups.length} groups.`;

    return <li>{text}</li>;
  }
}

/**
 * Review step.
 */
class Review extends Component {
  render() {
    return (
      <div>
        <h4>Review</h4>
        <Waiter align="left" />
      </div>
    );
  }
}
