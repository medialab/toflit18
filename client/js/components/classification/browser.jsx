/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications in order to let the user
 * choose one and edit it, or even create a new one `in medias res`.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';
import {Spinner, Waiter} from '../bootstrap/loaders.jsx';
import Infinite from '../misc/infinite.jsx';
import cls from 'classnames';

// Actions
import {
  download,
  expand,
  search,
  select
} from '../../actions/browser';

/**
 * Main component.
 */
@branch({
  actions: {
    expand,
    download
  },
  cursors: {
    downloading: ['flags', 'downloading'],
    loading: ['states', 'classification', 'browser', 'loading'],
    current: ['states', 'classification', 'browser', 'current'],
    classifications: ['data', 'classifications', 'flat']
  }
})
export default class ClassificationBrowser extends Component {
  render() {
    let {
      actions,
      classifications,
      current,
      downloading
    } = this.props;

    current = current || {};

    return (
      <div className="browser-wrapper">
        <div className="full-height">
          <Row className="full-height">
            <LeftPanel {...this.props} />
            <RightPanel {...this.props} />
          </Row>
        </div>
      </div>
    );
  }
}

/**
 * Left panel.
 */
class LeftPanel extends Component {
  render() {
    let {
      actions,
      current,
      classifications: {product, country},
      downloading
    } = this.props;

    current = current || {};

    return (
      <Col md={5} className="full-height">
        <div className="panel full-height">
          <h3>Classifications</h3>
          <hr />
          <div className="partial-height twice overflow">
            <h4 className="classifications-category">Products</h4>
            {product.length ?
              <ClassificationsList items={product}
                                   selected={current.id} /> :
              <Waiter />}
            <h4 className="classifications-category">Countries</h4>
            {country.length ?
              <ClassificationsList items={country}
                                   selected={current.id} /> :
              <Waiter />}
          </div>
          <hr />
          <div className="actions">
            <Col md={6}>
              <Button kind="primary"
                      onClick={() => actions.download(current.id)}
                      disabled={current.source || false}
                      loading={downloading}>
                Export
              </Button>
            </Col>
          </div>
        </div>
      </Col>
    );
  }
}

/**
 * Right panel
 */
class RightPanel extends Component {
  render() {
    let {actions, current, loading} = this.props;

    current = current || {};

    let list = loading ?
      <Waiter /> :
      (
        <Infinite className="partial-height twice overflow"
                  action={() => actions.expand(current)}
                  tracker={current.id}>
          <GroupsList />
        </Infinite>
      );

    return (
      <Col md={7} className="full-height">
        <div className="panel full-height">
          <h4>{current.name || '...'}</h4>
          <hr />
          <GroupQuery query="Hey joe" id={current.id} loading={loading} />
          <hr />
          {list}
        </div>
      </Col>
    );
  }
}

/**
 * Classification list.
 */
function ClassificationsList({items, selected}) {
  return (
    <ul className="classifications-list">
      {items.map(data => <Classification key={data.id}
                                         data={data}
                                         active={selected === data.id} />)}
    </ul>
  );
}

/**
 * Classification.
 */
@branch({
  actions: {
    select
  }
})
class Classification extends Component {
  render() {
    const {
      actions,
      active,
      data: {id, name, author, level}
    } = this.props;

    const offset = (level * 25) + 'px';

    return (
      <li className={cls('item', {active})}
          style={{marginLeft: offset}}
          onClick={e => !active && actions.select(id)}>
        <span>{name}</span> (<em>{author}</em>)
      </li>
    );
  }
}

/**
 * Group query.
 */
@branch({
  actions: {
    search
  }
})
class GroupQuery extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {query: null};
  }

  submit() {
    const query = this.state.query;

    if (query)
      return this.props.actions.search(this.props.id, query);
  }

  render() {
    const {id, loading} = this.props;

    return (
      <div className="input-group">
        <input type="text"
               className="form-control"
               placeholder="Query..."
               value={this.state.query}
               onKeyPress={(e) => e.which === 13 && this.submit()}
               onChange={e => this.setState({query: e.target.value})} />
        <span className="input-group-btn">
          <Button kind="secondary"
                  loading={loading}
                  onClick={() => this.submit()}>
            Filter
          </Button>
        </span>
      </div>
    );
  }
}

/**
 * Groups list.
 */
@branch({
  cursors: {
    groups: ['states', 'classification', 'browser', 'rows']
  }
})
class GroupsList extends Component {
  render() {
    const groups = this.props.groups;

    return (
      <ul className="entities-list">
        {groups.length ?
          groups.map(g => <Group key={g.id} {...g} />) :
          <span>No Results...</span>}
      </ul>
    );
  }
}

/**
 * Group.
 */
function Group({name}) {
  return (
    <li className="item">
      {name}
    </li>
  );
}

export default ClassificationBrowser;
