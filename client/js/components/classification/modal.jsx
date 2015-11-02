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
import {groupBy} from 'lodash';

import * as patchActions from '../../actions/patch';

// TODO: decide whether to separate panels

/**
 * Main component.
 */
@branch({
  actions: patchActions,
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
              <Upload parser={actions.parse} reset={actions.reset} />
              {hasInconsistencies && <ConsistencyReport report={modal.inconsistencies} />}
              {modal.step === 'review' &&
                <Review get={actions.review.bind(null, target.id)}
                        loading={modal.loading}
                        review={modal.review} />}
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
    const {parser, reset} = this.props;

    return (
      <div>
        <Row>
          <Col md={6}>
            <FileInput onFile={file => parser(file)} onReset={reset} />
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
  constructor(props, context) {
    super(props, context);

    if (!props.review)
      props.get();
  }

  render() {
    const {loading, review} = this.props;

    const body = (loading || !review) ?
      <Waiter align="left" /> :
      (
        <div>
          <Integrity data={review.integrity} />
          <Operations data={review.operations} />
        </div>
      );

    return (
      <div className="review">
        {body}
      </div>
    );
  }
}

/**
 * Integrity.
 */
class Integrity extends Component {
  render() {
    const {extraneous, missing} = this.props.data;

    return (
      <div>
        <Row className="integrity-report full-height">
          <Col md={6} className="extraneous full-height">
            <hr />
            Extraneous items (<strong>{extraneous.length}</strong>)
            <br />
            <em className="explanation">
              Items present in your patch but missing from the database.
            </em>
            <hr />
            <ul className="overflow">
              {extraneous.map(item => <li key={`extraneous-${item}`} className="item">{item}</li>)}
            </ul>
          </Col>
          <Col md={6} className="missing full-height">
            <hr />
            Missing items (<strong>{missing.length}</strong>)
            <br />
            <em className="explanation">
              Items present in the database but missing from your patch.
            </em>
            <hr />
            <ul className="overflow">
              {missing.map(item => <li key={`missing-${item}`} className="item">{item}</li>)}
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Operations.
 */
class Operations extends Component {
  render() {
    const operations = this.props.data,
          groups = groupBy(operations, 'type');

    return (
      <div>
        <Row className="operations-report full-height">
          <hr />
          Operations to be applied
          <br />
          <em className="explanation">
            Exhaustive list of operations that will be applied to the database will
            you decide to submit your patch.
          </em>
          <hr />
          <strong>{operations.length}</strong> <str>total</str>
          <br />
          <strong>{(groups.addGroup || []).length}</strong> <em>new groups</em>
          <br />
          <strong>{(groups.renameGroup || []).length}</strong> <em>renamed groups</em>
          <br />
          <strong>{(groups.moveItem || []).length}</strong> <em>item moves</em>
          <hr />
          <ul className="overflow">
            {operations.map((o, i) => <Operation key={i} {...o} />)}
          </ul>
        </Row>
      </div>
    );
  }
}

/**
 * Operation.
 */
class Operation extends Component {
  render() {
    const data = this.props;

    let body = null;

    if (data.type === 'addGroup')
      body = <li className="item"><Glyph />&nbsp;<em>{data.name}</em></li>;

    return body;
  }
}

/**
 * Operation glyph.
 */
class Glyph extends Component {
  render() {
    return (<span className="green-glyph">+</span>);
  }
}
