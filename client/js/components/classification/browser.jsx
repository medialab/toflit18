/**
 * TOFLIT18 Client Classification Browser
 * =======================================
 *
 * Displaying the existing classifications in order to let the user
 * choose one and edit it, or even create a new one `in medias res`.
 */
import React from 'react';
import {Row, Col} from '../bootstrap/grid.jsx';
import {fill} from 'lodash';

/**
 * !!!TEMP!!! : Sample data.
 */
const PRODUCTS_CLASSIFICATIONS = [
  {name: 'Source', author: 'toflit18'},
  {name: 'Orthographic Normalization', author: 'toflit18'},
  {name: 'Harmonization', author: 'toflit18'},
  {name: 'Categorization', author: 'toflit18'},
  {name: 'Produits médicinaux', author: 'Pierre Hollegien'},
  {name: 'Drogues dures', author: 'Pierre Hollegien'},
  {name: 'Shawarma', author: 'Guillaume Plique'}
];

const COUNTRIES_CLASSIFICATIONS = [
  {name: 'Source', author: 'toflit18'},
  {name: 'Classification Filstradt', author: 'Guillaume Daudin'},
  {name: 'ONU', author: 'Guillaume Plique'},
  {name: 'Vatican', author: 'Donato Ricci'}
];

/**
 * Main component.
 */
function Browser() {
  return (
    <div className="browser-wrapper">
      <div className="full-height">
        <Row className="full-height">
          <Col md={5} className="full-height">
            <div className="panel full-height overflow">
              <h4>Products classifications</h4>
              <hr />
              <ClassificationsList items={PRODUCTS_CLASSIFICATIONS} />
              <br />
              <h4>Countries classifications</h4>
              <hr />
              <ClassificationsList items={COUNTRIES_CLASSIFICATIONS} />
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
      {items.map(data => <Classification key={data.name} data={data} />)}
    </ul>
  );
}

/**
 * Classification.
 */
function Classification({data: {name, author}}) {
  return (
    <li className="item">
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

export default Browser;
