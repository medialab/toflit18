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
import LineChart from './viz/LineChart.jsx';
import {six as palette} from '../../lib/palettes';
import {
  updateSelector as update,
  addLine,
  dropLine
} from '../../actions/indicators';

// TODO: move branching to sub component for optimized rendering logic

/**
 * Main component.
 */
@branch({
  actions: {
    addLine,
    dropLine,
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
        {!!this.props.state.lines.length && <GraphPanel {...this.props} />}
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
      creating,
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
            <ClassificationSelector type="product"
                                    loading={!classifications.product.length}
                                    data={classifications.product}
                                    onChange={actions.update.bind(null, 'productClassification')}
                                    selected={selectors.productClassification} />
          </Col>
          <Col md={6}>
            <ItemSelector type="product"
                          disabled={!selectors.productClassification || !groups.product.length}
                          loading={selectors.productClassification && !groups.product.length}
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
            <ClassificationSelector type="country"
                                    loading={!classifications.country.length}
                                    data={classifications.country}
                                    onChange={actions.update.bind(null, 'countryClassification')}
                                    selected={selectors.countryClassification} />
          </Col>
          <Col md={6}>
            <ItemSelector type="country"
                          disabled={!selectors.countryClassification || !groups.country.length}
                          loading={selectors.countryClassification && !groups.country.length}
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
            <ItemSelector type="direction"
                          loading={!directions}
                          data={directions || []}
                          onChange={actions.update.bind(null, 'direction')}
                          selected={selectors.direction} />
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
            <Button kind="primary"
                    loading={creating}
                    onClick={actions.addLine}>
              Add the line
            </Button>
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

/**
 * Graph panel.
 */
class GraphPanel extends Component {
  render() {
    const {
      actions,
      state: {
        lines
      }
    } = this.props;

    const linesToRender = lines
      .filter(line => !!line.data)
      .map(line => line.data);

    return (
      <div className="panel">
        <h5>2. Exploring the results</h5>
        <em className="explanation">
          On the graph below, you can see up to six lines you created above. 1775
        </em>
        <hr />
        <LinesSummary lines={lines.map(line => line.params)}
                      drop={actions.dropLine} />
        <hr />
        <Charts lines={linesToRender} />
      </div>
    );
  }
}

/**
 * Lines summary.
 */
class LinesSummary extends Component {
  render() {
    const {drop, lines} = this.props;

    return (
      <ul>
        {lines.map(function(params, i) {
          return (
            <li key={i}>
              <span className="drop" onClick={drop.bind(null, i)}>x</span>
              &nbsp;
              <strong style={{color: palette[i]}}>{params.direction.name}</strong>
            </li>
          );
        })}
      </ul>
    );
  }
}

/**
 * Charts.
 */
class Charts extends Component {
  render() {
    const lines = this.props.lines;

    return (
      <div>
        <div>Number of flows per year</div>
        <hr />
        <LineChart data={lines.map(line => line.flows)} />
        <hr />
        <div>Total value of flows per year</div>
        <hr />
        <LineChart data={lines.map(line => line.value)} />
      </div>
    );
  }
}
