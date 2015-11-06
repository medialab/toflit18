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
                        commit={actions.commit.bind(null, target.id)}
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
    const {commit, loading, review} = this.props;

    const body = (loading || !review) ?
      <div className="panel"><Waiter align="center" /></div> :
      (
        <div>
          <Integrity data={review.integrity} />
          <Operations data={review.operations} commit={commit} />
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
const grouper = (data) => {
  return groupBy(data, row => {
    if (row.type === 'addGroup' || row.type === 'renameGroup')
      return row.type;

    if (row.from === null)
      return 'addItem';
    else if (row.to === null)
      return 'dropItem';
    else
      return 'moveItem';
  });
};

const OPERATION_TYPES = {
  renameGroup: {
    title: 'Renamed groups',
    description: 'Groups that your patch renamed.',
    color: 'warning',
    headers: ['From', 'To'],
    getter: row => [row.from, row.to]
  },
  addGroup: {
    title: 'Added groups',
    description: 'Groups added by your patch & that were not in the current state of the classification.',
    color: 'success',
    headers: ['Name'],
    getter: row => [row.name]
  },
  addItem: {
    title: 'Added items',
    description: 'Items precedently without a group but now attached to one.',
    color: 'info',
    headers: ['Item', 'Added to', 'New group?'],
    getter: row => [row.item, row.to, !row.toId ? '✓' : '']
  },
  dropItem: {
    title: 'Dropped items',
    description: 'Items precedently attached to a group but now without one.',
    color: 'danger',
    headers: ['Item', 'Dropped from'],
    getter: row => [row.item, row.from]
  },
  moveItem: {
    title: 'Moved items',
    descriptions: 'Items that were moved from one group to another one.',
    color: 'active',
    headers: ['Item', 'From', 'To', 'New group?'],
    getter: row => [row.item, row.from, row.to, !row.toId ? '✓' : '']
  }
};

class Operations extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {loading: false};
  }

  fire() {
    this.props.commit();
    this.setState({loading: true});
  }

  render() {
    const operations = this.props.data,
          groups = grouper(operations);

    return (
      <div>
        <div className="panel operations-report">
          Operations to be applied
          <br />
          <em className="explanation">
            Exhaustive list of operations that will be applied to the database will
            you decide to submit your patch.
          </em>
          {!!operations.length ?
            <OperationsStats groups={groups} total={operations.length} /> :
            <div className="red"><hr />I am awfully sorry but your patch doesn't seem to bring anything new to the table...</div>}
        </div>
        <div>
          {!!operations.length &&
            <div>
              {Object.keys(OPERATION_TYPES).map(type => <OperationsTable key={type} operations={groups[type]} type={type} />)}
              <div style={{textAlign: 'center', marginBottom: '100px'}}>
                <Button kind="primary"
                        onClick={() => this.fire()}
                        loading={this.state.loading}>
                  Commit
                </Button>
              </div>
            </div>}
        </div>
      </div>
    );
  }
}

/**
 * Operations stats.
 */
class OperationsStats extends Component {
  render() {
    const {groups, total} = this.props;

    const labels = {
      addGroup: 'new groups',
      renameGroup: 'renamed groups',
      addItem: 'items added to a group',
      dropItem: 'items dropped from a group',
      moveItem: 'items moved from a group to another'
    };

    const lines = Object.keys(groups)
      .filter(type => groups[type] && groups[type].length)
      .map(type => {
        const group = groups[type];

        return <li><strong>{group.length}</strong> <em>{labels[type]}</em></li>;
      });

    return (
      <ul>
        <li>
          <strong>{total}</strong> <em>total operations</em>
        </li>
        <hr />
        {lines}
      </ul>
    );
  }
}

/**
 * Operations table.
 */
class OperationsTable extends Component {
  render() {
    const {operations, type} = this.props;

    const {
      title,
      description,
      color,
      headers,
      getter
    } = OPERATION_TYPES[type];

    if (!operations || !operations.length)
      return null;

    const altStyle = {
      style: {
        textAlign: 'center',
        width: '140px'
      }
    };

    const rows = operations.map(o => {
      return (
        <tr>
          {getter(o).map((item, i) => <td {...(headers[i] === 'New group?' ? altStyle : {})}>{item}</td>)}
        </tr>
      );
    });

    return (
      <div className="panel">
        {title} (<strong>{operations.length}</strong>)
        <br />
        <em>{description}</em>
        <table className="table table-sm table-bordered" style={{marginTop: '20px'}}>
          <thead className="">
            <tr className={'table-' + color}>
              {headers.map(h => <th key={h} {...(h === 'New group?' ? altStyle : {})}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}
