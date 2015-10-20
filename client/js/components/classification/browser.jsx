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
import Loader from '../bootstrap/loader.jsx';
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

    const {product, country} = classifications;

    current = current || {};

    return (
      <div className="browser-wrapper">
        <div className="full-height">
          <Row className="full-height">
            <Col md={5} className="full-height">
              <div className="panel full-height">
                <div className="partial-height overflow">
                  <h4>Products classifications</h4>
                  <hr />
                  {product.length ?
                    <ClassificationsList items={product}
                                         selected={current.id} /> :
                    <Loader />}
                  <br />
                  <h4>Countries classifications</h4>
                  <hr />
                  {country.length ?
                    <ClassificationsList items={country}
                                         selected={current.id} /> :
                    <Loader />}
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
            <Col md={7} className="full-height">
              <div className="panel full-height">
                <h4>{current.name || '...'}</h4>
                <hr />
                <GroupQuery query="Hey joe" id={current.id} />
                <hr />
                <Infinite className="partial-height twice overflow"
                          action={() => actions.expand(current)}
                          tracker={current.id}>
                  <GroupsList />
                </Infinite>
              </div>
            </Col>
          </Row>
        </div>
      </div>
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

  render() {
    const search = this.props.actions.search,
          id = this.props.id;

    return (
      <div className="input-group">
        <input type="text"
               className="form-control"
               placeholder="Query..."
               value={this.state.query}
               onChange={e => this.setState({query: e.target.value})} />
        <span className="input-group-btn">
          <Button kind="secondary" onClick={(e) => search(id, this.state.query)}>Filter</Button>
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
