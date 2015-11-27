/**
 * TOFLIT18 Client Indicators Display
 * ===================================
 *
 * Displaying a collection of indicators through picked visualizations.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../misc/Grid.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {updateSelector as update} from '../../actions/indicators';

@branch({
  actions: {
    update
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    state: ['states', 'exploration', 'indicators']
  }
})
export default class ExplorationIndicators extends Component {
  render() {
    const {actions, classifications, state: {groups, selectors}} = this.props;

    return (
      <div className="panel">
        <h3>Indicators</h3>
        <p>
          <em>Building several custom indicators to understand those times of old.</em>
        </p>
        <hr />
        <Row>
          <Col md={4}>
            <ClassificationSelector type="product"
                                    data={classifications.product}
                                    onChange={actions.update.bind(null, 'productClassification')}
                                    selected={selectors.productClassification} />
          </Col>
          <Col md={4}>
            <ClassificationSelector type="country"
                                    data={classifications.country}
                                    onChange={actions.update.bind(null, 'countryClassification')}
                                    selected={selectors.countryClassification} />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <ItemSelector type="product"
                          data={groups.product}
                          onChange={actions.update.bind(null, 'product')}
                          selected={selectors.product} />
          </Col>
          <Col md={4}>
            <ItemSelector type="country"
                          data={groups.country}
                          onChange={actions.update.bind(null, 'country')}
                          selected={selectors.country} />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={4}>
            <ItemSelector type="direction"
                          data={[]}
                          onChange={actions.update.bind(null, 'direction')}
                          selected={selectors.direction} />
          </Col>
          <Col md={4}>
            <ItemSelector type="kind"
                          data={[]}
                          onChange={actions.update.bind(null, 'kind')}
                          selected={selectors.kind} />
          </Col>
        </Row>
      </div>
    );
  }
}
