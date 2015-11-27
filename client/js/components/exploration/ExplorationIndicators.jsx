/**
 * TOFLIT18 Client Indicators Display
 * ===================================
 *
 * Displaying a collection of indicators through picked visualizations.
 */
import React, {Component} from 'react';
import {branch} from 'baobab-react/decorators';
import {Row, Col} from '../misc/Grid.jsx';
import Button from '../misc/Button.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import {updateSelector as update} from '../../actions/indicators';

/**
 * Main component.
 */
@branch({
  actions: {
    update
  },
  cursors: {
    classifications: ['data', 'classifications', 'flat'],
    directions: ['data', 'directions'],
    state: ['states', 'exploration', 'indicators']
  }
})
export default class ExplorationIndicators extends Component {
  render() {

    return (
      <div>
        <LineForm {...this.props} />
      </div>
    );
  }
}

/**
 * Line form.
 */
class LineForm extends Component {
  render() {
    const {
      actions,
      classifications,
      directions,
      state: {
        groups,
        selectors
      }
    } = this.props;

    return (
      <div className="panel">
        <h5>1. Creating a new line</h5>
        <em className="explanation">
          By selecting the following criteria, you'll be able to create a
          new line on the graph.
        </em>
        <hr />
        <Row>
          <SectionTitle title="Product"
                        addendum="The type of product being shipped." />
          <Col md={4}>
            {classifications.product.length ?
              <ClassificationSelector type="product"
                                      data={classifications.product}
                                      onChange={actions.update.bind(null, 'productClassification')}
                                      selected={selectors.productClassification} /> :
              <Waiter />}
          </Col>
          <Col md={6}>
            <ItemSelector type="product"
                          disabled={!selectors.productClassification}
                          data={groups.product}
                          onChange={actions.update.bind(null, 'product')}
                          selected={selectors.product} />
          </Col>
        </Row>
        <hr />
        <Row>
          <SectionTitle title="Country"
                        addendum="The country whence we got the products or wither we are sending them." />
          <Col md={4}>
            {classifications.country.length ?
              <ClassificationSelector type="country"
                                      data={classifications.country}
                                      onChange={actions.update.bind(null, 'countryClassification')}
                                      selected={selectors.countryClassification} /> :
              <Waiter />}
          </Col>
          <Col md={6}>
            <ItemSelector type="country"
                          disabled={!selectors.countryClassification}
                          data={groups.country}
                          onChange={actions.update.bind(null, 'country')}
                          selected={selectors.country} />
          </Col>
        </Row>
        <hr />
        <Row>
          <SectionTitle title="Direction"
                        addendum="The French harbor where the transactions were recorded." />
          <Col md={4}>
            {directions ?
              <ItemSelector type="direction"
                            data={directions || []}
                            onChange={actions.update.bind(null, 'direction')}
                            selected={selectors.direction} /> :
              <Waiter />}
          </Col>
        </Row>
        <hr />
        <Row>
          <SectionTitle title="Kind"
                        addendum="Should we look at import, export, or total?" />
          <Col md={4}>
            <ItemSelector type="kind"
                          onChange={actions.update.bind(null, 'kind')}
                          selected={selectors.kind} />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={2}>
            <Button kind="primary">Add the line</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

/**
 * Section title.
 */
class SectionTitle extends Component {
  render() {
    const {title, addendum} = this.props;

    return (
      <Col md={2}>
        <div>{title}</div>
        <div className="section-explanation">
          <em>{addendum}</em>
        </div>
      </Col>
    );
  }
}
