/**
 * TOFLIT18 Client Classification Modal
 * =====================================
 *
 * Displaying a modal enabling the user to patch/create/fork classifications.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../misc/Grid.jsx';
import Button from '../misc/Button.jsx';
import FileInput from '../misc/File.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import {groupBy} from 'lodash';
import {prettyPrint} from '../../lib/helpers';
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

    const hasInconsistencies = !!(modal.inconsistencies || []).length;

    return (
      <div className="modal-wrapper">
        <Row className="full-height">
          <Col md={12} className="full-height">
            <div className="full-height">
              <div className="panel">
                <ModalTitle
                  name={target.name}
                  model={target.model}
                  action={modal.type} />
                <Upload parser={actions.parse} reset={actions.reset} />
              </div>
              {hasInconsistencies && <ConsistencyReport report={modal.inconsistencies} />}
              {modal.step === 'review' &&
                <Review
                  get={actions.review.bind(null, target.id)}
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
            <input
              type="text"
              className="form-control"
              placeholder="delimiter [ , ]" />
          </Col>
          <Col md={3}>
            <input
              type="text"
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
        <h5 className="red">There seems to be some consistency issues ({report.length}) with your file!</h5>
        <table className="table table-sm consistency-report">
          <tbody>
            {report.map(error => <InconsistentItem key={error.item} error={error} />)}
          </tbody>
        </table>
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

    return (
      <tr>
        <td>
          <em className="red">{error.item}</em> has been linked to <strong>{error.groups.length}</strong> groups:
          <ul>
            {error.groups.map(row => {
              return <li key={row.line}>Line n° <strong>{row.line}</strong> - <em>{row.group}</em></li>;
            })}
          </ul>
        </td>
      </tr>
    );
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

    if (!extraneous.length && !missing.length)
      return null;

    const extraneousGroup = (
      <Col md={6} className="extraneous full-height">
        Extraneous items (<strong>{prettyPrint(extraneous.length)}</strong>)
        <br />
        <em className="explanation">
          Items present in your patch but missing from the database.
        </em>
        <hr />
        <ul className="overflow">
          {extraneous.map(item => <li key={`extraneous-${item}`} className="item">{item}</li>)}
        </ul>
      </Col>
    );

    const missingGroup = (
      <Col md={6} className="missing full-height">
        Missing items (<strong>{prettyPrint(missing.length)}</strong>)
        <br />
        <em className="explanation">
          Items present in the database but missing from your patch.
        </em>
        <hr />
        <ul className="overflow">
          {missing.map(item => <li key={`missing-${item}`} className="item">{item}</li>)}
        </ul>
      </Col>
    );

    return (
      <div className="panel">
        <Row className="integrity-report full-height">
          {!!extraneous.length && extraneousGroup}
          {!!missing.length && missingGroup}
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

const TICKED = <div style={{textAlign: 'center'}}>✓</div>;

const OPERATION_TYPES = {
  renameGroup: {
    title: 'Renamed groups',
    description: 'Groups that your patch renamed.',
    color: 'warning',
    headers: ['From', 'To'],
    sizes: [50, 50],
    getter: row => [row.from, row.to]
  },
  addGroup: {
    title: 'Added groups',
    description: 'Groups added by your patch & that were not in the current state of the classification.',
    color: 'success',
    headers: ['Name'],
    sizes: [100],
    getter: row => [row.name]
  },
  addItem: {
    title: 'Added items',
    description: 'Items precedently without a group but now attached to one.',
    color: 'info',
    headers: ['Item', 'Added to', 'New group?'],
    sizes: [45, 45, 10],
    getter: row => [row.item, row.to, !row.toId ? TICKED : '']
  },
  dropItem: {
    title: 'Dropped items',
    description: 'Items precedently attached to a group but now without one.',
    color: 'danger',
    headers: ['Item', 'Dropped from'],
    sizes: [50, 50],
    getter: row => [row.item, row.from]
  },
  moveItem: {
    title: 'Moved items',
    description: 'Items that were moved from one group to another.',
    color: 'active',
    headers: ['Item', 'From', 'To', 'New group?'],
    sizes: [30, 30, 30, 10],
    getter: row => [row.item, row.from, row.to, !row.toId ? TICKED : '']
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
        <div className="panel">
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
                <Button
                  kind="primary"
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

        return <li key={type}><strong>{prettyPrint(group.length)}</strong> <em>{labels[type]}</em></li>;
      });

    return (
      <ul style={{marginTop: '20px', listStyleType: 'none', paddingLeft: '0px'}}>
        <li>
          <strong>{prettyPrint(total)}</strong> <em>total operations</em>
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
  constructor(props, context) {
    super(props, context);

    this.state = {
      opened: props.operations && props.operations.length <= 200
    };
  }

  render() {
    const {operations, type} = this.props;

    const {
      title,
      description,
      color,
      headers,
      sizes,
      getter
    } = OPERATION_TYPES[type];

    if (!operations || !operations.length)
      return null;

    const rows = operations.map((o, i) => {
      return (
        <tr key={i}>
          {getter(o).map((item, j) => {
            const style = {
              width: `${sizes[j]}%`,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            };

            return <td key={j} style={style}>{item}</td>;
          })}
        </tr>
      );
    });

    return (
      <div className="panel">
        {title} (<strong>{prettyPrint(operations.length)}</strong>)
        <br />
        <em className={`text-${color}`}>{description}</em>
        {this.state.opened ?
          <div>
            <table className="operations-table table table-sm">
              <thead>
                <tr className="table-active">
                  {headers.map((h, i) => <th key={h} style={{width: `${sizes[i]}%`}}>{h}</th>)}
                </tr>
              </thead>
            </table>
            <div className="overflow" style={{maxHeight: '300px'}}>
              <table className="table table-sm table" style={{tableLayout: 'fixed'}}>
                <tbody>
                  {rows}
                </tbody>
              </table>
            </div>
          </div> :
          <div style={{textAlign: 'center'}}>
            <hr />
            <Button
              kind="secondary"
              onClick={() => this.setState({opened: true})}>
              Show
            </Button>
          </div>
        }
      </div>
    );
  }
}
