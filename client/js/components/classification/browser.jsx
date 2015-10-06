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
import {fill} from 'lodash';

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
function Browser({classifications}) {
  const {product, country} = (classifications || {});

  return (
    <div className="browser-wrapper">
      <div className="full-height">
        <Row className="full-height">
          <Col md={5} className="full-height">
            <div className="panel full-height overflow">
              <h4>Products classifications</h4>
              <hr />
              {product && <ClassificationsList items={flattenTree(product)} />}
              <br />
              <h4>Countries classifications</h4>
              <hr />
              {country && <ClassificationsList items={flattenTree(country)} />}
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
function ClassificationsList({items}) {
  return (
    <ul className="classifications-list">
      {items.map(data => <Classification key={data.id} data={data} />)}
    </ul>
  );
}

/**
 * Classification.
 */
function Classification({data: {name, author, level}}) {
  const offset = (level * 25) + 'px';

  return (
    <li className="item" style={{marginLeft: offset}}>
      <span>{name}</span> (<em>{author}</em>)
    </li>
  );
}

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
    classifications: ['data', 'classifications']
  }
});
