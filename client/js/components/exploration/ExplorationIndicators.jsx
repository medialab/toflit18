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
import {ExportButton} from '../misc/Button.jsx';
import {Waiter} from '../misc/Loaders.jsx';
import {ClassificationSelector, ItemSelector} from '../misc/Selectors.jsx';
import LineChart from './viz/LineChart.jsx';
import DataQualityBarChart from './viz/DataQualityBarChart.jsx';
import {capitalize, isEqual, mapValues, values} from 'lodash';
import {
  updateSelector as update,
  addLine,
  dropLine
} from '../../actions/indicators';

// TODO: move branching to sub component for optimized rendering logic
// TODO: better use pure rendering logic

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
    sourceTypes: ['data', 'sourceTypes'],
    state: ['states', 'exploration', 'indicators']
  }
})
export default class ExplorationIndicators extends Component {
  render() {

    return (
      <div className="indicators-wrapper">
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
      sourceTypes,
      state: {
        creating,
        groups,
        lines,
        selectors
      }
    } = this.props;

    const lineAlreadyExisting = lines.some(line => isEqual(line.params, selectors));

    const sourceTypesOptions = (sourceTypes || []).map(type => {
      return {
        name: type,
        value: type
      };
    });

    /*
     * Display only product with data
     */


    return (
      <div className="panel">
        <h5>1. Creating a new line</h5>
        <em className="explanation">
          By selecting the following criteria, you'll be able to add the
          line you need on the graph that will be created for you below.
        </em>
        <hr />
        <Row>
          <SectionTitle title="Source Type"
                        addendum="From which sources does the flows come from?" />
          <Col md={4}>
            <ItemSelector type="sourceType"
                          data={sourceTypesOptions}
                          loading={!sourceTypesOptions.length}
                          onChange={actions.update.bind(null, 'sourceType')}
                          selected={selectors.sourceType} />
          </Col>
        </Row>
        <hr />
        <Row>
          <SectionTitle title="Product"
                        addendum="The type of product being shipped." />
          <Col md={4}>
            <ClassificationSelector type="product"
                                    loading={!classifications.product.length}
                                    data={classifications.product.filter(c => !c.source)}
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
                                    data={classifications.country.filter(c => !c.source)}
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
                    disabled={lineAlreadyExisting}
                    loading={creating}
                    onClick={actions.addLine}>
              {lineAlreadyExisting && !creating ? 'Already drawn' : 'Add the line'}
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
      .filter(line => !!line.data);

    return (
      <div className="panel">
        <h5>2. Exploring the results</h5>
        <em className="explanation">
          You can now see the created lines on the graph below.
        </em>
        <hr />
        <LinesSummary lines={lines}
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
function buildDescription(params) {
  const selectors = mapValues(params, 'name'),
        description = [];

  description.push(<span key="kind">{capitalize(selectors.kind || 'total') + ' flows'}</span>);

  if (selectors.product)
    description.push(<span key="product"> of <strong>{selectors.product}</strong> (<em>{selectors.productClassification}</em>)</span>);

  if (selectors.direction && selectors.direction !== '$all')
    description.push(<span key="direction"> from <strong>{selectors.direction}</strong></span>);

  if (selectors.country)
    description.push(<span key="country"> to <strong>{selectors.country}</strong> (<em>{selectors.countryClassification}</em>)</span>);

  if (selectors.sourceType)
    description.push(<span key="type"> - (source type: {selectors.sourceType})</span>);

  return description;
}

class LinesSummary extends Component {
  render() {
    const {drop, lines} = this.props;

    return (
      <ul className="summary">
        {lines.map(function(line, i) {
          const style = {
            color: 'white',
            backgroundColor: line.color
          };

          if (!line.data)
            return <li key={i}><Waiter align="left" /></li>;

          return (
            <li key={i}>
              <span className="insert" style={style}>
                {buildDescription(line.params)}
              </span>
              <span className="insert drop"
                    onClick={drop.bind(null, i)}
                    style={style}>
                ✕
              </span>
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
        // .filter((l) =>
        //   lines.data.length > 0);

    console.log("lines", lines);
    // create an array with all lines, add a column with name of country selected
    // create csv only with indicators selected
    const arrayDataLines = [];
    lines.forEach(function (l) {
      const dataLines = [];
        // add info about classification, product, country, direction, kind
        // add all column even if the info is not selected for the line
        // copy element to add info keys
      const elemCopy = {};
      l.data.forEach(function (e) {
        elemCopy.count = e.count;
        elemCopy.value = e.value;
        elemCopy.year = e.year;
        elemCopy.sourceType ? elemCopy.sourceType = l.params.sourceType.name : elemCopy.sourceType = null;
        l.params.productClassification ? elemCopy.productClassification = l.params.productClassification.name :
        elemCopy.productClassification = null;
        l.params.countryClassification ? elemCopy.countryClassification = l.params.countryClassification.name :
        elemCopy.countryClassification = null;
        l.params.country ? elemCopy.country = l.params.country.name : elemCopy.country = null;
        l.params.product ? elemCopy.product = l.params.product.name : elemCopy.product = null;
        l.params.kind ? elemCopy.kind = l.params.kind.name : elemCopy.kind = null;
        l.params.direction ? elemCopy.direction = l.params.direction.name : elemCopy.direction = null;
        dataLines.push(elemCopy);
      });

      // add all lines values in an array to export data in one csv
      const data = values(dataLines);

      data.forEach(function (d) {
        arrayDataLines.push(d);
      });
    });
    return (
      <div>
        <div>Number of flows per year</div>
        <hr />
        <LineChart valueKey="count" data={lines} />
        <hr />
        <ExportButton name= "Indicators_Number_of_flows_per_year"
                      data={arrayDataLines}>
          Export
        </ExportButton>
        <br />
        <div>Total value of flows per year</div>
        <hr />
        <LineChart data={lines} />
        <ExportButton name= "Indicators_Total_value_of_flows_per_year"
                      data={arrayDataLines}>
          Export
        </ExportButton>
        <br />
        <div>Total number of directions per year</div>
        <hr />
        <DataQualityBarChart valueKey="nb_direction" data={lines} />
        <ExportButton name= "Indicators_Number_of_directions_per_year"
                      data={arrayDataLines}>
          Export
        </ExportButton>
      </div>
    );
  }
}
