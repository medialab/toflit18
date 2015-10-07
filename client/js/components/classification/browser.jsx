/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications in order to let the user
 * choose one and edit it, or even create a new one `in medias res`.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/higher-order';
import {Row, Col} from '../bootstrap/grid.jsx';
import Button from '../bootstrap/button.jsx';
import Loader from '../bootstrap/loader.jsx';
import Infinite from '../misc/infinite.jsx';
import cls from 'classnames';

// Actions
import {selectBrowserClassification} from '../../actions/selection';
import {expandBrowserGroups} from '../../actions/data';
import {downloadClassification} from '../../actions/download';

/**
 * Main component.
 */
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
                <Infinite className="partial-height overflow"
                          action={() => actions.expand(current)}>
                  <BranchedGroupsList />
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
      {items.map(data => <ActionClassification key={data.id}
                                               data={data}
                                               active={selected === data.id} />)}
    </ul>
  );
}

/**
 * Classification.
 */
function Classification({actions, active, data: {id, name, author, level}}) {
  const offset = (level * 25) + 'px';

  return (
    <li className={cls('item', {active})}
        style={{marginLeft: offset}}
        onClick={e => actions.select(id)}>
      <span>{name}</span> (<em>{author}</em>)
    </li>
  );
}

const ActionClassification = branch(Classification, {
  actions: {
    select: selectBrowserClassification
  }
});

/**
 * Groups list.
 */
function GroupsList({groups}) {
  return (
    <ul className="entities-list">
      {groups.length ? groups.map(g => <Group key={g.id} {...g} />) : <Loader />}
    </ul>
  );
}

const BranchedGroupsList = branch(GroupsList, {
  cursors: {
    groups: ['states', 'classification', 'browser', 'rows']
  }
});

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

export default branch(ClassificationBrowser, {
  actions: {
    expand: expandBrowserGroups,
    download: downloadClassification
  },
  cursors: {
    downloading: ['flags', 'downloading'],
    current: ['states', 'classification', 'browser', 'current'],
    classifications: ['data', 'classifications', 'flat']
  }
});
