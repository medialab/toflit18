/**
 * TOFLIT18 Client Classification Modal
 * =====================================
 *
 * Displaying a modal enabling the user to patch/create/fork classifications.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';
import FileInput from '../misc/file.jsx';
import {Waiter} from '../bootstrap/loaders.jsx';
import {groupBy, map} from 'lodash';
import cls from 'classnames';

import * as patchActions from '../../actions/patch';

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
            <div className="full-height">
              <div className="panel">
                <ModalTitle name={target.name}
                            model={target.model}
                            action={modal.type} />
                <Upload parser={actions.parse} reset={actions.reset} />
              </div>
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
              Your CSV file should have at least the following columns (in this precise order):
              <ol>
                <li>The item</li>
                <li>The group aggregating the item</li>
                <li>An optional note about the aggregation</li>
              </ol>
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
      <div className="panel">
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

    const text = `Line n° ${error.index + 1} - the "${error.item}" item has been ` +
                 `linked to ${error.groups.length} groups (${map(error.groups, 'group').join(', ')}).`;

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
      <div className="panel"><Waiter align="center" /></div> :
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
      <div className="panel">
        <Row className="integrity-report full-height">
          <Col md={6} className="extraneous full-height">
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
      <div className="panel operations-report">
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
        <table className="table table-sm table-bordered overflow" style={{marginTop: '20px'}}>
          <thead className="">
            <tr>
              <th>Operation</th>
              <th>Target</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((o, i) => <Operation key={i} {...o} />)}
          </tbody>
        </table>
      </div>
    );
  }
}

/**
 * Operation line.
 */
class Operation extends Component {
  render() {
    const data = this.props;

    let body = null,
        info = null,
        status = '';

    if (data.type === 'addGroup') {
      info = <strong>add-group</strong>;
      status = 'success';
    }
    else if (data.type === 'renameGroup') {
      info = <strong>rename-group</strong>;
      status = 'warning';
    }
    else if (data.type === 'moveItem') {

      if (data.from === null) {
        info = <strong>add-item</strong>;
        status = 'info';
      }
      else if (data.to === null) {
        info = <strong>drop-item</strong>;
        status = 'danger';
      }
      else {
        info = <strong>move-item</strong>;
        status = 'active';
      }
    }

    return (
      <tr>
        <td className={'table-' + status} style={{width: '140px'}}>{info}</td>
        <td>{data.name || data.item || data.to}</td>
        <td className={cls({'table-active': !data.from})}>{data.from}</td>
        <td className={cls({'table-active': !data.to})}>{data.to}</td>
      </tr>
    );
  }
}
