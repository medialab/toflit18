/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications in order to let the user
 * choose one and edit it, or even create a new one `in medias res`.
 */
import React from 'react';
import {branch} from 'baobab-react/higher-order';
import {Row, Col} from '../bootstrap/grid.jsx';
import {selectBrowserClassification} from '../../actions/selection';
import {fill} from 'lodash';
import cls from 'classnames';

/**
 * Helpers.
 */
function flattenTree(branch, list=[], level=0) {
  list.push({...branch, level});

  (branch.children || []).forEach(c => flattenTree(c, list, level + 1));

  return list;
}

/**
 * Main component.
 */
function Browser({classifications, selected}) {
  const {product, country} = (classifications || {});

  return (
    <div className="browser-wrapper">
      <div className="full-height">
        <Row className="full-height">
          <Col md={5} className="full-height">
            <div className="panel full-height overflow">
              <h4>Products classifications</h4>
              <hr />
              {product && <ClassificationsList items={flattenTree(product)}
                                               selected={selected} />}
              <br />
              <h4>Countries classifications</h4>
              <hr />
              {country && <ClassificationsList items={flattenTree(country)}
                                               selected={selected} />}
            </div>
          </Col>
          <Col md={7} className="full-height">
            <div className="panel full-height">
              <h4>Entities</h4>
              <hr />
              <div className="partial-height overflow">
                <EntitiesList />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
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
 * Entities list.
 */
function EntitiesList({items}) {
  return (
    <ul className="entities-list">
      {(fill(new Array(60), '')).map((_, i) => <Entity key={i} />)}
    </ul>
  );
}

/**
 * Entity.
 */
function Entity() {
  return (
    <li className="item">
      Hello coucou!
    </li>
  );
}

export default branch(Browser, {
  cursors: {
    selected: ['states', 'classification', 'browser', 'selected'],
    classifications: ['data', 'classifications']
  }
});
