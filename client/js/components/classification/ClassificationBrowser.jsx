/* eslint no-nested-ternary: 0 */
/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications in order to let the user
 * choose one and edit it, or even create a new one `in medias res`.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../misc/Grid.jsx';
import Button, {ButtonGroup} from '../misc/Button.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import Infinite from '../misc/Infinite.jsx';
import {prettyPrint} from '../../lib/helpers';
import cls from 'classnames';

// Actions
import {
  download,
  expand,
  modal,
  search,
  select,
  resetFilters
} from '../../actions/browser';
import {linker} from '../../actions/factory';

/**
 * Main component.
 */
@branch({
  actions: {
    expand,
    download,
    modal,
    resetFilters
  },
  cursors: {
    downloading: ['flags', 'downloading'],
    loading: ['states', 'classification', 'browser', 'loading'],
    current: ['states', 'classification', 'browser', 'current'],
    queryGroup: ['states', 'classification', 'browser', 'queryGroup'],
    queryItem: ['states', 'classification', 'browser', 'queryItem'],
    classifications: ['data', 'classifications', 'flat']
  }
})
export default class ClassificationBrowser extends Component {
  render() {
    return (
      <div className="browser-wrapper">
        <Row className="panel full-height">
          <LeftPanel {...this.props} />
          <RightPanel {...this.props} />
        </Row>
      </div>
    );
  }
}

/**
 * Left panel.
 */
class LeftPanel extends Component {
  render() {
    const {
      actions,
      classifications: {product, country},
      downloading
    } = this.props;

    const current = this.props.current || {};

    const list = (
      <div className="full-height">
        <h4 className="classifications-category">Products</h4>
        <ClassificationsList
          items={product}
          selected={current.id} />
        <h4 className="classifications-category">Countries</h4>
        <ClassificationsList
          items={country}
          selected={current.id} />
      </div>
    );

    return (
      <Col md={5} className="full-height">
        <div className="full-height">
          <h3>Classifications</h3>
          <hr />
          <div className="partial-height once overflow">
            {(!product || !product.length) ? <Waiter /> : list}
          </div>
          <hr />
          <div className="actions">
            <Col md={3}>
              <Button
                kind="primary"
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
    const {actions, loading} = this.props;

    const current = this.props.current || {};

    const queryGroup = this.props.queryGroup,
          queryItem = this.props.queryItem;

    const list = loading ?
      <Waiter /> :
      (
        <Infinite
          className="partial-height once overflow"
          action={() => actions.expand(current, queryGroup, queryItem)}
          tracker={current.id}
          data={current}>
          <GroupsList source={current.source} />
        </Infinite>
      );

    return (
      <Col md={7} className="full-height">
        <div className="full-height">
          <h3>{current.name || '...'}</h3>
          <hr />
          <GroupQuery
            current={current}
            loading={loading}
            reset={actions.resetFilters} />
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
      {items.map(data =>
        (<Classification
          key={data.id}
          data={data}
          active={selected === data.id} />))}
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
      data: {
        id,
        name,
        level,
        groupsCount,
        itemsCount,
        unclassifiedItemsCount,
        completion,
        source
      }
    } = this.props;

    const offset = (level * 25) + 'px';

    let infoLine;

    if (source)
      infoLine = (
        <span>
          <em key="groups">{prettyPrint(itemsCount)}</em> items.
        </span>
      );
    else
      infoLine = (
        <span>
          <em key="groups">{prettyPrint(groupsCount)}</em> groups for
          <em> {prettyPrint(itemsCount)}</em> items.
        </span>
      );

    const missingCount = (unclassifiedItemsCount || null) && (
      <span>
        &nbsp;(<em className="red">-{prettyPrint(unclassifiedItemsCount)}</em>)
      </span>
    );

    const completionNotice = !source && (
      <div className="addendum">
        <em>{prettyPrint(itemsCount - unclassifiedItemsCount)}</em> /
        &nbsp;<em className="green">{prettyPrint(itemsCount)}</em>
        {missingCount}
        &nbsp;classified items
        &nbsp;<em>({completion} %)</em>
      </div>
    );


    return (
      <li
        className={cls('item', {active})}
        style={{marginLeft: offset}}
        onClick={() => !active && actions.select(id)}>
        <div>
          <strong>{name}</strong>
        </div>
        <div className="addendum">
          {infoLine}
        </div>
        {completionNotice}
      </li>
    );
  }
}

/**
 * Group query.
 */
const QUERY_PATH_GROUP = ['states', 'classification', 'browser', 'queryGroup'];
const QUERY_PATH_ITEM = ['states', 'classification', 'browser', 'queryItem'];

@branch({
  cursors: {
    queryGroup: QUERY_PATH_GROUP,
    queryItem: QUERY_PATH_ITEM
  },
  actions: {
    updateGroup: linker(QUERY_PATH_GROUP),
    updateItem: linker(QUERY_PATH_ITEM),
    search
  }
})
class GroupQuery extends Component {

  submit() {
    const queryGroup = this.props.queryGroup;
    const queryItem = this.props.queryItem;

    if (queryGroup || queryItem)
      return this.props.actions.search(this.props.current.id, queryGroup, queryItem);
  }

  render() {
    const {
      actions,
      current,
      loading,
      queryGroup,
      queryItem,
      reset
    } = this.props;

    return (
      <div className="input-group">
        <input
          id="searchGroup"
          type="text"
          className="form-control"
          placeholder="Search group..."
          value={queryGroup}
          onKeyPress={e => e.which === 13 && this.submit()}
          onChange={e => actions.updateGroup(e.target.value)} />
          {!current.source && <input
            id="searchItem"
            type="text"
            className="form-control"
            placeholder="Search item..."
            value={queryItem}
            onKeyPress={e => e.which === 13 && this.submit()}
            onChange={e => actions.updateItem(e.target.value)} />
          }
        <span className="input-group-btn">
          <ButtonGroup>
            <Button
              kind="secondary"
              loading={loading}
              onClick={() => this.submit()}>
              Filter
            </Button>
            <Button
              kind="secondary"
              onClick={() => reset(current.id)}>
              Reset
            </Button>
          </ButtonGroup>
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
    const {groups, source} = this.props;

    function sortArray(arr, sortKey, reverse) {
      const order = (reverse && reverse < 0) ? -1 : 1;
      // sort on a copy to avoid mutating original array
      return arr.slice().sort(function (a, b) {
        a = a[sortKey].toLowerCase();
        b = b[sortKey].toLowerCase();
        return a === b ? 0 : a > b ? order : -order;
      });
    }

    const groupsSort = sortArray(groups, 'name', 'reverse');

    return (
      <ul className="entities-list">
        {groupsSort.length ?
          groupsSort.map(g => <Group source={source} key={g.id} {...g} />) :
          <span>No Results...</span>}
      </ul>
    );
  }
}

/**
 * Group.
 */
const MAX_NUMBER_OF_DISPLAYED_ITEMS = 5;

class Group extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {opened: false};
  }

  toggle() {
    this.setState({opened: !this.state.opened});
  }

  render() {
    const {name, items, source} = this.props,
          opened = this.state.opened;
    let count;
    if (items) {
      count = items.length;
    }

    let addendum;

    // Addendum if there are items in the group
    if (count) {

      // Potential ellipsis
      const ellipsis = (
        <span
          className="ellipsis"
          title="Click to expand"
          onClick={() => this.toggle()}>[...]</span>
      );

      const itemsToDisplay = !opened ?
        items.slice(0, MAX_NUMBER_OF_DISPLAYED_ITEMS) :
        items;

      addendum = (
        <ul className="addendum">
          {itemsToDisplay.map((item, i) => (<Item key={i} name={item} />))}
          {(!opened && items.length > MAX_NUMBER_OF_DISPLAYED_ITEMS) && ellipsis}
        </ul>
      );
    }

    return (
      <li className="item">
        <div>
          {name} {!source && <em>({count} items)</em>}
        </div>
        {addendum}
      </li>
    );
  }
}

/**
 * Item.
 */
function Item({name}) {
  return (
    <li>
      <em>{name}</em>
    </li>
  );
}
